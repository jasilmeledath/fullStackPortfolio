const User = require('../models/user.model');
const HTTP_STATUS = require('../constants/httpStatus');
const { getBlogPosts } = require('../services/medium.service');

const adminController = {
    // Dashboard
    getDashboard: (req, res) => {
        res.render('admin/dashboard', {
            title: 'Admin Dashboard',
            user: req.session.user
        });
    },

    // Portfolio management
    getPortfolio: (req, res) => {
        res.render('admin/portfolio', {
            title: 'Manage Portfolio',
            user: req.session.user,
            intro: null,
            about: null,
            projects: null,
            skills: null,
            posts: null
        });
    },

    // Blog management
    getBlog: (req, res) => {
        res.render('admin/blog', {
            title: 'Manage Blog',
            user: req.session.user,
            blogPosts : null,
            categories : null,
        });
    },

    // Contact messages
    getMessages: (req, res) => {
        res.render('admin/messages', {
            title: 'Contact Messages',
            user: req.session.user
        });
    },

    // User management
    getUsers: async (req, res) => {
        try {
            const users = await User.find().select('-password');
            res.render('admin/users', { users });
        } catch (error) {
            console.error('Error fetching users:', error);
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: 'Error fetching users' });
        }
    },

    createUser: async (req, res) => {
        try {
            const { username, email, password } = req.body;

            const existingUser = await User.findOne({ 
                $or: [{ username }, { email }] 
            });

            if (existingUser) {
                return res.status(HTTP_STATUS.CONFLICT).json({ 
                    message: 'Username or email already exists' 
                });
            }

            const user = new User({
                username,
                email,
                password,
                role: 'admin'
            });

            await user.save();
            res.status(HTTP_STATUS.CREATED).json({ message: 'Admin user created successfully' });
        } catch (error) {
            console.error('Error creating user:', error);
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: 'Error creating user' });
        }
    },

    deleteUser: async (req, res) => {
        try {
            const user = await User.findById(req.params.id);
            
            if (!user) {
                return res.status(HTTP_STATUS.NOT_FOUND).json({ message: 'User not found' });
            }

            const adminCount = await User.countDocuments({ role: 'admin' });
            if (adminCount <= 1) {
                return res.status(HTTP_STATUS.FORBIDDEN).json({ 
                    message: 'Cannot delete the last admin user' 
                });
            }

            await user.deleteOne();
            res.status(HTTP_STATUS.OK).json({ message: 'User deleted successfully' });
        } catch (error) {
            console.error('Error deleting user:', error);
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: 'Error deleting user' });
        }
    },

    resetUserPassword: async (req, res) => {
        try {
            const { newPassword } = req.body;
            const user = await User.findById(req.params.id);

            if (!user) {
                return res.status(HTTP_STATUS.NOT_FOUND).json({ message: 'User not found' });
            }

            user.password = newPassword;
            await user.save();
            
            res.status(HTTP_STATUS.OK).json({ message: 'Password reset successfully' });
        } catch (error) {
            console.error('Error resetting password:', error);
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: 'Error resetting password' });
        }
    }
};

module.exports = adminController; 