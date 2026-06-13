/**
 * DeleteModal.jsx — Animated confirmation dialog for task deletion
 */
import { useEffect, useRef } from 'react';

export default function DeleteModal({ task, onConfirm, onCancel, isDeleting }) {
  const cancelRef = useRef(null);

  // Focus trap: focus Cancel button on open
  useEffect(() => {
    cancelRef.current?.focus();
  }, []);

  // Close on Escape key
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') onCancel();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onCancel]);

  if (!task) return null;

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      {/* Dialog */}
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-modal-in">
        {/* Red header strip */}
        <div className="h-1.5 w-full bg-gradient-to-r from-red-500 to-rose-500" />

        <div className="p-6 sm:p-7">
          {/* Icon */}
          <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mb-5">
            <svg className="w-7 h-7 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </div>

          {/* Text */}
          <h2 className="text-[18px] font-extrabold text-gray-900 mb-2">Delete Task?</h2>
          <p className="text-[13.5px] text-gray-500 leading-relaxed mb-1">
            You are about to permanently delete:
          </p>
          <p className="text-[14px] font-bold text-gray-800 bg-gray-50 border border-gray-100 rounded-xl px-4 py-2.5 mb-5 line-clamp-2">
            "{task.title}"
          </p>
          <p className="text-[12.5px] text-red-500 font-semibold mb-6 flex items-center gap-1.5">
            <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            This action cannot be undone.
          </p>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              id="delete-modal-cancel"
              ref={cancelRef}
              onClick={onCancel}
              disabled={isDeleting}
              className="flex-1 px-4 py-3 border border-gray-200 text-gray-700 font-bold text-[14px] rounded-xl cursor-pointer hover:bg-gray-50 hover:border-gray-300 transition-all duration-150 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              id="delete-modal-confirm"
              onClick={() => onConfirm(task.id)}
              disabled={isDeleting}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-red-500 to-rose-600 text-white font-bold text-[14px] rounded-xl cursor-pointer shadow-md hover:from-red-400 hover:to-rose-500 hover:shadow-red-400/30 active:scale-[0.98] transition-all duration-150 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isDeleting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Deleting…
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Yes, Delete
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
