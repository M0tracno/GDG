const jwt = require('jsonwebtoken');

/**
 * Authentication middleware
 * Verifies JSON Web Token and sets req.user for authenticated routes
 */
const auth = (req, res, next) => {
  try {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');

    // Check if no token
    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Add user from payload
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

/**
 * Parent authentication middleware
 * Specifically for parent authentication with type validation
 */
const parentAuth = (req, res, next) => {
  try {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');

    // Check if no token
    if (!token) {
      return res.status(401).json({ 
        success: false,
        message: 'No authentication token provided' 
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');

    // Check if token is for parent
    if (decoded.type !== 'parent') {
      return res.status(403).json({ 
        success: false,
        message: 'Invalid token type for parent access' 
      });
    }

    // Add user from payload
    req.user = decoded;
    next();
  } catch (err) {
    console.error('Parent auth error:', err);
    res.status(401).json({ 
      success: false,
      message: 'Invalid or expired authentication token' 
    });
  }
};

module.exports = auth;
module.exports.parentAuth = parentAuth; 