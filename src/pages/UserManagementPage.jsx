// src/pages/UserManagementPage.jsx
import React, { useState } from 'react';
import { MagnifyingGlassIcon, PlusIcon, EllipsisVerticalIcon, PencilIcon, TrashIcon, EyeIcon } from '@heroicons/react/24/outline';
import DashboardLayout from '../layouts/DashboardLayout';
// Import the new unified modal component
import UserFormModal from '../components/UserFormModal';
import ViewUserModal from '../components/ViewUserModal';

const UserManagementPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState('All Users');

  const [users, setUsers] = useState([
    {
      id: 1,
      name: 'John Student',
      email: 'student@example.com',
      role: 'student',
      status: 'Active',
      avatarInitials: 'JS',
      bio: 'Enthusiastic learner.',
      country: 'France',
      learning_style: 'Visual',
      experience_level: 'Beginner',
      birth_date: '2000-01-15',
    },
    {
      id: 2,
      name: 'Jane Teacher',
      email: 'teacher@example.com',
      role: 'teacher',
      status: 'Active',
      avatarInitials: 'JT',
      bio: 'Experienced React developer.',
      country: 'USA',
      learning_style: 'Practical',
      experience_level: 'Expert',
      birth_date: '1985-03-20',
    },
    {
      id: 3,
      name: 'Admin User',
      email: 'admin@example.com',
      role: 'admin',
      status: 'Active',
      avatarInitials: 'AU',
      bio: 'System administrator.',
      country: 'Canada',
      learning_style: 'Analytical',
      experience_level: 'Advanced',
      birth_date: '1978-07-01',
    },
    {
      id: 4,
      name: 'Alice Student',
      email: 'alice@example.com',
      role: 'student',
      status: 'Inactive',
      avatarInitials: 'AS',
      bio: 'New to programming.',
      country: 'Germany',
      learning_style: 'Auditory',
      experience_level: 'Beginner',
      birth_date: '2002-11-25',
    },
    {
      id: 5,
      name: 'Bob Teacher',
      email: 'bob@example.com',
      role: 'teacher',
      status: 'Active',
      avatarInitials: 'BT',
      bio: 'Teaches data science.',
      country: 'UK',
      learning_style: 'Kinesthetic',
      experience_level: 'Intermediate',
      birth_date: '1990-09-10',
    },
  ]);

  // States for the unified UserFormModal
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [currentFormMode, setCurrentFormMode] = useState('add'); // 'add' or 'edit'
  const [userToEdit, setUserToEdit] = useState(null); // The user object when in 'edit' mode

  // State for View User Modal
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [userToView, setUserToView] = useState(null);

  // State for managing action dropdown visibility
  const [openDropdownId, setOpenDropdownId] = useState(null);

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRoleFilter === 'All Users' ||
                        user.role === selectedRoleFilter.toLowerCase();

    return matchesSearch && matchesRole;
  });

  const getRoleColorClass = (role) => {
    switch (role) {
      case 'student': return 'bg-blue-100 text-blue-800';
      case 'teacher': return 'bg-green-100 text-green-800';
      case 'admin': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColorClass = (status) => {
    return status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  // CRUD Operations
  const handleAddUser = (newUserData) => {
    const newId = users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1;
    setUsers([...users, {
      id: newId,
      status: 'Active', // New users typically start as Active
      avatarInitials: newUserData.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2),
      ...newUserData,
    }]);
    setIsFormModalOpen(false);
    console.log('User Added:', newUserData);
  };

  const handleUpdateUser = (updatedUserData) => {
    setUsers(users.map(user =>
      user.id === updatedUserData.id ? { ...user, ...updatedUserData } : user
    ));
    setIsFormModalOpen(false);
    setOpenDropdownId(null);
    console.log('User Updated:', updatedUserData);
  };

  const handleDeleteUser = (id) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      setUsers(users.filter(user => user.id !== id));
      setOpenDropdownId(null);
      console.log('User Deleted:', id);
    }
  };

  // Unified Form Modal handlers
  const openAddFormModal = () => {
    setCurrentFormMode('add');
    setUserToEdit(null); // Ensure no old data is present
    setIsFormModalOpen(true);
  };

  const openEditFormModal = (user) => {
    setCurrentFormMode('edit');
    setUserToEdit(user);
    setIsFormModalOpen(true);
    setOpenDropdownId(null); // Close dropdown when opening modal
  };

  const closeFormModal = () => {
    setIsFormModalOpen(false);
    setUserToEdit(null); // Clear user data on close
  };

  // View User Modal Handlers
  const openViewModal = (user) => {
    setUserToView(user);
    setIsViewModalOpen(true);
    setOpenDropdownId(null);
  };
  const closeViewModal = () => {
    setUserToView(null);
    setIsViewModalOpen(false);
  };

  // Dropdown handler
  const toggleDropdown = (userId) => {
    setOpenDropdownId(openDropdownId === userId ? null : userId);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">User Management</h1>
          <p className="text-gray-600">Manage user accounts, roles, and permissions.</p>
        </div>
        <button
          onClick={openAddFormModal} // Use the new handler
          className="bg-e-bosy-purple text-white px-4 py-2 rounded-md flex items-center space-x-2 hover:bg-purple-700 transition-colors duration-200"
        >
          <PlusIcon className="h-5 w-5" />
          <span>Add User</span>
        </button>
      </div>

      {/* Role Filter Tabs */}
      <div className="mb-6 bg-white p-2 rounded-lg shadow-sm flex space-x-2">
        {['All Users', 'Student', 'Teacher', 'Admin'].map(role => (
          <button
            key={role}
            onClick={() => setSelectedRoleFilter(role)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200
              ${selectedRoleFilter === role
                ? 'bg-e-bosy-purple text-white'
                : 'text-gray-700 hover:bg-gray-100'
              }`}
          >
            {role}
          </button>
        ))}
      </div>

      {/* Search and Table */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center mb-4 relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search users..."
            className="w-full rounded-md border-gray-300 pl-10 pr-4 py-2 focus:ring-e-bosy-purple focus:border-e-bosy-purple transition-shadow duration-200"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* User Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.length > 0 ? (
                filteredUsers.map(user => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors duration-150">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 font-semibold text-sm">
                            {user.avatarInitials}
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{user.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleColorClass(user.role)}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColorClass(user.status)}`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium relative">
                      <button
                        onClick={() => toggleDropdown(user.id)}
                        className="text-gray-500 hover:text-gray-900 p-1 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-e-bosy-purple focus:ring-opacity-50 transition-all duration-150"
                      >
                        <EllipsisVerticalIcon className="h-5 w-5" />
                      </button>
                      {openDropdownId === user.id && (
                        <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10 animate-fade-in-down">
                          <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                            <button
                              onClick={() => openViewModal(user)}
                              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 w-full text-left transition-colors duration-150"
                              role="menuitem"
                            >
                              <EyeIcon className="h-4 w-4 mr-2" />
                              View
                            </button>
                            <button
                              onClick={() => openEditFormModal(user)} // Use the new handler
                              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 w-full text-left transition-colors duration-150"
                              role="menuitem"
                            >
                              <PencilIcon className="h-4 w-4 mr-2" />
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteUser(user.id)}
                              className="flex items-center px-4 py-2 text-sm text-red-700 hover:bg-red-100 hover:text-red-900 w-full text-left transition-colors duration-150"
                              role="menuitem"
                            >
                              <TrashIcon className="h-4 w-4 mr-2" />
                              Delete
                            </button>
                          </div>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-10 text-center text-gray-600">No users found matching your criteria.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Unified UserFormModal */}
      {isFormModalOpen && (
        <UserFormModal
          mode={currentFormMode} // Pass the mode ('add' or 'edit')
          user={userToEdit}     // Pass the user object for edit mode
          onClose={closeFormModal}
          onSubmit={currentFormMode === 'add' ? handleAddUser : handleUpdateUser}
        />
      )}

      {/* View User Modal */}
      {isViewModalOpen && userToView && (
        <ViewUserModal
          user={userToView}
          onClose={closeViewModal}
        />
      )}
    </div>
  );
};

export default UserManagementPage;