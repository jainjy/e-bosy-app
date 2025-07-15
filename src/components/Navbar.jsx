import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRightOnRectangleIcon,
  UserPlusIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-white p-4 shadow-sm flex items-center justify-between mb-11">
      <div className="flex items-center">
        <Link to="/" className="text-2xl font-bold text-e-bosy-purple">e-BoSy</Link>
      </div>

      {/* Menu pour desktop */}
      <div className="hidden md:flex items-center space-x-6">
        <Link to="/" className="text-gray-600 hover:text-e-bosy-purple">Home</Link>
        <Link to="/courses" className="text-gray-600 hover:text-e-bosy-purple">Cours</Link>
        <Link to="/about" className="text-gray-600 hover:text-e-bosy-purple">À propos</Link>

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
        </div>
      )}
    </nav>
  );
};

export default Navbar;
