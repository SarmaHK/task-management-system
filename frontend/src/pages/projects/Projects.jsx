import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import projectService from '../../services/projectService';
import { useAuth } from '../../context/AuthContext';

export default function Projects() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  // Form states
  const [projectName, setProjectName] = useState('');
  const [projectDesc, setProjectDesc] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedProject, setSelectedProject] = useState(null);
  const [editStatus, setEditStatus] = useState('ACTIVE');

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const res = await projectService.getAllProjects();
      if (res.success) {
        setProjects(res.data);
      }
    } catch (err) {
      console.error('Error fetching projects:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!projectName.trim()) return;

    try {
      const res = await projectService.createProject({
        name: projectName,
        description: projectDesc,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      });

      if (res.success) {
        setShowCreateModal(false);
        setProjectName('');
        setProjectDesc('');
        setStartDate('');
        setEndDate('');
        fetchProjects();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create project');
    }
  };

  const handleEditProject = async (e) => {
    e.preventDefault();
    if (!selectedProject || !projectName.trim()) return;

    try {
      const res = await projectService.updateProject(selectedProject.id, {
        name: projectName,
        description: projectDesc,
        status: editStatus,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      });

      if (res.success) {
        setShowEditModal(false);
        setSelectedProject(null);
        setProjectName('');
        setProjectDesc('');
        setStartDate('');
        setEndDate('');
        fetchProjects();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update project');
    }
  };

  const handleDeleteProject = async (id) => {
    if (!window.confirm('Are you sure you want to delete this project? This will soft delete the project.')) return;
    try {
      const res = await projectService.deleteProject(id);
      if (res.success) {
        fetchProjects();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete project');
    }
  };

  const openEditModal = (proj) => {
    setSelectedProject(proj);
    setProjectName(proj.name);
    setProjectDesc(proj.description || '');
    setStartDate(proj.startDate ? proj.startDate.split('T')[0] : '');
    setEndDate(proj.endDate ? proj.endDate.split('T')[0] : '');
    setEditStatus(proj.status);
    setShowEditModal(true);
  };

  const isAllowedToManage = (proj) => {
    return user?.role === 'Administrator' || proj.ownerId === user?.id;
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 flex flex-col gap-6 animate-fadeUp">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-[24px] font-bold text-indigo-950 tracking-tight">Project Workspaces</h1>
            <p className="text-[14px] text-gray-500 font-medium">Manage and collaborate across multiple projects.</p>
          </div>
          {(user?.role === 'Administrator' || user?.role === 'Project Manager') && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4.5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[13.5px] rounded-xl cursor-pointer shadow-sm transition-all"
            >
              🆕 Create Project
            </button>
          )}
        </div>

        {/* Project list */}
        {loading ? (
          <div className="text-center py-20 text-gray-400 font-medium text-[15px]">Loading project list...</div>
        ) : projects.length === 0 ? (
          <div className="text-center py-20 bg-white border border-gray-100 rounded-2xl shadow-sm text-gray-400 font-semibold text-[15px]">
            📁 No projects found. Get started by creating a project workspace!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((proj) => (
              <div
                key={proj.id}
                className="bg-white border border-indigo-50/80 hover:border-indigo-100 rounded-2xl p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-all duration-200"
              >
                <div>
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <span
                      className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border uppercase tracking-wider ${
                        proj.status === 'ACTIVE'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                          : proj.status === 'COMPLETED'
                          ? 'bg-blue-50 text-blue-700 border-blue-100'
                          : 'bg-amber-50 text-amber-700 border-amber-100'
                      }`}
                    >
                      {proj.status}
                    </span>
                    <span className="text-[11px] text-gray-400 font-semibold">
                      Created by {proj.owner?.name || 'User'}
                    </span>
                  </div>
                  <h3 className="text-[17px] font-extrabold text-indigo-950 truncate mb-1.5">{proj.name}</h3>
                  <p className="text-[13px] text-gray-500 line-clamp-3 leading-relaxed mb-4">
                    {proj.description || 'No description provided.'}
                  </p>
                </div>

                <div className="pt-4 border-t border-gray-50 flex items-center justify-between">
                  <button
                    onClick={() => navigate(`/projects/${proj.id}`)}
                    className="text-[13px] font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
                  >
                    View Details ➜
                  </button>

                  {isAllowedToManage(proj) && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEditModal(proj)}
                        className="text-[12px] font-bold text-gray-500 hover:text-gray-700 hover:bg-gray-50 px-2 py-1 rounded"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteProject(proj.id)}
                        className="text-[12px] font-bold text-red-500 hover:text-red-700 hover:bg-red-50 px-2 py-1 rounded"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create Project Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl p-6 flex flex-col gap-5 animate-fadeUp">
              <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                <h3 className="text-[18px] font-bold text-indigo-950">Create New Project</h3>
                <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
              </div>

              <form onSubmit={handleCreateProject} className="flex flex-col gap-4">
                <div>
                  <label className="text-[12px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Project Name *</label>
                  <input
                    type="text"
                    required
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    placeholder="Enter project name..."
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-[14px] focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-[12px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Description</label>
                  <textarea
                    rows={3}
                    value={projectDesc}
                    onChange={(e) => setProjectDesc(e.target.value)}
                    placeholder="Enter project description..."
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-[14px] focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[12px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Start Date</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-[14px] focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="text-[12px] font-bold text-gray-400 uppercase tracking-wider block mb-1">End Date</label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-[14px] focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 bg-gray-50 border border-gray-200 text-gray-600 rounded-lg text-[13px] font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[13px] font-bold"
                  >
                    Create Workspace
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Project Modal */}
        {showEditModal && (
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl p-6 flex flex-col gap-5 animate-fadeUp">
              <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                <h3 className="text-[18px] font-bold text-indigo-950">Edit Project Settings</h3>
                <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
              </div>

              <form onSubmit={handleEditProject} className="flex flex-col gap-4">
                <div>
                  <label className="text-[12px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Project Name *</label>
                  <input
                    type="text"
                    required
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-[14px] focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-[12px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Description</label>
                  <textarea
                    rows={3}
                    value={projectDesc}
                    onChange={(e) => setProjectDesc(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-[14px] focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-1">
                    <label className="text-[12px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Status</label>
                    <select
                      value={editStatus}
                      onChange={(e) => setEditStatus(e.target.value)}
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-[14px] focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="ACTIVE">ACTIVE</option>
                      <option value="COMPLETED">COMPLETED</option>
                      <option value="ARCHIVED">ARCHIVED</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[12px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Start Date</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-[14px] focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="text-[12px] font-bold text-gray-400 uppercase tracking-wider block mb-1">End Date</label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-[14px] focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="px-4 py-2 bg-gray-50 border border-gray-200 text-gray-600 rounded-lg text-[13px] font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[13px] font-bold"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
