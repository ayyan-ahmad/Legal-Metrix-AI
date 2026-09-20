const Inspection = require('../models/Inspection');
const { generateInspectionPDF } = require('../utils/reportGenerator');

exports.generateReport = async (req, res) => {
  try {
    const inspection = await Inspection.findById(req.params.id)
      .populate('officer', 'name email')
      .populate('submission.reviewedBy', 'name email')
      .populate('seizureMemo.generatedBy', 'name email');

    if (!inspection) {
      return res.status(404).json({ message: 'Inspection not found' });
    }

    await generateInspectionPDF(inspection, res);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
