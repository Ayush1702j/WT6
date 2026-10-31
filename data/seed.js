/**
 * Seed Script to Populate Initial Student Records into MongoDB
 * Run via: npm run seed
 * Student: Ayush (PRN: 2304362)
 */

require('dotenv').config();
const mongoose = require('mongoose');
const { Student } = require('../models/Student');

const sampleStudents = [
    {
        prn: '2304362',
        name: 'Ayush',
        email: 'ayush.mit@mitaoe.ac.in',
        phone: '9876543210',
        department: 'Computer Engineering',
        year: 'T.Y. B.Tech',
        division: 'B',
        cgpa: 9.42,
        skills: ['Node.js', 'Express', 'MongoDB', 'REST APIs', 'Postman'],
        status: 'Active'
    },
    {
        prn: '2304101',
        name: 'Rohan Sharma',
        email: 'rohan.sharma@mitaoe.ac.in',
        phone: '9822334455',
        department: 'Computer Engineering',
        year: 'T.Y. B.Tech',
        division: 'B',
        cgpa: 8.95,
        skills: ['React', 'Express', 'Docker'],
        status: 'Active'
    },
    {
        prn: '2304205',
        name: 'Priya Kulkarni',
        email: 'priya.k@mitaoe.ac.in',
        phone: '9765432190',
        department: 'Information Technology',
        year: 'T.Y. B.Tech',
        division: 'A',
        cgpa: 9.15,
        skills: ['Python', 'Django', 'MongoDB'],
        status: 'Active'
    },
    {
        prn: '2304310',
        name: 'Aditya Patil',
        email: 'aditya.patil@mitaoe.ac.in',
        phone: '9988776655',
        department: 'Electronics & Telecommunication',
        year: 'T.Y. B.Tech',
        division: 'B',
        cgpa: 8.45,
        skills: ['IoT', 'Embedded C', 'WebSockets'],
        status: 'Active'
    },
    {
        prn: '2304415',
        name: 'Sneha Deshmukh',
        email: 'sneha.d@mitaoe.ac.in',
        phone: '9123456789',
        department: 'Mechanical Engineering',
        year: 'S.Y. B.Tech',
        division: 'A',
        cgpa: 8.78,
        skills: ['CAD', 'Automation', 'Python'],
        status: 'Active'
    }
];

const seedDB = async () => {
    try {
        const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/student_records_api';
        console.log(`[Seed] Connecting to MongoDB: ${uri}`);
        
        await mongoose.connect(uri);
        console.log('[Seed] Connection established.');

        // Clear existing students
        const deleted = await Student.deleteMany({});
        console.log(`[Seed] Cleared ${deleted.deletedCount} existing records.`);

        // Insert sample students
        const inserted = await Student.insertMany(sampleStudents);
        console.log(`[Seed] Successfully inserted ${inserted.length} initial student documents:`);
        inserted.forEach((s, idx) => {
            console.log(`  ${idx + 1}. [${s.prn}] ${s.name} - ${s.department} (${s.year}) - CGPA: ${s.cgpa} (ID: ${s._id})`);
        });

        console.log('\n[Seed] Database initialization complete!');
        process.exit(0);
    } catch (error) {
        console.error('[Seed Error] Database seeding failed:', error.message);
        process.exit(1);
    }
};

seedDB();
