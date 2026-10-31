/**
 * Centralized Error Handling Middleware
 * Practical No. 6: RESTful CRUD API
 * Student: Ayush (PRN: 2304362)
 */

// 404 Not Found Middleware for unmapped routes
const notFoundHandler = (req, res, next) => {
    res.status(404).json({
        success: false,
        statusCode: 404,
        error: 'Not Found',
        message: `Endpoint ${req.method} ${req.originalUrl} does not exist on this server.`,
        availableEndpoints: {
            getAllStudents: 'GET /api/v1/students',
            getStudentById: 'GET /api/v1/students/:id',
            createStudent: 'POST /api/v1/students',
            updateStudent: 'PUT /api/v1/students/:id',
            deleteStudent: 'DELETE /api/v1/students/:id',
            analyticsStats: 'GET /api/v1/students/analytics/stats',
            healthCheck: 'GET /health'
        }
    });
};

// Global 4-argument error handler
const errorHandler = (err, req, res, next) => {
    console.error(`[Error Handler] ${req.method} ${req.originalUrl} -`, err);

    let statusCode = err.statusCode || 500;
    let message = err.message || 'Internal Server Error';
    let details = null;

    // Handle Mongoose CastError (e.g., malformed 24-hex ObjectId)
    if (err.name === 'CastError') {
        statusCode = 400;
        message = `Resource not found or invalid identifier format: ${err.value}`;
    }

    // Handle MongoDB Duplicate Key Error (E11000)
    if (err.code === 11000) {
        statusCode = 400;
        const duplicateField = Object.keys(err.keyValue || {})[0] || 'field';
        const duplicateValue = err.keyValue ? err.keyValue[duplicateField] : '';
        message = `Duplicate Entry: A student with ${duplicateField.toUpperCase()} '${duplicateValue}' already exists.`;
        details = { duplicateField, duplicateValue };
    }

    // Handle Mongoose Validation Error
    if (err.name === 'ValidationError') {
        statusCode = 400;
        message = 'Database Schema Validation Error';
        details = Object.values(err.errors).map(val => ({
            field: val.path,
            message: val.message
        }));
    }

    res.status(statusCode).json({
        success: false,
        statusCode: statusCode,
        error: statusCode >= 500 ? 'Server Error' : 'Client Error',
        message: message,
        details: details,
        timestamp: new Date().toISOString()
    });
};

module.exports = {
    notFoundHandler,
    errorHandler
};
