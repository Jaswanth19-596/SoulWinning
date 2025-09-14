const mongoose = require('mongoose');

const prayerCommentSchema = new mongoose.Schema({
  content: {
    type: String,
    required: [true, 'Comment content is required'],
    trim: true,
    maxlength: [500, 'Comment cannot exceed 500 characters']
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
  reaction: {
    type: String,
    enum: ['praying', 'amen', 'heart'],
    default: 'praying'
  }
}, {
  timestamps: true
});

prayerCommentSchema.index({ contactId: 1, createdAt: -1 });
prayerCommentSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('PrayerComment', prayerCommentSchema);