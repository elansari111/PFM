# Administration Module Implementation Guide

## Overview
This guide provides comprehensive documentation for the complete administration module implementation, including API structure, admin routes, and testing procedures.

## API Structure

### Admin-Specific Endpoints

All admin endpoints are protected by `auth:sanctum` and `role:admin` middleware.

#### 1. Dashboard Statistics
**Endpoint:** `GET /api/admin/dashboard`
**Authentication:** Required
**Role:** Admin

**Response:**
```json
{
  "stats": {
    "users": {
      "total": 150,
      "students": 120,
      "teachers": 25,
      "admins": 5
    },
    "modules": {
      "total": 30,
      "active": 28
    },
    "groups": {
      "total": 10,
      "total_students": 120
    },
    "classrooms": {
      "total": 15
    },
    "absences": {
      "total": 500,
      "pending_justifications": 15
    },
    "administrative_requests": {
      "total": 45,
      "pending": 8,
      "in_progress": 5
    },
    "room_reservations": {
      "total": 20,
      "pending": 3
    },
    "grades": {
      "total": 1200,
      "average": 14.5
    }
  }
}
```

#### 2. Users Management
**Endpoint:** `GET /api/admin/users`
**Authentication:** Required
**Role:** Admin
**Query Parameters:**
- `per_page` (optional): Number of items per page (default: 20)
- `page` (optional): Page number
- `role` (optional): Filter by role slug (student, teacher, admin)
- `search` (optional): Search by name or email

**Response:**
```json
{
  "users": {
    "data": [
      {
        "id": 1,
        "name": "John Doe",
        "email": "john@example.com",
        "role": {
          "id": 1,
          "name": "Student",
          "slug": "student"
        },
        "student": {
          "id": 1,
          "group_id": 1
        },
        "teacher": null
      }
    ],
    "current_page": 1,
    "per_page": 20,
    "total": 150
  }
}
```

**POST /api/admin/users**
**Authentication:** Required
**Role:** Admin
**Content-Type:** `application/json`

**Request Body:**
```json
{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "password": "password123",
  "role_id": 2,
  "group_id": 1
}
```

**Validation Rules:**
- `name`: required, string, min 3 characters, max 255 characters
- `email`: required, email, unique
- `password`: required, string, min 8 characters
- `role_id`: required, exists in roles table
- `group_id`: optional, exists in groups table (required for students)

**Response (201 Created):**
```json
{
  "message": "User created successfully",
  "user": {
    "id": 151,
    "name": "Jane Smith",
    "email": "jane@example.com",
    "role": {...},
    "student": {...}
  }
}
```

**PUT /api/admin/users/{id}**
**Authentication:** Required
**Role:** Admin
**Content-Type:** `application/json`

**Request Body:**
```json
{
  "name": "Jane Smith Updated",
  "email": "jane.updated@example.com",
  "password": "newpassword123",
  "role_id": 2,
  "group_id": 2
}
```

**Response:**
```json
{
  "message": "User updated successfully",
  "user": {
    "id": 151,
    "name": "Jane Smith Updated",
    "email": "jane.updated@example.com",
    "role": {...},
    "student": {...}
  }
}
```

**DELETE /api/admin/users/{id}**
**Authentication:** Required
**Role:** Admin

**Response:**
```json
{
  "message": "User deleted successfully"
}
```

#### 3. Modules Management
**Endpoint:** `GET /api/admin/modules`
**Authentication:** Required
**Role:** Admin
**Query Parameters:**
- `per_page` (optional): Number of items per page (default: 20)
- `page` (optional): Page number
- `group_id` (optional): Filter by group
- `teacher_id` (optional): Filter by teacher
- `search` (optional): Search by name

**Response:**
```json
{
  "modules": {
    "data": [
      {
        "id": 1,
        "name": "Mathematics",
        "group_id": 1,
        "teacher_id": 5,
        "is_active": true,
        "group": {
          "id": 1,
          "name": "Group A"
        },
        "teacher": {
          "id": 5,
          "user": {
            "name": "Teacher Name"
          }
        },
        "schedules": [...]
      }
    ],
    "current_page": 1,
    "per_page": 20,
    "total": 30
  }
}
```

