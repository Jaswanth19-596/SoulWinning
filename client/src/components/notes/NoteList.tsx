import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, MessageCircle } from 'lucide-react';
import { Note } from '../../types';
import NoteCard from './NoteCard';
import { Card, CardContent } from '../ui/card';

interface NoteListProps {
  notes: Note[];
}

const NoteList: React.FC<NoteListProps> = ({ notes }) => {
  if (notes.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-12"
      >
        <Card className="max-w-sm mx-auto p-6 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 border-dashed border-2 border-gray-300 dark:border-gray-600">
          <CardContent className="space-y-4">
            <div className="w-16 h-16 mx-auto bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
              <MessageCircle className="w-8 h-8 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                No Notes Yet
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Add your first note about this conversation!
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-6">
        <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Conversation Notes
        </h3>
        <span className="text-sm text-gray-500 dark:text-gray-400">({notes.length})</span>
      </div>
      <AnimatePresence>
        <div className="space-y-4">
          {notes.map((note, index) => (
            <motion.div
              key={note._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ delay: index * 0.1, duration: 0.3 }}
            >
              <NoteCard note={note} />
            </motion.div>
          ))}
        </div>
      </AnimatePresence>
    </div>
  );
};

export default NoteList;