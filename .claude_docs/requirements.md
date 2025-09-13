# Soul Winning Contact Management System - Requirements

## Project Overview
A comprehensive web application for managing contacts during Saturday soul winning outreach activities. The system enables church teams to effectively track, organize, and follow up with individuals they encounter during evangelistic outreach.

## Core Features

### 1. User Authentication System
- **User Registration**: New users can create accounts with username, email, and password
- **Secure Login**: JWT-based authentication with bcrypt password hashing
- **Session Management**: Persistent login sessions with token refresh
- **User Isolation**: Each user can only access their own contacts and notes

### 2. Contact Management
- **Contact Creation**: Add new contacts with essential information:
  - Full name (required)
  - Physical address
  - Phone number
  - Custom tags for categorization (e.g., "Interested", "Follow-up needed", "Prayed together")
- **Contact Updates**: Edit existing contact information
- **Contact Deletion**: Remove contacts with confirmation
- **Bulk Operations**: Select and manage multiple contacts

### 3. Notes System
- **Add Notes**: Attach timestamped notes to any contact
- **Date Ordering**: Notes displayed in descending chronological order (newest first)
- **Rich Content**: Support for detailed notes about conversations and interactions
- **Edit/Delete**: Modify or remove notes as needed
- **Search Integration**: Notes content included in search functionality

### 4. Search and Filtering
- **Name Search**: Quick lookup by contact name
- **Tag Filtering**: Filter contacts by assigned tags
- **Notes Search**: Search within notes content
- **Combined Search**: Multiple criteria search capabilities
- **Real-time Results**: Instant search results as user types

### 5. Mobile-First Interface
- **Responsive Design**: Optimized for mobile devices used in the field
- **Touch-Friendly**: Large buttons and easy navigation
- **Offline Considerations**: Graceful handling of network issues
- **Fast Loading**: Optimized performance for mobile networks

## Technical Requirements

### Frontend Specifications
- React 18+ with functional components and hooks
- React Router for single-page application navigation
- Responsive CSS design (mobile-first approach)
- Form validation with user-friendly error messages
- JWT token management in browser storage
- Axios for HTTP requests with interceptors

### Backend Specifications
- Node.js with Express.js framework
- MongoDB with Mongoose ODM
- JWT authentication middleware
- bcrypt for password security
- CORS configuration for cross-origin requests
- Input validation and sanitization
- Comprehensive error handling

### Database Schema
- **Users Collection**: username, email, hashedPassword, createdAt
- **Contacts Collection**: name, address, phone, tags[], userId, createdAt, updatedAt
- **Notes Collection**: content, contactId, userId, timestamp

## User Stories

### As a Soul Winner, I want to:
1. **Quick Contact Entry**: Rapidly add new contacts while in the field
2. **Immediate Notes**: Add conversation details and prayer requests instantly
3. **Easy Search**: Find contacts quickly by name or previous notes
4. **Tag Organization**: Categorize contacts for follow-up prioritization
5. **Mobile Access**: Use the system on my phone during outreach
6. **Secure Data**: Know that contact information is protected and private

## Performance Requirements
- Page load times under 3 seconds on mobile networks
- Search results returned within 500ms
- Support for 1000+ contacts per user
- Responsive interface across all device sizes

## Security Requirements
- Password strength requirements (minimum 8 characters)
- JWT tokens with reasonable expiration times
- Protected API routes requiring authentication
- Input sanitization to prevent injection attacks
- Secure password storage with bcrypt hashing

## Usability Requirements
- Intuitive interface requiring minimal training
- Clear visual feedback for all user actions
- Graceful error handling with helpful messages
- Consistent design patterns throughout the application