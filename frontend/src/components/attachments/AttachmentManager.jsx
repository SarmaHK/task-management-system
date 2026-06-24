import { useState, useEffect, useId } from 'react';
import attachmentService from '../../services/attachmentService';
import projectService from '../../services/projectService';
import { useAuth } from '../../context/AuthContext';

export default function AttachmentManager({ taskId, projectId }) {
  const { user } = useAuth();
  const fileInputId = useId();
  const [attachments, setAttachments] = useState([]);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const fetchAttachments = async () => {
    try {
      setLoading(true);
      let res;
      if (projectId) {
        res = await projectService.getAttachments(projectId);
      } else {
        res = await attachmentService.getTaskAttachments(taskId);
      }
      if (res.success) {
        setAttachments(res.data);
      }
    } catch (err) {
      console.error('Error fetching attachments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (taskId || projectId) {
      fetchAttachments();
    }
  }, [taskId, projectId]);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;

    // Validate size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be under 10MB.');
      return;
    }

    try {
      setUploading(true);
      let res;
      if (projectId) {
        res = await projectService.uploadAttachment(projectId, file);
      } else {
        res = await attachmentService.uploadAttachment(taskId, file);
      }
      
      if (res.success) {
        setFile(null);
        document.getElementById(fileInputId).value = '';
        fetchAttachments();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to upload attachment');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this attachment?')) return;
    try {
      const res = await attachmentService.deleteAttachment(id);
      if (res.success) {
        fetchAttachments();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete attachment');
    }
  };

  const handleDownload = (id) => {
    const downloadUrl = attachmentService.getDownloadUrl(id);
    // Open in a new tab to trigger browser download streaming
    window.open(downloadUrl, '_blank');
  };

  const isAllowedToDelete = (att) => {
    return (
      att.userId === user?.id ||
      user?.role === 'PROJECT_MANAGER'
    );
  };

  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-[16px] font-bold text-indigo-950 border-b border-gray-50 pb-2">
        📎 {projectId ? 'Project Attachments' : 'Task Attachments'}
      </h3>

      {/* Upload Form */}
      {user?.role !== 'ADMIN' && (
        <>
          <form onSubmit={handleUpload} className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
            <input
              id={fileInputId}
              type="file"
              accept=".pdf,.docx,.xlsx,.png,.jpg,.jpeg"
              onChange={handleFileChange}
              className="flex-1 text-[13px] border border-gray-200 rounded-xl px-3 py-1.5 bg-white file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-[12px] file:font-bold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
            />
            <button
              type="submit"
              disabled={!file || uploading}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[13px] rounded-xl cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? 'Uploading...' : 'Upload'}
            </button>
          </form>
          <p className="text-[11px] text-gray-400">Supported: PDF, DOCX, XLSX, PNG, JPG (Max: 10MB)</p>
        </>
      )}

      {/* File List */}
      {loading ? (
        <div className="text-gray-400 text-[13px] py-2">Loading files...</div>
      ) : attachments.length === 0 ? (
        <div className="text-gray-400 text-[13px] py-2 italic">No files attached to this {projectId ? 'project' : 'task'}.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-60 overflow-y-auto">
          {attachments.map((att) => (
            <div 
              key={att.id} 
              className="p-3 bg-white border border-gray-150 rounded-xl flex items-center justify-between gap-3 shadow-sm hover:shadow transition-shadow"
            >
              <div className="min-w-0 flex items-center gap-2">
                <span className="text-xl flex-shrink-0">
                  {att.mimeType?.includes('image') ? '🖼️' : '📄'}
                </span>
                <div className="min-w-0">
                  <p className="text-[13px] font-bold text-indigo-950 truncate leading-snug" title={att.filename}>
                    {att.filename}
                  </p>
                  <span className="text-[10px] text-gray-400 block mt-0.5">
                    Uploaded by {att.user?.name || 'User'}
                  </span>
                </div>
              </div>

              <div className="flex gap-1.5 flex-shrink-0">
                <button
                  onClick={() => handleDownload(att.id)}
                  className="text-[12px] font-bold text-indigo-600 hover:text-indigo-800 px-2 py-1 rounded hover:bg-indigo-50"
                  title="Download File"
                >
                  Download
                </button>
                {isAllowedToDelete(att) && (
                  <button
                    onClick={() => handleDelete(att.id)}
                    className="text-[12px] font-bold text-red-500 hover:text-red-700 px-2 py-1 rounded hover:bg-red-50"
                    title="Delete File"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
