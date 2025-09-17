# MongoDB Setup Guide for Soul Winning App

## 🎉 Current Status: READY TO GO!
Your MongoDB is already properly installed and running with enterprise-grade encryption support! Here's everything you need to know.

## 📊 Your MongoDB Setup

### Installation Details
- **Version**: MongoDB Community Edition 8.0.8
- **Installation Method**: Homebrew
- **Service Status**: ✅ Running automatically
- **Database Location**: `/opt/homebrew/var/mongodb`
- **Log Files**: `/opt/homebrew/var/log/mongodb`
- **Configuration**: `/opt/homebrew/etc/mongod.conf`
- **Encryption**: ✅ AES-256-CBC field-level encryption enabled

### Connection Details
- **Host**: `localhost`
- **Port**: `27017` (default)
- **Database Name**: `soul-winning`
- **Full URI**: `mongodb://localhost:27017/soul-winning`
- **Encryption Key**: Environment variable `DB_ENCRYPTION_KEY` (32-byte base64)

## 🚀 Managing MongoDB Service

### Check Service Status
```bash
brew services list | grep mongodb
# Should show: mongodb-community started
```

### Start MongoDB
```bash
brew services start mongodb-community
```

### Stop MongoDB
```bash
brew services stop mongodb-community
```

### Restart MongoDB
```bash
brew services restart mongodb-community
```

### Start MongoDB for this session only (won't auto-start on boot)
```bash
mongod --config /opt/homebrew/etc/mongod.conf
```

## 💻 Using MongoDB Shell (mongosh)

### Connect to MongoDB
```bash
mongosh
# Connects to localhost:27017 by default
```

### Connect to Your Soul Winning Database
```bash
mongosh soul-winning
# OR
mongosh
use soul-winning
```

### Basic Commands in MongoDB Shell
```javascript
// Show all databases
show dbs

// Switch to your database
use soul-winning

// Show collections in current database
show collections

// See database stats
db.stats()

// Count documents in a collection
db.users.countDocuments()
db.contacts.countDocuments()
db.notes.countDocuments()

// Find all users
db.users.find()

// Find all contacts for a specific user
db.contacts.find({userId: ObjectId("your-user-id")})

// Exit the shell
exit
```

## 🗂️ Understanding Your Encrypted Data Structure

When you use the Soul Winning app, MongoDB will automatically create these collections with AES-256-CBC encryption:

### `users` Collection
```javascript
{
  _id: ObjectId("..."),
  username: "john_doe", // Unencrypted for login
  email: "aGVsbG93b3JsZA==", // AES-256-CBC encrypted
  password: "$2b$10$...", // bcrypt hashed
  createdAt: ISODate("..."),
  updatedAt: ISODate("...")
}
```

### `contacts` Collection
```javascript
{
  _id: ObjectId("..."),
  name: "aGVsbG93b3JsZA==", // AES-256-CBC encrypted
  address: "aGVsbG93b3JsZA==", // AES-256-CBC encrypted
  phone: "aGVsbG93b3JsZA==", // AES-256-CBC encrypted
  tags: ["aGVsbG93b3JsZA=="], // Each tag AES-256-CBC encrypted
  prayerRequest: "aGVsbG93b3JsZA==", // AES-256-CBC encrypted
  sharedToPrayerList: false, // Unencrypted for querying
  userId: ObjectId("..."), // Unencrypted for relationships
  createdAt: ISODate("..."),
  updatedAt: ISODate("...")
}
```

### `notes` Collection
```javascript
{
  _id: ObjectId("..."),
  content: "aGVsbG93b3JsZA==", // AES-256-CBC encrypted
  contactId: ObjectId("..."), // Unencrypted for relationships
  userId: ObjectId("..."), // Unencrypted for relationships
  timestamp: ISODate("..."),
  createdAt: ISODate("..."),
  updatedAt: ISODate("...")
}
```

### `prayercomments` Collection
```javascript
{
  _id: ObjectId("..."),
  content: "Praying for you!", // Prayer comment text
  contactId: ObjectId("..."), // Reference to contact
  userId: ObjectId("..."), // Reference to user
  reaction: "praying", // 'praying', 'amen', 'heart'
  createdAt: ISODate("..."),
  updatedAt: ISODate("...")
}
```

