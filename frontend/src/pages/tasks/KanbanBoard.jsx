import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import taskService from '../../services/taskService';
import projectService from '../../services/projectService';

const COLUMNS = [
  { 
    id: 'TODO', 
    title: 'To Do', 
    icon: '⏳',
    bgClass: 'bg-white/40 border-white/60', 
    headerClass: 'from-slate-500 to-slate-600 shadow-slate-200',
    dotColor: 'bg-slate-400' 
  },
  { 
    id: 'IN_PROGRESS', 
    title: 'In Progress', 
    icon: '🔄',
    bgClass: 'bg-indigo-50/40 border-indigo-100/50', 
    headerClass: 'from-indigo-500 to-purple-600 shadow-indigo-200',
    dotColor: 'bg-indigo-500' 
  },
  { 
    id: 'COMPLETED', 
    title: 'Completed', 
    icon: '✅',
    bgClass: 'bg-emerald-50/40 border-emerald-100/50', 
    headerClass: 'from-emerald-400 to-teal-500 shadow-emerald-200',
    dotColor: 'bg-emerald-500' 
  }
];

export default function KanbanBoard() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [selectedSource, setSelectedSource] = useState('my-tasks');
  const [isLoading, setIsLoading] = useState(true);
  const [draggedTaskId, setDraggedTaskId] = useState(null);
  const [dragOverColumn, setDragOverColumn] = useState(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await projectService.getAllProjects();
        setProjects(response?.data || response || []);
      } catch (err) {
        console.error('Failed to load projects list:', err);
      }
    };
    fetchProjects();
  }, []);

  const fetchTasks = async () => {
    setIsLoading(true);
    try {
      if (selectedSource === 'my-tasks') {
        const res = await taskService.getAllTasks();
        setTasks(res?.data || res || []);
      } else if (selectedSource.startsWith('project-')) {
        const projectId = parseInt(selectedSource.split('-')[1]);
        const res = await projectService.getProjectTasks(projectId);
        setTasks(res?.data || res || []);
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

  const handleDragStart = (e, taskId) => {
    setDraggedTaskId(taskId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', String(taskId));
    
    // Slight delay to allow drag ghost to generate before changing opacity
    setTimeout(() => {
      e.target.classList.add('opacity-50');
    }, 0);
  };

  const handleDragEnd = (e) => {
    e.target.classList.remove('opacity-50');
    setDraggedTaskId(null);
    setDragOverColumn(null);
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

    // Optimistic UI update
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: targetStatus } : t));

    try {
      await taskService.updateTaskStatus(taskId, targetStatus);
    } catch (err) {
      console.error('Failed to update status on server:', err);
      // Revert if error
      fetchTasks();
    }
  };

  const getPriorityStyles = (priority) => {
    switch (priority) {
      case 'HIGH':
        return {
          badge: 'bg-rose-100 text-rose-700 border-rose-200',
          border: 'border-l-rose-500'
        };
      case 'MEDIUM':
        return {
          badge: 'bg-amber-100 text-amber-700 border-amber-200',
          border: 'border-l-amber-500'
        };
      case 'LOW':
      default:
        return {
          badge: 'bg-slate-100 text-slate-600 border-slate-200',
          border: 'border-l-slate-400'
        };
    }
  };

  return (
    <DashboardLayout>
      <div className="relative min-h-[calc(100vh-64px)] bg-gradient-to-br from-slate-50 via-indigo-50/40 to-purple-50/30 overflow-hidden flex flex-col">
        
        {/* Decorative background blobs */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-300/20 blur-[100px] pointer-events-none mix-blend-multiply" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[30%] h-[40%] rounded-full bg-purple-300/20 blur-[100px] pointer-events-none mix-blend-multiply" />

        <div className="relative flex flex-col gap-8 max-w-[1400px] w-full mx-auto px-4 sm:px-8 py-8 h-[calc(100vh-64px)] md:h-screen">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-5 flex-shrink-0 animate-fadeUp">
            <div>
              <h1 className="text-[32px] font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-950 to-purple-800 tracking-tight mb-1">
                Kanban Board
              </h1>
              <p className="text-[14.5px] text-slate-500 font-medium">Drag and drop tasks to update their progress in real-time.</p>
            </div>

            <div className="flex items-center gap-3 bg-white/60 backdrop-blur-md p-2 rounded-2xl border border-white shadow-sm">
              <span className="text-[13px] font-extrabold text-indigo-900 uppercase tracking-wide pl-2">Filter:</span>
              <div className="relative">
                <select
                  value={selectedSource}
                  onChange={(e) => setSelectedSource(e.target.value)}
                  className="appearance-none pl-4 pr-10 py-2 text-[14px] font-bold border-none rounded-xl bg-indigo-50/80 text-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer transition-colors hover:bg-indigo-100"
                >
                  <option value="my-tasks">🙋 My Assigned Tasks</option>
                  {projects.map(p => (
                    <option key={p.id} value={`project-${p.id}`}>📁 {p.name}</option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-indigo-600">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                </div>
              </div>
            </div>
          </div>

          {/* Board Columns Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1 min-h-0 overflow-y-auto md:overflow-y-hidden pb-8 animate-fadeUp" style={{ animationDelay: '0.1s' }}>
            {COLUMNS.map((column) => {
              const columnTasks = tasks.filter(t => t.status === column.id);
              const isHovered = dragOverColumn === column.id;

              return (
                <div
                  key={column.id}
                  onDragOver={(e) => handleDragOver(e, column.id)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, column.id)}
                  className={`flex flex-col rounded-[32px] border backdrop-blur-xl transition-all duration-300 h-full overflow-hidden ${column.bgClass} ${
                    isHovered ? 'ring-4 ring-indigo-500/20 shadow-2xl scale-[1.01]' : 'shadow-[0_8px_30px_rgb(0,0,0,0.04)]'
                  }`}
                >
                  {/* Column Header */}
                  <div className="p-5 pb-4 flex items-center justify-between flex-shrink-0 relative z-10">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-[18px] bg-gradient-to-br shadow-md ${column.headerClass} text-white`}>
                        {column.icon}
                      </div>
                      <h3 className="text-[17px] font-black text-slate-800 tracking-tight">{column.title}</h3>
                    </div>
                    <div className="bg-white/80 backdrop-blur text-slate-700 text-[13px] font-black px-3 py-1 rounded-full shadow-sm border border-white">
                      {columnTasks.length}
                    </div>
                  </div>

                  <div className="px-5 pb-3 border-b border-white/50" />

                  {/* Cards List container */}
                  <div className="flex-1 overflow-y-auto flex flex-col gap-4 p-5 pr-3 relative z-10">
                    {isLoading ? (
                      <div className="flex flex-col items-center justify-center h-full gap-3 opacity-50">
                        <div className="w-8 h-8 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin" />
                        <span className="text-[13px] font-bold text-slate-500">Loading tasks...</span>
                      </div>
                    ) : columnTasks.length === 0 ? (
                      <div className="h-32 rounded-2xl border-2 border-dashed border-slate-300/50 flex items-center justify-center text-slate-400 text-[13.5px] font-bold">
                        Drop tasks here
                      </div>
                    ) : (
                      columnTasks.map((task) => {
                        const styles = getPriorityStyles(task.priority);
                        const isOverdue = new Date(task.dueDate) < new Date() && task.status !== 'COMPLETED';

                        return (
                          <div
                            key={task.id}
                            draggable
                            onDragStart={(e) => handleDragStart(e, task.id)}
                            onDragEnd={handleDragEnd}
                            onClick={() => navigate(`/tasks/${task.id}`)}
                            className={`bg-white/90 backdrop-blur-sm border-l-4 border-y border-r border-white/80 p-5 rounded-2xl shadow-sm hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 cursor-grab active:cursor-grabbing flex flex-col gap-3 group relative overflow-hidden ${styles.border}`}
                          >
                            {/* Inner subtle gradient on hover */}
                            <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/0 to-indigo-50/0 group-hover:to-indigo-50/50 transition-all duration-500 pointer-events-none" />
                            
                            <div className="relative z-10">
                              <h4 className="text-[15px] font-extrabold text-slate-800 group-hover:text-indigo-600 transition-colors leading-snug line-clamp-2 mb-1.5">
                                {task.title}
                              </h4>
                              {task.description && (
                                <p className="text-[13px] text-slate-500 leading-relaxed line-clamp-2">
                                  {task.description}
                                </p>
                              )}
                            </div>

                            {/* Badges footer */}
                            <div className="flex flex-wrap items-center gap-2 pt-2 mt-auto relative z-10">
                              <span className={`text-[10.5px] font-black px-2 py-1 rounded-lg border uppercase tracking-wider ${styles.badge}`}>
                                {task.priority}
                              </span>
                              
                              {task.project?.name && (
                                <span className="text-[11px] bg-slate-50 text-slate-600 px-2.5 py-1 rounded-lg border border-slate-200 font-bold max-w-[140px] truncate shadow-sm">
                                  {task.project.name}
                                </span>
                              )}

                              {task.dueDate && (
                                <span className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border shadow-sm ml-auto flex items-center gap-1.5 ${
                                  isOverdue
                                    ? 'bg-rose-50 text-rose-600 border-rose-200 animate-pulse'
                                    : 'bg-white text-slate-500 border-slate-200'
                                }`}>
                                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                                  {new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
}
