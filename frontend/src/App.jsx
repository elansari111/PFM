import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Unauthorized from './pages/Unauthorized';
import AdminLayout from './layouts/AdminLayout';
import TeacherLayout from './layouts/TeacherLayout';
import StudentLayout from './layouts/StudentLayout';
import AdminDashboard from './pages/AdminDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import StudentDashboard from './pages/StudentDashboard';
import Grades from './pages/student/Grades';
import Absences from './pages/student/Absences';
import Schedule from './pages/student/Schedule';
import Announcements from './pages/student/Announcements';
import CourseMaterials from './pages/student/CourseMaterials';
import AdministrativeRequests from './pages/student/AdministrativeRequests';
import AbsenceJustification from './pages/student/AbsenceJustification';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <Router>
            <Routes>
              {/* Public routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/unauthorized" element={<Unauthorized />} />

              {/* Redirect root to login */}
              <Route path="/" element={<Navigate to="/login" replace />} />

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
                <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
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
                <Route path="*" element={<Navigate to="/teacher/dashboard" replace />} />
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
                <Route path="grades" element={<Grades />} />
                <Route path="absences" element={<Absences />} />
                <Route path="schedule" element={<Schedule />} />
                <Route path="announcements" element={<Announcements />} />
                <Route path="course-materials" element={<CourseMaterials />} />
                <Route path="administrative-requests" element={<AdministrativeRequests />} />
                <Route path="absence-justification" element={<AbsenceJustification />} />
                <Route path="*" element={<Navigate to="/student/dashboard" replace />} />
              </Route>

              {/* Catch all - redirect to login */}
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </Router>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
