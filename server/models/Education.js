const mongoose = require('mongoose');

const EducationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  institution: {
    type: String,
    required: [true, 'Please add an institution name']
  },
  degree: {
    type: String,
    required: [true, 'Please add a degree']
  },
  fieldOfStudy: {
    type: String,
    required: [true, 'Please add a field of study']
  },
  startDate: {
    type: Date,
    required: [true, 'Please add a start date']
  },
  endDate: {
    type: Date
  },
  description: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Education', EducationSchema);