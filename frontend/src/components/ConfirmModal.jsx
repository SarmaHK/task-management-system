import React from 'react';

export default function ConfirmModal({ isOpen, title, message, onConfirm, onCancel, confirmText = "Confirm", cancelText = "Cancel", isDestructive = false }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 transition-all duration-300">
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-6 flex flex-col gap-5 animate-fadeUp">
        <div className="flex justify-between items-center pb-3 border-b border-gray-100">
          <h3 className="text-[18px] font-bold text-indigo-950">{title || 'Confirm Action'}</h3>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-600 transition-colors">✕</button>
        </div>

        <div>
          <p className="text-[14px] text-gray-600 leading-relaxed">
            {message}
          </p>
        </div>

        <div className="flex justify-end gap-3 pt-3 border-t border-gray-50">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-[13px] font-bold text-gray-500 hover:bg-gray-100 rounded-xl transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 text-[13px] font-bold text-white rounded-xl shadow-sm hover:shadow-md transition-all ${
              isDestructive 
                ? 'bg-red-500 hover:bg-red-600' 
                : 'bg-[#118B95] hover:bg-indigo-800'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
