/**
 * helpers.js — Shared utility functions
 */

/**
 * Maps a task status key to display label + Tailwind colour classes
 */
export const STATUS_CONFIG = {
  TODO: {
    label: 'To Do',
    dot: 'bg-amber-400',
    badge: 'bg-amber-50 text-amber-700 border-amber-200',
    icon: '⏳',
  },
  IN_PROGRESS: {
    label: 'In Progress',
    dot: 'bg-blue-400',
    badge: 'bg-blue-50 text-blue-700 border-blue-200',
    icon: '🔄',
  },
  COMPLETED: {
    label: 'Completed',
    dot: 'bg-emerald-400',
    badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    icon: '✅',
  },
};

/**
 * Maps priority to display label + Tailwind colour classes
 */
export const PRIORITY_CONFIG = {
  LOW: {
    label: 'Low',
    badge: 'bg-slate-100 text-slate-600 border-slate-200',
    icon: '▽',
  },
  MEDIUM: {
    label: 'Medium',
    badge: 'bg-orange-50 text-orange-600 border-orange-200',
    icon: '◈',
  },
  HIGH: {
    label: 'High',
    badge: 'bg-red-50 text-red-600 border-red-200',
    icon: '▲',
  },
};

/**
 * Format a date string as "Jun 13, 2026"
 */
export const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

/**
 * Truncate a string to maxLen characters, appending ellipsis
 */
export const truncate = (str, maxLen = 90) => {
  if (!str) return '';
  return str.length > maxLen ? str.slice(0, maxLen) + '…' : str;
};

/**
 * Calculate relative time label ("3 days ago", "just now", etc.)
 */
export const relativeTime = (dateStr) => {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
};
