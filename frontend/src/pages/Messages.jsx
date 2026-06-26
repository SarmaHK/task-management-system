import { useState, useEffect, useRef } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import projectService from '../services/projectService';
import api from '../services/api';
import { getSocket } from '../services/socket';

export default function Messages() {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [activeProject, setActiveProject] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await projectService.getAllProjects();
        if (res.success) {
          setProjects(res.data);
          if (res.data.length > 0) {
            setActiveProject(res.data[0]);
          }
        }
      } catch (error) {
        console.error('Error fetching projects:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  useEffect(() => {
    if (!activeProject) return;

    const fetchMessages = async () => {
      try {
        const res = await api.get(`/messages/${activeProject.id}`);
        if (res.data.success) {
          setMessages(res.data.data);
          scrollToBottom();
        }
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    };

    fetchMessages();

    const socket = getSocket();
    if (socket) {
      socket.emit('joinProject', activeProject.id);

      const handleReceiveMessage = (msg) => {
        setMessages((prev) => [...prev, msg]);
        scrollToBottom();
      };

      socket.on('receiveMessage', handleReceiveMessage);

      return () => {
        socket.emit('leaveProject', activeProject.id);
        socket.off('receiveMessage', handleReceiveMessage);
      };
    }
  }, [activeProject]);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeProject) return;

    const socket = getSocket();
    if (socket) {
      socket.emit('sendMessage', {
        projectId: activeProject.id,
        content: newMessage.trim(),
      });
      setNewMessage('');
    }
  };

  return (
    <DashboardLayout>
      <div className="flex h-[calc(100vh-8rem)] bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden animate-fadeUp">
        
        {/* Left Sidebar - Projects List */}
        <div className="w-1/3 max-w-sm border-r border-gray-200 bg-gray-50 flex flex-col">
          <div className="p-4 border-b border-gray-200 bg-white">
            <h2 className="text-lg font-bold text-gray-900">Project Chats</h2>
            <p className="text-xs text-gray-500 mt-1">Select a project to start messaging</p>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {loading ? (
              <div className="p-4 text-center text-sm text-gray-500">Loading projects...</div>
            ) : projects.length === 0 ? (
              <div className="p-4 text-center text-sm text-gray-500">You don't have any projects yet.</div>
            ) : (
              projects.map(project => (
                <button
                  key={project.id}
                  onClick={() => setActiveProject(project)}
                  className={`w-full text-left p-3 rounded-xl transition-colors flex items-center gap-3 ${
                    activeProject?.id === project.id 
                      ? 'bg-[#E6F5F6] border border-[#BEE3E6] shadow-sm' 
                      : 'hover:bg-gray-100 border border-transparent'
                  }`}
                >
                  <div className="w-10 h-10 rounded-lg bg-[#BEE3E6] flex items-center justify-center text-[#118B95] font-bold shrink-0">
                    {project.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div className="overflow-hidden">
                    <h3 className={`text-sm font-semibold truncate ${activeProject?.id === project.id ? 'text-[#0D5A60]' : 'text-gray-900'}`}>
                      {project.name}
                    </h3>
                    <p className="text-xs text-gray-500 truncate">Project Team</p>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Right Area - Chat Window */}
        <div className="flex-1 flex flex-col bg-white">
          {activeProject ? (
            <>
              {/* Chat Header */}
              <div className="h-16 px-6 border-b border-gray-200 flex items-center justify-between bg-white shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#BEE3E6] flex items-center justify-center text-[#118B95] font-bold">
                    {activeProject.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-gray-900">{activeProject.name}</h2>
                    <p className="text-xs text-gray-500">Team Members</p>
                  </div>
                </div>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50/30">
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-gray-400">
                    <svg className="w-12 h-12 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <p className="text-sm font-medium">No messages yet.</p>
                    <p className="text-xs">Start the conversation!</p>
                  </div>
                ) : (
                  messages.map((msg, index) => {
                    const isMine = msg.sender?.id === user.id;
                    const senderInitial = (msg.sender?.name || 'U').charAt(0).toUpperCase();
                    
                    return (
                      <div key={index} className={`flex gap-3 ${isMine ? 'flex-row-reverse' : ''}`}>
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#0D5A60] to-[#2AA7B3] flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-sm">
                          {senderInitial}
                        </div>
                        <div className={`flex flex-col ${isMine ? 'items-end' : 'items-start'} max-w-[70%]`}>
                          {!isMine && (
                            <span className="text-xs font-medium text-gray-500 mb-1 ml-1">{msg.sender?.name}</span>
                          )}
                          <div className={`px-4 py-2.5 rounded-2xl ${
                            isMine 
                              ? 'bg-[#118B95] text-white rounded-tr-sm' 
                              : 'bg-white border border-gray-100 shadow-sm text-gray-900 rounded-tl-sm'
                          }`}>
                            <p className="text-sm leading-relaxed">{msg.content}</p>
                          </div>
                          <span className="text-[10px] text-gray-400 mt-1">
                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input */}
              <div className="p-4 bg-white border-t border-gray-200 shrink-0">
                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-[#118B95] focus:border-[#118B95] block px-4 py-3 outline-none"
                  />
                  <button
                    type="submit"
                    disabled={!newMessage.trim()}
                    className="px-6 py-3 bg-[#118B95] text-white font-semibold rounded-xl hover:bg-[#0D5A60] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <span>Send</span>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
              <svg className="w-16 h-16 mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <h3 className="text-lg font-semibold text-gray-600 mb-1">Your Messages</h3>
              <p className="text-sm">Select a project chat from the sidebar to view messages.</p>
            </div>
          )}
        </div>

      </div>
    </DashboardLayout>
  );
}