**POST /api/admin/modules**
**Authentication:** Required
**Role:** Admin
**Content-Type:** `application/json`

**Request Body:**
```json
{
  "name": "Physics",
  "group_id": 2,
  "teacher_id": 6,
  "is_active": true
}
```

**Validation Rules:**
- `name`: required, string, min 3 characters, max 255 characters
- `group_id`: optional, exists in groups table
- `teacher_id`: optional, exists in teachers table
- `is_active`: optional, boolean

**Response (201 Created):**
```json
{
  "message": "Module created successfully",
  "module": {
    "id": 31,
    "name": "Physics",
    "group_id": 2,
    "teacher_id": 6,
    "is_active": true,
    "group": {...},
    "teacher": {...}
  }
}
```

#### 4. Groups Management
**Endpoint:** `GET /api/admin/groups`
**Authentication:** Required
**Role:** Admin
**Query Parameters:**
- `per_page` (optional): Number of items per page (default: 20)
- `page` (optional): Page number
- `search` (optional): Search by name

**Response:**
```json
{
  "groups": {
    "data": [
      {
        "id": 1,
        "name": "Group A",
        "description": "First year students",
        "students": [
          {
            "id": 1,
            "user": {
              "name": "Student 1"
            }
          }
        ],
        "modules": [...]
      }
    ],
    "current_page": 1,
    "per_page": 20,
    "total": 10
  }
}
```

**POST /api/admin/groups**
**Authentication:** Required
**Role:** Admin
**Content-Type:** `application/json`

**Request Body:**
```json
{
  "name": "Group C",
  "description": "Third year students"
}
```

**Validation Rules:**
- `name`: required, string, min 3 characters, max 255 characters
- `description`: optional, string, max 1000 characters

**Response (201 Created):**
```json
{
  "message": "Group created successfully",
  "group": {
    "id": 11,
    "name": "Group C",
    "description": "Third year students",
    "students": []
  }
}
```

#### 5. Classrooms Management
**Endpoint:** `GET /api/admin/classrooms`
**Authentication:** Required
**Role:** Admin
**Query Parameters:**
- `per_page` (optional): Number of items per page (default: 20)
- `page` (optional): Page number
- `search` (optional): Search by name

**Response:**
```json
{
  "classrooms": {
    "data": [
      {
        "id": 1,
        "name": "Room 101",
        "capacity": 50,
        "building": "Main Building",
        "floor": "1",
        "equipment": "Projector, Whiteboard",
        "schedules": [...],
        "roomReservations": [...]
      }
    ],
    "current_page": 1,
    "per_page": 20,
    "total": 15
  }
}
```

**POST /api/admin/classrooms**
**Authentication:** Required
**Role:** Admin
**Content-Type:** `application/json`

**Request Body:**
```json
{
  "name": "Room 201",
  "capacity": 40,
  "building": "Science Building",
  "floor": "2",
  "equipment": "Lab equipment, Computers"
}
```

**Validation Rules:**
- `name`: required, string, min 3 characters, max 255 characters
- `capacity`: optional, integer, min 1
- `building`: optional, string, max 255 characters
- `floor`: optional, string, max 50 characters
- `equipment`: optional, string, max 1000 characters

**Response (201 Created):**
```json
{
  "message": "Classroom created successfully",
  "classroom": {
    "id": 16,
    "name": "Room 201",
    "capacity": 40,
    "building": "Science Building",
    "floor": "2",
    "equipment": "Lab equipment, Computers"
  }
}
```

#### 6. Schedules Management
**Endpoint:** `GET /api/admin/schedules`
**Authentication:** Required
**Role:** Admin
**Query Parameters:**
- `per_page` (optional): Number of items per page (default: 20)
- `page` (optional): Page number
- `module_id` (optional): Filter by module
- `classroom_id` (optional): Filter by classroom
- `day_of_week` (optional): Filter by day (1-7)

**Response:**
```json
{
  "schedules": {
    "data": [
      {
        "id": 1,
        "module_id": 1,
        "classroom_id": 1,
        "day_of_week": 1,
        "start_time": "08:00",
        "end_time": "10:00",
        "type": "lecture",
        "module": {
          "name": "Mathematics",
          "teacher": {
            "user": {
              "name": "Teacher Name"
            }
          }
        },
        "classroom": {
          "name": "Room 101"
        }
      }
    ],
    "current_page": 1,
    "per_page": 20,
    "total": 50
  }
}
```

