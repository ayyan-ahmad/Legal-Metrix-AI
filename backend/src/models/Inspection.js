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
    seizureMemo: {
      samplesSeized: { type: Number, default: null },
      samplesReleased: { type: Number, default: null },
      disposalNote: { type: String, default: null },
      reasonsToBelieve: { type: String, default: null },
      generatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
      generatedAt: { type: Date, default: null },
    },
    // Submission workflow tracking
    submission: {
      status: {
        type: String,
        enum: ['draft', 'submitted', 'approved', 'sent_back'],
        default: 'draft',
      },
      caseNumber: { type: String, default: null }, // e.g. LM/2026/00347
      submittedAt: { type: Date, default: null },
      reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
      reviewedAt: { type: Date, default: null },
      adminRemarks: { type: String, default: null },
    },
  },

  { timestamps: true }
);

module.exports = mongoose.model('Inspection', inspectionSchema);