import React, { useState, useRef, useEffect } from "react";
import { BellIcon, MessageCircle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../services/ApiFetch";
import { useAuth } from "../contexts/AuthContext"; // exemple d'import du contexte auth

const Topbar = ({ user, unreadMessageCount, unreadNotificationCount }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { logout } = useAuth(); // ou autre méthode logout
  const navigate = useNavigate();
  const menuRef = useRef();

  // Fermer menu au clic hors zone
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch (err) {
      console.error("Erreur déconnexion :", err);
    }
  };

  return (
    <div className="flex justify-end items-center px-6 py-4 bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="flex items-center gap-6">
        {/* Messages */}
        <Link to="/messages" className="relative group" aria-label="Messages">
          <MessageCircle className="h-6 w-6 text-gray-600 hover:text-purple-700" />
          {unreadMessageCount > 0 && (
            <span className="absolute -top-1 -right-2 bg-red-500 text-white text-xs font-bold min-w-[20px] h-5 flex items-center justify-center rounded-full px-1">
              {unreadMessageCount}
            </span>
          )}
        </Link>

        {/* Notifications */}
        <Link to="/notifications" className="relative group" aria-label="Notifications">
          <BellIcon className="h-6 w-6 text-gray-600 hover:text-purple-700" />
          {unreadNotificationCount > 0 && (
            <span className="absolute -top-1 -right-2 bg-red-500 text-white text-xs font-bold min-w-[20px] h-5 flex items-center justify-center rounded-full px-1">
              {unreadNotificationCount}
            </span>
          )}
        </Link>

        {/* Profil utilisateur avec menu déroulant */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="focus:outline-none focus:ring-2 focus:ring-purple-600 rounded-full"
            aria-haspopup="true"
            aria-expanded={menuOpen}
            aria-label="Menu utilisateur"
            type="button"
          >
            <img
              src={user.profilePictureUrl ? API_BASE_URL + user.profilePictureUrl : "/default-avatar.png"}
              className="w-10 h-10 rounded-full object-cover border-2 border-purple-200"
              alt={`${user.firstName} ${user.lastName} - Profil`}
            />
          </button>

          {/* Menu dropdown */}
          {menuOpen && (
            <div
              className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50"
              role="menu"
              aria-label="Menu utilisateur déroulant"
            >
              <div className="p-3 border-b border-gray-100">
                <p className="font-semibold text-gray-700 truncate">
                  {user.firstName} {user.lastName}
                </p>
                <p className="text-xs text-gray-500 truncate">{user.email}</p>
              </div>
              <Link
                to="/profile"
                className="block px-4 py-2 text-gray-700 hover:bg-purple-100 hover:text-purple-800 transition-colors"
                role="menuitem"
                onClick={() => setMenuOpen(false)}
              >
                Profil
              </Link>
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-100 hover:text-red-700 transition-colors"
                role="menuitem"
                type="button"
              >
                Déconnexion
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Topbar;
