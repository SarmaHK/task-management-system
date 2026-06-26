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
import projectService from '../services/projectService';

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
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentView, setCurrentView] = useState('month');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tasksRes, projectsRes] = await Promise.all([
          taskService.getAllTasks(),
          projectService.getAllProjects()
        ]);

        let combinedEvents = [];

        if (tasksRes.success) {
          const taskEvents = tasksRes.data
            .filter(task => task.dueDate)
            .map(task => {
              const date = new Date(task.dueDate);
              return {
                id: `task-${task.id}`,
                title: task.title,
                start: date,
                end: date,
                allDay: true,
                type: 'task',
                resource: task,
              };
            });
          combinedEvents = [...combinedEvents, ...taskEvents];
        }

        if (projectsRes.success) {
          const projectEvents = projectsRes.data
            .filter(proj => proj.endDate)
            .map(proj => {
              const date = new Date(proj.endDate);
              return {
                id: `proj-${proj.id}`,
                title: `🎯 Deadline: ${proj.name}`,
                start: date,
                end: date,
                allDay: true,
                type: 'project',
                resource: proj,
              };
            });
          combinedEvents = [...combinedEvents, ...projectEvents];
        }

        setEvents(combinedEvents);
      } catch (error) {
        console.error('Error fetching calendar data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    import('../services/socket').then(({ getSocket }) => {
      const socket = getSocket();
      if (socket) {
        const handleTaskUpdated = (updatedTask) => {
          setEvents((prev) => {
            const others = prev.filter((e) => e.id !== `task-${updatedTask.id}`);
            if (updatedTask.dueDate) {
              return [
                ...others,
                {
                  id: `task-${updatedTask.id}`,
                  title: updatedTask.title,
                  start: new Date(updatedTask.dueDate),
                  end: new Date(updatedTask.dueDate),
                  allDay: true,
                  type: 'task',
                  resource: updatedTask,
                },
              ];
            }
            return others;
          });
        };

        const handleTaskCreated = (newTask) => {
          if (newTask.dueDate) {
            setEvents((prev) => [
              ...prev,
              {
                id: `task-${newTask.id}`,
                title: newTask.title,
                start: new Date(newTask.dueDate),
                end: new Date(newTask.dueDate),
                allDay: true,
                type: 'task',
                resource: newTask,
              },
            ]);
          }
        };

        const handleTaskDeleted = ({ taskId }) => {
          setEvents((prev) => prev.filter((e) => e.id !== `task-${taskId}`));
        };

        socket.on('taskUpdated', handleTaskUpdated);
        socket.on('taskCreated', handleTaskCreated);
        socket.on('taskDeleted', handleTaskDeleted);

        return () => {
          socket.off('taskUpdated', handleTaskUpdated);
          socket.off('taskCreated', handleTaskCreated);
          socket.off('taskDeleted', handleTaskDeleted);
        };
      }
    });
  }, []);

  const handleSelectEvent = (event) => {
    if (event.type === 'project') {
      navigate(`/projects/${event.resource.id}`);
    } else {
      navigate(`/tasks/${event.resource.id}`);
    }
  };

  const CustomEvent = ({ event }) => {
    if (event.type === 'project') {
      return (
        <div className="flex items-center gap-1.5 px-1 w-full h-full text-xs font-bold rounded overflow-hidden">
          <div className="w-1.5 h-1.5 rounded-full bg-white shrink-0"></div>
          <span className="truncate">{event.title}</span>
        </div>
      );
    }

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

  const eventPropGetter = (event) => {
    if (event.type === 'project') {
      return {
        style: {
          backgroundColor: '#e11d48', // rose-600
          borderColor: '#be123c',     // rose-700
          color: 'white',
        }
      };
    }
    return {
      style: {
        backgroundColor: '#4f46e5', // indigo-600
        borderColor: '#4338ca',     // indigo-700
        color: 'white',
      }
    };
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
              date={currentDate}
              onNavigate={(newDate) => setCurrentDate(newDate)}
              view={currentView}
              onView={(newView) => setCurrentView(newView)}
              onSelectEvent={handleSelectEvent}
              eventPropGetter={eventPropGetter}
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
