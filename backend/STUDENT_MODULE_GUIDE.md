# Student Module Implementation Guide

## Overview
This guide provides comprehensive documentation for the complete student module implementation, including API routes, React pages structure, and testing procedures.

## API Routes

### Student-Specific Endpoints

All student endpoints are protected by `auth:sanctum` and `role:student` middleware.

#### 1. Grades
**Endpoint:** `GET /api/student/grades`
**Authentication:** Required
**Role:** Student
**Query Parameters:**
- `per_page` (optional): Number of items per page (default: 10)
- `page` (optional): Page number

**Response:**
```json
{
  "grades": {
    "data": [
      {
        "id": 1,
        "score": 15,
        "grade_type": "exam",
        "date": "2024-01-15",
        "module": {
          "id": 1,
          "name": "Mathematics",
          "teacher": {
            "user": {
              "name": "John Doe"
            }
          }
        }
      }
    ],
    "current_page": 1,
    "per_page": 10,
    "total": 25
  },
  "statistics": {
    "average": 14.5,
    "total": 25,
    "passed": 20
  }
}
```

#### 2. Absences
**Endpoint:** `GET /api/student/absences`
**Authentication:** Required
**Role:** Student
**Query Parameters:**
- `per_page` (optional): Number of items per page (default: 10)
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
        "module": {
          "id": 1,
          "name": "Mathematics"
        },
        "schedule": {
          "day_of_week": 1,
          "start_time": "08:00",
          "end_time": "10:00"
        },
        "justification": null
      }
    ],
    "current_page": 1,
    "per_page": 10,
    "total": 5
  },
  "statistics": {
    "total": 5,
    "unjustified": 2,
    "justified": 3
  }
}
```

#### 3. Schedule
**Endpoint:** `GET /api/student/schedule`
**Authentication:** Required
**Role:** Student

**Response:**
```json
{
  "schedule": [
    {
      "id": 1,
      "module_name": "Mathematics",
      "teacher_name": "John Doe",
      "classroom": "Room 101",
      "day_of_week": 1,
      "start_time": "08:00",
      "end_time": "10:00",
      "type": "lecture"
    }
  ]
}
```

#### 4. Announcements
**Endpoint:** `GET /api/student/announcements`
**Authentication:** Required
**Role:** Student
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
          "name": "Admin"
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

#### 5. Course Materials
**Endpoint:** `GET /api/student/course-materials`
**Authentication:** Required
**Role:** Student
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
          "name": "John Doe"
        }
      }
    ],
    "current_page": 1,
    "per_page": 10,
    "total": 30
  }
}
```

#### 6. Administrative Requests
**Endpoint:** `GET /api/student/administrative-requests`
**Authentication:** Required
**Role:** Student
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

**POST /api/student/administrative-requests**
**Authentication:** Required
**Role:** Student
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

#### 7. Absence Justifications
**Endpoint:** `GET /api/student/absence-justifications`
**Authentication:** Required
**Role:** Student
**Query Parameters:**
- `per_page` (optional): Number of items per page (default: 10)
- `page` (optional): Page number

**Response:**
```json
{
  "justifications": {
    "data": [
      {
        "id": 1,
        "reason": "Was sick with flu",
        "document_path": "absence_justifications/medical_note.pdf",
        "status": "pending",
        "created_at": "2024-01-15T10:00:00Z",
        "reviewer": null,
        "absences": [
          {
            "id": 1,
            "date": "2024-01-15",
            "module": {
              "name": "Mathematics"
            }
          }
        ]
      }
    ],
    "current_page": 1,
    "per_page": 10,
    "total": 3
  }
}
```

**POST /api/student/absence-justifications**
**Authentication:** Required
**Role:** Student
**Content-Type:** `multipart/form-data`

**Request Body:**
```
reason: "Was sick with flu"
document: [file]
absence_ids[]: [1, 2, 3]
```

**Validation Rules:**
- `reason`: required, min 10 characters, max 1000 characters
- `document`: optional, file, mimes: pdf, doc, docx, jpg, jpeg, png, max 5MB
- `absence_ids`: optional, array, must exist in absences table

