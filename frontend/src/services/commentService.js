/**
 * commentService.js — Task comments API queries
 */
import api from './api';

export const commentService = {
  /**
   * Add a comment to a task
   * @param {number} taskId
   * @param {string} content
   */
  addComment: async (taskId, content) => {
    const response = await api.post(`/tasks/${taskId}/comments`, { content });
    return response.data;
  },

  /**
   * Get all comments for a specific task
   */
  getCommentsForTask: async (taskId) => {
    const response = await api.get(`/tasks/${taskId}/comments`);
    return response.data;
  },

  /**
   * Update an existing comment
   */
  updateComment: async (commentId, content) => {
    const response = await api.patch(`/comments/${commentId}`, { content });
    return response.data;
  },

  /**
   * Delete a comment
   */
  deleteComment: async (commentId) => {
    const response = await api.delete(`/comments/${commentId}`);
    return response.data;
  },
};

export default commentService;
