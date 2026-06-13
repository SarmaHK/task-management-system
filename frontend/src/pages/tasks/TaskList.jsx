/**
 * TaskList.jsx — Main task management page with search, filter, sort, pagination
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTasks } from '../../hooks/useTasks';
import TaskCard from '../../components/tasks/TaskCard';
import TaskStats from '../../components/tasks/TaskStats';
import DeleteModal from '../../components/tasks/DeleteModal';
import DashboardLayout from '../../components/DashboardLayout';

/* ── Skeleton card ── */
function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse">
      <div className="h-2 bg-gray-100 rounded-full w-full mb-4" />
      <div className="h-4 bg-gray-100 rounded w-3/4 mb-2" />
      <div className="h-3 bg-gray-50 rounded w-1/2 mb-5" />
      <div className="h-3 bg-gray-50 rounded w-full mb-2" />
      <div className="h-3 bg-gray-50 rounded w-4/5 mb-6" />
      <div className="flex gap-2">
        <div className="h-5 bg-gray-100 rounded-full w-20" />
        <div className="ml-auto h-5 bg-gray-50 rounded w-16" />
      </div>
    </div>
  );
}

/* ── Empty state ── */
function EmptyState({ hasFilters, onClear }) {
  return (
    <div className="col-span-full flex flex-col items-center justify-center py-20 text-center">
      <div className="w-20 h-20 bg-indigo-50 rounded-2xl flex items-center justify-center mb-5">
        <svg className="w-9 h-9 text-indigo-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      </div>
      {hasFilters ? (
        <>
          <h3 className="text-[17px] font-bold text-gray-800 mb-1">No tasks match your filters</h3>
          <p className="text-[13.5px] text-gray-500 mb-4">Try adjusting your search or filter criteria.</p>
          <button
            onClick={onClear}
            className="px-4 py-2 text-indigo-600 font-bold text-[13px] border border-indigo-200 rounded-xl hover:bg-indigo-50 transition-colors cursor-pointer"
          >
            Clear Filters
          </button>
        </>
      ) : (
        <>
          <h3 className="text-[17px] font-bold text-gray-800 mb-1">No tasks yet</h3>
          <p className="text-[13.5px] text-gray-500 mb-4">Create your first task to get started.</p>
        </>
      )}
    </div>
  );
}

/* ── Error state ── */
function ErrorState({ message, onRetry }) {
  return (
    <div className="col-span-full flex flex-col items-center justify-center py-20 text-center">
      <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mb-4">
        <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <h3 className="text-[17px] font-bold text-gray-800 mb-1">Something went wrong</h3>
      <p className="text-[13px] text-gray-500 mb-4">{message}</p>
      <button
        onClick={onRetry}
        className="px-4 py-2 bg-indigo-600 text-white font-bold text-[13px] rounded-xl hover:bg-indigo-500 transition-colors cursor-pointer shadow-md"
      >
        Try Again
      </button>
    </div>
  );
}

export default function TaskList() {
  const navigate = useNavigate();
  const {
    paginatedTasks, filteredTasks, loading, error, stats,
    searchQuery, setSearchQuery,
    statusFilter, setStatusFilter,
    priorityFilter, setPriorityFilter,
    sortOrder, setSortOrder,
    currentPage, setCurrentPage, totalPages,
    fetchTasks, updateTaskStatus, deleteTask,
  } = useTasks();

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const hasFilters = searchQuery || statusFilter !== 'ALL' || priorityFilter !== 'ALL';

  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('ALL');
    setPriorityFilter('ALL');
  };

  const handleDeleteConfirm = async (id) => {
    setIsDeleting(true);
    try {
      await deleteTask(id);
      setDeleteTarget(null);
    } finally {
      setIsDeleting(false);
    }
  };

  const selectClass =
    'px-3 py-2 text-[13px] font-semibold border border-gray-200 rounded-xl bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-400/40 focus:border-indigo-400 hover:border-gray-300 transition-all cursor-pointer';

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6 max-w-7xl mx-auto px-4 sm:px-6 py-8">

        {/* Page header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-[26px] font-extrabold text-gray-900 tracking-tight">My Tasks</h1>
            <p className="text-[13.5px] text-gray-400 font-medium mt-0.5">
              {loading ? 'Loading…' : `${filteredTasks.length} task${filteredTasks.length !== 1 ? 's' : ''} found`}
            </p>
          </div>
          <button
            id="create-task-btn"
            onClick={() => navigate('/tasks/create')}
            className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold text-[14px] rounded-xl shadow-md hover:from-indigo-500 hover:to-violet-500 hover:shadow-indigo-400/30 active:scale-[0.97] transition-all duration-150 cursor-pointer flex-shrink-0"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            New Task
          </button>
        </div>

        {/* Stats */}
        <TaskStats stats={stats} loading={loading} />

        {/* Toolbar: search + filters + sort */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-4 sm:px-5 py-4 flex flex-col sm:flex-row gap-3 sm:items-center">
          {/* Search */}
          <div className="relative flex-1 min-w-0">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              id="task-search"
              type="text"
              placeholder="Search tasks…"
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              className="w-full pl-9 pr-4 py-2 text-[13.5px] font-medium border border-gray-200 rounded-xl bg-gray-50/50 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/40 focus:border-indigo-400 focus:bg-white transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            )}
          </div>

          <div className="flex gap-2 flex-wrap">
            {/* Status filter */}
            <select
              id="status-filter"
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
              className={selectClass}
            >
              <option value="ALL">All Statuses</option>
              <option value="TODO">⏳ To Do</option>
              <option value="IN_PROGRESS">🔄 In Progress</option>
              <option value="COMPLETED">✅ Completed</option>
            </select>

            {/* Priority filter */}
            <select
              id="priority-filter"
              value={priorityFilter}
              onChange={(e) => { setPriorityFilter(e.target.value); setCurrentPage(1); }}
              className={selectClass}
            >
              <option value="ALL">All Priorities</option>
              <option value="LOW">▽ Low</option>
              <option value="MEDIUM">◈ Medium</option>
              <option value="HIGH">▲ High</option>
            </select>

            {/* Sort */}
            <select
              id="sort-order"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className={selectClass}
            >
              <option value="newest">↓ Newest First</option>
              <option value="oldest">↑ Oldest First</option>
            </select>

            {/* Clear filters */}
            {hasFilters && (
              <button
                onClick={clearFilters}
                className="px-3 py-2 text-[12.5px] font-bold text-indigo-600 border border-indigo-200 rounded-xl hover:bg-indigo-50 transition-colors cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Task grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {loading ? (
            [...Array(6)].map((_, i) => <SkeletonCard key={i} />)
          ) : error ? (
            <ErrorState message={error} onRetry={fetchTasks} />
          ) : paginatedTasks.length === 0 ? (
            <EmptyState hasFilters={hasFilters} onClear={clearFilters} />
          ) : (
            paginatedTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onDelete={setDeleteTarget}
                onStatusChange={updateTaskStatus}
              />
            ))
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 pt-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 text-[13px] font-bold border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
            >
              ← Prev
            </button>
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i + 1}
                onClick={() => setCurrentPage(i + 1)}
                className={`w-9 h-9 text-[13px] font-bold rounded-xl border transition-all cursor-pointer ${
                  currentPage === i + 1
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-md'
                    : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 text-[13px] font-bold border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
            >
              Next →
            </button>
          </div>
        )}
      </div>

      {/* Delete modal */}
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
