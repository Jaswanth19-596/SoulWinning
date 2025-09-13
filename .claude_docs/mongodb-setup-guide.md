# MongoDB Local Setup Guide

## 🎉 Current Status: READY TO GO!
Your MongoDB is already properly installed and running! Here's everything you need to know.

## 📊 Your MongoDB Setup

### Installation Details
- **Version**: MongoDB Community Edition 8.0.8
- **Installation Method**: Homebrew
- **Service Status**: ✅ Running automatically
- **Database Location**: `/opt/homebrew/var/mongodb`
- **Log Files**: `/opt/homebrew/var/log/mongodb`
- **Configuration**: `/opt/homebrew/etc/mongod.conf`

### Connection Details
- **Host**: `localhost`
- **Port**: `27017` (default)
- **Database Name**: `soul-winning`
- **Full URI**: `mongodb://localhost:27017/soul-winning`

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

## 🗂️ Understanding Your Data Structure

When you use the Soul Winning app, MongoDB will automatically create these collections:

### `users` Collection
```javascript
{
  _id: ObjectId("..."),
  username: "john_doe",
  email: "john@example.com",
  password: "hashed_password",
  createdAt: ISODate("..."),
  updatedAt: ISODate("...")
}
```

### `contacts` Collection
```javascript
{
  _id: ObjectId("..."),
  name: "Jane Smith",
  address: "123 Main St, City",
  phone: "555-0123",
  tags: ["Interested", "Follow-up needed"],
  userId: ObjectId("..."), // Links to users collection
  createdAt: ISODate("..."),
  updatedAt: ISODate("...")
}
```

### `notes` Collection
```javascript
{
  _id: ObjectId("..."),
  content: "Had a great conversation about faith...",
  contactId: ObjectId("..."), // Links to contacts collection
  userId: ObjectId("..."), // Links to users collection
  timestamp: ISODate("..."),
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

## 💾 Backup and Restore

### Create a Backup
```bash
# Backup entire soul-winning database
mongodump --db soul-winning --out ~/mongodb-backups/$(date +%Y-%m-%d)

# Backup specific collection
mongodump --db soul-winning --collection contacts --out ~/mongodb-backups/contacts-$(date +%Y-%m-%d)
```

### Restore from Backup
```bash
# Restore entire database
mongorestore --db soul-winning ~/mongodb-backups/2024-01-01/soul-winning

# Restore specific collection
mongorestore --db soul-winning --collection contacts ~/mongodb-backups/contacts-2024-01-01/soul-winning/contacts.bson
```

### Export Data to JSON
```bash
# Export contacts to JSON
mongoexport --db soul-winning --collection contacts --out ~/exports/contacts.json --pretty

# Export with query filter
mongoexport --db soul-winning --collection contacts --query '{"tags": "Interested"}' --out ~/exports/interested-contacts.json --pretty
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

## 🛡️ Security Best Practices

### For Development (Current Setup)
- ✅ MongoDB runs locally only (127.0.0.1)
- ✅ Not accessible from outside your machine
- ✅ No authentication required for local development

### For Production (If deploying later)
- Enable authentication
- Create database users with specific permissions
- Use SSL/TLS encryption
- Configure firewall rules
- Regular security updates

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

### In MongoDB Shell
```javascript
// Basic navigation
use soul-winning
show collections
db.contacts.find().limit(5)

// Count records
db.users.countDocuments()
db.contacts.countDocuments()
db.notes.countDocuments()

// Exit
exit
```

## 🆘 Need Help?

If you encounter issues:

1. **Check the logs**: `tail -50 /opt/homebrew/var/log/mongodb/mongo.log`
2. **Restart the service**: `brew services restart mongodb-community`
3. **Verify connection**: `mongosh --eval "db.adminCommand('hello')"`
4. **Check port**: `lsof -i :27017`

Your MongoDB setup is perfect for the Soul Winning application! 🎉