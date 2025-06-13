const express = require('express');
const router = express.Router();
const User = require('../models/user.model');
const { sessionGuard } = require('../middleware/session.middleware');
const { adminGuard } = require('../middleware/admin.middleware');

// Apply admin guard to all routes
router.use(sessionGuard, adminGuard);

// Admin dashboard
router.get('/', (req, res) => {
  res.render('admin/dashboard', {
    title: 'Admin Dashboard',
    user: req.session.user
  });
});

// Portfolio management
router.get('/portfolio', (req, res) => {
  res.render('admin/portfolio', {
    title: 'Manage Portfolio',
    user: req.session.user
  });
});

// Blog management
router.get('/blog', (req, res) => {
  res.render('admin/blog', {
    title: 'Manage Blog',
    user: req.session.user
  });
});

// Contact messages
router.get('/messages', (req, res) => {
  res.render('admin/messages', {
    title: 'Contact Messages',
    user: req.session.user
  });
});

// Get all users
router.get('/users', async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.render('admin/users', { users });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: 'Error fetching users' });
    }
});

// Add new admin user
router.post('/users', async (req, res) => {
    try {
        console.log('invoked');
        
        const { username, email, password } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ 
            $or: [{ username }, { email }] 
        });

        if (existingUser) {
            return res.status(400).json({ 
                message: 'Username or email already exists' 
            });
        }

        // Create new user
        const user = new User({
            username,
            email,
            password,
            role: 'admin'
        });

        await user.save();
        res.status(201).json({ message: 'Admin user created successfully' });
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ message: 'Error creating user' });
    }
});

// Delete user
router.delete('/users/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Prevent deleting the last admin
        const adminCount = await User.countDocuments({ role: 'admin' });
        if (adminCount <= 1) {
            return res.status(400).json({ 
                message: 'Cannot delete the last admin user' 
            });
        }

        await user.deleteOne();
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ message: 'Error deleting user' });
    }
});

// Reset user password
router.post('/users/:id/reset-password', async (req, res) => {
    try {
        const { newPassword } = req.body;
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.password = newPassword;
        await user.save();
        
        res.json({ message: 'Password reset successfully' });
    } catch (error) {
        console.error('Error resetting password:', error);
        res.status(500).json({ message: 'Error resetting password' });
    }
});

module.exports = router; 