**POST /api/admin/schedules**
**Authentication:** Required
**Role:** Admin
**Content-Type:** `application/json`

**Request Body:**
```json
{
  "module_id": 1,
  "classroom_id": 1,
  "day_of_week": 2,
  "start_time": "10:00",
  "end_time": "12:00",
  "type": "lab"
}
```

**Validation Rules:**
- `module_id`: required, exists in modules table
- `classroom_id`: required, exists in classrooms table
- `day_of_week`: required, integer, min 1, max 7
- `start_time`: required, time format (HH:MM)
- `end_time`: required, time format (HH:MM), must be after start_time
- `type`: required, must be one of: lecture, lab, exam, tutorial

**Response (201 Created):**
```json
{
  "message": "Schedule created successfully",
  "schedule": {
    "id": 51,
    "module_id": 1,
    "classroom_id": 1,
    "day_of_week": 2,
    "start_time": "10:00",
    "end_time": "12:00",
    "type": "lab",
    "module": {...},
    "classroom": {...}
  }
}
```

#### 7. Absence Justifications Validation
**Endpoint:** `GET /api/admin/absence-justifications`
**Authentication:** Required
**Role:** Admin
**Query Parameters:**
- `per_page` (optional): Number of items per page (default: 20)
- `page` (optional): Page number
- `status` (optional): Filter by status (pending, approved, rejected)

**Response:**
```json
{
  "justifications": {
    "data": [
      {
        "id": 1,
        "reason": "Medical appointment",
        "document_path": "absence_justifications/medical_note.pdf",
        "status": "pending",
        "created_at": "2024-01-15T10:00:00Z",
        "student": {
          "user": {
            "name": "John Doe"
          }
        },
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
    "per_page": 20,
    "total": 15
  }
}
```

**POST /api/admin/absence-justifications/{id}/validate**
**Authentication:** Required
**Role:** Admin
**Content-Type:** `application/json`

**Request Body:**
```json
{
  "status": "approved",
  "reviewer_notes": "Medical document verified"
}
```

**Validation Rules:**
- `status`: required, must be one of: approved, rejected
- `reviewer_notes`: optional, string, max 500 characters

**Response:**
```json
{
  "message": "Justification validated successfully",
  "justification": {
    "id": 1,
    "status": "approved",
    "reviewer_notes": "Medical document verified",
    "reviewer_id": 1,
    "reviewed_at": "2024-01-15T10:30:00Z",
    "student": {...},
    "reviewer": {
      "name": "Admin Name"
    }
  }
}
```

**Note:** When a justification is approved, all related absences are automatically marked as "excused".

