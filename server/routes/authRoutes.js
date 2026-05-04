const express = require('express');
const { 
  register, 
  login, 
  googleLogin,
  getMe, 
  forgotPassword, 
  resetPassword, 
  updateProfile 
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/google-login', googleLogin);
router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword/:resettoken', resetPassword);
router.put('/updateprofile', protect, updateProfile);
router.get('/me', protect, getMe);

module.exports = router;
