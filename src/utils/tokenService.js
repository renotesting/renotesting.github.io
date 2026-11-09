/**
 * JWT Token Service
 * Handles generation and verification of JWT tokens
 */

const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRATION = process.env.JWT_EXPIRATION || '7d';

function requireSecret() {
  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not configured');
  }
}

function generateToken(payload) {
  requireSecret();
  try {
    return jwt.sign(payload, JWT_SECRET, {
      expiresIn: JWT_EXPIRATION,
      algorithm: 'HS256'
    });
  } catch (error) {
    console.error('Error generating token:', error.message);
    throw error;
  }
}

function verifyToken(token) {
  requireSecret();
  try {
    return jwt.verify(token, JWT_SECRET, {
      algorithms: ['HS256']
    });
  } catch (error) {
    if (error.name === 'TokenExpiredError' || error.name === 'JsonWebTokenError') {
      throw new Error('Invalid or expired token');
    }
    throw error;
  }
}

// Signed with a derived key so an unsubscribe token from an email can never pass
// verifyToken() and be used as a login token.
function unsubscribeKey() {
  requireSecret();
  return crypto.createHmac('sha256', JWT_SECRET).update('unsubscribe').digest('hex');
}

// No expiry: unsubscribe links in old emails must keep working. Carries only the
// subscriber id so the email address never ends up in a URL.
function generateUnsubscribeToken(subscriberId) {
  return jwt.sign({ sid: subscriberId }, unsubscribeKey(), { algorithm: 'HS256' });
}

function verifyUnsubscribeToken(token) {
  try {
    const decoded = jwt.verify(token, unsubscribeKey(), { algorithms: ['HS256'] });
    if (!decoded.sid) {
      throw new Error('Token has no subscriber id');
    }
    return decoded.sid;
  } catch (error) {
    throw new Error('Invalid unsubscribe token');
  }
}

function extractToken(authHeader) {
  if (!authHeader) return null;

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null;
  }

  return parts[1];
}

module.exports = {
  generateToken,
  verifyToken,
  generateUnsubscribeToken,
  verifyUnsubscribeToken,
  extractToken
};
