const express = require('express');
const router = express.Router();
const upload = require('../config/multer');
const protect = require('../middleware/authMiddleware');

// 'image' wahi field name hai jo Postman form-data mein use karoge
router.post('/', protect, upload.single('image'), (req, res) => {
  console.log('Multer file object:', req.file);
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }
  res.json({
    message: 'Image uploaded successfully',
    imageUrl: req.file.path,
  });
});

module.exports = router;
