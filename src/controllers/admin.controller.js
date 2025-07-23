const User = require('../models/user.model');
const { Portfolio, Category, Intro } = require('../models/portfolio.model');
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
    getPortfolio: async (req, res) => {
        try {
            // First verify that our models are properly imported
            if (!Intro || !Portfolio || !Category) {
                throw new Error('Required models are not properly imported');
            }

            // Fetch all necessary data with error handling for each query
            const [intro, portfolio, categories] = await Promise.all([
                Intro.findOne().exec(),
                Portfolio.findOne()
                    .populate('skills.category')
                    .populate('blogs.category')
                    .exec(),
                Category.find().exec()
            ]);

            // Group skills by category
            const groupedSkills = categories
                .filter(cat => cat.type === 'skill')
                .map(cat => ({
                    category: cat.name,
                    items: portfolio?.skills
                        .filter(skill => skill.category._id.toString() === cat._id.toString())
                        .map(skill => skill.name) || []
                }));

            // Group blogs by category
            const groupedBlogs = categories
                .filter(cat => cat.type === 'blog')
                .map(cat => ({
                    category: cat.name,
                    items: portfolio?.blogs
                        .filter(blog => blog.category._id.toString() === cat._id.toString())
                        .map(blog => ({
                            _id: blog._id,
                            title: blog.title,
                            content: blog.content,
                            coverImage: blog.coverImage,
                            published: blog.published,
                            publishedAt: blog.publishedAt,
                            tags: blog.tags
                        })) || []
                }));

            // Format about section data
            const about = portfolio ? {
                bio: portfolio.aboutMe,
                avatar: portfolio.avatar,
                badges: portfolio.badges || []
            } : null;

            // Format projects data
            const projects = portfolio?.projects.map(project => ({
                _id: project._id,
                title: project.title,
                caption: project.caption,
                description: project.description,
                coverImageUrl: project.coverImageUrl,
                repoLink: project.repoLink,
                techBadges: project.techBadges || []
            })) || [];

            res.render('admin/portfolio', {
                title: 'Manage Portfolio',
                user: req.session.user,
                intro,
                about,
                projects,
                skills: groupedSkills,
                posts: groupedBlogs,
                categories: {
                    skills: categories.filter(cat => cat.type === 'skill'),
                    blogs: categories.filter(cat => cat.type === 'blog')
                }
            });
        } catch (error) {
            console.error('Error fetching portfolio data:', error);
            // Render the page with error state
            res.render('admin/portfolio', {
                title: 'Manage Portfolio',
                user: req.session.user,
                intro: null,
                about: null,
                projects: [],
                skills: [],
                posts: [],
                categories: { skills: [], blogs: [] },
                error: 'Failed to load portfolio data'
            });
        }
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