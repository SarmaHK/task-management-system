/**
 * attachmentService.js — File attachment API queries
 */
import api from './api';

export const attachmentService = {
  /**
   * Upload an attachment file for a task
   * @param {number} taskId
   * @param {File} fileObject
   * @param {function} onUploadProgress
   */
  uploadAttachment: async (taskId, fileObject, onUploadProgress) => {
    const formData = new FormData();
    formData.append('file', fileObject);

    const response = await api.post(`/tasks/${taskId}/attachments`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress,
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
   * Rename a task attachment
   */
  renameAttachment: async (attachmentId, newFilename) => {
    const response = await api.patch(`/attachments/${attachmentId}/rename`, { filename: newFilename });
    return response.data;
  },

  /**
   * Request download URL for an attachment (fetches pre-signed S3 URL)
   */
  requestDownloadUrl: async (attachmentId) => {
    const response = await api.get(`/attachments/${attachmentId}/download`);
    return response.data;
  },
};

export default attachmentService;
