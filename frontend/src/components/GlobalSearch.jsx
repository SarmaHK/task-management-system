import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function GlobalSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState({ tasks: [], projects: [], users: [] });
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Debounced search effect
  useEffect(() => {
    if (!query || query.trim().length < 2) {
      setResults({ tasks: [], projects: [], users: [] });
      setIsLoading(false);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setIsLoading(true);
      try {
        const response = await api.get(`/search?q=${encodeURIComponent(query.trim())}`);
        setResults(response.data?.data || { tasks: [], projects: [], users: [] });
      } catch (error) {
        console.error('Global search error:', error);
      } finally {
        setIsLoading(false);
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  // Click outside listener
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleSelect = (type, item) => {
    setIsOpen(false);
    setQuery('');
    
    if (type === 'task') {
      navigate(`/tasks/details/${item.id}`);
    } else if (type === 'project') {
      navigate(`/projects/${item.id}`);
    } else if (type === 'user') {
      // For admins, route to user management or just do nothing for now
      if (item.role === 'ADMIN') {
         navigate('/admin/users');
      }
    }
  };

  const hasResults = results.tasks.length > 0 || results.projects.length > 0 || results.users.length > 0;

  return (
    <div className="hidden md:flex items-center flex-1 max-w-md relative" ref={dropdownRef}>
      <svg className="w-4 h-4 text-gray-400 absolute left-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      <input 
        type="text" 
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setIsOpen(true);
        }}
        onFocus={() => {
          if (query.trim().length >= 2) setIsOpen(true);
        }}
        placeholder="Search tasks, projects, or people..." 
        className="w-full pl-10 pr-10 py-2 bg-gray-50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-700 rounded-lg text-sm dark:text-white dark:placeholder-slate-500 focus:outline-none focus:bg-white dark:focus:bg-slate-900 focus:ring-1 focus:ring-[#118B95] focus:border-[#118B95] transition-all"
      />
      
      {isLoading && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          <div className="w-4 h-4 border-2 border-gray-300 border-t-[#118B95] rounded-full animate-spin" />
        </div>
      )}

      {/* Dropdown Results */}
      {isOpen && query.trim().length >= 2 && !isLoading && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-gray-100 dark:border-slate-700 max-h-[70vh] overflow-y-auto z-50 animate-scaleIn origin-top">
          
          {!hasResults && !isLoading && (
            <div className="p-4 text-center text-gray-500 dark:text-slate-400 text-sm">
              No results found for "{query}"
            </div>
          )}

          {results.tasks.length > 0 && (
            <div className="py-2">
              <div className="px-4 py-1 text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider bg-gray-50 dark:bg-slate-900/50">
                Tasks
              </div>
              {results.tasks.map(task => (
                <button
                  key={task.id}
                  onClick={() => handleSelect('task', task)}
                  className="w-full text-left px-4 py-2 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors group flex flex-col"
                >
                  <span className="text-sm font-semibold text-gray-800 dark:text-gray-200 group-hover:text-[#118B95] dark:group-hover:text-[#2AA7B3]">
                    {task.title}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-slate-400">
                    Project: {task.project?.name || 'Unknown'}
                  </span>
                </button>
              ))}
            </div>
          )}

          {results.projects.length > 0 && (
            <div className="py-2 border-t border-gray-100 dark:border-slate-700">
              <div className="px-4 py-1 text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider bg-gray-50 dark:bg-slate-900/50">
                Projects
              </div>
              {results.projects.map(project => (
                <button
                  key={project.id}
                  onClick={() => handleSelect('project', project)}
                  className="w-full text-left px-4 py-2 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors group flex items-center justify-between"
                >
                  <span className="text-sm font-semibold text-gray-800 dark:text-gray-200 group-hover:text-[#118B95] dark:group-hover:text-[#2AA7B3]">
                    {project.name}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-md bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-slate-400">
                    {project.status}
                  </span>
                </button>
              ))}
            </div>
          )}

          {results.users.length > 0 && (
            <div className="py-2 border-t border-gray-100 dark:border-slate-700">
              <div className="px-4 py-1 text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider bg-gray-50 dark:bg-slate-900/50">
                People
              </div>
              {results.users.map(user => (
                <button
                  key={user.id}
                  onClick={() => handleSelect('user', user)}
                  className="w-full text-left px-4 py-2 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors group flex items-center gap-3"
                >
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#118B95] to-[#0D5A60] flex items-center justify-center text-white text-[10px] font-bold">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-gray-800 dark:text-gray-200 group-hover:text-[#118B95] dark:group-hover:text-[#2AA7B3]">
                      {user.name}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-slate-400">
                      {user.email}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}

        </div>
      )}
    </div>
  );
}
