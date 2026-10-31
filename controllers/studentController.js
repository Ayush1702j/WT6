/**
 * Student Controller - Business Logic for CRUD Operations & Aggregations
 * Practical No. 6: RESTful CRUD API
 * Student: Ayush (PRN: 2304362)
 */

const mongoose = require('mongoose');
const { Student } = require('../models/Student');

// Helper to find student by either MongoDB ObjectId or 7-8 digit PRN
const findStudentByIdOrPRN = async (identifier) => {
    if (mongoose.Types.ObjectId.isValid(identifier)) {
        return await Student.findById(identifier);
    }
    return await Student.findOne({ prn: identifier });
};

/**
 * @desc    Create a new student record
 * @route   POST /api/v1/students
 * @access  Public
 */
const createStudent = async (req, res, next) => {
    try {
        const { prn, email } = req.body;

        // Proactive uniqueness verification
        const existingStudent = await Student.findOne({
            $or: [{ prn }, { email: email.toLowerCase() }]
        });

        if (existingStudent) {
            const conflictField = existingStudent.prn === prn ? 'PRN' : 'Email';
            return res.status(400).json({
                success: false,
                statusCode: 400,
                error: 'Conflict / Duplicate Entry',
                message: `A student with this ${conflictField} already exists in the database.`,
                field: conflictField.toLowerCase()
            });
        }

        const student = await Student.create(req.body);

        // RESTful best practice: set Location header
        res.location(`/api/v1/students/${student._id}`);

        res.status(201).json({
            success: true,
            statusCode: 201,
            message: 'Student record created successfully',
            data: student
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get all students with filtering, search, sorting, and pagination
 * @route   GET /api/v1/students
 * @access  Public
 */
const getAllStudents = async (req, res, next) => {
    try {
        const {
            search,
            department,
            year,
            division,
            status,
            minCgpa,
            maxCgpa,
            sort,
            page = 1,
            limit = 10
        } = req.query;

        // Build dynamic query filter
        const filter = {};

        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { prn: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        if (department) filter.department = department;
        if (year) filter.year = year;
        if (division) filter.division = division.toUpperCase();
        if (status) filter.status = status;

        if (minCgpa || maxCgpa) {
            filter.cgpa = {};
            if (minCgpa) filter.cgpa.$gte = parseFloat(minCgpa);
            if (maxCgpa) filter.cgpa.$lte = parseFloat(maxCgpa);
        }

        // Pagination calculations
        const pageNum = Math.max(1, parseInt(page, 10));
        const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
        const skip = (pageNum - 1) * limitNum;

        // Sorting (default: newest first)
        let sortOption = '-createdAt';
        if (sort) {
            sortOption = sort.split(',').join(' ');
        }

        const totalDocs = await Student.countDocuments(filter);
        const students = await Student.find(filter)
            .sort(sortOption)
            .skip(skip)
            .limit(limitNum);

        res.status(200).json({
            success: true,
            statusCode: 200,
            count: students.length,
            total: totalDocs,
            pagination: {
                page: pageNum,
                limit: limitNum,
                totalPages: Math.ceil(totalDocs / limitNum) || 1,
                hasNextPage: pageNum * limitNum < totalDocs,
                hasPrevPage: pageNum > 1
            },
            data: students
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get a single student by MongoDB ObjectId or PRN
 * @route   GET /api/v1/students/:id
 * @access  Public
 */
const getStudentById = async (req, res, next) => {
    try {
        const identifier = req.params.id;
        const student = await findStudentByIdOrPRN(identifier);

        if (!student) {
            return res.status(404).json({
                success: false,
                statusCode: 404,
                error: 'Not Found',
                message: `Student with identifier '${identifier}' was not found in the records.`
            });
        }

        res.status(200).json({
            success: true,
            statusCode: 200,
            data: student
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Update a student record by ID or PRN
 * @route   PUT /api/v1/students/:id
 * @access  Public
 */
const updateStudent = async (req, res, next) => {
    try {
        const identifier = req.params.id;

        // Check if student exists
        const existingStudent = await findStudentByIdOrPRN(identifier);
        if (!existingStudent) {
            return res.status(404).json({
                success: false,
                statusCode: 404,
                error: 'Not Found',
                message: `Cannot update. Student with identifier '${identifier}' was not found.`
            });
        }

        // If PRN or email is being updated, verify uniqueness across other records
        if (req.body.prn && req.body.prn !== existingStudent.prn) {
            const prnConflict = await Student.findOne({
                prn: req.body.prn,
                _id: { $ne: existingStudent._id }
            });
            if (prnConflict) {
                return res.status(400).json({
                    success: false,
                    statusCode: 400,
                    error: 'Conflict',
                    message: `Another student is already registered with PRN '${req.body.prn}'.`
                });
            }
        }

        if (req.body.email && req.body.email.toLowerCase() !== existingStudent.email) {
            const emailConflict = await Student.findOne({
                email: req.body.email.toLowerCase(),
                _id: { $ne: existingStudent._id }
            });
            if (emailConflict) {
                return res.status(400).json({
                    success: false,
                    statusCode: 400,
                    error: 'Conflict',
                    message: `Another student is already registered with email '${req.body.email}'.`
                });
            }
        }

        const updatedStudent = await Student.findByIdAndUpdate(
            existingStudent._id,
            req.body,
            {
                new: true,
                runValidators: true
            }
        );

        res.status(200).json({
            success: true,
            statusCode: 200,
            message: 'Student record updated successfully',
            data: updatedStudent
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Delete a student record by ID or PRN
 * @route   DELETE /api/v1/students/:id
 * @access  Public
 */
const deleteStudent = async (req, res, next) => {
    try {
        const identifier = req.params.id;
        const student = await findStudentByIdOrPRN(identifier);

        if (!student) {
            return res.status(404).json({
                success: false,
                statusCode: 404,
                error: 'Not Found',
                message: `Cannot delete. Student with identifier '${identifier}' does not exist.`
            });
        }

        await Student.findByIdAndDelete(student._id);

        res.status(200).json({
            success: true,
            statusCode: 200,
            message: `Student '${student.name}' (PRN: ${student.prn}) was deleted successfully.`,
            deletedId: student._id
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Aggregate statistical analytics across student records
 * @route   GET /api/v1/students/analytics/stats
 * @access  Public
 */
const getStudentStats = async (req, res, next) => {
    try {
        const stats = await Student.aggregate([
            {
                $group: {
                    _id: null,
                    totalStudents: { $sum: 1 },
                    averageCGPA: { $avg: '$cgpa' },
                    highestCGPA: { $max: '$cgpa' },
                    lowestCGPA: { $min: '$cgpa' }
                }
            }
        ]);

        const departmentCounts = await Student.aggregate([
            {
                $group: {
                    _id: '$department',
                    count: { $sum: 1 },
                    avgCGPA: { $avg: '$cgpa' }
                }
            },
            { $sort: { count: -1 } }
        ]);

        const yearCounts = await Student.aggregate([
            {
                $group: {
                    _id: '$year',
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        const overall = stats[0] || {
            totalStudents: 0,
            averageCGPA: 0,
            highestCGPA: 0,
            lowestCGPA: 0
        };

        res.status(200).json({
            success: true,
            statusCode: 200,
            analytics: {
                totalStudents: overall.totalStudents,
                averageCGPA: parseFloat(overall.averageCGPA.toFixed(2)),
                highestCGPA: parseFloat(overall.highestCGPA.toFixed(2)),
                lowestCGPA: parseFloat(overall.lowestCGPA.toFixed(2)),
                byDepartment: departmentCounts.map(d => ({
                    department: d._id,
                    count: d.count,
                    avgCGPA: parseFloat(d.avgCGPA.toFixed(2))
                })),
                byYear: yearCounts.map(y => ({
                    year: y._id,
                    count: y.count
                }))
            }
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createStudent,
    getAllStudents,
    getStudentById,
    updateStudent,
    deleteStudent,
    getStudentStats
};
