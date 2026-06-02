# Teacher Module Implementation Guide

## Overview
This guide provides comprehensive documentation for the complete teacher module implementation, including API routes, React pages structure, and testing procedures.

## API Routes

### Teacher-Specific Endpoints

All teacher endpoints are protected by `auth:sanctum` and `role:teacher` middleware.

#### 1. Modules
**Endpoint:** `GET /api/teacher/modules`
**Authentication:** Required
**Role:** Teacher
**Query Parameters:**
- `per_page` (optional): Number of items per page (default: 10)
- `page` (optional): Page number

**Response:**
```json
{
  "modules": {
    "data": [
      {
        "id": 1,
        "name": "Mathematics",
        "group": {
          "id": 1,
          "name": "Group A"
        },
        "schedules": [...]
      }
    ],
    "current_page": 1,
    "per_page": 10,
    "total": 5
  }
}
```

#### 2. Module Students
**Endpoint:** `GET /api/teacher/modules/{moduleId}/students`
**Authentication:** Required
**Role:** Teacher
**Query Parameters:**
- `per_page` (optional): Number of items per page (default: 20)
- `page` (optional): Page number

**Response:**
```json
{
  "students": {
    "data": [
      {
        "id": 1,
        "user": {
          "name": "John Doe",
          "email": "john@example.com"
        },
        "grades": [
          {
            "id": 1,
            "grade_type": "cc1",
            "score": 15,
            "date": "2024-01-15"
          }
        ]
      }
    ],
    "current_page": 1,
    "per_page": 20,
    "total": 30
  }
}
```

#### 3. Grades Management
**Endpoint:** `POST /api/teacher/grades`
**Authentication:** Required
**Role:** Teacher
**Content-Type:** `application/json`

**Request Body:**
```json
{
  "student_id": 1,
  "module_id": 1,
  "grade_type": "cc1",
  "score": 15,
  "date": "2024-01-15"
}
```

**Validation Rules:**
- `student_id`: required, exists in students table
- `module_id`: required, exists in modules table
- `grade_type`: required, must be one of: cc1, cc2, exam, final
- `score`: required, numeric, min 0, max 20
- `date`: optional, date format

**Response (201 Created):**
```json
{
  "message": "Grade created successfully",
  "grade": {
    "id": 1,
    "student_id": 1,
    "module_id": 1,
    "grade_type": "cc1",
    "score": 15,
    "date": "2024-01-15",
    "module": {...}
  }
}
```

**Final Grade Calculation:**
When CC1, CC2, and Exam grades are entered, the final grade is automatically calculated using:
```
Final Grade = ((CC1 + CC2) / 2) × 0.4 + Exam × 0.6
```

#### 4. Teacher Schedule
**Endpoint:** `GET /api/teacher/schedule`
**Authentication:** Required
**Role:** Teacher

**Response:**
```json
{
  "schedule": [
    {
      "id": 1,
      "module_name": "Mathematics",
      "group_name": "Group A",
      "classroom": "Room 101",
      "day_of_week": 1,
      "start_time": "08:00",
      "end_time": "10:00",
      "type": "lecture"
    }
  ]
}
```

#### 5. Administrative Requests
**Endpoint:** `GET /api/teacher/administrative-requests`
**Authentication:** Required
**Role:** Teacher
**Query Parameters:**
- `per_page` (optional): Number of items per page (default: 10)
- `page` (optional): Page number

**Response:**
```json
{
  "requests": {
    "data": [
      {
        "id": 1,
        "type": "transcript",
        "title": "Academic Transcript",
        "description": "Need transcript for job application",
        "status": "pending",
        "submitted_at": "2024-01-15T10:00:00Z",
        "generatedDocuments": []
      }
    ],
    "current_page": 1,
    "per_page": 10,
    "total": 5
  }
}
```

**POST /api/teacher/administrative-requests**
**Authentication:** Required
**Role:** Teacher
**Content-Type:** `application/json`

