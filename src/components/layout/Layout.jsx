import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import { useEffect, useState } from 'react';

export default function Layout() {
  const [isSidebarOpen,setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      setIsSidebarOpen(!mobile);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);

  return (
    <div className="flex flex-col h-screen">
      <TopBar  toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen}/>
      <div className="flex flex-1 overflow-hidden pt-14">
        <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} isMobile={isMobile}/>
        <main className={`flex-1 overflow-y-auto bg-gray-50 p-6 transition-all duration-300 ${
            isMobile ? 'ml-0' : isSidebarOpen ? 'ml-56' : 'ml-16'
          }`}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
