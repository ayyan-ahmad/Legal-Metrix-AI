const express = require('express');
const router = express.Router();

// Existing middleware — sahi paths use kar rahe hain
const protect = require('../../middleware/authMiddleware');
const authorize = require('../../middleware/roleMiddleware');

const {
  getRules,
  createRule,
  updateRule,
  deleteRule,
} = require('../../controllers/admin/ruleController');

// Sab logged-in users rules dekh sakte hain (officers ko bhi reference chahiye)
router.get('/', protect, getRules);

// Sirf admin create / update / delete kar sakta hai
router.post('/', protect, authorize('admin'), createRule);
router.patch('/:id', protect, authorize('admin'), updateRule);
router.delete('/:id', protect, authorize('admin'), deleteRule);

module.exports = router;
