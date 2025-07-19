import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Swal from 'sweetalert2';
import { useAuth } from "../contexts/AuthContext";
import { 
  HomeIcon, AcademicCapIcon, TicketIcon, CreditCardIcon, 
  EnvelopeIcon, ExclamationTriangleIcon, Cog6ToothIcon, 
  ArrowRightOnRectangleIcon, UserGroupIcon, CalendarDaysIcon, 
  ChartBarIcon, ChevronDoubleLeftIcon, ChevronDoubleRightIcon, 
  ClipboardDocumentCheckIcon,
  VideoCameraIcon,
  DocumentTextIcon
} from "@heroicons/react/24/outline";
import { BellIcon } from "lucide-react";
import { API_BASE_URL } from "../services/ApiFetch";

const Sidebar = ({ userRole, userName, userEmail, profilePictureUrl, unreadCount }) => {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { logout } = useAuth();
  const navigate = useNavigate();

  const navItems = [
    {
      name: "Tableau de bord",
      icon: HomeIcon,
      path: "/dashboard",
      roles: ["etudiant", "enseignant", "administrateur"],
    },
    {
      name: "Mes cours",
      icon: AcademicCapIcon,
      path: "/mycourses",
      roles: ["etudiant", "enseignant"],
    },
    {
      name: "Les cours",
      icon: AcademicCapIcon,
      path: "/mycourses",
      roles: [ "administrateur"],
    },
    {
      name: "Certificats",
      icon: TicketIcon,
      path: "/certificates",
      roles: ["etudiant"],
    },
    {
      name: "Abonnements",
      icon: CreditCardIcon,
      path: "/subscription",
      roles: ["etudiant"],
    },
    {
      name: "Messages",
      icon: EnvelopeIcon,
      path: "/messages",
      roles: ["etudiant", "enseignant", "administrateur"],
      badge: unreadCount > 0 ? unreadCount : null
    },
    {
      name: "Notifications",
      icon: BellIcon,
      path: "/notifications",
      roles: ["etudiant", "enseignant", "administrateur"],
    },
    {
      name: "Paramètres",
      icon: Cog6ToothIcon,
      path: "/settings",
      roles: ["etudiant", "enseignant", "administrateur"],
    },
    {
      name: "Utilisateurs",
      icon: UserGroupIcon,
      path: "/users",
      roles: ["administrateur"],
    },
    {
      name: "Évaluations",
      icon: ClipboardDocumentCheckIcon,
      path: "/assessments",
      roles: ["etudiant"],
    },
    {
      name: "Factures",
      icon: DocumentTextIcon,
      path: "/invoices",
      roles: ["etudiant"],
    },
    {
      name: "Sessions en direct",
      icon: VideoCameraIcon,
      path: "/live-sessions",
      roles: ["etudiant", "enseignant"],
    },
    {
      name: "Sessions en direct",
      icon: VideoCameraIcon,
      path: "/admin/live-sessions",
      roles: ["administrateur"],
    },
    {
      name: "Paiements",
      icon: CreditCardIcon,
      path: "/payments",
      roles: ["administrateur"],
    },
  ];

  const filteredItems = navItems.filter((item) => item.roles.includes(userRole));

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
    <div className={`bg-white shadow-md flex flex-col h-full transition-all duration-300 ${isCollapsed ? "w-20" : "w-64"}`}>
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        {!isCollapsed ? (
          <Link to="/" className="text-xl font-bold text-purple-700">e-BoSy</Link>
        ) : (
          <Link to="/" className="text-xl font-bold text-purple-700 mx-auto">EB</Link>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1 text-gray-500 hover:text-purple-700 rounded-full hover:bg-gray-100"
        >
          {isCollapsed ? (
            <ChevronDoubleRightIcon className="h-5 w-5" />
          ) : (
            <ChevronDoubleLeftIcon className="h-5 w-5" />
          )}
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto py-2">
        <ul className="space-y-1 px-2">
          {filteredItems.map((item) => (
            <li key={item.name}>
              <Link
                to={item.path}
                className={`flex items-center p-3 rounded-lg ${
                  location.pathname === item.path 
                    ? "bg-purple-700 text-white" 
                    : "text-gray-700 hover:bg-gray-100"
                }`}
                title={isCollapsed ? item.name : ""}
              >
                <div className="relative">
                  <item.icon className="h-5 w-5" />
                  {item.badge && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs min-w-[20px] h-5 flex items-center justify-center rounded-full px-1">
                      {item.badge}
                    </span>
                  )}
                </div>
                {!isCollapsed && (
                  <>
                    <span className="ml-3">{item.name}</span>
                    {item.badge && (
                      <span className="ml-auto bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className={`p-4 border-t border-gray-200 ${isCollapsed ? "text-center" : ""}`}>
        <div className={`flex ${isCollapsed ? "flex-col items-center" : "items-center space-x-3"} mb-4`}>
          {profilePictureUrl ? (
            <img 
              src={API_BASE_URL+profilePictureUrl} 
              alt="Profile" 
              className="w-10 h-10 rounded-full object-cover" 
            />
          ) : (
            <div className="w-10 h-10 bg-purple-700 text-white rounded-full flex items-center justify-center text-lg font-semibold">
              {userName?.charAt(0).toUpperCase() || 'U'}
            </div>
          )}
          {!isCollapsed && (
            <div className="overflow-hidden">
              <p className="font-semibold text-gray-800 truncate">{userName || userEmail}</p>
              <p className="text-sm text-gray-500 capitalize truncate">{userRole}</p>
            </div>
          )}
        </div>
        <button
          onClick={handleLogout}
          className={`flex items-center p-3 rounded-lg text-gray-700 hover:bg-gray-100 w-full ${
            isCollapsed ? "justify-center" : ""
          }`}
          title={isCollapsed ? "Déconnexion" : ""}
        >
          <ArrowRightOnRectangleIcon className="h-5 w-5" />
          {!isCollapsed && <span className="ml-3">Déconnexion</span>}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;