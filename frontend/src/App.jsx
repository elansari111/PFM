import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Unauthorized from './pages/Unauthorized';
import AdminLayout from './layouts/AdminLayout';
import TeacherLayout from './layouts/TeacherLayout';
import StudentLayout from './layouts/StudentLayout';
import AdminDashboard from './pages/AdminDashboard';
import AdminDashboardPage from './pages/admin/Dashboard';
import Users from './pages/admin/Users';
import Modules from './pages/admin/Modules';
import Groups from './pages/admin/Groups';
import Classrooms from './pages/admin/Classrooms';
import Schedules from './pages/admin/Schedules';
import Justifications from './pages/admin/Justifications';
import Requests from './pages/admin/Requests';
import Reservations from './pages/admin/Reservations';
import AdminLessonLogs from './pages/admin/LessonLogs';
import TeacherDashboard from './pages/TeacherDashboard';
import StudentDashboard from './pages/StudentDashboard';
import Grades from './pages/student/Grades';
import Absences from './pages/student/Absences';
import Schedule from './pages/student/Schedule';
import Announcements from './pages/student/Announcements';
import CourseMaterials from './pages/student/CourseMaterials';
import AdministrativeRequests from './pages/student/AdministrativeRequests';
import AbsenceJustification from './pages/student/AbsenceJustification';
import TeacherGrades from './pages/teacher/Grades';
import TeacherAttendance from './pages/teacher/Attendance';
import TeacherSchedule from './pages/teacher/Schedule';
import TeacherAnnouncements from './pages/teacher/Announcements';
import TeacherCourseMaterials from './pages/teacher/CourseMaterials';
import TeacherRoomReservations from './pages/teacher/RoomReservations';
import TeacherAdministrativeRequests from './pages/teacher/AdministrativeRequests';
import LessonLogs from './pages/teacher/LessonLogs';

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
        <ThemeProvider>
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
                <Route path="dashboard" element={<AdminDashboardPage />} />
                <Route path="users" element={<Users />} />
                <Route path="modules" element={<Modules />} />
                <Route path="groups" element={<Groups />} />
                <Route path="classrooms" element={<Classrooms />} />
                <Route path="schedules" element={<Schedules />} />
                <Route path="justifications" element={<Justifications />} />
                <Route path="requests" element={<Requests />} />
                <Route path="reservations" element={<Reservations />} />
                <Route path="lesson-logs" element={<AdminLessonLogs />} />
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
                <Route path="grades" element={<TeacherGrades />} />
                <Route path="attendance" element={<TeacherAttendance />} />
                <Route path="schedule" element={<TeacherSchedule />} />
                <Route path="announcements" element={<TeacherAnnouncements />} />
                <Route path="course-materials" element={<TeacherCourseMaterials />} />
                <Route path="room-reservations" element={<TeacherRoomReservations />} />
                <Route path="administrative-requests" element={<TeacherAdministrativeRequests />} />
                <Route path="lesson-logs" element={<LessonLogs />} />
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
      </ThemeProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);
}

export default App;
