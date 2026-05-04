const express = require('express');
const router = express.Router();
const {
  registerCompany,
  getCompanies,
  getCompany,
  updateCompany
} = require('../controllers/companyController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', getCompanies);
router.get('/:id', getCompany);
router.post('/', protect, authorize('recruiter'), registerCompany);
router.put('/:id', protect, authorize('recruiter'), updateCompany);

module.exports = router;