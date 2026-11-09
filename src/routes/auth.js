/**
 * Authentication Routes
 * Handles user registration and login
 */

const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();

const { generateToken, extractToken, verifyToken } = require('../utils/tokenService');
const { appendToFile, findInFile, updateInFile } = require('../utils/storage');
const { loginLimiter, registerLimiter } = require('../middleware/rateLimit');

const USERS_FILE = 'users.json';
const BCRYPT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS || '10', 10);
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;
const MAX_PASSWORD_LENGTH = 128;
const MAX_NAME_LENGTH = 100;
const MAX_EMAIL_LENGTH = 254;

function isNonEmptyString(value) {
  return typeof value === 'string' && value.length > 0;
}

router.post('/register', registerLimiter, async (req, res) => {
  try {
    const { name, email, password, confirmPassword } = req.body;

    if (![name, email, password, confirmPassword].every(isNonEmptyString)) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    if (name.length > MAX_NAME_LENGTH) {
      return res.status(400).json({ success: false, message: 'Name is too long' });
    }

    if (email.length > MAX_EMAIL_LENGTH || !EMAIL_REGEX.test(email)) {
      return res.status(400).json({ success: false, message: 'Invalid email format' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'Passwords do not match' });
    }

    if (password.length < MIN_PASSWORD_LENGTH) {
      return res.status(400).json({ success: false, message: `Password must be at least ${MIN_PASSWORD_LENGTH} characters` });
    }

    if (password.length > MAX_PASSWORD_LENGTH) {
      return res.status(400).json({ success: false, message: `Password must be at most ${MAX_PASSWORD_LENGTH} characters` });
    }

    const existingUser = findInFile(USERS_FILE, (u) => u.email === email);
    if (existingUser) {
      return res.status(409).json({ success: false, message: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS);

    const newUser = {
      id: Date.now().toString(),
      name,
      email,
      password: hashedPassword,
      // Fixed here, never taken from the request. Promotion is done with scripts/make-admin.js.
      role: 'user',
      createdAt: new Date().toISOString(),
      lastLogin: null
    };

    const saved = appendToFile(USERS_FILE, newUser);
    if (!saved) {
      return res.status(500).json({ success: false, message: 'Failed to register user' });
    }

    const token = generateToken({
      id: newUser.id,
      email: newUser.email,
      name: newUser.name
    });

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
    res.status(500).json({ success: false, message: 'Registration failed' });
  }
});

router.post('/login', loginLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!isNonEmptyString(email) || !isNonEmptyString(password)) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const user = findInFile(USERS_FILE, (u) => u.email === email);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    // Bookkeeping only: a failed write shouldn't stop someone logging in.
    updateInFile(USERS_FILE, (u) => u.id === user.id, { lastLogin: new Date().toISOString() });

    const token = generateToken({
      id: user.id,
      email: user.email,
      name: user.name
    });

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
    res.status(500).json({ success: false, message: 'Login failed' });
  }
});

router.post('/verify-token', (req, res) => {
  try {
    const token = extractToken(req.headers.authorization);
    if (!token) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const decoded = verifyToken(token);

    res.status(200).json({
      success: true,
      message: 'Token is valid',
      user: {
        id: decoded.id,
        email: decoded.email,
        name: decoded.name,
        iat: decoded.iat,
        exp: decoded.exp
      }
    });
  } catch (error) {
    res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
});

module.exports = router;
