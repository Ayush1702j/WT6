/**
 * Student Model Schema Definition using Mongoose
 * Practical No. 6: RESTful CRUD API
 * Student: Ayush (PRN: 2304362)
 */

const mongoose = require('mongoose');

const allowedDepartments = [
    'Computer Engineering',
    'Information Technology',
    'Mechanical Engineering',
    'Civil Engineering',
    'Electronics & Telecommunication',
    'Chemical Engineering'
];

const allowedYears = [
    'F.Y. B.Tech',
    'S.Y. B.Tech',
    'T.Y. B.Tech',
    'B.Tech'
];

const studentSchema = new mongoose.Schema(
    {
        prn: {
            type: String,
            required: [true, 'PRN is required'],
            unique: true,
            trim: true,
            match: [/^\d{7,8}$/, 'PRN must be 7 to 8 numeric digits']
        },
        name: {
            type: String,
            required: [true, 'Student full name is required'],
            trim: true,
            minlength: [3, 'Student name must be at least 3 characters'],
            maxlength: [60, 'Student name cannot exceed 60 characters'],
            match: [/^[A-Za-z\s.]+$/, 'Name can only contain alphabets, spaces, and dots']
        },
        email: {
            type: String,
            required: [true, 'Email address is required'],
            unique: true,
            trim: true,
            lowercase: true,
            match: [
                /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                'Please provide a valid email address'
            ]
        },
        phone: {
            type: String,
            required: [true, 'Mobile number is required'],
            trim: true,
            match: [/^[6-9]\d{9}$/, 'Phone number must be a valid 10-digit Indian mobile number']
        },
        department: {
            type: String,
            required: [true, 'Department is required'],
            enum: {
                values: allowedDepartments,
                message: '{VALUE} is not a valid department'
            }
        },
        year: {
            type: String,
            required: [true, 'Academic year is required'],
            enum: {
                values: allowedYears,
                message: '{VALUE} is not a valid academic year'
            }
        },
        division: {
            type: String,
            default: 'B',
            uppercase: true,
            enum: ['A', 'B', 'C', 'D']
        },
        cgpa: {
            type: Number,
            required: [true, 'CGPA is required'],
            min: [0.0, 'CGPA cannot be less than 0.00'],
            max: [10.0, 'CGPA cannot exceed 10.00'],
            set: v => parseFloat(Number(v).toFixed(2))
        },
        skills: {
            type: [String],
            default: ['Web Technology', 'REST APIs', 'Node.js']
        },
        status: {
            type: String,
            enum: ['Active', 'Inactive', 'Graduated'],
            default: 'Active'
        }
    },
    {
        timestamps: true,
        toJSON: {
            virtuals: true,
            transform: function (doc, ret) {
                ret.id = ret._id;
                delete ret.__v;
                return ret;
            }
        }
    }
);

// Compound index for department and year filtering
studentSchema.index({ department: 1, year: 1 });

const Student = mongoose.model('Student', studentSchema);

module.exports = {
    Student,
    allowedDepartments,
    allowedYears
};
