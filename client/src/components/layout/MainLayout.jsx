// components/layout/MainLayout.jsx - Master layout wrapper
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const MainLayout = () => {
  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden' }}>
      {/* Background */}
      <div className="animated-bg">
        <div className="orb"></div>
        <div className="orb"></div>
        <div className="orb"></div>
      </div>

      {/* Main Container */}
      <div style={{ display: 'flex', width: '100%', position: 'relative', zIndex: 10 }}>
        <Sidebar />
        
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, position: 'relative' }}>
          <Navbar />
          <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainLayout;
