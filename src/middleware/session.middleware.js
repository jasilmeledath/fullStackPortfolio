const { ApiError } = require('./error.middleware');
const HTTP_STATUS = require('../constants/httpStatus');

const sessionGuard = (req, res, next) => {
  if (!req.session.user) {
    if (req.xhr || req.headers.accept?.includes('application/json')) {
      throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Unauthorized - Please log in');
    }
    return res.redirect('/api/auth/login');
  }
  next();
};

const redirectIfAuthenticated = (req, res, next) => {
  if (req.session.user) {
    return res.redirect('/admin');
  }
  next();
};

module.exports = {
  sessionGuard,
  redirectIfAuthenticated
}; 