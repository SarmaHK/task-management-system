import { useState, useEffect } from 'react';

export default function NotificationPanel({ isOpen, onClose }) {
  // Mock data for notifications
  const [notifications, setNotifications] = useState([
    { id: 1, title: 'New Task Assigned', message: 'You have been assigned to "Update Database Schema"', time: '5m ago', isRead: false },
    { id: 2, title: 'Project Update', message: 'Phase 1 deliverables have been approved.', time: '2h ago', isRead: false },
    { id: 3, title: 'System Alert', message: 'Scheduled maintenance this Sunday at 2 AM.', time: '1d ago', isRead: true }
  ]);

  // Prevent scrolling on the main page when the panel is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  const handleMarkAsRead = (id) => {
    setNotifications(notifications.map(notif => 
      notif.id === id ? { ...notif, isRead: true } : notif
    ));
  };

  const handleMarkAllAsRead = () => {
    setNotifications(notifications.map(notif => ({ ...notif, isRead: true })));
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <>
      {/* Dark Overlay background */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-opacity"
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
              <span className="bg-rose-100 text-rose-700 text-[11px] font-bold px-2 py-0.5 rounded-full">
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
              onClick={handleMarkAllAsRead}
              className="text-[12px] font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
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
                  ? 'bg-white border-gray-100 opacity-70' 
                  : 'bg-indigo-50/50 border-indigo-100 shadow-sm'
              }`}
            >
              <div className="flex justify-between items-start gap-2 mb-1">
                <h4 className={`text-[14px] font-bold ${notif.isRead ? 'text-gray-700' : 'text-indigo-950'}`}>
                  {notif.title}
                </h4>
                <span className="text-[11px] font-medium text-gray-400 whitespace-nowrap">
                  {notif.time}
                </span>
              </div>
              <p className="text-[13px] text-gray-500 leading-relaxed mb-3">
                {notif.message}
              </p>
              
              {!notif.isRead && (
                <button 
                  onClick={() => handleMarkAsRead(notif.id)}
                  className="text-[12px] font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
                >
                  Mark as read ✓
                </button>
              )}
            </div>
          ))}

          {notifications.length === 0 && (
            <div className="text-center py-10 text-gray-400 text-[14px]">
              No notifications yet!
            </div>
          )}
        </div>
      </div>
    </>
  );
}