const mongoose = require('mongoose');

const inspectionSchema = new mongoose.Schema(
  {
    productName: { type: String, required: true },
    images: [{ type: String }], // Cloudinary URLs
    extractedData: { type: Object }, // Gemini se aaya raw data
    violations: [
      {
        field: String,
        message: String,
        severity: String,
      },
    ],
    complianceScore: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['pass', 'fail', 'review'],
      default: 'review',
    },
    officer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Inspection', inspectionSchema);