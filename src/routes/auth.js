/**
 * Authentication Routes
 * Handles user registration and login
 */

const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();

const { generateToken } = require('../utils/tokenService');
const { appendToFile, findInFile, filterFile } = require('../utils/storage');

const USERS_FILE = 'users.json';
const BCRYPT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS || '10');

/**
 * POST /api/auth/register
 * Register a new user
 * Body: { name, email, password, confirmPassword }
 */
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, confirmPassword } = req.body;

    // Validation
    if (!name || !email || !password || !confirmPassword) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ error: 'Passwords do not match' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Check if user already exists
    const existingUser = findInFile(USERS_FILE, (u) => u.email === email);
    if (existingUser) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS);

    // Create user object
    const newUser = {
      id: Date.now().toString(),
      name,
      email,
      password: hashedPassword,
      createdAt: new Date().toISOString(),
      lastLogin: null
    };

    // Save user to file
    const saved = appendToFile(USERS_FILE, newUser);
    if (!saved) {
      return res.status(500).json({ error: 'Failed to register user' });
    }

    // Generate token
    const token = generateToken({
      id: newUser.id,
      email: newUser.email,
      name: newUser.name
    });

    console.log(`✅ New user registered: ${email}`);

    res.status(201).json({
      success: true,
      message: 'Registration successful!',
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email
      },
      token
    });
  } catch (error) {
    console.error('Registration error:', error.message);
    res.status(500).json({ error: 'Registration failed', details: error.message });
  }
});

/**
 * POST /api/auth/login
 * Login a user
 * Body: { email, password }
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user
    const user = findInFile(USERS_FILE, (u) => u.email === email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Verify password
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate token
    const token = generateToken({
      id: user.id,
      email: user.email,
      name: user.name
    });

    console.log(`✅ User logged in: ${email}`);

    res.status(200).json({
      success: true,
      message: 'Login successful!',
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      },
      token
    });
  } catch (error) {
    console.error('Login error:', error.message);
    res.status(500).json({ error: 'Login failed', details: error.message });
  }
});

/**
 * POST /api/auth/verify-token
 * Verify if a JWT token is valid
 * Headers: Authorization: Bearer <token>
 */
router.post('/verify-token', (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    const { verifyToken } = require('../utils/tokenService');
    const decoded = verifyToken(token);

    res.status(200).json({
      success: true,
      message: 'Token is valid',
      user: decoded
    });
  } catch (error) {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
});

module.exports = router;
