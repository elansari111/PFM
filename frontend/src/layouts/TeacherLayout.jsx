import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

const TeacherLayout = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      <Sidebar role="teacher" />
      <main className="lg:ml-64 p-4 lg:p-8">
        <Outlet />
      </main>
    </div>
  );
};

export default TeacherLayout;
