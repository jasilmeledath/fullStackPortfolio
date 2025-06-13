class ApiError extends Error {
  constructor(statusCode, message, errors = []) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Error handling middleware
const errorHandler = (err, req, res, next) => {
    console.error(err.stack);

    // Default error status and message
    const status = err.status || 500;
    const message = err.message || 'Something went wrong!';

    // Send error response
    res.status(status).render('error', {
        message,
        error: process.env.NODE_ENV === 'development' ? err : {}
    });
};

module.exports = {
  ApiError,
  errorHandler
}; 