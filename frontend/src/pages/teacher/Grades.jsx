import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';

const Grades = () => {
  const [selectedModule, setSelectedModule] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [formData, setFormData] = useState({
    student_id: '',
    module_id: '',
    grade_type: 'cc1',
    score: '',
    date: '',
  });
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

  const mutation = useMutation({
    mutationFn: (data) => api.post('/teacher/grades', data).then(res => res.data),
    onSuccess: () => {
      setSuccess(true);
      setFormData({ student_id: '', module_id: '', grade_type: 'cc1', score: '', date: '' });
      queryClient.invalidateQueries(['module-students', selectedModule]);
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

  const getGradeTypeLabel = (type) => {
    switch (type) {
      case 'cc1': return 'CC1';
      case 'cc2': return 'CC2';
      case 'exam': return 'Exam';
      case 'final': return 'Final (Auto-calculated)';
      default: return type;
    }
  };

  const calculateFinalGrade = (student) => {
    const cc1 = student.grades?.find(g => g.grade_type === 'cc1')?.score || 0;
    const cc2 = student.grades?.find(g => g.grade_type === 'cc2')?.score || 0;
    const exam = student.grades?.find(g => g.grade_type === 'exam')?.score || 0;
    const final = ((cc1 + cc2) / 2) * 0.4 + (exam * 0.6);
    return final.toFixed(2);
  };

  return (
    <div className="space-y-6">
      {/* Module Selection */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Select Module</h2>
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

      {selectedModule && (
        <>
          {/* Grade Entry Form */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Enter Grade</h2>
            
            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4">
                Grade submitted successfully!
              </div>
            )}

            {errors.general && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                {errors.general}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Student</label>
                <select
                  value={formData.student_id}
                  onChange={(e) => setFormData({ ...formData, student_id: e.target.value, module_id: selectedModule })}
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Grade Type</label>
                <select
                  value={formData.grade_type}
                  onChange={(e) => setFormData({ ...formData, grade_type: e.target.value })}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                  required
                >
                  <option value="cc1">CC1</option>
                  <option value="cc2">CC2</option>
                  <option value="exam">Exam</option>
                </select>
                {errors.grade_type && <p className="mt-1 text-sm text-red-600">{errors.grade_type}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Score (0-20)</label>
                <input
                  type="number"
                  min="0"
                  max="20"
                  step="0.5"
                  value={formData.score}
                  onChange={(e) => setFormData({ ...formData, score: e.target.value })}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                  required
                />
                {errors.score && <p className="mt-1 text-sm text-red-600">{errors.score}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                />
                {errors.date && <p className="mt-1 text-sm text-red-600">{errors.date}</p>}
              </div>

              <button
                type="submit"
                disabled={mutation.isPending}
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {mutation.isPending ? 'Submitting...' : 'Submit Grade'}
              </button>
            </form>
          </div>

          {/* Students Grades Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800">Student Grades</h2>
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
                        CC1
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        CC2
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Exam
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Final
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {students?.map((student) => (
                      <tr key={student.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{student.user.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {student.grades?.find(g => g.grade_type === 'cc1')?.score || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {student.grades?.find(g => g.grade_type === 'cc2')?.score || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {student.grades?.find(g => g.grade_type === 'exam')?.score || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-semibold text-blue-600">
                            {calculateFinalGrade(student)}/20
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Grade Calculation Formula */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">Grade Calculation Formula</h3>
            <p className="text-blue-800 font-mono">
              Final Grade = ((CC1 + CC2) / 2) × 0.4 + Exam × 0.6
            </p>
            <p className="text-sm text-blue-700 mt-2">
              Final grades are automatically calculated when CC1, CC2, and Exam grades are entered.
            </p>
          </div>
        </>
      )}
    </div>
  );
};

export default Grades;
