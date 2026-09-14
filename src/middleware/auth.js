/**
 * Authentication Middleware
 * Verifies JWT tokens and protects routes
 */

const { verifyToken, extractToken } = require('../utils/tokenService');

function verifyAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const token = extractToken(authHeader);

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token'
    });
  }
}

function optionalAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader) {
      const token = extractToken(authHeader);
      if (token) {
        req.user = verifyToken(token);
      }
    }

    next();
  } catch (error) {
    next();
  }
}

module.exports = {
  verifyAuth,
  optionalAuth
};
