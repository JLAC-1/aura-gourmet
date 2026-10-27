import React, { useState } from 'react';
import { RestaurantTable } from '../types';
import { Users, Sparkles, CheckCircle, Compass, Calendar as CalendarIcon, Layers } from 'lucide-react';

interface RestaurantMapProps {
  tables: RestaurantTable[];
  selectedTableId: string | null;
  onSelectTable: (table: RestaurantTable) => void;
  guestCount?: number;
  activeZoneFilter?: string;
  onZoneFilterChange?: (zone: string) => void;
  selectedDate?: string;
  onSelectDate?: (date: string) => void;
  selectedShift?: 'almuerzo' | 'cena';
  onSelectShift?: (shift: 'almuerzo' | 'cena') => void;
}

export const RestaurantMap: React.FC<RestaurantMapProps> = ({
  tables,
  selectedTableId,
  onSelectTable,
  guestCount = 2,
  activeZoneFilter = 'all',
  onZoneFilterChange,
  selectedDate,
  selectedShift,
}) => {
  const [hoveredTable, setHoveredTable] = useState<RestaurantTable | null>(null);
  const [activeViewMode, setActiveViewMode] = useState<'architectural' | 'grid'>('architectural');

  // Filtrado de mesas por zona
  const filteredTables = tables.filter((table) => {
    if (activeZoneFilter !== 'all' && table.zone !== activeZoneFilter) {
      return false;
    }
    return true;
  });

  const getTableColorClasses = (status: string, isSelected: boolean) => {
    if (isSelected) {
      return 'bg-amber-400 text-stone-950 ring-4 ring-amber-400/50 scale-105 shadow-lg shadow-amber-500/20';
    }
    switch (status) {
      case 'disponible':
        return 'bg-emerald-950/80 border-2 border-emerald-500/80 text-emerald-300 hover:border-emerald-400 hover:bg-emerald-900/90 hover:scale-105 cursor-pointer shadow-sm';
      case 'reservada':
        return 'bg-amber-950/40 border-2 border-amber-500/60 text-amber-300/80 cursor-not-allowed opacity-80';
      case 'ocupada':
        return 'bg-rose-950/40 border-2 border-rose-500/60 text-rose-300/80 cursor-not-allowed opacity-75';
      default:
        return 'bg-stone-800 text-stone-300';
    }
  };

  return (
    <div className="bg-stone-900/90 border border-stone-800 rounded-2xl p-4 sm:p-6 shadow-xl">
      {/* Encabezado del Plano */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-stone-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-amber-400 font-serif text-lg font-bold">
              Plano de Distribución del Restaurante
            </span>
            <span className="text-xs text-stone-400 bg-stone-800 px-2 py-0.5 rounded border border-stone-700 font-mono">
              En Vivo
            </span>
          </div>
          <p className="text-xs text-stone-400 mt-1">
            Haga clic en una mesa verde disponible para seleccionarla.
          </p>

          {selectedDate && (
            <div className="mt-2.5 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-stone-950 border border-amber-500/30 text-xs">
              <CalendarIcon className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="text-stone-300">
                Disponibilidad para: <strong className="text-amber-300 font-bold font-mono">{selectedDate}</strong>
                {selectedShift && (
                  <span className="text-stone-400 ml-1.5 capitalize">· Turno {selectedShift}</span>
                )}
              </span>
            </div>
          )}
        </div>

        {/* Leyenda y Alternador de Vista */}
        <div className="flex flex-wrap items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block ring-2 ring-emerald-500/30" />
            <span className="text-stone-300 font-medium">Disponible</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-amber-500 inline-block ring-2 ring-amber-500/30" />
            <span className="text-stone-300 font-medium">Reservada</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-rose-500 inline-block ring-2 ring-rose-500/30" />
            <span className="text-stone-300 font-medium">Ocupada</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-amber-400 inline-block ring-2 ring-amber-300" />
            <span className="text-amber-300 font-semibold">Seleccionada</span>
          </div>

          <div className="flex items-center bg-stone-800/80 p-1 rounded-lg border border-stone-700">
            <button
              onClick={() => setActiveViewMode('architectural')}
              className={`px-2 py-1 rounded text-xs transition-colors flex items-center gap-1 cursor-pointer ${
                activeViewMode === 'architectural' ? 'bg-stone-700 text-stone-100 font-medium' : 'text-stone-400'
              }`}
            >
              <Compass className="w-3 h-3" />
              <span>Plano</span>
            </button>
            <button
              onClick={() => setActiveViewMode('grid')}
              className={`px-2 py-1 rounded text-xs transition-colors flex items-center gap-1 cursor-pointer ${
                activeViewMode === 'grid' ? 'bg-stone-700 text-stone-100 font-medium' : 'text-stone-400'
              }`}
            >
              <Layers className="w-3 h-3" />
              <span>Tarjetas</span>
            </button>
          </div>
        </div>
      </div>

      {/* Botones de Filtro por Zona */}
      {onZoneFilterChange && (
        <div className="flex items-center gap-2 pt-4 pb-2 overflow-x-auto text-xs no-scrollbar">
          <span className="text-stone-500 font-medium shrink-0">Filtrar Zona:</span>
          {[
            { id: 'all', label: 'Todas las Zonas' },
            { id: 'ventanales', label: 'Ventanales' },
            { id: 'salon_principal', label: 'Salón Central' },
            { id: 'terraza', label: 'Terraza Jardín' },
            { id: 'vip', label: 'Zona VIP & Cava' },
          ].map((zone) => (
            <button
              key={zone.id}
              onClick={() => onZoneFilterChange(zone.id)}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors font-medium cursor-pointer ${
                activeZoneFilter === zone.id
                  ? 'bg-amber-400 text-stone-950 font-semibold shadow-sm'
                  : 'bg-stone-800/60 text-stone-400 hover:text-stone-200 hover:bg-stone-800'
              }`}
            >
              {zone.label}
            </button>
          ))}
        </div>
      )}

      {/* Mensaje de aviso de filtro activo */}
      {activeZoneFilter !== 'all' && onZoneFilterChange && (
        <div className="mt-3 flex items-center justify-between p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs">
          <span className="text-amber-300 font-medium flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            Mostrando solo mesas de:{' '}
            <strong className="text-white uppercase tracking-wider">
              {activeZoneFilter === 'ventanales' ? 'Ventanales Panorámicos' :
               activeZoneFilter === 'salon_principal' ? 'Salón Central' :
               activeZoneFilter === 'terraza' ? 'Terraza Jardín' :
               activeZoneFilter === 'vip' ? 'Zona VIP & Cava' : activeZoneFilter}
            </strong>{' '}
            ({tables.filter((t) => t.zone === activeZoneFilter).length} mesas)
          </span>
          <button
            type="button"
            onClick={() => onZoneFilterChange('all')}
            className="text-stone-300 hover:text-white underline text-[11px] font-semibold cursor-pointer"
          >
            Ver plano completo (Todas)
          </button>
        </div>
      )}

      {/* Vista de Plano Arquitectónico */}
      {activeViewMode === 'architectural' ? (
        <div className="mt-4 relative bg-stone-950 border border-stone-800 rounded-xl p-4 sm:p-6 overflow-hidden min-h-[420px] select-none">
          <div
            className="absolute inset-0 opacity-15 pointer-events-none"
            style={{
              backgroundImage: 'radial-gradient(circle, #78716c 1px, transparent 1px)',
              backgroundSize: '24px 24px',
            }}
          />

          {/* 1. VENTANALES */}
          {(activeZoneFilter === 'all' || activeZoneFilter === 'ventanales') && (
            <div className={`relative border-b-2 border-dashed border-sky-500/30 pb-4 mb-4 bg-sky-950/10 rounded-t-lg p-3 transition-all ${
              activeZoneFilter === 'ventanales' ? 'ring-2 ring-amber-400/80 bg-sky-950/30 shadow-lg' : ''
            }`}>
              <div className="flex items-center justify-between text-xs mb-3">
                <span className="font-semibold text-sky-400 tracking-wider uppercase flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
                  Ventanales Panorámicos · Vista al Skyline Urbano
                </span>
                <span className="text-[11px] text-sky-300/70">Fachada Acristalada ({tables.filter((t) => t.zone === 'ventanales').length} mesas)</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {tables
                  .filter((t) => t.zone === 'ventanales')
                  .map((table) => {
                    const isSelected = selectedTableId === table.id;
                    const isAvailable = table.status === 'disponible';
                    const fitsGuests = !guestCount || table.capacity >= guestCount;

                    return (
                      <div
                        key={table.id}
                        onClick={() => {
                          if (isAvailable && fitsGuests) onSelectTable(table);
                        }}
                        onMouseEnter={() => setHoveredTable(table)}
                        onMouseLeave={() => setHoveredTable(null)}
                        className={`relative p-3.5 rounded-xl transition-all duration-200 flex flex-col items-center justify-center text-center ${getTableColorClasses(
                          table.status,
                          isSelected
                        )} ${!isAvailable || !fitsGuests ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                      >
                        <div className="absolute -top-1 w-8 h-1.5 rounded-t bg-stone-700/60" />
                        <div className="absolute -bottom-1 w-8 h-1.5 rounded-b bg-stone-700/60" />

                        <span className="text-xs font-mono font-bold tracking-wider">
                          MESA {table.number}
                        </span>
                        <div className="flex items-center gap-1 text-[11px] mt-0.5 opacity-90">
                          <Users className="w-3 h-3" />
                          <span className="tabular-nums">{table.capacity}p</span>
                        </div>
                        <span className="text-[10px] uppercase font-semibold mt-1">
                          {isSelected ? 'Elegida' : table.status}
                        </span>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* 2. PASILLO (Solo en plano completo) */}
          {activeZoneFilter === 'all' && (
            <div className="my-4 py-2 border-y border-stone-800 bg-stone-900/50 flex items-center justify-center text-center">
              <span className="text-xs tracking-widest uppercase text-stone-500 font-mono flex items-center gap-2">
                <span>◄ ───</span>
                <span>PASILLO PRINCIPAL & ATENCIÓN DE SALÓN</span>
                <span>─── ►</span>
              </span>
            </div>
          )}

          {/* 3. SALÓN CENTRAL & ZONA VIP */}
          {(activeZoneFilter === 'all' || activeZoneFilter === 'salon_principal' || activeZoneFilter === 'vip') && (
            <div className={`grid grid-cols-1 ${
              activeZoneFilter === 'all' ? 'lg:grid-cols-3' : 'grid-cols-1'
            } gap-6 my-4`}>
              
              {/* Salón Central */}
              {(activeZoneFilter === 'all' || activeZoneFilter === 'salon_principal') && (
                <div className={`${
                  activeZoneFilter === 'all' ? 'lg:col-span-2' : ''
                } p-3 bg-stone-900/40 rounded-xl border border-stone-800/80 transition-all ${
                  activeZoneFilter === 'salon_principal' ? 'ring-2 ring-amber-400/80 bg-stone-900/80 shadow-lg' : ''
                }`}>
                  <div className="flex items-center justify-between text-xs mb-3 text-stone-400">
                    <span className="font-semibold text-stone-300 uppercase tracking-wider">
                      Salón Central
                    </span>
                    <span className="text-[11px] text-stone-500">Cerca de Cava & Cocina Abierta ({tables.filter((t) => t.zone === 'salon_principal').length} mesas)</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {tables
                      .filter((t) => t.zone === 'salon_principal')
                      .map((table) => {
                        const isSelected = selectedTableId === table.id;
                        const isAvailable = table.status === 'disponible';
                        const fitsGuests = !guestCount || table.capacity >= guestCount;

                        return (
                          <div
                            key={table.id}
                            onClick={() => {
                              if (isAvailable && fitsGuests) onSelectTable(table);
                            }}
                            onMouseEnter={() => setHoveredTable(table)}
                            onMouseLeave={() => setHoveredTable(null)}
                            className={`relative p-3.5 rounded-xl transition-all duration-200 flex flex-col items-center justify-center text-center ${getTableColorClasses(
                              table.status,
                              isSelected
                            )} ${!isAvailable || !fitsGuests ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                          >
                            <span className="text-xs font-mono font-bold tracking-wider">
                              MESA {table.number}
                            </span>
                            <div className="flex items-center gap-1 text-[11px] mt-0.5 opacity-90">
                              <Users className="w-3 h-3" />
                              <span className="tabular-nums">{table.capacity}p</span>
                            </div>
                            <span className="text-[10px] uppercase font-semibold mt-1">
                              {isSelected ? 'Elegida' : table.status}
                            </span>
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}

              {/* Zona VIP & Cava */}
              {(activeZoneFilter === 'all' || activeZoneFilter === 'vip') && (
                <div className={`p-3 bg-amber-950/20 rounded-xl border border-amber-500/20 transition-all ${
                  activeZoneFilter === 'vip' ? 'ring-2 ring-amber-400 bg-amber-950/40 shadow-lg' : ''
                }`}>
                  <div className="flex items-center justify-between text-xs mb-3">
                    <span className="font-semibold text-amber-300 uppercase tracking-wider flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      Zona VIP & Cava
                    </span>
                    <span className="text-[10px] text-amber-400/80 uppercase">Exclusivo ({tables.filter((t) => t.zone === 'vip').length} booths)</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
                    {tables
                      .filter((t) => t.zone === 'vip')
                      .map((table) => {
                        const isSelected = selectedTableId === table.id;
                        const isAvailable = table.status === 'disponible';
                        const fitsGuests = !guestCount || table.capacity >= guestCount;

                        return (
                          <div
                            key={table.id}
                            onClick={() => {
                              if (isAvailable && fitsGuests) onSelectTable(table);
                            }}
                            onMouseEnter={() => setHoveredTable(table)}
                            onMouseLeave={() => setHoveredTable(null)}
                            className={`relative p-4 rounded-xl transition-all duration-200 flex flex-col items-center justify-center text-center ${getTableColorClasses(
                              table.status,
                              isSelected
                            )} ${!isAvailable || !fitsGuests ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                          >
                            <span className="text-xs font-mono font-bold tracking-wider">
                              BOOTH VIP {table.number}
                            </span>
                            <div className="flex items-center gap-1 text-xs mt-0.5 opacity-90">
                              <Users className="w-3 h-3" />
                              <span className="tabular-nums">{table.capacity} personas</span>
                            </div>
                            <span className="text-[10px] uppercase font-semibold mt-1">
                              {isSelected ? 'Seleccionada' : table.status}
                            </span>
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 4. TERRAZA JARDÍN */}
          {(activeZoneFilter === 'all' || activeZoneFilter === 'terraza') && (
            <div className={`mt-4 p-3 bg-emerald-950/10 rounded-b-lg border-t-2 border-dashed border-emerald-500/30 transition-all ${
              activeZoneFilter === 'terraza' ? 'ring-2 ring-amber-400/80 bg-emerald-950/30 shadow-lg rounded-lg border-t-0' : ''
            }`}>
              <div className="flex items-center justify-between text-xs mb-3">
                <span className="font-semibold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                  Terraza Jardín al Aire Libre
                </span>
                <span className="text-[11px] text-emerald-300/70">Pérgola & Fuentes Naturales ({tables.filter((t) => t.zone === 'terraza').length} mesas)</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {tables
                  .filter((t) => t.zone === 'terraza')
                  .map((table) => {
                    const isSelected = selectedTableId === table.id;
                    const isAvailable = table.status === 'disponible';
                    const fitsGuests = !guestCount || table.capacity >= guestCount;

                    return (
                      <div
                        key={table.id}
                        onClick={() => {
                          if (isAvailable && fitsGuests) onSelectTable(table);
                        }}
                        onMouseEnter={() => setHoveredTable(table)}
                        onMouseLeave={() => setHoveredTable(null)}
                        className={`relative p-3.5 rounded-xl transition-all duration-200 flex flex-col items-center justify-center text-center ${getTableColorClasses(
                          table.status,
                          isSelected
                        )} ${!isAvailable || !fitsGuests ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                      >
                        <span className="text-xs font-mono font-bold tracking-wider">
                          MESA {table.number}
                        </span>
                        <div className="flex items-center gap-1 text-[11px] mt-0.5 opacity-90">
                          <Users className="w-3 h-3" />
                          <span className="tabular-nums">{table.capacity}p</span>
                        </div>
                        <span className="text-[10px] uppercase font-semibold mt-1">
                          {isSelected ? 'Elegida' : table.status}
                        </span>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* Tarjeta flotante con detalles de la mesa */}
          {hoveredTable && (
            <div className="absolute bottom-4 right-4 z-20 bg-stone-900 border border-stone-700 p-3.5 rounded-xl shadow-2xl max-w-xs text-xs backdrop-blur-md pointer-events-none transition-all">
              <div className="flex items-center justify-between font-bold text-stone-100 font-serif border-b border-stone-800 pb-1.5 mb-1.5">
                <span>Mesa {hoveredTable.number}</span>
                <span
                  className={`text-[10px] font-sans font-semibold uppercase ${
                    hoveredTable.status === 'disponible'
                      ? 'text-emerald-400'
                      : hoveredTable.status === 'reservada'
                      ? 'text-amber-400'
                      : 'text-rose-400'
                  }`}
                >
                  {hoveredTable.status}
                </span>
              </div>
              <p className="text-stone-300 font-medium">{hoveredTable.zoneName}</p>
              <p className="text-stone-400 mt-1">Capacidad: {hoveredTable.capacity} comensales</p>
              <p className="text-[11px] text-stone-400 mt-1 italic">{hoveredTable.description}</p>
            </div>
          )}
        </div>
      ) : (
        /* Vista alternativa de Tarjetas */
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTables.map((table) => {
            const isSelected = selectedTableId === table.id;
            return (
              <div
                key={table.id}
                onClick={() => {
                  if (table.status === 'disponible') onSelectTable(table);
                }}
                className={`p-4 rounded-xl border transition-all ${
                  isSelected
                    ? 'border-amber-400 bg-stone-850 ring-2 ring-amber-400/40'
                    : 'border-stone-800 bg-stone-950/60'
                } ${table.status !== 'disponible' ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer hover:border-stone-700'}`}
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="font-serif font-bold text-stone-200">
                    Mesa {table.number}
                  </span>
                  <span
                    className={`text-xs font-semibold ${
                      table.status === 'disponible'
                        ? 'text-emerald-400'
                        : table.status === 'reservada'
                        ? 'text-amber-400'
                        : 'text-rose-400'
                    }`}
                  >
                    {table.status}
                  </span>
                </div>
                <div className="text-xs text-stone-400 space-y-1">
                  <p>Zona: {table.zoneName}</p>
                  <p>Capacidad: {table.capacity} personas</p>
                  <p className="text-[11px] text-stone-500">{table.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Banner de mesa seleccionada */}
      {selectedTableId && (
        <div className="mt-4 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-400 text-stone-950 font-bold flex items-center justify-center font-serif text-lg">
              {tables.find((t) => t.id === selectedTableId)?.number}
            </div>
            <div>
              <p className="text-xs text-amber-300 font-semibold uppercase tracking-wider">
                Mesa Seleccionada para su Reserva
              </p>
              <p className="text-sm font-medium text-stone-200">
                {tables.find((t) => t.id === selectedTableId)?.zoneName} · Capacidad hasta{' '}
                {tables.find((t) => t.id === selectedTableId)?.capacity} comensales
              </p>
            </div>
          </div>
          <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            Lista para confirmar
          </span>
        </div>
      )}
    </div>
  );
};