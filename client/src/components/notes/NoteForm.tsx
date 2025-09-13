import React, { useState, useEffect } from 'react';
import { useContacts } from '../../contexts/ContactContext';

interface NoteFormProps {
  contactId: string;
  initialContent?: string;
  onSave?: (content: string) => void;
  onCancel?: () => void;
  isEditing?: boolean;
}

const NoteForm: React.FC<NoteFormProps> = ({
  contactId,
  initialContent = '',
  onSave,
  onCancel,
  isEditing = false,
}) => {
  const { addNote } = useContacts();
  const [content, setContent] = useState(initialContent);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setContent(initialContent);
  }, [initialContent]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim()) return;

    try {
      setIsSubmitting(true);

      if (isEditing && onSave) {
        await onSave(content.trim());
      } else {
        await addNote(contactId, content.trim());
        setContent('');
      }
    } catch (err) {
      // Error handled by context
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      setContent('');
    }
  };

  return (
    <div className={`note-form ${isEditing ? 'editing' : ''}`}>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          {!isEditing && (
            <label htmlFor="note-content" className="form-label">
              Add a new note
            </label>
          )}
          <textarea
            id="note-content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="note-textarea"
            placeholder={
              isEditing
                ? 'Edit your note...'
                : 'What happened in this conversation? Any prayer requests or follow-up needed?'
            }
            rows={isEditing ? 4 : 3}
            disabled={isSubmitting}
          />
        </div>

        <div className="note-form-actions">
          {isEditing && (
            <button
              type="button"
              className="cancel-btn"
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            className="submit-btn"
            disabled={!content.trim() || isSubmitting}
          >
            {isSubmitting
              ? 'Saving...'
              : isEditing
              ? 'Update Note'
              : 'Add Note'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default NoteForm;