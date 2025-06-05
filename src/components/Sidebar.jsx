import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  RectangleStackIcon,
  BookOpenIcon,
  TicketIcon,
  CreditCardIcon,
  EnvelopeIcon,
  ExclamationTriangleIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  UserGroupIcon,
  CalendarDaysIcon,
  ChartBarIcon,
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "../services/AuthContext"; // Ajoutez cette importation
const Sidebar = ({ userRole, userName, userEmail }) => {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const {logout } = useAuth(); // Utilisez les valeurs du contexte
  const navigate = useNavigate();
  const navItems = [
    {
      name: "Overview",
      icon: RectangleStackIcon,
      path: "/dashboard",
      roles: ["student", "teacher", "admin"],
    },
    {
      name: "My Courses",
      icon: BookOpenIcon,
      path: "/dashboard/my-courses",
      roles: ["student"],
    },
    {
      name: "Courses",
      icon: BookOpenIcon,
      path: "/dashboard/courses",
      roles: ["teacher", "admin"],
    },
    {
      name: "Certificates",
      icon: TicketIcon,
      path: "/dashboard/certificates",
      roles: ["student"],
    },
    {
      name: "Purchases",
      icon: CreditCardIcon,
      path: "/dashboard/purchases",
      roles: ["student"],
    },
    {
      name: "Messages",
      icon: EnvelopeIcon,
      path: "/dashboard/messages",
      roles: ["student", "teacher", "admin"],
    },
    {
      name: "Report Issue",
      icon: ExclamationTriangleIcon,
      path: "/dashboard/reports",
      roles: ["student", "teacher", "admin"],
    },
    {
      name: "Settings",
      icon: Cog6ToothIcon,
      path: "/dashboard/settings",
      roles: ["student", "teacher", "admin"],
    },
    {
      name: "Users",
      icon: UserGroupIcon,
      path: "/dashboard/users",
      roles: ["admin"],
    },
    {
      name: "Événements",
      icon: CalendarDaysIcon,
      path: "/dashboard/events",
      roles: ["admin", "teacher"],
    },
    {
      name: "Analytics",
      icon: ChartBarIcon,
      path: "/dashboard/analytics",
      roles: ["admin", "teacher"],
    },
  ];

  const filteredItems = navItems.filter((item) =>
    item.roles.includes(userRole)
  );

  return (
    <div
      className={`bg-white shadow-md flex flex-col h-full transition-all duration-300 ${
        isCollapsed ? "w-20" : "w-64"
      }`}
    >
      <div className=" m-auto flex items-center mt-2">
        <Link to={"/"} className="text-2xl font-bold text-e-bosy-purple">e-BoSy</Link>
      </div>
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="p-2 text-gray-500 hover:text-e-bosy-purple self-end"
      >
        {isCollapsed ? (
          <ChevronDoubleRightIcon className="h-5 w-5" />
        ) : (
          <ChevronDoubleLeftIcon className="h-5 w-5" />
        )}
      </button>

      <nav className="flex-1 overflow-y-auto">
        <ul className="space-y-2 p-2">
          {filteredItems.map((item) => (
            <li key={item.name}>
              <Link
                to={item.path}
                className={`flex items-center p-3 rounded-lg ${
                  location.pathname === item.path
                    ? "bg-e-bosy-purple text-white"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
                title={isCollapsed ? item.name : ""}
              >
                <item.icon className="h-5 w-5" />
                {!isCollapsed && <span className="ml-3">{item.name}</span>}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div
        className={`p-4 border-t border-gray-200 ${
          isCollapsed ? "text-center" : ""
        }`}
      >
        <div
          className={`flex ${
            isCollapsed ? "flex-col items-center" : "items-center space-x-3"
          } mb-4`}
        >
          <div className="w-10 h-10 bg-e-bosy-purple text-white rounded-full flex items-center justify-center text-lg font-semibold">
            {userName ? userName.charAt(0).toUpperCase() : "S"}
            {userRole === "admin" && userName
              ? userName.charAt(1).toUpperCase()
              : ""}
          </div>
          {!isCollapsed && (
            <div>
              <p className="font-semibold text-gray-800">
                {userName || userEmail}
              </p>
              <p className="text-sm text-gray-500 capitalize">{userRole}</p>
            </div>
          )}
        </div>
<button
  onClick={async () => {
    await logout();
    navigate('/');
  }}
  className={`flex items-center p-3 rounded-lg text-gray-700 hover:bg-gray-100 w-full ${
    isCollapsed ? "justify-center" : ""
  }`}
  title={isCollapsed ? "Sign out" : ""}
>
  <ArrowRightOnRectangleIcon className="h-5 w-5" />
  {!isCollapsed && <span className="ml-3">Sign out</span>}
</button>
      </div>
    </div>
  );
};

export default Sidebar;
