import { useState, useEffect } from 'react';
import commentService from '../../services/commentService';
import { useAuth } from '../../context/AuthContext';

export default function CommentSection({ taskId }) {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingContent, setEditingContent] = useState('');

  const fetchComments = async () => {
    try {
      setLoading(true);
      const res = await commentService.getCommentsForTask(taskId);
      if (res.success) {
        setComments(res.data);
      }
    } catch (err) {
      console.error('Error fetching comments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [taskId]);

  const handleSendComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const res = await commentService.addComment(taskId, newComment);
      if (res.success) {
        setNewComment('');
        fetchComments();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add comment');
    }
  };

  const handleUpdateComment = async (commentId) => {
    if (!editingContent.trim()) return;
    try {
      const res = await commentService.updateComment(commentId, editingContent);
      if (res.success) {
        setEditingCommentId(null);
        setEditingContent('');
        fetchComments();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update comment');
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;
    try {
      const res = await commentService.deleteComment(commentId);
      if (res.success) {
        fetchComments();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete comment');
    }
  };

  const isAllowedToDelete = (comment) => {
    return (
      comment.userId === user?.id ||
      user?.role === 'Project Manager' ||
      user?.role === 'Administrator'
    );
  };

  const isAllowedToEdit = (comment) => {
    return comment.userId === user?.id || user?.role === 'Administrator';
  };

  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-[16px] font-bold text-indigo-950 border-b border-gray-50 pb-2">
        💬 Discussion Thread
      </h3>

      {/* New comment input */}
      <form onSubmit={handleSendComment} className="flex gap-2">
        <input
          type="text"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Write a comment..."
          className="flex-1 border border-gray-200 rounded-xl px-4 py-2 text-[13.5px] focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[13px] rounded-xl cursor-pointer"
        >
          Send
        </button>
      </form>

      {/* Comment list feed */}
      {loading ? (
        <div className="text-gray-400 text-[13px] py-4">Loading comments...</div>
      ) : comments.length === 0 ? (
        <div className="text-gray-400 text-[13px] py-4 italic">No comments yet. Start the conversation!</div>
      ) : (
        <div className="flex flex-col gap-3 max-h-80 overflow-y-auto pr-1">
          {comments.map((comment) => (
            <div key={comment.id} className="p-3 bg-gray-50/50 border border-gray-100 rounded-xl flex flex-col gap-1.5">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-[12px] font-extrabold text-indigo-950">{comment.user?.name}</span>
                  <span className="text-[10px] text-gray-400 font-semibold">
                    {new Date(comment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <div className="flex gap-2">
                  {isAllowedToEdit(comment) && editingCommentId !== comment.id && (
                    <button
                      onClick={() => {
                        setEditingCommentId(comment.id);
                        setEditingContent(comment.content);
                      }}
                      className="text-[10.5px] font-bold text-gray-400 hover:text-indigo-600"
                    >
                      Edit
                    </button>
                  )}
                  {isAllowedToDelete(comment) && (
                    <button
                      onClick={() => handleDeleteComment(comment.id)}
                      className="text-[10.5px] font-bold text-red-400 hover:text-red-600"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>

              {editingCommentId === comment.id ? (
                <div className="flex gap-2 mt-1">
                  <input
                    type="text"
                    value={editingContent}
                    onChange={(e) => setEditingContent(e.target.value)}
                    className="flex-1 border border-gray-200 rounded-lg px-2.5 py-1 text-[12.5px] focus:outline-none"
                  />
                  <button
                    onClick={() => handleUpdateComment(comment.id)}
                    className="px-2.5 py-1 bg-indigo-600 text-white rounded-lg text-[11px] font-bold"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditingCommentId(null)}
                    className="px-2.5 py-1 bg-gray-100 text-gray-600 rounded-lg text-[11px] font-bold"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <p className="text-[13px] text-gray-600 leading-relaxed break-words">{comment.content}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
