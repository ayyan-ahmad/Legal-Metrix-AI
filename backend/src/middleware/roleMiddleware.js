const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    // req.user pehle se set hai kyunki ye middleware authMiddleware ke BAAD chalega
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied: insufficient permissions' });
    }
    next();
  };
};

module.exports = authorize;