import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';

const LessonLogs = () => {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingLog, setEditingLog] = useState(null);
  const [formData, setFormData] = useState({
    module_id: '',
    date: new Date().toISOString().split('T')[0],
    start_time: '',
    end_time: '',
    objective: '',
    nature: 'Cours',
    notes: ''
  });

  const { data: lessonLogs, isLoading } = useQuery({
    queryKey: ['lesson-logs'],
    queryFn: async () => {
      const response = await api.get('/teacher/lesson-logs');
      return response.data.lesson_logs;
    }
  });

  const { data: modules } = useQuery({
    queryKey: ['teacher-modules'],
    queryFn: async () => {
      const response = await api.get('/teacher/modules');
      return response.data.modules;
    }
  });

  const createMutation = useMutation({
    mutationFn: async (data) => {
      const response = await api.post('/teacher/lesson-logs', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['lesson-logs']);
      setShowForm(false);
      resetForm();
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      const response = await api.put(`/teacher/lesson-logs/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['lesson-logs']);
      setEditingLog(null);
      resetForm();
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      await api.delete(`/teacher/lesson-logs/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['lesson-logs']);
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingLog) {
      updateMutation.mutate({ id: editingLog.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (log) => {
    setEditingLog(log);
    setFormData({
      module_id: log.module_id,
      date: log.date,
      start_time: log.start_time,
      end_time: log.end_time,
      objective: log.objective,
      nature: log.nature,
      notes: log.notes || ''
    });
    setShowForm(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce cahier de textes ?')) {
      deleteMutation.mutate(id);
    }
  };

  const resetForm = () => {
    setFormData({
      module_id: '',
      date: new Date().toISOString().split('T')[0],
      start_time: '',
      end_time: '',
      objective: '',
      nature: 'Cours',
      notes: ''
    });
  };

  if (isLoading) return <div>Chargement...</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Cahier de Textes</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          {showForm ? 'Annuler' : '+ Nouveau Cahier'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">
            {editingLog ? 'Modifier le Cahier' : 'Nouveau Cahier de Textes'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Module</label>
              <select
                value={formData.module_id}
                onChange={(e) => setFormData({...formData, module_id: e.target.value})}
                className="w-full border rounded p-2"
                required
              >
                <option value="">Sélectionner un module</option>
                {modules?.data?.map((module) => (
                  <option key={module.id} value={module.id}>{module.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Date</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
                className="w-full border rounded p-2"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Heure Début</label>
                <input
                  type="time"
                  value={formData.start_time}
                  onChange={(e) => setFormData({...formData, start_time: e.target.value})}
                  className="w-full border rounded p-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Heure Fin</label>
                <input
                  type="time"
                  value={formData.end_time}
                  onChange={(e) => setFormData({...formData, end_time: e.target.value})}
                  className="w-full border rounded p-2"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Nature</label>
              <select
                value={formData.nature}
                onChange={(e) => setFormData({...formData, nature: e.target.value})}
                className="w-full border rounded p-2"
                required
              >
                <option value="Cours">Cours</option>
                <option value="TD">TD</option>
                <option value="TP">TP</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Objectif de la Séance</label>
              <textarea
                value={formData.objective}
                onChange={(e) => setFormData({...formData, objective: e.target.value})}
                className="w-full border rounded p-2"
                rows="3"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Notes (optionnel)</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                className="w-full border rounded p-2"
                rows="2"
              />
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {createMutation.isPending || updateMutation.isPending ? 'Enregistrement...' : 'Enregistrer'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingLog(null);
                  resetForm();
                }}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
              >
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left">Date</th>
              <th className="px-4 py-3 text-left">Module</th>
              <th className="px-4 py-3 text-left">Horaires</th>
              <th className="px-4 py-3 text-left">Nature</th>
              <th className="px-4 py-3 text-left">Objectif</th>
              <th className="px-4 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {lessonLogs?.data?.map((log) => (
              <tr key={log.id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-3">{new Date(log.date).toLocaleDateString('fr-FR')}</td>
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
                <td className="px-4 py-3">
                  <button
                    onClick={() => handleEdit(log)}
                    className="text-blue-600 hover:text-blue-800 mr-2"
                  >
                    Modifier
                  </button>
                  <button
                    onClick={() => handleDelete(log.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Supprimer
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {lessonLogs?.data?.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            Aucun cahier de textes enregistré
          </div>
        )}
      </div>
    </div>
  );
};

export default LessonLogs;
