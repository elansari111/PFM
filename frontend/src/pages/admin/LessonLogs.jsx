import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';

const LessonLogs = () => {
  const [filterTeacher, setFilterTeacher] = useState('');
  const [filterModule, setFilterModule] = useState('');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');

  const { data: lessonLogs, isLoading } = useQuery({
    queryKey: ['admin-lesson-logs', filterTeacher, filterModule, filterDateFrom, filterDateTo],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filterTeacher) params.append('teacher_id', filterTeacher);
      if (filterModule) params.append('module_id', filterModule);
      if (filterDateFrom) params.append('date_from', filterDateFrom);
      if (filterDateTo) params.append('date_to', filterDateTo);
      
      const response = await api.get(`/admin/lesson-logs?${params.toString()}`);
      return response.data.lesson_logs;
    }
  });

  const { data: teachers } = useQuery({
    queryKey: ['teachers'],
    queryFn: async () => {
      const response = await api.get('/admin/users?role=teacher');
      return response.data.users;
    }
  });

  const { data: modules } = useQuery({
    queryKey: ['modules'],
    queryFn: async () => {
      const response = await api.get('/admin/modules');
      return response.data.modules;
    }
  });

  if (isLoading) return <div>Chargement...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Cahiers de Textes - Administration</h1>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Filtres</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Professeur</label>
            <select
              value={filterTeacher}
              onChange={(e) => setFilterTeacher(e.target.value)}
              className="w-full border rounded p-2"
            >
              <option value="">Tous</option>
              {teachers?.data?.map((teacher) => (
                <option key={teacher.id} value={teacher.id}>{teacher.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Module</label>
            <select
              value={filterModule}
              onChange={(e) => setFilterModule(e.target.value)}
              className="w-full border rounded p-2"
            >
              <option value="">Tous</option>
              {modules?.data?.map((module) => (
                <option key={module.id} value={module.id}>{module.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Date Début</label>
            <input
              type="date"
              value={filterDateFrom}
              onChange={(e) => setFilterDateFrom(e.target.value)}
              className="w-full border rounded p-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Date Fin</label>
            <input
              type="date"
              value={filterDateTo}
              onChange={(e) => setFilterDateTo(e.target.value)}
              className="w-full border rounded p-2"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left">Date</th>
              <th className="px-4 py-3 text-left">Professeur</th>
              <th className="px-4 py-3 text-left">Module</th>
              <th className="px-4 py-3 text-left">Horaires</th>
              <th className="px-4 py-3 text-left">Nature</th>
              <th className="px-4 py-3 text-left">Objectif</th>
            </tr>
          </thead>
          <tbody>
            {lessonLogs?.data?.map((log) => (
              <tr key={log.id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-3">{new Date(log.date).toLocaleDateString('fr-FR')}</td>
                <td className="px-4 py-3">{log.teacher?.user?.name}</td>
                <td className="px-4 py-3">{log.module?.name}</td>
                <td className="px-4 py-3">{log.start_time} - {log.end_time}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded text-xs ${
                    log.nature === 'Cours' ? 'bg-blue-100 text-blue-800' :
                    log.nature === 'TD' ? 'bg-green-100 text-green-800' :
                    'bg-purple-100 text-purple-800'
                  }`}>
                    {log.nature}
                  </span>
                </td>
                <td className="px-4 py-3 truncate max-w-xs">{log.objective}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {lessonLogs?.data?.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            Aucun cahier de textes trouvé
          </div>
        )}
      </div>
    </div>
  );
};

export default LessonLogs;
