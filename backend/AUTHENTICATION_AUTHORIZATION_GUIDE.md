# Authentication and Authorization System Guide

## Overview
This guide provides comprehensive documentation for the authentication and authorization system implemented using Laravel Sanctum, role-based middleware, policies, gates, and React protected routes.

## Middleware Code

### RoleMiddleware

**Location:** `app/Http/Middleware/RoleMiddleware.php`

```php
<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RoleMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        if (!$request->user()) {
            return response()->json([
                'message' => 'Unauthenticated. Please login to continue.',
            ], 401);
        }

        foreach ($roles as $role) {
            if ($request->user()->hasRole($role)) {
                return $next($request);
            }
        }

        return response()->json([
            'message' => 'Unauthorized. You do not have the required role.',
            'required_roles' => $roles,
            'user_role' => $request->user()->role?->slug,
        ], 403);
    }
}
```

**Features:**
- Accepts multiple roles as parameters (e.g., `role:admin,teacher`)
- Returns 401 if user is not authenticated
- Returns 403 if user doesn't have any of the required roles
- Provides detailed error messages including required and user roles

**Usage in Routes:**
```php
Route::middleware('role:admin')->group(function () {
    // Admin-only routes
});

Route::middleware('role:admin,teacher')->group(function () {
    // Routes accessible by admin or teacher
});
```

**Middleware Registration:**
Registered in `bootstrap/app.php`:
```php
->withMiddleware(function (Middleware $middleware): void {
    $middleware->alias([
        'role' => \App\Http\Middleware\RoleMiddleware::class,
    ]);
})
```

## Policy Examples

### ModulePolicy

**Location:** `app/Policies/ModulePolicy.php`

```php
<?php

namespace App\Policies;

use App\Models\Module;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class ModulePolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return $user->isAdmin() || $user->isTeacher() || $user->isStudent();
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Module $module): bool
    {
        return $user->isAdmin() || 
               $user->isTeacher() || 
               ($user->isStudent() && $user->student->group_id === $module->group_id);
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return $user->isAdmin() || $user->isTeacher();
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Module $module): bool
    {
        return $user->isAdmin() || 
               ($user->isTeacher() && $user->teacher->id === $module->teacher_id);
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Module $module): bool
    {
        return $user->isAdmin();
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, Module $module): bool
    {
        return $user->isAdmin();
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, Module $module): bool
    {
        return $user->isAdmin();
    }
}
```

### GradePolicy

**Location:** `app/Policies/GradePolicy.php`

```php
<?php

namespace App\Policies;

use App\Models\Grade;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class GradePolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return $user->isAdmin() || $user->isTeacher();
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Grade $grade): bool
    {
        return $user->isAdmin() || 
               $user->isTeacher() || 
               $user->student && $user->student->id === $grade->student_id;
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return $user->isTeacher();
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Grade $grade): bool
    {
        return $user->isAdmin() || $user->isTeacher();
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Grade $grade): bool
    {
        return $user->isAdmin() || $user->isTeacher();
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, Grade $grade): bool
    {
        return $user->isAdmin();
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, Grade $grade): bool
    {
        return $user->isAdmin();
    }
}
```

### AbsencePolicy

**Location:** `app/Policies/AbsencePolicy.php`

```php
<?php

namespace App\Policies;

use App\Models\Absence;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class AbsencePolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return $user->isAdmin() || $user->isTeacher();
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Absence $absence): bool
    {
        return $user->isAdmin() || 
               $user->isTeacher() || 
               ($user->isStudent() && $user->student->id === $absence->student_id);
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return $user->isTeacher();
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Absence $absence): bool
    {
        return $user->isAdmin() || $user->isTeacher();
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Absence $absence): bool
    {
        return $user->isAdmin() || $user->isTeacher();
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, Absence $absence): bool
    {
        return $user->isAdmin();
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, Absence $absence): bool
    {
        return $user->isAdmin();
    }
}
```

**Policy Registration:**
Registered in `app/Providers/AppServiceProvider.php`:
```php
public function boot(): void
{
    // Register policies
    Gate::policy(Module::class, ModulePolicy::class);
    Gate::policy(Grade::class, GradePolicy::class);
    Gate::policy(Absence::class, AbsencePolicy::class);
}
```

**Using Policies in Controllers:**
```php
use Illuminate\Support\Facades\Gate;

public function update(Request $request, Module $module)
{
    if (!Gate::allows('update', $module)) {
        abort(403, 'Unauthorized');
    }
    
    // Update logic
}

// Or using the authorize method
public function update(Request $request, Module $module)
{
    $this->authorize('update', $module);
    
    // Update logic
}
```