## 🔍 Monitoring and Troubleshooting

### Check if MongoDB is Running
```bash
# Method 1: Check service status
brew services list | grep mongodb

# Method 2: Check if port 27017 is in use
lsof -i :27017

# Method 3: Try to connect
mongosh --eval "db.adminCommand('hello')"
```

### View MongoDB Logs
```bash
# View current logs
tail -f /opt/homebrew/var/log/mongodb/mongo.log

# View recent logs
tail -100 /opt/homebrew/var/log/mongodb/mongo.log
```

### Common Issues and Solutions

#### Issue: "Connection refused" error
**Solution:**
```bash
# Check if MongoDB is running
brew services list | grep mongodb

# If not running, start it
brew services start mongodb-community

# Check logs for errors
tail -50 /opt/homebrew/var/log/mongodb/mongo.log
```

#### Issue: "Database folder permission errors"
**Solution:**
```bash
# Fix permissions
sudo chown -R $(whoami) /opt/homebrew/var/mongodb
sudo chown -R $(whoami) /opt/homebrew/var/log/mongodb
```

#### Issue: Port 27017 already in use
**Solution:**
```bash
# Find what's using port 27017
lsof -i :27017

# Kill the process if needed (replace PID with actual process ID)
kill -9 PID

# Start MongoDB again
brew services start mongodb-community
```

## 💾 Backup and Restore (Encrypted Data)

### Create a Backup
```bash
# Backup entire soul-winning database (includes encrypted data)
mongodump --db soul-winning --out ~/mongodb-backups/$(date +%Y-%m-%d)

# Backup specific collection
mongodump --db soul-winning --collection contacts --out ~/mongodb-backups/contacts-$(date +%Y-%m-%d)

# ⚠️  Important: Backup your encryption key separately!
echo $DB_ENCRYPTION_KEY > ~/mongodb-backups/$(date +%Y-%m-%d)/encryption-key.txt
```

### Restore from Backup
```bash
# Restore entire database
mongorestore --db soul-winning ~/mongodb-backups/2024-01-01/soul-winning

# Restore specific collection
mongorestore --db soul-winning --collection contacts ~/mongodb-backups/contacts-2024-01-01/soul-winning/contacts.bson

# ⚠️  Important: Restore encryption key to environment
export DB_ENCRYPTION_KEY=$(cat ~/mongodb-backups/2024-01-01/encryption-key.txt)
```

### Export Data to JSON
```bash
# ⚠️  Note: Exported data will be in encrypted format
# For readable exports, use the application's export feature

# Export encrypted contacts to JSON
mongoexport --db soul-winning --collection contacts --out ~/exports/contacts-encrypted.json --pretty

# Export with query filter (encrypted data)
mongoexport --db soul-winning --collection contacts --query '{"sharedToPrayerList": true}' --out ~/exports/prayer-contacts.json --pretty
```

## 🔐 Encryption Key Management

### Generate New Encryption Key
```bash
# Navigate to server directory
cd /Users/jaswanth/Desktop/Soul\ Winning/server

# Generate new encryption key
node scripts/generateEncryptionKey.js

# Copy the generated key to your .env file
echo "DB_ENCRYPTION_KEY=your-generated-key" >> .env
```

### Key Security Best Practices
- **Never commit encryption keys to version control**
- **Store keys securely in environment variables**
- **Backup keys separately from database backups**
- **Use different keys for development and production**
- **Rotate keys periodically for enhanced security**

### Legacy Data Migration
The application automatically handles migration of unencrypted data:
```javascript
// Automatic detection in Mongoose middleware
if (!dbEncryption.isEncryptedData(this.name)) {
  this.name = dbEncryption.encrypt(this.name);
}
```

## 🔧 Advanced Configuration

### MongoDB Configuration File
Location: `/opt/homebrew/etc/mongod.conf`

Key settings:
```yaml
storage:
  dbPath: /opt/homebrew/var/mongodb
systemLog:
  destination: file
  path: /opt/homebrew/var/log/mongodb/mongo.log
  logAppend: true
net:
  bindIp: 127.0.0.1
  port: 27017
```

