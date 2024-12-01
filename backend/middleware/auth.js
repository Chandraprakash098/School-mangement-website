const jwt = require('jsonwebtoken');

module.exports = function(req, res, next) {
  // Get token from header
  const token = req.header('x-auth-token');

  // Check if no token
  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  // Verify token
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    console.log('Decoded Token:', decoded);
    console.log('User ID from Token:', decoded.user.id);
    // Add user from payload
    req.user = decoded.user;
    next();
  } catch (err) {
    console.error('Token Verification Error:', err);
    res.status(401).json({ message: 'Token is not valid' });
  }
};
