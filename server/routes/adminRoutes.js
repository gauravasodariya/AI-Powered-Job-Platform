const express = require('express');
const {
  getAdminStats,
  getAllUsers,
  deleteUser,
  getAllJobs,
  deleteJob,
  getAllApplications,
  getAllInquiries,
  resolveInquiry
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// All routes are protected and restricted to admin
router.use(protect);
router.use(authorize('admin'));

router.get('/stats', getAdminStats);
router.get('/users', getAllUsers);
router.delete('/users/:id', deleteUser);
router.get('/jobs', getAllJobs);
router.delete('/jobs/:id', deleteJob);
router.get('/applications', getAllApplications);
router.get('/inquiries', getAllInquiries);
router.put('/inquiries/:id/resolve', resolveInquiry);

module.exports = router;
