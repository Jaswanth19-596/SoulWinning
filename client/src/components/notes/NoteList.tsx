import React from 'react';
import { Note } from '../../types';
import NoteCard from './NoteCard';

interface NoteListProps {
  notes: Note[];
}

const NoteList: React.FC<NoteListProps> = ({ notes }) => {
  if (notes.length === 0) {
    return (
      <div className="empty-notes">
        <p>No notes yet. Add your first note about this conversation!</p>
      </div>
    );
  }

  return (
    <div className="note-list">
      {notes.map(note => (
        <NoteCard key={note._id} note={note} />
      ))}
    </div>
  );
};

export default NoteList;