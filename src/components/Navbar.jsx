import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ShoppingCartIcon, 
  Squares2X2Icon, 
  ArrowRightOnRectangleIcon, 
  UserPlusIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../services/AuthContext'; // Importez le contexte d'authentification

const Navbar = () => {
  const { user, logged, logout } = useAuth(); // Utilisez les valeurs du contexte
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/'); // Redirige vers la page d'accueil après déconnexion
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-white p-4 shadow-sm flex items-center justify-between">
      <div className="flex items-center">
        <Link to={"/"} className="text-2xl font-bold text-e-bosy-purple">e-BoSy</Link>
      </div>

      {/* Menu pour desktop */}
      <div className="hidden md:flex items-center space-x-6">
        <Link to="/" className="text-gray-600 hover:text-e-bosy-purple">Home</Link>
        <Link to="/courses" className="text-gray-600 hover:text-e-bosy-purple">Courses</Link>
        <Link to="/about" className="text-gray-600 hover:text-e-bosy-purple">About</Link>
        <ShoppingCartIcon className="h-6 w-6 text-gray-600 cursor-pointer hover:text-e-bosy-purple" />

        {logged ? (
          <div className="flex items-center space-x-4">
            <Link to="/dashboard" className="bg-e-bosy-purple text-white px-4 py-2 rounded-md flex items-center space-x-2 hover:bg-purple-700">
              <Squares2X2Icon className="h-5 w-5" />
              <span>Dashboard</span>
            </Link>
            <button
              onClick={handleLogout}
              className="text-gray-600 hover:text-e-bosy-purple flex items-center space-x-1"
            >
              <ArrowRightOnRectangleIcon className="h-5 w-5" />
              <span>Logout</span>
            </button>
            {user && (
              <div className="w-8 h-8 bg-e-bosy-purple text-white rounded-full flex items-center justify-center text-sm font-semibold">
                {user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
        ) : (
          <>
            <Link
              to="/login"
              className="text-gray-600 hover:text-e-bosy-purple flex items-center space-x-1"
            >
              <ArrowRightOnRectangleIcon className="h-5 w-5" />
              <span>Sign In</span>
            </Link>
            <Link
              to="/signup"
              className="bg-e-bosy-purple text-white px-4 py-2 rounded-md flex items-center space-x-2 hover:bg-purple-700"
            >
              <UserPlusIcon className="h-5 w-5" />
              <span>Sign Up</span>
            </Link>
          </>
        )}
      </div>

      {/* Bouton hamburger pour mobile */}
      <button 
        className="md:hidden text-gray-600 focus:outline-none"
        onClick={() => setIsMenuOpen(!isMenuOpen)}
      >
        {isMenuOpen ? (
          <XMarkIcon className="h-6 w-6" />
        ) : (
          <Bars3Icon className="h-6 w-6" />
        )}
      </button>

      {/* Menu mobile */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 right-0 bg-white shadow-lg p-4 space-y-4">
          <Link 
            to="/" 
            className="block text-gray-600 hover:text-e-bosy-purple p-2"
            onClick={() => setIsMenuOpen(false)}
          >
            Home
          </Link>
          <Link 
            to="/courses" 
            className="block text-gray-600 hover:text-e-bosy-purple p-2"
            onClick={() => setIsMenuOpen(false)}
          >
            Courses
          </Link>
          <Link 
            to="/about" 
            className="block text-gray-600 hover:text-e-bosy-purple p-2"
            onClick={() => setIsMenuOpen(false)}
          >
            About
          </Link>
          <div className="flex items-center p-2 text-gray-600">
            <ShoppingCartIcon className="h-6 w-6 mr-2" />
            <span>Cart</span>
          </div>

          {logged ? (
            <>
              <Link 
                to="/dashboard" 
                className="block bg-e-bosy-purple text-white px-4 py-2 rounded-md flex items-center space-x-2 hover:bg-purple-700"
                onClick={() => setIsMenuOpen(false)}
              >
                <Squares2X2Icon className="h-5 w-5" />
                <span>Dashboard</span>
              </Link>
              <button
                onClick={() => {
                  handleLogout();
                  setIsMenuOpen(false);
                }}
                className="block text-gray-600 hover:text-e-bosy-purple flex items-center space-x-1 p-2 w-full text-left"
              >
                <ArrowRightOnRectangleIcon className="h-5 w-5" />
                <span>Logout</span>
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="block text-gray-600 hover:text-e-bosy-purple flex items-center space-x-1 p-2"
                onClick={() => setIsMenuOpen(false)}
              >
                <ArrowRightOnRectangleIcon className="h-5 w-5" />
                <span>Sign In</span>
              </Link>
              <Link
                to="/signup"
                className="block bg-e-bosy-purple text-white px-4 py-2 rounded-md flex items-center space-x-2 hover:bg-purple-700"
                onClick={() => setIsMenuOpen(false)}
              >
                <UserPlusIcon className="h-5 w-5" />
                <span>Sign Up</span>
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;