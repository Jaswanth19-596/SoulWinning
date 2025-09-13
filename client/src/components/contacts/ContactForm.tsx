import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useContacts } from '../../contexts/ContactContext';
import { Contact } from '../../types';
import ErrorMessage from '../shared/ErrorMessage';
import Loading from '../shared/Loading';

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
        });
      }
    }
  }, [isEdit, id, contacts]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));

    if (formError || error) {
      setFormError('');
      clearError();
    }
  };

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const tag = tagInput.trim();
      if (tag && !formData.tags.includes(tag)) {
        setFormData(prev => ({
          ...prev,
          tags: [...prev.tags, tag],
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
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      if (isEdit && id) {
        await updateContact(id, formData);
      } else {
        await createContact(formData);
      }
      navigate('/');
    } catch (err) {
      // Error is handled by context
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  if (loading) {
    return <Loading message={isEdit ? 'Loading contact...' : 'Creating contact...'} />;
  }

  return (
    <div className="contact-form-container">
      <div className="contact-form-header">
        <button
          className="back-btn"
          onClick={handleCancel}
          type="button"
        >
          ← Back
        </button>
        <h2 className="page-title">
          {isEdit ? 'Edit Contact' : 'Add New Contact'}
        </h2>
      </div>

      {(error || formError) && (
        <ErrorMessage
          message={error || formError}
          onDismiss={() => {
            setFormError('');
            clearError();
          }}
        />
      )}

      <form onSubmit={handleSubmit} className="contact-form">
        <div className="form-group">
          <label htmlFor="name" className="form-label required">
            Full Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            className="form-input"
            placeholder="Enter contact's full name"
            autoComplete="name"
          />
        </div>

        <div className="form-group">
          <label htmlFor="phone" className="form-label">
            Phone Number
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            className="form-input"
            placeholder="Enter phone number"
            autoComplete="tel"
          />
        </div>

        <div className="form-group">
          <label htmlFor="address" className="form-label">
            Address
          </label>
          <textarea
            id="address"
            name="address"
            value={formData.address}
            onChange={handleInputChange}
            className="form-textarea"
            placeholder="Enter contact's address"
            rows={3}
          />
        </div>

        <div className="form-group">
          <label htmlFor="tags" className="form-label">
            Tags
          </label>
          <div className="tags-input-container">
            <input
              type="text"
              id="tags"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleAddTag}
              className="form-input"
              placeholder="Add tags (press Enter or comma to add)"
            />
            <div className="help-text">
              Use tags like: "Interested", "Follow-up needed", "Prayed together"
            </div>
          </div>

          {formData.tags.length > 0 && (
            <div className="tags-display">
              {formData.tags.map(tag => (
                <span key={tag} className="tag">
                  {tag}
                  <button
                    type="button"
                    className="tag-remove"
                    onClick={() => handleRemoveTag(tag)}
                    aria-label={`Remove ${tag} tag`}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="cancel-btn"
            onClick={handleCancel}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="submit-btn"
            disabled={loading}
          >
            {isEdit ? 'Update Contact' : 'Add Contact'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ContactForm;