import React from 'react';

const ViewUserModal = ({ user, onClose }) => {
  if (!user) return null;

  // Function to get role color class (can be centralized if used elsewhere)
  const getRoleColorClass = (role) => {
    switch (role) {
      case 'student': return 'bg-blue-100 text-blue-800';
      case 'teacher': return 'bg-green-100 text-green-800';
      case 'admin': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Function to get status color class (can be centralized if used elsewhere)
  const getStatusColorClass = (status) => {
    return status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 px-4">
      <div className="bg-white p-8 rounded-lg shadow-xl max-w-lg w-full transform transition-all duration-300 scale-100 opacity-100">
        <div className="flex justify-between items-center mb-6 border-b pb-4">
          <h2 className="text-3xl font-extrabold text-gray-900">User Profile</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 focus:outline-none"
            aria-label="Close"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex flex-col items-center mb-6">
          <div className="h-24 w-24 rounded-full bg-e-bosy-purple flex items-center justify-center text-white font-bold text-4xl shadow-md border-4 border-white">
            {user.avatarInitials}
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mt-4">{user.name}</h3>
          <p className="text-gray-600">{user.email}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-6 text-gray-700 mb-8">
          <div className="flex flex-col">
            <p className="font-semibold text-sm text-gray-500">Role</p>
            <span className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full capitalize ${getRoleColorClass(user.role)}`}>
              {user.role}
            </span>
          </div>
          <div className="flex flex-col">
            <p className="font-semibold text-sm text-gray-500">Status</p>
            <span className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${getStatusColorClass(user.status)}`}>
              {user.status}
            </span>
          </div>
          {user.country && (
            <div className="flex flex-col">
              <p className="font-semibold text-sm text-gray-500">Country</p>
              <p className="text-base">{user.country}</p>
            </div>
          )}
          {user.birth_date && (
            <div className="flex flex-col">
              <p className="font-semibold text-sm text-gray-500">Birth Date</p>
              <p className="text-base">{user.birth_date}</p>
            </div>
          )}
          {user.learning_style && (
            <div className="flex flex-col">
              <p className="font-semibold text-sm text-gray-500">Learning Style</p>
              <p className="text-base">{user.learning_style}</p>
            </div>
          )}
          {user.experience_level && (
            <div className="flex flex-col">
              <p className="font-semibold text-sm text-gray-500">Experience Level</p>
              <p className="text-base">{user.experience_level}</p>
            </div>
          )}
          {user.bio && (
            <div className="md:col-span-2 flex flex-col">
              <p className="font-semibold text-sm text-gray-500">Bio</p>
              <p className="text-base">{user.bio}</p>
            </div>
          )}
        </div>

        <div className="mt-6 pt-4 border-t flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 font-medium transition-colors duration-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewUserModal;