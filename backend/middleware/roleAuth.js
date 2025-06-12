/**
 * Role-based authorization middleware
 * Checks if the authenticated user has the required role(s)
 * @param {Array|String} roles - Single role or array of allowed roles
 */
module.exports = (roles) => {
  // Convert single role to array
  if (typeof roles === 'string') {
    roles = [roles];
  }
  
  return (req, res, next) => {
    // Make sure user is authenticated first
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    // Check if user role is in the allowed roles
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: 'You do not have permission to perform this action' 
      });
    }
    
    // User has required role, proceed
    next();
  };
}; 