**Request Body:**
```json
{
  "type": "transcript",
  "title": "Academic Transcript",
  "description": "Need transcript for job application"
}
```

**Validation Rules:**
- `type`: required, must be one of: transcript, certificate, attestation, other
- `title`: required, min 3 characters, max 255 characters
- `description`: required, min 10 characters, max 2000 characters

**Response (201 Created):**
```json
{
  "message": "Administrative request submitted successfully",
  "request": {
    "id": 1,
    "type": "transcript",
    "title": "Academic Transcript",
    "description": "Need transcript for job application",
    "status": "pending",
    "submitted_at": "2024-01-15T10:00:00Z"
  }
}
```

#### 6. Attendance Management
**Endpoint:** `GET /api/teacher/attendance`
**Authentication:** Required
**Role:** Teacher
**Query Parameters:**
- `module_id` (optional): Filter by module
- `date` (optional): Filter by date
- `per_page` (optional): Number of items per page (default: 20)
- `page` (optional): Page number

**Response:**
```json
{
  "absences": {
    "data": [
      {
        "id": 1,
        "date": "2024-01-15",
        "status": "absent",
        "notes": "Sick",
        "student": {
          "user": {
            "name": "John Doe"
          }
        },
        "module": {
          "name": "Mathematics"
        },
        "schedule": {...}
      }
    ],
    "current_page": 1,
    "per_page": 20,
    "total": 25
  }
}
```

**POST /api/teacher/attendance**
**Authentication:** Required
**Role:** Teacher
**Content-Type:** `application/json`

**Request Body:**
```json
{
  "student_id": 1,
  "module_id": 1,
  "schedule_id": 1,
  "date": "2024-01-15",
  "status": "absent",
  "notes": "Sick"
}
```

**Validation Rules:**
- `student_id`: required, exists in students table
- `module_id`: required, exists in modules table
- `schedule_id`: optional, exists in schedules table
- `date`: required, date format
- `status`: required, must be one of: present, absent, late, excused
- `notes`: optional, max 500 characters

**POST /api/teacher/attendance/bulk` (Bulk Attendance)
**Authentication:** Required
**Role:** Teacher
**Content-Type:** `application/json`

**Request Body:**
```json
{
  "module_id": 1,
  "date": "2024-01-15",
  "schedule_id": 1,
  "attendances": [
    {
      "student_id": 1,
      "status": "present",
      "notes": null
    },
    {
      "student_id": 2,
      "status": "absent",
      "notes": "Sick"
    }
  ]
}
```

**Response (201 Created):**
```json
{
  "message": "Bulk attendance recording completed",
  "results": [
    {
      "student_id": 1,
      "success": true,
      "message": "Attendance recorded"
    },
    {
      "student_id": 2,
      "success": true,
      "message": "Attendance recorded"
    }
  ]
}
```

#### 7. Announcements
**Endpoint:** `GET /api/teacher/announcements`
**Authentication:** Required
**Role:** Teacher
**Query Parameters:**
- `per_page` (optional): Number of items per page (default: 10)
- `page` (optional): Page number

**Response:**
```json
{
  "announcements": {
    "data": [
      {
        "id": 1,
        "title": "Exam Schedule",
        "content": "Final exams will start next week...",
        "target_role": "student",
        "is_pinned": true,
        "status": "published",
        "published_at": "2024-01-15T10:00:00Z",
        "creator": {
          "name": "Teacher Name"
        },
        "comments": []
      }
    ],
    "current_page": 1,
    "per_page": 10,
    "total": 15
  }
}
```

**POST /api/teacher/announcements**
**Authentication:** Required
**Role:** Teacher
**Content-Type:** `application/json`

**Request Body:**
```json
{
  "title": "Exam Schedule",
  "content": "Final exams will start next week...",
  "target_role": "student",
  "is_pinned": true,
  "published_at": "2024-01-15T10:00:00Z"
}
```

**Validation Rules:**
- `title`: required, min 3 characters, max 255 characters
- `content`: required, min 10 characters, max 5000 characters
- `target_role`: required, must be one of: all, student, teacher, admin
- `is_pinned`: optional, boolean
- `published_at`: optional, date format

**Response (201 Created):**
```json
{
  "message": "Announcement created successfully",
  "announcement": {
    "id": 1,
    "title": "Exam Schedule",
    "content": "Final exams will start next week...",
    "target_role": "student",
    "is_pinned": true,
    "status": "published",
    "published_at": "2024-01-15T10:00:00Z",
    "creator": {...}
  }
}
```

#### 8. Course Materials
**Endpoint:** `GET /api/teacher/course-materials`
**Authentication:** Required
**Role:** Teacher
**Query Parameters:**
- `per_page` (optional): Number of items per page (default: 10)
- `page` (optional): Page number

**Response:**
```json
{
  "materials": {
    "data": [
      {
        "id": 1,
        "title": "Chapter 1 Notes",
        "description": "Introduction to calculus",
        "file_path": "course_materials/chapter1.pdf",
        "file_type": "pdf",
        "file_size": 1024000,
        "published_at": "2024-01-15T10:00:00Z",
        "module": {
          "id": 1,
          "name": "Mathematics"
        },
        "uploader": {
          "name": "Teacher Name"
        }
      }
    ],
    "current_page": 1,
    "per_page": 10,
    "total": 30
  }
}
```

**POST /api/teacher/course-materials`
**Authentication:** Required
**Role:** Teacher
**Content-Type:** `multipart/form-data`