**Response (201 Created):**
```json
{
  "message": "Absence justification submitted successfully",
  "justification": {
    "id": 1,
    "reason": "Was sick with flu",
    "document_path": "absence_justifications/medical_note.pdf",
    "status": "pending",
    "created_at": "2024-01-15T10:00:00Z",
    "absences": [
      {
        "id": 1,
        "date": "2024-01-15",
        "module": {
          "name": "Mathematics"
        }
      }
    ]
  }
}
```

#### 8. Generated Documents
**Endpoint:** `GET /api/student/generated-documents`
**Authentication:** Required
**Role:** Student
**Query Parameters:**
- `per_page` (optional): Number of items per page (default: 10)
- `page` (optional): Page number

**Response:**
```json
{
  "documents": {
    "data": [
      {
        "id": 1,
        "type": "transcript",
        "file_path": "documents/transcript_001.pdf",
        "generated_at": "2024-01-15T10:00:00Z",
        "administrative_request": {
          "id": 1,
          "title": "Academic Transcript"
        }
      }
    ],
    "current_page": 1,
    "per_page": 10,
    "total": 5
  }
}
```

#### 9. Notifications
**Endpoint:** `GET /api/student/notifications`
**Authentication:** Required
**Role:** Student

**Response:**
```json
{
  "notifications": [
    {
      "type": "grade",
      "title": "New Grade Posted",
      "message": "You received a grade of 15/20 in Mathematics",
      "created_at": "2024-01-15T10:00:00Z"
    },
    {
      "type": "announcement",
      "title": "Exam Schedule",
      "message": "Final exams will start next week...",
      "created_at": "2024-01-14T10:00:00Z"
    },
    {
      "type": "justification",
      "title": "Absence Justification",
      "message": "Your absence justification is pending",
      "created_at": "2024-01-13T10:00:00Z"
    },
    {
      "type": "request",
      "title": "Administrative Request",
      "message": "Your transcript request is pending",
      "created_at": "2024-01-12T10:00:00Z"
    }
  ]
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
│   └── StudentLayout.jsx          # Student layout wrapper
├── pages/
│   └── student/
│       ├── Grades.jsx             # Grades view page
│       ├── Absences.jsx           # Absences view page
│       ├── Schedule.jsx           # Schedule view page
│       ├── Announcements.jsx      # Announcements view page
│       ├── CourseMaterials.jsx    # Course materials view page
│       ├── AdministrativeRequests.jsx  # Administrative requests page
│       └── AbsenceJustification.jsx   # Absence justification form
└── App.jsx                        # Main application with routes
```

### Page Components

#### 1. Grades.jsx
**Location:** `frontend/src/pages/student/Grades.jsx`

**Features:**
- Displays student grades with pagination
- Shows statistics (average, total, passed)
- Color-coded grades (green for passing, red for failing)
- Responsive table layout
- Pagination controls

**Key State:**
- `page`: Current page number
- `perPage`: Items per page

**API Call:**
```javascript
api.get(`/student/grades?per_page=${perPage}&page=${page}`)
```

#### 2. Absences.jsx
**Location:** `frontend/src/pages/student/Absences.jsx`

**Features:**
- Displays student absences with pagination
- Shows statistics (total, unjustified, justified)
- Status badges (present, absent, late, excused)
- Link to submit justification form
- Responsive table layout
- Pagination controls

**Key State:**
- `page`: Current page number
- `perPage`: Items per page

**API Call:**
```javascript
api.get(`/student/absences?per_page=${perPage}&page=${page}`)
```

#### 3. Schedule.jsx
**Location:** `frontend/src/pages/student/Schedule.jsx`

**Features:**
- Displays weekly schedule
- Grouped by day of week
- Color-coded by type (lecture, lab, exam, tutorial)
- Shows teacher and classroom information
- Responsive card layout

**API Call:**
```javascript
api.get('/student/schedule')
```

#### 4. Announcements.jsx
**Location:** `frontend/src/pages/student/Announcements.jsx`

**Features:**
- Displays announcements with pagination
- Pinned announcements highlighted
- Expand/collapse for long content
- Target role badges
- Pagination controls

