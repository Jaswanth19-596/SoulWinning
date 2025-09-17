const mongoose = require('mongoose');
const dbEncryption = require('../utils/dbEncryption');

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

// Define fields that should be encrypted
const ENCRYPTED_FIELDS = ['content'];

// Pre-save middleware to encrypt sensitive data
noteSchema.pre('save', function(next) {
  try {
    // Encrypt the content field
    ENCRYPTED_FIELDS.forEach(field => {
      if (this[field] && (this.isModified(field) || !dbEncryption.isEncryptedData(this[field]))) {
        // Only encrypt if field is modified OR if it's not already encrypted (legacy data)
        if (!dbEncryption.isEncryptedData(this[field])) {
          console.log(`Encrypting unencrypted note field: ${field}`);
          this[field] = dbEncryption.encrypt(this[field]);
        }
      }
    });

    next();
  } catch (error) {
    next(error);
  }
});

// Pre-update middleware to encrypt data on updates
noteSchema.pre(['updateOne', 'findOneAndUpdate'], function(next) {
  try {
    const update = this.getUpdate();

    if (update.$set) {
      // Encrypt fields in $set
      ENCRYPTED_FIELDS.forEach(field => {
        if (update.$set[field]) {
          update.$set[field] = dbEncryption.encrypt(update.$set[field]);
        }
      });
    }

    next();
  } catch (error) {
    next(error);
  }
});

// Method to decrypt note data for JSON responses
noteSchema.methods.toDecryptedJSON = function() {
  const note = this.toObject();

  try {
    // Decrypt the content field
    ENCRYPTED_FIELDS.forEach(field => {
      if (note[field]) {
        const decrypted = dbEncryption.decrypt(note[field]);
        note[field] = decrypted;
      }
    });

    return note;
  } catch (error) {
    console.error('Failed to decrypt note data:', error);
    return note; // Return data as-is if decryption fails
  }
};

// Static method to decrypt multiple notes
noteSchema.statics.decryptMany = function(notes) {
  return notes.map(note => {
    if (note.toDecryptedJSON) {
      return note.toDecryptedJSON();
    } else {
      // Handle plain objects
      return dbEncryption.decryptFields(note, ENCRYPTED_FIELDS);
    }
  });
};

module.exports = mongoose.model('Note', noteSchema);