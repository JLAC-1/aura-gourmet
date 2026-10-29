import React from 'react';
import {
  LayoutDashboard,
  UtensilsCrossed,
  Columns,
  Users2,
  Calendar,
  TrendingUp,
  Award,
  BarChart3,
  CheckSquare,
  ArrowLeft,
} from 'lucide-react';

export type AdminSection =
  | 'dashboard'
  | 'platos'
  | 'mesas'
  | 'personal_clientes'
  | 'horarios'
  | 'reporte_ventas'
  | 'reporte_platos'
  | 'reporte_zonas'
  | 'reporte_asistencia';

interface PanelmenuProps {
  currentSection: AdminSection;
  onSelectSection: (section: AdminSection) => void;
  onBackToClientSite: () => void;
}

export const Panelmenu: React.FC<PanelmenuProps> = ({
  currentSection,
  onSelectSection,
  onBackToClientSite,
}) => {
  return (
    <aside className="w-64 bg-stone-950 border-r border-stone-800 flex flex-col justify-between shrink-0 min-h-[calc(100vh-3.5rem)] text-xs select-none">
      
      {/* Sidenav Menu */}
      <div className="py-4 space-y-5 overflow-y-auto max-h-[calc(100vh-7.5rem)]">
        
        {/* Principal */}
        <div className="px-3">
          <span className="px-3 text-[10px] uppercase font-bold text-stone-500 tracking-wider block mb-1.5">
            Módulo Principal
          </span>
          <button
            onClick={() => onSelectSection('dashboard')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all font-medium text-left cursor-pointer ${
              currentSection === 'dashboard'
                ? 'bg-amber-400 text-stone-950 font-bold shadow-sm'
                : 'text-stone-300 hover:bg-stone-900 hover:text-white'
            }`}
          >
            <LayoutDashboard className="w-4 h-4 shrink-0" />
            <span>Dashboard General</span>
          </button>
        </div>

        {/* Gestión de Sala y Reservas */}
        <div className="px-3">
          <span className="px-3 text-[10px] uppercase font-bold text-stone-500 tracking-wider block mb-1.5">
            Gestión Operativa de Sala
          </span>
          <div className="space-y-1">
            
            {/* 1. Gestionar Menú / Platos */}
            <button
              onClick={() => onSelectSection('platos')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all font-medium text-left cursor-pointer ${
                currentSection === 'platos'
                  ? 'bg-amber-400 text-stone-950 font-bold shadow-sm'
                  : 'text-stone-300 hover:bg-stone-900 hover:text-white'
              }`}
            >
              <UtensilsCrossed className="w-4 h-4 shrink-0" />
              <span>Gestionar Menú y Carta</span>
            </button>

            {/* 2. Gestionar Mesas */}
            <button
              onClick={() => onSelectSection('mesas')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all font-medium text-left cursor-pointer ${
                currentSection === 'mesas'
                  ? 'bg-amber-400 text-stone-950 font-bold shadow-sm'
                  : 'text-stone-300 hover:bg-stone-900 hover:text-white'
              }`}
            >
              <Columns className="w-4 h-4 shrink-0" />
              <span>Gestionar Mesas y Sala</span>
            </button>

            {/* 3. Horarios y Turnos (Pacing & Descongestión) */}
            <button
              onClick={() => onSelectSection('horarios')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all font-medium text-left cursor-pointer ${
                currentSection === 'horarios'
                  ? 'bg-amber-400 text-stone-950 font-bold shadow-sm'
                  : 'text-stone-300 hover:bg-stone-900 hover:text-white'
              }`}
            >
              <Calendar className="w-4 h-4 shrink-0" />
              <span>Horarios y Turnos de Reserva</span>
            </button>

            {/* 4. Clientes y Personal */}
            <button
              onClick={() => onSelectSection('personal_clientes')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all font-medium text-left cursor-pointer ${
                currentSection === 'personal_clientes'
                  ? 'bg-amber-400 text-stone-950 font-bold shadow-sm'
                  : 'text-stone-300 hover:bg-stone-900 hover:text-white'
              }`}
            >
              <Users2 className="w-4 h-4 shrink-0 text-sky-400" />
              <span>Clientes y Personal</span>
            </button>
          </div>
        </div>

        {/* Reportes Gerenciales y Analítica */}
        <div className="px-3">
          <span className="px-3 text-[10px] uppercase font-bold text-stone-500 tracking-wider block mb-1.5">
            Reportes y Analítica
          </span>
          <div className="space-y-1">
            {/* Reporte Ventas del Mes con Variación */}
            <button
              onClick={() => onSelectSection('reporte_ventas')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all font-medium text-left cursor-pointer ${
                currentSection === 'reporte_ventas'
                  ? 'bg-amber-400 text-stone-950 font-bold shadow-sm'
                  : 'text-stone-300 hover:bg-stone-900 hover:text-white'
              }`}
            >
              <TrendingUp className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Ventas & Variación Mensual</span>
            </button>

            {/* Reporte Platos: Ingresos y Más Vendidos */}
            <button
              onClick={() => onSelectSection('reporte_platos')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all font-medium text-left cursor-pointer ${
                currentSection === 'reporte_platos'
                  ? 'bg-amber-400 text-stone-950 font-bold shadow-sm'
                  : 'text-stone-300 hover:bg-stone-900 hover:text-white'
              }`}
            >
              <Award className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Platos: Ingresos & Ranking</span>
            </button>

            {/* Reporte Ocupación por Zonas */}
            <button
              onClick={() => onSelectSection('reporte_zonas')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all font-medium text-left cursor-pointer ${
                currentSection === 'reporte_zonas'
                  ? 'bg-amber-400 text-stone-950 font-bold shadow-sm'
                  : 'text-stone-300 hover:bg-stone-900 hover:text-white'
              }`}
            >
              <BarChart3 className="w-4 h-4 text-sky-400 shrink-0" />
              <span>Ocupación por Zonas</span>
            </button>

            {/* Reporte Horas Pico, Descongestión & Asistencia */}
            <button
              onClick={() => onSelectSection('reporte_asistencia')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all font-medium text-left cursor-pointer ${
                currentSection === 'reporte_asistencia'
                  ? 'bg-amber-400 text-stone-950 font-bold shadow-sm'
                  : 'text-stone-300 hover:bg-stone-900 hover:text-white'
              }`}
            >
              <CheckSquare className="w-4 h-4 text-rose-400 shrink-0" />
              <span>Horas Pico & Descongestión</span>
            </button>
          </div>
        </div>

      </div>

      {/* Footer Return to Public Web */}
      <div className="p-3 border-t border-stone-800 bg-stone-900/50">
        <button
          onClick={onBackToClientSite}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold transition-colors border border-stone-700 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Ver Web Pública</span>
        </button>
      </div>

    </aside>
  );
};