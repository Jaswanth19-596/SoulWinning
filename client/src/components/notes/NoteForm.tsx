import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, Save, X } from 'lucide-react';
import { useContacts } from '../../contexts/ContactContext';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

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
    <motion.div
      initial={{ opacity: 0, y: isEditing ? 0 : 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: isEditing ? 0 : 20 }}
      className="w-full"
    >
      {!isEditing ? (
        <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm shadow-lg border-0">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg text-gray-900 dark:text-white flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              Add a New Note
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <textarea
                  id="note-content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="flex w-full rounded-xl border border-input bg-white/80 dark:bg-gray-800/80 px-4 py-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 min-h-[100px] resize-none"
                  placeholder="What happened in this conversation? Any prayer requests or follow-up needed?"
                  rows={3}
                  disabled={isSubmitting}
                />
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Share details about the conversation, prayer needs, or follow-up actions.
                </p>
              </div>

              <div className="flex justify-end">
                <Button
                  type="submit"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl"
                  disabled={!content.trim() || isSubmitting}
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Saving...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Save className="w-4 h-4" />
                      Add Note
                    </div>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <textarea
                id="note-content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="flex w-full rounded-xl border border-input bg-white/80 dark:bg-gray-800/80 px-4 py-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 min-h-[120px] resize-none"
                placeholder="Edit your note..."
                rows={4}
                disabled={isSubmitting}
                autoFocus
              />
            </div>

            <div className="flex gap-3 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={isSubmitting}
                className="min-w-[80px]"
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button
                type="submit"
                className="min-w-[100px] bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                disabled={!content.trim() || isSubmitting}
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Saving...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Save className="w-4 h-4" />
                    Update
                  </div>
                )}
              </Button>
            </div>
          </form>
        </div>
      )}
    </motion.div>
  );
};

export default NoteForm;