**Request Body:**
```
module_id: 1
title: "Chapter 1 Notes"
description: "Introduction to calculus"
file: [file]
```

**Validation Rules:**
- `module_id`: required, exists in modules table
- `title`: required, min 3 characters, max 255 characters
- `description`: optional, max 2000 characters
- `file`: required, file, mimes: pdf, doc, docx, ppt, pptx, zip, max 10MB

**Response (201 Created):**
```json
{
  "message": "Course material uploaded successfully",
  "material": {
    "id": 1,
    "title": "Chapter 1 Notes",
    "description": "Introduction to calculus",
    "file_path": "course_materials/chapter1.pdf",
    "file_type": "pdf",
    "file_size": 1024000,
    "published_at": "2024-01-15T10:00:00Z",
    "module": {...},
    "uploader": {...}
  }
}
```

#### 9. Room Reservations
**Endpoint:** `GET /api/teacher/room-reservations`
**Authentication:** Required
**Role:** Teacher
**Query Parameters:**
- `per_page` (optional): Number of items per page (default: 10)
- `page` (optional): Page number

**Response:**
```json
{
  "reservations": {
    "data": [
      {
        "id": 1,
        "classroom": {
          "id": 1,
          "name": "Room 101"
        },
        "module": {
          "id": 1,
          "name": "Mathematics"
        },
        "date": "2024-01-20",
        "start_time": "14:00",
        "end_time": "16:00",
        "purpose": "Extra class for exam preparation",
        "status": "pending"
      }
    ],
    "current_page": 1,
    "per_page": 10,
    "total": 5
  }
}
```

**POST /api/teacher/room-reservations**
**Authentication:** Required
**Role:** Teacher
**Content-Type:** `application/json`

**Request Body:**
```json
{
  "classroom_id": 1,
  "module_id": 1,
  "date": "2024-01-20",
  "start_time": "14:00",
  "end_time": "16:00",
  "purpose": "Extra class for exam preparation"
}
```

**Validation Rules:**
- `classroom_id`: required, exists in classrooms table
- `module_id`: optional, exists in modules table
- `date`: required, date, must be after today
- `start_time`: required, time format (HH:MM)
- `end_time`: required, time format (HH:MM), must be after start_time
- `purpose`: required, min 5 characters, max 500 characters

