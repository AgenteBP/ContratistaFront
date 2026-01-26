import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const MainLayout = () => {
  return (
    <div className="flex min-h-screen bg-secondary-light">
      {/* 1. El Sidebar fijo a la izquierda */}
      <Sidebar />

      <main className="flex-1 md:ml-64 flex flex-col min-h-screen">
        {/* 2. La Navbar fija arriba */}
        <Navbar />

        <div className="p-6">
          <Outlet />
        </div>

      </main>
    </div>
  );
};

export default MainLayout;