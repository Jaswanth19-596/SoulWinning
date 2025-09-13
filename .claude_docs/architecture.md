# Soul Winning App - Technical Architecture

## System Overview
A full-stack MERN (MongoDB, Express, React, Node.js) application designed for soul winning contact management with a focus on mobile usability and data security.

## Architecture Diagram
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Client  │────│  Express API    │────│   MongoDB       │
│   (Frontend)    │    │   (Backend)     │    │  (Database)     │
│                 │    │                 │    │                 │
│ - Components    │    │ - Routes        │    │ - Users         │
│ - Context API   │    │ - Middleware    │    │ - Contacts      │
│ - Axios HTTP    │    │ - Controllers   │    │ - Notes         │
│ - JWT Storage   │    │ - Auth Guards   │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Frontend Architecture (React)

### Technology Stack
- **React 18+**: Modern functional components with hooks
- **React Router v6**: Client-side routing and navigation
- **Context API**: Global state management for authentication and contacts
- **Axios**: HTTP client with request/response interceptors
- **CSS Modules**: Scoped styling with responsive design

### Component Structure
```
src/
├── components/
│   ├── auth/
│   │   ├── Login.js
│   │   ├── Register.js
│   │   └── ProtectedRoute.js
│   ├── contacts/
│   │   ├── ContactList.js
│   │   ├── ContactCard.js
│   │   ├── ContactForm.js
│   │   └── ContactDetail.js
│   ├── notes/
│   │   ├── NoteList.js
│   │   ├── NoteForm.js
│   │   └── NoteCard.js
│   ├── search/
│   │   ├── SearchBar.js
│   │   └── FilterTags.js
│   └── shared/
│       ├── Header.js
│       ├── Loading.js
│       └── ErrorMessage.js
├── contexts/
│   ├── AuthContext.js
│   └── ContactContext.js
├── services/
│   ├── api.js
│   ├── authService.js
│   └── contactService.js
├── utils/
│   ├── tokenUtils.js
│   └── validation.js
└── styles/
    ├── globals.css
    └── components/
```

### State Management Strategy
- **AuthContext**: User authentication state, login/logout functions
- **ContactContext**: Contacts data, CRUD operations, search state
- **Local Component State**: Form inputs, UI state, loading indicators

## Backend Architecture (Node.js/Express)

### Technology Stack
- **Node.js**: JavaScript runtime environment
- **Express.js**: Web application framework
- **Mongoose**: MongoDB ODM for data modeling
- **JWT**: JSON Web Tokens for authentication
- **bcrypt**: Password hashing library
- **cors**: Cross-Origin Resource Sharing middleware

### Server Structure
```
server/
├── config/
│   ├── database.js
│   └── jwt.js
├── controllers/
│   ├── authController.js
│   ├── contactController.js
│   └── noteController.js
├── middleware/
│   ├── auth.js
│   ├── validation.js
│   └── errorHandler.js
├── models/
│   ├── User.js
│   ├── Contact.js
│   └── Note.js
├── routes/
│   ├── auth.js
│   ├── contacts.js
│   └── notes.js
├── utils/
│   ├── logger.js
│   └── helpers.js
└── server.js
```

### API Endpoints
```
Authentication:
POST /api/auth/register    - User registration
POST /api/auth/login       - User login
GET  /api/auth/profile     - Get user profile

Contacts:
GET    /api/contacts           - Get user's contacts (with pagination)
POST   /api/contacts           - Create new contact
GET    /api/contacts/:id       - Get specific contact
PUT    /api/contacts/:id       - Update contact
DELETE /api/contacts/:id       - Delete contact
GET    /api/contacts/search    - Search contacts

Notes:
GET    /api/contacts/:id/notes - Get contact's notes
POST   /api/contacts/:id/notes - Add note to contact
PUT    /api/notes/:id          - Update note
DELETE /api/notes/:id          - Delete note
```

## Database Architecture (MongoDB)

### Collections Schema

#### Users Collection
```javascript
{
  _id: ObjectId,
  username: String (unique, required),
  email: String (unique, required),
  password: String (hashed, required),
  createdAt: Date,
  updatedAt: Date
}
```

#### Contacts Collection
```javascript
{
  _id: ObjectId,
  name: String (required),
  address: String,
  phone: String,
  tags: [String],
  userId: ObjectId (ref: 'User'),
  createdAt: Date,
  updatedAt: Date
}
```

#### Notes Collection
```javascript
{
  _id: ObjectId,
  content: String (required),
  contactId: ObjectId (ref: 'Contact'),
  userId: ObjectId (ref: 'User'),
  timestamp: Date,
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

### Authentication Flow
1. User submits login credentials
2. Server validates credentials against database
3. Server generates JWT token with user ID and expiration
4. Client stores token in localStorage/sessionStorage
5. Client includes token in Authorization header for protected requests
6. Server validates token on each protected route

### Data Protection
- **Password Security**: bcrypt hashing with salt rounds
- **JWT Security**: Short expiration times with refresh token strategy
- **Input Validation**: Server-side validation for all inputs
- **CORS Configuration**: Restricted origins for production
- **Rate Limiting**: Prevent brute force attacks

## Development Environment

### Environment Variables
```
# Server
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/soul-winning
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=24h

# Client
REACT_APP_API_URL=http://localhost:5000/api
```

### Development Tools
- **nodemon**: Auto-restart server during development
- **concurrently**: Run client and server simultaneously
- **ESLint**: Code quality and consistency
- **Prettier**: Code formatting

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