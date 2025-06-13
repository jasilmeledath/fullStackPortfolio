const express = require('express');
const { body } = require('express-validator');
const { login, logout, getCurrentUser } = require('../controllers/auth.controller');
const { verifyJWT } = require('../middleware/jwt.middleware');
const { redirectIfAuthenticated } = require('../middleware/session.middleware');

const router = express.Router();

// Login route
router.post('/login',login);

// Logout route
router.post('/logout', logout);

// Get current user route (protected)
router.get('/me', verifyJWT, getCurrentUser);

// Login page route
router.get('/login', redirectIfAuthenticated, (req, res) => {
  res.render('login');
});

module.exports = router; 