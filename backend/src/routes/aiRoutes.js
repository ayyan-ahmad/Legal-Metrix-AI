const express = require('express');
const router = express.Router();
const { extractProductInfo } = require('../services/geminiService');
const protect = require('../middleware/authMiddleware');

router.post('/analyze', protect, async (req, res) => {
  try {
    const { imageUrl } = req.body;

    if (!imageUrl) {
      return res.status(400).json({ message: 'imageUrl is required' });
    }

    const extractedData = await extractProductInfo(imageUrl);

    res.json({
      message: 'Analysis complete',
      extractedData,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;