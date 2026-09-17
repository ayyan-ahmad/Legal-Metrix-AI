const adminOnly = (req, res, next) => {
  // 'protect' middleware pehle chal chuka hoga, isliye req.user available hai
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Admins only.' });
  }
  next();
};

module.exports = adminOnly;