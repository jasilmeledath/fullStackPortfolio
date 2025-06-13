const { ApiError } = require('./error.middleware');

const sessionGuard = (req, res, next) => {
  if (!req.session.user) {
    if (req.xhr || req.headers.accept.includes('application/json')) {
      throw new ApiError(401, 'Unauthorized - Please log in');
    }
    return res.redirect('/login');
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