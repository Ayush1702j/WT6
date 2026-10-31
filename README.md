# Practical No. 6: RESTful CRUD API for Student Records

**MIT Academy of Engineering, Pune**  
**School of Computer Engineering**  
- **Course**: Web Technology (`2304362L`)
- **Class**: T.Y. B.Tech Computer Engineering (Batch B)
- **Academic Year**: 2025–26
- **Practical No.**: 6 – RESTful API
- **Course Outcome**: CO4
- **Student Name**: Ayush
- **PRN**: `2304362`
- **Max Marks**: 10

---

## 1. Project Overview & Aim

The objective of this laboratory assignment is to design, implement, deploy, and rigorously test an enterprise-grade **RESTful CRUD API for Student Records** using **Node.js**, **Express.js**, and **MongoDB (Mongoose)**. The API strictly adheres to standard REST architecture principles: resource-based URI endpoints, appropriate HTTP verbs (`GET`, `POST`, `PUT`, `DELETE`), semantic status codes (`200 OK`, `201 Created`, `400 Bad Request`, `404 Not Found`, `500 Server Error`), request validation, MongoDB aggregations, and Postman automated testing.

---

## 2. RESTful Endpoint Specification Table

| HTTP Method | Endpoint URI | Purpose / Action | Expected Status Codes | Request Body / Query Params |
| :--- | :--- | :--- | :---: | :--- |
| `GET` | `/health` | System health and MongoDB connection status | `200 OK` | None |
| `GET` | `/api/v1/students` | Retrieve all student records | `200 OK`, `500 Server Error` | Query: `search`, `department`, `year`, `page`, `limit`, `sort` |
| `GET` | `/api/v1/students/:id` | Fetch single student by ObjectId or PRN | `200 OK`, `400 Bad Request`, `404 Not Found` | URL Param: `id` (24-hex ObjectId or 7-8 digit PRN) |
| `POST` | `/api/v1/students` | Insert a new student record into database | `201 Created`, `400 Bad Request` | JSON: `prn`, `name`, `email`, `phone`, `department`, `year`, `cgpa`, `skills` |
| `PUT` | `/api/v1/students/:id` | Update an existing student record | `200 OK`, `400 Bad Request`, `404 Not Found` | JSON: Updated fields (validates schema & uniqueness) |
| `DELETE` | `/api/v1/students/:id` | Permanently remove a student record | `200 OK`, `400 Bad Request`, `404 Not Found` | URL Param: `id` |
| `GET` | `/api/v1/students/analytics/stats`| Aggregate statistical summary across records | `200 OK` | None (Returns Total, Avg/Max/Min CGPA, Dept counts) |

---

## 3. Technology Stack

- **Runtime**: Node.js (v24.21+)
- **Backend Framework**: Express.js (v4.21)
- **Database & ODM**: MongoDB with Mongoose (v8.10)
- **Validation**: `express-validator` (v7.2)
- **Security & Logging**: `helmet`, `cors`, `morgan`, custom microsecond request timer
- **API Testing**: Postman Collection v2.1.0 (with automated JavaScript test scripts)
- **Deployment**: Render / Railway / MongoDB Atlas (`render.yaml`, `Procfile`)

---

## 4. Setup and Installation Instructions

### Prerequisites
1. Ensure **Node.js** (v18+ or v24+) is installed.
2. Ensure **MongoDB** service is active locally on `127.0.0.1:27017` or provide a cloud connection string from [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).

### Step 1: Open in VS Code
```powershell
code "C:\Users\ayush\.gemini\antigravity\scratch\wt_assignment_6_rest_api"
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Configure Environment Variables
Copy `.env.example` to `.env` (already pre-configured for local testing):
```env
PORT=5050
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/student_records_api
```

### Step 4: Seed Initial Student Data
Populate MongoDB with 5 realistic student records (including primary record for student Ayush):
```bash
npm run seed
```

### Step 5: Start the Server
```bash
npm start
```
*(Or run `npm run dev` for nodemon live reloading)*.

Open your browser and navigate to:
👉 **[http://localhost:5050](http://localhost:5050)** to view the interactive API Documentation dashboard!

---

## 5. Postman Testing Guide

1. Open **Postman Desktop** or Postman Web.
2. Click **Import** (top left).
3. Select the file:
   ```
   postman/2304362_Ayush_P6_Postman_Collection.json
   ```
4. Confirm import of collection **`2304362_Ayush_P6_StudentAPI_Collection`**.
5. The collection is pre-configured with:
   - Variable `{{baseUrl}}` pointing to `http://localhost:5050`.
   - Dynamic chaining: Test `03. Create Student` automatically captures the generated student ID and stores it in `{{createdStudentId}}` for the subsequent `GET`, `PUT`, and `DELETE` requests!
   - 12 comprehensive test requests:
     - 8 Positive/Happy-Path tests (200 OK, 201 Created with Location header).
     - 4 Negative/Error tests (400 Bad Request for duplicate PRN, 400 for malformed validation fields, 404 for non-existent ID, 400 for invalid identifier).
6. Click **Run collection** to run all 12 requests in sequence. All tests will pass with green checkmarks!

---

## 6. Moodle Submission Checklist

1. **Submission ZIP**:
   Run the automated zip script:
   ```powershell
   python create_submission_zip.py
   ```
   Generates `2304362_Ayush_P6_StudentAPI.zip` (strictly excluding `node_modules` and `.env`).
2. **Postman Collection**:
   Upload `2304362_Ayush_P6_Postman_Collection.json` (also in `postman/`).
3. **PDF Report**:
   Open `PRN_Name_P6_Report.html` in Chrome/Edge, press <kbd>Ctrl</kbd> + <kbd>P</kbd>, and save as `2304362_Ayush_P6_Report.pdf`.
