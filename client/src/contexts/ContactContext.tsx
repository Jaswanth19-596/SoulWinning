import React, { createContext, useContext, useState, useCallback } from 'react';
import { Contact, Note } from '../types';
import { contactService, CreateContactData } from '../services/contactService';
import { noteService } from '../services/noteService';

interface ContactContextType {
  contacts: Contact[];
  loading: boolean;
  error: string | null;
  selectedContact: Contact | null;
  contactNotes: Note[];
  fetchContacts: (page?: number, search?: string, tags?: string) => Promise<void>;
  createContact: (contactData: CreateContactData) => Promise<void>;
  updateContact: (id: string, contactData: CreateContactData) => Promise<void>;
  deleteContact: (id: string) => Promise<void>;
  selectContact: (contact: Contact | null) => void;
  fetchContactNotes: (contactId: string) => Promise<void>;
  addNote: (contactId: string, content: string) => Promise<void>;
  updateNote: (noteId: string, content: string) => Promise<void>;
  deleteNote: (noteId: string) => Promise<void>;
  searchContacts: (query: string) => Promise<void>;
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

  const handleError = (err: any, defaultMessage: string) => {
    const message = err.response?.data?.message || err.message || defaultMessage;
    setError(message);
    console.error(err);
  };

  const clearError = () => setError(null);

  const fetchContacts = useCallback(async (page = 1, search?: string, tags?: string) => {
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
    }
  }, []);

  const createContact = async (contactData: CreateContactData) => {
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
  };

  const updateContact = async (id: string, contactData: CreateContactData) => {
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
  };

  const deleteContact = async (id: string) => {
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
  };

  const selectContact = (contact: Contact | null) => {
    setSelectedContact(contact);
    if (!contact) {
      setContactNotes([]);
    }
  };

  const fetchContactNotes = async (contactId: string) => {
    try {
      clearError();
      const response = await noteService.getNotes(contactId);
      if (response.success && response.data) {
        setContactNotes(response.data);
      }
    } catch (err) {
      handleError(err, 'Failed to fetch notes');
    }
  };

  const addNote = async (contactId: string, content: string) => {
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
  };

  const updateNote = async (noteId: string, content: string) => {
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
  };

  const deleteNote = async (noteId: string) => {
    try {
      clearError();
      await noteService.deleteNote(noteId);
      setContactNotes(prev => prev.filter(note => note._id !== noteId));
    } catch (err) {
      handleError(err, 'Failed to delete note');
      throw err;
    }
  };

  const searchContacts = useCallback(async (query: string) => {
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
    }
  }, [fetchContacts]);

  const value: ContactContextType = {
    contacts,
    loading,
    error,
    selectedContact,
    contactNotes,
    fetchContacts,
    createContact,
    updateContact,
    deleteContact,
    selectContact,
    fetchContactNotes,
    addNote,
    updateNote,
    deleteNote,
    searchContacts,
    clearError,
  };

  return <ContactContext.Provider value={value}>{children}</ContactContext.Provider>;
};