const errorHandler = (err, req, res, next) => {
    console.error('Error:', err.stack);

    // Default error
    let statusCode = err.statusCode || 500;
    let message = err.message || 'Kuch gadbad ho gayi!';

    // MySQL errors
    if (err.code === 'ER_DUP_ENTRY') {
        statusCode = 400;
        message = 'Ye email already registered hai!';
    }

    if (err.code === 'ER_NO_REFERENCED_ROW_2') {
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
        message = 'Session expire ho gaya, dobara login karo!';
    }

    // Validation errors
    if (err.name === 'ValidationError') {
        statusCode = 400;
        message = err.message;
    }

    res.status(statusCode).json({
        success: false,
        message: message,
        // Development me stack trace dikhao
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
};

module.exports = errorHandler;