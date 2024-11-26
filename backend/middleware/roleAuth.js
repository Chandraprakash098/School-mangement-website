const roleAuth = (roles) => {
    return (req, res, next) => {
      // Check if user's role is authorized
      if (!roles.includes(req.user.role)) {
        return res.status(403).json({ message: 'Access denied' });
      }
      next();
    };
  };
  
  module.exports = roleAuth;