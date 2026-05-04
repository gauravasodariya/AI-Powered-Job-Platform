const User = require('../models/User');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { OAuth2Client } = require('google-auth-library');
const { sendEmail } = require('../utils/ses');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const getAllowedGoogleClientIds = () =>
  [process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_IDS]
    .filter(Boolean)
    .flatMap((value) => String(value).split(","))
    .map((value) => value.trim())
    .filter(Boolean);

const getFrontendBaseUrl = (req) => {
  const origin = req.headers.origin;
  const fallbackUrl = process.env.FRONTEND_URL || "http://localhost:5173";
  return String(origin || fallbackUrl).replace(/\/+$/, "");
};

exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Check for password length
    if (password && password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role,
    });

    sendTokenResponse(user, 201, res, 'Registration successful!');
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide an email and password' });
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    sendTokenResponse(user, 200, res, 'Login successful!');
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.googleLogin = async (req, res) => {
  try {
    const { tokenId, email: bodyEmail, name: bodyName, picture: bodyPicture, googleId: bodyGoogleId } = req.body;
    let email, name, picture, googleId;

    if (tokenId) {
      const allowedAudiences = getAllowedGoogleClientIds();
      if (allowedAudiences.length === 0) {
        return res.status(500).json({ message: 'Google sign-in is not configured on the server' });
      }

      const ticket = await client.verifyIdToken({
        idToken: tokenId,
        audience: allowedAudiences,
      });
      const payload = ticket.getPayload();
      email = payload.email;
      name = payload.name;
      picture = payload.picture;
      googleId = payload.sub;
    } else {
      // Use direct data from frontend (Access Token flow)
      email = bodyEmail;
      name = bodyName;
      picture = bodyPicture;
      googleId = bodyGoogleId;
    }

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    let user = await User.findOne({ email });

    if (!user) {
      // Create new user if not exists
      user = await User.create({
        name,
        email,
        password: crypto.randomBytes(16).toString('hex'), // Random password for Google users
        role: 'seeker', // Default role
        googleId,
        profile: {
          avatar: picture
        }
      });
    } else {
      // If user exists, update their googleId and avatar if not set
      let updated = false;
      if (!user.googleId) {
        user.googleId = googleId;
        updated = true;
      }
      if (!user.profile.avatar) {
        user.profile.avatar = picture;
        updated = true;
      }
      if (updated) await user.save();
    }

    sendTokenResponse(user, 200, res, 'Google Login successful!');
  } catch (error) {
    console.error('Google Auth Error:', error);
    res.status(500).json({ message: 'Google authentication failed' });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      return res.status(404).json({ message: 'There is no user with that email' });
    }

    // Get reset token
    const resetToken = crypto.randomBytes(20).toString('hex');

    // Hash token and set to resetPasswordToken field
    user.resetPasswordToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    // Set expire
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 mins

    await user.save({ validateBeforeSave: false });

    // Create reset url
    const resetUrl = `${getFrontendBaseUrl(req)}/resetpassword/${resetToken}`;

    const message = `<h1>Password Reset</h1><p>You are receiving this email because you has requested the reset of a password.</p><p>Please click on the following link to reset your password:</p><a href="${resetUrl}">${resetUrl}</a>`;

    try {
      await sendEmail(user.email, 'Password reset token', message);
      res.status(200).json({ success: true, message: 'Password reset link sent to your email.' });
    } catch (err) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save({ validateBeforeSave: false });
      return res.status(500).json({ message: 'Email could not be sent' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    // Get hashed token
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(req.params.resettoken)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid token' });
    }

    // Set new password
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    sendTokenResponse(user, 200, res, 'Password reset successful!');
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Handle top-level fields
    if (req.body.name) user.name = req.body.name;

    // Handle profile fields (nested)
    if (req.body.profile) {
      const { title, bio, location, skills, avatar } = req.body.profile;
      if (title !== undefined) user.profile.title = title;
      if (bio !== undefined) user.profile.bio = bio;
      if (location !== undefined) user.profile.location = location;
      if (avatar !== undefined) user.profile.avatar = avatar;
      
      if (skills !== undefined) {
        user.profile.skills = Array.isArray(skills) 
          ? skills 
          : skills.split(',').map(s => s.trim());
      }
    } else {
      // Legacy support for flat req.body
      const { title, bio, location, skills } = req.body;
      if (title !== undefined) user.profile.title = title;
      if (bio !== undefined) user.profile.bio = bio;
      if (location !== undefined) user.profile.location = location;
      if (skills !== undefined) {
        user.profile.skills = Array.isArray(skills) 
          ? skills 
          : skills.split(',').map(s => s.trim());
      }
    }

    await user.save();

    res.status(200).json({ success: true, data: user, message: 'Profile updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res, message) => {
  // Create token
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });

  res.status(statusCode).json({
    success: true,
    token,
    message: message || 'Success',
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
};
