import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { EnvelopeIcon, LockClosedIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { useAuth } from '../contexts/AuthContext';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login, refreshUser } = useAuth();

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validation simple
      if (!email || !password) {
        throw new Error('Veuillez remplir tous les champs');
      }

      const { success, error, user } = await login(email, password);

      if (!success) {
        throw new Error(error || 'Échec de la connexion');
      }

      toast.success('Connexion réussie!');

      // Redirection après un court délai
      setTimeout(() => {
        refreshUser();
        navigate('/dashboard');
        console.log('User:', user);
      }, 1500);

    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-200 via-pink-200 to-blue-200 flex items-center justify-center p-4">
      {loading && <LoadingSpinner />}

      <div className="bg-white rounded-lg shadow-xl p-8 md:p-10 w-full max-w-md text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Bienvenue à nouveau</h2>
        <p className="text-gray-600 mb-8">Connectez-vous à votre compte pour continuer à apprendre!!</p>


        <form className="space-y-6" onSubmit={handleSubmit}>
          {/* Email Input */}
          <div>
            <label htmlFor="email" className="sr-only">Email</label>
            <div className="relative rounded-md shadow-sm">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <EnvelopeIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
              </div>
              <input
                value={email}
                onChange={e => setEmail(e.target.value)}
                type="email"
                name="email"
                id="email"
                className="block w-full rounded-md border-0 py-2 pl-10 pr-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-e-bosy-purple sm:text-sm sm:leading-6"
                placeholder="your@email.com"
                required
              />
            </div>
          </div>

          {/* Password Input */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label htmlFor="password" className="sr-only">Mot de passe</label>
              <Link to="/forgot-password" className="text-sm font-medium text-e-bosy-purple hover:underline">
                Mot de passse oublier?
              </Link>
            </div>
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
                placeholder="********"
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

          {/* Sign In Button */}
          <div>
            <button
              type="submit"
              disabled={loading}
              className="flex w-full justify-center rounded-md bg-e-bosy-purple px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-purple-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-e-bosy-purple disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Connexion en cours...' : 'Se connecter'}
            </button>
          </div>
        </form>

        {/* Don't have an account? Sign up */}
        <p className="mt-8 text-sm text-gray-600">
          Vous n'avez pas de compte?{' '}
          <Link to="/signup" className="font-medium text-e-bosy-purple hover:underline">
            S'inscrire
          </Link>
        </p>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="space-y-3">
            <button className="w-full py-2 px-4 border border-gray-300 rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 text-sm flex items-center justify-center gap-2">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12.0001 4.75C14.0534 4.75 15.8679 5.48514 17.2625 6.7828L20.0881 3.95725C18.1506 2.12267 15.2289 1 12.0001 1C7.81844 1 4.14816 3.42939 2.45781 7.02706L6.15579 9.87836C7.03058 7.37528 9.38792 5.75 12.0001 5.75L12.0001 4.75ZM23.0001 12C23.0001 11.2721 22.9348 10.5552 22.8087 9.85966H12.0001V14.1403H18.7905C18.6631 14.8872 18.2917 15.5866 17.7554 16.153L20.5969 18.9945C21.9442 17.653 22.75 15.9189 22.75 14L23.0001 12ZM12.0001 23C15.2289 23 18.1506 21.8773 20.0881 20.0427L17.2625 17.2172C15.8679 18.5149 14.0534 19.25 12.0001 19.25C9.38792 19.25 7.03058 17.6247 6.15579 15.1216L2.45781 17.9729C4.14816 21.5706 7.81844 24 12.0001 24L12.0001 23ZM1.25001 12C1.25001 13.2721 1.48839 14.5097 1.94454 15.6791L5.64252 12.8278C5.55627 12.5516 5.50001 12.2743 5.50001 12C5.50001 11.7257 5.55627 11.4484 5.64252 11.1722L1.94454 8.3209C1.48839 9.49033 1.25001 10.7279 1.25001 12Z" /></svg>
              Sign in with Google
            </button>
            <button className="w-full py-2 px-4 border border-gray-300 rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 text-sm flex items-center justify-center gap-2">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.99 3.65 9.17 8.44 9.94v-7.66h-2.54v-2.28h2.54V9.24c0-2.51 1.53-3.87 3.76-3.87 1.08 0 2.01.08 2.28.11v2.5h-1.5c-1.2 0-1.44.57-1.44 1.41v1.85h2.86l-.47 2.28h-2.39v7.66C18.35 21.17 22 16.99 22 12z" /></svg>
              Sign in with Facebook
            </button>
          </div>
        </div>
      </div>

      <ToastContainer />
    </div>
  );
};

export default LoginPage;
