import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../Components/Sidebar';
import Navbar from '../Components/Navbar';
const DashboardLayout = ({ userRole = 'student', userName = 'John Doe', userEmail = 'student@example.com' }) => {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar userRole={userRole} userName={userName} userEmail={userEmail} />
      <div className="flex-1 flex flex-col">
        <main className="flex-1 p-8 overflow-y-auto mt-10">
          <Outlet /> {/* This is where nested routes will render */}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;