import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { LockClosedIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { Toast } from '../components/Toast';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { apiHelper } from '../services/ApiFetch';

const ResetPasswordPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!password || !confirmPassword) {
        throw new Error('Veuillez remplir tous les champs');
      }

      if (password !== confirmPassword) {
        throw new Error('Les mots de passe ne correspondent pas');
      }

      if (!token) {
        throw new Error('Token de réinitialisation manquant');
      }

      const [response, error] = await apiHelper('post', 'password/reset', { 
        token, 
        newPassword: password
      });

      if (error) {
        throw new Error(error.message || "Échec de la réinitialisation du mot de passe");
      }

      setToast({ 
        show: true, 
        message: 'Votre mot de passe a été réinitialisé avec succès', 
        type: 'success' 
      });

      // Redirection après un court délai
      setTimeout(() => {
        navigate('/login');
      }, 2000);

    } catch (err) {
      setToast({ show: true, message: err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const closeToast = () => {
    setToast({ ...toast, show: false });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-200 via-pink-200 to-blue-200 flex items-center justify-center p-4">
      {loading && <LoadingSpinner />}
      {toast.show && <Toast message={toast.message} type={toast.type} onClose={closeToast} />}

      <div className="bg-white rounded-lg shadow-xl p-8 md:p-10 w-full max-w-md text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Réinitialiser votre mot de passe</h2>
        <p className="text-gray-600 mb-8">Entrez votre nouveau mot de passe</p>

        <form className="space-y-6" onSubmit={handleSubmit}>
          {/* New Password Input */}
          <div>
            <label htmlFor="password" className="sr-only">Nouveau mot de passe</label>
            <div className="relative rounded-md shadow-sm">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <LockClosedIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
              </div>
              <input
                value={password}
                onChange={e => setPassword(e.target.value)}
                type={showPassword ? 'text' : 'password'}
                name="password"
                id="password"
                className="block w-full rounded-md border-0 py-2 pl-10 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-e-bosy-purple sm:text-sm sm:leading-6"
                placeholder="Nouveau mot de passe"
                required
                minLength="6"
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
          </div>

          {/* Confirm Password Input */}
          <div>
            <label htmlFor="confirmPassword" className="sr-only">Confirmer le mot de passe</label>
            <div className="relative rounded-md shadow-sm">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <LockClosedIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
              </div>
              <input
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                type={showPassword ? 'text' : 'password'}
                name="confirmPassword"
                id="confirmPassword"
                className="block w-full rounded-md border-0 py-2 pl-10 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-e-bosy-purple sm:text-sm sm:leading-6"
                placeholder="Confirmer le mot de passe"
                required
                minLength="6"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              disabled={loading}
              className="flex w-full justify-center rounded-md bg-e-bosy-purple px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-purple-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-e-bosy-purple disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Traitement en cours...' : 'Réinitialiser le mot de passe'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordPage;