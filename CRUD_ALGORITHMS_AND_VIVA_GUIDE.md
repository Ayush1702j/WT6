# Practical No. 6: CRUD Algorithms & Viva Guide
**Student**: Ayush Jugseniye | **PRN**: 202401040128 | **Batch**: WT1  
**Course**: Web Technology (2304362L) | MIT Academy of Engineering, Pune

---

## Part 1: Formal Step-by-Step Algorithms for CRUD Operations

### 1. Algorithm for CREATE Operation (`POST /api/v1/students`)
- **Step 1: Start**.
- **Step 2: Receive Request Payload**: Client sends an HTTP POST request to `/api/v1/students` containing JSON fields (`prn`, `name`, `email`, `phone`, `department`, `year`, `division`, `cgpa`, `skills`).
- **Step 3: Declarative Validation**: Pass the payload through `express-validator` middleware:
  - Verify PRN is 7–16 numeric digits.
  - Verify name contains letters and spaces (3–60 chars).
  - Verify email matches RFC 5322 format.
  - Verify phone is 10 digits starting with [6-9].
  - Verify CGPA is a floating-point number between 0.00 and 10.00.
  - If any validation rule fails, return **HTTP 400 Bad Request** with array of field errors and stop.
- **Step 4: Check Uniqueness (Duplicate Verification)**:
  - Query MongoDB collection using `Student.findOne({ $or: [{ prn }, { email }] })`.
  - If a matching record is found, return **HTTP 400 Bad Request** with message `"A student with this PRN/Email already exists"` and stop.
- **Step 5: Database Persistence**:
  - Instantiate and save document using Mongoose `Student.create(req.body)`.
- **Step 6: Construct Response**:
  - Set response header: `Location: /api/v1/students/<new_id>`.
  - Return **HTTP 201 Created** with `{ success: true, statusCode: 201, message: "...", data: student }`.
- **Step 7: Stop**.

---

### 2. Algorithm for READ ALL Operation (`GET /api/v1/students`)
- **Step 1: Start**.
- **Step 2: Parse Query Parameters**: Extract optional parameters from `req.query`:
  - `search` (keyword for regex search on name, prn, email).
  - `department`, `year`, `division` (exact filters).
  - `minCgpa`, `maxCgpa` (range filter).
  - `page` (default 1), `limit` (default 10), `sort` (default `-createdAt`).
- **Step 3: Construct MongoDB Query**:
  - Build MongoDB filter object based on active query params.
  - Calculate document offset: `skip = (page - 1) * limit`.
- **Step 4: Execute Query & Count**:
  - Count matching documents using `Student.countDocuments(filter)`.
  - Query paginated records using `Student.find(filter).sort(sort).skip(skip).limit(limit)`.
- **Step 5: Send Response**:
  - Return **HTTP 200 OK** with pagination metadata (`page`, `limit`, `totalPages`, `total`) and array of student objects.
- **Step 6: Stop**.

---

### 3. Algorithm for READ BY ID / PRN Operation (`GET /api/v1/students/:id`)
- **Step 1: Start**.
- **Step 2: Extract Identifier**: Read `:id` from route parameter (`req.params.id`).
- **Step 3: Validate Identifier Syntax**:
  - Check if `:id` is a 24-character hexadecimal string (`mongoose.Types.ObjectId.isValid`) OR a numeric PRN (`/^\d{7,16}$/`).
  - If neither, return **HTTP 400 Bad Request** ("Invalid student identifier format") and stop.
- **Step 4: Query Database**:
  - If valid ObjectId, execute `Student.findById(id)`.
  - Else, execute `Student.findOne({ prn: id })`.
- **Step 5: Handle Query Result**:
  - If document is `null`, return **HTTP 404 Not Found** ("Student was not found").
  - If document exists, return **HTTP 200 OK** with `{ success: true, data: student }`.
- **Step 6: Stop**.

---

### 4. Algorithm for UPDATE Operation (`PUT /api/v1/students/:id`)
- **Step 1: Start**.
- **Step 2: Read Identifier & Payload**:
  - Read `:id` from `req.params.id`.
  - Read updated fields from `req.body`.
