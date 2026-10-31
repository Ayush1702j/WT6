/**
 * Request Validation Middleware using express-validator
 * Practical No. 6: RESTful CRUD API
 * Student: Ayush (PRN: 2304362)
 */

const { body, param, validationResult } = require('express-validator');
const mongoose = require('mongoose');
const { allowedDepartments, allowedYears } = require('../models/Student');

// Middleware to evaluate validation errors
const checkValidationResult = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            statusCode: 400,
            message: 'Request Validation Failed',
            errorCount: errors.array().length,
            errors: errors.array().map(err => ({
                field: err.path || err.param,
                message: err.msg,
                rejectedValue: err.value
            }))
        });
    }
    next();
};

// Validation rules for POST /api/v1/students
const validateStudentCreate = [
    body('prn')
        .trim()
        .notEmpty().withMessage('PRN is required')
        .matches(/^\d{7,8}$/).withMessage('PRN must be 7 to 8 numeric digits (e.g., 2304362)'),

    body('name')
        .trim()
        .notEmpty().withMessage('Student name is required')
        .isLength({ min: 3, max: 60 }).withMessage('Name must be between 3 and 60 characters')
        .matches(/^[A-Za-z\s.]+$/).withMessage('Name can only contain alphabets, spaces, and dots'),

    body('email')
        .trim()
        .notEmpty().withMessage('Email address is required')
        .isEmail().withMessage('Must be a valid email address format (e.g., ayush.mit@mitaoe.ac.in)')
        .normalizeEmail(),

    body('phone')
        .trim()
        .notEmpty().withMessage('Phone number is required')
        .matches(/^[6-9]\d{9}$/).withMessage('Phone must be a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9'),

    body('department')
        .trim()
        .notEmpty().withMessage('Department is required')
        .isIn(allowedDepartments).withMessage(`Department must be one of: ${allowedDepartments.join(', ')}`),

    body('year')
        .trim()
        .notEmpty().withMessage('Academic year is required')
        .isIn(allowedYears).withMessage(`Academic year must be one of: ${allowedYears.join(', ')}`),

    body('division')
        .optional()
        .trim()
        .toUpperCase()
        .isIn(['A', 'B', 'C', 'D']).withMessage('Division must be A, B, C, or D'),

    body('cgpa')
        .notEmpty().withMessage('CGPA is required')
        .isFloat({ min: 0.0, max: 10.0 }).withMessage('CGPA must be a decimal between 0.00 and 10.00'),

    body('skills')
        .optional()
        .customSanitizer(val => {
            if (typeof val === 'string') {
                return val.split(',').map(s => s.trim()).filter(Boolean);
            }
            return Array.isArray(val) ? val : [];
        }),

    checkValidationResult
];

// Validation rules for PUT /api/v1/students/:id
const validateStudentUpdate = [
    param('id')
        .custom((val) => {
            const isValidObjectId = mongoose.Types.ObjectId.isValid(val);
            const isValidPRN = /^\d{7,8}$/.test(val);
            if (!isValidObjectId && !isValidPRN) {
                throw new Error('Identifier must be a valid 24-character MongoDB ObjectId or a 7-8 digit PRN');
            }
            return true;
        }),

    body('prn')
        .optional()
        .trim()
        .matches(/^\d{7,8}$/).withMessage('PRN must be 7 to 8 numeric digits'),

    body('name')
        .optional()
        .trim()
        .isLength({ min: 3, max: 60 }).withMessage('Name must be between 3 and 60 characters')
        .matches(/^[A-Za-z\s.]+$/).withMessage('Name can only contain alphabets, spaces, and dots'),

    body('email')
        .optional()
        .trim()
        .isEmail().withMessage('Must be a valid email address')
        .normalizeEmail(),

    body('phone')
        .optional()
        .trim()
        .matches(/^[6-9]\d{9}$/).withMessage('Phone must be a valid 10-digit mobile number'),

    body('department')
        .optional()
        .trim()
        .isIn(allowedDepartments).withMessage(`Department must be one of: ${allowedDepartments.join(', ')}`),

    body('year')
        .optional()
        .trim()
        .isIn(allowedYears).withMessage(`Year must be one of: ${allowedYears.join(', ')}`),

    body('division')
        .optional()
        .trim()
        .toUpperCase()
        .isIn(['A', 'B', 'C', 'D']).withMessage('Division must be A, B, C, or D'),

    body('cgpa')
        .optional()
        .isFloat({ min: 0.0, max: 10.0 }).withMessage('CGPA must be between 0.00 and 10.00'),

    body('skills')
        .optional()
        .customSanitizer(val => {
            if (typeof val === 'string') {
                return val.split(',').map(s => s.trim()).filter(Boolean);
            }
            return Array.isArray(val) ? val : [];
        }),

    checkValidationResult
];

// Validation for :id parameter in GET and DELETE
const validateIdentifier = [
    param('id')
        .custom((val) => {
            const isValidObjectId = mongoose.Types.ObjectId.isValid(val);
            const isValidPRN = /^\d{7,8}$/.test(val);
            if (!isValidObjectId && !isValidPRN) {
                throw new Error('Invalid student identifier. Must be a 24-character MongoDB ObjectId (e.g., 6723b...) or a 7-8 digit PRN');
            }
            return true;
        }),

    checkValidationResult
];

module.exports = {
    validateStudentCreate,
    validateStudentUpdate,
    validateIdentifier
};
