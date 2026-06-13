/**
 * TaskForm.jsx — Reusable form used by both CreateTask and EditTask pages
 */
import { useState, useEffect } from 'react';

const STATUSES = [
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
 * @param {boolean}  props.showProjectId  — Show project ID field (create mode only)
 */
export default function TaskForm({
  initialValues = {},
  onSubmit,
  isSubmitting = false,
  submitLabel = 'Save Task',
  showStatus = false,
  showProjectId = false,
}) {
  const [form, setForm] = useState({
    title: '',
    description: '',
    priority: 'MEDIUM',
    status: 'TODO',
    dueDate: '',
    projectId: '',
    ...initialValues,
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Sync initial values when editing (data arrives async)
  useEffect(() => {
    if (initialValues && Object.keys(initialValues).length > 0) {
      setForm((prev) => ({ ...prev, ...initialValues }));
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
    if (showProjectId) {
      if (!values.projectId) {
        errs.projectId = 'Project ID is required.';
      } else if (isNaN(parseInt(values.projectId)) || parseInt(values.projectId) < 1) {
        errs.projectId = 'Please enter a valid numeric Project ID.';
      }
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
      ...(showStatus ? { status: form.status } : {}),
      ...(showProjectId ? { projectId: parseInt(form.projectId) } : {}),
    };
    onSubmit(payload);
  };

  const inputBase =
    'w-full px-4 py-3 rounded-xl border text-[14px] font-medium text-gray-800 bg-white transition-all duration-150 outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400';
  const inputError = 'border-red-300 bg-red-50/30 focus:ring-red-400/30 focus:border-red-400';
  const inputNormal = 'border-gray-200 hover:border-gray-300';

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
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
            <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
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

      {/* Project ID — only in create mode */}
      {showProjectId && (
        <div className="flex flex-col gap-1.5">
          <label className="text-[13px] font-bold text-gray-700 flex items-center gap-1">
            Project ID <span className="text-red-500">*</span>
          </label>
          <input
            id="task-project-id"
            name="projectId"
            type="number"
            min="1"
            value={form.projectId}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="Enter the numeric Project ID (e.g. 1)"
            className={`${inputBase} ${touched.projectId && errors.projectId ? inputError : inputNormal}`}
          />
          {touched.projectId && errors.projectId && (
            <p className="text-[12px] text-red-500 font-medium">{errors.projectId}</p>
          )}
          <p className="text-[11px] text-indigo-500/70 font-medium">Ask your Project Manager for the Project ID.</p>
        </div>
      )}

      {/* Submit button */}
      <div className="pt-2">
        <button
          id="task-form-submit"
          type="submit"
          disabled={isSubmitting}
          className="w-full flex items-center justify-center gap-2.5 px-6 py-3.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold text-[14.5px] rounded-xl shadow-lg hover:shadow-indigo-500/30 hover:from-indigo-500 hover:to-violet-500 active:scale-[0.98] transition-all duration-150 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
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
