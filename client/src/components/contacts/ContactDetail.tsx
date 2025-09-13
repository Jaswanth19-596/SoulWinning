import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useContacts } from '../../contexts/ContactContext';
import { Contact } from '../../types';
import NoteList from '../notes/NoteList';
import NoteForm from '../notes/NoteForm';
import Loading from '../shared/Loading';
import ErrorMessage from '../shared/ErrorMessage';

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
        fetchContactNotes(id);
      }
    }
  }, [id, contacts, fetchContactNotes]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

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
      <div className="error-container">
        <h2>Contact not found</h2>
        <button onClick={handleBack} className="back-btn">
          ← Back to contacts
        </button>
      </div>
    );
  }

  if (loading || !contact) {
    return <Loading message="Loading contact details..." />;
  }

  return (
    <div className="contact-detail-container">
      <div className="contact-detail-header">
        <button
          className="back-btn"
          onClick={handleBack}
          type="button"
        >
          ← Back
        </button>
        <div className="header-actions">
          <button
            className="edit-btn"
            onClick={handleEdit}
            type="button"
          >
            Edit
          </button>
          <button
            className="delete-btn"
            onClick={() => setShowDeleteConfirm(true)}
            type="button"
          >
            Delete
          </button>
        </div>
      </div>

      {error && (
        <ErrorMessage message={error} onDismiss={clearError} />
      )}

      <div className="contact-info-card">
        <div className="contact-header">
          <h1 className="contact-name">{contact.name}</h1>
          <span className="contact-date">Added {formatDate(contact.createdAt)}</span>
        </div>

        <div className="contact-details">
          {contact.phone && (
            <div className="contact-detail-item">
              <label>Phone:</label>
              <div className="phone-container">
                <span>{contact.phone}</span>
                <button
                  className="call-btn"
                  onClick={handleCall}
                  type="button"
                  aria-label="Call contact"
                >
                  📞 Call
                </button>
              </div>
            </div>
          )}

          {contact.address && (
            <div className="contact-detail-item">
              <label>Address:</label>
              <span className="address">{contact.address}</span>
            </div>
          )}

          {contact.tags.length > 0 && (
            <div className="contact-detail-item">
              <label>Tags:</label>
              <div className="contact-tags">
                {contact.tags.map((tag, index) => (
                  <span key={index} className="contact-tag">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="notes-section">
        <div className="notes-header">
          <h2>Conversation Notes</h2>
          <span className="notes-count">
            {contactNotes.length} note{contactNotes.length !== 1 ? 's' : ''}
          </span>
        </div>

        <NoteForm contactId={contact._id} />
        <NoteList notes={contactNotes} />
      </div>

      {showDeleteConfirm && (
        <div className="modal-overlay">
          <div className="confirm-modal">
            <h3>Delete Contact</h3>
            <p>
              Are you sure you want to delete {contact.name}? This action cannot be undone.
              All notes associated with this contact will also be deleted.
            </p>
            <div className="modal-actions">
              <button
                className="cancel-btn"
                onClick={() => setShowDeleteConfirm(false)}
                type="button"
              >
                Cancel
              </button>
              <button
                className="delete-confirm-btn"
                onClick={handleDelete}
                type="button"
              >
                Delete Contact
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContactDetail;