import React from 'react';
import { LayoutDashboard, Columns, Calendar, BarChart3, Table2, DollarSign, Clock, ArrowLeft } from 'lucide-react';

interface PanelmenuProps {
  currentSection: 'dashboard' | 'mesas' | 'horarios' | 'reporte1' | 'reporte2' | 'reporte3' | 'reporte4';
  onSelectSection: (section: 'dashboard' | 'mesas' | 'horarios' | 'reporte1' | 'reporte2' | 'reporte3' | 'reporte4') => void;
  onBackToClientSite: () => void;
}

export const Panelmenu: React.FC<PanelmenuProps> = ({
  currentSection,
  onSelectSection,
  onBackToClientSite,
}) => {
  return (
    <aside className="w-60 bg-stone-950 border-r border-stone-800 flex flex-col justify-between shrink-0 min-h-[calc(100vh-3.5rem)] text-xs">
      <div className="py-4 space-y-6">
        {/* Principal */}
        <div className="px-3">
          <span className="px-3 text-[10px] uppercase font-bold text-stone-500 tracking-wider block mb-1.5">
            Módulo Principal
          </span>
          <button
            onClick={() => onSelectSection('dashboard')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition-colors font-medium text-left cursor-pointer ${
              currentSection === 'dashboard'
                ? 'bg-amber-400 text-stone-950 font-bold shadow-xs'
                : 'text-stone-300 hover:bg-stone-900 hover:text-white'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Dashboard General</span>
          </button>
        </div>

        {/* Gestión del Restaurante */}
        <div className="px-3">
          <span className="px-3 text-[10px] uppercase font-bold text-stone-500 tracking-wider block mb-1.5">
            Operaciones de Sala
          </span>
          <div className="space-y-1">
            <button
              onClick={() => onSelectSection('mesas')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition-colors font-medium text-left cursor-pointer ${
                currentSection === 'mesas'
                  ? 'bg-amber-400 text-stone-950 font-bold shadow-xs'
                  : 'text-stone-300 hover:bg-stone-900 hover:text-white'
              }`}
            >
              <Columns className="w-4 h-4" />
              <span>Gestionar Mesas</span>
            </button>

            <button
              onClick={() => onSelectSection('horarios')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition-colors font-medium text-left cursor-pointer ${
                currentSection === 'horarios'
                  ? 'bg-amber-400 text-stone-950 font-bold shadow-xs'
                  : 'text-stone-300 hover:bg-stone-900 hover:text-white'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>Gestionar Horarios</span>
            </button>
          </div>
        </div>

        {/* 4 Reportes solicitados por el profesor */}
        <div className="px-3">
          <span className="px-3 text-[10px] uppercase font-bold text-stone-500 tracking-wider block mb-1.5">
            Reportes Gerenciales (4)
          </span>
          <div className="space-y-1">
            <button
              onClick={() => onSelectSection('reporte1')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition-colors font-medium text-left cursor-pointer ${
                currentSection === 'reporte1'
                  ? 'bg-amber-400 text-stone-950 font-bold shadow-xs'
                  : 'text-stone-300 hover:bg-stone-900 hover:text-white'
              }`}
            >
              <BarChart3 className="w-4 h-4 text-emerald-400" />
              <span>1. Ocupación por Zonas</span>
            </button>

            <button
              onClick={() => onSelectSection('reporte2')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition-colors font-medium text-left cursor-pointer ${
                currentSection === 'reporte2'
                  ? 'bg-amber-400 text-stone-950 font-bold shadow-xs'
                  : 'text-stone-300 hover:bg-stone-900 hover:text-white'
              }`}
            >
              <Clock className="w-4 h-4 text-sky-400" />
              <span>2. Demanda Almuerzo / Cena</span>
            </button>

            <button
              onClick={() => onSelectSection('reporte3')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition-colors font-medium text-left cursor-pointer ${
                currentSection === 'reporte3'
                  ? 'bg-amber-400 text-stone-950 font-bold shadow-xs'
                  : 'text-stone-300 hover:bg-stone-900 hover:text-white'
              }`}
            >
              <DollarSign className="w-4 h-4 text-amber-400" />
              <span>3. Ingresos Estimados</span>
            </button>

            <button
              onClick={() => onSelectSection('reporte4')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition-colors font-medium text-left cursor-pointer ${
                currentSection === 'reporte4'
                  ? 'bg-amber-400 text-stone-950 font-bold shadow-xs'
                  : 'text-stone-300 hover:bg-stone-900 hover:text-white'
              }`}
            >
              <Table2 className="w-4 h-4 text-rose-400" />
              <span>4. Asistencia y Tolerancia</span>
            </button>
          </div>
        </div>
      </div>

      {/* Regresar a la web */}
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