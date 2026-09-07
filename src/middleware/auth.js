/**
 * Authentication Middleware
 * Verifies JWT tokens and protects routes
 */

const { verifyToken, extractToken } = require('../utils/tokenService');

/**
 * Middleware to verify JWT token
 * Can be used to protect routes
 * Usage: router.get('/protected', verifyAuth, handler)
 */
function verifyAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        error: 'No authorization header provided',
        code: 'NO_AUTH_HEADER'
      });
    }

    const token = extractToken(authHeader);

    if (!token) {
      return res.status(401).json({
        error: 'Invalid authorization format. Use: Bearer <token>',
        code: 'INVALID_AUTH_FORMAT'
      });
    }

    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    if (error.message === 'Token has expired') {
      return res.status(401).json({
        error: 'Token has expired',
        code: 'TOKEN_EXPIRED'
      });
    }

    if (error.message === 'Invalid token') {
      return res.status(401).json({
        error: 'Invalid token',
        code: 'INVALID_TOKEN'
      });
    }

    console.error('Auth middleware error:', error.message);
    res.status(401).json({
      error: 'Authentication failed',
      code: 'AUTH_FAILED'
    });
  }
}

/**
 * Middleware to check if user is authenticated (optional)
 * Adds user info if token exists, but doesn't block request
 */
function optionalAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader) {
      const token = extractToken(authHeader);
      if (token) {
        const decoded = verifyToken(token);
        req.user = decoded;
      }
    }

    next();
  } catch (error) {
    // Don't block request, just skip user assignment
    next();
  }
}

module.exports = {
  verifyAuth,
  optionalAuth
};
