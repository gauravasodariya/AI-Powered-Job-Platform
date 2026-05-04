const express = require('express');
const router = express.Router();
const {
  applyForJob,
  getMyApplications,
  getJobApplications,
  updateApplicationStatus
} = require('../controllers/applicationController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/:jobId', authorize('seeker'), applyForJob);
router.get('/my-applications', authorize('seeker'), getMyApplications);
router.get('/job/:jobId', authorize('recruiter'), getJobApplications);
router.put('/:id/status', authorize('recruiter'), updateApplicationStatus);

module.exports = router;