**Key State:**
- `page`: Current page number
- `perPage`: Items per page
- `expandedId`: Currently expanded announcement

**API Call:**
```javascript
api.get(`/student/announcements?per_page=${perPage}&page=${page}`)
```

#### 5. CourseMaterials.jsx
**Location:** `frontend/src/pages/student/CourseMaterials.jsx`

**Features:**
- Displays course materials with pagination
- File type icons
- Download functionality
- File size display
- Module information
- Responsive grid layout
- Pagination controls

**Key State:**
- `page`: Current page number
- `perPage`: Items per page

**API Call:**
```javascript
api.get(`/student/course-materials?per_page=${perPage}&page=${page}`)
```

**Download Function:**
```javascript
const handleDownload = async (material) => {
  const response = await api.get(`/storage/${material.file_path}`, {
    responseType: 'blob',
  });
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', material.title);
  document.body.appendChild(link);
  link.click();
  link.remove();
};
```

#### 6. AdministrativeRequests.jsx
**Location:** `frontend/src/pages/student/AdministrativeRequests.jsx`

**Features:**
- Displays administrative requests with pagination
- Form to submit new requests
- Status badges (pending, in_progress, approved, rejected, completed)
- Type badges (transcript, certificate, attestation, other)
- Modal/form for new request submission
- Pagination controls

**Key State:**
- `showForm`: Toggle form visibility
- `page`: Current page number
- `perPage`: Items per page
- `formData`: Form data for new request
- `errors`: Validation errors
- `success`: Success message

**API Calls:**
```javascript
// Get requests
api.get(`/student/administrative-requests?per_page=${perPage}&page=${page}`)

// Submit request
api.post('/student/administrative-requests', formData)
```

#### 7. AbsenceJustification.jsx
**Location:** `frontend/src/pages/student/AbsenceJustification.jsx`

**Features:**
- Form to submit absence justification
- Select absences to justify
- File upload for supporting documents
- Validation with error messages
- Success feedback

**Key State:**
- `formData`: Form data (reason, document, absence_ids)
- `errors`: Validation errors
- `success`: Success message

**API Call:**
```javascript
const formDataToSend = new FormData();
formDataToSend.append('reason', data.reason);
if (data.document) {
  formDataToSend.append('document', data.document);
}
if (data.absence_ids && data.absence_ids.length > 0) {
  data.absence_ids.forEach(id => formDataToSend.append('absence_ids[]', id));
}
api.post('/student/absence-justifications', formDataToSend, {
  headers: { 'Content-Type': 'multipart/form-data' }
})
```

#### 8. Notifications.jsx
**Location:** `frontend/src/components/Notifications.jsx`

**Features:**
- Dropdown notification panel
- Real-time notification count
- Auto-refresh every minute
- Color-coded by type (grade, announcement, justification, request)
- Type icons
- Timestamp display

**Key State:**
- `isOpen`: Toggle dropdown visibility

**API Call:**
```javascript
api.get('/student/notifications')
```

### Navigation Structure

**Sidebar Menu Items (Student):**
```javascript
student: [
  { path: '/student/dashboard', label: 'Dashboard', icon: '📊' },
  { path: '/student/grades', label: 'Grades', icon: '📝' },
  { path: '/student/absences', label: 'Absences', icon: '📅' },
  { path: '/student/schedule', label: 'Schedule', icon: '🕐' },
  { path: '/student/announcements', label: 'Announcements', icon: '📢' },
  { path: '/student/course-materials', label: 'Course Materials', icon: '📚' },
  { path: '/student/administrative-requests', label: 'Requests', icon: '📋' },
  { path: '/student/absence-justification', label: 'Justify Absence', icon: '✍️' },
]
```

## Test Flow

### Backend Testing

#### 1. Test Grades Endpoint
```bash
# Login as student to get token
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "student@example.com", "password": "password"}'

# Get grades (replace YOUR_TOKEN with actual token)
curl -X GET "http://localhost:8000/api/student/grades?per_page=10&page=1" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Expected response: JSON with grades data and statistics
```

