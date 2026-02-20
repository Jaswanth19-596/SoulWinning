import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Trash2,
  StickyNote,
  CalendarDays,
  Send,
} from 'lucide-react';
import { WeeklyNote } from '../../types';
import { Button } from '../ui/button';

interface WeeklyNotesProps {
  notes: WeeklyNote[];
  onAdd: (text: string) => Promise<void>;
  onDelete: (noteId: string) => Promise<void>;
}

function getDateLabel(dateStr: string): string {
  const noteDate = new Date(dateStr + 'T12:00:00');
  const today = new Date();
  today.setHours(12, 0, 0, 0);

  const diffDays = Math.floor((today.getTime() - noteDate.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays <= 7) return 'This Week';
  if (diffDays <= 14) return 'Last Week';
  if (diffDays <= 21) return '2 Weeks Ago';
  if (diffDays <= 28) return '3 Weeks Ago';

  return noteDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

const WeeklyNotes: React.FC<WeeklyNotesProps> = ({ notes, onAdd, onDelete }) => {
  const [newNote, setNewNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const sortedNotes = useMemo(
    () => [...notes].sort((a, b) => b.created_at.localeCompare(a.created_at)),
    [notes]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim() || submitting) return;
    try {
      setSubmitting(true);
      await onAdd(newNote.trim());
      setNewNote('');
    } catch (err) {
      console.error('Failed to add note:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (noteId: string) => {
    if (deletingId) return;
    try {
      setDeletingId(noteId);
      await onDelete(noteId);
    } catch (err) {
      console.error('Failed to delete note:', err);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="pt-3 border-t border-border">
      <h4 className="font-semibold text-sm mb-3 flex items-center gap-1.5">
        <StickyNote className="w-4 h-4 text-amber-500" />
        Weekly Notes
        {sortedNotes.length > 0 && (
          <span className="text-xs font-normal text-muted-foreground ml-1">
            ({sortedNotes.length})
          </span>
        )}
      </h4>

      {/* Add Note Form */}
      <form onSubmit={handleSubmit} className="flex gap-2 mb-4">
        <input
          type="text"
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          placeholder="Add a note for this week..."
          className="flex-1 bg-muted/50 border border-border text-foreground h-9 rounded-lg px-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-muted-foreground"
          disabled={submitting}
        />
        <Button
          type="submit"
          size="sm"
          disabled={!newNote.trim() || submitting}
          className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white h-9 px-3"
        >
          {submitting ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </Button>
      </form>

      {/* Notes Timeline */}
      {sortedNotes.length === 0 ? (
        <div className="text-center py-6 text-muted-foreground">
          <StickyNote className="w-8 h-8 mx-auto mb-2 opacity-20" />
          <p className="text-sm">No notes yet</p>
          <p className="text-xs mt-0.5">Add your first visit note above</p>
        </div>
      ) : (
        <div className="space-y-1">
          <AnimatePresence mode="popLayout">
            {sortedNotes.map((note) => (
              <motion.div
                key={note.id}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="group relative flex items-start gap-3 py-2.5 px-3 rounded-lg hover:bg-muted/30 transition-colors"
              >
                {/* Timeline dot */}
                <div className="flex-shrink-0 mt-1.5">
                  <div className="w-2 h-2 rounded-full bg-amber-500" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[11px] font-semibold text-amber-600 bg-amber-500/10 px-1.5 py-0.5 rounded">
                      {getDateLabel(note.date)}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {new Date(note.date + 'T12:00:00').toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                  <p className="text-sm text-foreground leading-relaxed">
                    {note.text}
                  </p>
                </div>

                {/* Delete button */}
                <button
                  onClick={() => handleDelete(note.id)}
                  disabled={deletingId === note.id}
                  className="flex-shrink-0 opacity-0 group-hover:opacity-100 p-1 text-muted-foreground hover:text-destructive transition-all"
                  aria-label="Delete note"
                >
                  {deletingId === note.id ? (
                    <div className="w-3.5 h-3.5 border-2 border-muted-foreground/30 border-t-muted-foreground rounded-full animate-spin" />
                  ) : (
                    <Trash2 className="w-3.5 h-3.5" />
                  )}
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default React.memo(WeeklyNotes);
