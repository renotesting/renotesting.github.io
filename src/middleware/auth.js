/**
 * Authentication Middleware
 * Verifies JWT tokens and protects routes
 */

const { verifyToken, extractToken } = require('../utils/tokenService');
const { findInFile } = require('../utils/storage');

const USERS_FILE = 'users.json';

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

/**
 * Use after verifyAuth. The role is read from storage on every request, not from the
 * token, so revoking admin takes effect immediately rather than when the token expires.
 */
function requireAdmin(req, res, next) {
  try {
    const user = findInFile(USERS_FILE, (u) => u.id === req.user.id);

    if (!user || user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    next();
  } catch (error) {
    next(error);
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
  requireAdmin,
  optionalAuth
};