#### 2. Test Absences Endpoint
```bash
# Get absences
curl -X GET "http://localhost:8000/api/student/absences?per_page=10&page=1" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Expected response: JSON with absences data and statistics
```

#### 3. Test Schedule Endpoint
```bash
# Get schedule
curl -X GET http://localhost:8000/api/student/schedule \
  -H "Authorization: Bearer YOUR_TOKEN"

# Expected response: JSON with schedule array
```

#### 4. Test Announcements Endpoint
```bash
# Get announcements
curl -X GET "http://localhost:8000/api/student/announcements?per_page=10&page=1" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Expected response: JSON with announcements data
```

#### 5. Test Course Materials Endpoint
```bash
# Get course materials
curl -X GET "http://localhost:8000/api/student/course-materials?per_page=10&page=1" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Expected response: JSON with materials data
```

#### 6. Test Administrative Requests
```bash
# Get requests
curl -X GET "http://localhost:8000/api/student/administrative-requests?per_page=10&page=1" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Submit new request
curl -X POST http://localhost:8000/api/student/administrative-requests \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "transcript",
    "title": "Academic Transcript",
    "description": "Need transcript for job application"
  }'

# Expected response: 201 Created with request data
```

#### 7. Test Absence Justification
```bash
# Get justifications
curl -X GET "http://localhost:8000/api/student/absence-justifications?per_page=10&page=1" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Submit justification with file
curl -X POST http://localhost:8000/api/student/absence-justifications \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "reason=Was sick with flu" \
  -F "document=@/path/to/medical_note.pdf" \
  -F "absence_ids[]=1" \
  -F "absence_ids[]=2"

# Expected response: 201 Created with justification data
```

#### 8. Test Notifications Endpoint
```bash
# Get notifications
curl -X GET http://localhost:8000/api/student/notifications \
  -H "Authorization: Bearer YOUR_TOKEN"

# Expected response: JSON with notifications array
```

### Frontend Testing

#### 1. Test Grades Page
1. Login as student
2. Navigate to `/student/grades`
3. Verify:
   - Statistics cards display correctly
   - Grades table loads with data
   - Pagination works
   - Color coding for pass/fail grades
   - Responsive layout on mobile

#### 2. Test Absences Page
1. Navigate to `/student/absences`
2. Verify:
   - Statistics cards display correctly
   - Absences table loads with data
   - Status badges display correctly
   - "Submit Justification" button works
   - Pagination works

#### 3. Test Schedule Page
1. Navigate to `/student/schedule`
2. Verify:
   - Schedule loads with data
   - Grouped by day of week
   - Type badges display correctly
   - Teacher and classroom info shown
   - Responsive layout on mobile

#### 4. Test Announcements Page
1. Navigate to `/student/announcements`
2. Verify:
   - Announcements load with data
   - Pinned announcements highlighted
   - Expand/collapse works
   - Pagination works
   - Target role badges display

#### 5. Test Course Materials Page
1. Navigate to `/student/course-materials`
2. Verify:
   - Materials load with data
   - File icons display correctly
   - Download button works
   - File size shown
   - Pagination works
   - Responsive grid layout

#### 6. Test Administrative Requests Page
1. Navigate to `/student/administrative-requests`
2. Verify:
   - Requests list loads with data
   - Status badges display correctly
   - "New Request" button shows form
   - Form validation works
   - Form submission works
   - Success message displays
   - Pagination works

#### 7. Test Absence Justification Form
1. Navigate to `/student/absence-justification`
2. Verify:
   - Unjustified absences listed
   - Checkbox selection works
   - Reason input validates
   - File upload works
   - Form submission works
   - Success message displays
   - Error handling for validation

#### 8. Test Notifications Component
1. Click notification bell icon in sidebar
2. Verify:
   - Dropdown opens
   - Notifications load
   - Notification count displays
   - Type icons display correctly
   - Color coding by type
   - Timestamps shown
   - Auto-refreshes every minute
   - Close button works

### Integration Testing

#### End-to-End Test Flow

1. **Setup**
   - Start Laravel backend: `php artisan serve`
   - Start React frontend: `npm run dev`
   - Ensure database has test data (students, grades, absences, etc.)

