import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useContacts } from '../../contexts/ContactContext';
import { useNavigate } from 'react-router-dom';
import ContactCard from './ContactCard';
import SearchBar from '../search/SearchBar';
import FilterTags from '../search/FilterTags';
import Loading from '../shared/Loading';
import ErrorMessage from '../shared/ErrorMessage';

const ContactList: React.FC = () => {
  const {
    contacts,
    loading,
    error,
    fetchContacts,
    searchContacts,
    clearError,
  } = useContacts();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);
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

  const handleSearch = useCallback(async (query: string) => {
    if (query === searchQuery) return; // Prevent unnecessary searches

    setSearchQuery(query);
    setIsSearching(true);

    try {
      if (query.trim() || selectedTags.length > 0) {
        const tagsParam = selectedTags.length > 0 ? selectedTags.join(',') : undefined;
        await fetchContacts(1, query, tagsParam);
      } else {
        await fetchContacts();
      }
    } finally {
      setIsSearching(false);
    }
  }, [searchQuery, selectedTags, fetchContacts]);

  const handleTagsChange = useCallback(async (tags: string[]) => {
    setSelectedTags(tags);
    setIsSearching(true);

    try {
      if (searchQuery.trim() || tags.length > 0) {
        const tagsParam = tags.length > 0 ? tags.join(',') : undefined;
        await fetchContacts(1, searchQuery, tagsParam);
      } else {
        await fetchContacts();
      }
    } finally {
      setIsSearching(false);
    }
  }, [searchQuery, fetchContacts]);

  const handleAddContact = useCallback(() => {
    navigate('/contacts/new');
  }, [navigate]);

  const handleContactClick = useCallback((contactId: string) => {
    navigate(`/contacts/${contactId}`);
  }, [navigate]);

  // Memoize the contacts grid to prevent unnecessary re-renders
  const contactsGrid = useMemo(() => {
    if (contacts.length === 0) return null;

    return (
      <div className="contacts-grid">
        {contacts.map(contact => (
          <ContactCard
            key={contact._id}
            contact={contact}
            onClick={() => handleContactClick(contact._id)}
          />
        ))}
      </div>
    );
  }, [contacts, handleContactClick]);

  if ((loading || isSearching) && contacts.length === 0) {
    return <Loading message={isSearching ? "Searching contacts..." : "Loading contacts..."} />;
  }

  return (
    <div className="contact-list-container">
      <div className="contact-list-header">
        <div className="header-top">
          <h2 className="page-title">My Contacts</h2>
          <button
            className="add-contact-btn"
            onClick={handleAddContact}
            type="button"
          >
            + Add Contact
          </button>
        </div>

        <SearchBar
          onSearch={handleSearch}
          placeholder="Search contacts by name, phone, address, or notes..."
          value={searchQuery}
        />

        <FilterTags
          availableTags={availableTags}
          selectedTags={selectedTags}
          onTagsChange={handleTagsChange}
          className="contact-filter-tags"
        />
      </div>

      {error && (
        <ErrorMessage message={error} onDismiss={clearError} />
      )}

      <div className="contact-list">
        {contacts.length === 0 && !loading ? (
          <div className="empty-state">
            <h3>No contacts found</h3>
            <p>
              {searchQuery
                ? 'Try adjusting your search terms or add a new contact.'
                : 'Start by adding your first contact from your outreach activities.'}
            </p>
            <button
              className="add-contact-btn-primary"
              onClick={handleAddContact}
              type="button"
            >
              Add Your First Contact
            </button>
          </div>
        ) : (
          contactsGrid
        )}
      </div>

      {loading && contacts.length > 0 && (
        <div className="loading-overlay">
          <Loading message="Updating contacts..." />
        </div>
      )}
    </div>
  );
};

export default ContactList;