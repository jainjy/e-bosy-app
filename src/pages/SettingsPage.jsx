import React, { useState, useMemo, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import { 
  UserCircleIcon, KeyIcon, CameraIcon, EyeIcon, EyeSlashIcon, XMarkIcon,
  AcademicCapIcon, BriefcaseIcon, CakeIcon, EnvelopeIcon,
  IdentificationIcon, UserIcon
} from '@heroicons/react/24/outline';
import { API_BASE_URL, putData } from '../services/ApiFetch';
import { motion } from 'framer-motion';
import classNames from 'classnames';

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
    birthDate: user?.birthDate || '',
    role: user?.role || '',
    specialty: user?.specialty || '',
    education: user?.education || '',
    yearsOfExperience: user?.yearsOfExperience || ''
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [showPwd, setShowPwd] = useState(false); // show/hide password
  const [showNewPwd, setShowNewPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);
  const [pwdStrength, setPwdStrength] = useState('');
  const fileInputRef = useRef(null);

  const profileInitials = useMemo(() =>
    getInitials(user?.firstName, user?.lastName, user?.email),
    [user]
  );

  // Validation Helpers
  const validateEmail = email =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isEmailValid = validateEmail(formData.email);

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
    if(e.target.name === "newPassword") {
      setPwdStrength(getPwdStrength(e.target.value));
    }
  };

  // Password strength logic simple
  const getPwdStrength = (pwd) => {
    if (!pwd) return '';
    if (pwd.length < 6) return 'faible';
    if (pwd.match(/[A-Z]/) && pwd.match(/[a-z]/) && pwd.match(/[0-9]/) && pwd.length >= 8) return 'fort';
    return 'moyen';
  };

  // Drag'n'drop management
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files[0];
    handleImageFile(file);
  };
  const handleDragOver = (e) => e.preventDefault();

  const handleImageFile = (file) => {
    if (file) {
      setProfileImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };
  const handleImageSelect = (e) => {
    handleImageFile(e.target.files[0]);
  };
  const handleRemoveImage = () => {
    setProfileImage(null);
    setImagePreview(null);
    fileInputRef.current.value = '';
  };

  // Profile update
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
      if (profileImage) formDataToSend.append('profilePicture', profileImage);

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

  // Password update
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
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setPwdStrength('');
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
      {/* En-tête */}
      <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg p-6 mb-8 shadow-md sticky top-0 z-10">
        <h2 className="text-2xl font-bold text-gray-800">Paramètres</h2>
        <p className="text-gray-700">Personnalisez votre expérience E-Bosy</p>
      </div>

      {/* Onglets avec indicateur dynamique */}
      <nav className="flex space-x-6 border-b border-gray-200 mb-8 overflow-x-auto" role="tablist">
        <button
          onClick={() => setActiveTab('profile')}
          className={classNames(
            "px-6 py-3 flex items-center space-x-2 transition-colors whitespace-nowrap rounded-t-md",
            activeTab === 'profile'
              ? 'bg-purple-100 text-e-bosy-purple border-b-2 border-e-bosy-purple font-semibold'
              : 'text-gray-600 hover:text-gray-800'
          )}
          aria-selected={activeTab === 'profile'}
          role="tab"
        >
          <UserCircleIcon className="h-5 w-5" />
          <span>Profil</span>
        </button>
        <button
          onClick={() => setActiveTab('security')}
          className={classNames(
            "px-6 py-3 flex items-center space-x-2 transition-colors whitespace-nowrap rounded-t-md",
            activeTab === 'security'
              ? 'bg-purple-100 text-e-bosy-purple border-b-2 border-e-bosy-purple font-semibold'
              : 'text-gray-600 hover:text-gray-800'
          )}
          aria-selected={activeTab === 'security'}
          role="tab"
        >
          <KeyIcon className="h-5 w-5" />
          <span>Sécurité</span>
        </button>
      </nav>

      {/* Contenu des onglets animés */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-lg shadow-lg p-6"
      >
        {activeTab === 'profile' && (
          <form onSubmit={handleProfileUpdate} className="space-y-8">
            {/* Section Avatar Drag&Drop + bouton visible */}
            <section
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              className="flex flex-col items-center space-y-2"
            >
              <label htmlFor="profilePicture" className="text-sm font-medium text-gray-700">
                Photo de profil
              </label>
              <div className="relative group rounded-full border-4 border-purple-100 hover:shadow-lg transition">
                <div className="w-32 h-32 rounded-full overflow-hidden flex items-center justify-center bg-e-bosy-purple text-white text-3xl font-semibold ring-4 ring-purple-50">
                  {imagePreview || user?.profilePictureUrl ? (
                    <img
                      src={imagePreview || `${API_BASE_URL}/${user.profilePictureUrl}`}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    profileInitials
                  )}
                </div>
                {/* Bouton modifier toujours visible en-dessous */}
                <button
                  type="button"
                  className="absolute bottom-0 right-2 bg-e-bosy-purple text-white rounded-full px-3 py-1 text-xs shadow-md hover:bg-purple-700"
                  onClick={() => fileInputRef.current.click()}
                >
                  <CameraIcon className="h-5 w-5 inline-block mr-1" /> Changer
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  id="profilePicture"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageSelect}
                />
                {imagePreview &&
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    <XMarkIcon className="h-4 w-4" />
                  </button>
                }
              </div>
              {/* Indication Drag & Drop */}
              <p className="text-xs text-gray-500 text-center">
                Glissez une image ou cliquez sur "Changer"<br />
                <span>JPG/PNG, 2Mo max</span>
              </p>
              {profileImage &&
                <span className="text-green-600 text-xs">
                  {profileImage.name} ({(profileImage.size/1024/1024).toFixed(2)}Mo)
                </span>
              }
            </section>

            {/* Infos personnelles */}
            <section className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-1">Informations personnelles</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                  <UserIcon className="h-5 w-5 absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    name="firstName"
                    autoComplete="given-name"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3 pl-10"
                    placeholder="Ex : Jean"
                  />
                </div>
                <div className="relative">
                  <IdentificationIcon className="h-5 w-5 absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    name="lastName"
                    autoComplete="family-name"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3 pl-10"
                    placeholder="Ex : Dupont"
                  />
                </div>
                {/* Email avec validation */}
                <div className="relative md:col-span-2">
                  <EnvelopeIcon className="h-5 w-5 absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    autoComplete="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={classNames("mt-1 block w-full border rounded-md shadow-sm p-3 pl-10", 
                      isEmailValid ? "border-gray-300" : "border-red-400")}
                    placeholder="Ex : jean.dupont@email.com"
                  />
                  {!isEmailValid && (
                    <span className="text-xs text-red-600 absolute left-0 top-full mt-1 pl-10">
                      Email non valide
                    </span>
                  )}
                </div>
                <div className="relative md:col-span-2">
                  <CakeIcon className="h-5 w-5 absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="date"
                    name="birthDate"
                    value={formData.birthDate}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3 pl-10"
                    placeholder="Date de naissance"
                  />
                </div>
                <div className="relative md:col-span-2">
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    rows="4"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3"
                    placeholder="Bio (max 300 caractères)"
                    maxLength={300}
                  />
                </div>
              </div>
            </section>

            {/* Section enseignant visible que si enseignant */}
            {user?.role === 'enseignant' && (
              <section className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-1">Informations de l'enseignant</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="relative">
                    <AcademicCapIcon className="h-5 w-5 absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      name="specialty"
                      value={formData.specialty}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3 pl-10"
                      placeholder="Spécialité (ex : Mathématiques)"
                    />
                  </div>
                  <div className="relative">
                    <AcademicCapIcon className="h-5 w-5 absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      name="education"
                      value={formData.education}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3 pl-10"
                      placeholder="Diplôme (ex : Doctorat, Master...)"
                    />
                  </div>
                  <div className="relative">
                    <BriefcaseIcon className="h-5 w-5 absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="number"
                      name="yearsOfExperience"
                      value={formData.yearsOfExperience}
                      min="0"
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3 pl-10"
                      placeholder="Ex : 5"
                    />
                  </div>
                </div>
              </section>
            )}

            {/* Bouton Enregistrer + loader/feedback */}
            <div className="mt-8 flex justify-end">
              <button
                type="submit"
                disabled={
                  loading ||
                  !formData.firstName || !formData.lastName || !isEmailValid
                }
                className="bg-e-bosy-purple text-white px-6 py-3 rounded-md hover:bg-purple-700 transition-colors duration-300 disabled:opacity-50 flex items-center space-x-2"
              >
                {loading ? (
                  <>
                    <span className="loader spinner-border spinner-border-sm mr-2" />Enregistrement...
                  </>
                ) : (
                  'Enregistrer'
                )}
              </button>
            </div>
          </form>
        )}

        {activeTab === 'security' && (
          <form onSubmit={handlePasswordUpdate} autoComplete="off">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b border-gray-200 pb-1">Changer le mot de passe</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Mot de passe actuel</label>
                <div className="relative flex items-center">
                  <input
                    type={showPwd ? "text" : "password"}
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 pr-10"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd(!showPwd)}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500"
                    tabIndex={-1}
                  >
                    {showPwd ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Nouveau mot de passe</label>
                <div className="relative flex items-center">
                  <input
                    type={showNewPwd ? "text" : "password"}
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 pr-10"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPwd(!showNewPwd)}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500"
                    tabIndex={-1}
                  >
                    {showNewPwd ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                  </button>
                </div>
                {/* Barre de force du mdp */}
                {pwdStrength && (
                  <span className={classNames(
                    "text-xs font-semibold mt-1 ml-1",
                    pwdStrength === "fort" ? "text-green-600" :
                      pwdStrength === "moyen" ? "text-orange-600" :
                        "text-red-600"
                  )}>
                    Force: {pwdStrength}
                  </span>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Confirmer le mot de passe</label>
                <div className="relative flex items-center">
                  <input
                    type={showConfirmPwd ? "text" : "password"}
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 pr-10"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPwd(!showConfirmPwd)}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500"
                    tabIndex={-1}
                  >
                    {showConfirmPwd ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                  </button>
                </div>
                {passwordData.newPassword && passwordData.confirmPassword && passwordData.newPassword !== passwordData.confirmPassword &&
                  <span className="text-xs text-red-600 block mt-1 ml-1">Les mots de passe ne correspondent pas</span>
                }
              </div>
            </div>
            <div className="mt-8 flex justify-end">
              <button
                type="submit"
                disabled={loading || !passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword}
                className="bg-e-bosy-purple text-white px-6 py-2 rounded-md hover:bg-purple-700 disabled:opacity-50 flex items-center space-x-2"
              >
                {loading ? (
                  <>
                    <span className="loader spinner-border spinner-border-sm mr-2" />Modification...
                  </>
                ) : (
                  'Modifier le mot de passe'
                )}
              </button>
            </div>
          </form>
        )}
      </motion.div>
    </motion.div>
  );
};

export default SettingsPage;
