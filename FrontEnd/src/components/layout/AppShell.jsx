import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import Breadcrumbs from './Breadcrumbs';

const AppShell = () => {
  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans text-gray-900">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar />
        
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">
            <Breadcrumbs />
            <div className="fade-in-up">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AppShell;