### Performance Monitoring
```javascript
// In mongosh - check database performance
db.runCommand({serverStatus: 1})

// Check slow operations
db.runCommand({currentOp: 1})

// Database statistics
db.stats()

// Collection statistics
db.contacts.stats()
```

## 🛡️ Security Architecture

### Current Security Features ✅
- **Database Encryption**: AES-256-CBC encryption for all sensitive data
- **Local Access Only**: MongoDB runs on 127.0.0.1 (localhost)
- **Network Isolation**: Not accessible from outside your machine
- **Field-Level Security**: Granular encryption of sensitive fields only
- **Legacy Support**: Automatic migration of unencrypted existing data
- **Key Management**: Environment-based encryption key storage

### Encryption Implementation
- **Algorithm**: AES-256-CBC with random initialization vectors
- **Key Length**: 32 bytes (256 bits) base64-encoded
- **IV Generation**: Crypto.randomBytes(16) for each encryption
- **Data Format**: `base64(iv:encrypted_data)`
- **Detection**: Automatic legacy data detection and migration

### For Production Deployment
- **MongoDB Atlas**: Use MongoDB Atlas with encryption at rest
- **Authentication**: Enable MongoDB authentication with role-based access
- **SSL/TLS**: Encrypt data in transit
- **Network Security**: Configure VPC and firewall rules
- **Key Rotation**: Implement regular encryption key rotation
- **Monitoring**: Set up database monitoring and alerting
- **Backup Encryption**: Ensure backups are also encrypted

### Data Privacy Guarantees
- **User Isolation**: Each user can only access their own data
- **No Admin Access**: No system administrator access to user data
- **Encrypted Storage**: Sensitive data encrypted before database storage
- **Secure Search**: Server-side decryption for search functionality
- **Privacy Controls**: Users control prayer wall sharing

## 📱 GUI Tools (Optional)

If you prefer a visual interface:

### MongoDB Compass (Official GUI)
```bash
# Install via Homebrew
brew install --cask mongodb-compass

# Connect to: mongodb://localhost:27017
```

### Studio 3T (Third-party)
- Download from studio3t.com
- Free tier available
- Connect to: mongodb://localhost:27017

## ⚡ Quick Reference

### Essential Commands
```bash
# Start MongoDB
brew services start mongodb-community

# Stop MongoDB
brew services stop mongodb-community

# Connect with shell
mongosh soul-winning

# Check status
brew services list | grep mongodb

# View logs
tail -f /opt/homebrew/var/log/mongodb/mongo.log
```

### In MongoDB Shell (Viewing Encrypted Data)
```javascript
// Basic navigation
use soul-winning
show collections

// View encrypted contacts (data will appear encrypted)
db.contacts.find().limit(5)

// Count records
db.users.countDocuments()
db.contacts.countDocuments()
db.notes.countDocuments()
db.prayercomments.countDocuments()

// Check prayer wall sharing
db.contacts.find({sharedToPrayerList: true})

// View user with encrypted email
db.users.findOne()

// ⚠️  Note: Sensitive data appears encrypted in raw queries
// Use the application interface to view decrypted data

// Exit
exit
```

## 🔍 Encryption Testing

### Test Encryption on Server Startup
The server automatically tests encryption on startup:
```bash
# Start server to see encryption test
cd /Users/jaswanth/Desktop/Soul\ Winning/server
npm start

# Look for these log messages:
# ✅ Database encryption test passed
# 🔐 Encryption/decryption working correctly
```

### Manual Encryption Testing
```javascript
// In Node.js (server environment)
const dbEncryption = require('./utils/dbEncryption');

// Test encryption
const testData = "Sensitive contact information";
const encrypted = dbEncryption.encrypt(testData);
const decrypted = dbEncryption.decrypt(encrypted);

console.log('Original:', testData);
console.log('Encrypted:', encrypted);
console.log('Decrypted:', decrypted);
console.log('Match:', testData === decrypted);
```

## 🆘 Need Help?

If you encounter issues:

1. **Check the logs**: `tail -50 /opt/homebrew/var/log/mongodb/mongo.log`
2. **Restart the service**: `brew services restart mongodb-community`
3. **Verify connection**: `mongosh --eval "db.adminCommand('hello')"`
4. **Check port**: `lsof -i :27017`

Your MongoDB setup is perfect for the Soul Winning application! 🎉