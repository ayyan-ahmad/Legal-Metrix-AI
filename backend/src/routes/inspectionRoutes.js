const express = require('express');
const router = express.Router();
const {
  createInspection,
  getInspections,
  getInspectionById,
  generateSeizureMemo,
  submitForRecord,
  reviewSubmission,
  getSubmittedInspections,
} = require('../controllers/inspectionController');
const protect = require('../middleware/authMiddleware');
const { upload } = require('../config/multer');

router.post('/', protect, upload.array('images', 5), createInspection);
router.get('/submissions', protect, getSubmittedInspections);
router.get('/', protect, getInspections);
router.get('/:id', protect, getInspectionById);
router.post('/:id/seizure-memo', protect, generateSeizureMemo);
router.post('/:id/submit', protect, submitForRecord);
router.post('/:id/review', protect, reviewSubmission);

module.exports = router;