#### 8. Administrative Requests Validation
**Endpoint:** `GET /api/admin/administrative-requests`
**Authentication:** Required
**Role:** Admin
**Query Parameters:**
- `per_page` (optional): Number of items per page (default: 20)
- `page` (optional): Page number
- `status` (optional): Filter by status (pending, in_progress, approved, completed, rejected)
- `type` (optional): Filter by type (transcript, certificate, attestation, other)

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
        "student": {
          "user": {
            "name": "John Doe"
          }
        },
        "teacher": null,
        "generatedDocuments": []
      }
    ],
    "current_page": 1,
    "per_page": 20,
    "total": 45
  }
}
```

**POST /api/admin/administrative-requests/{id}/validate**
**Authentication:** Required
**Role:** Admin
**Content-Type:** `application/json`

**Request Body:**
```json
{
  "status": "approved",
  "reviewer_notes": "Document generation initiated"
}
```

**Validation Rules:**
- `status`: required, must be one of: approved, rejected, in_progress, completed
- `reviewer_notes`: optional, string, max 500 characters

**Response:**
```json
{
  "message": "Request validated successfully",
  "request": {
    "id": 1,
    "type": "transcript",
    "title": "Academic Transcript",
    "description": "Need transcript for job application",
    "status": "completed",
    "reviewer_notes": "Document generation initiated",
    "reviewed_at": "2024-01-15T10:30:00Z",
    "student": {...}
  }
}
```

**Note:** When a request is approved and the type is transcript/certificate/attestation, the status is automatically set to "completed" to trigger PDF generation (PDF generation service to be implemented).

#### 9. Room Reservations Management
**Endpoint:** `GET /api/admin/room-reservations`
**Authentication:** Required
**Role:** Admin
**Query Parameters:**
- `per_page` (optional): Number of items per page (default: 20)
- `page` (optional): Page number
- `status` (optional): Filter by status (pending, approved, rejected, cancelled)
- `date` (optional): Filter by date

**Response:**
```json
{
  "reservations": {
    "data": [
      {
        "id": 1,
        "classroom_id": 1,
        "module_id": 1,
        "date": "2024-01-20",
        "start_time": "14:00",
        "end_time": "16:00",
        "purpose": "Extra class for exam preparation",
        "status": "pending",
        "classroom": {
          "name": "Room 101"
        },
        "module": {
          "name": "Mathematics",
          "teacher": {
            "user": {
              "name": "Teacher Name"
            }
          }
        },
        "teacher": {
          "user": {
            "name": "Teacher Name"
          }
        }
      }
    ],
    "current_page": 1,
    "per_page": 20,
    "total": 20
  }
}
```

**POST /api/admin/room-reservations/{id}/approve**
**Authentication:** Required
**Role:** Admin

**Response:**
```json
{
  "message": "Room reservation approved successfully",
  "reservation": {
    "id": 1,
    "status": "approved",
    "reviewer_id": 1,
    "reviewed_at": "2024-01-15T10:30:00Z",
    "classroom": {...},
    "module": {...}
  }
}
```

**POST /api/admin/room-reservations/{id}/reject**
**Authentication:** Required
**Role:** Admin
**Content-Type:** `application/json`

**Request Body:**
```json
{
  "rejection_reason": "Room already booked for this time slot"
}
```

**Validation Rules:**
- `rejection_reason`: required, string, max 500 characters

**Response:**
```json
{
  "message": "Room reservation rejected successfully",
  "reservation": {
    "id": 1,
    "status": "rejected",
    "rejection_reason": "Room already booked for this time slot",
    "reviewer_id": 1,
    "reviewed_at": "2024-01-15T10:30:00Z",
    "classroom": {...},
    "module": {...}
  }
}
```

## Admin Routes

### Frontend Routes

All admin routes are protected and require admin role authentication.

```
/admin/dashboard          - Dashboard with statistics
/admin/users             - User management
/admin/modules            - Module management
/admin/groups             - Group management
/admin/classrooms         - Classroom management
/admin/schedules          - Schedule management
/admin/justifications     - Absence justification validation
/admin/requests           - Administrative request validation
/admin/reservations       - Room reservation management
```

### Navigation Structure

**Admin Menu Items:**
```javascript
admin: [
  { path: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
  { path: '/admin/users', label: 'Users', icon: '👥' },
  { path: '/admin/modules', label: 'Modules', icon: '📚' },
  { path: '/admin/groups', label: 'Groups', icon: '🏫' },
  { path: '/admin/classrooms', label: 'Classrooms', icon: '🏛️' },
  { path: '/admin/schedules', label: 'Schedules', icon: '🕐' },
  { path: '/admin/justifications', label: 'Justifications', icon: '📝' },
  { path: '/admin/requests', label: 'Requests', icon: '📋' },
  { path: '/admin/reservations', label: 'Reservations', icon: '📅' },
]
```

## Testing Checklist

### Backend Testing

#### 1. Test Dashboard Endpoint
```bash
# Login as admin to get token
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@example.com", "password": "password"}'

# Get dashboard statistics
curl -X GET http://localhost:8000/api/admin/dashboard \
  -H "Authorization: Bearer YOUR_TOKEN"

# Expected response: JSON with all statistics
```

#### 2. Test Users CRUD
```bash
# Get all users
curl -X GET "http://localhost:8000/api/admin/users" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get users filtered by role
curl -X GET "http://localhost:8000/api/admin/users?role=student" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Search users
curl -X GET "http://localhost:8000/api/admin/users?search=john" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Create user
curl -X POST http://localhost:8000/api/admin/users \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123",
    "role_id": 1,
    "group_id": 1
  }'

