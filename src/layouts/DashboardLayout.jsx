import React from 'react-dom'; // No need for this import, remove it
import { Outlet } from 'react-router-dom'; // <--- Add this import
import { useAuth } from '../services/AuthContext';
import Sidebar from '../components/Sidebar';

const DashboardLayout = () => { // Remove children prop as Outlet handles it
  const { user } = useAuth();

  return (
    <div className="flex h-screen">
      <Sidebar
        userRole={user?.role}
        userName={user?.name}
        userEmail={user?.email}
        userProfilePicture={user?.profilePicture}
      />
      <main className="flex-1 overflow-y-auto bg-gray-50 p-6">
        <Outlet /> {/* <--- This is where your nested routes will render */}
      </main>
    </div>
  );
};

export default DashboardLayout;