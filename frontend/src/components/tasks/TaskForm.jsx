/**
 * TaskForm.jsx — Reusable form used by both CreateTask and EditTask pages
 */
import { useState, useEffect, useRef } from 'react';
import projectService from '../../services/projectService';
import taskService from '../../services/taskService';
import { useAuth } from '../../context/AuthContext';

const STATUSES = [
  { value: 'BACKLOG', label: '📝 Backlog' },
  { value: 'TODO', label: '⏳ To Do' },
  { value: 'IN_PROGRESS', label: '🔄 In Progress' },
  { value: 'COMPLETED', label: '✅ Completed' },
];

const PRIORITIES = [
  { value: 'LOW', label: '▽ Low' },
  { value: 'MEDIUM', label: '◈ Medium' },
  { value: 'HIGH', label: '▲ High' },
];

/**
 * @param {Object}   props
 * @param {Object}   props.initialValues  — Pre-populated values (for edit mode)
 * @param {Function} props.onSubmit       — Called with form data on valid submit
 * @param {boolean}  props.isSubmitting   — Shows a loading spinner on the submit button
 * @param {string}   props.submitLabel    — Button text
 * @param {boolean}  props.showStatus     — Show status dropdown (edit mode only)
 * @param {boolean}  props.showProjectId  — Show project selector (create mode only)
 */
