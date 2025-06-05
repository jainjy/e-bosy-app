// src/components/UserFormModal.jsx
import React, { useState, useEffect } from 'react';

const UserFormModal = ({ onClose, onSubmit, user = null, mode = 'add' }) => {
  // Initialize form state based on mode
  const [formData, setFormData] = useState(() => {
    if (mode === 'edit' && user) {
      return user; // For edit mode, use the provided user data
    }
    // For add mode or if no user is provided, initialize with empty/default values
    return {
      name: '',
      email: '',
      role: 'student', // Default role for new users
      bio: '',
      country: '',
      learning_style: '',
      experience_level: '',
      birth_date: '',
    };
  });

  // Effect to update form data if 'user' prop changes in edit mode
  useEffect(() => {
    if (mode === 'edit' && user) {
      setFormData(user);
    }
  }, [user, mode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData); // Call the onSubmit prop with the form data
  };

  const roles = ['student', 'teacher', 'admin'];
  const countries = ['USA', 'Canada', 'UK', 'France', 'Germany', 'Madagascar', 'Other'];
  const learningStyles = ['Visual', 'Auditory', 'Kinesthetic', 'Reading/Writing', 'Practical', 'Analytical'];
  const experienceLevels = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];
  const statuses = ['Active', 'Inactive']; // Only relevant for edit mode

  const title = mode === 'add' ? 'Add New User' : 'Edit User';
  const submitButtonText = mode === 'add' ? 'Add User' : 'Update User';

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md md:max-w-lg lg:max-w-xl max-h-[90vh] overflow-y-auto transform scale-100 opacity-100 transition-all duration-300 ease-out">
        <div className="flex justify-between items-center mb-6 border-b pb-4">
          <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 focus:outline-none transition-colors duration-200"
            aria-label="Close"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Name */}
            <div className="col-span-1">
              <label htmlFor="name" className="block text-gray-700 text-sm font-bold mb-1">Name:</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name || ''}
                onChange={handleChange}
                className="shadow-sm appearance-none border border-gray-300 rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-e-bosy-purple focus:border-transparent"
                required
              />
            </div>
            {/* Email */}
            <div className="col-span-1">
              <label htmlFor="email" className="block text-gray-700 text-sm font-bold mb-1">Email:</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email || ''}
                onChange={handleChange}
                className="shadow-sm appearance-none border border-gray-300 rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-e-bosy-purple focus:border-transparent"
                required
              />
            </div>
            {/* Role */}
            <div className="col-span-1">
              <label htmlFor="role" className="block text-gray-700 text-sm font-bold mb-1">Role:</label>
              <select
                id="role"
                name="role"
                value={formData.role || ''}
                onChange={handleChange}
                className="shadow-sm appearance-none border border-gray-300 rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-e-bosy-purple focus:border-transparent"
                required
              >
                {roles.map((roleOpt) => (
                  <option key={roleOpt} value={roleOpt}>{roleOpt.charAt(0).toUpperCase() + roleOpt.slice(1)}</option>
                ))}
              </select>
            </div>
            {/* Status (only for edit mode) */}
            {mode === 'edit' && (
              <div className="col-span-1">
                <label htmlFor="status" className="block text-gray-700 text-sm font-bold mb-1">Status:</label>
                <select
                  id="status"
                  name="status"
                  value={formData.status || ''}
                  onChange={handleChange}
                  className="shadow-sm appearance-none border border-gray-300 rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-e-bosy-purple focus:border-transparent"
                  required
                >
                  {statuses.map((statusOpt) => (
                    <option key={statusOpt} value={statusOpt}>{statusOpt}</option>
                  ))}
                </select>
              </div>
            )}
            {/* Country */}
            <div className="col-span-1">
              <label htmlFor="country" className="block text-gray-700 text-sm font-bold mb-1">Country:</label>
              <select
                id="country"
                name="country"
                value={formData.country || ''}
                onChange={handleChange}
                className="shadow-sm appearance-none border border-gray-300 rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-e-bosy-purple focus:border-transparent"
              >
                <option value="">Select Country</option>
                {countries.map((countryOpt) => (
                  <option key={countryOpt} value={countryOpt}>{countryOpt}</option>
                ))}
              </select>
            </div>
            {/* Birth Date */}
            <div className="col-span-1">
              <label htmlFor="birth_date" className="block text-gray-700 text-sm font-bold mb-1">Birth Date:</label>
              <input
                type="date"
                id="birth_date"
                name="birth_date"
                value={formData.birth_date || ''}
                onChange={handleChange}
                className="shadow-sm appearance-none border border-gray-300 rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-e-bosy-purple focus:border-transparent"
              />
            </div>
            {/* Learning Style */}
            <div className="col-span-1">
              <label htmlFor="learning_style" className="block text-gray-700 text-sm font-bold mb-1">Learning Style:</label>
              <select
                id="learning_style"
                name="learning_style"
                value={formData.learning_style || ''}
                onChange={handleChange}
                className="shadow-sm appearance-none border border-gray-300 rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-e-bosy-purple focus:border-transparent"
              >
                <option value="">Select Learning Style</option>
                {learningStyles.map((style) => (
                  <option key={style} value={style}>{style}</option>
                ))}
              </select>
            </div>
            {/* Experience Level */}
            <div className="col-span-1">
              <label htmlFor="experience_level" className="block text-gray-700 text-sm font-bold mb-1">Experience Level:</label>
              <select
                id="experience_level"
                name="experience_level"
                value={formData.experience_level || ''}
                onChange={handleChange}
                className="shadow-sm appearance-none border border-gray-300 rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-e-bosy-purple focus:border-transparent"
              >
                <option value="">Select Experience Level</option>
                {experienceLevels.map((level) => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </select>
            </div>
            {/* Bio */}
            <div className="md:col-span-2">
              <label htmlFor="bio" className="block text-gray-700 text-sm font-bold mb-1">Bio:</label>
              <textarea
                id="bio"
                name="bio"
                value={formData.bio || ''}
                onChange={handleChange}
                rows="3"
                className="shadow-sm appearance-none border border-gray-300 rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-e-bosy-purple focus:border-transparent"
              ></textarea>
            </div>
          </div>

          <div className="flex items-center justify-end gap-4 mt-6 border-t pt-4">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50 transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-e-bosy-purple hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-e-bosy-purple focus:ring-opacity-50 transition-colors duration-200"
            >
              {submitButtonText}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserFormModal;