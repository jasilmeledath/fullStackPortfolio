const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const { ApiError } = require('../middleware/error.middleware');

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

const login = async (req, res, next) => {
  try {
    console.log('Login attempt:', req.method, req.body || req.query);
    
    // Get credentials from either body (POST) or query (GET)
    const { username, password } = req.method === 'POST' ? req.body : req.query;

    if (!username || !password) {
      throw new ApiError(400, 'Username and password are required');
    }

    // Find user and include password for comparison
    const user = await User.findOne({ username }).select('+password');
    if (!user) {
      throw new ApiError(401, 'Invalid credentials');
    }

    // Compare password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new ApiError(401, 'Invalid credentials');
    }

    // Generate JWT
    const token = generateToken(user._id);

    // Set session
    req.session.user = {
      id: user._id,
      username: user.username,
      role: user.role
    };

    // If it's an AJAX request, return JSON
    if (req.xhr || req.headers.accept?.includes('application/json')) {
      return res.json({
        status: 'success',
        token,
        user: {
          id: user._id,
          username: user.username,
          role: user.role
        }
      });
    }

    // For regular form submissions, redirect to admin dashboard
    res.redirect('/admin');
  } catch (error) {
    next(error);
  }
};

const logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({
        status: 'error',
        message: 'Error logging out'
      });
    }
    res.clearCookie('connect.sid');
    res.json({
      status: 'success',
      message: 'Logged out successfully'
    });
  });
};

const getCurrentUser = (req, res) => {
  res.json({
    status: 'success',
    user: req.session.user
  });
};

module.exports = {
  login,
  logout,
  getCurrentUser
}; 