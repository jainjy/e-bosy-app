import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';

const MenuLayout = () => {
  const { user } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [unreadMessageCount, setUnreadMessageCount] = useState(0);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);

  useEffect(() => {
    const fetchCounts = async () => {
      // Remplacez ces valeurs statiques par des appels API réels
      setUnreadMessageCount(5);
      setUnreadNotificationCount(3);
    };

    if (user) {
      fetchCounts();
    }
  }, [user]);

  return (
    <div className="flex h-screen">
      {user && (
        <Sidebar
          userRole={user.role}
          isCollapsed={isCollapsed}
          setIsCollapsed={setIsCollapsed}
        />
      )}
      <div className={`flex flex-col flex-1 overflow-hidden transition-all duration-300 ${isCollapsed ? 'ml-20' : 'ml-64'}`}>
        {user && (
          <Topbar
            user={user}
            unreadMessageCount={unreadMessageCount}
            unreadNotificationCount={unreadNotificationCount}
          />
        )}
        <main className="flex-1 overflow-y-auto bg-gray-50 p-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MenuLayout;