# Update user
curl -X PUT http://localhost:8000/api/admin/users/151 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User Updated",
    "email": "test.updated@example.com"
  }'

# Delete user
curl -X DELETE http://localhost:8000/api/admin/users/151 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### 3. Test Modules CRUD
```bash
# Get all modules
curl -X GET "http://localhost:8000/api/admin/modules" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Create module
curl -X POST http://localhost:8000/api/admin/modules \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Module",
    "group_id": 1,
    "teacher_id": 1,
    "is_active": true
  }'

# Update module
curl -X PUT http://localhost:8000/api/admin/modules/31 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Module Updated",
    "is_active": false
  }'

# Delete module
curl -X DELETE http://localhost:8000/api/admin/modules/31 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### 4. Test Groups CRUD
```bash
# Get all groups
curl -X GET "http://localhost:8000/api/admin/groups" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Create group
curl -X POST http://localhost:8000/api/admin/groups \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Group",
    "description": "Test group description"
  }'

# Delete group
curl -X DELETE http://localhost:8000/api/admin/groups/11 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### 5. Test Classrooms CRUD
```bash
# Get all classrooms
curl -X GET "http://localhost:8000/api/admin/classrooms" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Create classroom
curl -X POST http://localhost:8000/api/admin/classrooms \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Room",
    "capacity": 30,
    "building": "Test Building",
    "floor": "1",
    "equipment": "Test equipment"
  }'

# Delete classroom
curl -X DELETE http://localhost:8000/api/admin/classrooms/16 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### 6. Test Schedules CRUD
```bash
# Get all schedules
curl -X GET "http://localhost:8000/api/admin/schedules" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Create schedule
curl -X POST http://localhost:8000/api/admin/schedules \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "module_id": 1,
    "classroom_id": 1,
    "day_of_week": 1,
    "start_time": "08:00",
    "end_time": "10:00",
    "type": "lecture"
  }'

# Delete schedule
curl -X DELETE http://localhost:8000/api/admin/schedules/51 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### 7. Test Justifications Validation
```bash
# Get pending justifications
curl -X GET "http://localhost:8000/api/admin/absence-justifications?status=pending" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Approve justification
curl -X POST http://localhost:8000/api/admin/absence-justifications/1/validate \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "approved",
    "reviewer_notes": "Document verified"
  }'

# Reject justification
curl -X POST http://localhost:8000/api/admin/absence-justifications/2/validate \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "rejected",
    "reviewer_notes": "Invalid document"
  }'
```

#### 8. Test Requests Validation
```bash
# Get pending requests
curl -X GET "http://localhost:8000/api/admin/administrative-requests?status=pending" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Approve request
curl -X POST http://localhost:8000/api/admin/administrative-requests/1/validate \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "approved",
    "reviewer_notes": "Processing started"
  }'

# Reject request
curl -X POST http://localhost:8000/api/admin/administrative-requests/2/validate \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "rejected",
    "reviewer_notes": "Request denied"
  }'
```

#### 9. Test Reservations Management
```bash
# Get pending reservations
curl -X GET "http://localhost:8000/api/admin/room-reservations?status=pending" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Approve reservation
curl -X POST http://localhost:8000/api/admin/room-reservations/1/approve \
  -H "Authorization: Bearer YOUR_TOKEN"

# Reject reservation
curl -X POST http://localhost:8000/api/admin/room-reservations/2/reject \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "rejection_reason": "Conflict with existing reservation"
  }'
```

### Frontend Testing

#### 1. Test Dashboard Page
1. Login as admin
2. Navigate to `/admin/dashboard`
3. Verify:
   - All statistics cards display correctly
   - User statistics (total, students, teachers, admins)
   - Academic statistics (modules, groups, classrooms, average grade)
   - Activity statistics (absences, requests, reservations)
   - Quick action buttons work

#### 2. Test Users Page
1. Navigate to `/admin/users`
2. Verify:
   - User list loads with pagination
   - Search by name/email works
   - Role filter works
   - "Add User" button shows form
   - Form validation works
   - User creation works
   - User deletion works with confirmation
   - Role badges display correctly

#### 3. Test Modules Page
1. Navigate to `/admin/modules`
2. Verify:
   - Module list loads
   - "Add Module" button shows form
   - Form validation works
   - Module creation works
   - Module deletion works
   - Active/Inactive status displays

