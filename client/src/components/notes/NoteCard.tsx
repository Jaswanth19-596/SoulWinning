import React, { useState } from 'react';
import { Note } from '../../types';
import { useContacts } from '../../contexts/ContactContext';
import NoteForm from './NoteForm';

interface NoteCardProps {
  note: Note;
}

const NoteCard: React.FC<NoteCardProps> = ({ note }) => {
  const { updateNote, deleteNote } = useContacts();
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  const handleSaveEdit = async (content: string) => {
    try {
      await updateNote(note._id, content);
      setIsEditing(false);
    } catch (err) {
      // Error handled by context
    }
  };

  const handleDelete = async () => {
    try {
      await deleteNote(note._id);
      setShowDeleteConfirm(false);
    } catch (err) {
      // Error handled by context
    }
  };

  if (isEditing) {
    return (
      <div className="note-card editing">
        <NoteForm
          contactId={note.contactId}
          initialContent={note.content}
          onSave={handleSaveEdit}
          onCancel={handleCancelEdit}
          isEditing={true}
        />
      </div>
    );
  }

  return (
    <div className="note-card">
      <div className="note-header">
        <span className="note-date">{formatDateTime(note.timestamp)}</span>
        <div className="note-actions">
          <button
            className="note-edit-btn"
            onClick={handleEdit}
            type="button"
            aria-label="Edit note"
          >
            ✏️
          </button>
          <button
            className="note-delete-btn"
            onClick={() => setShowDeleteConfirm(true)}
            type="button"
            aria-label="Delete note"
          >
            🗑️
          </button>
        </div>
      </div>

      <div className="note-content">
        <p>{note.content}</p>
      </div>

      {showDeleteConfirm && (
        <div className="note-delete-confirm">
          <p>Delete this note?</p>
          <div className="confirm-actions">
            <button
              className="cancel-btn-small"
              onClick={() => setShowDeleteConfirm(false)}
              type="button"
            >
              Cancel
            </button>
            <button
              className="delete-btn-small"
              onClick={handleDelete}
              type="button"
            >
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NoteCard;