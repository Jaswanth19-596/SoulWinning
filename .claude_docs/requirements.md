# Soul Winning App - Requirements Specification

## Project Overview
A comprehensive MERN stack web application designed for church soul winning teams to manage contacts, track interactions, and collaborate through prayer requests during Saturday outreach activities. The system features enterprise-grade security with database-level encryption and modern team collaboration tools.

## Core Features

### 1. Advanced Authentication & Security System
- **User Registration**: Secure account creation with username, email, and strong password requirements
- **Multi-Modal Login**: Support for both username and encrypted email authentication
- **Enterprise Security**: JWT-based authentication with AES-256-CBC database encryption
- **Secure Token Management**: Client-side encrypted storage with automatic refresh
- **Legacy Data Support**: Automatic migration of existing unencrypted data
- **Rate Limiting**: Protection against brute force attacks
- **User Isolation**: Complete data segregation between users

### 2. Encrypted Contact Management
- **Contact Creation**: Add contacts with comprehensive information:
  - Full name (required, encrypted)
  - Physical address (encrypted)
  - Phone number (encrypted)
  - Custom tags for categorization (encrypted)
  - Prayer requests (encrypted)
- **Contact Updates**: Edit existing contact information with re-encryption
- **Contact Deletion**: Secure removal with cascade deletion of associated notes
- **Prayer Sharing**: Toggle contacts for team prayer wall sharing
- **Mobile Optimization**: Touch-friendly interface for field use

### 3. Encrypted Notes & Interaction Tracking
- **Timestamped Notes**: Attach detailed interaction records to contacts
- **Encrypted Storage**: All note content protected with AES-256-CBC encryption
- **Chronological Organization**: Notes displayed newest first
- **Edit/Delete Operations**: Full CRUD with re-encryption
- **Search Integration**: Server-side decryption for secure searching
- **Privacy Controls**: User-owned data with no admin access

### 4. Team Prayer Wall Collaboration
- **Prayer Request Sharing**: Users can share contacts to team prayer wall
- **Community Prayer**: Team members view and support shared prayer requests
- **Interactive Comments**: Add encouragement and prayer updates
- **Reaction System**: Express support with praying, amen, and heart reactions
- **Privacy Controls**: Users control what they share with the team
- **Real-time Updates**: Dynamic content updates without refresh

### 5. Advanced Search & Filtering
- **Multi-Field Search**: Search across names, addresses, phone numbers, notes, and prayer requests
- **Server-Side Decryption**: Secure search with encrypted data protection
- **Tag-Based Filtering**: Filter contacts by custom tags
- **Real-time Results**: Instant search with debounced input
- **Search Persistence**: Maintains search state across navigation
- **Performance Optimization**: Efficient searching of encrypted data

### 6. Modern Mobile-First Interface
- **Responsive Design**: Optimized for smartphones used during field work
- **Mobile Navigation**: Hamburger menu with all features accessible
- **Touch-Friendly**: Large tap targets and intuitive gestures
- **Theme System**: Light/dark mode with system preference detection
- **Smooth Animations**: Framer Motion for professional transitions
- **Offline Resilience**: Graceful handling of network connectivity issues

## Technical Requirements

### Frontend Technology Stack
- **React 18+**: Modern functional components with hooks and TypeScript
- **React Router v6**: Client-side routing and navigation management
- **Context API**: Multi-context state management (Auth, Contact, Theme)
- **Tailwind CSS**: Utility-first CSS with responsive design and dark mode
- **Framer Motion**: Smooth animations and professional transitions
- **Axios**: HTTP client with secure request/response interceptors
- **Lucide React**: Modern icon library for consistent UI
- **TypeScript**: Type safety and enhanced developer experience

### Backend Technology Stack
- **Node.js**: Async/await patterns with latest features
- **Express.js**: Web framework with comprehensive middleware
- **Mongoose**: MongoDB ODM with encryption middleware
- **JWT**: Stateless authentication with secure token management
- **bcrypt**: Password hashing with configurable salt rounds
- **crypto**: Built-in AES-256-CBC encryption for database security
- **CORS**: Environment-based cross-origin configuration
- **Express Validator**: Input validation and sanitization

### Security Architecture
- **Database Encryption**: AES-256-CBC encryption for all sensitive data
- **Client-Side Security**: Encrypted browser storage with secure fingerprinting
- **Authentication**: JWT with refresh tokens and rate limiting
- **Input Validation**: Multi-layer sanitization and validation
- **Error Handling**: Sanitized error responses to prevent information leakage
- **Environment Security**: Secure configuration management

### Database Schema with Encryption
- **Users Collection**:
  - username (String, unique, unencrypted for login)
  - email (String, unique, AES-256-CBC encrypted)
  - password (String, bcrypt hashed)
  - createdAt, updatedAt (Date)

- **Contacts Collection**:
  - name (String, required, AES-256-CBC encrypted)
  - address (String, AES-256-CBC encrypted)
  - phone (String, AES-256-CBC encrypted)
  - tags (Array, each tag AES-256-CBC encrypted)
  - prayerRequest (String, AES-256-CBC encrypted)
  - sharedToPrayerList (Boolean, unencrypted for querying)
  - userId (ObjectId, reference, unencrypted)
  - createdAt, updatedAt (Date)