2. **Authentication Flow**
   - Open browser to `http://localhost:5173`
   - Login with student credentials
   - Verify redirect to `/student/dashboard`
   - Verify sidebar shows student menu items
   - Verify notifications bell shows count

3. **Grades Flow**
   - Navigate to Grades page
   - Verify statistics display
   - Navigate through pagination
   - Verify grade details

4. **Absences Flow**
   - Navigate to Absences page
   - Verify statistics display
   - Click "Submit Justification"
   - Fill out justification form
   - Submit and verify success
   - Return to absences page
   - Verify absence now shows as justified

5. **Schedule Flow**
   - Navigate to Schedule page
   - Verify weekly schedule displays
   - Verify all days shown
   - Verify class details

6. **Announcements Flow**
   - Navigate to Announcements page
   - Verify announcements load
   - Click "Read More" on long announcement
   - Verify content expands
   - Navigate through pagination

7. **Course Materials Flow**
   - Navigate to Course Materials page
   - Verify materials load
   - Click download button
   - Verify file downloads
   - Navigate through pagination

8. **Administrative Requests Flow**
   - Navigate to Requests page
   - Click "New Request"
   - Fill out form
   - Submit and verify success
   - Verify request appears in list
   - Verify status is "pending"

9. **Notifications Flow**
   - Click notification bell
   - Verify notifications display
   - Verify different notification types
   - Close dropdown
   - Wait 1 minute
   - Reopen and verify refresh

### Validation Testing

#### Absence Justification Validation
1. Submit without reason → Should show "Reason is required"
2. Submit with reason < 10 chars → Should show "Reason must be at least 10 characters"
3. Submit with reason > 1000 chars → Should show "Reason must not exceed 1000 characters"
4. Submit with invalid file type → Should show "Document must be a PDF, DOC, DOCX, JPG, JPEG, or PNG file"
5. Submit with file > 5MB → Should show "Document must not exceed 5MB"
6. Submit with invalid absence_id → Should show "One or more selected absences do not exist"

#### Administrative Request Validation
1. Submit without type → Should show "Request type is required"
2. Submit with invalid type → Should show "Invalid request type"
3. Submit without title → Should show "Title is required"
4. Submit with title < 3 chars → Should show "Title must be at least 3 characters"
5. Submit with title > 255 chars → Should show "Title must not exceed 255 characters"
6. Submit without description → Should show "Description is required"
7. Submit with description < 10 chars → Should show "Description must be at least 10 characters"
8. Submit with description > 2000 chars → Should show "Description must not exceed 2000 characters"

### Performance Testing

1. **Pagination Performance**
   - Test with 100+ grades
   - Verify pagination is fast
   - Verify page size doesn't affect performance

2. **File Upload Performance**
   - Test with 5MB file
   - Verify upload completes within reasonable time
   - Verify progress indication

3. **Notifications Performance**
   - Test with 50+ notifications
   - Verify dropdown loads quickly
   - Verify auto-refresh doesn't cause lag

### Security Testing

1. **Authentication Required**
   - Try accessing endpoints without token → Should return 401
   - Try accessing pages without login → Should redirect to login

2. **Role-Based Access**
   - Login as admin → Should not access student routes
   - Login as teacher → Should not access student routes
   - Login as student → Should access all student routes

3. **Data Isolation**
   - Student A should not see Student B's grades
   - Student A should not see Student B's absences
   - Student A should not see Student B's requests

## Summary

The student module provides a complete set of features for students to:

- **View Grades**: With statistics and pagination
- **View Absences**: With justification status and statistics
- **View Schedule**: Weekly class schedule with details
- **Submit Absence Justifications**: With file upload support
- **View Announcements**: With pagination and expand/collapse
- **Download Course Materials**: With file type icons and download functionality
- **Submit Administrative Requests**: With validation and status tracking
- **Receive Notifications**: Real-time notifications with auto-refresh

All features include:
- Proper authentication and authorization
- Validation with clear error messages
- Pagination for large datasets
- Responsive UI design
- Clean, modern interface