**Response (201 Created):**
```json
{
  "message": "Room reservation submitted successfully",
  "reservation": {
    "id": 1,
    "classroom_id": 1,
    "module_id": 1,
    "date": "2024-01-20",
    "start_time": "14:00",
    "end_time": "16:00",
    "purpose": "Extra class for exam preparation",
    "status": "pending",
    "classroom": {...},
    "module": {...}
  }
}
```

**Conflict Detection:**
The system automatically checks for conflicting reservations. If a room is already reserved for the same time slot, a 409 Conflict response is returned.

#### 10. Comments (Classroom Comments)
**Endpoint:** `GET /api/comments?announcement_id={id}`
**Authentication:** Required
**Role:** Any authenticated user
**Query Parameters:**
- `announcement_id` (optional): Filter by announcement
- `per_page` (optional): Number of items per page (default: 20)
- `page` (optional): Page number

**Response:**
```json
{
  "comments": {
    "data": [
      {
        "id": 1,
        "content": "When is the exam?",
        "user": {
          "name": "John Doe"
        },
        "announcement": {
          "title": "Exam Schedule"
        },
        "created_at": "2024-01-15T10:00:00Z"
      }
    ],
    "current_page": 1,
    "per_page": 20,
    "total": 10
  }
}
```

**POST /api/comments**
**Authentication:** Required
**Role:** Any authenticated user
**Content-Type:** `application/json`

**Request Body:**
```json
{
  "announcement_id": 1,
  "content": "When is the exam?"
}
```

**Validation Rules:**
- `announcement_id`: required, exists in announcements table
- `content`: required, min 1 character, max 1000 characters

**Response (201 Created):**
```json
{
  "message": "Comment added successfully",
  "comment": {
    "id": 1,
    "content": "When is the exam?",
    "user": {...},
    "created_at": "2024-01-15T10:00:00Z"
  }
}
```

## React Pages Structure

### File Structure
```
frontend/src/
├── components/
│   ├── Notifications.jsx          # Notifications dropdown component
│   ├── ProtectedRoute.jsx         # Route protection wrapper
│   └── Sidebar.jsx                # Navigation sidebar
├── context/
│   └── AuthContext.jsx            # Authentication context
├── layouts/
│   └── TeacherLayout.jsx          # Teacher layout wrapper
├── pages/
│   └── teacher/
│       ├── Grades.jsx             # Grades management page
│       ├── Attendance.jsx         # Attendance management page
│       ├── Schedule.jsx           # Schedule view page
│       ├── Announcements.jsx      # Announcements management page
│       ├── CourseMaterials.jsx    # Course materials upload page
│       ├── RoomReservations.jsx   # Room reservation page
│       └── AdministrativeRequests.jsx  # Administrative requests page
└── App.jsx                        # Main application with routes
```

### Page Components

#### 1. Grades.jsx
**Location:** `frontend/src/pages/teacher/Grades.jsx`

**Features:**
- Module selection dropdown
- Student list with existing grades
- Grade entry form with validation
- Real-time final grade calculation display
- Grade type selection (CC1, CC2, Exam)
- Score input (0-20 range)
- Date picker for grade date
- Responsive table layout
- Grade calculation formula display

**Key State:**
- `selectedModule`: Currently selected module
- `selectedStudent`: Currently selected student
- `formData`: Form data for grade entry
- `errors`: Validation errors
- `success`: Success message flag

**API Calls:**
```javascript
// Get modules
api.get('/teacher/modules')

// Get module students
api.get(`/teacher/modules/${moduleId}/students`)

// Submit grade
api.post('/teacher/grades', formData)
```

#### 2. Attendance.jsx
**Location:** `frontend/src/pages/teacher/Attendance.jsx`

**Features:**
- Module selection dropdown
- Date picker for attendance date
- Single attendance recording mode
- Bulk attendance recording mode
- Status selection (present, absent, late, excused)
- Notes field for additional information
- Attendance records display with status badges
- Mode toggle between single and bulk

