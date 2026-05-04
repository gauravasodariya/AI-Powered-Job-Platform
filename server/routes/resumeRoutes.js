const express = require('express');
const multer = require('multer');
const { uploadResume, getResumeInfo } = require('../controllers/resumeController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'), false);
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

router.post('/upload', protect, authorize('seeker'), upload.single('resume'), uploadResume);
router.get('/me', protect, getResumeInfo);

module.exports = router;
