# University Management System - React Frontend Setup

## Overview
This is a React + Vite frontend for the university management system with role-based access control (Admin, Teacher, Student).

## Prerequisites
- Node.js 18+
- npm or yarn
- Laravel backend running on http://localhost:8000

## Installation Steps

### 1. Install Dependencies
```bash
cd frontend
npm install
```

### 2. Configure Environment
```bash
# Copy .env.example to .env
cp .env.example .env
```

The `.env` file should contain:
```env
VITE_API_URL=http://localhost:8000/api
```

### 3. Start Development Server
```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`

## Folder Structure

```
frontend/
├── public/
│   └── icons.svg
├── src/
│   ├── assets/
│   │   ├── react.svg
│   │   └── vite.svg
│   ├── components/
│   │   ├── ErrorBoundary.jsx       # Error boundary for error handling
│   │   ├── LoadingSpinner.jsx      # Loading spinner component
│   │   ├── ProtectedRoute.jsx      # Route protection with role checking
│   │   └── Sidebar.jsx            # Responsive sidebar navigation
│   ├── context/
│   │   └── AuthContext.jsx         # Authentication context provider
│   ├── hooks/
│   │   └── useAuth.js              # Custom auth hook
│   ├── layouts/
│   │   ├── AdminLayout.jsx         # Admin layout with sidebar
│   │   ├── TeacherLayout.jsx       # Teacher layout with sidebar
│   │   └── StudentLayout.jsx       # Student layout with sidebar
│   ├── pages/
│   │   ├── Login.jsx               # Login page
│   │   ├── AdminDashboard.jsx      # Admin dashboard
│   │   ├── TeacherDashboard.jsx    # Teacher dashboard
│   │   ├── StudentDashboard.jsx    # Student dashboard
│   │   └── Unauthorized.jsx        # Unauthorized access page
│   ├── services/
│   │   ├── api.js                  # Axios API client configuration
│   │   └── authService.js          # Authentication service
│   ├── App.css
│   ├── App.jsx                     # Main app with routing
│   ├── index.css                   # Tailwind CSS imports
│   └── main.jsx                    # React entry point
├── .env                            # Environment variables
├── .env.example                    # Environment variables template
├── index.html
├── package.json
├── postcss.config.js               # PostCSS configuration
├── tailwind.config.js             # Tailwind CSS configuration
└── vite.config.js                 # Vite configuration
```

## Installed Packages

### Core Dependencies
- **react**: ^19.2.6 - React library
- **react-dom**: ^19.2.6 - React DOM renderer
- **react-router-dom**: Latest - Client-side routing
- **axios**: Latest - HTTP client for API requests
- **@tanstack/react-query**: Latest - Data fetching and caching
- **react-hook-form**: Latest - Form validation and management

### Development Dependencies
- **tailwindcss**: Latest - Utility-first CSS framework
- **postcss**: Latest - CSS post-processor
- **autoprefixer**: Latest - CSS vendor prefixing
- **@vitejs/plugin-react**: Latest - Vite React plugin
- **vite**: ^8.0.12 - Build tool and dev server

## Tailwind CSS Configuration

### tailwind.config.js
```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

### postcss.config.js
```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

## Routing Structure

The application uses React Router with the following route structure:

### Public Routes
- `/` - Redirects to `/login`
- `/login` - Login page
- `/unauthorized` - Unauthorized access page

### Admin Routes (Protected)
- `/admin/dashboard` - Admin dashboard
- `/admin/*` - Any other admin routes redirect to dashboard

### Teacher Routes (Protected)
- `/teacher/dashboard` - Teacher dashboard
- `/teacher/*` - Any other teacher routes redirect to dashboard

### Student Routes (Protected)
- `/student/dashboard` - Student dashboard
- `/student/*` - Any other student routes redirect to dashboard

### Route Protection
All role-specific routes are protected by the `ProtectedRoute` component which:
- Checks if user is authenticated
- Verifies user has the required role
- Redirects to login if not authenticated
- Redirects to unauthorized page if wrong role

## Authentication Context

### AuthContext
The `AuthContext` provides:
- `user` - Current user object with role information
- `loading` - Loading state for auth operations
- `error` - Error messages
- `login(email, password)` - Login function
- `logout()` - Logout function
- `hasRole(role)` - Check if user has specific role
- `isAdmin()` - Check if user is admin
- `isTeacher()` - Check if user is teacher
- `isStudent()` - Check if user is student
- `isAuthenticated` - Boolean indicating auth status

