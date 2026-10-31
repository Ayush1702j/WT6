/**
 * MongoDB Database Connection Manager using Mongoose
 * Subject: Web Technology (2304362L) - Practical No. 6
 * Student: Ayush (PRN: 2304362)
 */

const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/student_records_api';
        
        const conn = await mongoose.connect(uri, {
            serverSelectionTimeoutMS: 5000,
        });

        console.log(`[Database] MongoDB Connected Successfully: ${conn.connection.host}:${conn.connection.port}/${conn.connection.name}`);
        return conn;
    } catch (error) {
        console.error(`[Database Error] Failed to connect to MongoDB: ${error.message}`);
        console.error(`[Troubleshooting] Ensure MongoDB service is running (or check your MONGODB_URI).`);
        process.exit(1);
    }
};

mongoose.connection.on('disconnected', () => {
    console.warn('[Database] MongoDB connection disconnected.');
});

mongoose.connection.on('error', (err) => {
    console.error(`[Database Error] Connection runtime error: ${err.message}`);
});

module.exports = connectDB;
