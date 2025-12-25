
import React, { useState, useEffect } from 'react';
import { useStore } from '../context/Store';
import { useNavigate } from 'react-router-dom';

const Login: React.FC = () => {
  const { users, login, isAuthenticated, loading, addUser } = useStore();
  const [pin, setPin] = useState<string>('');
  const [error, setError] = useState<boolean>(false);
  const [showSetup, setShowSetup] = useState<boolean>(false);
  
  // States for first-time setup
  const [adminName, setAdminName] = useState('');
  const [adminPin, setAdminPin] = useState('');
  
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  // Detect if database is empty to show setup
  useEffect(() => {
    if (!loading && users.length === 0) {
      setShowSetup(true);
    } else if (!loading && users.length > 0) {
      setShowSetup(false);
    }
  }, [loading, users]);

  const handleDigitClick = (digit: string) => {
    if (pin.length < 4) {
      setPin(prev => prev + digit);
      setError(false);
    }
  };

  const handleDelete = () => {
    setPin(prev => prev.slice(0, -1));
    setError(false);
  };

  useEffect(() => {
    if (pin.length === 4 && !showSetup) {
      const success = login(pin);
      if (!success) {
        setError(true);
        setTimeout(() => setPin(''), 500);
      }
    }
  }, [pin, login, showSetup]);

  const handleCreateFirstAdmin = async () => {
    if (!adminName || adminPin.length !== 4) return;
    
    await addUser({
      id: 'admin_initial',
      name: adminName,
      pin: adminPin,
      role: 'admin',
      avatarUrl: `https://ui-avatars.com/api/?name=${adminName}&background=13ec5b&color=102216`,
      permissions: {
        inventory: true,
        sales: true,
        customers: true,
        reports: true
      }
    });
    
    // Auto-login after creation
    login(adminPin);
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background-dark">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-primary font-bold tracking-widest text-xs uppercase animate-pulse">Conectando a la Nube...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex h-screen min-h-screen w-full flex-col bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#1a3825] to-[#102216] text-white overflow-hidden">
      <main className="flex flex-col flex-grow items-center justify-center px-6 py-12">
        
        {showSetup ? (
          /* Initial Setup View */
          <div className="w-full max-w-sm animate-in fade-in zoom-in duration-500 flex flex-col gap-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-primary/30">
                <span className="material-symbols-outlined text-4xl text-primary">admin_panel_settings</span>
              </div>
              <h1 className="text-3xl font-bold tracking-tight mb-2">Configuración Inicial</h1>
              <p className="text-white/60 text-sm">Crea tu cuenta de administrador para empezar a gestionar tu negocio.</p>
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-primary uppercase tracking-widest ml-1">Tu Nombre</label>
                <input 
                  type="text"
                  placeholder="Ej. Juan Pérez"
                  className="bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                  value={adminName}
                  onChange={(e) => setAdminName(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-primary uppercase tracking-widest ml-1">Crea tu PIN (4 dígitos)</label>
                <input 
                  type="tel"
                  maxLength={4}
                  placeholder="0000"
                  className="bg-white/5 border border-white/10 rounded-xl p-4 text-white text-center text-2xl tracking-[1em] font-mono focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                  value={adminPin}
                  onChange={(e) => setAdminPin(e.target.value.replace(/\D/g, ''))}
                />
              </div>

              <button 
                onClick={handleCreateFirstAdmin}
                disabled={!adminName || adminPin.length !== 4}
                className="mt-4 bg-primary text-background-dark font-bold py-4 rounded-xl shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:grayscale"
              >
                Comenzar ahora
              </button>
            </div>
          </div>
        ) : (
          /* Standard PIN View */
          <div className="flex flex-col items-center justify-between h-full w-full max-w-sm">
            <div className="flex flex-col items-center gap-2 mt-8 animate-in fade-in slide-in-from-top-4 duration-500">
              <h1 className="tracking-tight text-3xl font-bold leading-tight text-center">Ingresá tu PIN</h1>
              <p className="text-white/70 text-base font-normal leading-normal text-center">
                Bienvenido de vuelta
              </p>
            </div>

            <div className="flex flex-col items-center gap-4 my-8">
              <div className="flex items-center justify-center gap-6">
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className={`w-4 h-4 rounded-full transition-all duration-300 ${
                      i < pin.length 
                        ? error ? 'bg-red-500 animate-bounce' : 'bg-primary scale-125' 
                        : 'bg-[#326744]'
                    }`}
                  ></div>
                ))}
              </div>
              <p className={`text-sm font-bold leading-normal text-center h-5 transition-opacity ${error ? 'text-red-500 opacity-100' : 'text-[#92c9a4] opacity-0'}`}>
                PIN INCORRECTO
              </p>
            </div>

            <div className="w-full grid grid-cols-3 gap-6 mb-8">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                <button
                  key={num}
                  onClick={() => handleDigitClick(num.toString())}
                  className="flex items-center justify-center h-20 w-20 mx-auto text-3xl font-light text-white rounded-full bg-white/5 hover:bg-white/10 active:scale-90 transition-all focus:outline-none border border-white/5"
                >
                  {num}
                </button>
              ))}
              
              <div className="h-20 w-20"></div>
              
              <button
                onClick={() => handleDigitClick('0')}
                className="flex items-center justify-center h-20 w-20 mx-auto text-3xl font-light text-white rounded-full bg-white/5 hover:bg-white/10 active:scale-90 transition-all focus:outline-none border border-white/5"
              >
                0
              </button>
              
              <button
                onClick={handleDelete}
                className="flex items-center justify-center h-20 w-20 mx-auto text-white/50 rounded-full hover:bg-white/10 transition-all focus:outline-none"
              >
                <span className="material-symbols-outlined text-3xl">backspace</span>
              </button>
            </div>

            <button className="text-primary text-sm font-medium hover:underline mb-4 opacity-50">
              ¿Olvidaste tu PIN?
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default Login;
