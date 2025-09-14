require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');
const errorHandler = require('./middleware/errorHandler');

const authRoutes = require('./routes/auth');
const contactRoutes = require('./routes/contacts');
const noteRoutes = require('./routes/notes');
const prayerWallRoutes = require('./routes/prayerWall');

const app = express();

connectDB();

// CORS configuration - simplified for development
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins =
      process.env.NODE_ENV === 'production'
        ? [process.env.CLIENT_URL, 'https://soul-winning-backend.vercel.app'].filter(Boolean)
        : [
            'http://localhost:3000',
            'http://127.0.0.1:3000',
            'https://soul-winning-backend.vercel.app',
            process.env.CLIENT_URL
          ].filter(Boolean);

    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) {
      return callback(null, true);
    }

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      // Temporary: Allow Vercel deployments for testing
      if (origin && origin.includes('vercel.app')) {
        console.log(`⚠️ Temporary CORS allow for: ${origin}`);
        callback(null, true);
      } else {
        console.log(`❌ CORS blocked: ${origin}. Allowed: ${allowedOrigins.join(', ')}`);
        callback(new Error('Not allowed by CORS'));
      }
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'x-request-id',
  ],
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', authRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/prayer-wall', prayerWallRoutes);

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Soul Winning API is running',
    timestamp: new Date().toISOString(),
  });
});

app.use(errorHandler);

// Catch-all route for 404s
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'API route not found',
  });
});

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log('🚀 ========================================');
  console.log('🚀 SOUL WINNING API SERVER STARTED');
  console.log('🚀 ========================================');
  console.log(`✅ Environment: ${process.env.NODE_ENV}`);
  console.log(`✅ Server running on: http://localhost:${PORT}`);
  console.log(`✅ Health check: http://localhost:${PORT}/api/health`);
  console.log(
    `✅ MongoDB URI: ${process.env.MONGODB_URI.replace(
      /\/\/.*@/,
      '//***:***@'
    )}`
  );
  console.log('🚀 ========================================');
});

process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  server.close(() => {
    process.exit(1);
  });
});
