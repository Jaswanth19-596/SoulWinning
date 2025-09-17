const mongoose = require('mongoose');
const dbEncryption = require('../utils/dbEncryption');

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

// Define fields that should be encrypted
const ENCRYPTED_FIELDS = ['name', 'address', 'phone', 'prayerRequest'];
const ENCRYPTED_ARRAY_FIELDS = ['tags'];

// Pre-save middleware to encrypt sensitive data
contactSchema.pre('save', function(next) {
  try {
    // Encrypt regular fields
    ENCRYPTED_FIELDS.forEach(field => {
      if (this[field] && (this.isModified(field) || !dbEncryption.isEncryptedData(this[field]))) {
        // Only encrypt if field is modified OR if it's not already encrypted (legacy data)
        if (!dbEncryption.isEncryptedData(this[field])) {
          console.log(`Encrypting unencrypted field: ${field}`);
          this[field] = dbEncryption.encrypt(this[field]);
        }
      }
    });

    // Encrypt array fields
    ENCRYPTED_ARRAY_FIELDS.forEach(field => {
      if (this[field] && (this.isModified(field) || this.hasUnencryptedArrayItems(field)) && Array.isArray(this[field])) {
        this[field] = this[field].map(item => {
          if (typeof item === 'string' && !dbEncryption.isEncryptedData(item)) {
            console.log(`Encrypting unencrypted array item in ${field}`);
            return dbEncryption.encrypt(item);
          }
          return item;
        });
      }
    });

    next();
  } catch (error) {
    next(error);
  }
});

// Helper method to check if array has unencrypted items
contactSchema.methods.hasUnencryptedArrayItems = function(fieldName) {
  if (!this[fieldName] || !Array.isArray(this[fieldName])) {
    return false;
  }

  return this[fieldName].some(item =>
    typeof item === 'string' && !dbEncryption.isEncryptedData(item)
  );
};

// Pre-update middleware to encrypt data on updates
contactSchema.pre(['updateOne', 'findOneAndUpdate'], function(next) {
  try {
    const update = this.getUpdate();

    if (update.$set) {
      // Encrypt regular fields in $set
      ENCRYPTED_FIELDS.forEach(field => {
        if (update.$set[field]) {
          update.$set[field] = dbEncryption.encrypt(update.$set[field]);
        }
      });

      // Encrypt array fields in $set
      ENCRYPTED_ARRAY_FIELDS.forEach(field => {
        if (update.$set[field] && Array.isArray(update.$set[field])) {
          update.$set[field] = update.$set[field].map(item =>
            typeof item === 'string' ? dbEncryption.encrypt(item) : item
          );
        }
      });
    }

    next();
  } catch (error) {
    next(error);
  }
});

// Method to decrypt contact data for JSON responses
contactSchema.methods.toDecryptedJSON = function() {
  const contact = this.toObject();
  let needsEncryption = false;

  try {
    // Decrypt regular fields
    ENCRYPTED_FIELDS.forEach(field => {
      if (contact[field]) {
        const decrypted = dbEncryption.decrypt(contact[field]);
        // If data was unencrypted (legacy), mark for re-encryption
        if (decrypted === contact[field] && !dbEncryption.isEncryptedData(contact[field])) {
          needsEncryption = true;
        }
        contact[field] = decrypted;
      }
    });

    // Decrypt array fields
    ENCRYPTED_ARRAY_FIELDS.forEach(field => {
      if (contact[field] && Array.isArray(contact[field])) {
        contact[field] = contact[field].map(item => {
          if (typeof item === 'string') {
            const decrypted = dbEncryption.decrypt(item);
            // If data was unencrypted (legacy), mark for re-encryption
            if (decrypted === item && !dbEncryption.isEncryptedData(item)) {
              needsEncryption = true;
            }
            return decrypted;
          }
          return item;
        });
      }
    });

    // If we found unencrypted data, save the document to encrypt it
    if (needsEncryption) {
      console.log(`Contact ${contact._id}: Found unencrypted data, will encrypt on next save`);
      // Note: We don't save immediately here to avoid recursion
    }

    return contact;
  } catch (error) {
    console.error('Failed to decrypt contact data:', error);
    return contact; // Return data as-is if decryption fails
  }
};

// Static method to decrypt multiple contacts
contactSchema.statics.decryptMany = function(contacts) {
  return contacts.map(contact => {
    if (contact.toDecryptedJSON) {
      return contact.toDecryptedJSON();
    } else {
      // Handle plain objects
      return dbEncryption.decryptFields(contact, ENCRYPTED_FIELDS.concat(ENCRYPTED_ARRAY_FIELDS));
    }
  });
};

module.exports = mongoose.model('Contact', contactSchema);