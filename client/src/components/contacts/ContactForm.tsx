import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Save, User, MapPin, Phone, Tag, Plus, X, AlertCircle, Shield, Heart } from 'lucide-react';
import { useContacts } from '../../contexts/ContactContext';
import { Contact } from '../../types';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import Loading from '../shared/Loading';
import { InputSanitizer } from '../../utils/inputSanitizer';
import { ErrorSanitizer } from '../../utils/errorSanitizer';
import { rateLimiter, RATE_LIMITS } from '../../utils/rateLimiter';

interface ContactFormProps {
  isEdit?: boolean;
}

const ContactForm: React.FC<ContactFormProps> = ({ isEdit = false }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    contacts,
    loading,
    error,
    createContact,
    updateContact,
    clearError,
  } = useContacts();

  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    tags: [] as string[],
    sharedToPrayerList: false,
    prayerRequest: '',
  });

  const [tagInput, setTagInput] = useState('');
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (isEdit && id) {
      const contact = contacts.find(c => c._id === id);
      if (contact) {
        setFormData({
          name: contact.name,
          address: contact.address || '',
          phone: contact.phone || '',
          tags: contact.tags,
          sharedToPrayerList: contact.sharedToPrayerList || false,
          prayerRequest: contact.prayerRequest || '',
        });
      }
    }
  }, [isEdit, id, contacts]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    // For address field, skip sanitization during typing - only sanitize on form submission
    let sanitizedValue = value;
    if (name !== 'address') {
      switch (name) {
        case 'name':
          sanitizedValue = InputSanitizer.sanitizeByFieldType(value, 'name');
          break;
        case 'phone':
          sanitizedValue = InputSanitizer.sanitizeByFieldType(value, 'phone');
          break;
        default:
          sanitizedValue = InputSanitizer.sanitizeText(value);
      }
    }

    setFormData(prev => ({
      ...prev,
      [name]: sanitizedValue,
    }));

    if (formError || error) {
      setFormError('');
      clearError();
    }
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: checked,
    }));

    if (formError || error) {
      setFormError('');
      clearError();
    }
  };

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const sanitizedTag = InputSanitizer.sanitizeByFieldType(tagInput, 'tag');
      if (sanitizedTag && !formData.tags.includes(sanitizedTag)) {
        setFormData(prev => ({
          ...prev,
          tags: [...prev.tags, sanitizedTag],
        }));
        setTagInput('');
      }
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove),
    }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setFormError('Contact name is required');
      return false;
    }

    // Check for malicious content
    if (InputSanitizer.containsMaliciousContent(formData.name) ||
        InputSanitizer.containsMaliciousContent(formData.address) ||
        InputSanitizer.containsMaliciousContent(formData.phone) ||
        InputSanitizer.containsMaliciousContent(formData.prayerRequest) ||
        formData.tags.some(tag => InputSanitizer.containsMaliciousContent(tag))) {
      setFormError('Invalid input detected. Please check your information.');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    // Check rate limiting for contact operations
    if (!rateLimiter.canMakeRequest('contact-form', RATE_LIMITS.FORM_SUBMISSION.maxRequests, RATE_LIMITS.FORM_SUBMISSION.windowMs)) {
      const remainingTime = rateLimiter.getRemainingTime('contact-form', RATE_LIMITS.FORM_SUBMISSION.maxRequests, RATE_LIMITS.FORM_SUBMISSION.windowMs);
      setFormError(`Too many requests. Please wait ${Math.ceil(remainingTime / 60000)} minutes before submitting again.`);
      return;
    }

    try {
      // Sanitize address field before submission
      const sanitizedFormData = {
        ...formData,
        address: InputSanitizer.sanitizeByFieldType(formData.address, 'address')
      };

      if (isEdit && id) {
        await updateContact(id, sanitizedFormData);
      } else {
        await createContact(sanitizedFormData);
      }
      navigate('/');
    } catch (err: any) {
      // Use sanitized error messages
      const sanitizedError = ErrorSanitizer.sanitizeAndLog(err, 'contact-form');
      setFormError(sanitizedError);
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading message={isEdit ? 'Loading contact...' : 'Creating contact...'} />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-4"
      >
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCancel}
          className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {isEdit ? 'Edit Contact' : 'Add New Contact'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {isEdit ? 'Update contact information' : 'Add a new soul winning contact'}
          </p>
        </div>
      </motion.div>

      {/* Error Message */}
      <AnimatePresence>
        {(error || formError) && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl"
          >
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
            <p className="text-red-700 dark:text-red-300 text-sm font-medium">{error || formError}</p>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setFormError('');
                clearError();
              }}
              className="ml-auto text-red-600 hover:text-red-700 dark:text-red-400"
            >
              ×
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm shadow-xl border-0">
          <CardHeader>
            <CardTitle className="text-xl text-gray-900 dark:text-white flex items-center gap-2">
              <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name Field */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="space-y-2"
              >
                <label htmlFor="name" className="text-sm font-medium text-gray-700 dark:text-gray-200 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Full Name <span className="text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="h-12 text-base"
                  placeholder="Enter contact's full name"
                  autoComplete="name"
                  required
                  aria-describedby="name-help"
                  aria-invalid={formError && formError.includes('name') ? 'true' : 'false'}
                  maxLength={100}
                  spellCheck={true}
                />
                <div id="name-help" className="sr-only">
                  Enter the full name of the contact person. Required field.
                </div>
              </motion.div>

              {/* Phone Field */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="space-y-2"
              >
                <label htmlFor="phone" className="text-sm font-medium text-gray-700 dark:text-gray-200 flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Phone Number
                </label>
                <Input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="h-12 text-base"
                  placeholder="Enter phone number"
                  autoComplete="tel"
                  aria-describedby="phone-help"
                  aria-invalid={formError && formError.includes('phone') ? 'true' : 'false'}
                  maxLength={20}
                  spellCheck={false}
                />
                <div id="phone-help" className="sr-only">
                  Enter the contact's phone number. Include country code if applicable.
                </div>
              </motion.div>

              {/* Address Field */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="space-y-2"
              >
                <label htmlFor="address" className="text-sm font-medium text-gray-700 dark:text-gray-200 flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Address
                </label>
                <textarea
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="flex w-full rounded-xl border border-input bg-background px-4 py-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 min-h-[120px] resize-none"
                  placeholder="Enter contact's address"
                  rows={4}
                  aria-describedby="address-help"
                  aria-invalid={formError && formError.includes('address') ? 'true' : 'false'}
                  maxLength={500}
                  spellCheck={true}
                />
                <div id="address-help" className="sr-only">
                  Enter the contact's physical address. Include street, city, state/province, and postal code.
                </div>
              </motion.div>

              {/* Tags Field */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
                className="space-y-3"
              >
                <label htmlFor="tags" className="text-sm font-medium text-gray-700 dark:text-gray-200 flex items-center gap-2">
                  <Tag className="w-4 h-4" />
                  Tags
                </label>
                <div className="relative">
                  <Input
                    type="text"
                    id="tags"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleAddTag}
                    className="h-12 text-base pr-10"
                    placeholder="Add tags (press Enter or comma to add)"
                    aria-describedby="tags-help"
                    maxLength={50}
                    spellCheck={false}
                  />
                  <Plus className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                </div>
                <div id="tags-help" className="text-xs text-gray-500 dark:text-gray-400">
                  Use tags like: "Interested", "Follow-up needed", "Prayed together". Press Enter or comma to add.
                </div>

                {/* Tags Display */}
                <AnimatePresence>
                  {formData.tags.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="flex flex-wrap gap-2 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl"
                    >
                      {formData.tags.map((tag, index) => (
                        <motion.div
                          key={tag}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          <Badge
                            variant="secondary"
                            className="text-sm py-1 px-3 bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900/30 transition-colors group"
                          >
                            {tag}
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="ml-2 h-4 w-4 p-0 text-blue-600 hover:text-red-600 dark:text-blue-400 dark:hover:text-red-400"
                              onClick={() => handleRemoveTag(tag)}
                              aria-label={`Remove ${tag} tag`}
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </Badge>
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Prayer List Section */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 }}
                className="space-y-4 p-4 bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl border border-primary/20"
              >
                <div className="flex items-center gap-3 mb-3">
                  <Heart className="w-5 h-5 text-primary" />
                  <h3 className="text-lg font-semibold text-foreground">Team Prayer List</h3>
                </div>

                <div className="space-y-3">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      name="sharedToPrayerList"
                      checked={formData.sharedToPrayerList}
                      onChange={handleCheckboxChange}
                      className="w-4 h-4 text-primary bg-background border-border rounded focus:ring-primary focus:ring-2"
                    />
                    <span className="text-sm font-medium text-foreground">
                      Share this contact with the prayer team
                    </span>
                  </label>

                  <p className="text-xs text-muted-foreground ml-7">
                    When enabled, this contact will be visible to all team members on the Prayer Wall for prayer support.
                  </p>

                  {formData.sharedToPrayerList && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-2"
                    >
                      <label htmlFor="prayerRequest" className="text-sm font-medium text-foreground block">
                        Prayer Request (Optional)
                      </label>
                      <textarea
                        id="prayerRequest"
                        name="prayerRequest"
                        value={formData.prayerRequest}
                        onChange={handleInputChange}
                        className="flex w-full rounded-xl border border-input bg-background px-4 py-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 min-h-[100px] resize-none"
                        placeholder="Share specific prayer needs or conversation details with the team..."
                        rows={3}
                        maxLength={500}
                        spellCheck={true}
                      />
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-muted-foreground">
                          {formData.prayerRequest.length}/500
                        </span>
                        <span className="text-xs text-muted-foreground">
                          This will be visible to all team members
                        </span>
                      </div>
                    </motion.div>
                  )}
                </div>
              </motion.div>

              {/* Action Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="flex gap-4 pt-6 border-t border-gray-200 dark:border-gray-700"
              >
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  className="flex-1 h-12 text-base"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 h-12 text-base font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl"
                  disabled={loading}
                  aria-describedby="submit-button-help"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      {isEdit ? 'Updating...' : 'Adding...'}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Save className="w-4 h-4" />
                      {isEdit ? 'Update Contact' : 'Add Contact'}
                    </div>
                  )}
                </Button>
                <div id="submit-button-help" className="sr-only">
                  {isEdit ? 'Save changes to the contact information' : 'Create a new contact with the provided information'}
                </div>
              </motion.div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default ContactForm;