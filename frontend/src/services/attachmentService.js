/**
 * attachmentService.js — File attachment API queries
 */
import api from './api';

export const attachmentService = {
  /**
   * Upload an attachment file for a task
   * @param {number} taskId
   * @param {File} fileObject
   */
  uploadAttachment: async (taskId, fileObject) => {
    const formData = new FormData();
    formData.append('file', fileObject);

    const response = await api.post(`/tasks/${taskId}/attachments`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  /**
   * Get all attachments for a specific task
   */
  getTaskAttachments: async (taskId) => {
    const response = await api.get(`/tasks/${taskId}/attachments`);
    return response.data;
  },

  /**
   * Delete a task attachment
   */
  deleteAttachment: async (attachmentId) => {
    const response = await api.delete(`/attachments/${attachmentId}`);
    return response.data;
  },

  /**
   * Get download URL for an attachment (to be consumed by window.open or custom download buttons)
   */
  getDownloadUrl: (attachmentId) => {
    const baseUrl = api.defaults.baseURL || '';
    return `${baseUrl}/attachments/${attachmentId}/download`;
  },
};

export default attachmentService;