## Gates

**Location:** `app/Providers/AppServiceProvider.php`

```php
public function boot(): void
{
    // Define gates for authorization
    Gate::define('is-admin', fn ($user) => $user->isAdmin());
    Gate::define('is-teacher', fn ($user) => $user->isTeacher());
    Gate::define('is-student', fn ($user) => $user->isStudent());
    
    Gate::define('manage-users', fn ($user) => $user->isAdmin());
    Gate::define('manage-modules', fn ($user) => $user->isAdmin() || $user->isTeacher());
    Gate::define('view-own-grades', fn ($user, $grade) => $user->student && $user->student->id === $grade->student_id);
    Gate::define('approve-justifications', fn ($user) => $user->isAdmin() || $user->isTeacher());
}
```

**Using Gates:**
```php
// Check if user can perform action
if (Gate::allows('manage-users')) {
    // User can manage users
}

// Check if user cannot perform action
if (Gate::denies('manage-users')) {
    abort(403);
}

// Using in controllers
$this->authorize('manage-users');

// Using in views
@can('manage-users')
    <!-- User can manage users -->
@endcan

@cannot('manage-users')
    <!-- User cannot manage users -->
@endcannot
```

## Protected Routes Examples

### Backend Laravel Routes

**Location:** `routes/api.php`

```php
<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;

// Public routes
Route::post('/auth/login', [AuthController::class, 'login']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    // Auth routes
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/me', [AuthController::class, 'me']);
    
    // Admin routes
    Route::middleware('role:admin')->prefix('/admin')->group(function () {
        Route::get('/dashboard', function () {
            return response()->json(['message' => 'Admin dashboard']);
        });
        Route::apiResource('users', \App\Http\Controllers\Api\UserController::class);
        Route::apiResource('roles', \App\Http\Controllers\Api\RoleController::class);
        Route::apiResource('groups', \App\Http\Controllers\Api\GroupController::class);
    });
    
    // Teacher routes
    Route::middleware('role:teacher')->prefix('/teacher')->group(function () {
        Route::get('/dashboard', function () {
            return response()->json(['message' => 'Teacher dashboard']);
        });
        Route::apiResource('modules', \App\Http\Controllers\Api\ModuleController::class);
        Route::apiResource('schedules', \App\Http\Controllers\Api\ScheduleController::class);
        Route::apiResource('grades', \App\Http\Controllers\Api\GradeController::class);
        Route::apiResource('announcements', \App\Http\Controllers\Api\AnnouncementController::class);
        Route::apiResource('course-materials', \App\Http\Controllers\Api\CourseMaterialController::class);
    });
    
    // Student routes
    Route::middleware('role:student')->prefix('/student')->group(function () {
        Route::get('/dashboard', function () {
            return response()->json(['message' => 'Student dashboard']);
        });
        Route::get('/modules', function () {
            return response()->json(['message' => 'Student modules']);
        });
        Route::get('/grades', function () {
            return response()->json(['message' => 'Student grades']);
        });
        Route::get('/absences', function () {
            return response()->json(['message' => 'Student absences']);
        });
        Route::post('/absence-justifications', [\App\Http\Controllers\Api\AbsenceJustificationController::class, 'store']);
        Route::post('/administrative-requests', [\App\Http\Controllers\Api\AdministrativeRequestController::class, 'store']);
        Route::get('/generated-documents', function () {
            return response()->json(['message' => 'Student documents']);
        });
    });
    
    // Common routes (accessible by multiple roles)
    Route::middleware('role:admin,teacher')->group(function () {
        Route::apiResource('classrooms', \App\Http\Controllers\Api\ClassroomController::class);
        Route::apiResource('room-reservations', \App\Http\Controllers\Api\RoomReservationController::class);
    });
    
    Route::middleware('role:admin,teacher,student')->group(function () {
        Route::apiResource('comments', \App\Http\Controllers\Api\CommentController::class)->only(['index', 'show', 'store']);
    });
});
```

### React Protected Routes

**Location:** `frontend/src/components/ProtectedRoute.jsx`

```jsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, requiredRole }) => {
  const { isAuthenticated, hasRole, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && !hasRole(requiredRole)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default ProtectedRoute;
```

**Usage in App.jsx:**

```jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Admin routes */}
          <Route
            path="/admin/*"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route path="dashboard" element={<AdminDashboard />} />
          </Route>

          {/* Teacher routes */}
          <Route
            path="/teacher/*"
            element={
              <ProtectedRoute requiredRole="teacher">
                <TeacherLayout />
              </ProtectedRoute>
            }
          >
            <Route path="dashboard" element={<TeacherDashboard />} />
          </Route>

          {/* Student routes */}
          <Route
            path="/student/*"
            element={
              <ProtectedRoute requiredRole="student">
                <StudentLayout />
              </ProtectedRoute>
            }
          >
            <Route path="dashboard" element={<StudentDashboard />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}
```

**Multiple Role Protection:**

```jsx
// Create a component that accepts multiple roles
const MultiRoleRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, hasRole, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const hasAllowedRole = allowedRoles.some(role => hasRole(role));
  if (!hasAllowedRole) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

// Usage
<MultiRoleRoute allowedRoles={['admin', 'teacher']}>
  <TeacherDashboard />
</MultiRoleRoute>
```

## Testing Steps

### Backend Testing

#### 1. Test Authentication Endpoints

**Login Endpoint:**
```bash
# Test successful login
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@example.com", "password": "password"}'

# Expected response:
{
  "message": "Login successful",
  "user": { ... },
  "token": "1|abc123..."
}
```

**Logout Endpoint:**
```bash
# Test logout (requires authentication)
curl -X POST http://localhost:8000/api/auth/logout \
  -H "Authorization: Bearer YOUR_TOKEN"

# Expected response:
{
  "message": "Logout successful"
}
```

**Current User Endpoint:**
```bash
# Test getting current user
curl -X GET http://localhost:8000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN"

# Expected response:
{
  "user": { ... }
}
```

#### 2. Test Role Middleware

**Admin-Only Route:**
```bash
# Test with admin token (should succeed)
curl -X GET http://localhost:8000/api/admin/dashboard \
  -H "Authorization: Bearer ADMIN_TOKEN"

# Test with teacher token (should fail with 403)
curl -X GET http://localhost:8000/api/admin/dashboard \
  -H "Authorization: Bearer TEACHER_TOKEN"

# Expected response for unauthorized:
{
  "message": "Unauthorized. You do not have the required role.",
  "required_roles": ["admin"],
  "user_role": "teacher"
}
```

**Multi-Role Route:**
```bash
# Test with admin token (should succeed)
curl -X GET http://localhost:8000/api/classrooms \
  -H "Authorization: Bearer ADMIN_TOKEN"

# Test with teacher token (should succeed)
curl -X GET http://localhost:8000/api/classrooms \
  -H "Authorization: Bearer TEACHER_TOKEN"

# Test with student token (should fail with 403)
curl -X GET http://localhost:8000/api/classrooms \
  -H "Authorization: Bearer STUDENT_TOKEN"
```

#### 3. Test Policies

**Using Policy in Controller:**
```php
// In ModuleController.php
public function update(Request $request, Module $module)
{
    $this->authorize('update', $module);
    
    // Update logic
}
```

**Test Policy Authorization:**
```bash
# Test teacher updating their own module (should succeed)
curl -X PUT http://localhost:8000/api/teacher/modules/1 \
  -H "Authorization: Bearer TEACHER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "Updated Module Name"}'

# Test teacher updating another teacher's module (should fail)
curl -X PUT http://localhost:8000/api/teacher/modules/2 \
  -H "Authorization: Bearer TEACHER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "Updated Module Name"}'
```

#### 4. Test Gates

**Test Gate Authorization:**
```php
// In controller
if (!Gate::allows('manage-users')) {
    return response()->json(['message' => 'Unauthorized'], 403);
}
```

#### 5. Test Validation

**Test Login Validation:**
```bash
# Test with invalid email
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "invalid-email", "password": "password"}'

# Expected response:
{
  "message": "Validation failed",
  "errors": {
    "email": ["Email must be a valid email address"]
  }
}

# Test with missing password
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@example.com"}'

# Expected response:
{
  "message": "Validation failed",
  "errors": {
    "password": ["Password is required"]
  }
}
```

#### 6. Test Unauthorized Responses

**Test Unauthenticated Request:**
```bash
# Request without token
curl -X GET http://localhost:8000/api/auth/me

# Expected response:
{
  "message": "Unauthenticated. Please login to continue."
}
```

### Frontend Testing

#### 1. Test Authentication Flow

