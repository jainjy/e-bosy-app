
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { EnvelopeIcon, LockClosedIcon, EyeIcon, EyeSlashIcon, UserIcon, CalendarIcon, GlobeAltIcon, AcademicCapIcon } from '@heroicons/react/24/outline';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { postData } from '../services/ApiFetch';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const SignupPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    firstName: "",
    lastName: "",
    password: "",
    role: "student",
    bio: "",
    country: "",
    learningStyle: "",
    experienceLevel: "",
    birthDate: "",
    profilePicture: null
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    setFormData(prev => ({
      ...prev,
      profilePicture: e.target.files[0]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validation simple
      if (!formData.email || !formData.password || !formData.firstName || !formData.lastName) {
        throw new Error('Veuillez remplir tous les champs obligatoires');
      }

      const formDataToSend = new FormData();
      for (const key in formData) {
        if (formData[key] !== null && formData[key] !== "") {
          formDataToSend.append(key, formData[key]);
        }
      }

      const [_, error] = await postData('users', formDataToSend, true);

      if (error) {
        throw new Error(error.message || "Erreur lors de l'inscription");
      }

      toast.success('Inscription réussie! Vous pouvez maintenant vous connecter.');

      // Redirection après un court délai
      setTimeout(() => {
        navigate('/login');
      }, 2000);

    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-200 via-pink-200 to-blue-200 flex items-center justify-center p-4">
      {loading && <LoadingSpinner />}

      <div className="bg-white rounded-lg shadow-xl p-8 md:p-10 w-full max-w-md">
        <h2 className="text-3xl font-bold text-gray-800 mb-2 text-center">Créer un compte</h2>
        <p className="text-gray-600 mb-8 text-center">Rejoignez notre communauté d'apprentissage</p>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {/* Email Input */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email*</label>
            <div className="relative rounded-md shadow-sm">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <EnvelopeIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
              </div>
              <input
                value={formData.email}
                onChange={handleChange}
                type="email"
                name="email"
                id="email"
                className="block w-full rounded-md border-0 py-2 pl-10 pr-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-e-bosy-purple sm:text-sm sm:leading-6"
                placeholder="your@email.com"
                required
              />
            </div>
          </div>

          {/* First Name Input */}
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">Prenom*</label>
            <div className="relative rounded-md shadow-sm">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <UserIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
              </div>
              <input
                value={formData.firstName}
                onChange={handleChange}
                type="text"
                name="firstName"
                id="firstName"
                className="block w-full rounded-md border-0 py-2 pl-10 pr-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-e-bosy-purple sm:text-sm sm:leading-6"
                placeholder="Votre prenom"
                required
              />
            </div>
          </div>

          {/* Last Name Input */}
          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">Nom*</label>
            <div className="relative rounded-md shadow-sm">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <UserIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
              </div>
              <input
                value={formData.lastName}
                onChange={handleChange}
                type="text"
                name="lastName"
                id="lastName"
                className="block w-full rounded-md border-0 py-2 pl-10 pr-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-e-bosy-purple sm:text-sm sm:leading-6"
                placeholder="Votre nom"
                required
              />
            </div>
          </div>

          {/* Password Input */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Mot de passe*</label>
            <div className="relative rounded-md shadow-sm">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <LockClosedIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
              </div>
              <input
                value={formData.password}
                onChange={handleChange}
                type={showPassword ? 'text' : 'password'}
                name="password"
                id="password"
                className="block w-full rounded-md border-0 py-2 pl-10 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-e-bosy-purple sm:text-sm sm:leading-6"
                placeholder="********"
                required
                minLength="8"
              />
              <div
                className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer"
                onClick={togglePasswordVisibility}
              >
                {showPassword ? (
                  <EyeSlashIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                ) : (
                  <EyeIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                )}
              </div>
            </div>
            <p className="mt-1 text-xs text-gray-500">Le mot de passe doit contenir au moins 8 caractères</p>
          </div>

          {/* Role Selection */}
          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">Rôle*</label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="block w-full rounded-md border-0 py-2 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-e-bosy-purple sm:text-sm sm:leading-6"
            >
              <option value="student">Etudiant</option>
              <option value="teacher">Enseignant</option>
            </select>
          </div>

          {/* Profile Picture */}
          <div>
            <label htmlFor="profilePicture" className="block text-sm font-medium text-gray-700 mb-1">Photo de profil</label>
            <input
              type="file"
              id="profilePicture"
              name="profilePicture"
              onChange={handleFileChange}
              accept="image/*"
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-semibold
                file:bg-e-bosy-purple file:text-white
                hover:file:bg-purple-700"
            />
          </div>

          {/* Bio */}
          <div>
            <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
            <textarea
              id="bio"
              name="bio"
              rows={3}
              value={formData.bio}
              onChange={handleChange}
              className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-e-bosy-purple sm:text-sm sm:leading-6"
              placeholder="Parlez-nous un peu de vous..."
            />
          </div>

          {/* Country */}
          <div>
            <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">Pays</label>
            <div className="relative rounded-md shadow-sm">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <GlobeAltIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
              </div>
              <input
                value={formData.country}
                onChange={handleChange}
                type="text"
                name="country"
                id="country"
                className="block w-full rounded-md border-0 py-2 pl-10 pr-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-e-bosy-purple sm:text-sm sm:leading-6"
                placeholder="Votre pays"
              />
            </div>
          </div>

          {/* Learning Style */}
          <div>
            <label htmlFor="learningStyle" className="block text-sm font-medium text-gray-700 mb-1">Style d'apprentissage</label>
            <div className="relative rounded-md shadow-sm">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <AcademicCapIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
              </div>
              <input
                value={formData.learningStyle}
                onChange={handleChange}
                type="text"
                name="learningStyle"
                id="learningStyle"
                className="block w-full rounded-md border-0 py-2 pl-10 pr-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-e-bosy-purple sm:text-sm sm:leading-6"
                placeholder="Votre style d'apprentissage"
              />
            </div>
          </div>

          {/* Experience Level */}
          <div>
            <label htmlFor="experienceLevel" className="block text-sm font-medium text-gray-700 mb-1">Niveau d'experience</label>
            <select
              id="experienceLevel"
              name="experienceLevel"
              value={formData.experienceLevel}
              onChange={handleChange}
              className="block w-full rounded-md border-0 py-2 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-e-bosy-purple sm:text-sm sm:leading-6"
            >
              <option value="">Selectionnez...</option>
              <option value="beginner">Debutant</option>
              <option value="intermediate">Intermediaire</option>
              <option value="advanced">Avance</option>
              <option value="expert">Expert</option>
            </select>
          </div>

          {/* Birth Date */}
          <div>
            <label htmlFor="birthDate" className="block text-sm font-medium text-gray-700 mb-1">Date de naissance</label>
            <div className="relative rounded-md shadow-sm">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <CalendarIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
              </div>
              <input
                type="date"
                id="birthDate"
                name="birthDate"
                value={formData.birthDate}
                onChange={handleChange}
                className="block w-full rounded-md border-0 py-2 pl-10 pr-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-e-bosy-purple sm:text-sm sm:leading-6"
              />
            </div>
          </div>

          {/* Sign Up Button */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex w-full justify-center rounded-md bg-e-bosy-purple px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-purple-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-e-bosy-purple disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Inscription en cours...' : 'S\'inscrire'}
            </button>
          </div>
        </form>

        {/* Already have an account? Login */}
        <p className="mt-6 text-sm text-gray-600 text-center">
          Vous avez déjà un compte?{' '}
          <Link to="/login" className="font-medium text-e-bosy-purple hover:underline">
            Se connecter
          </Link>
        </p>
      </div>

      <ToastContainer />
    </div>
  );
};

export default SignupPage;
