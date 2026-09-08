const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/authController');
const protect = require('../middleware/authMiddleware');
const authorize = require('../middleware/roleMiddleware');

router.post('/register', register);
router.post('/login', login);
//Test route - koi bhi logged-in user access kar sakta hai
router.get('/me', protect, (req, res) => {
  res.json({ message: 'You are authenticated', user: req.user });
});

// Test route - sirf admin access kar sakta hai
router.get('/admin-only', protect, authorize('admin'), (req, res) => {
  res.json({ message: 'Welcome Admin!' });
});



module.exports = router;