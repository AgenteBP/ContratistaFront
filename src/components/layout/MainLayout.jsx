import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const MainLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Mobile state
  const [isSidebarPinned, setIsSidebarPinned] = useState(true); // Desktop state: Pinned by default

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);
  const togglePin = () => setIsSidebarPinned(!isSidebarPinned);

  return (
    <div className="flex min-h-screen bg-secondary-light">
      <Sidebar
        isOpen={isSidebarOpen}
        isPinned={isSidebarPinned}
        togglePin={togglePin}
        closeMobile={closeSidebar}
      />

      {/* Main Content Margin Adjustment */}
      <main className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ease-out overflow-x-hidden w-full ${isSidebarPinned ? 'md:ml-64' : 'md:ml-20'}`}>
        <Navbar onToggleSidebar={toggleSidebar} />

        <div className="p-4 md:p-6 fade-in">
          <Outlet />
        </div>

      </main>
    </div>
  );
};

export default MainLayout;