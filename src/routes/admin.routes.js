const express = require('express');
const router = express.Router();
const { sessionGuard } = require('../middleware/session.middleware');
const { adminGuard } = require('../middleware/admin.middleware');
const adminController = require('../controllers/admin.controller');

// Apply admin guard to all routes
router.use(sessionGuard, adminGuard);

// Admin dashboard
router.get('/', adminController.getDashboard);

// Portfolio management
router.get('/portfolio', adminController.getPortfolio);

// Blog management
router.get('/blog', adminController.getBlog);

// Contact messages
router.get('/messages', adminController.getMessages);

// User management
router.get('/users', adminController.getUsers);
router.post('/users', adminController.createUser);
router.delete('/users/:id', adminController.deleteUser);
router.post('/users/:id/reset-password', adminController.resetUserPassword);

module.exports = router; 