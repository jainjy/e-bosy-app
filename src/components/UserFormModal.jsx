import React, { useState, useEffect, useRef } from 'react';

const UserFormModal = ({ onClose, onSubmit, user = null, mode = 'add' }) => {
  const [formData, setFormData] = useState(() => {
    if (mode === 'edit' && user) {
      return {
        ...user,
        birth_date: user.birth_date ? user.birth_date.split('T')[0] : '',
        subscription_date: user.subscription_date ? user.subscription_date.split('T')[0] : '',
        subscription_expiry: user.subscription_expiry ? user.subscription_expiry.split('T')[0] : '',
        role: user.role === 'admin' ? 'administrateur' : user.role,
      };
    }
    return {
      name: '',
      email: '',
      role: 'student',
      is_verified: false,
      is_subscribed: false,
      subscription_date: '',
      subscription_expiry: '',
      profile_picture_url: '',
      bio: '',
      learning_style: '',
      experience_level: '',
      birth_date: '',
      points: 0,
      badges: {},
    };
  });

  const modalRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  useEffect(() => {
    if (mode === 'edit' && user) {
      setFormData({
        ...user,
        birth_date: user.birth_date ? user.birth_date.split('T')[0] : '',
        subscription_date: user.subscription_date ? user.subscription_date.split('T')[0] : '',
        subscription_expiry: user.subscription_expiry ? user.subscription_expiry.split('T')[0] : '',
        role: user.role === 'admin' ? 'administrateur' : user.role,
      });
    }
  }, [user, mode]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const submittedData = {
      ...formData,
      role: formData.role === 'administrateur' ? 'admin' : formData.role,
      subscription_date: formData.subscription_date || null,
      subscription_expiry: formData.subscription_expiry || null,
      birth_date: formData.birth_date || null,
      points: parseInt(formData.points, 10) || 0,
    };
    onSubmit(submittedData);
  };

  const roles = ['student', 'teacher', 'administrateur'];
  const countries = ['France', 'Allemagne', 'Canada', 'États-Unis', 'Madagascar', 'Royaume-Uni', 'Autre'];
  const learningStyles = ['Visuel', 'Auditif', 'Kinesthésique', 'Lecture/Écriture', 'Pratique', 'Analytique'];
  const experienceLevels = ['Débutant', 'Intermédiaire', 'Avancé', 'Expert'];
  const statuses = ['Actif', 'Inactif'];

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
              <label htmlFor="name" className="block text-gray-700 text-sm font-bold mb-1">Nom:</label>
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
            <div className="col-span-1">
              <label htmlFor="role" className="block text-gray-700 text-sm font-bold mb-1">Rôle:</label>
              <select
                id="role"
                name="role"
                value={formData.role || ''}
                onChange={handleChange}
                className="shadow-sm appearance-none border border-gray-300 rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-e-bosy-purple focus:border-transparent"
                required
              >
                {roles.map((roleOpt) => (
                  <option key={roleOpt} value={roleOpt}>
                    {roleOpt.charAt(0).toUpperCase() + roleOpt.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-span-1">
              <label htmlFor="profile_picture_url" className="block text-gray-700 text-sm font-bold mb-1">URL Photo de Profil:</label>
              <input
                type="text"
                id="profile_picture_url"
                name="profile_picture_url"
                value={formData.profile_picture_url || ''}
                onChange={handleChange}
                className="shadow-sm appearance-none border border-gray-300 rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-e-bosy-purple focus:border-transparent"
              />
            </div>

            <div className="col-span-1 flex items-center">
              <input
                type="checkbox"
                id="is_verified"
                name="is_verified"
                checked={formData.is_verified || false}
                onChange={handleChange}
                className="h-4 w-4 text-e-bosy-purple focus:ring-e-bosy-purple border-gray-300 rounded"
              />
              <label htmlFor="is_verified" className="ml-2 block text-gray-700 text-sm font-bold">Email Vérifié</label>
            </div>

            <div className="col-span-1 flex items-center">
              <input
                type="checkbox"
                id="is_subscribed"
                name="is_subscribed"
                checked={formData.is_subscribed || false}
                onChange={handleChange}
                className="h-4 w-4 text-e-bosy-purple focus:ring-e-bosy-purple border-gray-300 rounded"
              />
              <label htmlFor="is_subscribed" className="ml-2 block text-gray-700 text-sm font-bold">Abonné</label>
            </div>

            {formData.is_subscribed && (
              <>
                <div className="col-span-1">
                  <label htmlFor="subscription_date" className="block text-gray-700 text-sm font-bold mb-1">Date d'abonnement:</label>
                  <input
                    type="date"
                    id="subscription_date"
                    name="subscription_date"
                    value={formData.subscription_date || ''}
                    onChange={handleChange}
                    className="shadow-sm appearance-none border border-gray-300 rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-e-bosy-purple focus:border-transparent"
                  />
                </div>
                <div className="col-span-1">
                  <label htmlFor="subscription_expiry" className="block text-gray-700 text-sm font-bold mb-1">Date d'expiration abonnement:</label>
                  <input
                    type="date"
                    id="subscription_expiry"
                    name="subscription_expiry"
                    value={formData.subscription_expiry || ''}
                    onChange={handleChange}
                    className="shadow-sm appearance-none border border-gray-300 rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-e-bosy-purple focus:border-transparent"
                  />
                </div>
              </>
            )}

            <div className="col-span-1">
              <label htmlFor="country" className="block text-gray-700 text-sm font-bold mb-1">Pays:</label>
              <select
                id="country"
                name="country"
                value={formData.country || ''}
                onChange={handleChange}
                className="shadow-sm appearance-none border border-gray-300 rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-e-bosy-purple focus:border-transparent"
              >
                <option value="">Sélectionner un pays</option>
                {countries.map((countryOpt) => (
                  <option key={countryOpt} value={countryOpt}>{countryOpt}</option>
                ))}
              </select>
            </div>
            <div className="col-span-1">
              <label htmlFor="birth_date" className="block text-gray-700 text-sm font-bold mb-1">Date de Naissance:</label>
              <input
                type="date"
                id="birth_date"
                name="birth_date"
                value={formData.birth_date || ''}
                onChange={handleChange}
                className="shadow-sm appearance-none border border-gray-300 rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-e-bosy-purple focus:border-transparent"
              />
            </div>
            <div className="col-span-1">
              <label htmlFor="learning_style" className="block text-gray-700 text-sm font-bold mb-1">Style d'Apprentissage:</label>
              <select
                id="learning_style"
                name="learning_style"
                value={formData.learning_style || ''}
                onChange={handleChange}
                className="shadow-sm appearance-none border border-gray-300 rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-e-bosy-purple focus:border-transparent"
              >
                <option value="">Sélectionner un style</option>
                {learningStyles.map((style) => (
                  <option key={style} value={style}>{style}</option>
                ))}
              </select>
            </div>
            <div className="col-span-1">
              <label htmlFor="experience_level" className="block text-gray-700 text-sm font-bold mb-1">Niveau d'Expérience:</label>
              <select
                id="experience_level"
                name="experience_level"
                value={formData.experience_level || ''}
                onChange={handleChange}
                className="shadow-sm appearance-none border border-gray-300 rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-e-bosy-purple focus:border-transparent"
              >
                <option value="">Sélectionner un niveau</option>
                {experienceLevels.map((level) => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </select>
            </div>
            <div className="col-span-1">
              <label htmlFor="points" className="block text-gray-700 text-sm font-bold mb-1">Points:</label>
              <input
                type="number"
                id="points"
                name="points"
                value={formData.points || 0}
                onChange={handleChange}
                className="shadow-sm appearance-none border border-gray-300 rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-e-bosy-purple focus:border-transparent"
              />
            </div>
            {mode === 'edit' && (
              <div className="col-span-1">
                <label htmlFor="status" className="block text-gray-700 text-sm font-bold mb-1">Statut:</label>
                <select
                  id="status"
                  name="status"
                  value={formData.status || ''}
                  onChange={handleChange}
                  className="shadow-sm appearance-none border border-gray-300 rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-e-bosy-purple focus:border-transparent"
                >
                  {statuses.map((statusOpt) => (
                    <option key={statusOpt} value={statusOpt}>{statusOpt}</option>
                  ))}
                </select>
              </div>
            )}
            <div className="md:col-span-2">
              <label htmlFor="bio" className="block text-gray-700 text-sm font-bold mb-1">Biographie:</label>
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