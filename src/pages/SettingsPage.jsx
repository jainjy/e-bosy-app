import React, { useState, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import { UserCircleIcon, KeyIcon, CameraIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { putData } from '../services/ApiFetch';
import { motion } from 'framer-motion'; // Pour les animations

const API_BASE_URL = "http://localhost:5000";

// Ajoutez cette fonction utilitaire avant le composant
const getInitials = (firstName, lastName, email) => {
  if (firstName && lastName) {
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  }
  return email ? email[0].toUpperCase() : '?';
};

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const { user, refreshUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    bio: user?.bio || '',
    experienceLevel: user?.experienceLevel || '',
    birthDate: user?.birthDate || '',
    role: user?.role || '' // Ajout du rôle
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null); // Ajout d'un state pour la prévisualisation de l'image

  const profileInitials = useMemo(() => 
    getInitials(user?.firstName, user?.lastName, user?.email),
  [user]);

  const handleInputChange = (e) => {
    setFormData({
      ...formData, 
      [e.target.name]: e.target.value
    });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value
    });
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setProfileImage(null);
    setImagePreview(null);
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!user.role) {
        throw new Error('Erreur : le rôle de l\'utilisateur est manquant');
      }

      const formDataToSend = new FormData();
      Object.keys(formData).forEach(key => {
        if (formData[key]) {
          formDataToSend.append(key, formData[key]);
        }
      });
      
      formDataToSend.append('role', user.role);
      
      if (profileImage) {
        formDataToSend.append('profilePicture', profileImage);
      }

      const [_, error] = await putData(`users/me`, formDataToSend, true);

      if (error) throw error;

      await refreshUser();
      toast.success('Profil mis à jour avec succès');
    } catch (error) {
      toast.error(error.message || 'Erreur lors de la mise à jour du profil');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas');
      return;
    }

    setLoading(true);

    try {
      const [_, error] = await putData('password/change', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });

      if (error) throw error;

      toast.success('Mot de passe modifié avec succès');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      toast.error(error.message || 'Erreur lors de la modification du mot de passe');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="max-w-4xl mx-auto px-4 py-8"
    >
      <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg p-6 mb-8">
        <h2 className="text-2xl font-bold text-gray-800">Paramètres</h2>
        <p className="text-gray-600">Personnalisez votre expérience E-Bosy</p>
      </div>

      <div className="flex space-x-6 border-b border-gray-200 mb-8 overflow-x-auto">
        <button
          onClick={() => setActiveTab('profile')}
          className={`px-6 py-3 flex items-center space-x-2 transition-colors whitespace-nowrap
            ${activeTab === 'profile' 
              ? 'text-e-bosy-purple border-b-2 border-e-bosy-purple font-semibold' 
              : 'text-gray-600 hover:text-gray-800'
            }`}
        >
          <UserCircleIcon className="h-5 w-5" />
          <span>Profil</span>
        </button>
        <button
          onClick={() => setActiveTab('security')}
          className={`px-6 py-3 flex items-center space-x-2 transition-colors whitespace-nowrap
            ${activeTab === 'security' 
              ? 'text-e-bosy-purple border-b-2 border-e-bosy-purple font-semibold' 
              : 'text-gray-600 hover:text-gray-800'
            }`}
        >
          <KeyIcon className="h-5 w-5" />
          <span>Sécurité</span>
        </button>
      </div>

      <motion.div 
        key={activeTab}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-lg shadow-lg p-6"
      >
        {activeTab === 'profile' && (
          <form onSubmit={handleProfileUpdate} className="space-y-8">
            <div className="flex flex-col items-center space-y-4">
              <div className="relative group">
                <div className="w-32 h-32 rounded-full overflow-hidden ring-4 ring-purple-50">
                  {imagePreview || user?.profilePictureUrl ? (
                    <img 
                      src={imagePreview || `${API_BASE_URL}/${user.profilePictureUrl}`}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-e-bosy-purple text-white text-3xl font-semibold">
                      {profileInitials}
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <label 
                      htmlFor="profilePicture"
                      className="cursor-pointer text-white flex items-center space-x-2"
                    >
                      <CameraIcon className="h-6 w-6" />
                      <span>Modifier</span>
                    </label>
                  </div>
                </div>
                <input
                  type="file"
                  id="profilePicture"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageSelect}
                />
                {imagePreview && (
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                  >
                    <XMarkIcon className="h-4 w-4" />
                  </button>
                )}
              </div>
              <p className="text-sm text-gray-500">
                Format recommandé: JPG, PNG. Taille max: 2MB
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Prénom</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Nom</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Bio</label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  rows="4"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Niveau d'expérience</label>
                <select
                  name="experienceLevel"
                  value={formData.experienceLevel}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                >
                  <option value="">Sélectionner un niveau</option>
                  <option value="débutant">Débutant</option>
                  <option value="intermédiaire">Intermédiaire</option>
                  <option value="avancé">Avancé</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Date de naissance</label>
                <input
                  type="date"
                  name="birthDate"
                  value={formData.birthDate}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="bg-e-bosy-purple text-white px-6 py-2 rounded-md hover:bg-purple-700 disabled:opacity-50"
              >
                {loading ? 'Enregistrement...' : 'Enregistrer'}
              </button>
            </div>
          </form>
        )}

        {activeTab === 'security' && (
          <form onSubmit={handlePasswordUpdate}>
            <h3 className="text-xl font-bold text-gray-800 mb-4">Changer le mot de passe</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Mot de passe actuel</label>
                <input
                  type="password"
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Nouveau mot de passe</label>
                <input
                  type="password"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Confirmer le mot de passe</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="bg-e-bosy-purple text-white px-6 py-2 rounded-md hover:bg-purple-700 disabled:opacity-50"
              >
                {loading ? 'Modification...' : 'Modifier le mot de passe'}
              </button>
            </div>
          </form>
        )}
      </motion.div>
    </motion.div>
  );
};

export default SettingsPage;