**Key State:**
- `selectedModule`: Currently selected module
- `selectedDate`: Selected date for attendance
- `bulkMode`: Toggle for bulk mode
- `formData`: Form data for single attendance
- `bulkAttendance`: Bulk attendance data object
- `errors`: Validation errors
- `success`: Success message flag

**API Calls:**
```javascript
// Get attendance records
api.get(`/teacher/attendance?module_id=${moduleId}&date=${date}`)

// Submit single attendance
api.post('/teacher/attendance', formData)

// Submit bulk attendance
api.post('/teacher/attendance/bulk', { module_id, date, attendances })
```

#### 3. Schedule.jsx
**Location:** `frontend/src/pages/teacher/Schedule.jsx`

**Features:**
- Weekly schedule display
- Grouped by day of week
- Color-coded by type (lecture, lab, exam, tutorial)
- Shows module name, group, classroom, and time
- Responsive card layout
- Day-specific background colors

**API Call:**
```javascript
api.get('/teacher/schedule')
```

#### 4. Announcements.jsx
**Location:** `frontend/src/pages/teacher/Announcements.jsx`

**Features:**
- Announcement creation form
- Title and content inputs
- Target audience selection
- Pin announcement option
- Announcement list with status badges
- Edit and delete functionality
- Pinned announcements highlighted

**Key State:**
- `showForm`: Toggle form visibility
- `formData`: Form data for announcement
- `errors`: Validation errors
- `success`: Success message flag

**API Calls:**
```javascript
// Get announcements
api.get('/teacher/announcements')

// Create announcement
api.post('/teacher/announcements', formData)
```

#### 5. CourseMaterials.jsx
**Location:** `frontend/src/pages/teacher/CourseMaterials.jsx`

**Features:**
- Module selection dropdown
- File upload with drag-and-drop
- Title and description inputs
- File type validation (PDF, DOC, DOCX, PPT, PPTX, ZIP)
- File size limit (10MB)
- Materials grid display with file icons
- Delete functionality
- File size display

**Key State:**
- `showForm`: Toggle form visibility
- `formData`: Form data including file
- `errors`: Validation errors
- `success`: Success message flag

**API Calls:**
```javascript
// Get materials
api.get('/teacher/course-materials')

// Upload material
api.post('/teacher/course-materials', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
})

// Delete material
api.delete(`/teacher/course-materials/${id}`)
```

#### 6. RoomReservations.jsx
**Location:** `frontend/src/pages/teacher/RoomReservations.jsx`

**Features:**
- Classroom selection dropdown
- Module selection (optional)
- Date picker (must be after today)
- Start and end time inputs
- Purpose input
- Conflict detection on submission
- Reservations list with status badges
- Cancel functionality for pending reservations
- Status color coding

**Key State:**
- `showForm`: Toggle form visibility
- `formData`: Form data for reservation
- `errors`: Validation errors
- `success`: Success message flag

**API Calls:**
```javascript
// Get classrooms
api.get('/classrooms')

// Get reservations
api.get('/teacher/room-reservations')

// Submit reservation
api.post('/teacher/room-reservations', formData)

// Cancel reservation
api.delete(`/teacher/room-reservations/${id}`)
```

#### 7. AdministrativeRequests.jsx
**Location:** `frontend/src/pages/teacher/AdministrativeRequests.jsx`

**Features:**
- Request type selection (transcript, certificate, attestation, other)
- Title and description inputs
- Requests list with status badges
- Status color coding (pending, in_progress, approved, rejected, completed)
- Submission date display

**Key State:**
- `showForm`: Toggle form visibility
- `formData`: Form data for request
- `errors`: Validation errors
- `success`: Success message flag

**API Calls:**
```javascript
// Get requests
api.get('/teacher/administrative-requests')

// Submit request
api.post('/teacher/administrative-requests', formData)
```

### Navigation Structure

