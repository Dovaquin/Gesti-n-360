
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';

const BottomNav: React.FC = () => {
  const location = useLocation();
  
  // Definimos las rutas principales donde SÍ queremos ver la barra
  const mainTabs = ['/dashboard', '/transactions', '/inventory', '/customers', '/settings', '/users'];
  const isMainTab = mainTabs.includes(location.pathname);

  // Si no es una pestaña principal (ej. es un /new o /:id), no mostramos la barra
  if (!isMainTab) return null;

  const navItems = [
    { path: '/dashboard', icon: 'home', label: 'Inicio' },
    { path: '/transactions', icon: 'history', label: 'Actividad' },
    { path: '/inventory', icon: 'inventory_2', label: 'Inventario' },
    { path: '/customers', icon: 'groups', label: 'Clientes' },
    { path: '/settings', icon: 'settings', label: 'Ajustes' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 flex h-16 w-full items-center justify-around border-t border-white/10 bg-background-dark/80 backdrop-blur-md px-2 pb-safe animate-in slide-in-from-bottom-full duration-300">
      {navItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          className={({ isActive }) => 
            `relative flex flex-col items-center justify-center gap-1 transition-all duration-200 w-16 h-full ${
              isActive ? 'text-primary' : 'text-white/40 hover:text-white/70'
            }`
          }
        >
          <span className={`material-symbols-outlined text-2xl transition-transform ${location.pathname === item.path ? 'scale-110' : ''}`}>
            {item.icon}
          </span>
          <span className="text-[10px] font-bold uppercase tracking-wider">{item.label}</span>
          {location.pathname === item.path && (
            <div className="absolute -bottom-1 h-1 w-1 rounded-full bg-primary shadow-[0_0_8px_#13ec5b]"></div>
          )}
        </NavLink>
      ))}
    </nav>
  );
};

export default BottomNav;
