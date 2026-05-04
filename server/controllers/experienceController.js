const Experience = require('../models/Experience');

exports.getExperience = async (req, res) => {
  try {
    const experience = await Experience.find({ user: req.user.id }).sort('-startDate');
    res.status(200).json({ success: true, count: experience.length, data: experience });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.addExperience = async (req, res) => {
  try {
    req.body.user = req.user.id;
    const experience = await Experience.create(req.body);
    res.status(201).json({ success: true, data: experience });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateExperience = async (req, res) => {
  try {
    let experience = await Experience.findById(req.params.id);
    if (!experience) {
      return res.status(404).json({ message: 'Experience entry not found' });
    }

    if (experience.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized to update this experience entry' });
    }

    experience = await Experience.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({ success: true, data: experience });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteExperience = async (req, res) => {
  try {
    const experience = await Experience.findById(req.params.id);
    if (!experience) {
      return res.status(404).json({ message: 'Experience entry not found' });
    }

    if (experience.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized to delete this experience entry' });
    }

    await experience.deleteOne();
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};