export default function TaskForm({
  initialValues = {},
  onSubmit,
  isSubmitting = false,
  submitLabel = 'Save Task',
  showStatus = false,
  showProjectId = false,
}) {
  const { user } = useAuth();
  
  const [form, setForm] = useState({
    title: '',
    description: '',
    priority: 'MEDIUM',
    status: 'BACKLOG',
    dueDate: '',
    projectId: '',
    assigneeIds: [],
    ...initialValues,
  });

  const [projects, setProjects] = useState([]);
  const [projectMembers, setProjectMembers] = useState([]);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [projectDropdownOpen, setProjectDropdownOpen] = useState(false);
  const projectDropdownRef = useRef(null);

  // List of assignable users (only project members)
  const getAssignableUsers = () => {
    const map = new Map();

    // 1. Add current project members (any role)
    projectMembers.forEach((m) => {
      if (m.user && m.user.status === 'ACTIVE') {
        map.set(m.userId, {
          userId: m.userId,
          name: m.user.name,
          email: m.user.email,
        });
      }
    });

    return Array.from(map.values());
  };

  // Click-outside listener to auto-close dropdowns
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (!e.target.closest('.collaborator-search-container')) {
        setDropdownOpen(false);
      }
      if (projectDropdownRef.current && !projectDropdownRef.current.contains(e.target)) {
        setProjectDropdownOpen(false);
      }
    };
    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, []);

  // 1. Fetch all projects for the dropdown
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await projectService.getAllProjects();
        if (res.success) {
          setProjects(res.data);
        }
      } catch (err) {
        console.error('Error fetching projects for form:', err);
      }
    };
    fetchProjects();
  }, []);

  // 2. Fetch project members when projectId changes to populate assignee options
  useEffect(() => {
    const fetchMembers = async () => {
      const pid = parseInt(form.projectId);
      if (!pid || isNaN(pid)) {
        setProjectMembers([]);
        return;
      }
      try {
        const res = await projectService.getProjectById(pid);
        if (res.success) {
          setProjectMembers(res.data.project.members || []);
        }
      } catch (err) {
        console.error('Error fetching project members for task form:', err);
      }
    };
    fetchMembers();
  }, [form.projectId]);

  // Sync initial values when editing
  useEffect(() => {
    if (initialValues && Object.keys(initialValues).length > 0) {
      const formattedInitial = { ...initialValues };
      if (initialValues.assignees) {
        // Map TaskAssignment array to simple user ID array
        formattedInitial.assigneeIds = initialValues.assignees.map((a) => a.userId);
      }
      setForm((prev) => ({ ...prev, ...formattedInitial }));
    }
  }, [JSON.stringify(initialValues)]);

  const validate = (values) => {
    const errs = {};
    if (!values.title?.trim()) {
      errs.title = 'Task title is required.';
    } else if (values.title.trim().length < 3) {
      errs.title = 'Title must be at least 3 characters.';
    } else if (values.title.trim().length > 120) {
      errs.title = 'Title must be under 120 characters.';
    }
    if (values.description && values.description.length > 1000) {
      errs.description = 'Description must be under 1000 characters.';
    }
    if (showProjectId && !values.projectId) {
      errs.projectId = 'Project selection is required.';
    }
    return errs;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (touched[name]) {
      setErrors((prev) => ({ ...prev, ...validate({ ...form, [name]: value }) }));
    }
  };

  const handleAssigneeChange = (userId, checked) => {
    setForm((prev) => {
      const current = prev.assigneeIds || [];
      const updated = checked
        ? [...current, userId]
        : current.filter((id) => id !== userId);
      return { ...prev, assigneeIds: updated };
    });
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    setErrors((prev) => ({ ...prev, ...validate(form) }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const allTouched = Object.fromEntries(
      ['title', 'description', 'priority', 'status', 'dueDate', 'projectId'].map((k) => [k, true])
    );
    setTouched(allTouched);
    const errs = validate(form);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    const payload = {
      title: form.title.trim(),
      description: form.description?.trim() || undefined,
      priority: form.priority,
      dueDate: form.dueDate || undefined,
      assigneeIds: form.assigneeIds || [],
      ...(showStatus ? { status: form.status } : {}),
      ...(showProjectId ? { projectId: parseInt(form.projectId) } : {}),
    };
    onSubmit(payload);
  };

  const inputBase =
    'w-full px-4 py-3 rounded-xl border text-[14px] font-medium text-gray-800 bg-white transition-all duration-150 outline-none focus:ring-2 focus:ring-[#118B95]/30 focus:border-indigo-400';
  const inputError = 'border-red-300 bg-red-50/30 focus:ring-red-400/30 focus:border-red-400';
  const inputNormal = 'border-gray-200 hover:border-gray-300';

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
      
      {/* Project Selector — only in create mode */}
      {showProjectId && (() => {
        const filteredProjects = projects.filter((proj) => {
          if (user?.role === 'ADMIN') return true;
          return proj.owner?.id === user?.id || proj.members?.some(m => m.userId === user?.id);
        });
        
        return (
          <div className="flex flex-col gap-1.5" ref={projectDropdownRef}>
            <label className="text-[13px] font-bold text-gray-700 flex items-center gap-1">
              Project Workspace <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div 
                className={`${inputBase} flex items-center justify-between cursor-pointer ${touched.projectId && errors.projectId ? inputError : inputNormal}`}
                onClick={() => setProjectDropdownOpen(!projectDropdownOpen)}
              >
                <span className={form.projectId ? 'text-gray-800' : 'text-gray-400'}>
                  {form.projectId ? filteredProjects.find(p => p.id == form.projectId)?.name || '-- Select Project Workspace --' : '-- Select Project Workspace --'}
                </span>
                <svg className={`w-4 h-4 text-gray-400 transition-transform ${projectDropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
              
              {projectDropdownOpen && (
                <div className="absolute z-50 w-full mt-1.5 bg-white border border-gray-150 rounded-xl shadow-xl max-h-56 overflow-y-auto">
                  <div 
                    className="px-4 py-3 hover:bg-[#E6F5F6]/50 cursor-pointer transition-colors text-[13px] font-medium text-gray-400 border-b border-gray-100"
                    onClick={() => {
                      setForm(prev => ({ ...prev, projectId: '' }));
                      setTouched(prev => ({ ...prev, projectId: true }));
                      setProjectDropdownOpen(false);
                    }}
                  >
                    -- Select Project Workspace --
                  </div>
                  {filteredProjects.map((proj) => (
                    <div
                      key={proj.id}
                      onClick={() => {
                        setForm(prev => ({ ...prev, projectId: proj.id }));
                        setErrors(prev => ({ ...prev, projectId: undefined }));
                        setProjectDropdownOpen(false);
                      }}
                      className={`px-4 py-3 hover:bg-[#E6F5F6]/50 cursor-pointer transition-colors text-[13px] font-medium text-[#052D30] ${form.projectId == proj.id ? 'bg-[#E6F5F6]/20' : ''}`}
                    >
                      {proj.name}
                    </div>
                  ))}
                  {filteredProjects.length === 0 && (
                    <div className="px-4 py-3 text-[13px] font-medium text-gray-400 italic">
                      No projects available
                    </div>
                  )}
                </div>
              )}
            </div>
            {touched.projectId && errors.projectId && (
              <p className="text-[12px] text-red-500 font-medium">{errors.projectId}</p>
            )}
          </div>
        );
      })()}

      {/* Title */}
      <div className="flex flex-col gap-1.5">
        <label className="text-[13px] font-bold text-gray-700 flex items-center gap-1">
          Task Title <span className="text-red-500">*</span>
        </label>
        <input
          id="task-title"
          name="title"
          type="text"
          value={form.title}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="e.g. Implement user authentication module"
          className={`${inputBase} ${touched.title && errors.title ? inputError : inputNormal}`}
          maxLength={120}
        />
        {touched.title && errors.title && (
          <p className="text-[12px] text-red-500 font-medium flex items-center gap-1">
            {errors.title}
          </p>
        )}
        <p className="text-[11px] text-gray-400 text-right">{form.title.length}/120</p>
      </div>

      {/* Description */}
      <div className="flex flex-col gap-1.5">
        <label className="text-[13px] font-bold text-gray-700">Description</label>
        <textarea
          id="task-description"
          name="description"
          value={form.description}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="Provide details about the task, acceptance criteria, or any notes…"
          rows={4}
          className={`${inputBase} resize-y min-h-[100px] ${touched.description && errors.description ? inputError : inputNormal}`}
          maxLength={1000}
        />
        {touched.description && errors.description && (
          <p className="text-[12px] text-red-500 font-medium">{errors.description}</p>
        )}
        <p className="text-[11px] text-gray-400 text-right">{(form.description || '').length}/1000</p>
      </div>

      {/* Priority + Status + Due Date row */}
      <div className={`grid gap-4 ${showStatus ? 'grid-cols-1 sm:grid-cols-3' : 'grid-cols-1 sm:grid-cols-2'}`}>
        {/* Priority */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[13px] font-bold text-gray-700">Priority</label>
          <select
            id="task-priority"
            name="priority"
            value={form.priority}
            onChange={handleChange}
            className={`${inputBase} ${inputNormal} cursor-pointer`}
          >
            {PRIORITIES.map((p) => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>
        </div>

        {/* Status — only in edit mode */}
        {showStatus && (
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-bold text-gray-700">Status</label>
            <select
              id="task-status"
              name="status"
              value={form.status}
              onChange={handleChange}
              className={`${inputBase} ${inputNormal} cursor-pointer`}
            >
              {STATUSES.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>
        )}

        {/* Due Date */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[13px] font-bold text-gray-700">Due Date</label>
          <input
            id="task-due-date"
            name="dueDate"
            type="date"
            value={form.dueDate ? form.dueDate.split('T')[0] : ''}
            onChange={handleChange}
            className={`${inputBase} ${inputNormal} cursor-pointer`}
          />
        </div>
      </div>

      {/* Searchable Task Assignees Selector - including all system collaborators */}
      {form.projectId && (
        <div className="flex flex-col gap-1.5 collaborator-search-container relative">
          <label className="text-[13px] font-bold text-[#052D30] block mb-1">
            Task Assignees (Collaborators & Members)
          </label>

          {/* Selected assignees chips */}
          {getAssignableUsers().filter(m => (form.assigneeIds || []).includes(m.userId)).length > 0 && (
            <div className="flex flex-wrap gap-2 mb-2">
              {getAssignableUsers()
                .filter(m => (form.assigneeIds || []).includes(m.userId))
                .map((m) => (
                  <span
                    key={m.userId}
                    className="inline-flex items-center gap-1.5 bg-[#E6F5F6] border border-[#BEE3E6] text-[#052D30] px-2.5 py-1 rounded-xl text-[12px] font-bold shadow-sm"
                  >
                    <span className="w-4 h-4 rounded-full bg-[#118B95] text-white text-[9px] font-extrabold flex items-center justify-center">
                      {(m.name || 'U').charAt(0).toUpperCase()}
                    </span>
                    {m.name}
                    <span className="text-[10px] text-gray-400 font-semibold">(ID: {m.userId})</span>
                    <button
                      type="button"
                      onClick={() => handleAssigneeChange(m.userId, false)}
                      className="text-gray-400 hover:text-[#118B95] font-extrabold focus:outline-none ml-1 cursor-pointer"
                    >
                      ✕
                    </button>
                  </span>
                ))}
            </div>
          )}

          {getAssignableUsers().length === 0 ? (
            <p className="text-[12px] text-gray-400 italic">No assignable users found.</p>
          ) : (
            <div className="relative">
              <div className="relative flex items-center">
                <input
                  type="text"
                  autoComplete="off"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setDropdownOpen(true);
                  }}
                  onFocus={() => setDropdownOpen(true)}
                  placeholder="Search collaborators by name, email, or ID..."
                  className={`${inputBase} ${inputNormal} pr-10`}
                />
                <div className="absolute right-3 text-gray-400 pointer-events-none">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>

              {/* Search results dropdown */}
              {dropdownOpen && (
                <div className="absolute z-50 w-full mt-1.5 bg-white border border-gray-150 rounded-xl shadow-xl max-h-56 overflow-y-auto">
                  {getAssignableUsers().filter((m) => {
                    const query = searchQuery.toLowerCase().trim();
                    if (!query) return true;
                    const nameMatch = m.name?.toLowerCase().includes(query);
                    const emailMatch = m.email?.toLowerCase().includes(query);
                    const idMatch = m.userId?.toString() === query;
                    return nameMatch || emailMatch || idMatch;
                  }).length === 0 ? (
                    <div className="p-3.5 text-[12.5px] text-gray-400 italic text-center">
                      No matching collaborators found.
                    </div>
                  ) : (
                    getAssignableUsers()
                      .filter((m) => {
                        const query = searchQuery.toLowerCase().trim();
                        if (!query) return true;
                        const nameMatch = m.name?.toLowerCase().includes(query);
                        const emailMatch = m.email?.toLowerCase().includes(query);
                        const idMatch = m.userId?.toString() === query;
                        return nameMatch || emailMatch || idMatch;
                      })
                      .map((m) => {
                        const isSelected = (form.assigneeIds || []).includes(m.userId);
                        return (
                          <div
                            key={m.userId}
                            onClick={() => {
                              handleAssigneeChange(m.userId, !isSelected);
                              setSearchQuery('');
                              setDropdownOpen(false);
                            }}
                            className={`flex items-center justify-between px-4 py-2.5 hover:bg-[#E6F5F6]/50 cursor-pointer transition-colors text-[13px] font-medium ${
                              isSelected ? 'bg-[#E6F5F6]/20' : ''
                            }`}
                          >
                            <div className="flex items-center gap-2.5">
                              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#2AA7B3] to-[#118B95] text-white text-[11px] font-extrabold flex items-center justify-center">
                                {(m.name || 'U').charAt(0).toUpperCase()}
                              </div>
                              <div className="flex flex-col">
                                <span className="font-bold text-[#052D30]">{m.name}</span>
                                <span className="text-[11px] text-gray-400">{m.email} • ID: {m.userId}</span>
                              </div>
                            </div>
                            {isSelected && (
                              <span className="text-[#118B95] font-bold text-[12.5px] pr-1">✓ Selected</span>
                            )}
                          </div>
                        );
                      })
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Submit button */}
      <div className="pt-2">
        <button
          id="task-form-submit"
          type="submit"
          disabled={isSubmitting}
          className="w-full flex items-center justify-center gap-2.5 px-6 py-3.5 bg-gradient-to-r from-[#118B95] to-[#0D5A60] text-white font-bold text-[14.5px] rounded-xl shadow-lg hover:shadow-[#118B95]/30 hover:from-[#2AA7B3] hover:to-[#118B95] active:scale-[0.98] transition-all duration-150 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
        >
          {isSubmitting ? (
            <>
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Saving…
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              {submitLabel}
            </>
          )}
        </button>
      </div>
    </form>
  );
}
