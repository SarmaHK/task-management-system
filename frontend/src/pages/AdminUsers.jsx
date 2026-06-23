import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import adminService from '../services/adminService';

export default function AdminUsers() {
  const location = useLocation();
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'active', 'deactivated'
  const [isLoading, setIsLoading] = useState(true);

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
      alert(error.response?.data?.message || 'Failed to update role.');
    }
  };

  const handleDeactivate = async (userId) => {
    if (!window.confirm('Are you sure you want to deactivate this user?')) return;

    try {
      const response = await adminService.deactivateUser(userId);
      if (response.success) {
        setUsers(users.map(u => u.id === userId ? { ...u, isActive: false } : u));
      }
    } catch (error) {
      console.error('Error deactivating user:', error);
      alert(error.response?.data?.message || 'Failed to deactivate user.');
    }
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

  const handleRejectRequest = async (requestId) => {
    if (!window.confirm('Are you sure you want to reject this access request?')) return;
    try {
      const response = await adminService.rejectRegistrationRequest(requestId);
      if (response.success) {
        setRequests(requests.filter(r => r.id !== requestId));
        alert('Access request rejected successfully.');
      }
    } catch (error) {
      console.error('Error rejecting request:', error);
      alert(error.response?.data?.message || 'Failed to reject access request.');
    }
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
      alert(error.response?.data?.message || 'Failed to approve access request.');
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
            <h1 className="text-[24px] font-bold text-indigo-950 tracking-tight">User Management</h1>
            <p className="text-[14px] text-gray-500 font-medium">View, search, and register system access roles.</p>
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
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-[14px] focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </form>

            {/* Filter Dropdown */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-white border border-gray-200 rounded-xl text-[14px] font-medium text-gray-600 focus:outline-none"
            >
              <option value="all">All Users</option>
              <option value="active">Active Only</option>
              <option value="deactivated">Deactivated Only</option>
            </select>

            {/* Add User Button */}
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-[14px] font-bold px-4 py-2 rounded-xl shadow-md shadow-indigo-200 transition-all cursor-pointer"
            >
              + Register User
            </button>
          </div>
        </div>

        {/* Tabs navigation */}
        <div className="flex border-b border-gray-100 mt-2">
          <button
            onClick={() => setActiveTab('users')}
            className={`py-3 px-6 font-bold text-[14px] border-b-2 transition-all cursor-pointer ${
              activeTab === 'users'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            👤 Active Users
          </button>
          <button
            onClick={() => setActiveTab('requests')}
            className={`py-3 px-6 font-bold text-[14px] border-b-2 transition-all cursor-pointer relative ${
              activeTab === 'requests'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            ✉️ Access Requests
            {requests.length > 0 && activeTab !== 'requests' && (
              <span className="ml-2 bg-rose-500 text-white rounded-full px-2 py-0.5 text-[10px] font-bold">
                {requests.length}
              </span>
            )}
          </button>
        </div>

        {activeTab === 'users' ? (
          /* Users Table Card */
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden mt-1">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/50 border-b border-gray-100 text-[11px] uppercase tracking-wider text-gray-400 font-bold">
                    <th className="px-6 py-4">User Details</th>
                    <th className="px-6 py-4">Role</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {isLoading ? (
                    <tr>
                      <td colSpan="4" className="px-6 py-12 text-center text-gray-400 text-[14px] font-medium">Loading users...</td>
                    </tr>
                  ) : users.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="px-6 py-12 text-center text-gray-400 text-[14px] font-medium">No users found.</td>
                    </tr>
                  ) : (
                    users.map((u) => (
                      <tr key={u.id} className="hover:bg-gray-50/30 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-bold text-indigo-950 text-[14px]">{u.name}</div>
                          <div className="text-gray-500 text-[13px]">{u.email}</div>
                        </td>
                        <td className="px-6 py-4">
                          <select
                            value={u.role.id}
                            onChange={(e) => handleRoleChange(u.id, parseInt(e.target.value))}
                            disabled={!u.isActive} 
                            className="text-[13px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-1 rounded-lg border border-indigo-100 cursor-pointer focus:outline-none disabled:opacity-50"
                          >
                            <option value={1}>Administrator</option>
                            <option value={2}>Project Manager</option>
                            <option value={3}>Collaborator</option>
                          </select>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`text-[12px] font-bold px-2.5 py-1 rounded-full border ${u.isActive ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'}`}>
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
                            <span className="text-[13px] font-bold text-gray-400">Deactivated</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* Access Requests Card */
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden mt-1 animate-fadeUp">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/50 border-b border-gray-100 text-[11px] uppercase tracking-wider text-gray-400 font-bold">
                    <th className="px-6 py-4">Requester Details</th>
                    <th className="px-6 py-4">Submitted Date</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {requestsLoading ? (
                    <tr>
                      <td colSpan="3" className="px-6 py-12 text-center text-gray-400 text-[14px] font-medium">Loading requests...</td>
                    </tr>
                  ) : requests.length === 0 ? (
                    <tr>
                      <td colSpan="3" className="px-6 py-12 text-center text-gray-400 text-[14px] font-medium">No pending access requests.</td>
                    </tr>
                  ) : (
                    requests.map((r) => (
                      <tr key={r.id} className="hover:bg-gray-50/30 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-bold text-indigo-950 text-[14px]">{r.name}</div>
                          <div className="text-gray-500 text-[13px]">{r.email}</div>
                        </td>
                        <td className="px-6 py-4 text-gray-500 text-[13px] font-medium">
                          {new Date(r.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })} @ {new Date(r.createdAt).toLocaleTimeString(undefined, { timeStyle: 'short' })}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2.5">
                            <button
                              onClick={() => openApproveModal(r)}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white text-[13px] font-bold px-3.5 py-1.5 rounded-xl cursor-pointer shadow-sm transition-all"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleRejectRequest(r.id)}
                              className="bg-rose-50 border border-rose-200 text-rose-600 hover:bg-rose-100 text-[13px] font-bold px-3.5 py-1.5 rounded-xl cursor-pointer transition-all"
                            >
                              Reject
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Create User Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden transform transition-all p-6 flex flex-col gap-4">
              
              <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                <h3 className="text-[18px] font-bold text-indigo-950">Register New User</h3>
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
                    <label className="text-[13px] font-bold text-indigo-950">Full Name</label>
                    <input
                      type="text"
                      placeholder="e.g. John Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="px-4 py-2 border border-gray-200 rounded-xl text-[14px] focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[13px] font-bold text-indigo-950">Email Address</label>
                    <input
                      type="email"
                      placeholder="e.g. john@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="px-4 py-2 border border-gray-200 rounded-xl text-[14px] focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[13px] font-bold text-indigo-950">System Role</label>
                    <select
                      value={roleId}
                      onChange={(e) => setRoleId(e.target.value)}
                      className="px-4 py-2 border border-gray-200 rounded-xl text-[14px] bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="3">Collaborator</option>
                      <option value="2">Project Manager</option>
                      <option value="1">Administrator</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full mt-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-bold py-2.5 rounded-xl shadow-md cursor-pointer transition-all"
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

                  <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 flex flex-col gap-2">
                    <div className="text-[12px] text-gray-400 font-bold uppercase">Account Details</div>
                    <div className="text-[13.5px]">
                      <span className="text-gray-500 font-medium">Name: </span>
                      <strong className="text-indigo-950">{createdCredentials.name}</strong>
                    </div>
                    <div className="text-[13.5px]">
                      <span className="text-gray-500 font-medium">Email: </span>
                      <strong className="text-indigo-950">{createdCredentials.email}</strong>
                    </div>
                    <div className="text-[13.5px] bg-indigo-50 border border-indigo-100 p-2.5 rounded-lg mt-1.5 flex justify-between items-center">
                      <div>
                        <span className="text-gray-500 text-[12px] block">Temporary Password:</span>
                        <code className="text-indigo-700 font-bold text-[14px]">{createdCredentials.tempPassword}</code>
                      </div>
                      <button 
                        onClick={() => {
                          navigator.clipboard.writeText(createdCredentials.tempPassword);
                          alert('Password copied to clipboard!');
                        }}
                        className="text-[12px] bg-white border border-indigo-200 text-indigo-700 font-bold px-2 py-1 rounded hover:bg-indigo-50 cursor-pointer"
                      >
                        Copy
                      </button>
                    </div>
                  </div>

                  <div className="text-[11.5px] text-gray-400 text-center leading-relaxed">
                    Note: An onboarding notification email copy containing these credentials has also been logged to the server logs.
                  </div>

                  <button
                    onClick={closeCreationModal}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-xl cursor-pointer"
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
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden transform transition-all p-6 flex flex-col gap-4">
              
              <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                <h3 className="text-[18px] font-bold text-indigo-950">Approve Access Request</h3>
                <button onClick={() => setApproveModalOpen(false)} className="text-gray-400 hover:text-gray-600 text-lg cursor-pointer">✕</button>
              </div>

              <div className="bg-indigo-50/50 border border-indigo-100 p-4 rounded-xl flex flex-col gap-1.5">
                <div className="text-[12.5px] text-gray-400 font-bold uppercase">Requester Info</div>
                <div className="text-[14px] text-indigo-950 font-bold">{requestToApprove.name}</div>
                <div className="text-[13px] text-gray-500">{requestToApprove.email}</div>
              </div>

              <form onSubmit={handleApproveConfirm} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[13px] font-bold text-indigo-950">Assign System Role</label>
                  <select
                    value={approveRoleId}
                    onChange={(e) => setApproveRoleId(e.target.value)}
                    className="px-4 py-2 border border-gray-200 rounded-xl text-[14px] bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-bold py-2.5 rounded-xl shadow-md transition-all cursor-pointer"
                  >
                    {isSubmitting ? 'Approving...' : 'Confirm Approval'}
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