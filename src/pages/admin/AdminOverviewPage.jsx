import React from 'react';
import { 
  UsersIcon, 
  BookOpenIcon, 
  CurrencyDollarIcon, 
  ComputerDesktopIcon,  
  Cog6ToothIcon
} from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';

const AdminOverviewPage = () => {
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">Tableau de Bord Admin</h1>
      <p className="text-gray-600 mb-8">Bienvenue ! Voici un aperçu de votre plateforme.</p>

      {/* Tabs */}
      <div className="mb-8">
        <div className="sm:hidden">
          <label htmlFor="tabs" className="sr-only">Sélectionner un onglet</label>
          <select id="tabs" name="tabs" className="block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-e-bosy-purple focus:outline-none focus:ring-e-bosy-purple sm:text-sm">
            <option>Aperçu</option>
            <option>Utilisateurs</option>
            <option>Cours</option>
            <option>Système</option>
          </select>
        </div>
        <div className="hidden sm:block">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            <a href="#" className="border-b-2 border-e-bosy-purple px-1 py-4 text-sm font-medium text-e-bosy-purple">Aperçu</a>
            <a href="#" className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 px-1 py-4 text-sm font-medium">Utilisateurs</a>
            <a href="#" className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 px-1 py-4 text-sm font-medium">Cours</a>
            <a href="#" className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 px-1 py-4 text-sm font-medium">Système</a>
          </nav>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Users */}
        <div className="bg-white p-6 rounded-lg shadow flex items-start justify-between">
          <div>
            <p className="text-gray-500 text-sm">Total Utilisateurs</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">2,834</p>
            <p className="text-sm text-green-500 mt-1">
              <span className="inline-block transform rotate-45 mr-1">↑</span> +12.5% par rapport au mois dernier
            </p>
          </div>
          <UsersIcon className="h-8 w-8 text-gray-400" />
        </div>

        {/* Active Courses */}
        <div className="bg-white p-6 rounded-lg shadow flex items-start justify-between">
          <div>
            <p className="text-gray-500 text-sm">Cours Actifs</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">147</p>
            <p className="text-sm text-green-500 mt-1">
              <span className="inline-block transform rotate-45 mr-1">↑</span> +4.3% par rapport au mois dernier
            </p>
          </div>
          <BookOpenIcon className="h-8 w-8 text-gray-400" />
        </div>

        {/* Revenue */}
        <div className="bg-white p-6 rounded-lg shadow flex items-start justify-between">
          <div>
            <p className="text-gray-500 text-sm">Revenu</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">28,419 $</p>
            <p className="text-sm text-green-500 mt-1">
              <span className="inline-block transform rotate-45 mr-1">↑</span> +8.2% par rapport au mois dernier
            </p>
          </div>
          <CurrencyDollarIcon className="h-8 w-8 text-gray-400" />
        </div>

        {/* System Health */}
        <div className="bg-white p-6 rounded-lg shadow flex items-start justify-between">
          <div>
            <p className="text-gray-500 text-sm">État du Système</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">98.7%</p>
            <p className="text-sm text-red-500 mt-1">
              <span className="inline-block transform rotate-135 mr-1">↓</span> -0.3% par rapport au mois dernier
            </p>
          </div>
          <ComputerDesktopIcon className="h-8 w-8 text-gray-400" />
        </div>
      </div>

      {/* User Statistics & Course Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* User Statistics */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Statistiques des Utilisateurs</h3>
          <div className="mb-4">
            <p className="text-gray-600 mb-2">Utilisateurs Actifs</p>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div className="bg-e-bosy-purple h-2.5 rounded-full" style={{ width: '76%' }}></div>
            </div>
            <span className="text-sm text-gray-500 float-right">76%</span>
          </div>
          <div className="grid grid-cols-2 gap-4 text-center mt-6">
            <div>
              <p className="text-xl font-bold text-gray-900">2834</p>
              <p className="text-gray-500 text-sm">Total Utilisateurs</p>
            </div>
            <div>
              <p className="text-xl font-bold text-gray-900">187</p>
              <p className="text-gray-500 text-sm">Nouveaux ce Mois-ci</p>
            </div>
          </div>
          <div className="mt-6">
            <p className="text-gray-600 mb-2">Distribution des Utilisateurs</p>
            <div className="flex flex-wrap gap-2">
              <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">Étudiants: 2451</span>
              <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">Professeurs: 312</span>
              <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded-full">Admins: 71</span>
            </div>
          </div>
          <div className="mt-6 text-center">
            <Link to="/users" className="text-e-bosy-purple hover:underline text-sm">Voir Tous les Utilisateurs</Link>
          </div>
        </div>

        {/* Course Statistics */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Statistiques des Cours</h3>
          <div className="mb-4">
            <p className="text-gray-600 mb-2">Cours Actifs</p>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div className="bg-e-bosy-purple h-2.5 rounded-full" style={{ width: '92%' }}></div>
            </div>
            <span className="text-sm text-gray-500 float-right">92%</span>
          </div>
          <div className="grid grid-cols-3 gap-4 text-center mt-6">
            <div>
              <p className="text-xl font-bold text-gray-900">147</p>
              <p className="text-gray-500 text-sm">Total</p>
            </div>
            <div>
              <p className="text-xl font-bold text-gray-900">8</p>
              <p className="text-gray-500 text-sm">En Attente</p>
            </div>
            <div>
              <p className="text-xl font-bold text-gray-900">4</p>
              <p className="text-gray-500 text-sm">Brouillons</p>
            </div>
          </div>
          <div className="mt-6">
            <h4 className="text-gray-600 mb-2">Cours Populaires</h4>
            <ul className="space-y-2 text-sm text-gray-800">
              <li className="flex justify-between items-center">Bootcamp Développement Web <span>485 étudiants</span></li>
              <li className="flex justify-between items-center">Python pour la Science des Données <span>412 étudiants</span></li>
              <li className="flex justify-between items-center">Développement d'Applications Mobiles <span>378 étudiants</span></li>
            </ul>
          </div>
          <div className="mt-6 text-center">
            <Link to="/courses" className="text-e-bosy-purple hover:underline text-sm">Voir Tous les Cours</Link>
          </div>
        </div>
      </div>

      {/* Recent Issues & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Issues */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Problèmes Récents</h3>
          <div className="space-y-4">
            {/* Issue 1 */}
            <div className="border border-gray-200 rounded-md p-4">
              <div className="flex justify-between items-center mb-1">
                <span className="text-gray-800 font-medium">Lecture vidéo échouant sur les appareils iOS</span>
                <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-0.5 rounded-full">Élevée</span>
              </div>
              <p className="text-gray-600 text-sm">
                <span className="text-e-bosy-purple mr-1">•</span> Ouvert <span className="mx-1">•</span> Il y a 2 heures
              </p>
            </div>
            {/* Issue 2 */}
            <div className="border border-gray-200 rounded-md p-4">
              <div className="flex justify-between items-center mb-1">
                <span className="text-gray-800 font-medium">Délai d'attente de la passerelle de paiement</span>
                <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2 py-0.5 rounded-full">Critique</span>
              </div>
              <p className="text-gray-600 text-sm">
                <span className="text-e-bosy-purple mr-1">•</span> En Cours <span className="mx-1">•</span> Il y a 5 heures
              </p>
            </div>
            {/* Issue 3 */}
            <div className="border border-gray-200 rounded-md p-4">
              <div className="flex justify-between items-center mb-1">
                <span className="text-gray-800 font-medium">Erreur de génération de certificat</span>
                <span className="bg-orange-100 text-orange-800 text-xs font-medium px-2 py-0.5 rounded-full">Moyenne</span>
              </div>
              <p className="text-gray-600 text-sm">
                <span className="text-e-bosy-purple mr-1">•</span> Ouvert <span className="mx-1">•</span> Il y a 12 heures
              </p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Actions Rapides</h3>
          <div className="grid grid-cols-2 gap-4">
            <Link to="/users" className="bg-gray-100 p-4 rounded-lg flex flex-col items-center justify-center text-center hover:bg-gray-200">
              <UsersIcon className="h-6 w-6 text-e-bosy-purple mb-2" />
              <span className="text-gray-700 text-sm">Ajouter un Utilisateur</span>
            </Link>
            <Link to="/courses" className="bg-gray-100 p-4 rounded-lg flex flex-col items-center justify-center text-center hover:bg-gray-200">
              <BookOpenIcon className="h-6 w-6 text-e-bosy-purple mb-2" />
              <span className="text-gray-700 text-sm">Ajouter un Cours</span>
            </Link>
            <Link to="/settings" className="bg-gray-100 p-4 rounded-lg flex flex-col items-center justify-center text-center hover:bg-gray-200">
              <Cog6ToothIcon className="h-6 w-6 text-e-bosy-purple mb-2" />
              <span className="text-gray-700 text-sm">Paramètres</span>
            </Link>
          </div>
          <div className="mt-6">
            <button className="w-full flex items-center justify-center bg-e-bosy-purple text-white py-3 rounded-md hover:bg-purple-700">
              <span className="mr-2">📈</span>
              <span>Analytique du Système</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOverviewPage;