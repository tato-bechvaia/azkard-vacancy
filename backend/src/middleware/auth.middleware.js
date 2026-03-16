const { verifyToken } = require('../utils/jwt');

const protect = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer '))
    return res.status(401).json({ message: 'Unauthorised' });

  try {
    req.user = verifyToken(header.split(' ')[1]);
    next();
  } catch {
    res.status(401).json({ message: 'Invalid token' });
  }
};

const requireRole = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role))
    return res.status(403).json({ message: 'Forbidden' });
  next();
};

module.exports = { protect, requireRole };