#### 4. Test Groups Page
1. Navigate to `/admin/groups`
2. Verify:
   - Group list loads
   - "Add Group" button shows form
   - Form validation works
   - Group creation works
   - Group deletion works
   - Student count displays

#### 5. Test Classrooms Page
1. Navigate to `/admin/classrooms`
2. Verify:
   - Classroom list loads
   - "Add Classroom" button shows form
   - Form validation works
   - Classroom creation works
   - Classroom deletion works
   - Capacity, building, floor display

#### 6. Test Schedules Page
1. Navigate to `/admin/schedules`
2. Verify:
   - Schedule list loads
   - "Add Schedule" button shows form
   - Form validation works
   - Time validation (end after start) works
   - Schedule creation works
   - Schedule deletion works
   - Day and type display correctly

#### 7. Test Justifications Page
1. Navigate to `/admin/justifications`
2. Verify:
   - Justification list loads
   - Status filter works
   - Pending justifications show "Review" button
   - Review modal opens
   - Approval works
   - Rejection works with notes
   - Status updates after validation
   - Document link works

#### 8. Test Requests Page
1. Navigate to `/admin/requests`
2. Verify:
   - Request list loads
   - Status and type filters work
   - Pending requests show "Process" button
   - Process modal opens
   - Status changes work (approved, rejected, in_progress, completed)
   - Reviewer notes work
   - Status updates after processing

#### 9. Test Reservations Page
1. Navigate to `/admin/reservations`
2. Verify:
   - Reservation list loads
   - Status filter works
   - Pending reservations show approve/reject buttons
   - Approve works with confirmation
   - Reject modal opens
   - Rejection reason validation works
   - Status updates after action
   - Rejection reason displays

### Security Testing

1. **Authentication Required**
   - Try accessing endpoints without token → Should return 401
   - Try accessing pages without login → Should redirect to login

2. **Role-Based Access**
   - Login as teacher → Should not access admin routes
   - Login as student → Should not access admin routes
   - Login as admin → Should access all admin routes

3. **Data Isolation**
   - Admin should see all users, modules, groups, etc.
   - Non-admin users should not access admin endpoints

### Validation Testing

#### Users Validation
1. Submit without name → Should show "Name is required"
2. Submit without email → Should show "Email is required"
3. Submit without password → Should show "Password is required"
4. Submit without role_id → Should show "Role is required"
5. Submit with invalid email → Should show "Invalid email format"
6. Submit with short password → Should show "Password must be at least 8 characters"

#### Modules Validation
1. Submit without name → Should show "Name is required"
2. Submit with short name → Should show "Name must be at least 3 characters"

#### Schedules Validation
1. Submit without module_id → Should show "Module is required"
2. Submit without classroom_id → Should show "Classroom is required"
3. Submit without day_of_week → Should show "Day of week is required"
4. Submit without start_time → Should show "Start time is required"
5. Submit without end_time → Should show "End time is required"
6. Submit with end_time before start_time → Should show "End time must be after start time"
7. Submit with invalid type → Should show "Invalid type"

#### Justifications Validation
1. Submit without status → Should show "Status is required"
2. Submit with invalid status → Should show "Invalid status"

#### Reservations Validation
1. Reject without reason → Should show "Rejection reason is required"

## Summary

The administration module provides a complete set of features for administrators to:

- **Manage Users**: Full CRUD operations with role assignment and group assignment
- **Manage Modules**: Create, update, and delete modules with teacher and group assignments
- **Manage Groups**: Create and manage student groups
- **Manage Classrooms**: Create and manage classrooms with capacity and equipment details
- **Manage Schedules**: Create and manage class schedules with conflict detection
- **Validate Absence Justifications**: Review and approve/reject student absence justifications
- **Validate Administrative Requests**: Process transcript, certificate, and other document requests
- **Manage Room Reservations**: Approve or reject room reservation requests
- **View Dashboard Statistics**: Comprehensive statistics on users, modules, absences, requests, and reservations

All features include:
- Proper authentication and authorization (admin role required)
- Validation with clear error messages
- Pagination for large datasets
- Responsive UI design
- Clean, modern interface
- Real-time updates
