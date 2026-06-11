import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import PageErrorBoundary from '../ui/PageErrorBoundary';

const AdminLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(prev => !prev);
  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <div className="flex flex-col min-h-screen w-full">
      <Header onMenuClick={toggleSidebar} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />
        <main className="flex-1 bg-background-light dark:bg-background-dark overflow-y-auto p-6 lg:p-10">
          <div className="w-full">
            <PageErrorBoundary>
              <Outlet />
            </PageErrorBoundary>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
