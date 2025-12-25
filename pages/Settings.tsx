
import React from 'react';
import { useStore } from '../context/Store';
import { Link, useNavigate } from 'react-router-dom';

const Settings: React.FC = () => {
  const { user, logout } = useStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const menuItems = [
    { icon: 'store', title: 'Perfil del Negocio', subtitle: 'Nombre, dirección y contacto', path: '#' },
    { icon: 'payments', title: 'Moneda y Pagos', subtitle: 'Configura pesos (ARS), dólares, etc.', path: '#' },
    { icon: 'notifications', title: 'Notificaciones', subtitle: 'Alertas de stock y deudas', path: '#' },
    { icon: 'security', title: 'Seguridad', subtitle: 'Cambiar PIN de acceso', path: '#' },
    { icon: 'help', title: 'Ayuda y Soporte', subtitle: 'Centro de asistencia 24/7', path: '#' },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background-dark text-white pb-24">
      {/* Header */}
      <div className="flex items-center p-4 sticky top-0 z-20 bg-background-dark/95 backdrop-blur-sm border-b border-white/5">
        <h1 className="text-xl font-bold flex-1">Configuración</h1>
      </div>

      {/* User Card */}
      <div className="p-4">
        <div className="flex items-center gap-4 bg-surface-dark p-5 rounded-2xl border border-white/5 shadow-xl">
          <div 
            className="w-16 h-16 rounded-full bg-cover bg-center border-2 border-primary"
            style={{ backgroundImage: `url(${user?.avatarUrl || 'https://i.pravatar.cc/150'})` }}
          ></div>
          <div className="flex-1">
            <h2 className="text-lg font-bold">{user?.name || 'Administrador'}</h2>
            <p className="text-sm text-white/50">{user?.role === 'admin' ? 'Dueño del Negocio' : 'Empleado'}</p>
          </div>
          <Link to={`/users/${user?.id}`} className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-primary">
            <span className="material-symbols-outlined">edit</span>
          </Link>
        </div>
      </div>

      {/* Settings List */}
      <div className="flex flex-col gap-2 px-4 mt-2">
        <h3 className="text-xs font-bold text-white/30 uppercase tracking-widest ml-1 mb-2">General</h3>
        {menuItems.map((item, index) => (
          <button 
            key={index}
            className="flex items-center gap-4 bg-surface-dark p-4 rounded-xl border border-white/5 hover:bg-[#23482f] transition-all active:scale-[0.98]"
          >
            <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined">{item.icon}</span>
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-bold text-white">{item.title}</p>
              <p className="text-xs text-white/40">{item.subtitle}</p>
            </div>
            <span className="material-symbols-outlined text-white/20">chevron_right</span>
          </button>
        ))}
      </div>

      {/* App Info & Logout */}
      <div className="mt-8 px-4 flex flex-col gap-4">
        <button 
          onClick={handleLogout}
          className="flex items-center justify-center gap-2 w-full py-4 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 font-bold hover:bg-red-500/20 transition-all"
        >
          <span className="material-symbols-outlined">logout</span>
          Cerrar Sesión
        </button>
        
        <div className="flex flex-col items-center gap-1 py-4 opacity-30">
          <p className="text-xs font-medium">Versión 1.0.0 (Capacitor Build)</p>
          <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-primary">Gestión 360 Pro</p>
        </div>
      </div>
    </div>
  );
};

export default Settings;
