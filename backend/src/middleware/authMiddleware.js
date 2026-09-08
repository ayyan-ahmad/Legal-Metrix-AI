const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {
  // Token usually "Authorization" header mein aata hai, format: "Bearer <token>"
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token, access denied' });
  }

  const token = authHeader.split(' ')[1]; // "Bearer" hata ke sirf token nikal rahe hain

  try {
    // jwt.verify token ko decode karta hai aur check karta hai
    // ki ye humare JWT_SECRET se hi bana tha (matlab genuine hai, fake nahi)
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, role } - ab aage har controller mein req.user available hoga
    next(); // "sab theek hai, aage jaane do"
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

module.exports = protect;