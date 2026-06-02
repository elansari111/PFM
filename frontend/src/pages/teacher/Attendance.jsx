import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';

const Attendance = () => {
  const [selectedModule, setSelectedModule] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [bulkMode, setBulkMode] = useState(false);
  const [formData, setFormData] = useState({
    student_id: '',
    module_id: '',
    schedule_id: '',
    date: selectedDate,
    status: 'present',
    notes: '',
  });
  const [bulkAttendance, setBulkAttendance] = useState({});
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);

  const queryClient = useQueryClient();

  const { data: modules } = useQuery({
    queryKey: ['teacher-modules'],
    queryFn: () => api.get('/teacher/modules').then(res => res.data.modules.data),
  });

  const { data: students, isLoading: studentsLoading } = useQuery({
    queryKey: ['module-students', selectedModule],
    queryFn: () => api.get(`/teacher/modules/${selectedModule}/students`).then(res => res.data.students.data),
    enabled: !!selectedModule,
  });

  const { data: attendanceRecords } = useQuery({
    queryKey: ['attendance', selectedModule, selectedDate],
    queryFn: () => api.get(`/teacher/attendance?module_id=${selectedModule}&date=${selectedDate}`).then(res => res.data.absences.data),
    enabled: !!selectedModule && !!selectedDate,
  });

  const mutation = useMutation({
    mutationFn: (data) => api.post('/teacher/attendance', data).then(res => res.data),
    onSuccess: () => {
      setSuccess(true);
      setFormData({ student_id: '', module_id: '', schedule_id: '', date: selectedDate, status: 'present', notes: '' });
      queryClient.invalidateQueries(['attendance', selectedModule, selectedDate]);
      setTimeout(() => setSuccess(false), 3000);
    },
    onError: (error) => {
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else {
        setErrors({ general: error.response?.data?.message || 'Submission failed' });
      }
    },
  });

  const bulkMutation = useMutation({
    mutationFn: (data) => api.post('/teacher/attendance/bulk', data).then(res => res.data),
    onSuccess: () => {
      setSuccess(true);
      setBulkAttendance({});
      queryClient.invalidateQueries(['attendance', selectedModule, selectedDate]);
      setTimeout(() => setSuccess(false), 3000);
    },
    onError: (error) => {
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else {
        setErrors({ general: error.response?.data?.message || 'Submission failed' });
      }
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrors({});
    mutation.mutate(formData);
  };

  const handleBulkSubmit = (e) => {
    e.preventDefault();
    setErrors({});
    
    const attendances = students?.map(student => ({
      student_id: student.id,
      status: bulkAttendance[student.id] || 'present',
      notes: '',
    })) || [];

    bulkMutation.mutate({
      module_id: selectedModule,
      date: selectedDate,
      attendances,
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'present': return 'bg-green-100 text-green-800';
      case 'absent': return 'bg-red-100 text-red-800';
      case 'late': return 'bg-yellow-100 text-yellow-800';
      case 'excused': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Select Class</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Module</label>
            <select
              value={selectedModule || ''}
              onChange={(e) => setSelectedModule(e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
            >
              <option value="">Select a module...</option>
              {modules?.map((module) => (
                <option key={module.id} value={module.id}>
                  {module.name} - {module.group.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
            />
          </div>
        </div>
      </div>

      {selectedModule && (
        <>
          {/* Mode Toggle */}
          <div className="flex justify-end">
            <button
              onClick={() => setBulkMode(!bulkMode)}
              className={`px-4 py-2 rounded-md ${bulkMode ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
            >
              {bulkMode ? 'Single Mode' : 'Bulk Mode'}
            </button>
          </div>

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
              Attendance recorded successfully!
            </div>
          )}

          {errors.general && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {errors.general}
            </div>
          )}

          {!bulkMode ? (
            /* Single Attendance Form */
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Record Attendance</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Student</label>
                  <select
                    value={formData.student_id}
                    onChange={(e) => setFormData({ ...formData, student_id: e.target.value, module_id: selectedModule, date: selectedDate })}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                    required
                  >
                    <option value="">Select a student...</option>
                    {students?.map((student) => (
                      <option key={student.id} value={student.id}>
                        {student.user.name}
                      </option>
                    ))}
                  </select>
                  {errors.student_id && <p className="mt-1 text-sm text-red-600">{errors.student_id}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                    required
                  >
                    <option value="present">Present</option>
                    <option value="absent">Absent</option>
                    <option value="late">Late</option>
                    <option value="excused">Excused</option>
                  </select>
                  {errors.status && <p className="mt-1 text-sm text-red-600">{errors.status}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                    rows={2}
                  />
                  {errors.notes && <p className="mt-1 text-sm text-red-600">{errors.notes}</p>}
                </div>

                <button
                  type="submit"
                  disabled={mutation.isPending}
                  className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {mutation.isPending ? 'Recording...' : 'Record Attendance'}
                </button>
              </form>
            </div>
          ) : (
            /* Bulk Attendance Form */
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Bulk Attendance</h2>
              <form onSubmit={handleBulkSubmit} className="space-y-4">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Student
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {students?.map((student) => (
                        <tr key={student.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{student.user.name}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <select
                              value={bulkAttendance[student.id] || 'present'}
                              onChange={(e) => setBulkAttendance({ ...bulkAttendance, [student.id]: e.target.value })}
                              className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2 text-sm"
                            >
                              <option value="present">Present</option>
                              <option value="absent">Absent</option>
                              <option value="late">Late</option>
                              <option value="excused">Excused</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <button
                  type="submit"
                  disabled={bulkMutation.isPending}
                  className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {bulkMutation.isPending ? 'Recording...' : 'Record All Attendance'}
                </button>
              </form>
            </div>
          )}

          {/* Attendance Records */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800">Attendance Records</h2>
            </div>

            {studentsLoading ? (
              <div className="p-6 text-center text-gray-500">Loading...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Student
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Notes
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {attendanceRecords?.map((record) => (
                      <tr key={record.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{record.student.user.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(record.status)}`}>
                            {record.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {record.notes || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Attendance;
