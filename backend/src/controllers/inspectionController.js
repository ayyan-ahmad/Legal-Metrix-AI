const Inspection = require('../models/Inspection');
const { extractFromMultipleImages } = require('../services/geminiService');
const { checkCompliance } = require('../utils/ruleEngine');
const { uploadToCloudinary } = require('../config/multer');

exports.createInspection = async (req, res) => {
  try {
    const { productName } = req.body;
    console.log('\n========== NEW INSPECTION REQUEST ==========');
    console.log('Product Name:', productName);
    console.log('Files received:', req.files ? req.files.length : 0);

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'At least one product image is required' });
    }

    // Step 0: Sab images ko Cloudinary pe upload karo (ek-ek karke, sequentially)
    // Kyun sequential? Parallel Promise.all() bhi chalega yahan (Cloudinary rate-limit
    // itna strict nahi hota jitna Gemini free-tier), lekin consistency ke liye
    // aur logs clean rakhne ke liye hum yahan bhi ek-ek karke upload kar rahe hain.
    console.log('\n[Step 0] Uploading images to Cloudinary...');
    const imageUrls = [];
    for (let i = 0; i < req.files.length; i++) {
      const file = req.files[i];
      const url = await uploadToCloudinary(file.buffer, `${Date.now()}-${i}-${file.originalname}`);
      imageUrls.push(url);
      console.log(`[Step 0] ✅ Image ${i + 1}/${req.files.length} uploaded:`, url);
    }

    // Step A: Gemini extraction - har image ko SEQUENTIALLY process karta hai,
    // ek fail ho toh baaki continue rahenge (rate-limit safe)
    console.log('\n[Step A] Calling Gemini for multi-image extraction...');
    const imageBuffers = req.files.map((file) => file.buffer);
    const { extractedData, processedCount, totalCount, failedImages } =
      await extractFromMultipleImages(imageBuffers);
    console.log(
      `[Step A] ✅ Processed ${processedCount}/${totalCount} images.`,
      failedImages.length > 0 ? `Failed: ${JSON.stringify(failedImages)}` : ''
    );
    console.log('[Step A] Merged Extracted Data:', JSON.stringify(extractedData, null, 2));

    // Step B: Rule engine compliance check
    console.log('\n[Step B] Running compliance rule engine...');
    const { complianceScore, violations, status } = await checkCompliance(extractedData);
    console.log('[Step B] ✅ Status:', status, '| Score:', complianceScore, '| Violations:', violations.length);

    // Step C: Save to DB
    console.log('\n[Step C] Saving inspection to MongoDB...');
    const inspection = await Inspection.create({
      productName,
      images: imageUrls, // ab poora array save ho raha hai
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
      imageProcessingInfo: {
        processedCount,
        totalCount,
        failedImages,
      },
    });
  } catch (error) {
    console.error('\n❌ createInspection FAILED');
    console.error('Message:', error.message);
    console.error('Stack:', error.stack);
    console.error('============================================\n');
    res.status(500).json({ message: error.message });
  }
};

// User-scoped Inspections fetch:
// - Admin role: Can view ALL inspections across all users
// - Officer role: Can ONLY view their OWN inspections
exports.getInspections = async (req, res) => {
  try {
    const filter = req.user.role === 'admin' ? {} : { officer: req.user.id };
    const inspections = await Inspection.find(filter)
      .populate('officer', 'name email')
      .sort({ createdAt: -1 });
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

    // Access control check
    if (req.user.role !== 'admin' && inspection.officer._id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied: You are not authorized to view this inspection.' });
    }

    res.json(inspection);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};