import React from 'react-dom'; 
import { Outlet } from 'react-router-dom'; 
import { useAuth } from '../contexts/AuthContext';
import Sidebar from '../components/Sidebar';

const DashboardLayout = () => { 
  const { user } = useAuth();

  return (
    <div className="flex h-screen">
      <Sidebar
        userRole={user?.role}
        userName={user?.name}
        userEmail={user?.email}
        profilePictureUrl={user?.profilePictureUrl}
      />
      <main className="flex-1 overflow-y-auto bg-gray-50 p-6">
        <Outlet /> 
      </main>
    </div>
  );
};

export default DashboardLayout;