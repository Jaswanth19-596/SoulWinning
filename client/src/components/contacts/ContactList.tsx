import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Users, Heart, AlertCircle } from 'lucide-react';
import { useContacts } from '../../contexts/ContactContext';
import { useNavigate } from 'react-router-dom';
import ContactCard from './ContactCard';
import SearchBar from '../search/SearchBar';
import FilterTags from '../search/FilterTags';
import Loading from '../shared/Loading';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';

const ContactList: React.FC = () => {
  const {
    contacts,
    loading,
    error,
    fetchContacts,
    clearError,
  } = useContacts();

  const [currentSearchQuery, setCurrentSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const navigate = useNavigate();

  // Extract all unique tags from contacts
  const availableTags = useMemo(() => {
    const tagSet = new Set<string>();
    contacts.forEach(contact => {
      contact.tags.forEach(tag => tagSet.add(tag));
    });
    return Array.from(tagSet).sort();
  }, [contacts]);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);


  const handleTagsChange = useCallback(async (tags: string[]) => {
    setSelectedTags(tags);

    try {
      if (currentSearchQuery.trim() || tags.length > 0) {
        const tagsParam = tags.length > 0 ? tags.join(',') : undefined;
        await fetchContacts(1, currentSearchQuery, tagsParam);
      } else {
        await fetchContacts();
      }
    } catch (error) {
      console.error('Tag filter failed:', error);
    }
  }, [currentSearchQuery, fetchContacts]);

  const handleAddContact = useCallback(() => {
    navigate('/contacts/new');
  }, [navigate]);

  const handleContactClick = useCallback((contactId: string) => {
    navigate(`/contacts/${contactId}`);
  }, [navigate]);

  const handleContactUpdate = useCallback((updatedContact: any) => {
    // Update the contact in the context/state if needed
    // The ContactCard component manages its own state, so this might not be necessary
    // but it's here in case we need to sync with the global state
    console.log('Contact updated:', updatedContact);
  }, []);

  // Use a stable search handler with useRef to prevent SearchBar re-renders
  const searchHandlerRef = useRef<(query: string) => void>(() => {});

  useEffect(() => {
    searchHandlerRef.current = async (query: string) => {
      setCurrentSearchQuery(query);

      try {
        if (query.trim() || selectedTags.length > 0) {
          const tagsParam = selectedTags.length > 0 ? selectedTags.join(',') : undefined;
          await fetchContacts(1, query, tagsParam);
        } else {
          await fetchContacts();
        }
      } catch (error) {
        console.error('Search failed:', error);
      }
    };
  }, [selectedTags, fetchContacts]);

  const stableSearchHandler = useCallback((query: string) => {
    if (searchHandlerRef.current) {
      searchHandlerRef.current(query);
    }
  }, []);

  // Memoize the search bar component with stable handler
  const searchBarComponent = useMemo(() => (
    <SearchBar
      onSearch={stableSearchHandler}
      placeholder="Search contacts by name, phone, address, or notes..."
      initialValue={currentSearchQuery}
    />
  ), [stableSearchHandler, currentSearchQuery]);

  // Memoize the contacts grid to prevent unnecessary re-renders
  const contactsGrid = useMemo(() => {
    if (contacts.length === 0) return null;

    return contacts.map((contact, index) => (
      <motion.div
        key={contact._id}
        initial={{ opacity: 0, y: 30, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{
          duration: 0.4,
          delay: index * 0.1,
          type: "spring",
          stiffness: 100,
          damping: 12
        }}
      >
        <ContactCard
          contact={contact}
          onClick={() => handleContactClick(contact._id)}
          onContactUpdate={handleContactUpdate}
        />
      </motion.div>
    ));
  }, [contacts, handleContactClick, handleContactUpdate]);

  if (loading && contacts.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loading message="Loading contacts..." />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col gap-6"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">
              My Contacts
            </h1>
            <p className="text-muted-foreground text-lg">
              Manage your soul winning connections
            </p>
          </div>
          <Button
            onClick={handleAddContact}
            variant="gradient"
            size="lg"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Contact
          </Button>
        </div>

        {/* Search and Filter Section */}
        <Card className="p-6 glass-card">
          <div className="space-y-4">
            {searchBarComponent}

            <FilterTags
              availableTags={availableTags}
              selectedTags={selectedTags}
              onTagsChange={handleTagsChange}
              className=""
            />
          </div>
        </Card>
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
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
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

      {/* Contacts Grid */}
      <AnimatePresence>
        {contacts.length === 0 && !loading ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="text-center py-16"
          >
            <Card className="max-w-md mx-auto p-8 glass-card border-dashed border-2 border-primary/30">
              <CardContent className="space-y-6">
                <div className="w-24 h-24 mx-auto bg-gradient-to-br from-gradient-from via-gradient-via to-gradient-to rounded-3xl flex items-center justify-center shadow-2xl">
                  <Users className="w-12 h-12 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-foreground mb-2">
                    {currentSearchQuery ? 'No contacts found' : 'Start Your Journey'}
                  </h3>
                  <p className="text-muted-foreground">
                    {currentSearchQuery
                      ? 'Try adjusting your search terms or add a new contact.'
                      : 'Add your first contact from your soul winning activities.'}
                  </p>
                </div>
                <Button
                  onClick={handleAddContact}
                  variant="gradient"
                  size="lg"
                >
                  <Heart className="w-5 h-5 mr-2" />
                  Add Your First Contact
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6 lg:gap-8">
            {contactsGrid}
          </div>
        )}
      </AnimatePresence>

      {/* Loading Overlay */}
      <AnimatePresence>
        {loading && contacts.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50"
          >
            <Card className="p-6 glass-card">
              <Loading message="Updating contacts..." />
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ContactList;