**Sidebar Menu Items (Teacher):**
```javascript
teacher: [
  { path: '/teacher/dashboard', label: 'Dashboard', icon: '📊' },
  { path: '/teacher/grades', label: 'Grades', icon: '📝' },
  { path: '/teacher/attendance', label: 'Attendance', icon: '📅' },
  { path: '/teacher/schedule', label: 'Schedule', icon: '🕐' },
  { path: '/teacher/announcements', label: 'Announcements', icon: '📢' },
  { path: '/teacher/course-materials', label: 'Course Materials', icon: '📚' },
  { path: '/teacher/room-reservations', label: 'Room Reservations', icon: '🏛️' },
  { path: '/teacher/administrative-requests', label: 'Requests', icon: '📋' },
]
```

## Services

### API Service
**Location:** `frontend/src/services/api.js`

The API service is configured to handle authentication, error handling, and request/response interceptors.

```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

### Auth Service
**Location:** `frontend/src/services/authService.js`

Handles authentication operations including login, logout, and user data management.

```javascript
import api from './api';

const authService = {
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('user', JSON.stringify(response.data.user));
    return response.data;
  },

  logout: async () => {
    await api.post('/auth/logout');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  getToken: () => {
    return localStorage.getItem('token');
  },

  hasRole: (role) => {
    const user = authService.getUser();
    return user?.role?.slug === role;
  },
};

export default authService;
```

## Test Scenarios

### Backend Testing

#### 1. Test Grades Endpoint
```bash
# Login as teacher to get token
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "teacher@example.com", "password": "password"}'

# Get teacher modules
curl -X GET "http://localhost:8000/api/teacher/modules" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get module students
curl -X GET "http://localhost:8000/api/teacher/modules/1/students" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Submit grade
curl -X POST http://localhost:8000/api/teacher/grades \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "student_id": 1,
    "module_id": 1,
    "grade_type": "cc1",
    "score": 15,
    "date": "2024-01-15"
  }'

# Expected response: 201 Created with grade data
# Final grade should be automatically calculated
```

#### 2. Test Attendance Endpoint
```bash
# Get attendance records
curl -X GET "http://localhost:8000/api/teacher/attendance?module_id=1&date=2024-01-15" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Submit single attendance
curl -X POST http://localhost:8000/api/teacher/attendance \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "student_id": 1,
    "module_id": 1,
    "date": "2024-01-15",
    "status": "present",
    "notes": ""
  }'

# Submit bulk attendance
curl -X POST http://localhost:8000/api/teacher/attendance/bulk \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "module_id": 1,
    "date": "2024-01-15",
    "attendances": [
      {"student_id": 1, "status": "present"},
      {"student_id": 2, "status": "absent", "notes": "Sick"}
    ]
  }'
```

#### 3. Test Schedule Endpoint
```bash
# Get teacher schedule
curl -X GET http://localhost:8000/api/teacher/schedule \
  -H "Authorization: Bearer YOUR_TOKEN"

# Expected response: JSON with schedule array
```

#### 4. Test Announcements Endpoint
```bash
# Get announcements
curl -X GET "http://localhost:8000/api/teacher/announcements" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Create announcement
curl -X POST http://localhost:8000/api/teacher/announcements \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Exam Schedule",
    "content": "Final exams will start next week...",
    "target_role": "student",
    "is_pinned": true
  }'
```

#### 5. Test Course Materials Endpoint
```bash
# Get course materials
curl -X GET "http://localhost:8000/api/teacher/course-materials" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Upload material
curl -X POST http://localhost:8000/api/teacher/course-materials \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "module_id=1" \
  -F "title=Chapter 1 Notes" \
  -F "description=Introduction to calculus" \
  -F "file=@/path/to/file.pdf"
```

#### 6. Test Room Reservations Endpoint
```bash
# Get room reservations
curl -X GET "http://localhost:8000/api/teacher/room-reservations" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Submit reservation
curl -X POST http://localhost:8000/api/teacher/room-reservations \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "classroom_id": 1,
    "module_id": 1,
    "date": "2024-01-20",
    "start_time": "14:00",
    "end_time": "16:00",
    "purpose": "Extra class for exam preparation"
  }'

