import React, { useState } from 'react';
import { Search, User, LogOut, Settings, Activity, Menu, UtensilsCrossed } from 'lucide-react';

interface PanelbarraProps {
  onToggleSidebar?: () => void;
  onLogout: () => void;
  onSearch?: (term: string) => void;
}

export const Panelbarra: React.FC<PanelbarraProps> = ({ onToggleSidebar, onLogout, onSearch }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    if (onSearch) onSearch(e.target.value);
  };

  return (
    <nav className="h-14 bg-stone-950 border-b border-stone-800 flex items-center justify-between px-4 sticky top-0 z-30">
      
      {/* Brand & Sidebar Toggle */}
      <div className="flex items-center gap-4">
        <button
          onClick={onToggleSidebar}
          className="p-1.5 rounded-lg text-stone-400 hover:text-stone-100 hover:bg-stone-900 transition-colors"
          title="Alternar Menú Lateral"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <UtensilsCrossed className="w-4 h-4" />
          </div>
          <span className="font-serif-display font-bold text-sm text-stone-100 tracking-wide">
            Administración del Restaurante
          </span>
        </div>
      </div>

      {/* Center Search Bar */}
      <div className="hidden sm:flex items-center max-w-xs w-full mx-4">
        <div className="relative w-full">
          <Search className="w-3.5 h-3.5 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder="Buscar mesa o reserva..."
            className="w-full pl-9 pr-3 py-1.5 bg-stone-900 border border-stone-800 rounded-lg text-xs text-stone-200 placeholder-stone-600 focus:outline-none focus:border-amber-400"
          />
        </div>
      </div>

      {/* User Dropdown */}
      <div className="relative">
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="flex items-center gap-2 p-1.5 rounded-lg text-stone-300 hover:bg-stone-900 transition-colors text-xs"
        >
          <div className="w-7 h-7 rounded-full bg-stone-800 border border-stone-700 flex items-center justify-center text-stone-300">
            <User className="w-4 h-4" />
          </div>
          <span className="hidden md:block font-medium">Maître Principal</span>
        </button>

        {showDropdown && (
          <div className="absolute right-0 mt-2 w-48 bg-stone-900 border border-stone-800 rounded-xl shadow-xl py-1.5 z-50 text-xs">
            <div className="px-3 py-1.5 border-b border-stone-800 text-[11px] text-stone-400">
              Conectado como <strong className="text-stone-200">Admin</strong>
            </div>
            <button
              onClick={() => setShowDropdown(false)}
              className="w-full text-left px-3 py-2 text-stone-300 hover:bg-stone-800 hover:text-white flex items-center gap-2"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Configuración</span>
            </button>
            <button
              onClick={() => setShowDropdown(false)}
              className="w-full text-left px-3 py-2 text-stone-300 hover:bg-stone-800 hover:text-white flex items-center gap-2"
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Registro de Actividad</span>
            </button>
            <div className="border-t border-stone-800 my-1" />
            <button
              onClick={() => {
                setShowDropdown(false);
                onLogout();
              }}
              className="w-full text-left px-3 py-2 text-rose-400 hover:bg-rose-950/30 flex items-center gap-2 font-medium"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Cerrar Sesión</span>
            </button>
          </div>
        )}
      </div>

    </nav>
  );
};