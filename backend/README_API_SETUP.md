# University Management System - Laravel REST API Setup

## Overview
This is a Laravel REST API backend for a university management system with role-based access control (Admin, Teacher, Student).

## Prerequisites
- PHP 8.3+
- MySQL
- Composer
- Laravel 13.8+

## Installation Steps

### 1. Install Dependencies
```bash
cd backend
composer install
```

### 2. Configure Environment
```bash
# Copy .env.example to .env
cp .env.example .env

# Generate application key
php artisan key:generate
```

### 3. Configure MySQL Database
Update the `.env` file with your MySQL credentials:
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=university_management
DB_USERNAME=root
DB_PASSWORD=your_password
```

### 4. Run Migrations
```bash
php artisan migrate
```

### 5. Seed the Database
```bash
php artisan db:seed
```

This will create:
- 3 roles (admin, teacher, student)
- 2 groups
- 3 test users with credentials:
  - **Admin**: admin@test.com / password
  - **Teacher**: teacher@test.com / password
  - **Student**: student@test.com / password

### 6. Start Development Server
```bash
php artisan serve
```

The API will be available at `http://localhost:8000`

## API Endpoints

### Authentication Endpoints

#### Login
- **POST** `/api/auth/login`
- **Body**:
```json
{
  "email": "admin@test.com",
  "password": "password"
}
```
- **Response**:
```json
{
  "message": "Login successful",
  "user": {
    "id": 1,
    "name": "Admin User",
    "email": "admin@test.com",
    "role": {
      "id": 1,
      "name": "Admin",
      "slug": "admin"
    }
  },
  "token": "1|xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
}
```

#### Logout (Protected)
- **POST** `/api/auth/logout`
- **Headers**: `Authorization: Bearer {token}`
- **Response**:
```json
{
  "message": "Logout successful"
}
```

#### Get Current User (Protected)
- **GET** `/api/auth/me`
- **Headers**: `Authorization: Bearer {token}`
- **Response**:
```json
{
  "user": {
    "id": 1,
    "name": "Admin User",
    "email": "admin@test.com",
    "role": {
      "id": 1,
      "name": "Admin",
      "slug": "admin"
    }
  }
}
```

### Role-Based Endpoints

#### Admin Dashboard (Protected - Admin Only)
- **GET** `/api/admin/dashboard`
- **Headers**: `Authorization: Bearer {token}`
- **Response**:
```json
{
  "message": "Admin dashboard"
}
```

#### Teacher Dashboard (Protected - Teacher Only)
- **GET** `/api/teacher/dashboard`
- **Headers**: `Authorization: Bearer {token}`
- **Response**:
```json
{
  "message": "Teacher dashboard"
}
```

#### Student Dashboard (Protected - Student Only)
- **GET** `/api/student/dashboard`
- **Headers**: `Authorization: Bearer {token}`
- **Response**:
```json
{
  "message": "Student dashboard"
}
```

## Database Schema

### Tables
- **users** - User accounts with role relationships
- **roles** - System roles (admin, teacher, student)
- **students** - Student-specific information
- **teachers** - Teacher-specific information
- **groups** - Student groups/classes
- **personal_access_tokens** - Sanctum API tokens

### Relationships
- User belongs to Role
- User has one Student or Teacher profile
- Student belongs to Group
- Group has many Students

## Postman Testing

### Import Collection
Create a new collection in Postman with the following requests:

#### 1. Login Request
- Method: POST
- URL: `http://localhost:8000/api/auth/login`
- Headers: 
  - Content-Type: application/json
- Body (raw JSON):
```json
{
  "email": "admin@test.com",
  "password": "password"
}
```

#### 2. Get Current User
- Method: GET
- URL: `http://localhost:8000/api/auth/me`
- Headers:
  - Content-Type: application/json
  - Authorization: Bearer {{token}}
- Set `{{token}}` as an environment variable from the login response

#### 3. Logout
- Method: POST
- URL: `http://localhost:8000/api/auth/logout`
- Headers:
  - Content-Type: application/json
  - Authorization: Bearer {{token}}

#### 4. Admin Dashboard
- Method: GET
- URL: `http://localhost:8000/api/admin/dashboard`
- Headers:
  - Content-Type: application/json
  - Authorization: Bearer {{token}}

### Postman Environment Variables
Create an environment with:
- `base_url`: `http://localhost:8000`
- `token`: (set automatically from login response)

## Testing Instructions

### Manual Testing
1. Start the Laravel server: `php artisan serve`
2. Test login endpoint with different user accounts
3. Copy the token from the login response
4. Use the token in the Authorization header for protected endpoints
5. Test role-based access by logging in as different users

### Test Cases
- ✅ Login with valid credentials
- ✅ Login with invalid credentials (should return 401)
- ✅ Access protected routes without token (should return 401)
- ✅ Access role-specific routes with wrong role (should return 403)
- ✅ Logout and revoke token
- ✅ Get current user information

## Project Structure

```
backend/
├── app/
│   ├── Http/
│   │   ├── Controllers/
│   │   │   └── Api/
│   │   │       └── AuthController.php
│   │   ├── Middleware/
│   │   │   └── RoleMiddleware.php
│   │   └── Requests/
│   │       └── LoginRequest.php
│   ├── Models/
│   │   ├── User.php
│   │   ├── Role.php
│   │   ├── Student.php
│   │   ├── Teacher.php
│   │   └── Group.php
│   ├── Policies/
│   └── Services/
├── config/
│   ├── cors.php
│   └── sanctum.php
├── database/
│   ├── migrations/
│   │   ├── 2026_05_29_230252_create_roles_table.php
│   │   ├── 2026_05_29_230307_modify_users_table_add_role_id.php
│   │   ├── 2026_05_29_230328_create_students_table.php
│   │   ├── 2026_05_29_230332_create_teachers_table.php
│   │   └── 2026_05_29_230336_create_groups_table.php
│   └── seeders/
│       ├── RoleSeeder.php
│       ├── GroupSeeder.php
│       ├── UserSeeder.php
│       └── DatabaseSeeder.php
└── routes/
    └── api.php
```

## Security Features
- ✅ Laravel Sanctum for API authentication
- ✅ Role-based access control
- ✅ Password hashing with bcrypt
- ✅ CORS configuration
- ✅ Request validation with Form Requests
- ✅ Middleware protection for sensitive routes

## Next Steps
To continue building the application, you can add:
- Grade management endpoints
- Attendance tracking
- Course/module management
- Schedule/EDT management
- Room reservations
- Administrative requests workflow
- Classroom space features

## Troubleshooting

### Migration Errors
If you encounter migration errors, run:
```bash
php artisan migrate:fresh
php artisan db:seed
```

### Sanctum Issues
Ensure Sanctum is properly configured in `config/sanctum.php` and the User model has the `HasApiTokens` trait.

### CORS Issues
Check `config/cors.php` and ensure your frontend URL is in the allowed origins.

### Token Not Working
Make sure you're including the token in the Authorization header as `Bearer {token}`.
