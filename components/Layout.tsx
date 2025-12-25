
import React, { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import BottomNav from './BottomNav';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const isLoginPage = location.pathname === '/';

  return (
    <div className="min-h-screen w-full bg-black flex justify-center items-start">
      <div className={`w-full max-w-md min-h-screen bg-background-dark relative shadow-2xl overflow-x-hidden ${!isLoginPage ? 'pb-16' : ''}`}>
        {children}
        <BottomNav />
      </div>
    </div>
  );
};

export default Layout;