- **Step 3: Validate Payload**:
  - Validate field syntax using `express-validator`. Return **HTTP 400** if invalid.
- **Step 4: Check Existence**:
  - Look up student by ObjectId or PRN. If not found, return **HTTP 404 Not Found** and stop.
- **Step 5: Conflict Check (Uniqueness Preservation)**:
  - If updating PRN or email, ensure no *other* document already uses the new value. If conflict exists, return **HTTP 400 Bad Request**.
- **Step 6: Persist Changes**:
  - Execute `Student.findByIdAndUpdate(student._id, req.body, { new: true, runValidators: true })`.
- **Step 7: Send Response**:
  - Return **HTTP 200 OK** with `{ success: true, message: "Student record updated successfully", data: updatedStudent }`.
- **Step 8: Stop**.

---

### 5. Algorithm for DELETE Operation (`DELETE /api/v1/students/:id`)
- **Step 1: Start**.
- **Step 2: Read & Validate Identifier**:
  - Read `:id` from route parameter. Verify syntax (valid ObjectId or PRN).
- **Step 3: Query Student Record**:
  - Check if student exists in database.
  - If not found, return **HTTP 404 Not Found** ("Cannot delete. Student does not exist").
- **Step 4: Execute Deletion**:
  - Delete document using `Student.findByIdAndDelete(student._id)`.
- **Step 5: Send Response**:
  - Return **HTTP 200 OK** with `{ success: true, message: "Student '<Name>' (PRN: <PRN>) deleted successfully" }`.
- **Step 6: Stop**.

---

## Part 2: What to Tell in Your Viva / Demo (1-Minute Pitch)

When the examiner asks: **"Ayush, explain what you built for Practical 6"**, say this:

> *"Good morning Sir/Madam. For Practical No. 6, I designed, deployed, and tested a complete **RESTful CRUD Web API for Student Records** using **Node.js, Express.js, and MongoDB with Mongoose**.*
>
> *I followed standard REST principles:*
> 1. *Resource URIs are plural and noun-based: `/api/v1/students`.*
> 2. *I mapped the 5 core CRUD operations to proper HTTP methods:*
>    - *`POST` to add a student, which returns **201 Created** and a `Location` header.*
>    - *`GET` to read all students with filtering, search, and pagination, returning **200 OK**.*
>    - *`GET /:id` to read a student by either their 24-character MongoDB ObjectId or their PRN.*
>    - *`PUT /:id` to update student records with validation, returning **200 OK**.*
>    - *`DELETE /:id` to remove records, returning **200 OK**.*
> 3. *For validation, I used `express-validator` to enforce regex for PRN (7–16 digits), email format, phone, and CGPA between 0 and 10.*
> 4. *If a user submits duplicate PRNs or invalid formats, the API returns **HTTP 400 Bad Request**, and if a record isn't found, it returns **HTTP 404 Not Found**.*
> 5. *Finally, I automated the entire testing suite in **Postman** with 12 positive and negative test assertions and exported the collection."*

---

## Part 3: Top Viva Questions & Instant Answers

| Question | What You Should Answer |
| :--- | :--- |
| **Q1. What is the difference between PUT and POST?** | `POST` creates a new subordinate resource under a collection (not idempotent). `PUT` updates or replaces the resource at the specified URI (idempotent). |
| **Q2. Why return 201 instead of 200 on POST?** | HTTP 201 specifically signifies that a new resource has been successfully created on the server. REST convention also provides a `Location` header pointing to the new resource. |
| **Q3. What status code is used for duplicate PRN?** | HTTP `400 Bad Request` (or HTTP `409 Conflict`). In our API, we return HTTP 400 with a detailed JSON explaining that the PRN already exists. |
| **Q4. What is Mongoose?** | Mongoose is an Object Data Modeling (ODM) library for MongoDB and Node.js. It provides schema definitions, type casting, validation, and middleware. |
| **Q5. How do you test in Postman?** | We import the JSON collection, configure the `{{baseUrl}}` variable, and run requests. Postman test scripts inspect `pm.response.to.have.status(...)` and verify response schema automatically. |
