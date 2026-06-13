/**
 * taskService.js — All task-related API calls via the Axios instance
 */
import api from './api';

export const taskService = {
  /**
   * Fetch all tasks for the authenticated user
   */
  getAllTasks: async () => {
    const response = await api.get('/tasks');
    return response.data;
  },

  /**
   * Fetch a single task by ID
   */
  getTaskById: async (id) => {
    const response = await api.get(`/tasks/${id}`);
    return response.data;
  },

  /**
   * Create a new task
   * @param {{ title, description, priority, dueDate }} payload
   */
  createTask: async (payload) => {
    const response = await api.post('/tasks', payload);
    return response.data;
  },

  /**
   * Update an existing task (full update)
   * @param {number} id
   * @param {{ title, description, priority, dueDate }} payload
   */
  updateTask: async (id, payload) => {
    const response = await api.put(`/tasks/${id}`, payload);
    return response.data;
  },

  /**
   * Update only the status of a task
   * @param {number} id
   * @param {string} status — 'PENDING' | 'IN_PROGRESS' | 'COMPLETED'
   */
  updateTaskStatus: async (id, status) => {
    const response = await api.patch(`/tasks/${id}/status`, { status });
    return response.data;
  },

  /**
   * Update only the priority of a task
   * @param {number} id
   * @param {string} priority — 'LOW' | 'MEDIUM' | 'HIGH'
   */
  updateTaskPriority: async (id, priority) => {
    const response = await api.patch(`/tasks/${id}/priority`, { priority });
    return response.data;
  },

  /**
   * Delete a task by ID
   */
  deleteTask: async (id) => {
    const response = await api.delete(`/tasks/${id}`);
    return response.data;
  },

  /**
   * Filter tasks by status, priority, or projectId
   */
  filterTasks: async ({ status, priority, projectId } = {}) => {
    const params = {};
    if (status) params.status = status;
    if (priority) params.priority = priority;
    if (projectId) params.projectId = projectId;
    const response = await api.get('/tasks/filter', { params });
    return response.data;
  },
};

export default taskService;
