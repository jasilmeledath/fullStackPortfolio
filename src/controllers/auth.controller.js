const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const { ApiError } = require('../middleware/error.middleware');
const HTTP_STATUS = require('../constants/httpStatus');

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
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Username and password are required');
    }

    // Find user and include password for comparison
    const user = await User.findOne({ username }).select('+password');
    if (!user) {
      throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Invalid credentials');
    }

    // Compare password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Invalid credentials');
    }

    // Generate token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Set token in session
    req.session.token = token;
    req.session.user = user;

    // If it's an AJAX request, return JSON
    if (req.xhr || req.headers.accept?.includes('application/json')) {
      return res.status(HTTP_STATUS.OK).json({
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
      return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        status: 'error',
        message: 'Error logging out'
      });
    }
    res.clearCookie('connect.sid');
    res.status(HTTP_STATUS.OK).json({
      status: 'success',
      message: 'Logged out successfully'
    });
  });
};

const getCurrentUser = (req, res) => {
  res.status(HTTP_STATUS.OK).json({
    status: 'success',
    user: req.session.user
  });
};

module.exports = {
  login,
  logout,
  getCurrentUser
}; 