import { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';

export default function AdminUsers() {
  // State for our UI
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Function to change a user's role via backend API
  const handleRoleChange = async (userId, newRoleId) => {
    try {
      const token = localStorage.getItem('token'); 
      
      const response = await fetch(`http://localhost:5000/api/admin/users/${userId}/role`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ roleId: newRoleId })
      });

      if (response.ok) {
        setUsers(users.map(u => u.id === userId ? { ...u, role: newRoleId === 1 ? 'Administrator' : newRoleId === 2 ? 'Project Manager' : 'Collaborator' } : u));
        alert('Role updated successfully!');
      } else {
        alert('Failed to update role. Are you sure you are an Admin?');
      }
    } catch (error) {
      console.error('Error updating role:', error);
    }
  };

  // Function to deactivate a user via backend API
  const handleDeactivate = async (userId) => {
    if (!window.confirm('Are you sure you want to deactivate this user?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/admin/users/${userId}/deactivate`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setUsers(users.map(u => u.id === userId ? { ...u, isActive: false } : u));
      } else {
        alert('Failed to deactivate user.');
      }
    } catch (error) {
      console.error('Error deactivating user:', error);
    }
  };

  // Simulating the initial data fetch 
  useEffect(() => {
    setTimeout(() => {
      setUsers([
        { id: 1, name: 'Admin User', email: 'admin@taskflow.com', role: 'Administrator', isActive: true },
        { id: 2, name: 'Test User', email: 'test@taskflow.com', role: 'Collaborator', isActive: true }
      ]);
      setIsLoading(false);
    }, 500);
  }, []);

  // Filter users based on what is typed in the search bar
  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 flex flex-col gap-6">
        
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-[24px] font-bold text-indigo-950 tracking-tight">User Management</h1>
            <p className="text-[14px] text-gray-500 font-medium">View, search, and manage system access roles.</p>
          </div>
          
          {/* Search Bar */}
          <div className="relative w-full sm:w-72">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
              🔍
            </span>
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-[14px] focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Users Table Card */}
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden mt-2">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-[12px] uppercase tracking-wider text-gray-500 font-bold">
                  <th className="px-6 py-4">User Details</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {isLoading ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-8 text-center text-gray-400 text-[14px]">Loading users...</td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-indigo-950 text-[14px]">{u.name}</div>
                        <div className="text-gray-500 text-[13px]">{u.email}</div>
                      </td>
                      <td className="px-6 py-4">
                        {/* Interactive Role Dropdown */}
                        <select
                          value={u.role === 'Administrator' ? 1 : u.role === 'Project Manager' ? 2 : 3}
                          onChange={(e) => handleRoleChange(u.id, parseInt(e.target.value))}
                          disabled={!u.isActive} 
                          className="text-[13px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-1 rounded-lg border border-indigo-100 cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
                        >
                          <option value={1}>Administrator</option>
                          <option value={2}>Project Manager</option>
                          <option value={3}>Collaborator</option>
                        </select>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-[12px] font-bold px-2.5 py-1 rounded-full border ${u.isActive ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                          {u.isActive ? 'Active' : 'Deactivated'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        {/* Interactive Deactivate Button */}
                        {u.isActive ? (
                          <button 
                            onClick={() => handleDeactivate(u.id)}
                            className="text-[13px] font-bold text-red-600 hover:text-red-800 transition-colors cursor-pointer"
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

      </div>
    </DashboardLayout>
  );
}