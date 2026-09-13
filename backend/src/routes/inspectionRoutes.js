const express = require('express');
const router = express.Router();
const {
  createInspection,
  getInspections,
  getInspectionById,
  generateSeizureMemo,
} = require('../controllers/inspectionController');
const protect = require('../middleware/authMiddleware');
const { upload } = require('../config/multer');

router.post('/', protect, upload.array('images', 5), createInspection);
router.get('/', protect, getInspections);
router.get('/:id', protect, getInspectionById);
router.post('/:id/seizure-memo', protect, generateSeizureMemo);

module.exports = router;