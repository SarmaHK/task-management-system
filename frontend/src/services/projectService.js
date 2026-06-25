/**
 * projectService.js — Project-related API calls via Axios
 */
import api from './api';

export const projectService = {
  /**
   * Get all projects accessible to the authenticated user
   */
  getAllProjects: async () => {
    const response = await api.get('/projects');
    return response.data;
  },

  /**
   * Get searchable active users for member linking
   */
  getSearchableUsers: async (searchQuery) => {
    const response = await api.get('/users', { params: { search: searchQuery } });
    return response.data;
  },

  /**
   * Get project details and analytics by ID
   */
  getProjectById: async (id) => {
    const response = await api.get(`/projects/${id}`);
    return response.data;
  },

  /**
   * Create a new project (Admin or PM only)
   * @param {{ name, description, startDate, endDate }} payload
   */
  createProject: async (payload) => {
    const response = await api.post('/projects', payload);
    return response.data;
  },

  /**
   * Update an existing project (Admin or Owner PM only)
   * @param {number} id
   * @param {{ name, description, status, startDate, endDate }} payload
   */
  updateProject: async (id, payload) => {
    const response = await api.patch(`/projects/${id}`, payload);
    return response.data;
  },

  /**
   * Soft delete a project (Admin or Owner PM only)
   */
  deleteProject: async (id) => {
    const response = await api.delete(`/projects/${id}`);
    return response.data;
  },

  /**
   * Link a member to a project
   * @param {number} id — Project ID
   * @param {{ userId: number, role: string }} memberPayload
   */
  addProjectMember: async (id, memberPayload) => {
    const response = await api.post(`/projects/${id}/members`, memberPayload);
    return response.data;
  },

  /**
   * Unlink a member from a project
   */
  removeProjectMember: async (id, memberId) => {
    const response = await api.delete(`/projects/${id}/members/${memberId}`);
    return response.data;
  },

  /**
   * Get all tasks associated with a project
   */
  getProjectTasks: async (id) => {
    const response = await api.get(`/projects/${id}/tasks`);
    return response.data;
  },

  /**
   * Get all project attachments
   */
  getAttachments: async (id) => {
    const response = await api.get(`/projects/${id}/attachments`);
    return response.data;
  },

  /**
   * Upload an attachment to a project
   */
  uploadAttachment: async (id, fileObject, onUploadProgress) => {
    const formData = new FormData();
    formData.append('file', fileObject);
    const response = await api.post(`/projects/${id}/attachments`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress,
    });
    return response.data;
  },
};

export default projectService;
