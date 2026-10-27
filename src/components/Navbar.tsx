import React from 'react';
import { UtensilsCrossed, CalendarDays, ShieldCheck } from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab }) => {
  return (
    <header className="sticky top-0 z-40 bg-stone-900/95 backdrop-blur-md border-b border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-20">
          
          {/* Logo y Marca */}
          <button
            onClick={() => setActiveTab('home')}
            className="flex items-center gap-3 text-left focus:outline-none group shrink-0 cursor-pointer"
          >
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:bg-amber-500/20 transition-colors">
              <UtensilsCrossed className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-stone-100 font-serif-display block leading-none">
                Aura Gourmet
              </span>
              <span className="text-[11px] text-amber-400/90 tracking-widest uppercase mt-0.5 block font-medium">
                Cocina de Autor & Reservas
              </span>
            </div>
          </button>

          {/* Menú de Navegación */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            <button
              onClick={() => setActiveTab('home')}
              className={`px-3.5 py-2 text-sm font-medium transition-colors whitespace-nowrap rounded-md cursor-pointer ${
                activeTab === 'home'
                  ? 'text-amber-400 bg-stone-800/80 shadow-xs'
                  : 'text-stone-300 hover:text-stone-100 hover:bg-stone-800/40'
              }`}
            >
              Inicio
            </button>

            <button
              onClick={() => setActiveTab('menu')}
              className={`px-3.5 py-2 text-sm font-medium transition-colors whitespace-nowrap rounded-md cursor-pointer ${
                activeTab === 'menu'
                  ? 'text-amber-400 bg-stone-800/80 shadow-xs'
                  : 'text-stone-300 hover:text-stone-100 hover:bg-stone-800/40'
              }`}
            >
              Carta Menú
            </button>

            <button
              onClick={() => setActiveTab('reservas')}
              className={`px-3.5 py-2 text-sm font-medium transition-colors whitespace-nowrap rounded-md cursor-pointer ${
                activeTab === 'reservas'
                  ? 'text-amber-400 bg-stone-800/80 shadow-xs'
                  : 'text-stone-300 hover:text-stone-100 hover:bg-stone-800/40'
              }`}
            >
              Reservar Mesa
            </button>

            <button
              onClick={() => setActiveTab('admin')}
              className={`px-3 py-2 text-xs font-medium transition-colors whitespace-nowrap rounded-md flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'admin'
                  ? 'text-amber-400 bg-stone-800 shadow-xs'
                  : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/40'
              }`}
              title="Acceso exclusivo para el personal del restaurante"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-stone-400" />
              <span>Acceso Personal</span>
            </button>
          </nav>

          {/* Botón de Acción Principal */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setActiveTab('reservas')}
              className="px-4 py-2 text-xs sm:text-sm font-semibold text-stone-900 bg-amber-400 hover:bg-amber-300 active:scale-98 transition-all rounded-lg shadow-sm whitespace-nowrap flex items-center gap-2 cursor-pointer"
            >
              <CalendarDays className="w-4 h-4" />
              <span>Reservar Mesa</span>
            </button>
          </div>

        </div>

        {/* Menú Móvil */}
        <div className="md:hidden flex items-center justify-around py-2.5 border-t border-stone-800 text-xs overflow-x-auto gap-2">
          <button
            onClick={() => setActiveTab('home')}
            className={`px-2.5 py-1.5 rounded whitespace-nowrap cursor-pointer ${activeTab === 'home' ? 'text-amber-400 font-semibold bg-stone-800' : 'text-stone-400'}`}
          >
            Inicio
          </button>
          <button
            onClick={() => setActiveTab('menu')}
            className={`px-2.5 py-1.5 rounded whitespace-nowrap cursor-pointer ${activeTab === 'menu' ? 'text-amber-400 font-semibold bg-stone-800' : 'text-stone-400'}`}
          >
            Menú
          </button>
          <button
            onClick={() => setActiveTab('reservas')}
            className={`px-2.5 py-1.5 rounded whitespace-nowrap cursor-pointer ${activeTab === 'reservas' ? 'text-amber-400 font-semibold bg-stone-800' : 'text-stone-400'}`}
          >
            Reservas
          </button>
          <button
            onClick={() => setActiveTab('admin')}
            className={`px-2.5 py-1.5 rounded whitespace-nowrap cursor-pointer ${activeTab === 'admin' ? 'text-amber-400 font-semibold bg-stone-800' : 'text-stone-400'}`}
          >
            Admin
          </button>
        </div>
      </div>
    </header>
  );
};