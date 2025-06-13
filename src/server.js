require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const path = require('path');
const session = require('express-session');

// Import routes
const authRoutes = require('./routes/auth.routes');
const portfolioRoutes = require('./routes/portfolio.routes');
const contactRoutes = require('./routes/contact.routes');
const adminRoutes = require('./routes/admin.routes');

// Import middleware
const { errorHandler } = require('./middleware/error.middleware');
const { sessionGuard } = require('./middleware/session.middleware');

// Create Express app
const app = express();

// Middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.tailwindcss.com"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'"]
        }
    }
}));
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Session configuration
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/portfolio', portfolioRoutes);
app.use('/api/contact', contactRoutes);
app.use('/admin', sessionGuard, adminRoutes);

// Home route
app.get('/', async (req, res) => {
    try {
        // Initialize default portfolio data
        const portfolio = {
            headerCaption: 'Welcome to My Portfolio',
            shortDescription: 'Full Stack Developer & Tech Enthusiast',
            skills: [],
            projects: [],
            blogPosts: []
        };

        // Fetch blog posts
        try {
            const blogPosts = await require('./services/medium.service').getBlogPosts();
            portfolio.blogPosts = blogPosts;
        } catch (error) {
            console.error('Error fetching blog posts:', error);
            // Continue with empty blog posts array
        }

        res.render('index', { 
            portfolio,
            title: 'Home',
            user: req.user
        });
    } catch (error) {
        console.error('Error in home route:', error);
        res.status(500).render('error', { 
            message: 'Error loading portfolio data',
            error: process.env.NODE_ENV === 'development' ? error : {}
        });
    }
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Database connection and server startup
const startServer = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const PORT = process.env.PORT || 3000;
        const server = app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });

        // Handle server errors
        server.on('error', (error) => {
            if (error.code === 'EADDRINUSE') {
                console.error(`Port ${PORT} is already in use. Please try a different port or kill the process using this port.`);
                process.exit(1);
            } else {
                console.error('Server error:', error);
                process.exit(1);
            }
        });

        // Handle process termination
        process.on('SIGTERM', () => {
            console.log('SIGTERM received. Shutting down gracefully...');
            server.close(() => {
                console.log('Server closed');
                mongoose.connection.close(false, () => {
                    console.log('MongoDB connection closed');
                    process.exit(0);
                });
            });
        });

    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

startServer(); 