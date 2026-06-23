/**
 * EditTask.jsx — Page for editing an existing task
 */
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import taskService from '../../services/taskService';
import TaskForm from '../../components/tasks/TaskForm';
import DeleteModal from '../../components/tasks/DeleteModal';
import DashboardLayout from '../../components/DashboardLayout';
import { useToast } from '../../utils/ToastContext';
import { STATUS_CONFIG, PRIORITY_CONFIG, formatDate } from '../../utils/helpers';

export default function EditTask() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [task, setTask] = useState(null);
  const [loadingTask, setLoadingTask] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // ── Fetch task on mount ──────────────────────────────────────────────────
  useEffect(() => {
    const loadTask = async () => {
      setLoadingTask(true);
      setFetchError(null);
      try {
        const data = await taskService.getTaskById(id);
        setTask(data.data);
      } catch (err) {
        const msg = err.response?.status === 404
          ? 'Task not found.'
          : err.response?.data?.message || 'Failed to load task.';
        setFetchError(msg);
      } finally {
        setLoadingTask(false);
      }
    };
    loadTask();
  }, [id]);

  // ── Update handler ───────────────────────────────────────────────────────
  const handleSubmit = async (payload) => {
    setIsSubmitting(true);
    try {
      await taskService.updateTask(id, payload);
      toast.success('Task updated successfully! ✨');
      setTimeout(() => navigate('/tasks'), 600);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update task.';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Delete handler ───────────────────────────────────────────────────────
  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await taskService.deleteTask(id);
      toast.success('Task deleted.');
      navigate('/tasks');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete task.');
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  // ── Build initial form values from task ──────────────────────────────────
  const initialValues = task
    ? {
        title: task.title || '',
        description: task.description || '',
        priority: task.priority || 'MEDIUM',
        status: task.status || 'TODO',
        dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
        projectId: task.projectId || '',
        assignees: task.assignees || [],
      }
    : {};

  // ── Loading skeleton ─────────────────────────────────────────────────────
  if (loadingTask) {
    return (
      <DashboardLayout>
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 animate-pulse">
          <div className="h-4 bg-gray-100 rounded w-1/3 mb-6" />
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="h-24 bg-gradient-to-r from-gray-100 to-gray-150" />
            <div className="p-7 flex flex-col gap-5">
              <div className="h-4 bg-gray-100 rounded w-1/4" />
              <div className="h-11 bg-gray-50 rounded-xl" />
              <div className="h-4 bg-gray-100 rounded w-1/4" />
              <div className="h-28 bg-gray-50 rounded-xl" />
              <div className="grid grid-cols-3 gap-4">
                {[...Array(3)].map((_, i) => <div key={i} className="h-11 bg-gray-50 rounded-xl" />)}
              </div>
              <div className="h-12 bg-gray-100 rounded-xl" />
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // ── Error state ──────────────────────────────────────────────────────────
  if (fetchError) {
    return (
      <DashboardLayout>
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-[18px] font-bold text-gray-800 mb-2">{fetchError}</h2>
            <button
              onClick={() => navigate('/tasks')}
              className="px-5 py-2.5 bg-indigo-600 text-white font-bold text-[13.5px] rounded-xl hover:bg-indigo-500 transition-colors cursor-pointer"
            >
              ← Back to Tasks
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const statusCfg = STATUS_CONFIG[task?.status] || STATUS_CONFIG.PENDING;
  const priorityCfg = PRIORITY_CONFIG[task?.priority] || PRIORITY_CONFIG.MEDIUM;

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-[13px] text-gray-400 font-medium mb-6">
          <button
            onClick={() => navigate('/tasks')}
            className="hover:text-indigo-600 transition-colors cursor-pointer"
          >
            Tasks
          </button>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span className="text-gray-700 font-semibold truncate max-w-[200px]">Edit Task</span>
        </nav>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {/* Gradient header */}
          <div className="bg-gradient-to-r from-violet-600 to-indigo-600 px-6 sm:px-8 py-6 text-white">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-[20px] font-extrabold tracking-tight">Edit Task</h1>
                  <p className="text-violet-200 text-[13px] font-medium mt-0.5">
                    Update the details below and save your changes.
                  </p>
                </div>
              </div>

              {/* Current status + priority badges */}
              <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${statusCfg.badge}`}>
                  {statusCfg.icon} {statusCfg.label}
                </span>
                <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${priorityCfg.badge}`}>
                  {priorityCfg.icon} {priorityCfg.label}
                </span>
              </div>
            </div>

            {/* Meta row */}
            <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-white/20 text-[12px] text-violet-200 font-medium">
              <span>ID: #{task?.id}</span>
              {task?.createdAt && <span>Created: {formatDate(task.createdAt)}</span>}
              {task?.updatedAt && <span>Updated: {formatDate(task.updatedAt)}</span>}
            </div>
          </div>

          {/* Form body */}
          <div className="px-6 sm:px-8 py-7">
            <TaskForm
              initialValues={initialValues}
              onSubmit={handleSubmit}
              isSubmitting={isSubmitting}
              submitLabel="Save Changes"
              showStatus={true}
            />
          </div>
        </div>

        {/* Danger zone */}
        <div className="mt-5 bg-red-50 border border-red-100 rounded-2xl px-5 py-4 flex items-center justify-between gap-4">
          <div>
            <p className="text-[13px] font-bold text-red-700">Danger Zone</p>
            <p className="text-[12px] text-red-500 mt-0.5">Permanently remove this task and all its data.</p>
          </div>
          <button
            id="delete-task-btn"
            onClick={() => setShowDeleteModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-red-200 text-red-600 font-bold text-[13px] rounded-xl hover:bg-red-600 hover:text-white hover:border-red-600 transition-all duration-150 cursor-pointer flex-shrink-0"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Delete Task
          </button>
        </div>
      </div>

      {/* Delete confirmation modal */}
      {showDeleteModal && (
        <DeleteModal
          task={task}
          onConfirm={handleDelete}
          onCancel={() => setShowDeleteModal(false)}
          isDeleting={isDeleting}
        />
      )}
    </DashboardLayout>
  );
}
