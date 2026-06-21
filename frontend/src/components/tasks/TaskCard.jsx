/**
 * TaskCard.jsx — Individual task card for the task list grid
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { STATUS_CONFIG, PRIORITY_CONFIG, formatDate, truncate, relativeTime } from '../../utils/helpers';
import { useAuth } from '../../context/AuthContext';

export default function TaskCard({ task, onDelete, onStatusChange }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [statusChanging, setStatusChanging] = useState(false);

  const status = STATUS_CONFIG[task.status] || STATUS_CONFIG.TODO;
  const priority = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.MEDIUM;

  const handleStatusCycle = async (e) => {
    e.stopPropagation();
    const cycle = { TODO: 'IN_PROGRESS', IN_PROGRESS: 'COMPLETED', COMPLETED: 'TODO' };
    const next = cycle[task.status];
    setStatusChanging(true);
    try {
      await onStatusChange(task.id, next);
    } finally {
      setStatusChanging(false);
    }
  };

  return (
    <article
      // 1. CONDITIONAL NAVIGATION: Only navigate to edit if NOT a Collaborator
      onClick={() => user?.role !== 'Collaborator' ? navigate(`/tasks/edit/${task.id}`) : null}
      
      // 2. CONDITIONAL STYLING: Remove the pointer cursor and hover effects for Collaborators so they know it isn't clickable
      className={`group bg-white rounded-2xl border border-gray-100 shadow-sm transition-all duration-200 overflow-hidden flex flex-col ${
        user?.role !== 'Collaborator' ? 'hover:shadow-xl hover:-translate-y-1 cursor-pointer' : 'cursor-default'
      }`}
    >
      {/* Top accent bar based on priority */}
      <div
        className={`h-1 w-full ${
          task.priority === 'HIGH'
            ? 'bg-gradient-to-r from-red-400 to-rose-500'
            : task.priority === 'MEDIUM'
            ? 'bg-gradient-to-r from-orange-300 to-amber-400'
            : 'bg-gradient-to-r from-slate-200 to-slate-300'
        }`}
      />

      <div className="p-5 flex flex-col flex-1 gap-3">
        {/* Header row */}
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-[15px] font-bold text-gray-900 leading-snug group-hover:text-indigo-700 transition-colors line-clamp-2 flex-1">
            {task.title}
          </h3>
          {/* Priority badge */}
          <span
            className={`flex-shrink-0 text-[10.5px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${priority.badge}`}
          >
            {priority.icon} {priority.label}
          </span>
        </div>

        {/* Description */}
        {task.description && (
          <p className="text-[13px] text-gray-500 leading-relaxed flex-1">
            {truncate(task.description, 100)}
          </p>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Footer */}
        <div className="pt-3 border-t border-gray-50 flex items-center justify-between gap-2 flex-wrap">
          
          {/* Status badge — Collaborators ARE allowed to click this based on your team's rules, so we leave it alone! */}
          <button
            onClick={handleStatusCycle}
            disabled={statusChanging}
            title="Click to change status"
            className={`flex items-center gap-1.5 text-[11.5px] font-semibold px-2.5 py-1 rounded-full border transition-all cursor-pointer hover:opacity-80 ${status.badge}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${status.dot} ${statusChanging ? 'animate-pulse' : ''}`} />
            {status.label}
          </button>

          <div className="flex items-center gap-3 ml-auto">
            {/* Due date */}
            {task.dueDate && (
              <span className="text-[11px] text-gray-400 font-medium flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {formatDate(task.dueDate)}
              </span>
            )}

            {/* Created time */}
            <span className="text-[11px] text-gray-300 font-medium">
              {relativeTime(task.createdAt)}
            </span>

            {/* 3. CONDITIONAL RENDERING: Hide the Delete button completely from Collaborators */}
            {user?.role !== 'Collaborator' && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(task);
                }}
                className="opacity-0 group-hover:opacity-100 transition-all duration-150 text-gray-300 hover:text-red-500 cursor-pointer p-1 rounded-lg hover:bg-red-50"
                title="Delete task"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
