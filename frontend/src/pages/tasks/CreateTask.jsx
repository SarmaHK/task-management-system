/**
 * CreateTask.jsx — Page for creating a new task
 */
import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import taskService from '../../services/taskService';
import TaskForm from '../../components/tasks/TaskForm';
import DashboardLayout from '../../components/DashboardLayout';
import { useToast } from '../../utils/ToastContext';

export default function CreateTask() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const toast = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const queryProjectId = searchParams.get('projectId') || '';

  const handleSubmit = async (payload) => {
    setIsSubmitting(true);
    try {
      await taskService.createTask(payload);
      toast.success('Task created successfully! 🎉');
      // Brief delay so user sees the toast before redirect
      setTimeout(() => navigate('/tasks'), 600);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to create task. Please try again.';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

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
          <span className="text-gray-700 font-semibold">Create New Task</span>
        </nav>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {/* Gradient header */}
          <div className="bg-gradient-to-r from-indigo-600 to-violet-600 px-6 sm:px-8 py-6 text-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <div>
                <h1 className="text-[20px] font-extrabold tracking-tight">Create New Task</h1>
                <p className="text-indigo-200 text-[13px] font-medium mt-0.5">
                  Fill in the details below to add a task to your board.
                </p>
              </div>
            </div>
          </div>

          {/* Form body */}
          <div className="px-6 sm:px-8 py-7">
            <TaskForm
              initialValues={{ projectId: queryProjectId }}
              onSubmit={handleSubmit}
              isSubmitting={isSubmitting}
              submitLabel="Create Task"
              showStatus={false}
              showProjectId={true}
            />
          </div>
        </div>

        {/* Tips card */}
        <div className="mt-5 bg-indigo-50 border border-indigo-100 rounded-2xl px-5 py-4 flex gap-3">
          <div className="text-indigo-400 mt-0.5 flex-shrink-0">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="text-[12.5px] font-bold text-indigo-700 mb-0.5">Pro Tip</p>
            <p className="text-[12px] text-indigo-600/80 leading-relaxed">
              Set a specific due date and priority to keep your work organized. You can always update the status later from the task list.
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
