import React from 'react-dom'; 
import { Outlet } from 'react-router-dom'; 
import { useAuth } from '../contexts/AuthContext';
import Sidebar from '../components/Sidebar';
import Navbar from '../Components/Navbar';

const MenuLayout = () => { 
  const { user } = useAuth();

  return (
    <div className="flex h-screen">
      
      {user?<Sidebar
        userRole={user?.role}
        userName={user?.firstName+" "+user?.lastName}
        userEmail={user?.email}
        profilePictureUrl={user?.profilePictureUrl}
      />:<Navbar/>}
      <main className="flex-1 overflow-y-auto bg-gray-50 p-6">
        <Outlet /> 
      </main>
    </div>
  );
};

export default MenuLayout;