# Test conflict detection
# Submit another reservation for same room, date, and time
# Expected response: 409 Conflict with conflict details
```

#### 7. Test Administrative Requests Endpoint
```bash
# Get administrative requests
curl -X GET "http://localhost:8000/api/teacher/administrative-requests" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Submit request
curl -X POST http://localhost:8000/api/teacher/administrative-requests \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "transcript",
    "title": "Academic Transcript",
    "description": "Need transcript for job application"
  }'
```

### Frontend Testing

#### 1. Test Grades Page
1. Login as teacher
2. Navigate to `/teacher/grades`
3. Verify:
   - Module dropdown loads with teacher's modules
   - Selecting a module loads students
   - Students display with existing grades
   - Grade entry form works
   - Final grade is calculated and displayed
   - Validation works for invalid inputs
   - Success message displays on submission

#### 2. Test Attendance Page
1. Navigate to `/teacher/attendance`
2. Verify:
   - Module and date filters work
   - Single mode allows recording individual attendance
   - Bulk mode allows recording all students at once
   - Status badges display correctly
   - Notes field works
   - Attendance records display after submission
   - Mode toggle works

#### 3. Test Schedule Page
1. Navigate to `/teacher/schedule`
2. Verify:
   - Schedule loads with teacher's classes
   - Grouped by day of week
   - Type badges display correctly
   - Module, group, classroom, and time shown
   - Responsive layout on mobile

#### 4. Test Announcements Page
1. Navigate to `/teacher/announcements`
2. Verify:
   - Announcement list loads
   - "New Announcement" button shows form
   - Form validation works
   - Target audience selection works
   - Pin toggle works
   - Announcement appears in list after creation
   - Pinned announcements highlighted

#### 5. Test Course Materials Page
1. Navigate to `/teacher/course-materials`
2. Verify:
   - Materials list loads
   - "Upload Material" button shows form
   - Module selection works
   - File upload works with valid files
   - File type validation works
   - File size validation works
   - Material appears in grid after upload
   - Delete functionality works
   - File icons display correctly

#### 6. Test Room Reservations Page
1. Navigate to `/teacher/room-reservations`
2. Verify:
   - Reservations list loads
   - "Reserve Room" button shows form
   - Classroom selection works
   - Date validation (must be after today)
   - Time validation (end after start)
   - Purpose validation works
   - Conflict detection works
   - Reservation appears in list after submission
   - Cancel button works for pending reservations
   - Status badges display correctly

#### 7. Test Administrative Requests Page
1. Navigate to `/teacher/administrative-requests`
2. Verify:
   - Requests list loads
   - "New Request" button shows form
   - Request type selection works
   - Form validation works
   - Request appears in list after submission
   - Status badges display correctly
   - Submission date shown

### Integration Testing

#### End-to-End Test Flow

1. **Setup**
   - Start Laravel backend: `php artisan serve`
   - Start React frontend: `npm run dev`
   - Ensure database has test data (teachers, modules, students, etc.)

2. **Authentication Flow**
   - Open browser to `http://localhost:5173`
   - Login with teacher credentials
   - Verify redirect to `/teacher/dashboard`
   - Verify sidebar shows teacher menu items

3. **Grades Flow**
   - Navigate to Grades page
   - Select a module
   - View students and their existing grades
   - Enter a grade for a student
   - Verify final grade is calculated
   - Verify grade appears in table

4. **Attendance Flow**
   - Navigate to Attendance page
   - Select module and date
   - Switch to bulk mode
   - Mark all students as present
   - Submit attendance
   - Verify records appear in list
   - Switch to single mode
   - Update one student's status
   - Verify update works

5. **Schedule Flow**
   - Navigate to Schedule page
   - Verify weekly schedule displays
   - Verify all days shown
   - Verify class details

6. **Announcements Flow**
   - Navigate to Announcements page
   - Create a new announcement
   - Pin the announcement
   - Verify it appears in list
   - Verify pinned badge shows

