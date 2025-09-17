# Soul Winning App - Features & Code Overview

## Application Overview

The Soul Winning App is a comprehensive MERN stack application designed for church soul winning teams to manage contacts, track interactions, and collaborate through prayer requests. The application features enterprise-grade security with database-level encryption and a modern, responsive user interface.

## 🔐 Security & Encryption Features

### Database-Level Encryption
- **AES-256-CBC encryption** for all sensitive data
- **Automatic encryption/decryption** at the model level
- **Legacy data support** - seamlessly handles unencrypted existing data
- **Environment-based key management** with secure key rotation
- **Encrypted Fields**:
  - Contact names, addresses, phone numbers
  - Prayer requests and tags
  - Note content
  - User email addresses (usernames remain unencrypted for login)

### Client-Side Security
- **Secure storage** with encrypted browser storage
- **JWT token management** with automatic refresh
- **Rate limiting** on authentication attempts
- **Input sanitization** and validation
- **Password strength requirements**

## 🏗️ Application Architecture

### Frontend (React TypeScript)
```
client/
├── src/
│   ├── components/
│   │   ├── auth/           # Login, Register
│   │   ├── contacts/       # Contact CRUD operations
│   │   ├── notes/          # Note management
│   │   ├── prayer-wall/    # Team prayer features
│   │   ├── search/         # Search and filtering
│   │   ├── shared/         # Common components
│   │   └── ui/             # Reusable UI components
│   ├── contexts/           # React Context providers
│   ├── services/           # API communication
│   ├── utils/              # Utility functions
│   └── types/              # TypeScript definitions
```

### Backend (Node.js/Express)
```
server/
├── controllers/            # Business logic
├── models/                # MongoDB schemas with encryption
├── routes/                # API endpoints
├── middleware/            # Authentication, validation
├── utils/                 # Database encryption, helpers
└── config/                # Database connection
```

## 📱 Core Features

### 1. User Authentication & Authorization
**Files**: `AuthContext.tsx`, `authController.js`, `User.js`

- **User Registration**: Username, email, password with validation
- **Secure Login**: Username or email with encrypted email lookup
- **JWT Authentication**: Stateless authentication with refresh tokens
- **Protected Routes**: Route-level authentication guards
- **Password Security**: bcrypt hashing with salt rounds

**Key Code Flow**:
```javascript
// Login flow with encrypted email support
1. User enters credentials → Login.tsx
2. AuthContext.tsx calls authService.login()
3. authController.js validates and finds user (encrypted email support)
4. JWT token generated and stored securely
5. User redirected to main application
```

### 2. Contact Management System
**Files**: `ContactList.tsx`, `ContactCard.tsx`, `ContactForm.tsx`, `Contact.js`

- **Create Contacts**: Name, address, phone, tags, prayer requests
- **View Contacts**: Paginated list with search and filtering
- **Edit Contacts**: Full CRUD operations with validation
- **Delete Contacts**: Cascade deletion of associated notes
- **Contact Tags**: Customizable tags for organization

**Encryption Implementation**:
```javascript
// Contact.js model with automatic encryption
const ENCRYPTED_FIELDS = ['name', 'address', 'phone', 'prayerRequest'];
contactSchema.pre('save', function(next) {
  ENCRYPTED_FIELDS.forEach(field => {
    if (this[field] && (this.isModified(field) || !dbEncryption.isEncryptedData(this[field]))) {
      this[field] = dbEncryption.encrypt(this[field]);
    }
  });
});
```

### 3. Notes & Interaction Tracking
**Files**: `NoteList.tsx`, `NoteForm.tsx`, `NoteCard.tsx`, `Note.js`

- **Add Notes**: Timestamped interaction records
- **View Notes**: Chronological note history per contact
- **Edit Notes**: Modify existing interaction records
- **Delete Notes**: Remove notes with confirmation
- **Search Integration**: Notes included in contact search

### 4. Team Prayer Wall
**Files**: `TeamPrayerWall.tsx`, `PrayerToggle.tsx`, `PrayerItemComments.tsx`

- **Share to Prayer Wall**: Contacts can be shared with prayer requests
- **Community Prayer**: Team members can view shared prayer requests
- **Prayer Comments**: Add encouragement and prayer updates
- **Reaction System**: Praying, Amen, and Heart reactions
- **Privacy Controls**: Users control what they share

**Prayer Wall Architecture**:
```javascript
// PrayerWall flow
1. User toggles contact sharing → PrayerToggle.tsx
2. Contact.sharedToPrayerList = true with prayerRequest
3. TeamPrayerWall.tsx fetches shared contacts
4. Team members add comments/reactions → PrayerComment.js
```

### 5. Advanced Search & Filtering
**Files**: `SearchBar.tsx`, `FilterTags.tsx`, Contact search logic

- **Multi-field Search**: Name, address, phone, notes, prayer requests
- **Tag Filtering**: Filter by custom tags
- **Real-time Search**: Instant results as you type
- **Search Persistence**: Maintains search state across navigation
- **Encrypted Data Search**: Server-side decryption for search functionality

### 6. Mobile-First Responsive Design
**Files**: `Header.tsx`, CSS utilities, responsive components

