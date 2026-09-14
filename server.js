/**
 * RenoFitness Server - Main Entry Point
 * Serves the Astro static build and the Express API.
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const fs = require('fs');
const https = require('https');
require('dotenv').config();

const { initializeEmailService } = require('./src/utils/emailService');
const authRoutes = require('./src/routes/auth');
const emailRoutes = require('./src/routes/email');
const contactRoutes = require('./src/routes/contact');

if (!process.env.JWT_SECRET) {
  console.error('JWT_SECRET is required. Set it in .env and restart.');
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 3000;
const distPath = path.join(__dirname, 'dist');

function parseCorsOrigins() {
  const raw = process.env.CORS_ORIGINS || 'http://localhost:4321,http://localhost:3000';
  return raw.split(',').map((origin) => origin.trim()).filter(Boolean);
}

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", 'https://www.googletagmanager.com'],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com'],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'", 'https://www.google-analytics.com', 'https://www.googletagmanager.com'],
      frameSrc: ["'self'", 'https://www.googletagmanager.com']
    }
  }
}));

app.use(cors({
  origin: parseCorsOrigins(),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

app.use('/api/auth', authRoutes);
app.use('/api/email', emailRoutes);
app.use('/api/contact', contactRoutes);

app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
}

app.use((req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ success: false, message: 'API endpoint not found' });
  }

  const notFoundPage = path.join(distPath, '404.html');
  if (fs.existsSync(notFoundPage)) {
    return res.status(404).sendFile(notFoundPage);
  }

  res.status(404).type('text/plain').send('Not found');
});

app.use((err, req, res, next) => {
  console.error(`Error ${req.method} ${req.path}:`, err.message);
  res.status(err.status || 500).json({
    success: false,
    message: 'Internal Server Error'
  });
});

initializeEmailService();

function onListen(protocol) {
  console.log(`RenoFitness server listening on ${protocol}://localhost:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
}

const keyPath = path.join(__dirname, 'key.pem');
const certPath = path.join(__dirname, 'cert.pem');

if (fs.existsSync(keyPath) && fs.existsSync(certPath)) {
  https.createServer({
    key: fs.readFileSync(keyPath),
    cert: fs.readFileSync(certPath)
  }, app).listen(PORT, () => onListen('https'));
} else {
  app.listen(PORT, () => onListen('http'));
}

module.exports = app;
