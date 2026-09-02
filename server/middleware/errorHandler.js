const errorHandler = (err, req, res, next) => {
    console.error('Error:', err.stack);

    // Default error
    let statusCode = err.statusCode || 500;
    let message = err.message || 'Something went wrong!';

    // Database / SQL errors
    if (err.code === 'ER_DUP_ENTRY' || err.code === '23505') {
        statusCode = 400;
        message = 'This email is already registered!';
    }

    if (err.code === 'ER_NO_REFERENCED_ROW_2' || err.code === '23503') {
        statusCode = 400;
        message = 'Invalid reference!';
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        statusCode = 401;
        message = 'Invalid token!';
    }

    if (err.name === 'TokenExpiredError') {
        statusCode = 401;
        message = 'Session has expired, please login again!';
    }

    // Validation errors
    if (err.name === 'ValidationError') {
        statusCode = 400;
        message = err.message;
    }

    res.status(statusCode).json({
        success: false,
        message: message,
        // Include stack trace in development mode
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
};

module.exports = errorHandler;