### Usage Example
```javascript
import { useAuth } from '../hooks/useAuth';

const MyComponent = () => {
  const { user, logout, isAdmin } = useAuth();
  
  return (
    <div>
      <p>Welcome, {user?.name}</p>
      {isAdmin() && <button>Admin Action</button>}
      <button onClick={logout}>Logout</button>
    </div>
  );
};
```

## API Client Configuration

### Axios Setup (src/services/api.js)
- Base URL configured from environment variable
- Automatic token injection from localStorage
- Request/response interceptors
- Automatic redirect to login on 401 errors

### Auth Service (src/services/authService.js)
Provides authentication methods:
- `login(email, password)` - Login and store token
- `logout()` - Logout and clear token
- `getCurrentUser()` - Fetch current user data
- `getUserFromStorage()` - Get user from localStorage
- `getToken()` - Get auth token
- `isAuthenticated()` - Check authentication status
- `hasRole(role)` - Check user role

## Test Accounts

Use these accounts to test the application:

### Admin
- Email: admin@test.com
- Password: password
- Redirects to: /admin/dashboard

### Teacher
- Email: teacher@test.com
- Password: password
- Redirects to: /teacher/dashboard

### Student
- Email: student@test.com
- Password: password
- Redirects to: /student/dashboard

## Testing Instructions

### 1. Start the Backend
```bash
cd backend
php artisan serve
```
Backend will run on http://localhost:8000

### 2. Start the Frontend
```bash
cd frontend
npm run dev
```
Frontend will run on http://localhost:5173

### 3. Test Login Flow
1. Open http://localhost:5173 in browser
2. You should see the login page
3. Enter test credentials (e.g., admin@test.com / password)
4. Click "Sign In"
5. You should be redirected to the appropriate dashboard based on role

### 4. Test Role-Based Access
1. Login as admin
2. Try to access /teacher/dashboard (should redirect to unauthorized)
3. Logout
4. Login as teacher
5. Access /teacher/dashboard (should work)
6. Try to access /admin/dashboard (should redirect to unauthorized)

### 5. Test Logout
1. Login with any account
2. Click logout button in sidebar
3. Should be redirected to login page
4. Token should be cleared from localStorage

### 6. Test Protected Routes
1. Try to access /admin/dashboard without logging in
2. Should redirect to login page
3. Login and try again
4. Should access the dashboard

### 7. Test Responsive Design
1. Resize browser window to mobile size
2. Sidebar should collapse
3. Hamburger menu should appear
4. Click menu to toggle sidebar

## Features Implemented

### Authentication
- ✅ Login page with form validation
- ✅ Token-based authentication with Laravel Sanctum
- ✅ Secure token storage in localStorage
- ✅ Automatic token injection in API requests
- ✅ Logout functionality

### Authorization
- ✅ Role-based access control
- ✅ Protected routes
- ✅ Role checking utilities
- ✅ Unauthorized access page

### UI/UX
- ✅ Responsive sidebar navigation
- ✅ Role-specific layouts
- ✅ Dashboard placeholders for all roles
- ✅ Loading states
- ✅ Error handling with ErrorBoundary
- ✅ Clean, modern UI with Tailwind CSS

### Data Management
- ✅ Axios API client configuration
- ✅ React Query setup for data fetching
- ✅ Form validation with React Hook Form
- ✅ Context API for state management

## Next Steps

To continue building the application, you can add:
- Grade management pages
- Attendance tracking interface
- Course/module management
- Schedule/EDT display
- Room reservation system
- Administrative requests workflow
- Classroom space features
- Profile management
- Settings pages

## Troubleshooting

### CORS Issues
If you encounter CORS errors, ensure:
- Laravel CORS configuration allows your frontend URL
- Backend is running on the expected port
- Environment variables are correctly set

### Authentication Issues
If login fails:
- Check backend is running and accessible
- Verify API URL in .env file
- Check browser console for error messages
- Ensure test accounts exist in database

### Build Issues
If you encounter build errors:
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Clear Vite cache: `rm -rf .vite`
- Check Node.js version (should be 18+)

## Development Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint
```

## Production Deployment

1. Build the application:
```bash
npm run build
```

2. The built files will be in the `dist/` directory
3. Upload the `dist/` directory to your web server
4. Configure your web server to serve the app
5. Update `VITE_API_URL` in production environment

## Security Notes

- Tokens are stored in localStorage (consider using httpOnly cookies for production)
- All API requests include authentication headers
- Protected routes verify both authentication and authorization
- Error boundary prevents app crashes
- Input validation on all forms
