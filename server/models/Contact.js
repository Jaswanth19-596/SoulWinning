const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Contact name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  address: {
    type: String,
    trim: true,
    maxlength: [200, 'Address cannot exceed 200 characters']
  },
  phone: {
    type: String,
    trim: true,
    maxlength: [20, 'Phone number cannot exceed 20 characters']
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: [30, 'Tag cannot exceed 30 characters']
  }],
  sharedToPrayerList: {
    type: Boolean,
    default: false
  },
  prayerRequest: {
    type: String,
    trim: true,
    maxlength: [500, 'Prayer request cannot exceed 500 characters']
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Indexes for better query performance
contactSchema.index({ userId: 1, name: 1 });
contactSchema.index({ userId: 1, tags: 1 });
contactSchema.index({ userId: 1, createdAt: -1 });
contactSchema.index({ sharedToPrayerList: 1, createdAt: -1 });

// Text indexes for search functionality
contactSchema.index({
  name: 'text',
  address: 'text',
  phone: 'text',
  prayerRequest: 'text'
});

// Compound indexes for common query patterns
contactSchema.index({ userId: 1, name: 'text' });
contactSchema.index({ userId: 1, address: 1 });
contactSchema.index({ userId: 1, phone: 1 });


module.exports = mongoose.model('Contact', contactSchema);