- **Notes Collection**:
  - content (String, required, AES-256-CBC encrypted)
  - contactId (ObjectId, reference, unencrypted)
  - userId (ObjectId, reference, unencrypted)
  - timestamp, createdAt, updatedAt (Date)

- **PrayerComments Collection**:
  - content (String, prayer comment text)
  - contactId (ObjectId, reference to Contact)
  - userId (ObjectId, reference to User)
  - reaction (String, enum: 'praying', 'amen', 'heart')
  - createdAt, updatedAt (Date)

## User Stories

### As a Soul Winner, I want to:
1. **Quick Contact Entry**: Rapidly add new contacts with encrypted data storage while in the field
2. **Immediate Notes**: Add conversation details and prayer requests with automatic encryption
3. **Advanced Search**: Find contacts quickly across all fields with server-side decryption
4. **Tag Organization**: Categorize contacts with encrypted tags for follow-up prioritization
5. **Mobile Access**: Use the responsive interface on my smartphone during outreach
6. **Enterprise Security**: Trust that all sensitive data is encrypted and protected
7. **Team Collaboration**: Share prayer requests with team members through the prayer wall
8. **Privacy Control**: Choose what information to share while keeping personal data private

### As a Team Leader, I want to:
1. **Prayer Coordination**: View shared prayer requests from team members
2. **Team Support**: Add encouragement and prayer updates to shared requests
3. **Community Building**: Foster team unity through collaborative prayer features
4. **Data Isolation**: Ensure each team member's data remains private and secure

## Performance Requirements
- **Page Load Times**: Under 2 seconds on mobile networks with encryption overhead
- **Search Performance**: Results returned within 300ms including decryption time
- **Scalability**: Support for 5000+ contacts per user with encrypted storage
- **Mobile Optimization**: Smooth performance on smartphones with limited resources
- **Network Resilience**: Graceful degradation on poor network connections
- **Animation Performance**: Smooth 60fps animations using Framer Motion

## Security Requirements
- **Password Security**: Minimum 8 characters with complexity requirements
- **Database Encryption**: AES-256-CBC encryption for all sensitive data fields
- **Token Management**: JWT with secure expiration and automatic refresh
- **API Protection**: All routes protected with authentication middleware
- **Input Sanitization**: Multi-layer validation to prevent injection attacks
- **Environment Security**: Secure key management with rotation capabilities
- **Client Security**: Encrypted browser storage with secure fingerprinting
- **Legacy Support**: Automatic migration of unencrypted existing data

## Usability Requirements
- **Intuitive Design**: Minimal learning curve with consistent UI patterns
- **Visual Feedback**: Clear loading states and success/error indicators
- **Mobile UX**: Touch-friendly interface optimized for field use
- **Theme Support**: Light/dark mode with system preference detection
- **Error Handling**: Helpful error messages without exposing security details
- **Accessibility**: WCAG compliant design for inclusive access
- **Responsive Layout**: Seamless experience across all device sizes

## API Requirements

### Authentication Endpoints
- `POST /api/auth/register` - User registration with encrypted email
- `POST /api/auth/login` - Multi-modal login (username or encrypted email)
- `GET /api/auth/profile` - User profile with decrypted data

### Contact Management Endpoints
- `GET /api/contacts` - Paginated contact list with decryption
- `POST /api/contacts` - Create contact with automatic encryption
- `GET /api/contacts/:id` - Get contact with notes (decrypted)
- `PUT /api/contacts/:id` - Update contact with re-encryption
- `DELETE /api/contacts/:id` - Delete contact and cascade notes
- `GET /api/contacts/search` - Advanced search with server-side decryption

### Notes Management Endpoints
- `GET /api/contacts/:id/notes` - Get contact notes (decrypted)
- `POST /api/contacts/:id/notes` - Add note with encryption
- `PUT /api/notes/:id` - Update note with re-encryption
- `DELETE /api/notes/:id` - Delete note securely

### Prayer Wall Endpoints
- `GET /api/prayer-wall` - Get shared prayer requests (decrypted)
- `GET /api/prayer-wall/:contactId/comments` - Get prayer comments
- `POST /api/prayer-wall/:contactId/comments` - Add prayer comment/reaction
- `PUT /api/prayer-wall/comments/:commentId` - Update prayer comment
- `DELETE /api/prayer-wall/comments/:commentId` - Delete prayer comment
- `PATCH /api/prayer-wall/contacts/:contactId/toggle` - Toggle prayer sharing

## Development Requirements
- **Environment Variables**: Secure configuration for all environments
- **Encryption Keys**: Automated key generation and validation
- **Testing**: Startup encryption testing and validation
- **Documentation**: Comprehensive code documentation and API specs
- **Error Logging**: Centralized logging without exposing sensitive data
- **Development Tools**: Hot reloading and debugging capabilities