import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Edit, Trash2, Phone, MapPin, Calendar, Tag, User, AlertTriangle } from 'lucide-react';
import { useContacts } from '../../contexts/ContactContext';
import { Contact } from '../../types';
import NoteList from '../notes/NoteList';
import NoteForm from '../notes/NoteForm';
import Loading from '../shared/Loading';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { getInitials, formatDate } from '../../lib/utils';

const ContactDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    contacts,
    loading,
    error,
    contactNotes,
    fetchContactNotes,
    deleteContact,
    clearError,
  } = useContacts();

  const [contact, setContact] = useState<Contact | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (id) {
      const foundContact = contacts.find(c => c._id === id);
      if (foundContact) {
        setContact(foundContact);
      }
    }
  }, [id, contacts]);

  useEffect(() => {
    if (id) {
      console.log('Fetching notes for contact ID:', id);
      fetchContactNotes(id);
    }
  }, [id, fetchContactNotes]);


  const handleEdit = () => {
    navigate(`/contacts/${id}/edit`);
  };

  const handleDelete = async () => {
    if (id) {
      try {
        await deleteContact(id);
        navigate('/');
      } catch (err) {
        // Error handled by context
      }
    }
    setShowDeleteConfirm(false);
  };

  const handleBack = () => {
    navigate('/');
  };

  const handleCall = () => {
    if (contact?.phone) {
      window.location.href = `tel:${contact.phone}`;
    }
  };

  if (!contact && !loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md mx-auto p-8 text-center">
          <CardContent className="space-y-6">
            <div className="w-20 h-20 mx-auto bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
              <User className="w-10 h-10 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Contact Not Found
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                The contact you're looking for doesn't exist or has been deleted.
              </p>
            </div>
            <Button onClick={handleBack} variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Contacts
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading || !contact) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading message="Loading contact details..." />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <Button
          variant="ghost"
          onClick={handleBack}
          className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Contacts
        </Button>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={handleEdit}
            className="flex items-center gap-2"
          >
            <Edit className="w-4 h-4" />
            Edit Contact
          </Button>
          <Button
            variant="destructive"
            onClick={() => setShowDeleteConfirm(true)}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </Button>
        </div>
      </motion.div>

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl"
          >
            <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
            <p className="text-red-700 dark:text-red-300 text-sm font-medium">{error}</p>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearError}
              className="ml-auto text-red-600 hover:text-red-700 dark:text-red-400"
            >
              ×
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Contact Info */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="h-fit bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm shadow-xl border-0">
            <CardHeader className="pb-6">
              <div className="flex items-start gap-4">
                <Avatar className="w-20 h-20 ring-4 ring-blue-100 dark:ring-blue-900">
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-2xl font-bold">
                    {getInitials(contact.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    {contact.name}
                  </CardTitle>
                  <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm">
                      Added {formatDate(contact.createdAt)}
                    </span>
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Phone */}
              {contact.phone && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-200">
                    <Phone className="w-4 h-4 text-green-600 dark:text-green-400" />
                    Phone Number
                  </div>
                  <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-800/50 rounded-xl p-3">
                    <span className="font-medium text-gray-900 dark:text-white">
                      {contact.phone}
                    </span>
                    <Button
                      onClick={handleCall}
                      size="sm"
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      <Phone className="w-4 h-4 mr-2" />
                      Call
                    </Button>
                  </div>
                </div>
              )}

              {/* Address */}
              {contact.address && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-200">
                    <MapPin className="w-4 h-4 text-red-600 dark:text-red-400" />
                    Address
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-3">
                    <p className="text-gray-900 dark:text-white leading-relaxed">
                      {contact.address}
                    </p>
                  </div>
                </div>
              )}

              {/* Tags */}
              {contact.tags.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-200">
                    <Tag className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    Tags
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {contact.tags.map((tag, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300 border border-blue-200 dark:border-blue-800"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Notes Section */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-6"
        >
          <NoteForm contactId={contact._id} />
          <NoteList notes={contactNotes} />
        </motion.div>
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowDeleteConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <Card className="max-w-md w-full">
                <CardContent className="p-6 text-center space-y-6">
                  <div className="w-16 h-16 mx-auto bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                    <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                      Delete Contact
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Are you sure you want to delete <strong>{contact.name}</strong>? This action cannot be undone.
                      All notes associated with this contact will also be deleted.
                    </p>
                  </div>
                  <div className="flex gap-3 justify-center">
                    <Button
                      variant="outline"
                      onClick={() => setShowDeleteConfirm(false)}
                      className="min-w-[100px]"
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={handleDelete}
                      className="min-w-[100px] bg-red-600 hover:bg-red-700"
                    >
                      Delete Contact
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ContactDetail;