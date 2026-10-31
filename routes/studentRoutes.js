/**
 * Student Resource Router
 * Practical No. 6: RESTful CRUD API
 * Student: Ayush (PRN: 2304362)
 */

const express = require('express');
const router = express.Router();

const {
    createStudent,
    getAllStudents,
    getStudentById,
    updateStudent,
    deleteStudent,
    getStudentStats
} = require('../controllers/studentController');

const {
    validateStudentCreate,
    validateStudentUpdate,
    validateIdentifier
} = require('../middleware/validator');

// Analytics aggregation endpoint (must precede dynamic /:id parameter)
router.get('/analytics/stats', getStudentStats);

// Resource root: /api/v1/students
router.route('/')
    .get(getAllStudents)
    .post(validateStudentCreate, createStudent);

// Resource item: /api/v1/students/:id
router.route('/:id')
    .get(validateIdentifier, getStudentById)
    .put(validateStudentUpdate, updateStudent)
    .delete(validateIdentifier, deleteStudent);

module.exports = router;
