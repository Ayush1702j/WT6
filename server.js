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

// 4. Interactive API Documentation & Live CRUD Test UI
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
                --border: #cbd5e1;
                --post: #16a34a;
                --get: #2563eb;
                --put: #ea580c;
                --delete: #dc2626;
            }
            * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
            body { background-color: var(--bg); color: var(--text); padding: 25px 20px; line-height: 1.5; }
            .container { max-width: 1050px; margin: 0 auto; }
            .header { background: linear-gradient(135deg, var(--primary), var(--primary-dark)); color: white; padding: 25px 30px; border-radius: 12px; margin-bottom: 22px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }
            .header h1 { font-size: 1.7rem; margin-bottom: 6px; }
            .header p { color: #cbd5e1; font-size: 0.95rem; }
            .meta-bar { display: flex; flex-wrap: wrap; gap: 15px; margin-top: 15px; font-size: 0.85rem; }
            .meta-pill { background: rgba(255,255,255,0.18); padding: 4px 12px; border-radius: 20px; }
            .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
            @media(max-width: 768px) { .grid-2 { grid-template-columns: 1fr; } }
            .card { background: var(--card-bg); border-radius: 10px; border: 1px solid var(--border); padding: 20px; margin-bottom: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
            .card h2 { font-size: 1.2rem; margin-bottom: 15px; color: var(--primary); border-bottom: 2px solid var(--border); padding-bottom: 8px; display: flex; justify-content: space-between; align-items: center; }
            .badge { font-weight: 700; font-size: 0.75rem; padding: 4px 10px; border-radius: 4px; color: white; min-width: 65px; text-align: center; display: inline-block; }
            .badge-get { background-color: var(--get); }
            .badge-post { background-color: var(--post); }
            .badge-put { background-color: var(--put); }
            .badge-delete { background-color: var(--delete); }
            .btn { display: inline-block; background: var(--accent); color: white; text-decoration: none; padding: 7px 14px; border-radius: 6px; font-size: 0.85rem; font-weight: 500; border: none; cursor: pointer; transition: 0.2s; }
            .btn:hover { background: #1d4ed8; }
            .btn-success { background: var(--post); }
            .btn-success:hover { background: #15803d; }
            .btn-danger { background: var(--delete); }
            .btn-danger:hover { background: #b91c1c; }
            .btn-outline { background: transparent; color: var(--accent); border: 1px solid var(--accent); }
            .btn-outline:hover { background: #eff6ff; }
            .btn-sm { padding: 4px 8px; font-size: 0.78rem; }
            input, select { width: 100%; padding: 8px 10px; border: 1px solid var(--border); border-radius: 6px; font-size: 0.88rem; margin-bottom: 10px; }
            input:focus, select:focus { outline: none; border-color: var(--accent); }
            label { font-size: 0.8rem; font-weight: 600; color: #475569; display: block; margin-bottom: 3px; }
            .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 0.86rem; }
            th, td { border: 1px solid var(--border); padding: 8px 10px; text-align: left; }
            th { background-color: #f1f5f9; color: var(--primary); }
            tr:nth-child(even) { background-color: #f8fafc; }
            pre { background: #1e293b; color: #f8fafc; padding: 12px; border-radius: 8px; font-size: 0.82rem; overflow-x: auto; max-height: 250px; font-family: Consolas, monospace; }
            .console-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; font-size: 0.85rem; font-weight: bold; }
            .status-tag { padding: 3px 8px; border-radius: 4px; font-weight: bold; color: white; }
            .status-200 { background-color: #16a34a; }
            .status-201 { background-color: #15803d; }
            .status-400 { background-color: #dc2626; }
            .status-404 { background-color: #eab308; color: #000; }
            .algo-box { background: #f8fafc; border-left: 4px solid var(--accent); padding: 12px 15px; margin-bottom: 10px; border-radius: 0 6px 6px 0; font-size: 0.88rem; }
            .algo-box strong { color: var(--primary); }
        </style>
    </head>
    <body>
        <div class="container">
            <!-- Header -->
            <div class="header">
                <h1>MIT Academy of Engineering &mdash; Student Records RESTful API</h1>
                <p>Web Technology (2304362L) &bull; Practical No. 6: RESTful CRUD API Deployed &amp; Tested with Postman</p>
                <div class="meta-bar">
                    <span class="meta-pill">&bull; Student: <strong>Ayush Jugseniye</strong></span>
                    <span class="meta-pill">&bull; PRN: <strong>202401040128</strong></span>
                    <span class="meta-pill">&bull; Class: <strong>T.Y. B.Tech (Batch WT1)</strong></span>
                    <span class="meta-pill">&bull; Server: <strong style="color: #4ade80;">Active (Port ${PORT})</strong></span>
                </div>
            </div>

            <!-- LIVE CRUD TESTER & CONTROLS -->
            <div class="grid-2">
                <!-- 1. CREATE (POST) -->
                <div class="card">
                    <h2>
                        <span><span class="badge badge-post">POST</span> Create Student</span>
                        <div>
                            <button onclick="fillSample()" class="btn btn-outline btn-sm">Valid Preset</button>
                            <button onclick="fillInvalid()" class="btn btn-outline btn-sm" style="color:#dc2626; border-color:#dc2626;">Invalid Preset</button>
                        </div>
                    </h2>
                    <form id="createForm" onsubmit="handleCreate(event)">
                        <div class="form-grid">
                            <div>
                                <label>PRN (7-16 digits)</label>
                                <input type="text" id="postPrn" placeholder="e.g. 202401040999" required>
                            </div>
                            <div>
                                <label>Full Name</label>
                                <input type="text" id="postName" placeholder="e.g. Harshit Jain" required>
                            </div>
                        </div>
                        <div class="form-grid">
                            <div>
                                <label>Email Address</label>
                                <input type="email" id="postEmail" placeholder="harshit@mitaoe.ac.in" required>
                            </div>
                            <div>
                                <label>Mobile Phone</label>
                                <input type="text" id="postPhone" placeholder="9876543210" required>
                            </div>
                        </div>
                        <div class="form-grid">
                            <div>
                                <label>Department</label>
                                <select id="postDept">
                                    <option value="Computer Engineering">Computer Engineering</option>
                                    <option value="Information Technology">Information Technology</option>
                                    <option value="Electronics & Telecommunication">Electronics &amp; Telecommunication</option>
                                    <option value="Mechanical Engineering">Mechanical Engineering</option>
                                    <option value="Civil Engineering">Civil Engineering</option>
                                </select>
                            </div>
                            <div>
                                <label>CGPA (0.00 - 10.00)</label>
                                <input type="number" step="0.01" id="postCgpa" placeholder="9.15" required>
                            </div>
                        </div>
                        <button type="submit" class="btn btn-success" style="width:100%; margin-top:5px;">🚀 Execute POST /api/v1/students</button>
                    </form>
                </div>

                <!-- 2. READ BY ID / SEARCH & LIVE CONSOLE -->
                <div class="card">
                    <h2><span><span class="badge badge-get">GET</span> Search by PRN or ObjectId</span></h2>
                    <div style="display:flex; gap:10px;">
                        <input type="text" id="searchId" placeholder="Enter PRN (e.g. 202401040128) or ObjectId" value="202401040128" style="margin-bottom:0;">
                        <button onclick="handleSearch()" class="btn" style="white-space:nowrap;">Fetch Student</button>
                    </div>

                    <div style="margin-top:20px;">
                        <div class="console-header">
                            <span>Live HTTP Response Inspector:</span>
                            <span id="responseStatusBadge" class="status-tag status-200" style="display:none;">200 OK</span>
                        </div>
                        <pre id="responseBox">// Response JSON will appear here in real-time...</pre>
                    </div>
                </div>
            </div>

            <!-- 3. READ ALL (GET) TABLE -->
            <div class="card">
                <h2>
                    <span><span class="badge badge-get">GET</span> Live MongoDB Students Collection (<span id="studentCount">0</span> records)</span>
                    <div>
                        <button onclick="fetchStudents()" class="btn btn-outline btn-sm">🔄 Refresh List</button>
                        <a href="/health" target="_blank" class="btn btn-outline btn-sm">Health Check</a>
                        <a href="/api/v1/students/analytics/stats" target="_blank" class="btn btn-outline btn-sm">View Analytics</a>
                    </div>
                </h2>

                <div style="overflow-x:auto;">
                    <table>
                        <thead>
                            <tr>
                                <th>PRN</th>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Department</th>
                                <th>Batch</th>
                                <th>CGPA</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody id="studentTableBody">
                            <tr><td colspan="7" style="text-align:center;">Loading records from MongoDB...</td></tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- 4. STEP-BY-STEP CRUD ALGORITHMS FOR VIVA -->
            <div class="card">
                <h2><span>📖 Step-by-Step CRUD Algorithms (To Explain in Viva / Demo)</span></h2>
                
                <div class="algo-box">
                    <strong>1. CREATE (POST /api/v1/students):</strong>
                    Client sends JSON &rarr; <code>express-validator</code> checks PRN (7-16 digits), email, phone, CGPA &rarr; Query MongoDB for duplicate PRN/Email &rarr; If conflict, return <strong>400 Bad Request</strong> &rarr; Else save via <code>Student.create()</code> &rarr; Return <strong>201 Created</strong> with <code>Location</code> header.
                </div>

                <div class="algo-box">
                    <strong>2. READ ALL (GET /api/v1/students):</strong>
                    Extract query filters (<code>?department=</code>, <code>?search=</code>, <code>?page=</code>) &rarr; Calculate pagination offset (<code>skip</code>) &rarr; Execute <code>Student.find(filter)</code> &rarr; Return <strong>200 OK</strong> with total count, pagination metadata, and array.
                </div>

                <div class="algo-box">
                    <strong>3. READ BY ID / PRN (GET /api/v1/students/:id):</strong>
                    Check identifier syntax (24-hex ObjectId or numeric PRN) &rarr; Query via <code>findById()</code> or <code>findOne({ prn })</code> &rarr; If null, return <strong>404 Not Found</strong> &rarr; Else return <strong>200 OK</strong> with student document.
                </div>

                <div class="algo-box">
                    <strong>4. UPDATE (PUT /api/v1/students/:id):</strong>
                    Validate incoming fields &rarr; Find existing record &rarr; If not found, return <strong>404 Not Found</strong> &rarr; Ensure updated PRN/email does not conflict with another student &rarr; Execute <code>findByIdAndUpdate()</code> with <code>{ new: true, runValidators: true }</code> &rarr; Return <strong>200 OK</strong>.
                </div>

                <div class="algo-box">
                    <strong>5. DELETE (DELETE /api/v1/students/:id):</strong>
                    Verify ID &rarr; Check student existence &rarr; If not found, return <strong>404 Not Found</strong> &rarr; Execute <code>findByIdAndDelete()</code> &rarr; Return <strong>200 OK</strong> with confirmation message.
                </div>
            </div>
        </div>

        <script>
            // Helper to update the Live Console
            function displayResponse(status, data) {
                const badge = document.getElementById('responseStatusBadge');
                badge.style.display = 'inline-block';
                badge.innerText = status;
                badge.className = 'status-tag ' + (status.startsWith('2') ? 'status-200' : status.startsWith('404') ? 'status-404' : 'status-400');
                document.getElementById('responseBox').innerText = JSON.stringify(data, null, 2);
            }

            // Fetch and render student records
            async function fetchStudents() {
                try {
                    const res = await fetch('/api/v1/students?limit=50');
                    const data = await res.json();
                    const tbody = document.getElementById('studentTableBody');
                    document.getElementById('studentCount').innerText = data.total || (data.data ? data.data.length : 0);

                    if (data.data && data.data.length > 0) {
                        tbody.innerHTML = data.data.map(s => \`
                            <tr>
                                <td><strong>\${s.prn}</strong></td>
                                <td>\${s.name}</td>
                                <td>\${s.email}</td>
                                <td>\${s.department}</td>
                                <td><span class="badge" style="background:#475569;">\${s.division || 'WT1'}</span></td>
                                <td><strong style="color:#2563eb;">\${s.cgpa.toFixed(2)}</strong></td>
                                <td>
                                    <button onclick="handleEdit('\${s.id}', '\${s.cgpa}')" class="btn btn-outline btn-sm" style="color:#ea580c; border-color:#ea580c;">Edit (PUT)</button>
                                    <button onclick="handleDelete('\${s.id}', '\${s.name}', '\${s.prn}')" class="btn btn-danger btn-sm">Delete</button>
                                </td>
                            </tr>
                        \`).join('');
                    } else {
                        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;">No students registered in MongoDB.</td></tr>';
                    }
                } catch (e) {
                    console.error(e);
                }
            }

            // Handle Create (POST)
            async function handleCreate(e) {
                e.preventDefault();
                const payload = {
                    prn: document.getElementById('postPrn').value.trim(),
                    name: document.getElementById('postName').value.trim(),
                    email: document.getElementById('postEmail').value.trim(),
                    phone: document.getElementById('postPhone').value.trim(),
                    department: document.getElementById('postDept').value,
                    year: 'T.Y. B.Tech',
                    division: 'WT1',
                    cgpa: parseFloat(document.getElementById('postCgpa').value),
                    skills: ['Node.js', 'Express', 'MongoDB', 'Postman']
                };

                const res = await fetch('/api/v1/students', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                const data = await res.json();
                displayResponse(res.status + ' ' + (res.status === 201 ? 'Created' : 'Bad Request'), data);
                if (res.ok) {
                    fetchStudents();
                    alert('Student created successfully! Status: 201 Created');
                } else {
                    alert('Error (' + res.status + '): ' + (data.message || 'Validation failed'));
                }
            }

            // Handle Search (GET by PRN or ID)
            async function handleSearch() {
                const id = document.getElementById('searchId').value.trim();
                if (!id) return;
                const res = await fetch('/api/v1/students/' + id);
                const data = await res.json();
                displayResponse(res.status + ' ' + (res.ok ? 'OK' : 'Error'), data);
            }

            // Handle Update (PUT)
            async function handleEdit(id, currentCgpa) {
                const newCgpa = prompt('Enter updated CGPA for student (e.g. 9.75):', currentCgpa);
                if (!newCgpa) return;

                const res = await fetch('/api/v1/students/' + id, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ cgpa: parseFloat(newCgpa) })
                });
                const data = await res.json();
                displayResponse(res.status + ' ' + (res.ok ? 'OK' : 'Error'), data);
                if (res.ok) {
                    fetchStudents();
                    alert('Student updated successfully via PUT! Status: 200 OK');
                }
            }

            // Handle Delete (DELETE)
            async function handleDelete(id, name, prn) {
                if (!confirm(\`Are you sure you want to DELETE student '\${name}' (PRN: \${prn})?\`)) return;

                const res = await fetch('/api/v1/students/' + id, { method: 'DELETE' });
                const data = await res.json();
                displayResponse(res.status + ' ' + (res.ok ? 'OK' : 'Error'), data);
                if (res.ok) {
                    fetchStudents();
                    alert(\`Student \${name} deleted successfully! Status: 200 OK\`);
                }
            }

            // Presets
            function fillSample() {
                const randomPrn = '202401' + Math.floor(100000 + Math.random() * 900000);
                document.getElementById('postPrn').value = randomPrn;
                document.getElementById('postName').value = 'Test Student';
                document.getElementById('postEmail').value = 'student.' + randomPrn.slice(-4) + '@mitaoe.ac.in';
                document.getElementById('postPhone').value = '98' + Math.floor(10000000 + Math.random() * 90000000);
                document.getElementById('postCgpa').value = '9.20';
            }

            function fillInvalid() {
                document.getElementById('postPrn').value = '123'; // invalid length
                document.getElementById('postName').value = 'A'; // too short
                document.getElementById('postEmail').value = 'invalid-email-format';
                document.getElementById('postPhone').value = '1234';
                document.getElementById('postCgpa').value = '15.00'; // out of bounds
            }

            // Auto-load on page start
            fetchStudents();
        </script>
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
