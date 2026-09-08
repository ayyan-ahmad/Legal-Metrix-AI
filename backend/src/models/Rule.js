const mongoose = require('mongoose');

const ruleSchema = new mongoose.Schema(
  {
    ruleId: { type: String, required: true, unique: true },
    field: { type: String, required: true }, // e.g. "mrp", "netQuantity"
    label: { type: String, required: true }, // e.g. "MRP Declaration"
    required: { type: Boolean, default: true },
    severity: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'high',
    },
    description: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Rule', ruleSchema);