7. **Course Materials Flow**
   - Navigate to Course Materials page
   - Upload a new material
   - Verify it appears in grid
   - Delete the material
   - Verify it's removed

8. **Room Reservations Flow**
   - Navigate to Room Reservations page
   - Submit a reservation
   - Verify it appears in list
   - Try to submit conflicting reservation
   - Verify conflict error
   - Cancel the reservation
   - Verify status changes to cancelled

9. **Administrative Requests Flow**
   - Navigate to Requests page
   - Submit a new request
   - Verify it appears in list
   - Verify status is pending

### Validation Testing

#### Grades Validation
1. Submit without student_id → Should show "Student is required"
2. Submit without module_id → Should show "Module is required"
3. Submit without grade_type → Should show "Grade type is required"
4. Submit without score → Should show "Score is required"
5. Submit with score < 0 → Should show "Score must be at least 0"
6. Submit with score > 20 → Should show "Score must not exceed 20"
7. Submit with invalid grade_type → Should show "Invalid grade type"

#### Attendance Validation
1. Submit without student_id → Should show "Student is required"
2. Submit without module_id → Should show "Module is required"
3. Submit without date → Should show "Date is required"
4. Submit without status → Should show "Status is required"
5. Submit with invalid status → Should show "Invalid status"
6. Submit with notes > 500 chars → Should show "Notes must not exceed 500 characters"

#### Course Materials Validation
1. Submit without module_id → Should show "Module is required"
2. Submit without title → Should show "Title is required"
3. Submit without file → Should show "File is required"
4. Submit with invalid file type → Should show "File must be a PDF, DOC, DOCX, PPT, PPTX, or ZIP file"
5. Submit with file > 10MB → Should show "File must not exceed 10MB"

#### Room Reservations Validation
1. Submit without classroom_id → Should show "Classroom is required"
2. Submit without date → Should show "Date is required"
3. Submit with past date → Should show "Date must be after today"
4. Submit without start_time → Should show "Start time is required"
5. Submit without end_time → Should show "End time is required"
6. Submit with end_time before start_time → Should show "End time must be after start time"
7. Submit without purpose → Should show "Purpose is required"
8. Submit with conflicting reservation → Should show "Room is already reserved for this time slot"

### Performance Testing

1. **Pagination Performance**
   - Test with 100+ students in a module
   - Verify pagination is fast
   - Verify page size doesn't affect performance

2. **File Upload Performance**
   - Test with 10MB file
   - Verify upload completes within reasonable time
   - Verify progress indication

3. **Bulk Attendance Performance**
   - Test with 50+ students
   - Verify bulk submission completes quickly
   - Verify all records are created

### Security Testing

1. **Authentication Required**
   - Try accessing endpoints without token → Should return 401
   - Try accessing pages without login → Should redirect to login

2. **Role-Based Access**
   - Login as admin → Should not access teacher routes
   - Login as student → Should not access teacher routes
   - Login as teacher → Should access all teacher routes

3. **Data Isolation**
   - Teacher A should not see Teacher B's modules
   - Teacher A should not see Teacher B's grades
   - Teacher A should not see Teacher B's reservations

## Summary

The teacher module provides a complete set of features for teachers to:

- **Manage Grades**: With automatic final grade calculation using the formula: Final grade = ((CC1 + CC2)/2)*0.4 + Exam*0.6
- **Attendance Management**: Single and bulk attendance recording with status tracking
- **View Schedule**: Weekly class schedule with details
- **Create Announcements**: With target audience and pinning options
- **Upload Course Materials**: With file validation and management
- **Reserve Rooms**: With conflict detection and status tracking
- **Submit Administrative Requests**: For transcripts, certificates, and other documents
- **Comment on Announcements**: For classroom communication

All features include:
- Proper authentication and authorization
- Validation with clear error messages
- Pagination for large datasets
- Responsive UI design
- Clean, modern interface
- Real-time calculations and updates
