const express = require('express');
const router = express.Router();

const { protect } = require('../middleware/authMiddleware');
const {
  getEducation,
  addEducation,
  updateEducation,
  deleteEducation
} = require('../controllers/educationController');

const {
  getExperience,
  addExperience,
  updateExperience,
  deleteExperience
} = require('../controllers/experienceController');
router.use(protect);

router.get('/education', getEducation);
router.post('/education', addEducation);
router.put('/education/:id', updateEducation);
router.delete('/education/:id', deleteEducation);


router.get('/experience', getExperience);
router.post('/experience', addExperience);
router.put('/experience/:id', updateExperience);
router.delete('/experience/:id', deleteExperience);

module.exports = router;