const express = require('express');
const router = express.Router();
const {
  createInspection,
  getInspections,
  getInspectionById,
} = require('../controllers/inspectionController');
const protect = require('../middleware/authMiddleware');
const { upload } = require('../config/multer');

router.post('/', protect, upload.single('image'), createInspection);
router.get('/', protect, getInspections);
router.get('/:id', protect, getInspectionById);

module.exports = router;