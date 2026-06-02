import { useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import interactionPlugin from '@fullcalendar/interaction';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';

const TeacherScheduleCalendar = () => {
  const [view, setView] = useState('timeGridWeek');

  const { data: schedules, isLoading } = useQuery({
    queryKey: ['teacher-schedule'],
    queryFn: () => api.get('/teacher/schedule').then(res => res.data.schedule),
    refetchInterval: 30000, // Refresh every 30 seconds for real-time updates
  });

  const events = schedules?.map(schedule => ({
    id: schedule.id,
    title: `${schedule.module.name} - ${schedule.module.group.name}`,
    start: getNextOccurrence(schedule.day_of_week, schedule.start_time),
    end: getNextOccurrence(schedule.day_of_week, schedule.end_time),
    backgroundColor: getModuleColor(schedule.module.name),
    borderColor: getModuleColor(schedule.module.name),
    extendedProps: {
      classroom: schedule.classroom.name,
      group: schedule.module.group.name,
      type: schedule.type,
      module: schedule.module.name,
    },
  })) || [];

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

  const handleEventClick = (info) => {
    const props = info.event.extendedProps;
    alert(`
      ${props.module}
      Group: ${props.group}
      Classroom: ${props.classroom}
      Type: ${props.type}
    `);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">My Schedule</h2>
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
          info.el.title = `${props.module}\nGroup: ${props.group}\nClassroom: ${props.classroom}\nType: ${props.type}`;
        }}
        responsive
        windowResize
      />
    </div>
  );
};

export default TeacherScheduleCalendar;