- **Mobile Navigation**: Hamburger menu with all features
- **Touch-Friendly Interface**: Large tap targets and gestures
- **Responsive Layout**: Works on all device sizes
- **Theme Support**: Light/dark mode with system preference
- **Offline Considerations**: Graceful degradation for poor connections

## 🔧 Technical Implementation Details

### Database Models & Relationships

#### User Model (`User.js`)
```javascript
{
  username: String,        // Unencrypted for login
  email: String,          // Encrypted for privacy
  password: String        // bcrypt hashed
}
```

#### Contact Model (`Contact.js`)
```javascript
{
  name: String,           // Encrypted
  address: String,        // Encrypted
  phone: String,          // Encrypted
  tags: [String],         // Encrypted array
  prayerRequest: String,  // Encrypted
  sharedToPrayerList: Boolean,
  userId: ObjectId        // Reference to User
}
```

#### Note Model (`Note.js`)
```javascript
{
  content: String,        // Encrypted
  contactId: ObjectId,    // Reference to Contact
  userId: ObjectId,       // Reference to User
  timestamp: Date
}
```

#### PrayerComment Model (`PrayerComment.js`)
```javascript
{
  content: String,        // Prayer comment text
  contactId: ObjectId,    // Reference to Contact
  userId: ObjectId,       // Reference to User
  reaction: String        // 'praying', 'amen', 'heart'
}
```

### API Endpoints

#### Authentication (`/api/auth`)
- `POST /register` - User registration
- `POST /login` - User login with encrypted email support
- `GET /profile` - Get user profile

#### Contacts (`/api/contacts`)
- `GET /` - List contacts with pagination and search
- `POST /` - Create new contact
- `GET /:id` - Get contact with notes
- `PUT /:id` - Update contact
- `DELETE /:id` - Delete contact and associated notes
- `GET /search` - Advanced contact search

#### Notes (`/api/contacts/:id/notes`)
- `GET /` - Get notes for contact
- `POST /` - Add note to contact
- `PUT /:noteId` - Update note
- `DELETE /:noteId` - Delete note

#### Prayer Wall (`/api/prayer-wall`)
- `GET /` - Get shared prayer requests
- `GET /:contactId/comments` - Get prayer comments
- `POST /:contactId/comments` - Add prayer comment
- `PATCH /contacts/:contactId/toggle` - Toggle prayer sharing

### State Management

#### AuthContext
- User authentication state
- Login/logout functions
- Token management
- Protected route logic

#### ContactContext
- Contact list state
- CRUD operations
- Search and filter state
- Pagination management

#### ThemeContext
- Light/dark mode toggle
- System preference detection
- Theme persistence

### Encryption System (`dbEncryption.js`)

```javascript
class DatabaseEncryption {
  // AES-256-CBC encryption with random IV
  encrypt(text) {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', this.encryptionKey, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return Buffer.from(iv.toString('hex') + ':' + encrypted).toString('base64');
  }

  // Automatic legacy data detection
  decrypt(encryptedData) {
    if (!this.isEncryptedData(encryptedData)) {
      return encryptedData; // Return unencrypted legacy data as-is
    }
    // Decrypt and return
  }
}
```

## 🚀 Development & Deployment

### Environment Variables
```bash
# Server (.env)
PORT=5001
MONGODB_URI=mongodb://...
JWT_SECRET=your-jwt-secret
DB_ENCRYPTION_KEY=base64-encoded-32-byte-key

# Client (.env)
REACT_APP_API_URL=http://localhost:5001/api
```

### Scripts & Utilities
- `scripts/generateEncryptionKey.js` - Generate new encryption keys
- Database encryption test on server startup
- Automatic migration of legacy unencrypted data

### Security Best Practices Implemented
1. **Environment-based configuration** for all secrets
2. **Input validation** on both client and server
3. **Rate limiting** on authentication endpoints
4. **CORS configuration** for cross-origin security
5. **Database encryption** for sensitive data at rest
6. **Secure token storage** with automatic cleanup
7. **Password strength requirements** and secure hashing

## 📊 Data Flow Examples

### Contact Creation Flow
```
1. User fills ContactForm.tsx
2. Form validation (client-side)
3. API call to POST /api/contacts
4. Server validation (server-side)
5. Pre-save encryption in Contact.js
6. Database storage with encrypted data
7. Response with decrypted data for UI
8. ContactContext state update
9. UI refresh with new contact
```

### Prayer Wall Sharing Flow
```
1. User toggles PrayerToggle.tsx on contact
2. PATCH /api/prayer-wall/contacts/:id/toggle
3. Contact.sharedToPrayerList = true
4. TeamPrayerWall.tsx fetches shared contacts
5. Server decrypts data for display
6. Team members can add comments/reactions
```

### Search Implementation
```
1. User types in SearchBar.tsx
2. Debounced API call to GET /api/contacts/search
3. Server searches decrypted data server-side
4. Encrypted storage prevents client-side data exposure
5. Results returned with decrypted display data
6. UI updates with filtered results
```

This comprehensive feature overview demonstrates how the Soul Winning app combines modern web development practices with enterprise-grade security to create a powerful tool for church soul winning teams.