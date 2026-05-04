const Education = require('../models/Education');

exports.getEducation = async (req, res) => {
  try {
    const education = await Education.find({ user: req.user.id }).sort('-startDate');
    res.status(200).json({ success: true, count: education.length, data: education });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.addEducation = async (req, res) => {
  try {
    req.body.user = req.user.id;
    const education = await Education.create(req.body);
    res.status(201).json({ success: true, data: education });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateEducation = async (req, res) => {
  try {
    let education = await Education.findById(req.params.id);
    if (!education) {
      return res.status(404).json({ message: 'Education entry not found' });
    }

    if (education.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized to update this education entry' });
    }

    education = await Education.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({ success: true, data: education });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteEducation = async (req, res) => {
  try {
    const education = await Education.findById(req.params.id);
    if (!education) {
      return res.status(404).json({ message: 'Education entry not found' });
    }

    if (education.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized to delete this education entry' });
    }

    await education.deleteOne();
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};