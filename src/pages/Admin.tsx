import React, { useState } from 'react';
import { ReservationData, RestaurantTable } from '../types';
import { Panelbarra } from '../components/admin/Panelbarra';
import { Panelmenu } from '../components/admin/Panelmenu';
import { ShieldCheck, Search, RotateCcw, Eye, Users, Clock, Calendar, CheckCircle, XCircle, BarChart3, DollarSign, Layers } from 'lucide-react';

interface AdminProps {
  reservations: ReservationData[];
  tables: RestaurantTable[];
  stats: {
    totalTables: number;
    disponibles: number;
    reservadas: number;
    ocupadas: number;
    occupancyPercentage: number;
    activeReservationsCount: number;
  };
  onUpdateStatus: (id: string, status: 'confirmada' | 'en_mesa' | 'completada' | 'cancelada') => void;
  onCancelReservation: (id: string) => void;
  onResetData: () => void;
  onSelectReservationForView: (reservation: ReservationData) => void;
  onLogout: () => void;
  onBackToClientSite: () => void;
}

export const Admin: React.FC<AdminProps> = ({
  reservations,
  tables,
  stats,
  onUpdateStatus,
  onCancelReservation,
  onResetData,
  onSelectReservationForView,
  onLogout,
  onBackToClientSite,
}) => {
  const [currentSection, setCurrentSection] = useState<'dashboard' | 'mesas' | 'horarios' | 'reporte1' | 'reporte2' | 'reporte3' | 'reporte4'>('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'todas' | 'activas' | 'canceladas'>('todas');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [inspectedDate, setInspectedDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [inspectedShift, setInspectedShift] = useState<'almuerzo' | 'cena'>('cena');

  // Counts for filter tabs
  const totalCount = reservations.length;
  const activasCount = reservations.filter((r) => r.status === 'confirmada' || r.status === 'en_mesa').length;
  const canceladasCount = reservations.filter((r) => r.status === 'cancelada').length;

  // Filtered reservations
  const filteredReservations = reservations.filter((res) => {
    const matchesSearch =
      res.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      res.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      res.tableNumber.toString().includes(searchTerm);

    if (!matchesSearch) return false;

    if (statusFilter === 'activas') {
      return res.status === 'confirmada' || res.status === 'en_mesa';
    }
    if (statusFilter === 'canceladas') {
      return res.status === 'cancelada';
    }
    return true; // 'todas'
  });

  // Shift metrics for inspected date
  const almuerzoRes = reservations.filter((r) => r.shift === 'almuerzo' && r.date === inspectedDate && r.status !== 'cancelada');
  const cenaRes = reservations.filter((r) => r.shift === 'cena' && r.date === inspectedDate && r.status !== 'cancelada');
  const almuerzoGuests = almuerzoRes.reduce((acc, r) => acc + r.guests, 0);
  const cenaGuests = cenaRes.reduce((acc, r) => acc + r.guests, 0);
  const almuerzoPct = Math.min(100, Math.round((almuerzoGuests / 52) * 100));
  const cenaPct = Math.min(100, Math.round((cenaGuests / 52) * 100));

  return (
    <div className="min-h-screen bg-stone-900 text-stone-100 flex flex-col w-full">
      
      {/* 1. Barra Superior SB Admin (Panelbarra) */}
      <Panelbarra
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        onLogout={onLogout}
        onSearch={setSearchTerm}
      />

      <div className="flex flex-1 w-full">
        
        {/* 2. Menú Lateral SB Admin (Panelmenu) */}
        {sidebarOpen && (
          <Panelmenu
            currentSection={currentSection}
            onSelectSection={setCurrentSection}
            onBackToClientSite={onBackToClientSite}
          />
        )}

        {/* 3. Contenedor de Contenido Principal centrado */}
        <main className="flex-1 p-6 sm:p-8 overflow-y-auto w-full">
          <div className="max-w-7xl mx-auto w-full">
          
          {/* VISTA 1: DASHBOARD GENERAL */}
          {currentSection === 'dashboard' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-stone-800 gap-3">
                <div>
                  <h1 className="text-2xl font-bold font-serif-display text-stone-100">
                    Dashboard Administrativo del Restaurante
                  </h1>
                  <p className="text-xs text-stone-400">
                    Métricas de sala, reservas en tiempo real y ocupación activa
                  </p>
                </div>
                <button
                  onClick={onResetData}
                  className="px-3 py-1.5 rounded-xl bg-stone-800 text-stone-300 text-xs flex items-center gap-1.5 w-fit"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Restablecer Demo
                </button>
              </div>

              {/* KPI Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-stone-950 border border-stone-800">
                  <span className="text-[11px] text-stone-500 uppercase font-bold">Total Mesas</span>
                  <span className="text-2xl font-bold font-mono text-stone-100 block mt-1">{stats.totalTables}</span>
                  <span className="text-[10px] text-stone-400">En 4 zonas principales</span>
                </div>
                <div className="p-4 rounded-xl bg-stone-950 border border-stone-800">
                  <span className="text-[11px] text-emerald-400 uppercase font-bold">Disponibles</span>
                  <span className="text-2xl font-bold font-mono text-emerald-400 block mt-1">{stats.disponibles}</span>
                  <span className="text-[10px] text-stone-400">Listas para reservar</span>
                </div>
                <div className="p-4 rounded-xl bg-stone-950 border border-stone-800">
                  <span className="text-[11px] text-amber-400 uppercase font-bold">Reservadas</span>
                  <span className="text-2xl font-bold font-mono text-amber-400 block mt-1">{stats.reservadas}</span>
                  <span className="text-[10px] text-stone-400">Confirmadas activas</span>
                </div>
                <div className="p-4 rounded-xl bg-stone-950 border border-stone-800">
                  <span className="text-[11px] text-rose-400 uppercase font-bold">Ocupadas (En Mesa)</span>
                  <span className="text-2xl font-bold font-mono text-rose-400 block mt-1">{stats.ocupadas}</span>
                  <span className="text-[10px] text-stone-400">Comensales en sala</span>
                </div>
              </div>

              {/* Tabla de Reservas Activas */}
              <div className="bg-stone-950 border border-stone-800 rounded-2xl overflow-hidden shadow-xl">
                <div className="p-4 border-b border-stone-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-xs">
                  <div>
                    <span className="font-bold text-stone-200 block text-sm">Listado de Reservas Realizadas</span>
                    <span className="text-stone-400 text-[11px]">Control de estados, asistencia e historial de auditoría</span>
                  </div>

                  {/* Pestañas de Filtro Rápido */}
                  <div className="flex items-center gap-1.5 bg-stone-900 p-1 rounded-xl border border-stone-800">
                    <button
                      onClick={() => setStatusFilter('todas')}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        statusFilter === 'todas'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'text-stone-400 hover:text-stone-200'
                      }`}
                    >
                      Todas ({totalCount})
                    </button>
                    <button
                      onClick={() => setStatusFilter('activas')}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        statusFilter === 'activas'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'text-stone-400 hover:text-stone-200'
                      }`}
                    >
                      Activas ({activasCount})
                    </button>
                    <button
                      onClick={() => setStatusFilter('canceladas')}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        statusFilter === 'canceladas'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : 'text-stone-400 hover:text-stone-200'
                      }`}
                    >
                      Canceladas ({canceladasCount})
                    </button>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-stone-900 text-stone-400 uppercase font-semibold border-b border-stone-800">
                      <tr>
                        <th className="px-4 py-3">Código</th>
                        <th className="px-4 py-3">Cliente</th>
                        <th className="px-4 py-3">Fecha y Turno</th>
                        <th className="px-4 py-3">Mesa</th>
                        <th className="px-4 py-3">Personas</th>
                        <th className="px-4 py-3">Estado</th>
                        <th className="px-4 py-3 text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-800/60">
                      {filteredReservations.map((res) => (
                        <tr key={res.id} className="hover:bg-stone-900/50">
                          <td className="px-4 py-3 font-mono font-bold text-amber-400">{res.code}</td>
                          <td className="px-4 py-3">
                            <span className="font-semibold text-stone-200 block">{res.customerName}</span>
                            <span className="text-[11px] text-stone-500 block">{res.phone}</span>
                          </td>
                          <td className="px-4 py-3 text-stone-300">
                            {res.date} ({res.time} hrs) · <span className="uppercase text-[10px] text-stone-500 font-bold">{res.shift}</span>
                          </td>
                          <td className="px-4 py-3 font-bold text-amber-300">Mesa #{res.tableNumber}</td>
                          <td className="px-4 py-3 font-mono text-stone-300">{res.guests} p.</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                              res.status === 'confirmada' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                              res.status === 'en_mesa' ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20' :
                              res.status === 'completada' ? 'bg-stone-800 text-stone-400' : 'bg-rose-500/10 text-rose-400'
                            }`}>
                              {res.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {res.status === 'confirmada' && (
                                <button
                                  onClick={() => onUpdateStatus(res.id, 'en_mesa')}
                                  className="px-2 py-1 rounded bg-sky-500/10 text-sky-300 text-[11px] font-semibold hover:bg-sky-500/20 transition-colors cursor-pointer"
                                >
                                  Sentar
                                </button>
                              )}
                              {res.status === 'en_mesa' && (
                                <button
                                  onClick={() => onUpdateStatus(res.id, 'completada')}
                                  className="px-2 py-1 rounded bg-emerald-500/10 text-emerald-300 text-[11px] font-semibold hover:bg-emerald-500/20 transition-colors cursor-pointer"
                                >
                                  Liberar
                                </button>
                              )}
                              {res.status !== 'cancelada' && res.status !== 'completada' && (
                                <button
                                  onClick={() => onCancelReservation(res.id)}
                                  className="px-2 py-1 rounded bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-[11px] font-semibold transition-colors cursor-pointer"
                                  title="Cancelar reserva y liberar mesa"
                                >
                                  Cancelar
                                </button>
                              )}
                              <button
                                onClick={() => onSelectReservationForView(res)}
                                className="p-1 rounded bg-stone-800 hover:bg-stone-700 text-stone-300 transition-colors cursor-pointer"
                                title="Ver comprobante oficial"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {filteredReservations.length === 0 && (
                        <tr>
                          <td colSpan={7} className="text-center py-10 text-stone-500">
                            No se encontraron reservas con el filtro seleccionado ({statusFilter}).
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* VISTA 2: GESTIONAR MESAS (Listarmesa con selector de fecha) */}
          {currentSection === 'mesas' && (
            <div className="space-y-6">
              <div className="pb-4 border-b border-stone-800">
                <h1 className="text-2xl font-bold font-serif-display text-stone-100">
                  Listar y Gestionar Mesas del Restaurante
                </h1>
                <p className="text-xs text-stone-400">
                  Seleccione una fecha y turno para ver en vivo qué mesa está ocupada y quién la reservó, o libere mesas canceladas.
                </p>
              </div>

              {/* Selector de Fecha y Turno para Gestionar Mesas */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-stone-950 border border-stone-800 text-xs">
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-amber-400 shrink-0" />
                  <span className="font-semibold text-stone-200">Fecha a Inspeccionar:</span>
                  <input
                    type="date"
                    value={inspectedDate}
                    onChange={(e) => setInspectedDate(e.target.value)}
                    className="px-3 py-1.5 rounded-xl bg-stone-900 border border-stone-700 text-stone-100 font-mono text-xs focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-stone-400 font-medium">Turno:</span>
                  <button
                    onClick={() => setInspectedShift('almuerzo')}
                    className={`px-3 py-1.5 rounded-xl font-semibold transition-colors cursor-pointer ${
                      inspectedShift === 'almuerzo'
                        ? 'bg-amber-400 text-stone-950 font-bold shadow-sm'
                        : 'bg-stone-900 text-stone-400 hover:text-white border border-stone-800'
                    }`}
                  >
                    Almuerzo (12:30 - 15:30)
                  </button>
                  <button
                    onClick={() => setInspectedShift('cena')}
                    className={`px-3 py-1.5 rounded-xl font-semibold transition-colors cursor-pointer ${
                      inspectedShift === 'cena'
                        ? 'bg-amber-400 text-stone-950 font-bold shadow-sm'
                        : 'bg-stone-900 text-stone-400 hover:text-white border border-stone-800'
                    }`}
                  >
                    Cena (19:00 - 23:00)
                  </button>
                </div>
              </div>

              {/* Catálogo de Mesas para esa fecha */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {tables.map((tbl) => {
                  // Buscar si esta mesa tiene una reserva activa en la fecha y turno inspeccionados
                  const activeRes = reservations.find(
                    (r) =>
                      r.tableId === tbl.id &&
                      r.date === inspectedDate &&
                      r.shift === inspectedShift &&
                      r.status !== 'cancelada'
                  );

                  const statusDisplay = activeRes
                    ? activeRes.status === 'en_mesa'
                      ? 'ocupada'
                      : 'reservada'
                    : 'disponible';

                  return (
                    <div
                      key={tbl.id}
                      className={`p-4 rounded-xl border space-y-2.5 text-xs transition-all shadow-md ${
                        statusDisplay === 'reservada'
                          ? 'bg-amber-950/20 border-amber-500/40'
                          : statusDisplay === 'ocupada'
                          ? 'bg-rose-950/20 border-rose-500/40'
                          : 'bg-stone-950 border-stone-800'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-stone-100 text-sm font-serif-display">
                          Mesa #{tbl.number}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            statusDisplay === 'disponible'
                              ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20'
                              : statusDisplay === 'reservada'
                              ? 'text-amber-400 bg-amber-500/10 border border-amber-500/30'
                              : 'text-rose-400 bg-rose-500/10 border border-rose-500/30'
                          }`}
                        >
                          {statusDisplay}
                        </span>
                      </div>

                      <p className="text-stone-300">
                        <strong>Zona:</strong> {tbl.zoneName} · <strong>Capacidad:</strong> {tbl.capacity}p
                      </p>

                      {/* Si está reservada en esta fecha, mostrar quién la tiene y opción de liberar */}
                      {activeRes ? (
                        <div className="pt-2 border-t border-stone-800/80 space-y-1.5">
                          <p className="text-amber-300 font-semibold text-[11px]">
                            👤 Reservada por: {activeRes.customerName}
                          </p>
                          <p className="text-stone-400 text-[11px]">
                            Código: <strong className="font-mono text-stone-200">{activeRes.code}</strong> · {activeRes.guests} personas ({activeRes.time} hrs)
                          </p>
                          <button
                            onClick={() => onCancelReservation(activeRes.id)}
                            className="mt-1 w-full py-1.5 px-3 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 font-semibold text-[11px] transition-colors cursor-pointer"
                          >
                            Liberar Mesa (Cancelar Reserva)
                          </button>
                        </div>
                      ) : (
                        <p className="text-emerald-400/80 text-[11px] pt-1 border-t border-stone-800/60 flex items-center gap-1">
                          ✓ Mesa libre para reservar en esta fecha y turno
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* VISTA 3: GESTIONAR HORARIOS & TURNOS (Interactivo con métricas en vivo) */}
          {currentSection === 'horarios' && (
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-stone-800 gap-3">
                  <div>
                    <h1 className="text-2xl font-bold font-serif-display text-stone-100">
                      Gestión de Horarios y Turnos de Servicio
                    </h1>
                    <p className="text-xs text-stone-400">
                      Capacidad operativa, control de aforo en vivo y franjas horarias por turno.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-xs bg-stone-950 border border-stone-800 px-3 py-1.5 rounded-xl">
                    <Calendar className="w-3.5 h-3.5 text-amber-400" />
                    <span className="text-stone-400">Fecha:</span>
                    <strong className="text-amber-300 font-mono">{inspectedDate}</strong>
                  </div>
                </div>

                {/* Dos Turnos Operativos */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-xs">
                  
                  {/* Turno 1: Almuerzo */}
                  <div className="p-5 rounded-2xl bg-stone-950 border border-stone-800 space-y-4 shadow-md">
                    <div className="flex items-center justify-between">
                      <span className="text-amber-400 font-bold text-sm">
                        Turno 1: Almuerzo Ejecutivo & Familiar
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        Turno Activo
                      </span>
                    </div>

                    <div className="space-y-1">
                      <p className="text-stone-300">
                        Horario de Servicio: <strong className="text-stone-100">12:30 a 15:30 hrs</strong>
                      </p>
                      <p className="text-stone-400 text-[11px]">
                        Capacidad máxima autorizada: 52 comensales (13 mesas).
                      </p>
                    </div>

                    {/* Barra de progreso de aforo para Almuerzo */}
                    <div className="p-3 rounded-xl bg-stone-900/60 border border-stone-800/80 space-y-2">
                      <div className="flex justify-between items-center text-[11px]">
                        <span className="text-stone-300 font-semibold">Ocupación para {inspectedDate}:</span>
                        <span className="font-mono text-amber-300 font-bold">
                          {almuerzoGuests} / 52 comensales ({almuerzoPct}%)
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-stone-800 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-emerald-500 to-amber-400 transition-all duration-500"
                          style={{ width: `${almuerzoPct}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-stone-500 block">
                        {almuerzoRes.length} reserva(s) registrada(s) en este turno
                      </span>
                    </div>

                    {/* Franjas de Almuerzo */}
                    <div>
                      <span className="text-[11px] text-stone-400 font-semibold block mb-2">
                        Franjas Horarias Disponibles (Intervalos de 30 min):
                      </span>
                      <div className="grid grid-cols-3 gap-2 text-center">
                        {['12:30', '13:00', '13:30', '14:00', '14:30', '15:00'].map((time) => {
                          const count = almuerzoRes.filter((r) => r.time === time).length;
                          return (
                            <div
                              key={time}
                              className={`p-2 rounded-lg border text-xs ${
                                count > 0
                                    ? 'bg-amber-500/10 border-amber-500/30 text-amber-300 font-bold'
                                    : 'bg-stone-900 border-stone-800 text-stone-400'
                              }`}
                            >
                              <span>{time} hrs</span>
                              <span className="block text-[10px] font-normal opacity-80 mt-0.5">
                                {count > 0 ? `${count} reserva(s)` : 'Libre'}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Turno 2: Cena */}
                  <div className="p-5 rounded-2xl bg-stone-950 border border-stone-800 space-y-4 shadow-md">
                    <div className="flex items-center justify-between">
                      <span className="text-amber-400 font-bold text-sm">
                        Turno 2: Cena Gourmet de Autor
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        Alta Demanda
                      </span>
                    </div>

                    <div className="space-y-1">
                      <p className="text-stone-300">
                        Horario de Servicio: <strong className="text-stone-100">19:00 a 23:00 hrs</strong>
                      </p>
                      <p className="text-stone-400 text-[11px]">
                        Hora pico estimada: 20:00 a 21:30 hrs. Aforo máximo: 52 comensales.
                      </p>
                    </div>

                    {/* Barra de progreso de aforo para Cena */}
                    <div className="p-3 rounded-xl bg-stone-900/60 border border-stone-800/80 space-y-2">
                      <div className="flex justify-between items-center text-[11px]">
                        <span className="text-stone-300 font-semibold">Ocupación para {inspectedDate}:</span>
                        <span className="font-mono text-amber-300 font-bold">
                          {cenaGuests} / 52 comensales ({cenaPct}%)
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-stone-800 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-amber-500 to-rose-400 transition-all duration-500"
                          style={{ width: `${cenaPct}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-stone-500 block">
                        {cenaRes.length} reserva(s) registrada(s) en este turno
                      </span>
                    </div>

                    {/* Franjas de Cena */}
                    <div>
                      <span className="text-[11px] text-stone-400 font-semibold block mb-2">
                        Franjas Horarias Disponibles (Intervalos de 30 min):
                      </span>
                      <div className="grid grid-cols-4 sm:grid-cols-4 gap-2 text-center">
                        {['19:00', '19:30', '20:00', '20:30', '21:00', '21:30', '22:00'].map((time) => {
                          const count = cenaRes.filter((r) => r.time === time).length;
                          const isPeak = time === '20:00' || time === '20:30' || time === '21:00';
                          return (
                            <div
                              key={time}
                              className={`p-2 rounded-lg border text-xs ${
                                count > 0
                                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-300 font-bold'
                                  : isPeak
                                  ? 'bg-stone-900/80 border-amber-500/20 text-stone-300'
                                  : 'bg-stone-900 border-stone-800 text-stone-400'
                              }`}
                            >
                              <span>{time}</span>
                              <span className="block text-[10px] font-normal opacity-80 mt-0.5">
                                {count > 0 ? `${count} res.` : isPeak ? 'Pico' : 'Libre'}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                </div>

                {/* 4 Reglas de Negocio Operativas */}
                <div className="p-4 rounded-xl bg-stone-950 border border-stone-800 grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs text-center">
                  <div>
                    <span className="text-stone-500 uppercase font-bold text-[10px] block">Rotación por Mesa</span>
                    <span className="font-bold text-stone-200 mt-0.5 block">90 a 120 min</span>
                  </div>
                  <div>
                    <span className="text-stone-500 uppercase font-bold text-[10px] block">Tolerancia Máxima</span>
                    <span className="font-bold text-amber-400 mt-0.5 block">15 minutos exactos</span>
                  </div>
                  <div>
                    <span className="text-stone-500 uppercase font-bold text-[10px] block">Intervalo de Bloques</span>
                    <span className="font-bold text-stone-200 mt-0.5 block">Cada 30 minutos</span>
                  </div>
                  <div>
                    <span className="text-stone-500 uppercase font-bold text-[10px] block">Aforo Total Sala</span>
                    <span className="font-bold text-emerald-400 mt-0.5 block">52 comensales (13 mesas)</span>
                  </div>
                </div>

              </div>
            )}

          {/* REPORTE 01 */}
          {currentSection === 'reporte1' && (
            <div className="space-y-6">
              <div className="pb-4 border-b border-stone-800">
                <span className="text-xs text-amber-400 uppercase font-bold">Reporte Gerencial Oficial 1</span>
                <h1 className="text-2xl font-bold font-serif-display text-stone-100">
                  Reporte de Tasa de Ocupación por Zonas
                </h1>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                <div className="p-4 rounded-xl bg-stone-950 border border-stone-800">
                  <span className="font-bold text-stone-200 block">Ventanales Panorámicos</span>
                  <span className="text-2xl font-mono font-bold text-amber-400 block my-1">85% Ocupación</span>
                  <span className="text-stone-400">Zona con mayor demanda al atardecer</span>
                </div>
                <div className="p-4 rounded-xl bg-stone-950 border border-stone-800">
                  <span className="font-bold text-stone-200 block">Salón Central</span>
                  <span className="text-2xl font-mono font-bold text-sky-400 block my-1">72% Ocupación</span>
                  <span className="text-stone-400">Demanda constante para almuerzos</span>
                </div>
                <div className="p-4 rounded-xl bg-stone-950 border border-stone-800">
                  <span className="font-bold text-stone-200 block">Terraza Jardín</span>
                  <span className="text-2xl font-mono font-bold text-emerald-400 block my-1">64% Ocupación</span>
                  <span className="text-stone-400">Mayor ocupación viernes y sábados</span>
                </div>
                <div className="p-4 rounded-xl bg-stone-950 border border-stone-800">
                  <span className="font-bold text-stone-200 block">Zona VIP & Cava</span>
                  <span className="text-2xl font-mono font-bold text-purple-400 block my-1">92% Ocupación</span>
                  <span className="text-stone-400">Reservas ejecutivas y eventos</span>
                </div>
              </div>
            </div>
          )}

          {/* REPORTE 02 */}
          {currentSection === 'reporte2' && (
            <div className="space-y-6">
              <div className="pb-4 border-b border-stone-800">
                <span className="text-xs text-amber-400 uppercase font-bold">Reporte Gerencial Oficial 2</span>
                <h1 className="text-2xl font-bold font-serif-display text-stone-100">
                  Reporte de Demanda por Turnos y Horas Pico
                </h1>
              </div>

              <div className="p-5 rounded-2xl bg-stone-950 border border-stone-800 space-y-4 text-xs">
                <div className="flex justify-between items-center pb-3 border-b border-stone-800">
                  <span>Turno Almuerzo (12:30 a 15:30)</span>
                  <span className="font-bold text-sky-400 font-mono">35% de reservas totales</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-stone-800">
                  <span>Turno Cena Gourmet (19:00 a 23:00)</span>
                  <span className="font-bold text-amber-400 font-mono">65% de reservas totales</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Hora Pico Principal (Peak Hour)</span>
                  <span className="font-bold text-rose-400 font-mono">20:00 a 21:00 hrs (100% ocupación)</span>
                </div>
              </div>
            </div>
          )}

          {/* REPORTE 03 */}
          {currentSection === 'reporte3' && (
            <div className="space-y-6">
              <div className="pb-4 border-b border-stone-800">
                <span className="text-xs text-amber-400 uppercase font-bold">Reporte Gerencial Oficial 3</span>
                <h1 className="text-2xl font-bold font-serif-display text-stone-100">
                  Reporte de Ingresos Estimados y Consumo Promedio
                </h1>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div className="p-4 rounded-xl bg-stone-950 border border-stone-800">
                  <span className="font-bold text-stone-200 block">Ticket Promedio por Comensal</span>
                  <span className="text-2xl font-mono font-bold text-emerald-400 block my-1">S/. 95.00</span>
                  <span className="text-stone-400">Incluye plato principal y bebida</span>
                </div>
                <div className="p-4 rounded-xl bg-stone-950 border border-stone-800">
                  <span className="font-bold text-stone-200 block">Comensales Proyectados Hoy</span>
                  <span className="text-2xl font-mono font-bold text-amber-400 block my-1">42 personas</span>
                  <span className="text-stone-400">Basado en reservas activas</span>
                </div>
                <div className="p-4 rounded-xl bg-stone-950 border border-stone-800">
                  <span className="font-bold text-stone-200 block">Ingreso Diario Estimado</span>
                  <span className="text-2xl font-mono font-bold text-stone-100 block my-1">S/. 3,990.00</span>
                  <span className="text-stone-400">Facturación proyectada</span>
                </div>
              </div>
            </div>
          )}

          {/* REPORTE 04 */}
          {currentSection === 'reporte4' && (
            <div className="space-y-6">
              <div className="pb-4 border-b border-stone-800">
                <span className="text-xs text-amber-400 uppercase font-bold">Reporte Gerencial Oficial 4</span>
                <h1 className="text-2xl font-bold font-serif-display text-stone-100">
                  Reporte de Asistencia, Cancelaciones y Tolerancia
                </h1>
              </div>

              <div className="p-5 rounded-2xl bg-stone-950 border border-stone-800 space-y-4 text-xs">
                <div className="flex justify-between items-center pb-3 border-b border-stone-800">
                  <span>Tasa de Asistencia Efectiva (Show-up rate):</span>
                  <span className="font-bold text-emerald-400 font-mono">94%</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-stone-800">
                  <span>Tasa de Cancelaciones Anticipadas:</span>
                  <span className="font-bold text-amber-400 font-mono">6%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Política de Tolerancia de Mesa:</span>
                  <span className="font-bold text-stone-200 font-mono">15 minutos exactos</span>
                </div>
              </div>
            </div>
          )}
          </div>
        </main>
      </div>

    </div>
  );
};