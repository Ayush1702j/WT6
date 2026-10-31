/**
 * Main Application Entry Point - Express RESTful API
 * Subject: Web Technology (2304362L) - Practical No. 6
 * Student: Ayush Jugseniye (PRN: 202401040128) | Batch: WT1 | MIT Academy of Engineering, Pune
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const mongoose = require('mongoose');

const connectDB = require('./config/db');
const requestLogger = require('./middleware/logger');
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');
const studentRoutes = require('./routes/studentRoutes');

const app = express();
const PORT = process.env.PORT || 5050;
const NODE_ENV = process.env.NODE_ENV || 'development';

// 1. Establish Database Connection
connectDB();

// 2. Global Middleware Pipeline
app.use(helmet({
    contentSecurityPolicy: false // Allow inline scripts for dashboard presentation
}));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use(requestLogger);

// 3. Health Check Endpoint
app.get('/health', (req, res) => {
    const dbState = mongoose.connection.readyState;
    const dbStateMap = {
        0: 'Disconnected',
        1: 'Connected',
        2: 'Connecting',
        3: 'Disconnecting'
    };

    res.status(200).json({
        success: true,
        statusCode: 200,
        status: 'UP',
        service: 'Student Records RESTful CRUD API',
        uptime: `${process.uptime().toFixed(1)}s`,
        timestamp: new Date().toISOString(),
        environment: NODE_ENV,
        database: {
            state: dbStateMap[dbState] || 'Unknown',
            host: mongoose.connection.host,
            name: mongoose.connection.name
        }
    });
});

// 4. Interactive API Documentation / Landing Page
app.get('/', (req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Student Records REST API | Practical 6</title>
        <style>
            :root {
                --primary: #1e3a8a;
                --primary-dark: #172554;
                --accent: #2563eb;
                --bg: #f8fafc;
                --card-bg: #ffffff;
                --text: #0f172a;
                --muted: #64748b;
                --border: #e2e8f0;
                --success: #16a34a;
                --post: #16a34a;
                --get: #2563eb;
                --put: #ea580c;
                --delete: #dc2626;
            }
            * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
            body { background-color: var(--bg); color: var(--text); padding: 30px 20px; line-height: 1.6; }
            .container { max-width: 1000px; margin: 0 auto; }
            .header { background: linear-gradient(135deg, var(--primary), var(--primary-dark)); color: white; padding: 30px; border-radius: 12px; margin-bottom: 25px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }
            .header h1 { font-size: 1.8rem; margin-bottom: 8px; }
            .header p { color: #cbd5e1; font-size: 0.95rem; }
            .meta-bar { display: flex; flex-wrap: wrap; gap: 15px; margin-top: 15px; font-size: 0.85rem; }
            .meta-pill { background: rgba(255,255,255,0.15); padding: 4px 12px; border-radius: 20px; }
            .card { background: var(--card-bg); border-radius: 10px; border: 1px solid var(--border); padding: 25px; margin-bottom: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
            .card h2 { font-size: 1.3rem; margin-bottom: 15px; color: var(--primary); border-bottom: 2px solid var(--border); padding-bottom: 8px; }
            .route-item { display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; border: 1px solid var(--border); border-radius: 6px; margin-bottom: 10px; background: #fafafa; }
            .badge { font-weight: 700; font-size: 0.75rem; padding: 4px 10px; border-radius: 4px; color: white; min-width: 65px; text-align: center; }
            .badge-get { background-color: var(--get); }
            .badge-post { background-color: var(--post); }
            .badge-put { background-color: var(--put); }
            .badge-delete { background-color: var(--delete); }
            .route-url { font-family: monospace; font-size: 0.95rem; font-weight: 600; margin-left: 12px; color: #1e293b; }
            .route-desc { color: var(--muted); font-size: 0.85rem; }
            .btn { display: inline-block; background: var(--accent); color: white; text-decoration: none; padding: 6px 14px; border-radius: 6px; font-size: 0.85rem; font-weight: 500; transition: 0.2s; }
            .btn:hover { background: #1d4ed8; }
            .btn-outline { background: transparent; color: var(--accent); border: 1px solid var(--accent); }
            .btn-outline:hover { background: #eff6ff; }
            pre { background: #1e293b; color: #f8fafc; padding: 15px; border-radius: 8px; font-size: 0.85rem; overflow-x: auto; margin-top: 10px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>MIT Academy of Engineering &mdash; Student Records RESTful API</h1>
                <p>Web Technology (2304362L) &bull; Practical No. 6: RESTful CRUD API Deployed &amp; Tested with Postman</p>
                <div class="meta-bar">
                    <span class="meta-pill">&bull; Student: <strong>Ayush Jugseniye</strong></span>
                    <span class="meta-pill">&bull; PRN: <strong>202401040128</strong></span>
                    <span class="meta-pill">&bull; Class: <strong>T.Y. B.Tech (Batch WT1)</strong></span>
                    <span class="meta-pill">&bull; Status: <strong style="color: #4ade80;">Online</strong></span>
                </div>
            </div>

            <div class="card">
                <h2>REST API Endpoints Specification</h2>
                
                <div class="route-item">
                    <div>
                        <span class="badge badge-get">GET</span>
                        <span class="route-url">/api/v1/students</span>
                        <div class="route-desc">Fetch all students (supports ?search=, ?department=, ?page=, ?limit=)</div>
                    </div>
                    <a href="/api/v1/students" target="_blank" class="btn">Test GET</a>
                </div>

                <div class="route-item">
                    <div>
                        <span class="badge badge-get">GET</span>
                        <span class="route-url">/api/v1/students/analytics/stats</span>
                        <div class="route-desc">Statistical analytics (Total, Avg CGPA, Dept &amp; Year Breakdown)</div>
                    </div>
                    <a href="/api/v1/students/analytics/stats" target="_blank" class="btn">Test Stats</a>
                </div>

                <div class="route-item">
                    <div>
                        <span class="badge badge-get">GET</span>
                        <span class="route-url">/api/v1/students/:id</span>
                        <div class="route-desc">Fetch single student by MongoDB ObjectId or 7-16 digit PRN</div>
                    </div>
                    <a href="/api/v1/students/202401040128" target="_blank" class="btn btn-outline">Test PRN Lookup</a>
                </div>

                <div class="route-item">
                    <div>
                        <span class="badge badge-post">POST</span>
                        <span class="route-url">/api/v1/students</span>
                        <div class="route-desc">Create new student record with schema &amp; duplicate validation (Status: 201)</div>
                    </div>
                    <span class="badge" style="background:#64748b;">Postman</span>
                </div>

                <div class="route-item">
                    <div>
                        <span class="badge badge-put">PUT</span>
                        <span class="route-url">/api/v1/students/:id</span>
                        <div class="route-desc">Update existing student details by ID or PRN (Status: 200)</div>
                    </div>
                    <span class="badge" style="background:#64748b;">Postman</span>
                </div>

                <div class="route-item">
                    <div>
                        <span class="badge badge-delete">DELETE</span>
                        <span class="route-url">/api/v1/students/:id</span>
                        <div class="route-desc">Delete student record by ID or PRN (Status: 200)</div>
                    </div>
                    <span class="badge" style="background:#64748b;">Postman</span>
                </div>

                <div class="route-item">
                    <div>
                        <span class="badge badge-get">GET</span>
                        <span class="route-url">/health</span>
                        <div class="route-desc">API Health Check &amp; MongoDB connection state</div>
                    </div>
                    <a href="/health" target="_blank" class="btn btn-outline">Check Health</a>
                </div>
            </div>

            <div class="card">
                <h2>Sample JSON Request Body (POST /api/v1/students)</h2>
                <pre>{
  "prn": "2304999",
  "name": "Kavita Verma",
  "email": "kavita.verma@mitaoe.ac.in",
  "phone": "9811223344",
  "department": "Computer Engineering",
  "year": "T.Y. B.Tech",
  "division": "B",
  "cgpa": 9.25,
  "skills": ["Node.js", "Express", "MongoDB", "Postman"],
  "status": "Active"
}</pre>
            </div>
        </div>
    </body>
    </html>
    `);
});

// 5. Mount API Routes
app.use('/api/v1/students', studentRoutes);

// 6. Centralized 404 and Error Interception
app.use(notFoundHandler);
app.use(errorHandler);

// 7. Start HTTP Server
const server = app.listen(PORT, () => {
    console.log(`============================================================`);
    console.log(`  MIT AOE - Student Records RESTful CRUD API Live`);
    console.log(`  Student: Ayush Jugseniye | PRN: 202401040128 | Batch: WT1`);
    console.log(`  Server running at: http://localhost:${PORT}`);
    console.log(`  API Base: http://localhost:${PORT}/api/v1/students`);
    console.log(`  Health:   http://localhost:${PORT}/health`);
    console.log(`  Environment: ${NODE_ENV}`);
    console.log(`============================================================`);
});

module.exports = app;
