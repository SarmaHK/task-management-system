/**
 * projectService.js — Project-related API calls
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
};

export default projectService;
