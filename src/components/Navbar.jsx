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
    <nav className="fixed top-0 left-0 w-full z-50 bg-white backdrop-blur-sm bg-opacity-90 shadow-md p-4 flex items-center justify-between">
      {/* Logo */}
      <div className="flex items-center">
        <Link to="/" className="text-3xl font-extrabold text-e-bosy-purple tracking-tight select-none">
          e-BoSy
        </Link>
      </div>

      {/* Menu desktop */}
      <div className="hidden md:flex items-center space-x-8 font-medium text-gray-700 select-none">
        {[
          { name: 'Home', to: '/' },
          { name: 'Cours', to: '/courses' },
          { name: 'À propos', to: '/about' },
        ].map(({ name, to }) => (
          <Link
            key={name}
            to={to}
            className="relative group hover:text-e-bosy-purple transition-colors"
          >
            {name}
            <span className="block max-w-0 group-hover:max-w-full transition-all duration-300 h-[2px] bg-e-bosy-purple rounded mt-1"></span>
          </Link>
        ))}

        {/* Sign In */}
        <Link
          to="/login"
          className="flex items-center space-x-1 text-gray-600 hover:text-e-bosy-purple transition-colors"
        >
          <ArrowRightOnRectangleIcon className="h-5 w-5" />
          <span className="font-semibold">Sign In</span>
        </Link>

        {/* Sign Up */}
        <Link
          to="/signup"
          className="bg-e-bosy-purple text-white px-5 py-2 rounded-md flex items-center space-x-2 shadow-md hover:bg-purple-700 transition-colors font-semibold select-none"
        >
          <UserPlusIcon className="h-5 w-5" />
          <span>Sign Up</span>
        </Link>
      </div>

      {/* Hamburger mobile button */}
      <button
        className="md:hidden text-gray-700 hover:text-e-bosy-purple focus:outline-none focus:ring-2 focus:ring-e-bosy-purple rounded-md p-1 transition-colors"
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        aria-label={isMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
      >
        {isMenuOpen ? (
          <XMarkIcon className="h-7 w-7" />
        ) : (
          <Bars3Icon className="h-7 w-7" />
        )}
      </button>

      {/* Menu mobile */}
      {isMenuOpen && (
        <div
          className="md:hidden fixed top-16 left-4 right-4 bg-white/90 backdrop-blur-md rounded-lg shadow-lg p-6 flex flex-col gap-5 font-medium z-50 border border-purple-200"
          onClick={() => setIsMenuOpen(false)}
        >
          {[
            { name: 'Home', to: '/' },
            { name: 'Cours', to: '/courses' },
            { name: 'À propos', to: '/about' },
          ].map(({ name, to }) => (
            <Link
              key={name}
              to={to}
              className="text-gray-700 hover:text-e-bosy-purple transition-colors text-lg"
            >
              {name}
            </Link>
          ))}

          <Link
            to="/login"
            className="flex items-center space-x-2 text-gray-700 hover:text-e-bosy-purple"
          >
            <ArrowRightOnRectangleIcon className="h-6 w-6" />
            <span className="font-semibold">Sign In</span>
          </Link>

          <Link
            to="/signup"
            className="bg-e-bosy-purple text-white px-5 py-2 rounded-md flex items-center space-x-2 shadow-md hover:bg-purple-700 transition-colors font-semibold"
          >
            <UserPlusIcon className="h-6 w-6" />
            <span>Sign Up</span>
          </Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
