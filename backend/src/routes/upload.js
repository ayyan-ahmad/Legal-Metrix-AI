const express = require('express');
const router = express.Router();
const { upload, uploadToCloudinary } = require('../config/multer');
const protect = require('../middleware/authMiddleware');

// 'image' wahi field name hai jo form-data mein use karoge
router.post('/', protect, upload.single('image'), async (req, res) => {
  console.log('Multer file object:', req.file);
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }
  try {
    const imageUrl = await uploadToCloudinary(
      req.file.buffer,
      `${Date.now()}-${req.file.originalname}`
    );
    res.json({
      message: 'Image uploaded successfully',
      imageUrl,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
