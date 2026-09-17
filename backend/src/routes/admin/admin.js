const express = require('express');
const router = express.Router();
const protect = require('../../middleware/authMiddleware');
const adminOnly = require('../../middleware/admin/adminOnly');
const Inspection = require('../../models/Inspection');
const User = require('../../models/User');

// GET /api/admin/stats
router.get('/stats', protect, adminOnly, async (req, res) => {
  try {
    // Total inspections
    const totalInspections = await Inspection.countDocuments();

    // Status wise count (pass/fail/review)
    const statusCounts = await Inspection.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    // statusCounts abhi aisa aayega: [{ _id: 'pass', count: 10 }, { _id: 'fail', count: 5 }]
    // Isko clean object mein convert karte hain
    const statusSummary = { pass: 0, fail: 0, review: 0 };
    statusCounts.forEach((item) => {
      statusSummary[item._id] = item.count;
    });

    // Total officers (jinka role 'officer' hai)
    const totalOfficers = await User.countDocuments({ role: 'officer' });

    // Overall compliance percentage
    const compliancePercentage =
      totalInspections > 0
        ? Math.round((statusSummary.pass / totalInspections) * 100)
        : 0;

    res.json({
      success: true,
      stats: {
        totalInspections,
        totalOfficers,
        passed: statusSummary.pass,
        failed: statusSummary.fail,
        review: statusSummary.review,
        compliancePercentage,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
// GET /api/admin/officers
router.get('/officers', protect, adminOnly, async (req, res) => {
  try {
    // Sab officers nikalo, password field mat bhejo response mein
    const officers = await User.find({ role: 'officer' }).select('-password');

    // Har officer ke liye unke inspection stats nikalo
    const officersWithStats = await Promise.all(
      officers.map(async (officer) => {
        const totalScans = await Inspection.countDocuments({ officer: officer._id });
        const passedScans = await Inspection.countDocuments({
          officer: officer._id,
          status: 'pass',
        });

        const passRate = totalScans > 0 ? Math.round((passedScans / totalScans) * 100) : 0;

        return {
          _id: officer._id,
          name: officer.name,
          email: officer.email,
          totalScans,
          passedScans,
          passRate,
          joinedAt: officer.createdAt,
        };
      })
    );

    res.json({ success: true, officers: officersWithStats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
// GET /api/admin/inspections
router.get('/inspections', protect, adminOnly, async (req, res) => {
  try {
    const { officer, status, startDate, endDate, page = 1, limit = 10 } = req.query;

    // Filter object dynamically banao — jo query param aaya usi ko filter mein daalo
    const filter = {};

    if (officer) {
      filter.officer = officer;
    }

    if (status) {
      filter.status = status;
    }

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    // Pagination calculation
    const skip = (Number(page) - 1) * Number(limit);

    const inspections = await Inspection.find(filter)
      .populate('officer', 'name email') // officer ka sirf naam-email chahiye, poora object nahi
      .sort({ createdAt: -1 }) // sabse recent pehle
      .skip(skip)
      .limit(Number(limit));

    const totalCount = await Inspection.countDocuments(filter);

    res.json({
      success: true,
      inspections,
      pagination: {
        total: totalCount,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(totalCount / Number(limit)),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
module.exports = router;
