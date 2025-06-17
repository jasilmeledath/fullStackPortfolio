const HTTP_STATUS = require('../constants/httpStatus');

const adminGuard = (req, res, next) => {
    if (!req.session.user || req.session.user.role !== 'admin') {
        return res.status(HTTP_STATUS.FORBIDDEN).json({ message: 'Access denied. Admin privileges required.' });
    }
    next();
};

module.exports = { adminGuard }; 