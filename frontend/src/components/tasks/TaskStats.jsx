/**
 * TaskStats.jsx — Summary statistics dashboard cards (Clickable to Filter)
 */
export default function TaskStats({ stats, loading, statusFilter, onFilterChange }) {
  const cards = [
    {
      label: 'Total Tasks',
      statusValue: 'ALL',
      value: stats.total,
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
      gradient: 'from-indigo-500 to-violet-600',
      bg: 'bg-[#E6F5F6]',
      text: 'text-[#0D5A60]',
    },
    {
      label: 'Pending',
      statusValue: 'TODO',
      value: stats.pending,
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      gradient: 'from-amber-400 to-orange-500',
      bg: 'bg-amber-50',
      text: 'text-amber-700',
    },
    {
      label: 'In Progress',
      statusValue: 'IN_PROGRESS',
      value: stats.inProgress,
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      gradient: 'from-blue-400 to-cyan-500',
      bg: 'bg-[#E6F5F6]',
      text: 'text-[#0D5A60]',
    },
    {
      label: 'Completed',
      statusValue: 'COMPLETED',
      value: stats.completed,
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      gradient: 'from-emerald-400 to-teal-500',
      bg: 'bg-emerald-50',
      text: 'text-emerald-700',
    },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse">
            <div className="h-3 bg-gray-100 rounded w-1/2 mb-3" />
            <div className="h-8 bg-gray-100 rounded w-1/3" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, i) => {
        const isActive = statusFilter === card.statusValue;
        return (
          <div
            key={card.label}
            onClick={() => onFilterChange && onFilterChange(card.statusValue)}
            className={`bg-white rounded-2xl border p-5 flex items-center gap-4 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer ${
              isActive 
                ? 'border-indigo-500 ring-2 ring-[#118B95]/10 shadow-sm bg-[#E6F5F6]/10' 
                : 'border-gray-100 hover:border-[#93CFD4]'
            }`}
            style={{ animationDelay: `${i * 0.07}s` }}
          >
            {/* Icon */}
            <div className={`w-12 h-12 rounded-xl ${card.bg} ${card.text} flex items-center justify-center flex-shrink-0`}>
              {card.icon}
            </div>

            {/* Text */}
            <div>
              <p className="text-[11.5px] font-bold text-gray-400 uppercase tracking-wider leading-none mb-1">
                {card.label}
              </p>
              <p className="text-[28px] font-extrabold text-gray-900 leading-none">
                {card.value}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
