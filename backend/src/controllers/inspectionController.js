const Inspection = require('../models/Inspection');
const { extractProductInfo } = require('../services/geminiService');
const { checkCompliance } = require('../utils/ruleEngine');
const { uploadToCloudinary } = require('../config/multer');

exports.createInspection = async (req, res) => {
  try {
    const { productName } = req.body;
    console.log('\n========== NEW INSPECTION REQUEST ==========');
    console.log('Product Name:', productName);
    console.log('File received:', req.file ? `${req.file.originalname} (${req.file.size} bytes)` : 'NO FILE');

    if (!req.file) {
      return res.status(400).json({ message: 'Product image is required' });
    }

    // Step 0: Upload to Cloudinary
    console.log('\n[Step 0] Uploading image to Cloudinary...');
    const imageUrl = await uploadToCloudinary(
      req.file.buffer,
      `${Date.now()}-${req.file.originalname}`
    );
    console.log('[Step 0] ✅ Cloudinary URL:', imageUrl);

    // Step A: Gemini extraction
    console.log('\n[Step A] Calling Gemini for product info extraction...');
    const extractedData = await extractProductInfo(imageUrl);
    console.log('[Step A] ✅ Extracted Data:', JSON.stringify(extractedData, null, 2));

    // Step B: Rule engine compliance check
    console.log('\n[Step B] Running compliance rule engine...');
    const { complianceScore, violations, status } = await checkCompliance(extractedData);
    console.log('[Step B] ✅ Status:', status, '| Score:', complianceScore, '| Violations:', violations.length);

    // Step C: Save to DB
    console.log('\n[Step C] Saving inspection to MongoDB...');
    const inspection = await Inspection.create({
      productName,
      images: [imageUrl],
      extractedData,
      violations,
      complianceScore,
      status,
      officer: req.user.id,
    });
    console.log('[Step C] ✅ Saved. Inspection ID:', inspection._id);
    console.log('============================================\n');

    res.status(201).json({
      message: 'Inspection completed',
      inspection,
    });
  } catch (error) {
    console.error('\n❌ createInspection FAILED');
    console.error('Message:', error.message);
    console.error('Stack:', error.stack);
    console.error('============================================\n');
    res.status(500).json({ message: error.message });
  }
};



exports.getInspections = async (req, res) => {
  try {
    const inspections = await Inspection.find().populate('officer', 'name email').sort({ createdAt: -1 });
    res.json(inspections);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getInspectionById = async (req, res) => {
  try {
    const inspection = await Inspection.findById(req.params.id).populate('officer', 'name email');
    if (!inspection) {
      return res.status(404).json({ message: 'Inspection not found' });
    }
    res.json(inspection);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};