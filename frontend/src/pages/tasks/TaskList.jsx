import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTasks } from '../../hooks/useTasks';
import DeleteModal from '../../components/tasks/DeleteModal';
import DashboardLayout from '../../components/DashboardLayout';
import { format } from 'date-fns';

const getStatusBadge = (status, dueDate) => {
  const isOverdue = dueDate && new Date(dueDate) < new Date() && status !== 'COMPLETED';
  
  if (isOverdue) return { label: 'Overdue', bg: 'bg-[#F59E0B]/10', text: 'text-[#F59E0B]', dot: 'bg-[#F59E0B]' };
  
  switch(status) {
    case 'TODO': return { label: 'To Do', bg: 'bg-[#94A3B8]/10', text: 'text-[#64748B]', dot: 'bg-[#94A3B8]' };
    case 'IN_PROGRESS': return { label: 'In Progress', bg: 'bg-[#3B82F6]/10', text: 'text-[#3B82F6]', dot: 'bg-[#3B82F6]' };
    case 'REVIEW': return { label: 'In Review', bg: 'bg-[#8B5CF6]/10', text: 'text-[#8B5CF6]', dot: 'bg-[#8B5CF6]' };
    case 'COMPLETED': return { label: 'Completed', bg: 'bg-[#22C55E]/10', text: 'text-[#22C55E]', dot: 'bg-[#22C55E]' };
    case 'BLOCKED': return { label: 'Blocked', bg: 'bg-[#EF4444]/10', text: 'text-[#EF4444]', dot: 'bg-[#EF4444]' };
    default: return { label: status, bg: 'bg-gray-100', text: 'text-gray-600', dot: 'bg-gray-400' };
  }
};

const getPriorityIcon = (priority) => {
  switch(priority) {
    case 'HIGH': return <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>;
    case 'MEDIUM': return <svg className="w-4 h-4 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>;
    case 'LOW': return <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>;
    default: return null;
  }
};

export default function TaskList() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const {
    paginatedTasks, loading, error,
    searchQuery, setSearchQuery,
    statusFilter, setStatusFilter,
    priorityFilter, setPriorityFilter,
    currentPage, setCurrentPage, totalPages,
    fetchTasks, updateTaskStatus, deleteTask,
  } = useTasks();

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteConfirm = async (id) => {
    setIsDeleting(true);
    try {
      await deleteTask(id);
      setDeleteTarget(null);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6 max-w-[1400px] mx-auto animate-fadeUp">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Tasks</h1>
            <p className="text-sm text-gray-500 mt-1">Manage and track your team's ongoing work.</p>
          </div>
          {(user?.role !== 'COLLABORATOR' && user?.role !== 'ADMIN') && (
            <button
              onClick={() => navigate('/tasks/create')}
              className="flex items-center gap-2 px-4 py-2 bg-[#2563EB] text-white font-semibold text-sm rounded-lg shadow-sm hover:bg-blue-700 transition-colors cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
              New Task
            </button>
          )}
        </div>

        {/* Filters Toolbar */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-sm">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Filter tasks..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all shadow-sm"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
              className="px-3 py-2 text-sm font-medium border border-gray-200 rounded-lg bg-white text-gray-700 focus:outline-none focus:border-blue-500 shadow-sm cursor-pointer"
            >
              <option value="ALL">Status</option>
              <option value="TODO">To Do</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="REVIEW">Review</option>
              <option value="COMPLETED">Completed</option>
              <option value="BLOCKED">Blocked</option>
            </select>
            <select
              value={priorityFilter}
              onChange={(e) => { setPriorityFilter(e.target.value); setCurrentPage(1); }}
              className="px-3 py-2 text-sm font-medium border border-gray-200 rounded-lg bg-white text-gray-700 focus:outline-none focus:border-blue-500 shadow-sm cursor-pointer"
            >
              <option value="ALL">Priority</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-200">
                  <th className="px-6 py-3.5 text-xs font-semibold text-gray-500 tracking-wider uppercase w-[50%]">Task Name</th>
                  <th className="px-6 py-3.5 text-xs font-semibold text-gray-500 tracking-wider uppercase">Project</th>
                  <th className="px-6 py-3.5 text-xs font-semibold text-gray-500 tracking-wider uppercase">Assignee</th>
                  <th className="px-6 py-3.5 text-xs font-semibold text-gray-500 tracking-wider uppercase">Priority</th>
                  <th className="px-6 py-3.5 text-xs font-semibold text-gray-500 tracking-wider uppercase">Status</th>
                  <th className="px-6 py-3.5 text-xs font-semibold text-gray-500 tracking-wider uppercase text-right">Due Date</th>
                  <th className="px-6 py-3.5 w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr><td colSpan="7" className="px-6 py-8 text-center text-sm text-gray-400">Loading tasks...</td></tr>
                ) : error ? (
                  <tr><td colSpan="7" className="px-6 py-8 text-center text-sm text-red-500">{error}</td></tr>
                ) : paginatedTasks.length === 0 ? (
                  <tr><td colSpan="7" className="px-6 py-12 text-center text-sm text-gray-500">No tasks found matching your criteria.</td></tr>
                ) : (
                  paginatedTasks.map((task) => {
                    const badge = getStatusBadge(task.status, task.dueDate);
                    const formattedDate = task.dueDate ? format(new Date(task.dueDate), 'MMM d, yyyy') : '--';
                    
                    return (
                      <tr key={task.id} className="hover:bg-gray-50/50 transition-colors group cursor-pointer" onClick={() => navigate(`/tasks/${task.id}`)}>
                        <td className="px-6 py-4">
                          <p className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">{task.title}</p>
                          {task.description && (
                            <p className="text-xs text-gray-500 mt-1 truncate max-w-md">{task.description}</p>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-md">
                            {task.project?.name || 'No Project'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex -space-x-2">
                            {task.assignees?.length > 0 ? (
                              task.assignees.slice(0,3).map((a) => (
                                <div key={a.id} className="w-7 h-7 rounded-full bg-blue-100 border-2 border-white flex items-center justify-center text-[10px] font-bold text-blue-700" title={a.user?.name}>
                                  {(a.user?.name || 'U').charAt(0)}
                                </div>
                              ))
                            ) : (
                              <span className="text-xs text-gray-400">Unassigned</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1.5 text-sm font-medium text-gray-700 capitalize">
                            {getPriorityIcon(task.priority)}
                            <span className="text-xs">{task.priority?.toLowerCase()}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${badge.bg} ${badge.text}`}>
                            <div className={`w-1.5 h-1.5 rounded-full ${badge.dot}`}></div>
                            {badge.label}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right text-sm text-gray-500 font-medium">
                          {formattedDate}
                        </td>
                        <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                            {(user?.role !== 'COLLABORATOR' && user?.role !== 'ADMIN') && (
                              <button 
                                className="text-gray-400 hover:text-red-500 p-1 cursor-pointer"
                                onClick={(e) => { e.stopPropagation(); setDeleteTarget(task); }}
                              >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50/50">
              <span className="text-xs text-gray-500 font-medium">Page {currentPage} of {totalPages}</span>
              <div className="flex gap-1">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 border border-gray-300 rounded-md bg-white text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 border border-gray-300 rounded-md bg-white text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>

      </div>

      {deleteTarget && (
        <DeleteModal
          task={deleteTarget}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteTarget(null)}
          isDeleting={isDeleting}
        />
      )}
    </DashboardLayout>
  );
}
