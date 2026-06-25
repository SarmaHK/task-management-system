import { useState, useEffect, useId, useRef } from 'react';
import attachmentService from '../../services/attachmentService';
import projectService from '../../services/projectService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../utils/ToastContext';
import { subscribeToNotifications } from '../../services/socket';

export default function AttachmentManager({ taskId, projectId }) {
  const { user } = useAuth();
  const toast = useToast();
  const fileInputId = useId();
  const fileInputRef = useRef(null);
  
  const [attachments, setAttachments] = useState([]);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDragOver, setIsDragOver] = useState(false);

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

  // Subscribe to real-time socket events for new attachments
  useEffect(() => {
    const unsubscribe = subscribeToNotifications((data) => {
      if (data.type === 'ATTACHMENT_ADDED' && data.taskId === taskId) {
        fetchAttachments();
      }
    });
    return () => unsubscribe();
  }, [taskId]);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleUpload = async (e) => {
    if (e) e.preventDefault();
    if (!file || uploading) return;

    // Validate size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be under 10MB.');
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    try {
      setUploading(true);
      setUploadProgress(0);

      const onProgress = (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        setUploadProgress(percentCompleted);
      };

      let res;
      if (projectId) {
        res = await projectService.uploadAttachment(projectId, file, onProgress);
      } else {
        res = await attachmentService.uploadAttachment(taskId, file, onProgress);
      }
      
      if (res.success) {
        toast.success('Attachment uploaded successfully!');
        setFile(null);
        setUploadProgress(0);
        if (fileInputRef.current) fileInputRef.current.value = '';
        fetchAttachments();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to upload attachment');
      setUploadProgress(0);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this attachment?')) return;
    try {
      const res = await attachmentService.deleteAttachment(id);
      if (res.success) {
        toast.success('Attachment deleted.');
        fetchAttachments();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete attachment');
    }
  };

  const handleDownload = async (id) => {
    try {
      const res = await attachmentService.requestDownloadUrl(id);
      if (res.success && res.data.url) {
        window.open(res.data.url, '_blank');
      } else {
        toast.error('Failed to generate download URL');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Download failed');
    }
  };

  const handleRename = async (id, currentName) => {
    const newName = window.prompt('Enter new name for the attachment:', currentName);
    if (!newName || newName.trim() === '' || newName === currentName) return;
    
    try {
      const res = await attachmentService.renameAttachment(id, newName.trim());
      if (res.success) {
        toast.success('Attachment renamed successfully.');
        fetchAttachments();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to rename attachment');
    }
  };

  const hasFullAccess = (att) => {
    return (
      att.userId === user?.id ||
      user?.role === 'PROJECT_MANAGER' ||
      user?.role === 'ADMIN'
    );
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return 'Unknown size';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-[16px] font-bold text-indigo-950 border-b border-gray-50 pb-2">
        📎 {projectId ? 'Project Attachments' : 'Task Attachments'}
      </h3>

      {/* Upload Form Area */}
      <div className="flex flex-col gap-3">
          <div 
            className={`border-2 border-dashed rounded-xl p-4 transition-colors ${
              isDragOver ? 'border-indigo-500 bg-indigo-50/50' : 'border-gray-200 bg-gray-50/30'
            } ${uploading ? 'opacity-70 pointer-events-none' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex flex-col gap-1 w-full text-center sm:text-left">
                <span className="text-[13px] font-semibold text-gray-700">
                  {file ? file.name : 'Drag and drop a file here, or click to browse'}
                </span>
                <span className="text-[11px] text-gray-400">
                  {file ? formatFileSize(file.size) : 'Supported: PDF, DOCX, XLSX, PNG, JPG (Max: 10MB)'}
                </span>
                
                {/* Hidden file input */}
                <input
                  id={fileInputId}
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.docx,.xlsx,.png,.jpg,.jpeg,.txt"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                {!file && (
                  <button
                    type="button"
                    onClick={() => document.getElementById(fileInputId).click()}
                    className="px-4 py-2 bg-white border border-gray-200 hover:bg-gray-50 text-indigo-700 font-bold text-[12px] rounded-xl cursor-pointer shadow-sm transition-colors"
                  >
                    Browse Files
                  </button>
                )}
                
                {file && (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        setFile(null);
                        if (fileInputRef.current) fileInputRef.current.value = '';
                      }}
                      className="px-3 py-2 text-gray-400 hover:text-rose-600 font-bold text-[12px] transition-colors cursor-pointer"
                    >
                      Clear
                    </button>
                    <button
                      type="button"
                      onClick={handleUpload}
                      disabled={uploading}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[13px] rounded-xl shadow-md shadow-indigo-100 transition-colors cursor-pointer disabled:opacity-50"
                    >
                      {uploading ? 'Uploading...' : 'Upload File'}
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Upload Progress Bar */}
            {uploading && (
              <div className="mt-4 w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                <div 
                  className="bg-indigo-600 h-1.5 rounded-full transition-all duration-300 ease-out" 
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            )}
          </div>
        </div>

      {/* File List */}
      {loading ? (
        <div className="flex justify-center items-center py-4">
          <div className="w-6 h-6 border-2 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin" />
        </div>
      ) : attachments.length === 0 ? (
        <div className="text-gray-400 text-[13px] py-4 text-center italic bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
          No files attached to this {projectId ? 'project' : 'task'}.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-80 overflow-y-auto pr-1 custom-scrollbar">
          {attachments.map((att) => (
            <div 
              key={att.id} 
              className="p-3 bg-white border border-gray-150 rounded-xl flex items-center justify-between gap-3 shadow-sm hover:shadow-md hover:border-indigo-100 transition-all group"
            >
              <div className="min-w-0 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-500 flex items-center justify-center text-xl flex-shrink-0">
                  {att.mimeType?.includes('image') ? '🖼️' : '📄'}
                </div>
                <div className="min-w-0 flex flex-col">
                  <p className="text-[13px] font-bold text-indigo-950 truncate leading-snug" title={att.filename}>
                    {att.filename}
                  </p>
                  <div className="flex items-center gap-2 text-[10px] text-gray-400 mt-0.5 font-medium">
                    <span>{formatFileSize(att.fileSize)}</span>
                    <span className="w-1 h-1 rounded-full bg-gray-300" />
                    <span>{new Date(att.createdAt).toLocaleDateString()}</span>
                  </div>
                  <span className="text-[9.5px] text-indigo-500/80 font-bold mt-0.5 truncate">
                    By {att.user?.name || 'User'}
                  </span>
                </div>
              </div>

              <div className="flex gap-1 flex-shrink-0 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-200">
                <button
                  onClick={() => handleDownload(att.id)}
                  className="w-8 h-8 flex items-center justify-center text-[12px] font-bold text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-lg transition-colors"
                  title="Download File"
                >
                  ↓
                </button>
                {hasFullAccess(att) && (
                  <>
                    <button
                      onClick={() => handleRename(att.id, att.filename)}
                      className="w-8 h-8 flex items-center justify-center text-[13px] font-bold text-amber-500 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-colors"
                      title="Rename File"
                    >
                      ✎
                    </button>
                    <button
                      onClick={() => handleDelete(att.id)}
                      className="w-8 h-8 flex items-center justify-center text-[12px] font-bold text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Delete File"
                    >
                      ✕
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
