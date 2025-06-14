import React, { useState, useEffect, useRef } from 'react';

// Define roles for consistency (assuming this is imported from a shared constants file)
// Or you can define them here if this component is the only one needing them in this way
const ROLES = {
  ADMIN: 'administrateur',
  TEACHER: 'enseignant',
  STUDENT: 'etudiant',
};

const UserFormModal = ({ onClose, onSubmit, user = null, mode = 'add' }) => {
  const [formData, setFormData] = useState(() => {
    // Helper to format ISO date strings to YYYY-MM-DD for date inputs
    const formatDate = (isoDate) => {
      if (!isoDate) return '';
      // Ensure it's a valid date string before splitting
      const date = new Date(isoDate);
      return isNaN(date.getTime()) ? '' : isoDate.split('T')[0];
    };

    if (mode === 'edit' && user) {
      return {
        userId: user.userId,
        email: user.email || '',
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        // Ensure role is consistent with what's expected by the select input
        // If backend sends 'admin' for administrator, convert it to 'administrateur' for the form
        role: user.role.toLowerCase() === 'admin' ? ROLES.ADMIN : user.role || ROLES.STUDENT,
        bio: user.bio || '',
        learningStyle: user.learningStyle || '',
        experienceLevel: user.experienceLevel || '',
        birthDate: formatDate(user.birthDate), // Format date for input
        profilePicture: null,
        isSubscribed: user.isSubscribed || false,
        subscriptionDate: formatDate(user.subscriptionDate), // Format date for input
        subscriptionExpiry: formatDate(user.subscriptionExpiry), // Format date for input
      };
    }
    return {
      email: '',
      firstName: '',
      lastName: '',
      password: '', // Only included in add mode for initial state
      role: ROLES.STUDENT, // Default role for new user
      bio: '',
      learningStyle: '',
      experienceLevel: '',
      birthDate: '',
      profilePicture: null,
      isSubscribed: false,
      subscriptionDate: '',
      subscriptionExpiry: '',
    };
  });

  const modalRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === 'checkbox' ? checked : type === 'file' ? files[0] : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const submittedData = {
      ...formData,
      // Handle the role conversion if the backend *truly* expects 'admin' for 'administrateur'
      // Otherwise, remove this line and just send formData.role
      role: formData.role === ROLES.ADMIN ? 'admin' : formData.role,
      
      // Ensure date fields are null if empty, or correctly formatted
      birthDate: formData.birthDate || null,
      subscriptionDate: formData.isSubscribed && formData.subscriptionDate ? formData.subscriptionDate : null,
      subscriptionExpiry: formData.isSubscribed && formData.subscriptionExpiry ? formData.subscriptionExpiry : null,
    };

    // Remove password if in edit mode and it's empty (i.e., not changed)
    if (mode === 'edit' && !submittedData.password) {
      delete submittedData.password;
    }
    
    onSubmit(submittedData);
  };

  // Use the ROLES constant for the roles array
  const rolesOptions = [ROLES.STUDENT, ROLES.TEACHER, ROLES.ADMIN];
  const learningStyles = ['Visuel', 'Auditif', 'Kinesthesique', 'Lecture/Ecriture', 'Pratique', 'Analytique'];
  const experienceLevels = ['Debutant', 'Intermediaire', 'Avance', 'Expert'];

  const title = mode === 'add' ? 'Ajouter un Nouvel Utilisateur' : 'Modifier l\'Utilisateur';
  const submitButtonText = mode === 'add' ? 'Ajouter l\'Utilisateur' : 'Mettre à Jour l\'Utilisateur';

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div ref={modalRef} className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md md:max-w-lg lg:max-w-xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6 border-b pb-4">
          <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 focus:outline-none"
            aria-label="Fermer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="col-span-1">
              <label htmlFor="firstName" className="block text-gray-700 text-sm font-bold mb-1">Prenom:</label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className="shadow-sm appearance-none border border-gray-300 rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-e-bosy-purple focus:border-transparent"
                required
              />
            </div>
            <div className="col-span-1">
              <label htmlFor="lastName" className="block text-gray-700 text-sm font-bold mb-1">Nom:</label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className="shadow-sm appearance-none border border-gray-300 rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-e-bosy-purple focus:border-transparent"
                required
              />
            </div>
            <div className="col-span-1">
              <label htmlFor="email" className="block text-gray-700 text-sm font-bold mb-1">Email:</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="shadow-sm appearance-none border border-gray-300 rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-e-bosy-purple focus:border-transparent"
                required
              />
            </div>
            {mode === 'add' && (
              <div className="col-span-1">
                <label htmlFor="password" className="block text-gray-700 text-sm font-bold mb-1">Mot de passe:</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="shadow-sm appearance-none border border-gray-300 rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-e-bosy-purple focus:border-transparent"
                  required
                />
              </div>
            )}
            <div className="col-span-1">
              <label htmlFor="role" className="block text-gray-700 text-sm font-bold mb-1">Rôle:</label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="shadow-sm appearance-none border border-gray-300 rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-e-bosy-purple focus:border-transparent"
                required
              >
                {rolesOptions.map((roleOpt) => (
                  <option key={roleOpt} value={roleOpt}>
                    {roleOpt.charAt(0).toUpperCase() + roleOpt.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-span-1">
              <label htmlFor="profilePicture" className="block text-gray-700 text-sm font-bold mb-1">Photo de Profil:</label>
              <input
                type="file"
                id="profilePicture"
                name="profilePicture"
                accept="image/*"
                onChange={handleChange}
                className="shadow-sm appearance-none border border-gray-300 rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-e-bosy-purple focus:border-transparent"
              />
            </div>
            <div className="col-span-1 flex items-center">
              <input
                type="checkbox"
                id="isSubscribed"
                name="isSubscribed"
                checked={formData.isSubscribed}
                onChange={handleChange}
                className="h-4 w-4 text-e-bosy-purple focus:ring-e-bosy-purple border-gray-300 rounded"
              />
              <label htmlFor="isSubscribed" className="ml-2 block text-gray-700 text-sm font-bold">Abonné</label>
            </div>
            {formData.isSubscribed && (
              <>
                <div className="col-span-1">
                  <label htmlFor="subscriptionDate" className="block text-gray-700 text-sm font-bold mb-1">Date d'abonnement:</label>
                  <input
                    type="date"
                    id="subscriptionDate"
                    name="subscriptionDate"
                    value={formData.subscriptionDate}
                    onChange={handleChange}
                    className="shadow-sm appearance-none border border-gray-300 rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-e-bosy-purple focus:border-transparent"
                  />
                </div>
                <div className="col-span-1">
                  <label htmlFor="subscriptionExpiry" className="block text-gray-700 text-sm font-bold mb-1">Date d'expiration abonnement:</label>
                  <input
                    type="date"
                    id="subscriptionExpiry"
                    name="subscriptionExpiry"
                    value={formData.subscriptionExpiry}
                    onChange={handleChange}
                    className="shadow-sm appearance-none border border-gray-300 rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-e-bosy-purple focus:border-transparent"
                  />
                </div>
              </>
            )}
            <div className="col-span-1">
              <label htmlFor="birthDate" className="block text-gray-700 text-sm font-bold mb-1">Date de Naissance:</label>
              <input
                type="date"
                id="birthDate"
                name="birthDate"
                value={formData.birthDate}
                onChange={handleChange}
                className="shadow-sm appearance-none border border-gray-300 rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-e-bosy-purple focus:border-transparent"
              />
            </div>
            <div className="col-span-1">
              <label htmlFor="learningStyle" className="block text-gray-700 text-sm font-bold mb-1">Style d'Apprentissage:</label>
              <select
                id="learningStyle"
                name="learningStyle"
                value={formData.learningStyle}
                onChange={handleChange}
                className="shadow-sm appearance-none border border-gray-300 rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-e-bosy-purple focus:border-transparent"
              >
                <option value="">Selectionner un style</option>
                {learningStyles.map((style) => (
                  <option key={style} value={style}>{style}</option>
                ))}
              </select>
            </div>
            <div className="col-span-1">
              <label htmlFor="experienceLevel" className="block text-gray-700 text-sm font-bold mb-1">Niveau d'Experience:</label>
              <select
                id="experienceLevel"
                name="experienceLevel"
                value={formData.experienceLevel}
                onChange={handleChange}
                className="shadow-sm appearance-none border border-gray-300 rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-e-bosy-purple focus:border-transparent"
              >
                <option value="">Selectionner un niveau</option>
                {experienceLevels.map((level) => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2">
              <label htmlFor="bio" className="block text-gray-700 text-sm font-bold mb-1">Biographie:</label>
              <textarea
                id="bio"
                name="bio"
                value={formData.bio}
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
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="bg-e-bosy-purple hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-e-bosy-purple focus:ring-opacity-50"
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