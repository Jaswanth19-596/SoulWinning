# Soul Winning App - Technical Architecture

## System Overview
A full-stack MERN (MongoDB, Express, React, Node.js) application designed for soul winning contact management with enterprise-grade security, database-level encryption, and team collaboration features including prayer walls.

## Architecture Diagram
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Client  │────│  Express API    │────│   MongoDB       │
│   (Frontend)    │    │   (Backend)     │    │  (Database)     │
│                 │    │                 │    │                 │
│ - Components    │    │ - Routes        │    │ - Users         │
│ - Context API   │    │ - Middleware    │    │ - Contacts      │
│ - Secure Storage│    │ - Controllers   │    │ - Notes         │
│ - JWT + Crypto  │    │ - DB Encryption │    │ - PrayerComments│
│ - Theme System  │    │ - Auth Guards   │    │ - Encrypted Data│
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Security Layer
```
┌─────────────────────────────────────────────────────────────┐
│                     SECURITY ARCHITECTURE                   │
├─────────────────────────────────────────────────────────────┤
│ Client Side                Server Side              Database │
│ ┌─────────────┐           ┌─────────────┐         ┌────────┐ │
│ │SecureStorage│ ◄────────►│AES-256-CBC  │ ◄──────►│Encrypted│ │
│ │JWT Tokens   │           │Encryption   │         │Data    │ │
│ │Rate Limiting│           │Legacy Support│        │Storage │ │
│ └─────────────┘           └─────────────┘         └────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## Frontend Architecture (React)

### Technology Stack
- **React 18+**: Modern functional components with hooks and TypeScript
- **React Router v6**: Client-side routing and navigation
- **Context API**: Global state management for authentication, contacts, and themes
- **Axios**: HTTP client with secure request/response interceptors
- **Tailwind CSS**: Utility-first CSS with responsive design and dark mode
- **Framer Motion**: Smooth animations and transitions
- **Lucide React**: Modern icon library

### Component Structure
```
src/
├── components/
│   ├── auth/
│   │   ├── Login.tsx
│   │   ├── Register.tsx
│   │   └── ProtectedRoute.tsx
│   ├── contacts/
│   │   ├── ContactList.tsx
│   │   ├── ContactCard.tsx
│   │   ├── ContactForm.tsx
│   │   └── ContactDetail.tsx
│   ├── notes/
│   │   ├── NoteList.tsx
│   │   ├── NoteForm.tsx
│   │   └── NoteCard.tsx
│   ├── prayer-wall/
│   │   ├── TeamPrayerWall.tsx
│   │   ├── PrayerToggle.tsx
│   │   └── PrayerItemComments.tsx
│   ├── search/
│   │   ├── SearchBar.tsx
│   │   └── FilterTags.tsx
│   ├── shared/
│   │   ├── Header.tsx (with mobile menu)
│   │   ├── Loading.tsx
│   │   └── ErrorMessage.tsx
│   └── ui/
│       ├── button.tsx
│       ├── input.tsx
│       ├── card.tsx
│       ├── avatar.tsx
│       └── theme-toggle.tsx
├── contexts/
│   ├── AuthContext.tsx
│   ├── ContactContext.tsx
│   └── ThemeContext.tsx
├── services/
│   ├── api.ts (with encryption support)
│   ├── authService.ts
│   └── prayerWallService.ts
├── utils/
│   ├── secureStorage.ts (client-side encryption)
│   ├── jwtUtils.ts
│   ├── errorSanitizer.ts
│   ├── inputSanitizer.ts
│   ├── rateLimiter.ts
│   ├── cache.ts
│   └── debounce.ts
├── types/
│   └── index.ts
└── styles/
    └── globals.css (Tailwind + custom styles)
```

### State Management Strategy
- **AuthContext**: User authentication state, secure token management, login/logout functions
- **ContactContext**: Contacts data, CRUD operations, search state, pagination
- **ThemeContext**: Light/dark mode, system preference detection, theme persistence
- **Local Component State**: Form inputs, UI state, loading indicators, mobile menu state

## Backend Architecture (Node.js/Express)

### Technology Stack
- **Node.js**: JavaScript runtime environment with async/await patterns
- **Express.js**: Web application framework with comprehensive middleware
- **Mongoose**: MongoDB ODM with encryption middleware and schema validation
- **JWT**: JSON Web Tokens for stateless authentication
- **bcrypt**: Password hashing with salt rounds for security
- **crypto**: Node.js built-in module for AES-256-CBC database encryption
- **cors**: Cross-Origin Resource Sharing with environment-based configuration
- **dotenv**: Environment variable management for secure configuration

### Server Structure
```
server/
├── config/
│   └── database.js (MongoDB connection with error handling)
├── controllers/
│   ├── authController.js (with encrypted email lookup)
│   ├── contactController.js (with encrypted data handling)
│   ├── noteController.js (with encrypted content)
│   └── prayerWallController.js (team prayer features)
├── middleware/
│   ├── auth.js (JWT verification)
│   ├── validation.js (input sanitization)
│   └── errorHandler.js (centralized error management)
├── models/
│   ├── User.js (with email encryption)
│   ├── Contact.js (with full field encryption)
│   ├── Note.js (with content encryption)
│   └── PrayerComment.js (prayer wall comments)
├── routes/
│   ├── auth.js (authentication endpoints)
│   ├── contacts.js (CRUD + search)
│   ├── notes.js (note management)
│   └── prayerWall.js (prayer wall features)
├── utils/
│   └── dbEncryption.js (AES-256-CBC encryption service)
├── scripts/
│   └── generateEncryptionKey.js (key generation utility)
└── server.js (with encryption testing on startup)
```

### API Endpoints
```
Authentication:
POST /api/auth/register    - User registration with encrypted email
POST /api/auth/login       - User login (username or encrypted email)
GET  /api/auth/profile     - Get user profile with decrypted data

Contacts:
GET    /api/contacts           - Get user's contacts (with pagination, decrypted)
POST   /api/contacts           - Create new contact (auto-encrypted)
GET    /api/contacts/:id       - Get specific contact with notes (decrypted)
PUT    /api/contacts/:id       - Update contact (re-encrypted)
DELETE /api/contacts/:id       - Delete contact and associated notes
GET    /api/contacts/search    - Search contacts (server-side decryption)

Notes:
GET    /api/contacts/:id/notes - Get contact's notes (decrypted)
POST   /api/contacts/:id/notes - Add note to contact (auto-encrypted)
PUT    /api/notes/:id          - Update note (re-encrypted)
DELETE /api/notes/:id          - Delete note

Prayer Wall:
GET    /api/prayer-wall                    - Get shared prayer requests (decrypted)
GET    /api/prayer-wall/:contactId/comments - Get prayer comments
POST   /api/prayer-wall/:contactId/comments - Add prayer comment/reaction
PUT    /api/prayer-wall/comments/:commentId - Update prayer comment
DELETE /api/prayer-wall/comments/:commentId - Delete prayer comment
PATCH  /api/prayer-wall/contacts/:contactId/toggle - Toggle prayer sharing
```

## Database Architecture (MongoDB)

### Collections Schema

#### Users Collection
```javascript
{
  _id: ObjectId,
  username: String (unique, required, unencrypted for login),
  email: String (unique, required, AES-256-CBC encrypted),
  password: String (bcrypt hashed with salt),
  createdAt: Date,
  updatedAt: Date
}
```

#### Contacts Collection
```javascript
{
  _id: ObjectId,
  name: String (required, AES-256-CBC encrypted),
  address: String (AES-256-CBC encrypted),
  phone: String (AES-256-CBC encrypted),
  tags: [String] (each tag AES-256-CBC encrypted),
  prayerRequest: String (AES-256-CBC encrypted),
  sharedToPrayerList: Boolean (unencrypted for querying),
  userId: ObjectId (ref: 'User', unencrypted for querying),
  createdAt: Date,
  updatedAt: Date
}
```

#### Notes Collection
```javascript
{
  _id: ObjectId,
  content: String (required, AES-256-CBC encrypted),
  contactId: ObjectId (ref: 'Contact', unencrypted for querying),
  userId: ObjectId (ref: 'User', unencrypted for querying),
  timestamp: Date,
  createdAt: Date,
  updatedAt: Date
}
```

#### PrayerComments Collection
```javascript
{
  _id: ObjectId,
  content: String (required, prayer comment text),
  contactId: ObjectId (ref: 'Contact'),
  userId: ObjectId (ref: 'User'),
  reaction: String (enum: 'praying', 'amen', 'heart'),
  createdAt: Date,
  updatedAt: Date
}
```

### Database Indexes
```javascript
// Users
{ email: 1 }
{ username: 1 }

// Contacts
{ userId: 1, name: 1 }
{ userId: 1, tags: 1 }
{ userId: 1, createdAt: -1 }

// Notes
{ contactId: 1, timestamp: -1 }
{ userId: 1, timestamp: -1 }
```

## Security Architecture

### Database Encryption System
```javascript
// AES-256-CBC Encryption Flow
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Client Data   │───▶│ Server Encryption │───▶│ Database Storage│
│  (Plaintext)    │    │   (AES-256-CBC)   │    │   (Encrypted)   │
└─────────────────┘    └──────────────────┘    └─────────────────┘
        ▲                                                │
        │                ┌──────────────────┐           │
        └────────────────│ Server Decryption│◄──────────┘
                         │   (For Display)   │
                         └──────────────────┘
```

#### Encryption Implementation
- **Algorithm**: AES-256-CBC with random initialization vectors
- **Key Management**: Environment-based 32-byte keys with base64 encoding
- **Legacy Support**: Automatic detection and migration of unencrypted data
- **Field-Level**: Granular encryption of sensitive fields only
- **Performance**: Encryption/decryption handled at Mongoose middleware level

#### Encrypted vs Unencrypted Fields
```javascript
// ENCRYPTED (sensitive data)
- Contact: name, address, phone, tags, prayerRequest
- Note: content
- User: email

// UNENCRYPTED (for querying/indexing)
- User: username (for login)
- Contact: userId, sharedToPrayerList, timestamps
- Note: contactId, userId, timestamp
- ObjectIds and references
```

### Authentication Flow
1. User submits login credentials (username or email)
2. Server handles encrypted email lookup with legacy support
3. Password verification using bcrypt with salt rounds
4. JWT token generation with secure expiration
5. Client stores token in encrypted secure storage
6. Token validation on protected routes with automatic refresh

### Multi-Layer Security
- **Client Side**: Secure storage, input sanitization, rate limiting
- **Transport**: HTTPS, CORS configuration, request validation
- **Server Side**: JWT verification, input validation, error sanitization
- **Database**: Field-level AES-256-CBC encryption, secure indexes

## Development Environment

### Environment Variables
```
# Server (.env)
PORT=5001
NODE_ENV=development
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/soul-winning
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=24h
CLIENT_URL=http://localhost:3000
DB_ENCRYPTION_KEY=base64-encoded-32-byte-key-for-aes-256-cbc

# Client (.env)
REACT_APP_API_URL=http://localhost:5001/api
```

### Development Tools
- **nodemon**: Auto-restart server during development
- **concurrently**: Run client and server simultaneously
- **TypeScript**: Type safety and better developer experience
- **Tailwind CSS**: Utility-first CSS framework with dark mode
- **Framer Motion**: Animation library for smooth transitions
- **Encryption Key Generator**: `scripts/generateEncryptionKey.js` for secure key creation

## Deployment Architecture

### Production Considerations
- **MongoDB Atlas**: Cloud database hosting
- **Heroku/Vercel**: Application hosting
- **Environment Variables**: Secure configuration management
- **SSL/HTTPS**: Encrypted data transmission
- **CDN**: Static asset delivery optimization

## Performance Optimizations

### Frontend
- **Code Splitting**: Dynamic imports for route-based splitting
- **Memoization**: React.memo for expensive components
- **Lazy Loading**: Load components on demand
- **Bundle Optimization**: Tree shaking and minification

### Backend
- **Database Indexing**: Optimized queries for search functionality
- **Pagination**: Limit data transfer for large datasets
- **Caching**: Redis for frequently accessed data
- **Compression**: Gzip middleware for response compression

## Error Handling Strategy

### Frontend Error Handling
- **Global Error Boundary**: Catch and display React errors
- **API Error Interceptors**: Handle HTTP errors consistently
- **Form Validation**: Real-time input validation with feedback

### Backend Error Handling
- **Centralized Error Middleware**: Consistent error responses
- **Logging**: Comprehensive error logging with Winston
- **Graceful Degradation**: Fallback responses for service failures