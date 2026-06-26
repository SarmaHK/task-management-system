import { useEffect } from 'react';

const getTitleForType = (type, message = '') => {
  const msg = message.toLowerCase();
  
  if (type === 'ADMIN_UPDATE' || !type) {
    if (msg.includes('project') && (msg.includes('created') || msg.includes('added') || msg.includes('success'))) {
      return 'Project Notification';
    }
    if (msg.includes('task') && (msg.includes('created') || msg.includes('success'))) {
      return 'Task Notification';
    }
  }

  switch (type) {
    case 'TASK_ASSIGNED':
      return 'Task Assigned';
    case 'STATUS_CHANGED':
      return 'Status Update';
    case 'DEADLINE_ALERT':
      return 'Deadline Approaching';
    case 'COMMENT_ADDED':
      return 'Comment Added';
    case 'ADMIN_UPDATE':
    default:
      return 'Notification';
  }
};

const formatTime = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
};

export default function NotificationPanel({ 
  isOpen, 
  onClose, 
  notifications = [], 
  unreadCount = 0, 
  onMarkAsRead, 
  onMarkAllAsRead 
}) {
  
  // Prevent scrolling on the main page when the panel is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  return (
    <>
      {/* Dark Overlay background */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-all duration-300 animate-fade-in"
          onClick={onClose}
        />
      )}

      {/* Slide-in Panel */}
      <div 
        className={`fixed top-0 right-0 h-full w-full sm:w-[400px] bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-white">
          <div className="flex items-center gap-3">
            <h2 className="text-[18px] font-bold text-indigo-950">Notifications</h2>
            {unreadCount > 0 && (
              <span className="bg-rose-100 text-rose-700 text-[11px] font-bold px-2 py-0.5 rounded-full animate-pulse">
                {unreadCount} new
              </span>
            )}
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 hover:bg-gray-50 p-2 rounded-full transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Action Bar */}
        {unreadCount > 0 && (
          <div className="px-6 py-3 bg-gray-50/50 border-b border-gray-100 flex justify-end">
            <button 
              onClick={onMarkAllAsRead}
              className="text-[12px] font-semibold text-[#118B95] hover:text-indigo-800 transition-colors cursor-pointer"
            >
              Mark all as read
            </button>
          </div>
        )}

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
          {notifications.map((notif) => (
            <div 
              key={notif.id} 
              className={`p-4 rounded-xl border transition-all ${
                notif.isRead 
                  ? 'bg-white border-gray-100 opacity-75' 
                  : 'bg-[#E6F5F6]/40 border-indigo-100 shadow-sm'
              }`}
            >
              <div className="flex justify-between items-start gap-2 mb-1">
                <h4 className={`text-[13px] font-extrabold tracking-tight ${notif.isRead ? 'text-gray-600' : 'text-indigo-950'}`}>
                  {getTitleForType(notif.type, notif.message)}
                </h4>
                <span className="text-[10px] font-semibold text-gray-400 whitespace-nowrap">
                  {formatTime(notif.createdAt)}
                </span>
              </div>
              <p className="text-[12.5px] text-gray-500 leading-relaxed mb-3">
                {notif.message}
              </p>
              
              {!notif.isRead && (
                <button 
                  onClick={() => onMarkAsRead(notif.id)}
                  className="text-[11.5px] font-extrabold text-[#118B95] hover:text-indigo-800 transition-colors cursor-pointer"
                >
                  Mark as read ✓
                </button>
              )}
            </div>
          ))}

          {notifications.length === 0 && (
            <div className="text-center py-10 text-gray-400 text-[13px] font-medium">
              No notifications yet!
            </div>
          )}
        </div>
      </div>
    </>
  );
}