import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { EnvelopeIcon } from '@heroicons/react/24/outline';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { apiHelper } from '../services/ApiFetch';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!email) {
        throw new Error('Veuillez entrer votre adresse email');
      }

      const [_, error] = await apiHelper('post', 'password/reset-request', { email});

      if (error) {
        throw new Error(error.message || "Une erreur est survenue lors de l'envoi du lien de reinitialisation");
      }

      toast.success('Un lien de réinitialisation a été envoyé à votre adresse email');

      // Redirection après un court delai
      setTimeout(() => {
        navigate('/login');
      }, 3000);

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
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Mot de passe oublie</h2>
        <p className="text-gray-600 mb-8">
          Entrez votre adresse email et nous vous enverrons un lien pour reinitialiser votre mot de passe
        </p>

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

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              disabled={loading}
              className="flex w-full justify-center rounded-md bg-e-bosy-purple px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-purple-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-e-bosy-purple disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Envoi en cours...' : 'Envoyer le lien'}
            </button>
          </div>
        </form>

        {/* Back to login link */}
        <p className="mt-8 text-sm text-gray-600">
          <Link to="/login" className="font-medium text-e-bosy-purple hover:underline">
            Retour à la page de connexion
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;