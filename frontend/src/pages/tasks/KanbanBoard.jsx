import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import taskService from '../../services/taskService';
import projectService from '../../services/projectService';

const COLUMNS = [
  { id: 'TODO', title: '⏳ To Do', bgClass: 'bg-slate-50/50 border-slate-100', dotColor: 'bg-slate-400' },
  { id: 'IN_PROGRESS', title: '🔄 In Progress', bgClass: 'bg-indigo-50/20 border-indigo-100', dotColor: 'bg-indigo-500' },
  { id: 'COMPLETED', title: '✅ Completed', bgClass: 'bg-emerald-50/20 border-emerald-100', dotColor: 'bg-emerald-500' }
];

export default function KanbanBoard() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [selectedSource, setSelectedSource] = useState('my-tasks'); // 'my-tasks' or 'project-{id}'
  const [isLoading, setIsLoading] = useState(true);
  const [draggedTaskId, setDraggedTaskId] = useState(null);
  const [dragOverColumn, setDragOverColumn] = useState(null); // columnId currently hovered

  // Fetch projects list for the filter
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await projectService.getAllProjects();
        setProjects(response || []);
      } catch (err) {
        console.error('Failed to load projects list:', err);
      }
    };
    fetchProjects();
  }, []);

  // Fetch tasks based on selected filter
  const fetchTasks = async () => {
    setIsLoading(true);
    try {
      if (selectedSource === 'my-tasks') {
        const res = await taskService.getAllTasks();
        setTasks(res.data || res || []);
      } else if (selectedSource.startsWith('project-')) {
        const projectId = parseInt(selectedSource.split('-')[1]);
        const res = await projectService.getProjectTasks(projectId);
        setTasks(res || []);
      }
    } catch (err) {
      console.error('Error fetching tasks for Kanban:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [selectedSource]);

  // Drag and Drop handlers
  const handleDragStart = (e, taskId) => {
    setDraggedTaskId(taskId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', String(taskId));
  };

  const handleDragOver = (e, columnId) => {
    e.preventDefault();
    if (dragOverColumn !== columnId) {
      setDragOverColumn(columnId);
    }
  };

  const handleDragLeave = () => {
    setDragOverColumn(null);
  };

  const handleDrop = async (e, targetStatus) => {
    e.preventDefault();
    setDragOverColumn(null);

    const taskIdStr = e.dataTransfer.getData('text/plain') || draggedTaskId;
    if (!taskIdStr) return;

    const taskId = parseInt(taskIdStr);
    const taskToUpdate = tasks.find(t => t.id === taskId);
    if (!taskToUpdate || taskToUpdate.status === targetStatus) return;

    // Optimistically update the UI
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: targetStatus } : t));

    try {
      await taskService.updateTaskStatus(taskId, targetStatus);
    } catch (err) {
      console.error('Failed to update status on server:', err);
      // Revert state on error
      fetchTasks();
    } finally {
      setDraggedTaskId(null);
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'HIGH':
        return 'bg-rose-50 text-rose-700 border-rose-100';
      case 'MEDIUM':
        return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'LOW':
      default:
        return 'bg-slate-50 text-slate-600 border-slate-100';
    }
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6 max-w-7xl mx-auto px-4 sm:px-6 py-8 h-[calc(100vh-64px)] md:h-screen">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 flex-shrink-0">
          <div>
            <h1 className="text-[25px] font-extrabold text-indigo-950 tracking-tight">Kanban Board</h1>
            <p className="text-[13.5px] text-gray-500 font-medium">Drag and drop tasks to update progress status in real-time.</p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[13px] font-bold text-indigo-900 whitespace-nowrap">View Scope:</span>
            <select
              value={selectedSource}
              onChange={(e) => setSelectedSource(e.target.value)}
              className="px-3.5 py-2 text-[13.5px] font-semibold border border-gray-200 rounded-xl bg-white text-indigo-950 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer shadow-sm"
            >
              <option value="my-tasks">🙋 My Assigned Tasks</option>
              {projects.map(p => (
                <option key={p.id} value={`project-${p.id}`}>📁 Project: {p.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Board Columns Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 flex-1 min-h-0 overflow-y-auto md:overflow-y-hidden pb-4">
          {COLUMNS.map((column) => {
            const columnTasks = tasks.filter(t => t.status === column.id);
            const isHovered = dragOverColumn === column.id;

            return (
              <div
                key={column.id}
                onDragOver={(e) => handleDragOver(e, column.id)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, column.id)}
                className={`flex flex-col rounded-2xl border p-4 transition-all duration-200 h-full ${column.bgClass} ${
                  isHovered ? 'ring-2 ring-indigo-500/30 border-indigo-400 bg-indigo-50/10' : ''
                }`}
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-3 border-b border-gray-100/60 mb-4 flex-shrink-0">
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${column.dotColor}`} />
                    <h3 className="text-[14.5px] font-extrabold text-indigo-950">{column.title}</h3>
                  </div>
                  <span className="bg-white/80 border border-gray-150 text-indigo-900 text-[11px] font-extrabold px-2 py-0.5 rounded-full shadow-sm">
                    {columnTasks.length}
                  </span>
                </div>

                {/* Cards List container */}
                <div className="flex-1 overflow-y-auto flex flex-col gap-3 pr-1 pb-10">
                  {isLoading ? (
                    <div className="text-center py-10 text-gray-400 text-[13px] font-medium">Loading tasks...</div>
                  ) : columnTasks.length === 0 ? (
                    <div className="border border-dashed border-gray-200 rounded-xl p-8 text-center text-gray-400 text-[12.5px] font-medium">
                      No tasks in this stage
                    </div>
                  ) : (
                    columnTasks.map((task) => (
                      <div
                        key={task.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, task.id)}
                        onClick={() => navigate(`/tasks/${task.id}`)}
                        className="bg-white border border-gray-150/70 p-4 rounded-xl shadow-sm hover:shadow-md hover:border-gray-300 active:scale-[0.98] transition-all cursor-grab flex flex-col gap-3 group"
                      >
                        <div>
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <h4 className="text-[13.5px] font-bold text-indigo-950 group-hover:text-indigo-600 transition-colors leading-snug truncate">
                              {task.title}
                            </h4>
                          </div>
                          {task.description && (
                            <p className="text-[12px] text-gray-400 leading-relaxed line-clamp-2">
                              {task.description}
                            </p>
                          )}
                        </div>

                        {/* Badges footer */}
                        <div className="flex flex-wrap items-center gap-1.5 pt-1 mt-auto">
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${getPriorityBadge(task.priority)}`}>
                            {task.priority}
                          </span>
                          
                          {task.project?.name && (
                            <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded border border-slate-200 font-medium max-w-[120px] truncate">
                              📁 {task.project.name}
                            </span>
                          )}

                          {task.dueDate && (
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ml-auto ${
                              new Date(task.dueDate) < new Date() && task.status !== 'COMPLETED'
                                ? 'bg-rose-50 text-rose-600 border-rose-100 animate-pulse'
                                : 'bg-slate-50 text-gray-500 border-slate-100'
                            }`}>
                              📅 {new Date(task.dueDate).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>

              </div>
            );
          })}
        </div>

      </div>
    </DashboardLayout>
  );
}
