import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';

const AdminDashboard = () => {
  const [activeSegment, setActiveSegment] = useState(null);
  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: () => api.get('/admin/dashboard').then(res => res.data),
  });

  // Skeleton Loading State
  if (isLoading) {
    return (
      <div className="space-y-8 animate-pulse p-2">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(n => (
            <div key={n} className="h-32 bg-gray-200 dark:bg-slate-800 rounded-2xl"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-96 bg-gray-200 dark:bg-slate-800 rounded-2xl"></div>
          <div className="h-96 bg-gray-200 dark:bg-slate-800 rounded-2xl"></div>
        </div>
        <div className="h-48 bg-gray-200 dark:bg-slate-800 rounded-2xl"></div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-2xl max-w-2xl mx-auto shadow-lg">
        <span className="text-5xl mb-4">⚠️</span>
        <h3 className="text-xl font-bold text-red-800 dark:text-red-400 mb-2">Failed to load analytics</h3>
        <p className="text-red-600 dark:text-red-300 mb-6">{error.message}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-2.5 bg-red-600 dark:bg-red-700 text-white rounded-xl hover:bg-red-700 dark:hover:bg-red-650 transition-all font-semibold"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  const { stats } = data;

  // Empty Data State check
  const hasData = stats && stats.users && stats.users.total > 0;
  if (!hasData) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center bg-gray-50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-800 rounded-2xl max-w-xl mx-auto shadow-md">
        <span className="text-6xl mb-4">📂</span>
        <h3 className="text-lg font-bold text-gray-800 dark:text-slate-200 mb-2">No University Records</h3>
        <p className="text-gray-500 dark:text-slate-400 mb-6">There are no academic or student records found in the database. Get started by adding users.</p>
        <button
          onClick={() => window.location.href = '/admin/users'}
          className="px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-medium"
        >
          Add New User
        </button>
      </div>
    );
  }

  // Segment values for custom SVG Donut Chart
  const uStudents = stats.users.students || 0;
  const uTeachers = stats.users.teachers || 0;
  const uAdmins = stats.users.admins || 0;
  const uTotal = stats.users.total || 1;

  const pctStudents = ((uStudents / uTotal) * 100).toFixed(0);
  const pctTeachers = ((uTeachers / uTotal) * 100).toFixed(0);
  const pctAdmins = ((uAdmins / uTotal) * 100).toFixed(0);

  // SVG Area coordinates generation for Activities
  const actAbsences = stats.absences?.total || 0;
  const actRequests = stats.administrative_requests?.total || 0;
  const actReservations = stats.room_reservations?.total || 0;
  const actMax = Math.max(actAbsences, actRequests, actReservations, 10);

  // Calculate percentage heights for a gorgeous custom interactive SVG area graph
  const hAbs = (actAbsences / actMax) * 150;
  const hReq = (actRequests / actMax) * 150;
  const hRes = (actReservations / actMax) * 150;

  const StatCard = ({ title, value, subtitle, gradient, icon }) => (
    <div className={`relative overflow-hidden rounded-2xl shadow-md transition-all duration-300 hover:scale-[1.02] hover:shadow-lg p-6 bg-gradient-to-br ${gradient} border border-white/10 text-white`}>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium opacity-85 mb-1.5 uppercase tracking-wider">{title}</p>
          <h4 className="text-3xl font-extrabold tracking-tight">{value}</h4>
          {subtitle && <p className="text-xs opacity-75 mt-2 font-medium">{subtitle}</p>}
        </div>
        <span className="text-3xl bg-white/10 p-2.5 rounded-xl backdrop-blur-xs select-none">{icon}</span>
      </div>
    </div>
  );

  return (
    <div className="space-y-8 pb-10">
      {/* Dashboard Heading */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">University Dashboard</h1>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">Real-time academic performance, roles distribution, and activity audits.</p>
        </div>
        <div className="flex items-center space-x-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 p-1.5 rounded-xl shadow-xs self-start">
          <span className="inline-block w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping ml-2 mr-1"></span>
          <span className="text-xs font-semibold text-gray-700 dark:text-slate-300 pr-2">System Live Sync</span>
        </div>
      </div>

      {/* User Statistics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Accounts" 
          value={stats.users.total} 
          subtitle="Registered profiles"
          gradient="from-indigo-600 to-indigo-700"
          icon="👥"
        />
        <StatCard 
          title="Student Pool" 
          value={stats.users.students} 
          subtitle={`${pctStudents}% of total userbase`}
          gradient="from-blue-600 to-blue-700"
          icon="🎓"
        />
        <StatCard 
          title="Teacher Faculty" 
          value={stats.users.teachers} 
          subtitle={`${pctTeachers}% of total userbase`}
          gradient="from-emerald-600 to-emerald-700"
          icon="👨‍🏫"
        />
        <StatCard 
          title="Administrators" 
          value={stats.users.admins} 
          subtitle={`${pctAdmins}% administrative control`}
          gradient="from-rose-600 to-rose-700"
          icon="🛡️"
        />
      </div>

      {/* Academic Highlights Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Active Modules" 
          value={stats.modules.total} 
          subtitle={`${stats.modules.active} fully active course modules`}
          gradient="from-violet-600 to-fuchsia-700"
          icon="📚"
        />
        <StatCard 
          title="Student Groups" 
          value={stats.groups.total} 
          subtitle={`${stats.groups.total_students} active students enrolled`}
          gradient="from-amber-500 to-orange-600"
          icon="🏫"
        />
        <StatCard 
          title="Classroom Capacity" 
          value={stats.classrooms.total} 
          subtitle="Physical rooms managed"
          gradient="from-sky-500 to-cyan-600"
          icon="🏛️"
        />
        <StatCard 
          title="Average Grade" 
          value={Number(stats.grades.average).toFixed(2)} 
          subtitle="Global student average score / 20"
          gradient="from-teal-600 to-emerald-600"
          icon="⭐"
        />
      </div>

      {/* Graphic Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* SVG Area Chart for Academic Activities */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-850 p-6 rounded-2xl shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-bold text-gray-800 dark:text-slate-100">Academic Operations Activities</h3>
              <p className="text-xs text-gray-500 dark:text-slate-400">Comparing volume metrics for operational audits.</p>
            </div>
            <span className="text-xs font-semibold bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 px-3 py-1 rounded-full">Operational Audit</span>
          </div>

          <div className="relative h-64 w-full flex items-end justify-around pt-6">
            {/* Custom interactive SVG Bar / Area visualization */}
            <svg className="w-full h-full" viewBox="0 0 600 200" preserveAspectRatio="none">
              <defs>
                <linearGradient id="absGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ef4444" stopOpacity="0.8"/>
                  <stop offset="100%" stopColor="#ef4444" stopOpacity="0.1"/>
                </linearGradient>
                <linearGradient id="reqGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.8"/>
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.1"/>
                </linearGradient>
                <linearGradient id="resGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.8"/>
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.1"/>
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              <line x1="0" y1="50" x2="600" y2="50" stroke="#f1f5f9" className="dark:stroke-slate-800" strokeWidth="1" strokeDasharray="4" />
              <line x1="0" y1="100" x2="600" y2="100" stroke="#f1f5f9" className="dark:stroke-slate-800" strokeWidth="1" strokeDasharray="4" />
              <line x1="0" y1="150" x2="600" y2="150" stroke="#f1f5f9" className="dark:stroke-slate-800" strokeWidth="1" strokeDasharray="4" />
              <line x1="0" y1="195" x2="600" y2="195" stroke="#e2e8f0" className="dark:stroke-slate-800" strokeWidth="1.5" />

              {/* Area path for Absences */}
              <path d={`M 0 195 L 0 ${195 - hAbs * 0.4} Q 100 ${195 - hAbs * 0.9} 200 ${195 - hAbs} Q 300 ${195 - hAbs * 0.9} 400 ${195 - hAbs * 0.3} L 600 195 Z`} fill="url(#absGradient)" />
              <path d={`M 0 ${195 - hAbs * 0.4} Q 100 ${195 - hAbs * 0.9} 200 ${195 - hAbs} Q 300 ${195 - hAbs * 0.9} 400 ${195 - hAbs * 0.3} L 600 195`} fill="none" stroke="#ef4444" strokeWidth="3" />

              {/* Area path for Administrative Requests */}
              <path d={`M 0 195 L 100 ${195 - hReq * 0.2} Q 200 ${195 - hReq * 0.6} 300 ${195 - hReq} Q 400 ${195 - hReq * 0.8} 500 ${195 - hReq * 0.3} L 600 195 Z`} fill="url(#reqGradient)" />
              <path d={`M 100 ${195 - hReq * 0.2} Q 200 ${195 - hReq * 0.6} 300 ${195 - hReq} Q 400 ${195 - hReq * 0.8} 500 ${195 - hReq * 0.3}`} fill="none" stroke="#3b82f6" strokeWidth="3" />

              {/* Area path for Room Reservations */}
              <path d={`M 0 195 L 200 ${195 - hRes * 0.1} Q 300 ${195 - hRes * 0.5} 400 ${195 - hRes} Q 500 ${195 - hRes * 0.6} 600 195 Z`} fill="url(#resGradient)" />
              <path d={`M 200 ${195 - hRes * 0.1} Q 300 ${195 - hRes * 0.5} 400 ${195 - hRes} Q 500 ${195 - hRes * 0.6} 600 195`} fill="none" stroke="#10b981" strokeWidth="3" />
            </svg>
          </div>

          <div className="grid grid-cols-3 text-center pt-4 border-t border-gray-100 dark:border-slate-800">
            <div>
              <span className="inline-block w-3.5 h-3.5 rounded-full bg-red-500 mr-2 shadow-xs shadow-red-500/50"></span>
              <span className="text-sm font-semibold text-gray-700 dark:text-slate-300">Student Absences ({actAbsences})</span>
            </div>
            <div>
              <span className="inline-block w-3.5 h-3.5 rounded-full bg-blue-500 mr-2 shadow-xs shadow-blue-500/50"></span>
              <span className="text-sm font-semibold text-gray-700 dark:text-slate-300">Admin Requests ({actRequests})</span>
            </div>
            <div>
              <span className="inline-block w-3.5 h-3.5 rounded-full bg-emerald-500 mr-2 shadow-xs shadow-emerald-500/50"></span>
              <span className="text-sm font-semibold text-gray-700 dark:text-slate-300">Reservations ({actReservations})</span>
            </div>
          </div>
        </div>

        {/* SVG Donut Chart for User Roles Distribution */}
        <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-850 p-6 rounded-2xl shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-800 dark:text-slate-100">User Accounts Allocation</h3>
            <p className="text-xs text-gray-500 dark:text-slate-400">Distribution proportion of all active user profiles.</p>
          </div>

          <div className="relative flex justify-center items-center py-6">
            {/* Beautiful Custom SVG Segments based on user pool */}
            <svg width="180" height="180" viewBox="0 0 36 36" className="transform -rotate-90">
              {/* Grey Track */}
              <circle cx="18" cy="18" r="15.915" fill="none" stroke="#f1f5f9" className="dark:stroke-slate-800" strokeWidth="3" />
              
              {/* Segment 1: Students */}
              <circle 
                cx="18" cy="18" r="15.915" fill="none" stroke="#3b82f6" strokeWidth="3" 
                strokeDasharray={`${pctStudents} ${100 - pctStudents}`}
                strokeDashoffset="0"
                className="transition-all duration-300 hover:stroke-[3.5] cursor-pointer"
                onMouseEnter={() => setActiveSegment('Students')}
                onMouseLeave={() => setActiveSegment(null)}
              />
              {/* Segment 2: Teachers */}
              <circle 
                cx="18" cy="18" r="15.915" fill="none" stroke="#10b981" strokeWidth="3" 
                strokeDasharray={`${pctTeachers} ${100 - pctTeachers}`}
                strokeDashoffset={`-${pctStudents}`}
                className="transition-all duration-300 hover:stroke-[3.5] cursor-pointer"
                onMouseEnter={() => setActiveSegment('Teachers')}
                onMouseLeave={() => setActiveSegment(null)}
              />
              {/* Segment 3: Admins */}
              <circle 
                cx="18" cy="18" r="15.915" fill="none" stroke="#ef4444" strokeWidth="3" 
                strokeDasharray={`${pctAdmins} ${100 - pctAdmins}`}
                strokeDashoffset={`-${Number(pctStudents) + Number(pctTeachers)}`}
                className="transition-all duration-300 hover:stroke-[3.5] cursor-pointer"
                onMouseEnter={() => setActiveSegment('Admins')}
                onMouseLeave={() => setActiveSegment(null)}
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-xs uppercase font-bold text-gray-400 tracking-wider">
                {activeSegment || 'Total'}
              </span>
              <span className="text-2xl font-black text-gray-800 dark:text-white">
                {activeSegment === 'Students' ? uStudents : activeSegment === 'Teachers' ? uTeachers : activeSegment === 'Admins' ? uAdmins : uTotal}
              </span>
            </div>
          </div>

          <div className="space-y-2 border-t border-gray-100 dark:border-slate-800 pt-4">
            <div className="flex justify-between text-xs font-semibold text-gray-600 dark:text-slate-400">
              <span className="flex items-center"><span className="w-2.5 h-2.5 bg-blue-500 rounded-full mr-2"></span>Students</span>
              <span>{uStudents} ({pctStudents}%)</span>
            </div>
            <div className="flex justify-between text-xs font-semibold text-gray-600 dark:text-slate-400">
              <span className="flex items-center"><span className="w-2.5 h-2.5 bg-emerald-500 rounded-full mr-2"></span>Teachers</span>
              <span>{uTeachers} ({pctTeachers}%)</span>
            </div>
            <div className="flex justify-between text-xs font-semibold text-gray-600 dark:text-slate-400">
              <span className="flex items-center"><span className="w-2.5 h-2.5 bg-red-500 rounded-full mr-2"></span>Admins</span>
              <span>{uAdmins} ({pctAdmins}%)</span>
            </div>
          </div>
        </div>

      </div>

      {/* Activity Audits & Statistics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Absences Card */}
        <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-850 p-6 rounded-2xl shadow-sm space-y-4 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-center pb-2 border-b border-gray-100 dark:border-slate-800">
            <h3 className="text-md font-bold text-gray-800 dark:text-slate-100">Absences Audits</h3>
            <span className="text-xs bg-red-50 dark:bg-red-950/20 text-red-600 px-2 py-1 rounded-md font-medium">Alerts</span>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 dark:text-slate-400">Total Registered Absences</span>
              <span className="font-semibold text-gray-800 dark:text-slate-200">{stats.absences.total}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 dark:text-slate-400">Pending Justifications</span>
              <span className="font-semibold text-amber-600 dark:text-amber-500">{stats.absences.pending_justifications} justifications</span>
            </div>
          </div>
        </div>

        {/* Requests Card */}
        <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-850 p-6 rounded-2xl shadow-sm space-y-4 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-center pb-2 border-b border-gray-100 dark:border-slate-800">
            <h3 className="text-md font-bold text-gray-800 dark:text-slate-100">Administrative Requests</h3>
            <span className="text-xs bg-blue-50 dark:bg-blue-950/20 text-blue-600 px-2 py-1 rounded-md font-medium">Pending Tasks</span>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 dark:text-slate-400">Total Student Requests</span>
              <span className="font-semibold text-gray-800 dark:text-slate-200">{stats.administrative_requests.total}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 dark:text-slate-400">Awaiting Validation</span>
              <span className="font-semibold text-amber-600 dark:text-amber-500">{stats.administrative_requests.pending} pending</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 dark:text-slate-400">In Progress Status</span>
              <span className="font-semibold text-blue-600 dark:text-blue-400">{stats.administrative_requests.in_progress} processing</span>
            </div>
          </div>
        </div>

        {/* Room Reservations Card */}
        <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-850 p-6 rounded-2xl shadow-sm space-y-4 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-center pb-2 border-b border-gray-100 dark:border-slate-800">
            <h3 className="text-md font-bold text-gray-800 dark:text-slate-100">Room Reservations</h3>
            <span className="text-xs bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 px-2 py-1 rounded-md font-medium">Classrooms</span>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 dark:text-slate-400">Total Reservations Filed</span>
              <span className="font-semibold text-gray-800 dark:text-slate-200">{stats.room_reservations.total}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 dark:text-slate-400">Pending Approvals</span>
              <span className="font-semibold text-amber-600 dark:text-amber-500">{stats.room_reservations.pending} reservations</span>
            </div>
          </div>
        </div>

      </div>

      {/* Quick Navigation and Controls */}
      <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-850 p-6 rounded-2xl shadow-sm space-y-4">
        <h3 className="text-lg font-bold text-gray-800 dark:text-slate-100">Administrative Quick Commands</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <button 
            onClick={() => window.location.href = '/admin/users'}
            className="flex items-center justify-center space-x-2 px-5 py-3 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white rounded-xl transition-all font-semibold text-sm shadow-xs shadow-blue-500/25"
          >
            <span>👥</span>
            <span>Manage User Directory</span>
          </button>
          <button 
            onClick={() => window.location.href = '/admin/justifications'}
            className="flex items-center justify-center space-x-2 px-5 py-3 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white rounded-xl transition-all font-semibold text-sm shadow-xs shadow-emerald-500/25"
          >
            <span>📝</span>
            <span>Review Justifications</span>
          </button>
          <button 
            onClick={() => window.location.href = '/admin/requests'}
            className="flex items-center justify-center space-x-2 px-5 py-3 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white rounded-xl transition-all font-semibold text-sm shadow-xs shadow-indigo-500/25"
          >
            <span>📋</span>
            <span>Process Document Requests</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
