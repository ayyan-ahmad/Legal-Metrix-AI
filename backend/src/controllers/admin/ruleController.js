const Rule = require('../../models/Rule');

// GET /api/rules — sab rules list karo
exports.getRules = async (req, res) => {
  try {
    const rules = await Rule.find().sort({ createdAt: -1 });
    res.json({ success: true, rules });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/rules — naya rule banao
exports.createRule = async (req, res) => {
  try {
    const { ruleId, field, label, required, severity, description } = req.body;

    const existing = await Rule.findOne({ ruleId });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Rule with this ID already exists' });
    }

    const rule = await Rule.create({ ruleId, field, label, required, severity, description });
    res.status(201).json({ success: true, rule });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PATCH /api/rules/:id — rule update karo
exports.updateRule = async (req, res) => {
  try {
    const rule = await Rule.findByIdAndUpdate(req.params.id, req.body, {
      new: true,          // updated document return karo, purana nahi
      runValidators: true, // schema validations (enum wagera) dobara check ho
    });

    if (!rule) {
      return res.status(404).json({ success: false, message: 'Rule not found' });
    }

    res.json({ success: true, rule });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE /api/rules/:id — rule delete karo
exports.deleteRule = async (req, res) => {
  try {
    const rule = await Rule.findByIdAndDelete(req.params.id);

    if (!rule) {
      return res.status(404).json({ success: false, message: 'Rule not found' });
    }

    res.json({ success: true, message: 'Rule deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
