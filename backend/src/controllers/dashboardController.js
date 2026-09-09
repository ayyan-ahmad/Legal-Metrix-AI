const Inspection = require('../models/Inspection');

exports.getStats = async (req, res) => {
  try {
    const filter = req.user.role === 'admin' ? {} : { officer: req.user.id };

    const total = await Inspection.countDocuments(filter);
    const passed = await Inspection.countDocuments({ ...filter, status: 'pass' });
    const failed = await Inspection.countDocuments({ ...filter, status: 'fail' });
    const review = await Inspection.countDocuments({ ...filter, status: 'review' });

    const inspections = await Inspection.find(filter, 'violations');

    const violationCounts = {};
    inspections.forEach((insp) => {
      if (insp.violations) {
        insp.violations.forEach((v) => {
          if (v.field) {
            violationCounts[v.field] = (violationCounts[v.field] || 0) + 1;
          }
        });
      }
    });

    const violationBreakdown = Object.keys(violationCounts).map((field) => ({
      field,
      count: violationCounts[field],
    }));

    res.json({
      total,
      passed,
      failed,
      review,
      violationBreakdown,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};