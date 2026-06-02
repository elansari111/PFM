import { useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import interactionPlugin from '@fullcalendar/interaction';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';

const AdminScheduleCalendar = () => {
  const [view, setView] = useState('timeGridWeek');
  const [showModal, setShowModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [formData, setFormData] = useState({
    module_id: '',
    classroom_id: '',
    day_of_week: 'monday',
    start_time: '',
    end_time: '',
    type: 'lecture',
  });
  const [errors, setErrors] = useState({});
  const [conflicts, setConflicts] = useState([]);

  const queryClient = useQueryClient();

  const { data: schedules, isLoading } = useQuery({
    queryKey: ['admin-schedules'],
    queryFn: () => api.get('/admin/schedules').then(res => res.data.schedules.data),
    refetchInterval: 30000, // Refresh every 30 seconds for real-time updates
  });

  const { data: calendarEvents } = useQuery({
    queryKey: ['admin-calendar-events'],
    queryFn: async () => {
      const start = new Date();
      const end = new Date();
      end.setDate(end.getDate() + 30);
      return api.get('/admin/schedules/calendar-events', {
        params: { start: start.toISOString(), end: end.toISOString() }
      }).then(res => res.data);
    },
    refetchInterval: 30000,
  });

  const { data: modules } = useQuery({
    queryKey: ['modules'],
    queryFn: () => api.get('/admin/modules').then(res => res.data.modules.data),
  });

  const { data: classrooms } = useQuery({
    queryKey: ['classrooms'],
    queryFn: () => api.get('/admin/classrooms').then(res => res.data.classrooms.data),
  });

  const createMutation = useMutation({
    mutationFn: (data) => api.post('/admin/schedules', data).then(res => res.data),
    onSuccess: () => {
      setFormData({ module_id: '', classroom_id: '', day_of_week: 'monday', start_time: '', end_time: '', type: 'lecture' });
      setErrors({});
      setConflicts([]);
      setShowModal(false);
      queryClient.invalidateQueries(['admin-schedules']);
      queryClient.invalidateQueries(['admin-calendar-events']);
    },
    onError: (error) => {
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else if (error.response?.data?.conflicts) {
        setConflicts(error.response.data.conflicts);
      } else {
        setErrors({ general: error.response?.data?.message || 'Creation failed' });
      }
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/admin/schedules/${id}`).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-schedules']);
      queryClient.invalidateQueries(['admin-calendar-events']);
    },
  });

  const events = calendarEvents || schedules?.map(schedule => {
    const dayMap = { 'monday': 1, 'tuesday': 2, 'wednesday': 3, 'thursday': 4, 'friday': 5, 'saturday': 6, 'sunday': 7 };
    const dayNum = dayMap[schedule.day_of_week] || 1;
    return {
      id: schedule.id,
      title: `${schedule.module.name} (${schedule.module.group?.name || 'No Group'})`,
      start: getNextOccurrence(dayNum, schedule.start_time),
      end: getNextOccurrence(dayNum, schedule.end_time),
      backgroundColor: getModuleColor(schedule.module.name),
      borderColor: getModuleColor(schedule.module.name),
      extendedProps: {
        classroom: schedule.classroom.name,
        teacher: schedule.module.teacher?.user?.name || 'Unassigned',
        group: schedule.module.group?.name || 'No Group',
        type: schedule.type,
        module: schedule.module.name,
        scheduleId: schedule.id,
      },
    };
  }) || [];

  function getNextOccurrence(dayOfWeek, time) {
    const now = new Date();
    const targetDay = dayOfWeek;
    const currentDay = now.getDay() === 0 ? 7 : now.getDay();
    
    const [hours, minutes] = time.split(':');
    
    let date = new Date();
    date.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    
    const daysUntilTarget = (targetDay - currentDay + 7) % 7;
    
    if (daysUntilTarget === 0 && date < now) {
      date.setDate(date.getDate() + 7);
    } else {
      date.setDate(date.getDate() + daysUntilTarget);
    }
    
    return date.toISOString();
  }

  function getModuleColor(moduleName) {
    const colors = [
      '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
      '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6366f1'
    ];
    let hash = 0;
    for (let i = 0; i < moduleName.length; i++) {
      hash = moduleName.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  }

  const handleDateSelect = (info) => {
    const date = new Date(info.start);
    const dayNum = date.getDay() === 0 ? 7 : date.getDay();
    const dayMap = { 1: 'monday', 2: 'tuesday', 3: 'wednesday', 4: 'thursday', 5: 'friday', 6: 'saturday', 7: 'sunday' };
    const dayOfWeek = dayMap[dayNum] || 'monday';
    
    setFormData({
      ...formData,
      day_of_week: dayOfWeek,
      start_time: info.startStr.split('T')[1]?.substring(0, 5) || '08:00',
      end_time: info.endStr.split('T')[1]?.substring(0, 5) || '10:00',
    });
    setShowModal(true);
  };

  const handleEventClick = (info) => {
    setSelectedEvent(info.event);
    alert(`
      ${info.event.extendedProps.module}
      Teacher: ${info.event.extendedProps.teacher}
      Group: ${info.event.extendedProps.group}
      Classroom: ${info.event.extendedProps.classroom}
      Type: ${info.event.extendedProps.type}
      
      Click OK to delete this schedule.
    `);
    if (confirm('Are you sure you want to delete this schedule?')) {
      deleteMutation.mutate(info.event.extendedProps.scheduleId);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrors({});
    setConflicts([]);
    createMutation.mutate(formData);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const dayNames = ['', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Schedule Management</h2>
        <div className="flex space-x-2">
          <button
            onClick={() => setView('timeGridWeek')}
            className={`px-4 py-2 rounded-md ${view === 'timeGridWeek' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            Week
          </button>
          <button
            onClick={() => setView('timeGridDay')}
            className={`px-4 py-2 rounded-md ${view === 'timeGridDay' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            Day
          </button>
          <button
            onClick={() => setView('listWeek')}
            className={`px-4 py-2 rounded-md ${view === 'listWeek' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            List
          </button>
        </div>
      </div>

      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
        initialView={view}
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek',
        }}
        events={events}
        selectable
        select={handleDateSelect}
        eventClick={handleEventClick}
        height="auto"
        slotMinTime="08:00:00"
        slotMaxTime="20:00:00"
        allDaySlot={false}
        slotDuration="00:30:00"
        eventTimeFormat={{
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        }}
        eventDidMount={(info) => {
          const props = info.event.extendedProps;
          info.el.title = `${props.module}\nTeacher: ${props.teacher}\nGroup: ${props.group}\nClassroom: ${props.classroom}\nType: ${props.type}`;
        }}
        responsive
        windowResize
      />

      {/* Create Schedule Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Create Schedule</h3>
            
            {errors.general && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                {errors.general}
              </div>
            )}

            {conflicts.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded mb-4">
                <p className="font-semibold mb-2">Conflicts detected:</p>
                <ul className="list-disc list-inside">
                  {conflicts.map((conflict, index) => (
                    <li key={index}>{conflict.message}</li>
                  ))}
                </ul>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Module *</label>
                <select
                  value={formData.module_id}
                  onChange={(e) => setFormData({ ...formData, module_id: e.target.value })}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                  required
                >
                  <option value="">Select a module...</option>
                  {modules?.map((module) => (
                    <option key={module.id} value={module.id}>
                      {module.name} - {module.group?.name || 'No Group'}
                    </option>
                  ))}
                </select>
                {errors.module_id && <p className="mt-1 text-sm text-red-600">{errors.module_id}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Classroom *</label>
                <select
                  value={formData.classroom_id}
                  onChange={(e) => setFormData({ ...formData, classroom_id: e.target.value })}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                  required
                >
                  <option value="">Select a classroom...</option>
                  {classrooms?.map((classroom) => (
                    <option key={classroom.id} value={classroom.id}>{classroom.name}</option>
                  ))}
                </select>
                {errors.classroom_id && <p className="mt-1 text-sm text-red-600">{errors.classroom_id}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Day *</label>
                <select
                  value={formData.day_of_week}
                  onChange={(e) => setFormData({ ...formData, day_of_week: e.target.value })}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                  required
                >
                  <option value="monday">Monday</option>
                  <option value="tuesday">Tuesday</option>
                  <option value="wednesday">Wednesday</option>
                  <option value="thursday">Thursday</option>
                  <option value="friday">Friday</option>
                  <option value="saturday">Saturday</option>
                </select>
                {errors.day_of_week && <p className="mt-1 text-sm text-red-600">{errors.day_of_week}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Type *</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                  required
                >
                  <option value="lecture">Lecture</option>
                  <option value="lab">Lab</option>
                  <option value="exam">Exam</option>
                  <option value="tutorial">Tutorial</option>
                </select>
                {errors.type && <p className="mt-1 text-sm text-red-600">{errors.type}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Start Time *</label>
                  <input
                    type="time"
                    value={formData.start_time}
                    onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                    required
                  />
                  {errors.start_time && <p className="mt-1 text-sm text-red-600">{errors.start_time}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">End Time *</label>
                  <input
                    type="time"
                    value={formData.end_time}
                    onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                    required
                  />
                  {errors.end_time && <p className="mt-1 text-sm text-red-600">{errors.end_time}</p>}
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setErrors({});
                    setConflicts([]);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {createMutation.isPending ? 'Creating...' : 'Create Schedule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminScheduleCalendar;
