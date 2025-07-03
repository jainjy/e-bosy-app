import React, { useState, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Swal from 'sweetalert2';
import {
  Squares2X2Icon,
  ArrowRightOnRectangleIcon,
  UserPlusIcon,
  Bars3Icon,
  XMarkIcon,
  BellIcon,
  UserCircleIcon,
  CreditCardIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';

const Navbar = () => {
  const { user, logged, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    const result = await Swal.fire({
      title: 'Êtes-vous sûr?',
      text: "Vous allez être déconnecté!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Oui, déconnectez-moi!',
      cancelButtonText: 'Annuler'
    });

    if (result.isConfirmed) {
      try {
        await logout();
        navigate('/');
      } catch (error) {
        console.error('Logout error:', error);
      }
    }
  };

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-white p-4 shadow-sm flex items-center justify-between">
      <div className="flex items-center">
        <Link to="/" className="text-2xl font-bold text-e-bosy-purple">e-BoSy</Link>
      </div>

      {/* Menu pour desktop */}
      <div className="hidden md:flex items-center space-x-6">
        <Link to="/" className="text-gray-600 hover:text-e-bosy-purple">Home</Link>
        <Link to="/courses" className="text-gray-600 hover:text-e-bosy-purple">Cours</Link>
        <Link to="/about" className="text-gray-600 hover:text-e-bosy-purple">À propos</Link>

        {logged ? (
          <div className="flex items-center space-x-4 relative">
            <BellIcon className="h-6 w-6 text-gray-600 cursor-pointer hover:text-e-bosy-purple" />

            {/* Profile dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setIsProfileDropdownOpen(true)}
              onMouseLeave={() => setIsProfileDropdownOpen(false)}
            >
              <button
                onClick={() => navigate("/dashboard/settings")}
                className="flex items-center focus:outline-none"
              >
                {user?.profilePictureUrl ? (
                  <img
                    src={"http://localhost:5000/" + user.profilePictureUrl}
                    alt="Profile"
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 bg-e-bosy-purple text-white rounded-full flex items-center justify-center text-sm font-semibold">
                    {user?.name ? user.name.charAt(0).toUpperCase() : user?.email.charAt(0).toUpperCase()}
                  </div>
                )}
              </button>
              {isProfileDropdownOpen && (
                <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg z-50 top-6">
                  <Link
                    to="/dashboard"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                  >
                    <Squares2X2Icon className="h-4 w-4 mr-2" />
                    Dashboard
                  </Link>
                  <Link
                    to="/subscription"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                  >
                    <CreditCardIcon className="h-4 w-4 mr-2" />
                    Abonnements
                  </Link>
                  <Link
                    to="/Dashboard/Settings"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                  >
                    <UserCircleIcon className="h-4 w-4 mr-2" />
                    Profile
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsProfileDropdownOpen(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                  >
                    <ArrowRightOnRectangleIcon className="h-4 w-4 mr-2" />
                    Logout
                  </button>
                </div>
              )}
            </div>
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
            Cours
          </Link>
          <Link
            to="/about"
            className="block text-gray-600 hover:text-e-bosy-purple p-2"
            onClick={() => setIsMenuOpen(false)}
          >
            À propos
          </Link>

          {logged ? (
            <>
              <div className="flex items-center p-2 text-gray-600">
                <BellIcon className="h-6 w-6 mr-2" />
                <span>Notifications</span>
              </div>
              <Link
                to="/dashboard"
                className="block bg-e-bosy-purple text-white px-4 py-2 rounded-md flex items-center space-x-2 hover:bg-purple-700"
                onClick={() => setIsMenuOpen(false)}
              >
                <Squares2X2Icon className="h-5 w-5" />
                <span>Dashboard</span>
              </Link>
              <Link
                to="/settings"
                className="block text-gray-600 hover:text-e-bosy-purple flex items-center space-x-1 p-2"
                onClick={() => setIsMenuOpen(false)}
              >
                <UserCircleIcon className="h-5 w-5" />
                <span>Profile</span>
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
