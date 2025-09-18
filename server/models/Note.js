const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  content: {
    type: String,
    required: [true, 'Note content is required'],
    trim: true,
    maxlength: [1000, 'Note cannot exceed 1000 characters']
  },
  contactId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Contact',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for better query performance
noteSchema.index({ contactId: 1, timestamp: -1 });
noteSchema.index({ userId: 1, timestamp: -1 });

// Text index for search functionality
noteSchema.index({ content: 'text' });

// Compound indexes for common query patterns
noteSchema.index({ userId: 1, contactId: 1, timestamp: -1 });
noteSchema.index({ userId: 1, content: 'text' });


module.exports = mongoose.model('Note', noteSchema);