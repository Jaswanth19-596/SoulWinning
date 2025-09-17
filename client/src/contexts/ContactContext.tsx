import React, { createContext, useContext, useState, useCallback, useMemo, useRef } from 'react';
import { Contact, Note } from '../types';
import { contactService, CreateContactData } from '../services/contactService';
import { noteService } from '../services/noteService';
import { debounce } from '../utils/debounce';

interface ContactContextType {
  contacts: Contact[];
  loading: boolean;
  error: string | null;
  selectedContact: Contact | null;
  contactNotes: Note[];
  fetchContacts: (page?: number, search?: string, tags?: string) => Promise<void>;
  createContact: (contactData: CreateContactData) => Promise<void>;
  updateContact: (id: string, contactData: CreateContactData) => Promise<void>;
  updateContactInState: (updatedContact: Contact) => void;
  deleteContact: (id: string) => Promise<void>;
  selectContact: (contact: Contact | null) => void;
  fetchContactNotes: (contactId: string) => Promise<void>;
  addNote: (contactId: string, content: string) => Promise<void>;
  updateNote: (noteId: string, content: string) => Promise<void>;
  deleteNote: (noteId: string) => Promise<void>;
  searchContacts: (query: string) => void;
  clearError: () => void;
}

const ContactContext = createContext<ContactContextType | undefined>(undefined);

export const useContacts = () => {
  const context = useContext(ContactContext);
  if (context === undefined) {
    throw new Error('useContacts must be used within a ContactProvider');
  }
  return context;
};

interface ContactProviderProps {
  children: React.ReactNode;
}

export const ContactProvider: React.FC<ContactProviderProps> = ({ children }) => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [contactNotes, setContactNotes] = useState<Note[]>([]);

  // Request deduplication
  const activeRequests = useRef<Map<string, Promise<any>>>(new Map());

  const handleError = (err: any, defaultMessage: string) => {
    const message = err.response?.data?.message || err.message || defaultMessage;
    setError(message);
    console.error(err);
  };

  const clearError = useCallback(() => setError(null), []);

  const fetchContacts = useCallback(async (page = 1, search?: string, tags?: string) => {
    const requestKey = `fetch-${page}-${search || ''}-${tags || ''}`;

    // Check if this request is already in progress
    if (activeRequests.current.has(requestKey)) {
      return activeRequests.current.get(requestKey);
    }

    const fetchPromise = (async () => {
      try {
        setLoading(true);
        clearError();
        const response = await contactService.getContacts(page, 50, search, tags);
        if (response.success && response.data) {
          setContacts(response.data);
        }
      } catch (err) {
        handleError(err, 'Failed to fetch contacts');
      } finally {
        setLoading(false);
        activeRequests.current.delete(requestKey);
      }
    })();

    activeRequests.current.set(requestKey, fetchPromise);
    return fetchPromise;
  }, []);

  const createContact = useCallback(async (contactData: CreateContactData) => {
    try {
      setLoading(true);
      clearError();
      const response = await contactService.createContact(contactData);
      if (response.success && response.data) {
        setContacts(prev => [response.data!, ...prev]);
      }
    } catch (err) {
      handleError(err, 'Failed to create contact');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [clearError]);

  const updateContact = useCallback(async (id: string, contactData: CreateContactData) => {
    try {
      setLoading(true);
      clearError();
      const response = await contactService.updateContact(id, contactData);
      if (response.success && response.data) {
        setContacts(prev =>
          prev.map(contact =>
            contact._id === id ? response.data! : contact
          )
        );
        if (selectedContact?._id === id) {
          setSelectedContact(response.data);
        }
      }
    } catch (err) {
      handleError(err, 'Failed to update contact');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [clearError]);

  const deleteContact = useCallback(async (id: string) => {
    try {
      setLoading(true);
      clearError();
      await contactService.deleteContact(id);
      setContacts(prev => prev.filter(contact => contact._id !== id));
      if (selectedContact?._id === id) {
        setSelectedContact(null);
        setContactNotes([]);
      }
    } catch (err) {
      handleError(err, 'Failed to delete contact');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [clearError]);

  const selectContact = useCallback((contact: Contact | null) => {
    setSelectedContact(contact);
    if (!contact) {
      setContactNotes([]);
    }
  }, []);

  const fetchContactNotes = useCallback(async (contactId: string) => {
    try {
      clearError();
      const response = await noteService.getNotes(contactId);
      if (response.success && response.data) {
        setContactNotes(response.data);
      }
    } catch (err) {
      handleError(err, 'Failed to fetch notes');
    }
  }, []);

  const addNote = useCallback(async (contactId: string, content: string) => {
    try {
      clearError();
      const response = await noteService.createNote(contactId, content);
      if (response.success && response.data) {
        setContactNotes(prev => [response.data!, ...prev]);
      }
    } catch (err) {
      handleError(err, 'Failed to add note');
      throw err;
    }
  }, [clearError]);

  const updateNote = useCallback(async (noteId: string, content: string) => {
    try {
      clearError();
      const response = await noteService.updateNote(noteId, content);
      if (response.success && response.data) {
        setContactNotes(prev =>
          prev.map(note =>
            note._id === noteId ? response.data! : note
          )
        );
      }
    } catch (err) {
      handleError(err, 'Failed to update note');
      throw err;
    }
  }, [clearError]);

  const deleteNote = useCallback(async (noteId: string) => {
    try {
      clearError();
      await noteService.deleteNote(noteId);
      setContactNotes(prev => prev.filter(note => note._id !== noteId));
    } catch (err) {
      handleError(err, 'Failed to delete note');
      throw err;
    }
  }, [clearError]);

  const updateContactInState = useCallback((updatedContact: Contact) => {
    setContacts(prev =>
      prev.map(contact =>
        contact._id === updatedContact._id ? updatedContact : contact
      )
    );
    if (selectedContact?._id === updatedContact._id) {
      setSelectedContact(updatedContact);
    }
  }, [selectedContact]);

  const performSearch = useCallback(async (query: string) => {
    const requestKey = `search-${query}`;

    // Check if this request is already in progress
    if (activeRequests.current.has(requestKey)) {
      return activeRequests.current.get(requestKey);
    }

    const searchPromise = (async () => {
      try {
        setLoading(true);
        clearError();
        if (!query.trim()) {
          await fetchContacts();
          return;
        }
        const response = await contactService.searchContacts(query);
        if (response.success && response.data) {
          setContacts(response.data);
        }
      } catch (err) {
        handleError(err, 'Failed to search contacts');
      } finally {
        setLoading(false);
        activeRequests.current.delete(requestKey);
      }
    })();

    activeRequests.current.set(requestKey, searchPromise);
    return searchPromise;
  }, [fetchContacts]);

  const searchContacts = useCallback(
    debounce(performSearch, 300),
    [performSearch]
  );

  const value: ContactContextType = useMemo(() => ({
    contacts,
    loading,
    error,
    selectedContact,
    contactNotes,
    fetchContacts,
    createContact,
    updateContact,
    updateContactInState,
    deleteContact,
    selectContact,
    fetchContactNotes,
    addNote,
    updateNote,
    deleteNote,
    searchContacts,
    clearError,
  }), [
    contacts,
    loading,
    error,
    selectedContact,
    contactNotes,
    fetchContacts,
    createContact,
    updateContact,
    updateContactInState,
    deleteContact,
    selectContact,
    fetchContactNotes,
    addNote,
    updateNote,
    deleteNote,
    searchContacts,
    clearError,
  ]);

  return <ContactContext.Provider value={value}>{children}</ContactContext.Provider>;
};