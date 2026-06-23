import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import projectService from '../../services/projectService';
import adminService from '../../services/adminService';
import { useAuth } from '../../context/AuthContext';

export default function ProjectDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Member Form state
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedRole, setSelectedRole] = useState('COLLABORATOR');

  const fetchProjectData = async () => {
    try {
      setLoading(true);
      const res = await projectService.getProjectById(parseInt(id));
      if (res.success) {
        setProject(res.data.project);
        setAnalytics(res.data.analytics);
      }

      const tasksRes = await projectService.getProjectTasks(parseInt(id));
      if (tasksRes.success) {
        setTasks(tasksRes.data);
      }

      // If authorized, prefetch user list to allow adding members
      if (user?.role === 'Administrator' || res.data.project.ownerId === user?.id) {
        const usersRes = await adminService.getUsersList();
        if (usersRes.success) {
          setAllUsers(usersRes.data);
        }
      }
    } catch (err) {
      console.error('Error fetching project data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectData();
  }, [id]);

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!selectedUserId) return;

    try {
      const res = await projectService.addProjectMember(parseInt(id), {
        userId: parseInt(selectedUserId),
        role: selectedRole,
      });

      if (res.success) {
        setSelectedUserId('');
        setSelectedRole('COLLABORATOR');
        fetchProjectData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add project member');
    }
  };

  const handleRemoveMember = async (memberId) => {
    if (!window.confirm('Are you sure you want to remove this member from the project?')) return;
    try {
      const res = await projectService.removeProjectMember(parseInt(id), memberId);
      if (res.success) {
        fetchProjectData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to remove member');
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="text-center py-20 text-gray-400 font-medium text-[15px]">Loading workspace details...</div>
      </DashboardLayout>
    );
  }

  if (!project) {
    return (
      <DashboardLayout>
        <div className="text-center py-20 text-red-500 font-bold text-[15px]">Project not found.</div>
      </DashboardLayout>
    );
  }

  const isOwnerOrAdmin = user?.role === 'Administrator' || project.ownerId === user?.id;

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 flex flex-col gap-6 animate-fadeUp">
        
        {/* Breadcrumb Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <button 
              onClick={() => navigate('/projects')}
              className="text-[13px] font-bold text-indigo-600 hover:text-indigo-800 mb-1 flex items-center gap-1 cursor-pointer"
            >
              ← Back to workspaces
            </button>
            <h1 className="text-[26px] font-extrabold text-indigo-950 tracking-tight">{project.name}</h1>
            <p className="text-[14px] text-gray-500 font-medium max-w-xl">{project.description || 'No description.'}</p>
          </div>
          
          <div className="flex gap-3">
            {isOwnerOrAdmin && (
              <button
                onClick={() => navigate(`/tasks/create?projectId=${project.id}`)}
                className="px-4.5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[13.5px] rounded-xl cursor-pointer shadow-sm transition-all"
              >
                + Create Task
              </button>
            )}
          </div>
        </div>

        {/* Progress Metrics Panel */}
        {analytics && (
          <section className="grid grid-cols-2 lg:grid-cols-6 gap-4 mt-2">
            <div className="bg-white p-4 rounded-xl border border-indigo-50 shadow-sm text-center">
              <span className="text-gray-400 font-bold text-[11px] uppercase tracking-wider block">Total Tasks</span>
              <p className="text-[24px] font-extrabold text-indigo-950 mt-1">{analytics.totalTasks}</p>
            </div>
            <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100/50 text-center">
              <span className="text-emerald-700 font-bold text-[11px] uppercase tracking-wider block">Completed</span>
              <p className="text-[24px] font-extrabold text-emerald-800 mt-1">{analytics.completedTasks}</p>
            </div>
            <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100/50 text-center">
              <span className="text-indigo-700 font-bold text-[11px] uppercase tracking-wider block">In Progress</span>
              <p className="text-[24px] font-extrabold text-indigo-800 mt-1">{analytics.inProgressTasks}</p>
            </div>
            <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-100/50 text-center">
              <span className="text-amber-700 font-bold text-[11px] uppercase tracking-wider block">Pending</span>
              <p className="text-[24px] font-extrabold text-amber-800 mt-1">{analytics.pendingTasks}</p>
            </div>
            <div className="bg-rose-50/50 p-4 rounded-xl border border-rose-100/50 text-center">
              <span className="text-rose-700 font-bold text-[11px] uppercase tracking-wider block">Overdue ⚠️</span>
              <p className="text-[24px] font-extrabold text-rose-800 mt-1">{analytics.overdueTasks}</p>
            </div>
            <div className="bg-indigo-600 p-4 rounded-xl text-center text-white">
              <span className="text-indigo-200 font-bold text-[11px] uppercase tracking-wider block">Completed %</span>
              <p className="text-[24px] font-extrabold mt-1">{analytics.completionPercentage}%</p>
            </div>
          </section>
        )}

        {/* Project Layout Body */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start mt-2">
          
          {/* Main Tasks List */}
          <div className="lg:col-span-2 bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-50 flex items-center justify-between">
              <h3 className="text-[16px] font-bold text-indigo-950">Workspace Tasks</h3>
              <span className="text-[12px] text-gray-400 font-bold">{tasks.length} total</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100 text-[11px] uppercase tracking-wider text-gray-500 font-bold">
                    <th className="px-6 py-4">Task Details</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Priority</th>
                    <th className="px-6 py-4">Due Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {tasks.map((task) => (
                    <tr 
                      key={task.id} 
                      onClick={() => navigate(`/tasks/${task.id}`)}
                      className="hover:bg-gray-50/50 transition-colors cursor-pointer"
                    >
                      <td className="px-6 py-4">
                        <div className="font-bold text-indigo-950 text-[13.5px]">{task.title}</div>
                        <div className="text-gray-400 text-[12px] truncate max-w-xs">{task.description || 'No description.'}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          task.status === 'COMPLETED'
                            ? 'bg-emerald-50 text-emerald-700'
                            : task.status === 'IN_PROGRESS'
                            ? 'bg-indigo-50 text-indigo-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {task.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-[11px] font-bold ${
                          task.priority === 'HIGH'
                            ? 'text-rose-600'
                            : task.priority === 'MEDIUM'
                            ? 'text-indigo-600'
                            : 'text-gray-500'
                        }`}>
                          {task.priority}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-[12px] font-semibold text-gray-500">
                        {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No limit'}
                      </td>
                    </tr>
                  ))}

                  {tasks.length === 0 && (
                    <tr>
                      <td colSpan="4" className="px-6 py-12 text-center text-gray-400 font-semibold text-[14px]">
                        📝 No tasks created for this project workspace yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Members Sidebar Panel */}
          <div className="flex flex-col gap-6">
            
            {/* Project Members List */}
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 flex flex-col gap-4">
              <div className="border-b border-gray-50 pb-3 flex justify-between items-center">
                <h3 className="text-[15px] font-bold text-indigo-950">Project Members</h3>
                <span className="text-[12px] text-indigo-600 font-bold">({project.members.length})</span>
              </div>

              <div className="flex flex-col gap-3">
                {project.members.map((m) => (
                  <div key={m.id} className="flex justify-between items-center gap-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500/20 to-violet-500/20 text-indigo-700 font-bold text-[12px] flex items-center justify-center flex-shrink-0">
                        {m.user?.name?.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-[13px] font-bold text-indigo-950 truncate leading-snug">{m.user?.name}</p>
                        <span className="text-[10px] text-indigo-500 font-bold uppercase tracking-wider block">
                          {m.role}
                        </span>
                      </div>
                    </div>

                    {isOwnerOrAdmin && m.userId !== project.ownerId && (
                      <button
                        onClick={() => handleRemoveMember(m.id)}
                        className="text-[11px] font-bold text-red-500 hover:text-red-700 p-1 cursor-pointer"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Add Member Form (Admins & Owners only) */}
              {isOwnerOrAdmin && (
                <form onSubmit={handleAddMember} className="border-t border-gray-50 pt-4 flex flex-col gap-3">
                  <h4 className="text-[13px] font-bold text-indigo-950">Link Team Member</h4>
                  
                  <div>
                    <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Select User</label>
                    <select
                      required
                      value={selectedUserId}
                      onChange={(e) => setSelectedUserId(e.target.value)}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                    >
                      <option value="">-- Choose User --</option>
                      {allUsers
                        .filter(u => !project.members.some(pm => pm.userId === u.id))
                        .map(u => (
                          <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                        ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Project Role</label>
                    <select
                      value={selectedRole}
                      onChange={(e) => setSelectedRole(e.target.value)}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                    >
                      <option value="COLLABORATOR">Collaborator</option>
                      <option value="PROJECT_MANAGER">Project Manager</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-[12px] font-bold cursor-pointer"
                  >
                    + Add to Workspace
                  </button>
                </form>
              )}
            </div>

          </div>

        </div>

      </div>
    </DashboardLayout>
  );
}
