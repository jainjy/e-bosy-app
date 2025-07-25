import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  HomeIcon, AcademicCapIcon, TicketIcon, CreditCardIcon,
  Cog6ToothIcon, UserGroupIcon,
  ClipboardDocumentCheckIcon, VideoCameraIcon, DocumentTextIcon,
  ChevronDoubleLeftIcon, ChevronDoubleRightIcon,
} from "@heroicons/react/24/outline";

const getNavSections = (role) => [
  {
    section: "Navigation",
    items: [
      {
        name: "Tableau de bord",
        icon: HomeIcon,
        path: "/dashboard",
        roles: ["etudiant", "enseignant", "administrateur"],
      },
    ]
  },
  {
    section: "Apprentissage",
    items: [
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
        roles: ["administrateur"],
      },
      {
        name: "Certificats",
        icon: TicketIcon,
        path: "/certificates",
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
        name: "Évaluations",
        icon: ClipboardDocumentCheckIcon,
        path: "/assessments",
        roles: ["etudiant"],
      },
    ]
  },
  {
    section: "Gestion",
    items: [
      {
        name: "Factures",
        icon: DocumentTextIcon,
        path: "/invoices",
        roles: ["etudiant"],
      },
      {
        name: "Abonnements",
        icon: CreditCardIcon,
        path: "/subscription",
        roles: ["etudiant"],
      },
      {
        name: "Paiements",
        icon: CreditCardIcon,
        path: "/payments",
        roles: ["administrateur"],
      },
      {
        name: "Utilisateurs",
        icon: UserGroupIcon,
        path: "/users",
        roles: ["administrateur"],
      },
      {
        name: "Etudiants",
        icon: UserGroupIcon,
        path: "/students",
        roles: ["enseignant"],
      },
    ]
  },
  {
    section: "Personnel",
    items: [
      {
        name: "Paramètres",
        icon: Cog6ToothIcon,
        path: "/settings",
        roles: ["etudiant", "enseignant", "administrateur"],
      },
    ]
  }
];

const Sidebar = ({ userRole, isCollapsed, setIsCollapsed }) => {
  const location = useLocation();
  const navSections = getNavSections(userRole)
    .filter(section => section.items.some(item => item.roles.includes(userRole)));

  return (
    <aside className={`bg-white shadow-xl flex flex-col h-screen transition-all duration-300 ${isCollapsed ? "w-20" : "w-64"} z-30 fixed`}>
      <div className="flex items-center justify-between p-4 border-b border-gray-200 h-16">
        <Link to="/" className={`text-3xl font-extrabold tracking-tight text-e-bosy-purple transition-all ${isCollapsed ? "mx-auto" : ""}`}>
          {isCollapsed ? "EB" : "e-BoSy"}
        </Link>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1 text-gray-500 hover:text-purple-700 rounded-full hover:bg-gray-100"
          aria-label={isCollapsed ? "Ouvrir la barre latérale" : "Réduire la barre latérale"}
        >
          {isCollapsed ? <ChevronDoubleRightIcon className="h-5 w-5" /> : <ChevronDoubleLeftIcon className="h-5 w-5" />}
        </button>
      </div>
      <nav className="flex-1 overflow-y-auto py-2 scrollbar-thin scrollbar-thumb-purple-100 scrollbar-track-transparent">
        <ul className="flex flex-col gap-2 px-2">
          {navSections.map(({ section, items }, i) => (
            <React.Fragment key={section}>
              {items
                .filter(item => item.roles.includes(userRole))
                .map(item => (
                  <li key={item.name}>
                    <Link
                      to={item.path}
                      className={`
                        flex items-center gap-0.5 p-3 rounded-lg group transition-all duration-200 relative text-sm
                        ${location.pathname === item.path ? "bg-gradient-to-r from-purple-700 to-pink-600 text-white shadow" : "text-gray-700 hover:bg-purple-50"}
                        ${isCollapsed ? "justify-center" : ""}
                        text-base font-medium
                      `}
                      title={isCollapsed ? item.name : ""}
                    >
                      <div className="relative">
                        <item.icon className="h-5 w-5" />
                      </div>
                      {!isCollapsed && <span className="ml-3">{item.name}</span>}
                    </Link>
                  </li>
                ))}
              {i < navSections.length - 1 && <li className="mx-1 my-2 border-b border-gray-100" />}
            </React.Fragment>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
