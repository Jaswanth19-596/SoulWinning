const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dbEncryption = require('../utils/dbEncryption');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters long'],
    maxlength: [20, 'Username cannot exceed 20 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long']
  }
}, {
  timestamps: true
});

// Define fields that should be encrypted (email only, username stays unencrypted)
const ENCRYPTED_FIELDS = ['email'];

userSchema.pre('save', async function(next) {
  try {
    // Hash password if modified
    if (this.isModified('password')) {
      const salt = await bcrypt.genSalt(12);
      this.password = await bcrypt.hash(this.password, salt);
    }

    // Encrypt email if modified or if it's unencrypted (legacy data)
    ENCRYPTED_FIELDS.forEach(field => {
      if (this[field] && (this.isModified(field) || !dbEncryption.isEncryptedData(this[field]))) {
        if (!dbEncryption.isEncryptedData(this[field])) {
          console.log(`Encrypting unencrypted user field: ${field}`);
          this[field] = dbEncryption.encrypt(this[field]);
        }
      }
    });

    next();
  } catch (error) {
    next(error);
  }
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;

  // Decrypt email for JSON response
  try {
    if (user.email) {
      user.email = dbEncryption.decrypt(user.email);
    }
  } catch (error) {
    console.error('Failed to decrypt user email:', error);
    // Keep encrypted email if decryption fails
  }

  return user;
};

// Method to get decrypted user data
userSchema.methods.toDecryptedJSON = function() {
  const user = this.toObject();
  delete user.password;

  try {
    // Decrypt email
    ENCRYPTED_FIELDS.forEach(field => {
      if (user[field]) {
        user[field] = dbEncryption.decrypt(user[field]);
      }
    });

    return user;
  } catch (error) {
    console.error('Failed to decrypt user data:', error);
    return user; // Return with encrypted data if decryption fails
  }
};

// Static method to find user by email (handles both encrypted and unencrypted)
userSchema.statics.findByEmail = async function(email) {
  try {
    // First try to find by encrypted email (new format)
    const encryptedEmail = dbEncryption.encrypt(email);
    let user = await this.findOne({ email: encryptedEmail });

    // If not found, try to find by unencrypted email (legacy format)
    if (!user) {
      user = await this.findOne({ email: email });

      // If found with unencrypted email, encrypt it for future use
      if (user && !dbEncryption.isEncryptedData(user.email)) {
        console.log('Found user with unencrypted email, will encrypt on next save');
        // Note: We don't save here to avoid middleware conflicts during login
      }
    }

    return user;
  } catch (error) {
    console.error('Failed to find user by email:', error);
    return null;
  }
};

module.exports = mongoose.model('User', userSchema);