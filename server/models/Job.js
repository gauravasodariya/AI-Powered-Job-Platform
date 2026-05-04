const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a job title'],
    trim: true,
  },
  company: {
    type: String,
    required: [true, 'Please add a company name'],
  },
  location: {
    type: String,
    required: [true, 'Please add a location'],
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
  },
  requirements: {
    type: [String],
    required: [true, 'Please add requirements'],
  },
  salary: {
    type: String,
  },
  salaryMin: {
    type: Number,
  },
  salaryMax: {
    type: Number,
  },
  experience: {
    type: Number,
    default: 0,
  },
  experienceMin: {
    type: Number,
    default: 0,
  },
  experienceMax: {
    type: Number,
    default: 0,
  },
  industry: {
    type: String,
  },
  education: {
    type: String,
  },
  jobType: {
    type: String,
    enum: ['Full-time', 'Part-time', 'Contract', 'Internship', 'Walk-in', 'Remote'],
    default: 'Full-time',
  },
  employerType: {
    type: String,
    enum: ['Company', 'Consultancy'],
    default: 'Company',
  },
  status: {
    type: String,
    enum: ['open', 'closed'],
    default: 'open',
  },
  skills: {
    type: [String],
    default: [],
  },
  recruiter: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Job', jobSchema);
