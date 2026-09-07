/**
 * RenoFitness Server - Main Entry Point
 * Converts static website to dynamic Node.js/Express application
 * with user authentication and email capabilities
 */

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const path = require('path');
require('dotenv').config();

// Import routes
const authRoutes = require('./src/routes/auth');
const emailRoutes = require('./src/routes/email');
const contactRoutes = require('./src/routes/contact');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// ============================================================================
// MIDDLEWARE
// ============================================================================

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://renotesting.github.io', 'https://www.renotesting.github.io']
    : '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parser middleware
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

// ============================================================================
// STATIC FILES - Serve public directory
// ============================================================================
app.use(express.static(path.join(__dirname, 'public')));

// ============================================================================
// API ROUTES
// ============================================================================

// Authentication routes (register, login)
app.use('/api/auth', authRoutes);

// Email routes (subscribe to newsletter, send newsletter)
app.use('/api/email', emailRoutes);

// Contact form routes
app.use('/api/contact', contactRoutes);

// ============================================================================
// HEALTH CHECK ENDPOINT
// ============================================================================
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// ============================================================================
// FALLBACK ROUTES - Serve index.html for SPA routing
// ============================================================================
app.get('*', (req, res) => {
  // Don't serve index.html for API routes
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ============================================================================
// ERROR HANDLING MIDDLEWARE
// ============================================================================
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    status: err.status || 500,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// ============================================================================
// START SERVER
// ============================================================================
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════════════╗
║          🏋️  RenoFitness Server Started Successfully           ║
╚════════════════════════════════════════════════════════════════╝

📍 Server running on: http://localhost:${PORT}
🌍 Environment: ${process.env.NODE_ENV || 'development'}
📧 Email Service: ${process.env.EMAIL_USER || 'Not configured'}

API Endpoints:
  📝 POST   /api/auth/register          - Register new user
  🔑 POST   /api/auth/login             - Login user
  📬 POST   /api/email/subscribe        - Subscribe to newsletter
  📧 POST   /api/email/send-newsletter  - Send newsletter (admin)
  💬 POST   /api/contact                - Submit contact form
  ❤️  GET    /api/health                 - Health check

Documentation:
  📖 Check /README.md for detailed setup instructions
  📋 Check /MIGRATION_PLAN.md for migration overview

Tip: Use Postman or curl to test API endpoints
  `);
});

module.exports = app;
