import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar as BigCalendar, dateFnsLocalizer } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import enUS from 'date-fns/locale/en-US';
import 'react-big-calendar/lib/css/react-big-calendar.css';

import DashboardLayout from '../components/DashboardLayout';
import taskService from '../services/taskService';

const locales = {
  'en-US': enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

export default function Calendar() {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await taskService.getTasks();
        if (res.success) {
          const formattedEvents = res.data
            .filter(task => task.dueDate) // Only show tasks with due dates
            .map(task => {
              const date = new Date(task.dueDate);
              return {
                id: task.id,
                title: task.title,
                start: date, // Single day event
                end: date,
                allDay: true,
                resource: task,
              };
            });
          setEvents(formattedEvents);
        }
      } catch (error) {
        console.error('Error fetching tasks for calendar:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  const handleSelectEvent = (event) => {
    navigate(`/tasks/${event.id}`);
  };

  const CustomEvent = ({ event }) => {
    const task = event.resource;
    let badgeColor = 'bg-blue-500';
    if (task.status === 'COMPLETED') badgeColor = 'bg-green-500';
    if (task.status === 'BLOCKED') badgeColor = 'bg-red-500';
    if (task.status === 'REVIEW') badgeColor = 'bg-purple-500';
    if (task.status === 'IN_PROGRESS') badgeColor = 'bg-indigo-500';

    return (
      <div className="flex items-center gap-1.5 px-1 w-full h-full text-xs font-semibold rounded overflow-hidden">
        <div className={`w-1.5 h-1.5 rounded-full ${badgeColor} shrink-0`}></div>
        <span className="truncate">{event.title}</span>
      </div>
    );
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col h-[calc(100vh-8rem)] bg-white rounded-2xl border border-gray-200 shadow-sm p-6 animate-fadeUp">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Calendar</h1>
            <p className="text-sm text-gray-500 mt-1">View your assigned tasks by due date.</p>
          </div>
          <button
            onClick={() => navigate('/tasks/create')}
            className="px-4 py-2 bg-[#2563EB] text-white font-semibold text-sm rounded-lg shadow-sm hover:bg-blue-700 transition-colors"
          >
            Add Task
          </button>
        </div>

        <div className="flex-1 bg-white">
          {loading ? (
            <div className="h-full flex items-center justify-center text-gray-400">Loading calendar...</div>
          ) : (
            <BigCalendar
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              style={{ height: '100%' }}
              onSelectEvent={handleSelectEvent}
              components={{
                event: CustomEvent
              }}
              popup
              views={['month', 'week', 'day']}
            />
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