**Test Login:**
1. Navigate to `/login`
2. Enter valid credentials
3. Verify redirect to appropriate dashboard based on role
4. Verify token is stored in localStorage

**Test Logout:**
1. Click logout button
2. Verify redirect to `/login`
3. Verify token is removed from localStorage

#### 2. Test Protected Routes

**Test Admin Route Protection:**
1. Login as teacher
2. Try to access `/admin/dashboard`
3. Verify redirect to `/unauthorized`

**Test Teacher Route Protection:**
1. Login as student
2. Try to access `/teacher/dashboard`
3. Verify redirect to `/unauthorized`

**Test Student Route Protection:**
1. Login as admin
2. Try to access `/student/dashboard`
3. Verify redirect to `/unauthorized`

#### 3. Test Token Expiration

**Test Token Expiration Handling:**
1. Login successfully
2. Manually remove token from localStorage
3. Wait 1 minute (token check interval)
4. Verify automatic logout and redirect to `/login`

#### 4. Test Role-Based Access

**Test Role Helper Functions:**
```javascript
// In React component
const { isAdmin, isTeacher, isStudent } = useAuth();

// Test with different user roles
console.log(isAdmin()); // true for admin, false for others
console.log(isTeacher()); // true for teacher, false for others
console.log(isStudent()); // true for student, false for others
```

#### 5. Test API Integration

**Test API Calls with Authentication:**
```javascript
// Test authenticated API call
const response = await api.get('/auth/me');
console.log(response.data.user);

// Test unauthorized API call (should return 401)
localStorage.removeItem('auth_token');
const response = await api.get('/auth/me');
// Should handle 401 and redirect to login
```

### Integration Testing

#### 1. End-to-End Authentication Flow

**Test Complete Flow:**
1. Start Laravel backend: `php artisan serve`
2. Start React frontend: `npm run dev`
3. Open browser to `http://localhost:5173`
4. Login with admin credentials
5. Verify access to admin routes
6. Logout
7. Login with teacher credentials
8. Verify access to teacher routes
9. Logout
10. Login with student credentials
11. Verify access to student routes

#### 2. Test Cross-Origin Requests

**Test CORS Configuration:**
```bash
# Test CORS from React frontend
curl -X OPTIONS http://localhost:8000/api/auth/login \
  -H "Origin: http://localhost:5173" \
  -H "Access-Control-Request-Method: POST"

# Verify CORS headers are present
```

#### 3. Test Sanctum Session

**Test Sanctum Cookie Authentication:**
```bash
# Test with session-based authentication (for SPA)
curl -X GET http://localhost:8000/sanctum/csrf-cookie
# Then make authenticated request with CSRF token
```

## Security Considerations

### Password Hashing
Laravel automatically uses bcrypt for password hashing. No additional configuration needed.

### Token Storage
- Tokens are stored in `personal_access_tokens` table
- Each token has a name and expiration date
- Tokens can be revoked individually or all at once

### Token Expiration
- Set token expiration in `config/sanctum.php`
- Example: `'expiration' => 60 * 24, // 24 hours`

### HTTPS in Production
Always use HTTPS in production to protect tokens in transit.

### CSRF Protection
CSRF protection is enabled for web routes. API routes using Sanctum tokens don't require CSRF tokens.

## Troubleshooting

### Common Issues

**1. CORS Errors**
- Ensure `config/sanctum.php` includes your frontend domain in `stateful` array
- Check CORS configuration in `config/cors.php`

**2. 401 Unauthorized**
- Verify token is being sent in Authorization header
- Check token is not expired
- Ensure Sanctum middleware is applied to routes

**3. 403 Forbidden**
- Verify user has the required role
- Check RoleMiddleware is correctly registered
- Ensure role slug matches middleware parameter

**4. Token Not Working**
- Verify token is stored correctly in localStorage
- Check API base URL is correct
- Ensure token format is correct (should include "Bearer " prefix)

## Summary

The authentication and authorization system provides:

**Backend:**
- Sanctum token-based authentication
- Role-based middleware for route protection
- Policies for model-level authorization
- Gates for custom authorization logic
- Proper validation and error handling
- JSON responses for API requests

**Frontend:**
- React Context for authentication state management
- Protected route components for role-based access control
- Token expiration handling
- Automatic logout on token expiration
- Role helper functions for easy authorization checks

**Security:**
- Secure password hashing (bcrypt)
- Token-based authentication
- Role-based access control
- Proper error responses
- CSRF protection for web routes
