# Soul Winning Contact Management App

A modern, mobile-first web application designed specifically for church soul winning teams to manage contacts and track conversations during Saturday outreach activities.

## Features

### 🎯 Core Functionality
- **Contact Management**: Add, edit, and organize contacts with names, addresses, phone numbers
- **Smart Tagging**: Categorize contacts with custom tags like "Interested", "Follow-up needed", "Prayed together"
- **Notes System**: Add timestamped notes for each contact with conversation details and prayer requests
- **Powerful Search**: Search contacts by name or within notes content
- **Mobile Optimized**: Responsive design perfect for smartphones used in the field

### 🔐 Security & Privacy
- **User Authentication**: Secure JWT-based login system
- **Data Isolation**: Each user only sees their own contacts and notes
- **Password Security**: Encrypted password storage with bcrypt
- **Secure API**: Protected routes and input validation

### 📱 User Experience
- **Intuitive Interface**: Clean, simple design requiring minimal training
- **Quick Entry**: Fast contact creation and note-taking for field use
- **Date Organization**: Notes automatically sorted by newest first
- **Touch Friendly**: Large buttons and easy navigation for mobile devices

## Technology Stack

### Frontend
- **React 18** with TypeScript
- **React Router** for navigation
- **Context API** for state management
- **Axios** for HTTP requests
- **Mobile-first responsive CSS**

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT** authentication
- **bcrypt** password hashing
- **Express Validator** for input validation

## Quick Start

### Prerequisites
- Node.js 16+
- MongoDB (local or MongoDB Atlas)
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd soul-winning-app
   ```

2. **Install all dependencies**
   ```bash
   npm run install-deps
   ```

3. **Set up environment variables**

   Create `server/.env`:
   ```bash
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/soul-winning
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   JWT_EXPIRES_IN=24h
   ```

   Create `client/.env`:
   ```bash
   REACT_APP_API_URL=http://localhost:5000/api
   ```

4. **Start MongoDB**
   ```bash
   # If using local MongoDB
   brew services start mongodb/brew/mongodb-community
   # Or start your MongoDB Atlas cluster
   ```

5. **Run the development servers**
   ```bash
   npm run dev
   ```

   This will start:
   - Backend server on http://localhost:5000
   - Frontend React app on http://localhost:3000

## Project Structure

```
soul-winning-app/
├── client/                  # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/      # React components
│   │   │   ├── auth/        # Authentication components
│   │   │   ├── contacts/    # Contact management
│   │   │   ├── notes/       # Notes system
│   │   │   ├── search/      # Search functionality
│   │   │   └── shared/      # Shared components
│   │   ├── contexts/        # React Context providers
│   │   ├── services/        # API service functions
│   │   ├── types/           # TypeScript type definitions
│   │   └── styles/          # CSS styles
│   └── package.json
├── server/                  # Express backend
│   ├── config/              # Database configuration
│   ├── controllers/         # Route handlers
│   ├── middleware/          # Custom middleware
│   ├── models/              # MongoDB schemas
│   ├── routes/              # API routes
│   └── package.json
├── .claude_docs/            # Project documentation
│   ├── requirements.md      # Detailed requirements
│   ├── architecture.md      # Technical architecture
│   └── context.md          # Development context
└── package.json            # Root package file
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile

### Contacts
- `GET /api/contacts` - Get user's contacts (with pagination)
- `POST /api/contacts` - Create new contact
- `GET /api/contacts/:id` - Get specific contact with notes
- `PUT /api/contacts/:id` - Update contact
- `DELETE /api/contacts/:id` - Delete contact
- `GET /api/contacts/search` - Search contacts by name and notes

### Notes
- `GET /api/notes/contact/:contactId` - Get contact's notes
- `POST /api/notes/contact/:contactId` - Add note to contact
- `PUT /api/notes/:id` - Update note
- `DELETE /api/notes/:id` - Delete note

## Usage Guide

### Getting Started
1. **Register** a new account or **login** with existing credentials
2. **Add your first contact** using the "Add Contact" button
3. **Fill in contact details**: name (required), phone, address, and relevant tags
4. **Add notes** immediately after conversations to capture important details

### Best Practices for Soul Winning Teams

#### Contact Entry
- Add contacts immediately after conversations while details are fresh
- Use descriptive tags: "Interested in Jesus", "Has questions", "Wants Bible study"
- Include specific address details for easy return visits

#### Note Taking
- Record conversation highlights and spiritual interest level
- Note any prayer requests or personal struggles shared
- Document follow-up commitments made ("Will visit next Saturday")
- Include family member information if relevant

#### Tagging System
Suggested tags for organizing contacts:
- **Spiritual Interest**: "Receptive", "Interested", "Resistant", "Already Christian"
- **Follow-up Type**: "Bible study", "Prayer needed", "Return visit", "Invite to church"
- **Conversation Topics**: "Health issues", "Family problems", "Job concerns"
- **Demographics**: "Young family", "Elderly", "College student"

### Mobile Usage Tips
- Use the search function to quickly find contacts before return visits
- Phone numbers are clickable for easy calling
- The interface works great on smartphones for field use
- All data syncs automatically when you have internet connection

## Development

### Available Scripts

```bash
# Development
npm run dev          # Run both client and server in development mode
npm run client       # Run only the React frontend
npm run server       # Run only the Express backend

# Installation
npm run install-deps # Install dependencies for both client and server
npm run install-client # Install only client dependencies
npm run install-server # Install only server dependencies

# Production
npm run build        # Build the React app for production
npm start           # Start the production server
```

### Development Workflow

1. **Make changes** to client or server code
2. **Test locally** using `npm run dev`
3. **Update documentation** in `.claude_docs/` if needed
4. **Commit changes** with descriptive messages

### Database Schema

#### Users Collection
```javascript
{
  _id: ObjectId,
  username: String (unique, required),
  email: String (unique, required),
  password: String (hashed),
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
  userId: ObjectId (ref: User),
  createdAt: Date,
  updatedAt: Date
}
```

#### Notes Collection
```javascript
{
  _id: ObjectId,
  content: String (required),
  contactId: ObjectId (ref: Contact),
  userId: ObjectId (ref: User),
  timestamp: Date,
  createdAt: Date,
  updatedAt: Date
}
```

## Deployment

### Environment Setup
1. Set up MongoDB Atlas cluster or prepare MongoDB server
2. Configure environment variables for production
3. Build the React application: `npm run build`
4. Deploy to your preferred hosting service (Heroku, Vercel, etc.)

### Production Environment Variables
```bash
# Server
NODE_ENV=production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/soul-winning
JWT_SECRET=your-production-jwt-secret
PORT=5000

# Client (build time)
REACT_APP_API_URL=https://your-api-domain.com/api
```

## Support

This application is designed specifically for church soul winning teams. For questions or support:

1. Check the documentation in `.claude_docs/`
2. Review the API endpoints and usage examples
3. Test with sample data before field use

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details

---

**Built with ❤️ for soul winning teams everywhere**