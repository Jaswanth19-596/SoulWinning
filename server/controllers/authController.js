const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User = require('../models/User');

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

const register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { username, email, password } = req.body;

    // Check for existing username (unencrypted)
    const existingUsername = await User.findOne({ username });

    // Check for existing email (encrypted)
    const existingEmail = await User.findByEmail(email);

    if (existingUsername || existingEmail) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email or username'
      });
    }

    const user = await User.create({
      username,
      email,
      password
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      token,
      user
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration'
    });
  }
};

const login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { username, password } = req.body;

    console.log('Login attempt for:', username);

    // Try to find user by username first (unencrypted)
    let user = await User.findOne({ username });
    console.log('Found by username:', !!user);

    // If not found by username, try by email (encrypted)
    if (!user) {
      console.log('Trying to find by email...');
      user = await User.findByEmail(username);
      console.log('Found by email:', !!user);
    }

    if (!user) {
      console.log('User not found for:', username);
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    console.log('Comparing password for user:', user.username);
    const isMatch = await user.comparePassword(password);
    console.log('Password match:', isMatch);

    if (!isMatch) {
      console.log('Password mismatch for user:', user.username);
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
};

const getProfile = async (req, res) => {
  try {
    res.json({
      success: true,
      user: req.user
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting profile'
    });
  }
};

module.exports = {
  register,
  login,
  getProfile
};