import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import adminService from '../services/adminService';
import { useToast } from '../utils/ToastContext';
import ConfirmModal from '../components/ConfirmModal';

export default function AdminUsers() {
  const location = useLocation();
  const toast = useToast();
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'active', 'deactivated'
  const [isLoading, setIsLoading] = useState(true);

  // Generic Confirm Modal State
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Confirm',
    isDestructive: false,
    onConfirm: () => {}
  });

  // Access Requests and Logging States
  const [activeTab, setActiveTab] = useState(() => {
    const params = new URLSearchParams(location.search);
    return params.get('tab') === 'requests' ? 'requests' : 'users';
  });

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    if (tab === 'requests' || tab === 'users') {
      setActiveTab(tab);
    }
  }, [location.search]);

  const [requests, setRequests] = useState([]);
  const [requestsLoading, setRequestsLoading] = useState(false);
  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [requestToApprove, setRequestToApprove] = useState(null);
  const [approveRoleId, setApproveRoleId] = useState('3'); // Default Collaborator

  // Modal State for user creation
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [roleId, setRoleId] = useState('3'); // Default to Collaborator (3)
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdCredentials, setCreatedCredentials] = useState(null); // { name, email, tempPassword }

  // Load users list
  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const activeFilter = statusFilter === 'all' ? null : statusFilter === 'active';
      const data = await adminService.getUsersList(searchTerm, activeFilter);
      if (data.success) {
        setUsers(data.data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Load access requests list
  const fetchRequests = async () => {
    setRequestsLoading(true);
    try {
      const data = await adminService.getRegistrationRequests();
      if (data.success) {
        setRequests(data.data.filter(r => r.status === 'PENDING'));
      }
    } catch (error) {
      console.error('Error fetching registration requests:', error);
    } finally {
      setRequestsLoading(false);
    }
  };

  // Run on tab changes & filter changes
  useEffect(() => {
    if (activeTab === 'requests') {
      fetchRequests();
    } else {
      fetchUsers();
    }
  }, [activeTab, statusFilter]);

  // Sync request counts badge on mount
  useEffect(() => {
    const loadRequestsBadge = async () => {
      try {
        const data = await adminService.getRegistrationRequests();
        if (data.success) {
          setRequests(data.data.filter(r => r.status === 'PENDING'));
        }
      } catch (err) {
        console.error(err);
      }
    };
    loadRequestsBadge();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchUsers();
  };

  const handleRoleChange = async (userId, newRoleId) => {
    try {
      const response = await adminService.updateUserRole(userId, newRoleId);
      if (response.success) {
        setUsers(users.map(u => 
          u.id === userId 
            ? { ...u, role: { ...u.role, id: newRoleId, name: newRoleId === 1 ? 'ADMIN' : newRoleId === 2 ? 'PROJECT_MANAGER' : 'COLLABORATOR' } } 
            : u
        ));
      }
    } catch (error) {
      console.error('Error updating role:', error);
      toast.error(error.response?.data?.message || 'Failed to update role.');
    }
  };

  const handleDeactivate = (userId) => {
    setConfirmModal({
      isOpen: true,
      title: 'Deactivate User',
      message: 'Are you sure you want to deactivate this user?',
      confirmText: 'Deactivate',
      isDestructive: true,
      onConfirm: async () => {
        try {
          const response = await adminService.deactivateUser(userId);
          if (response.success) {
            setUsers(prev => prev.map(u => u.id === userId ? { ...u, isActive: false } : u));
          }
        } catch (error) {
          console.error('Error deactivating user:', error);
          toast.error(error.response?.data?.message || 'Failed to deactivate user.');
        } finally {
          setConfirmModal(prev => ({ ...prev, isOpen: false }));
        }
      }
    });
  };

  const handleActivate = (userId) => {
    setConfirmModal({
      isOpen: true,
      title: 'Activate User',
      message: 'Are you sure you want to activate this user?',
      confirmText: 'Activate',
      isDestructive: false,
      onConfirm: async () => {
        try {
          const response = await adminService.activateUser(userId);
          if (response.success) {
            setUsers(prev => prev.map(u => u.id === userId ? { ...u, isActive: true } : u));
          }
        } catch (error) {
          console.error('Error activating user:', error);
          toast.error(error.response?.data?.message || 'Failed to activate user.');
        } finally {
          setConfirmModal(prev => ({ ...prev, isOpen: false }));
        }
      }
    });
  };

  const handleDelete = (userId) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete User',
      message: 'Are you sure you want to permanently delete this user? This action cannot be undone.',
      confirmText: 'Delete',
      isDestructive: true,
      onConfirm: async () => {
        try {
          const response = await adminService.deleteUser(userId);
          if (response.success) {
            setUsers(prev => prev.filter(u => u.id !== userId));
          }
        } catch (error) {
          console.error('Error deleting user:', error);
          toast.error(error.response?.data?.message || 'Failed to delete user.');
        } finally {
          setConfirmModal(prev => ({ ...prev, isOpen: false }));
        }
      }
    });
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setFormError('');
    setIsSubmitting(true);

    if (!name.trim() || !email.trim()) {
      setFormError('Name and email are required');
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await adminService.createUserByAdmin({
        name: name.trim(),
        email: email.trim(),
        roleId: parseInt(roleId)
      });

      if (response.success) {
        setCreatedCredentials({
          name: response.data.name,
          email: response.data.email,
          tempPassword: response.data.tempPassword
        });
        // Clear form
        setName('');
        setEmail('');
        setRoleId('3');
        // Refresh list
        fetchUsers();
      }
    } catch (error) {
      console.error('Error creating user:', error);
      setFormError(error.response?.data?.message || 'Failed to create user');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRejectRequest = (requestId) => {
    setConfirmModal({
      isOpen: true,
      title: 'Reject Request',
      message: 'Are you sure you want to reject this access request?',
      confirmText: 'Reject',
      isDestructive: true,
      onConfirm: async () => {
        try {
          const response = await adminService.rejectRegistrationRequest(requestId);
          if (response.success) {
            setRequests(prev => prev.filter(r => r.id !== requestId));
            toast.success('Access request rejected successfully.');
          }
        } catch (error) {
          console.error('Error rejecting request:', error);
          toast.error(error.response?.data?.message || 'Failed to reject access request.');
        } finally {
          setConfirmModal(prev => ({ ...prev, isOpen: false }));
        }
      }
    });
  };

  const openApproveModal = (req) => {
    setRequestToApprove(req);
    setApproveRoleId('3');
    setApproveModalOpen(true);
  };

  const handleApproveConfirm = async (e) => {
    e.preventDefault();
    if (!requestToApprove) return;
    setIsSubmitting(true);
    try {
      const response = await adminService.approveRegistrationRequest(requestToApprove.id, parseInt(approveRoleId));
      if (response.success) {
        setCreatedCredentials({
          name: response.data.name,
          email: response.data.email,
          tempPassword: response.data.tempPassword
        });
        setRequests(requests.filter(r => r.id !== requestToApprove.id));
        setApproveModalOpen(false);
        setIsModalOpen(true); // Open the credentials modal to show the temp password!
      }
    } catch (error) {
      console.error('Error approving request:', error);
      toast.error(error.response?.data?.message || 'Failed to approve access request.');
    } finally {
      setIsSubmitting(false);
      setRequestToApprove(null);
    }
  };

  const closeCreationModal = () => {
    setIsModalOpen(false);
    setCreatedCredentials(null);
    setFormError('');
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 flex flex-col gap-6">
        
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-[24px] font-bold text-indigo-950 dark:text-white tracking-tight">User Management</h1>
            <p className="text-[14px] text-gray-500 dark:text-slate-400 font-medium">View, search, and register system access roles.</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            {/* Search Bar Form */}
            <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-60">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                🔍
              </span>
              <input
                type="text"
                placeholder="Search name/email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-[14px] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#118B95] focus:border-transparent transition-colors"
              />
            </form>

            {/* Filter Dropdown */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-[14px] font-medium text-gray-600 dark:text-slate-300 focus:outline-none transition-colors"
            >
              <option value="all">All Users</option>
              <option value="active">Active Only</option>
              <option value="deactivated">Deactivated Only</option>
            </select>

            {/* Add User Button */}
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-[#118B95] hover:bg-[#0D5A60] text-white text-[14px] font-bold px-4 py-2 rounded-xl shadow-md shadow-indigo-200 transition-all cursor-pointer"
            >
              + Register User
            </button>
          </div>
        </div>

        {/* Users Table Card */}
        <div className="bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-2xl shadow-sm overflow-hidden mt-1 transition-colors">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 dark:bg-slate-900/50 border-b border-gray-100 dark:border-slate-700 text-[11px] uppercase tracking-wider text-gray-400 dark:text-slate-500 font-bold">
                  <th className="px-6 py-4">User Details</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-slate-700/50">
                {isLoading ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-12 text-center text-gray-400 text-[14px] font-medium">Loading users...</td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-12 text-center text-gray-400 dark:text-slate-500 text-[14px] font-medium">No users found.</td>
                  </tr>
                ) : (
                  users.map((u) => (
                    <tr key={u.id} className="hover:bg-gray-50/30 dark:hover:bg-slate-700/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-indigo-950 dark:text-white text-[14px]">{u.name}</div>
                        <div className="text-gray-500 dark:text-slate-400 text-[13px]">{u.email}</div>
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={u.role.id}
                          onChange={(e) => handleRoleChange(u.id, parseInt(e.target.value))}
                          disabled={!u.isActive} 
                          className="text-[13px] font-semibold text-[#0D5A60] dark:text-[#2AA7B3] bg-[#E6F5F6] dark:bg-[#118B95]/10 px-2 py-1 rounded-lg border border-indigo-100 dark:border-[#118B95]/30 cursor-pointer focus:outline-none disabled:opacity-50"
                        >
                          <option value={1}>Administrator</option>
                          <option value={2}>Project Manager</option>
                          <option value={3}>Collaborator</option>
                        </select>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-[12px] font-bold px-2.5 py-1 rounded-full border ${u.isActive ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800' : 'bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800'}`}>
                          {u.isActive ? 'Active' : 'Deactivated'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {u.isActive ? (
                          <button 
                            onClick={() => handleDeactivate(u.id)}
                            className="text-[13px] font-bold text-rose-600 hover:text-rose-800 transition-colors cursor-pointer"
                          >
                            Deactivate
                          </button>
                        ) : (
                          <div className="flex items-center justify-end gap-3">
                            <button 
                              onClick={() => handleActivate(u.id)}
                              className="text-[13px] font-bold text-emerald-600 hover:text-emerald-800 transition-colors cursor-pointer"
                            >
                              Activate
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Create User Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-all duration-300">
            <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden transform transition-all p-6 flex flex-col gap-4">
              
              <div className="flex justify-between items-center border-b border-gray-100 dark:border-slate-700 pb-3">
                <h3 className="text-[18px] font-bold text-indigo-950 dark:text-white">Register New User</h3>
                <button onClick={closeCreationModal} className="text-gray-400 hover:text-gray-600 text-lg cursor-pointer">✕</button>
              </div>

              {!createdCredentials ? (
                // Form View
                <form onSubmit={handleCreateUser} className="flex flex-col gap-4">
                  {formError && (
                    <div className="bg-rose-50 border border-rose-200 text-rose-700 text-[13px] p-3 rounded-xl font-medium">
                      {formError}
                    </div>
                  )}

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[13px] font-bold text-indigo-950 dark:text-slate-300">Full Name</label>
                    <input
                      type="text"
                      placeholder="e.g. John Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="px-4 py-2 bg-white dark:bg-slate-900/50 border border-gray-200 dark:border-slate-700 rounded-xl text-[14px] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#118B95]"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[13px] font-bold text-indigo-950 dark:text-slate-300">Email Address</label>
                    <input
                      type="email"
                      placeholder="e.g. john@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="px-4 py-2 bg-white dark:bg-slate-900/50 border border-gray-200 dark:border-slate-700 rounded-xl text-[14px] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#118B95]"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[13px] font-bold text-indigo-950 dark:text-slate-300">System Role</label>
                    <select
                      value={roleId}
                      onChange={(e) => setRoleId(e.target.value)}
                      className="px-4 py-2 bg-white dark:bg-slate-900/50 border border-gray-200 dark:border-slate-700 rounded-xl text-[14px] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#118B95]"
                    >
                      <option value="3">Collaborator</option>
                      <option value="2">Project Manager</option>
                      <option value="1">Administrator</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full mt-2 bg-[#118B95] hover:bg-[#0D5A60] disabled:bg-[#93CFD4] text-white font-bold py-2.5 rounded-xl shadow-md cursor-pointer transition-all"
                  >
                    {isSubmitting ? 'Registering...' : 'Register Account'}
                  </button>
                </form>
              ) : (
                // Success Credentials View
                <div className="flex flex-col gap-4 py-2">
                  <div className="bg-emerald-50 border border-emerald-100 text-emerald-800 text-[13.5px] p-4 rounded-xl font-medium">
                    🎉 Account successfully registered! The user has been added to the system database.
                  </div>

                  <div className="bg-gray-50 dark:bg-slate-900/50 border border-gray-100 dark:border-slate-700 rounded-xl p-4 flex flex-col gap-2">
                    <div className="text-[12px] text-gray-400 dark:text-slate-500 font-bold uppercase">Account Details</div>
                    <div className="text-[13.5px]">
                      <span className="text-gray-500 dark:text-slate-400 font-medium">Name: </span>
                      <strong className="text-indigo-950 dark:text-white">{createdCredentials.name}</strong>
                    </div>
                    <div className="text-[13.5px]">
                      <span className="text-gray-500 dark:text-slate-400 font-medium">Email: </span>
                      <strong className="text-indigo-950 dark:text-white">{createdCredentials.email}</strong>
                    </div>
                  </div>

                  <div className="text-[11.5px] text-gray-400 text-center leading-relaxed">
                    Note: An onboarding email has been sent to the user with their login details and temporary password.
                  </div>

                  <button
                    onClick={closeCreationModal}
                    className="w-full bg-[#118B95] hover:bg-[#0D5A60] text-white font-bold py-2.5 rounded-xl cursor-pointer"
                  >
                    Done
                  </button>
                </div>
              )}

            </div>
          </div>
        )}

        {/* Approve Access Request Modal */}
        {approveModalOpen && requestToApprove && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-all duration-300">
            <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden transform transition-all p-6 flex flex-col gap-4">
              
              <div className="flex justify-between items-center border-b border-gray-100 dark:border-slate-700 pb-3">
                <h3 className="text-[18px] font-bold text-indigo-950 dark:text-white">Approve Access Request</h3>
                <button onClick={() => setApproveModalOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-lg cursor-pointer">✕</button>
              </div>

              <div className="bg-[#E6F5F6]/50 dark:bg-slate-900/50 border border-indigo-100 dark:border-slate-700 p-4 rounded-xl flex flex-col gap-1.5">
                <div className="text-[12.5px] text-gray-400 dark:text-slate-500 font-bold uppercase">Requester Info</div>
                <div className="text-[14px] text-indigo-950 dark:text-white font-bold">{requestToApprove.name}</div>
                <div className="text-[13px] text-gray-500 dark:text-slate-400">{requestToApprove.email}</div>
              </div>

              <form onSubmit={handleApproveConfirm} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[13px] font-bold text-indigo-950 dark:text-slate-300">Assign System Role</label>
                  <select
                    value={approveRoleId}
                    onChange={(e) => setApproveRoleId(e.target.value)}
                    className="px-4 py-2 bg-white dark:bg-slate-900/50 border border-gray-200 dark:border-slate-700 rounded-xl text-[14px] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#118B95]"
                  >
                    <option value="3">Collaborator</option>
                    <option value="2">Project Manager</option>
                    <option value="1">Administrator</option>
                  </select>
                </div>

                <div className="flex gap-3 mt-2">
                  <button
                    type="button"
                    onClick={() => setApproveModalOpen(false)}
                    className="flex-1 border border-gray-200 hover:bg-gray-50 text-gray-600 font-bold py-2.5 rounded-xl transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 bg-[#118B95] hover:bg-[#0D5A60] disabled:bg-[#93CFD4] text-white font-bold py-2.5 rounded-xl shadow-md transition-all cursor-pointer"
                  >
                    {isSubmitting ? 'Approving...' : 'Confirm Approval'}
                  </button>
                </div>
              </form>

            </div>
          </div>
        )}

      </div>
      
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText={confirmModal.confirmText}
        isDestructive={confirmModal.isDestructive}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
      />
    </DashboardLayout>
  );
}