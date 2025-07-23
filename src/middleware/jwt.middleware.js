const jwt = require('jsonwebtoken');
const { ApiError } = require('./error.middleware');

const verifyJWT = (req, res, next) => {
    try {
        // Get token from session instead of headers
        const token = req.session.token;
        
        if (!token) {
            // Redirect to login instead of throwing error
            return res.redirect('/api/auth/login');
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = decoded;
            next();
        } catch (error) {
            // Clear invalid token from session
            req.session.token = null;
            return res.redirect('/api/auth/login');
        }
    } catch (error) {
        next(error);
    }
};

module.exports = { verifyJWT }; 