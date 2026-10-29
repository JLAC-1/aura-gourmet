import React, { useState } from 'react';
import { ReservationData, RestaurantTable, MenuItem } from '../types';
import { Panelbarra } from '../components/admin/Panelbarra';
import { Panelmenu, AdminSection } from '../components/admin/Panelmenu';
import {
  RotateCcw,
  Eye,
  Calendar,
  UtensilsCrossed,
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
  TrendingUp,
  Award,
  Receipt,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  ShoppingBag,
  Clock,
  Sliders,
  Printer,
 CheckCircle2,
  Lock,
  Unlock,
} from 'lucide-react';
import {
  MENU_ITEMS,
  INITIAL_STAFF,
  INITIAL_CLIENTS,
  MONTHLY_SALES_REPORT,
  DISH_SALES_RANKING,
} from '../data/mockData';

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
  onCreateReservation?: (data: any) => { success: boolean; reservation?: ReservationData; error?: string };
  onResetData: () => void;
  onSelectReservationForView: (reservation: ReservationData) => void;
  onLogout: () => void;
  onBackToClientSite: () => void;
}

export const Admin: React.FC<AdminProps> = ({
  reservations,
  tables,
  stats: _stats,
  onUpdateStatus,
  onCancelReservation,
  onCreateReservation,
  onResetData,
  onSelectReservationForView,
  onLogout,
  onBackToClientSite,
}) => {
  const [currentSection, setCurrentSection] = useState<AdminSection>('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'todas' | 'activas' | 'canceladas'>('todas');
  const [dateFilter, setDateFilter] = useState<'todas' | 'hoy' | 'manana' | 'quincena' | 'mes' | 'personalizado'>('todas');
  const [customFilterDate, setCustomFilterDate] = useState<string>('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [inspectedDate, setInspectedDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [inspectedShift, setInspectedShift] = useState<'almuerzo' | 'cena'>('cena');

  // Helper de cálculo de días relativos desde la fecha actual (seguro ante zonas horarias)
  const getDaysDiff = (dateStr: string) => {
    try {
      if (!dateStr) return 0;
      const today = new Date();
      const todayY = today.getFullYear();
      const todayM = today.getMonth();
      const todayD = today.getDate();

      const [rY, rM, rD] = dateStr.split('-').map(Number);
      if (!rY || !rM || !rD) return 0;

      const dToday = new Date(todayY, todayM, todayD).getTime();
      const dTarget = new Date(rY, rM - 1, rD).getTime();
      return Math.round((dTarget - dToday) / (1000 * 60 * 60 * 24));
    } catch {
      return 0;
    }
  };

  // Conteos y métricas por plazos temporales (Hoy, Mañana, 15 días, 1 mes)
  const resHoy = reservations.filter((r) => getDaysDiff(r.date) === 0 && r.status !== 'cancelada');
  const resManana = reservations.filter((r) => getDaysDiff(r.date) === 1 && r.status !== 'cancelada');
  const resQuincena = reservations.filter((r) => {
    const d = getDaysDiff(r.date);
    return d >= 0 && d <= 15 && r.status !== 'cancelada';
  });
  const resMes = reservations.filter((r) => {
    const d = getDaysDiff(r.date);
    return d >= 0 && d <= 30 && r.status !== 'cancelada';
  });

  const guestsHoy = resHoy.reduce((a, b) => a + b.guests, 0);
  const guestsManana = resManana.reduce((a, b) => a + b.guests, 0);
  const guestsQuincena = resQuincena.reduce((a, b) => a + b.guests, 0);
  const guestsMes = resMes.reduce((a, b) => a + b.guests, 0);

  // Catálogo de Platos
  const [dishesList, setDishesList] = useState<MenuItem[]>(() =>
    MENU_ITEMS.map((item, idx) => ({
      ...item,
      status: idx === 5 ? 'inactivo' : 'activo',
    }))
  );
  const [dishCategoryFilter, setDishCategoryFilter] = useState<string>('todas');
  const [dishModalOpen, setDishModalOpen] = useState(false);
  const [editingDish, setEditingDish] = useState<MenuItem | null>(null);

  // Formulario de Plato
  const [dishFormName, setDishFormName] = useState('');
  const [dishFormCategory, setDishFormCategory] = useState<'entradas' | 'principales' | 'bebidas' | 'postres'>('principales');
  const [dishFormPrice, setDishFormPrice] = useState<number>(45);
  const [dishFormDescription, setDishFormDescription] = useState('');
  const [dishFormImage, setDishFormImage] = useState('');
  const [dishFormStatus, setDishFormStatus] = useState<'activo' | 'inactivo'>('activo');

  // Estado de Personal y Clientes
  const [activeTabPC, setActiveTabPC] = useState<'clientes' | 'personal'>('clientes');
  const [staffList] = useState(INITIAL_STAFF);
  const [clientList] = useState(INITIAL_CLIENTS);

  // --- NUEVOS ESTADOS INTERACTIVOS PARA GESTIÓN DE HORARIOS Y DESCONGESTIÓN ---
  const [blockedSlots, setBlockedSlots] = useState<string[]>(['20:30']); // Franja de alta demanda pausada como ejemplo inicial
  const [selectedSlotModal, setSelectedSlotModal] = useState<{ time: string; shift: 'almuerzo' | 'cena' } | null>(null);
  const [rotationMinutes, setRotationMinutes] = useState<number>(90);
  const [toleranceMinutes, setToleranceMinutes] = useState<number>(15);
  const [intervalMinutes, setIntervalMinutes] = useState<number>(30);
  const [ruleUpdatedToast, setRuleUpdatedToast] = useState<string | null>(null);

  // --- NUEVOS ESTADOS INTERACTIVOS PARA GESTIÓN INTEGRAL DE MESAS ---
  const [selectedTableModal, setSelectedTableModal] = useState<RestaurantTable | null>(null);
  const [tableCleanStatus, setTableCleanStatus] = useState<Record<string, 'limpieza' | 'mantenimiento' | 'disponible'>>({
    'tbl-4': 'limpieza', // Ejemplo de mesa recién desocupada
  });
  const [walkInModalTable, setWalkInModalTable] = useState<RestaurantTable | null>(null);
  const [walkInName, setWalkInName] = useState('');
  const [walkInGuests, setWalkInGuests] = useState(2);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  const showActionFeedback = (msg: string) => {
    setActionFeedback(msg);
    setTimeout(() => setActionFeedback(null), 4000);
  };

  // Counts for reservations
  const totalCount = reservations.length;
  const activasCount = reservations.filter((r) => r.status === 'confirmada' || r.status === 'en_mesa').length;
  const canceladasCount = reservations.filter((r) => r.status === 'cancelada').length;

  // Sincronización DINÁMICA en vivo de estados de sala para el Dashboard
  const enSalaReservations = reservations.filter((r) => r.status === 'en_mesa');
  const confirmadasReservations = reservations.filter((r) => r.status === 'confirmada');
  const occupiedTableIds = new Set(enSalaReservations.map((r) => r.tableId));
  const reservedTableIds = new Set(confirmadasReservations.map((r) => r.tableId));

  const dynamicEnSalaCount = enSalaReservations.length;
  const dynamicReservadasCount = confirmadasReservations.length;
  const dynamicDisponiblesCount = Math.max(0, tables.length - occupiedTableIds.size - reservedTableIds.size);

  // Filtered reservations
  const filteredReservations = reservations.filter((res) => {
    const matchesSearch =
      res.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      res.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      res.tableNumber.toString().includes(searchTerm);

    if (!matchesSearch) return false;

    if (statusFilter === 'activas') {
      if (res.status !== 'confirmada' && res.status !== 'en_mesa') return false;
    } else if (statusFilter === 'canceladas') {
      if (res.status !== 'cancelada') return false;
    }

    // Filtro por plazo de fecha
    const diff = getDaysDiff(res.date);
    if (dateFilter === 'hoy') {
      return diff === 0;
    }
    if (dateFilter === 'manana') {
      return diff === 1;
    }
    if (dateFilter === 'quincena') {
      return diff >= 0 && diff <= 15;
    }
    if (dateFilter === 'mes') {
      return diff >= 0 && diff <= 30;
    }
    if (dateFilter === 'personalizado' && customFilterDate) {
      return res.date === customFilterDate;
    }

    return true;
  });

  // Shift metrics for inspected date
  const almuerzoRes = reservations.filter((r) => r.shift === 'almuerzo' && r.date === inspectedDate && r.status !== 'cancelada');
  const cenaRes = reservations.filter((r) => r.shift === 'cena' && r.date === inspectedDate && r.status !== 'cancelada');
  const almuerzoGuests = almuerzoRes.reduce((acc, r) => acc + r.guests, 0);
  const cenaGuests = cenaRes.reduce((acc, r) => acc + r.guests, 0);
  const almuerzoPct = Math.min(100, Math.round((almuerzoGuests / 52) * 100));
  const cenaPct = Math.min(100, Math.round((cenaGuests / 52) * 100));

  // Total de garantí­as cobradas con tarjeta
  const totalGarantiasRecaudadas = reservations
    .filter((r) => r.status !== 'cancelada')
    .reduce((acc, r) => acc + (r.payment?.totalPaid || r.guests * 30), 0);

  // Manejadores de Platos
  const handleOpenNewDish = () => {
    setEditingDish(null);
    setDishFormName('');
    setDishFormCategory('principales');
    setDishFormPrice(55);
    setDishFormDescription('');
    setDishFormImage('https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80');
    setDishFormStatus('activo');
    setDishModalOpen(true);
  };

  const handleOpenEditDish = (dish: MenuItem) => {
    setEditingDish(dish);
    setDishFormName(dish.name);
    setDishFormCategory(dish.category);
    setDishFormPrice(dish.price);
    setDishFormDescription(dish.description);
    setDishFormImage(dish.image);
    setDishFormStatus(dish.status || 'activo');
    setDishModalOpen(true);
  };

  const handleSaveDish = (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!dishFormName.trim()) return;

    if (editingDish) {
      // Editar plato existente
      setDishesList((prev) =>
        prev.map((d) =>
          d.id === editingDish.id
            ? {
                ...d,
                name: dishFormName,
                category: dishFormCategory,
                price: Number(dishFormPrice),
                description: dishFormDescription,
                image: dishFormImage || d.image,
                status: dishFormStatus,
              }
            : d
        )
      );
    } else {
      // Crear nuevo plato
      const newDish: MenuItem = {
        id: `m-custom-${Date.now()}`,
        name: dishFormName,
        category: dishFormCategory,
        price: Number(dishFormPrice),
        description: dishFormDescription,
        image: dishFormImage || 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
        status: dishFormStatus,
        prepTime: '20 min',
      };
      setDishesList((prev) => [newDish, ...prev]);
    }
    setDishModalOpen(false);
  };

  const handleDeleteDish = (dishId: string) => {
    if (confirm('¿Está seguro de eliminar este plato del menú?')) {
      setDishesList((prev) => prev.filter((d) => d.id !== dishId));
    }
  };

  const handleToggleDishStatus = (dishId: string) => {
    setDishesList((prev) =>
      prev.map((d) =>
        d.id === dishId ? { ...d, status: d.status === 'activo' ? 'inactivo' : 'activo' } : d
      )
    );
  };

  // Filtrado de platos
  const filteredDishes = dishesList.filter((d) => {
    const matchesCat = dishCategoryFilter === 'todas' || d.category === dishCategoryFilter;
    const matchesQuery = d.name.toLowerCase().includes(searchTerm.toLowerCase()) || d.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCat && matchesQuery;
  });

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

        {/* 3. Contenedor de Contenido Principal */}
        <main className="flex-1 p-6 sm:p-8 overflow-y-auto w-full">
          <div className="max-w-7xl mx-auto w-full space-y-6">

            {/* ========================================================
                VISTA 1: DASHBOARD GENERAL
               ======================================================== */}
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
                    className="px-3 py-1.5 rounded-xl bg-stone-800 text-stone-300 text-xs flex items-center gap-1.5 w-fit hover:bg-stone-700 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Restablecer Demo
                  </button>
                </div>

                {actionFeedback && (
                  <div className="p-3 rounded-xl bg-emerald-950/90 border border-emerald-500/40 text-emerald-200 text-xs flex items-center justify-between animate-in slide-in-from-top-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>{actionFeedback}</span>
                    </div>
                    <button onClick={() => setActionFeedback(null)} className="text-emerald-400 hover:text-white cursor-pointer">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {/* KPI Strip Sincronizado en Tiempo Real */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                  <div className="p-4 rounded-xl bg-stone-950 border border-stone-800">
                    <span className="text-[11px] text-stone-500 uppercase font-bold">Total Mesas</span>
                    <span className="text-2xl font-bold font-mono text-stone-100 block mt-1">{tables.length}</span>
                    <span className="text-[10px] text-stone-400">Capacidad 52 personas</span>
                  </div>
                  <div className="p-4 rounded-xl bg-stone-950 border border-emerald-500/30 bg-gradient-to-br from-stone-950 to-emerald-950/10">
                    <span className="text-[11px] text-emerald-400 uppercase font-bold">Disponibles</span>
                    <span className="text-2xl font-bold font-mono text-emerald-400 block mt-1">{dynamicDisponiblesCount}</span>
                    <span className="text-[10px] text-stone-400">Libres en sala</span>
                  </div>
                  <div className="p-4 rounded-xl bg-stone-950 border border-amber-500/30 bg-gradient-to-br from-stone-950 to-amber-950/10">
                    <span className="text-[11px] text-amber-400 uppercase font-bold">Reservadas</span>
                    <span className="text-2xl font-bold font-mono text-amber-400 block mt-1">{dynamicReservadasCount}</span>
                    <span className="text-[10px] text-stone-400">Confirmadas</span>
                  </div>
                  <div className="p-4 rounded-xl bg-stone-950 border border-sky-500/30 bg-gradient-to-br from-stone-950 to-sky-950/10">
                    <span className="text-[11px] text-sky-400 uppercase font-bold">En Sala Ahora</span>
                    <span className="text-2xl font-bold font-mono text-sky-400 block mt-1">{dynamicEnSalaCount}</span>
                    <span className="text-[10px] text-sky-300/80">Comensales en mesa</span>
                  </div>
                  <div className="p-4 rounded-xl bg-stone-950 border border-amber-500/30 col-span-2 sm:col-span-1 bg-gradient-to-br from-stone-950 to-amber-950/20">
                    <span className="text-[11px] text-amber-300 uppercase font-bold">Garantías Cobradas</span>
                    <span className="text-2xl font-bold font-mono text-amber-400 block mt-1">S/. {totalGarantiasRecaudadas.toFixed(2)}</span>
                    <span className="text-[10px] text-emerald-400">Depósitos afianzados</span>
                  </div>
                </div>

                {/* WIDGET RESUMEN CRONOLÓGICO: HOY, MAÑANA, 15 DÍAS, UN MES */}
                <div className="space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-amber-400" />
                      <span className="text-xs uppercase font-bold text-stone-300 tracking-wider">
                        Resumen de Reservas por Plazo Temporal (Hoy, Mañana, 15 Dí­as, 1 Mes)
                      </span>
                    </div>
                    <span className="text-[11px] text-stone-400">
                      Haga clic en cualquier tarjeta para filtrar instantaneamente el listado
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {/* Tarjeta Hoy */}
                    <button
                      type="button"
                      onClick={() => setDateFilter(dateFilter === 'hoy' ? 'todas' : 'hoy')}
                      className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer relative overflow-hidden group ${
                        dateFilter === 'hoy'
                          ? 'bg-emerald-950/40 border-emerald-500 text-white shadow-lg ring-1 ring-emerald-500/50'
                          : 'bg-stone-950 border-stone-800 hover:border-emerald-500/40 text-stone-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">Hoy en Sala</span>
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                      </div>
                      <div className="flex items-baseline gap-2 mt-1">
                        <span className="text-2xl font-bold font-mono text-emerald-300">{resHoy.length}</span>
                        <span className="text-xs text-stone-400">reservas</span>
                      </div>
                      <div className="text-[11px] text-stone-400 mt-0.5 flex items-center justify-between">
                        <span>{guestsHoy} comensales</span>
                        <span className="text-[10px] text-emerald-400 font-medium group-hover:underline">
                          {dateFilter === 'hoy' ? '✓ Activo' : 'Ver hoy →'}
                        </span>
                      </div>
                    </button>

                    {/* Tarjeta Mañana */}
                    <button
                      type="button"
                      onClick={() => setDateFilter(dateFilter === 'manana' ? 'todas' : 'manana')}
                      className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer relative overflow-hidden group ${
                        dateFilter === 'manana'
                          ? 'bg-sky-950/40 border-sky-500 text-white shadow-lg ring-1 ring-sky-500/50'
                          : 'bg-stone-950 border-stone-800 hover:border-sky-500/40 text-stone-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase font-bold text-sky-400 tracking-wider">Mañana</span>
                        <Calendar className="w-3.5 h-3.5 text-sky-400" />
                      </div>
                      <div className="flex items-baseline gap-2 mt-1">
                        <span className="text-2xl font-bold font-mono text-sky-300">{resManana.length}</span>
                        <span className="text-xs text-stone-400">reservas</span>
                      </div>
                      <div className="text-[11px] text-stone-400 mt-0.5 flex items-center justify-between">
                        <span>{guestsManana} comensales</span>
                        <span className="text-[10px] text-sky-400 font-medium group-hover:underline">
                          {dateFilter === 'manana' ? '✓ Activo' : 'Ver mañana →'}
                        </span>
                      </div>
                    </button>

                    {/* Tarjeta Próximos 15 Días */}
                    <button
                      type="button"
                      onClick={() => setDateFilter(dateFilter === 'quincena' ? 'todas' : 'quincena')}
                      className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer relative overflow-hidden group ${
                        dateFilter === 'quincena'
                          ? 'bg-amber-950/40 border-amber-500 text-white shadow-lg ring-1 ring-amber-500/50'
                          : 'bg-stone-950 border-stone-800 hover:border-amber-500/40 text-stone-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">Próximos 15 Dí­as</span>
                        <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
                      </div>
                      <div className="flex items-baseline gap-2 mt-1">
                        <span className="text-2xl font-bold font-mono text-amber-300">{resQuincena.length}</span>
                        <span className="text-xs text-stone-400">reservas</span>
                      </div>
                      <div className="text-[11px] text-stone-400 mt-0.5 flex items-center justify-between">
                        <span>{guestsQuincena} comensales</span>
                        <span className="text-[10px] text-amber-400 font-medium group-hover:underline">
                          {dateFilter === 'quincena' ? '✓ Activo' : 'Ver quincena →'}
                        </span>
                      </div>
                    </button>

                    {/* Tarjeta Próximo Mes (30 dí­as) */}
                    <button
                      type="button"
                      onClick={() => setDateFilter(dateFilter === 'mes' ? 'todas' : 'mes')}
                      className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer relative overflow-hidden group ${
                        dateFilter === 'mes'
                          ? 'bg-purple-950/40 border-purple-500 text-white shadow-lg ring-1 ring-purple-500/50'
                          : 'bg-stone-950 border-stone-800 hover:border-purple-500/40 text-stone-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase font-bold text-purple-400 tracking-wider">Próximo Mes (30d)</span>
                        <Receipt className="w-3.5 h-3.5 text-purple-400" />
                      </div>
                      <div className="flex items-baseline gap-2 mt-1">
                        <span className="text-2xl font-bold font-mono text-purple-300">{resMes.length}</span>
                        <span className="text-xs text-stone-400">reservas</span>
                      </div>
                      <div className="text-[11px] text-stone-400 mt-0.5 flex items-center justify-between">
                        <span>{guestsMes} comensales</span>
                        <span className="text-[10px] text-purple-400 font-medium group-hover:underline">
                          {dateFilter === 'mes' ? '✓ Activo' : 'Ver mes →'}
                        </span>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Tabla de Reservas Activas con Filtros de Fecha */}
                <div className="bg-stone-950 border border-stone-800 rounded-2xl overflow-hidden shadow-xl">
                  {/* Encabezado con Estados y Busqueda */}
                  <div className="p-4 border-b border-stone-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-stone-200 block text-sm">Listado Cronológico de Reservas</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          {filteredReservations.length} encontradas
                        </span>
                      </div>
                      <span className="text-stone-400 text-[11px]">
                        Control de estados, asistencia, garantí­as con tarjeta, pre-orden y agenda de fechas
                      </span>
                    </div>

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

                  {/* Barra de Filtros por Plazos Rápidos de Fecha */}
                  <div className="p-3 border-b border-stone-800/80 bg-stone-900/50 flex flex-wrap items-center justify-between gap-2.5 text-xs">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-stone-400 font-semibold text-[11px] mr-1 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-amber-400" /> Plazo:
                      </span>
                      <button
                        onClick={() => { setDateFilter('todas'); setCustomFilterDate(''); }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                          dateFilter === 'todas'
                            ? 'bg-amber-400 text-stone-950 font-bold shadow-xs'
                            : 'bg-stone-900 text-stone-300 hover:text-white border border-stone-800'
                        }`}
                      >
                        Todas las fechas ({reservations.length})
                      </button>
                      <button
                        onClick={() => { setDateFilter('hoy'); setCustomFilterDate(''); }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                          dateFilter === 'hoy'
                            ? 'bg-emerald-500 text-stone-950 font-bold shadow-xs'
                            : 'bg-stone-900 text-emerald-400 hover:bg-stone-800 border border-stone-800'
                        }`}
                      >
                        Hoy ({resHoy.length})
                      </button>
                      <button
                        onClick={() => { setDateFilter('manana'); setCustomFilterDate(''); }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                          dateFilter === 'manana'
                            ? 'bg-sky-500 text-stone-950 font-bold shadow-xs'
                            : 'bg-stone-900 text-sky-400 hover:bg-stone-800 border border-stone-800'
                        }`}
                      >
                        Mañana ({resManana.length})
                      </button>
                      <button
                        onClick={() => { setDateFilter('quincena'); setCustomFilterDate(''); }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                          dateFilter === 'quincena'
                            ? 'bg-amber-400 text-stone-950 font-bold shadow-xs'
                            : 'bg-stone-900 text-amber-300 hover:bg-stone-800 border border-stone-800'
                        }`}
                      >
                        Próximos 15 dí­as ({resQuincena.length})
                      </button>
                      <button
                        onClick={() => { setDateFilter('mes'); setCustomFilterDate(''); }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                          dateFilter === 'mes'
                            ? 'bg-purple-400 text-stone-950 font-bold shadow-xs'
                            : 'bg-stone-900 text-purple-300 hover:bg-stone-800 border border-stone-800'
                        }`}
                      >
                        Próximo Mes ({resMes.length})
                      </button>
                    </div>

                    {/* Selector de fecha puntual */}
                    <div className="flex items-center gap-2">
                      <span className="text-stone-400 text-[11px]">Dí­a puntual:</span>
                      <input
                        type="date"
                        value={customFilterDate}
                        onChange={(e) => {
                          setCustomFilterDate(e.target.value);
                          if (e.target.value) {
                            setDateFilter('personalizado');
                          } else {
                            setDateFilter('todas');
                          }
                        }}
                        className="px-2.5 py-1 rounded-lg bg-stone-900 border border-stone-700 text-stone-200 text-xs focus:outline-none focus:border-amber-400"
                      />
                      {customFilterDate && (
                        <button
                          onClick={() => {
                            setCustomFilterDate('');
                            setDateFilter('todas');
                          }}
                          className="px-2 py-1 rounded-lg bg-stone-800 text-stone-400 hover:text-white text-xs cursor-pointer flex items-center gap-1"
                          title="Limpiar filtro de fecha"
                        >
                          <X className="w-3 h-3" /> Limpiar
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Banner de filtro activo */}
                  {dateFilter !== 'todas' && (
                    <div className="px-4 py-2.5 bg-amber-500/10 border-b border-amber-500/20 flex flex-wrap items-center justify-between gap-2 text-xs text-amber-200 animate-in fade-in">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                        <span>
                          Filtrando por:{' '}
                          <strong className="text-amber-300 uppercase tracking-wide">
                            {dateFilter === 'hoy' && 'HOY'}
                            {dateFilter === 'manana' && 'MAÑANA'}
                            {dateFilter === 'quincena' && 'PRÓXIMOS 15 DÍAS'}
                            {dateFilter === 'mes' && 'PRÓXIMO MES (30 DÍAS)'}
                            {dateFilter === 'personalizado' && `DÍA: ${customFilterDate}`}
                          </strong>{' '}
                          - Mostrando <strong>{filteredReservations.length}</strong> de {reservations.length} reservas
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          setDateFilter('todas');
                          setCustomFilterDate('');
                        }}
                        className="text-amber-400 hover:text-white underline font-semibold cursor-pointer text-xs flex items-center gap-1"
                      >
                        <X className="w-3 h-3" /> Quitar filtro (Ver todas)
                      </button>
                    </div>
                  )}

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-stone-900 text-stone-400 uppercase font-semibold border-b border-stone-800">
                        <tr>
                          <th className="px-4 py-3">Código</th>
                          <th className="px-4 py-3">Cliente</th>
                          <th className="px-4 py-3">Fecha y Plazo</th>
                          <th className="px-4 py-3">Mesa & Platos</th>
                          <th className="px-4 py-3">Garantí­a Tarjeta</th>
                          <th className="px-4 py-3">Personas</th>
                          <th className="px-4 py-3">Estado</th>
                          <th className="px-4 py-3 text-right">Acciones</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-800/60">
                        {filteredReservations.map((res) => {
                          const diff = getDaysDiff(res.date);
                          return (
                          <tr key={res.id} className="hover:bg-stone-900/50">
                            <td className="px-4 py-3 font-mono font-bold text-amber-400">{res.code}</td>
                            <td className="px-4 py-3">
                              <span className="font-semibold text-stone-200 block">{res.customerName}</span>
                              <span className="text-[11px] text-stone-500 block">{res.phone}</span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="font-semibold text-stone-200 font-mono">{res.date}</span>
                                {diff === 0 && (
                                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                    HOY
                                  </span>
                                )}
                                {diff === 1 && (
                                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30">
                                    MAÑANA
                                  </span>
                                )}
                                {diff > 1 && diff <= 15 && (
                                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                    En {diff} dí­as
                                  </span>
                                )}
                                {diff > 15 && (
                                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                                    En {diff} dí­as
                                  </span>
                                )}
                                {diff < 0 && (
                                  <span className="px-1.5 py-0.5 rounded text-[9px] text-stone-500">
                                    Pasada ({Math.abs(diff)}d)
                                  </span>
                                )}
                              </div>
                              <span className="text-[11px] text-stone-400 block mt-0.5">
                                {res.time} hrs · <span className="uppercase text-[10px] text-stone-500 font-bold">{res.shift}</span>
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <span className="font-bold text-amber-300 block">Mesa #{res.tableNumber}</span>
                              {res.status === 'en_mesa' && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-mono text-sky-300 bg-sky-950/60 px-1.5 py-0.5 rounded border border-sky-500/30 mt-0.5">
                                  <Clock className="w-2.5 h-2.5 text-sky-400" /> 42 min en mesa
                                </span>
                              )}
                              {res.selectedDishes && res.selectedDishes.length > 0 ? (
                                <span className="inline-block mt-0.5 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/20">
                                  {res.selectedDishes.reduce((a, b) => a + b.quantity, 0)} platos pre-orden
                                </span>
                              ) : (
                                res.status !== 'en_mesa' && <span className="text-[10px] text-stone-500 block">Ordena en sala</span>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              <span className="font-mono font-bold text-emerald-400 block">
                                S/. {res.payment?.totalPaid ? res.payment.totalPaid.toFixed(2) : (res.guests * 30).toFixed(2)}
                              </span>
                              <span className="text-[10px] text-stone-400 font-mono">
                                {(res.payment?.cardBrand || 'VISA').toUpperCase()} •••• {res.payment?.cardLast4 || '4242'}
                              </span>
                            </td>
                            <td className="px-4 py-3 font-mono text-stone-300">{res.guests} p.</td>
                            <td className="px-4 py-3">
                              <span
                                className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                                  res.status === 'confirmada'
                                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                    : res.status === 'en_mesa'
                                    ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20'
                                    : res.status === 'completada'
                                    ? 'bg-stone-800 text-stone-400'
                                    : 'bg-rose-500/10 text-rose-400'
                                }`}
                              >
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
                        );
                      })}
                      {filteredReservations.length === 0 && (
                        <tr>
                          <td colSpan={8} className="text-center py-10 text-stone-500">
                            No se encontraron reservas para el plazo seleccionado ({dateFilter !== 'todas' ? dateFilter : 'todas las fechas'}) y estado ({statusFilter}).
                          </td>
                        </tr>
                      )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================
                {/* ========================================================
                    VISTA: GESTIONAR MENÚ Y CARTA DE PLATOS
                   ======================================================== */}
                {currentSection === 'platos' && (
                  <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-stone-800 gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h1 className="text-2xl font-bold font-serif-display text-stone-100">
                            Gestión de Menú y Carta de Platos
                          </h1>
                        </div>
                        <p className="text-xs text-stone-400">
                          Catálogo gastronómico del restaurante, control de precios, categorías y disponibilidad en sala.
                        </p>
                      </div>
                      <button
                        onClick={handleOpenNewDish}
                        className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 text-xs font-bold flex items-center gap-2 shadow-lg transition-all cursor-pointer"
                      >
                        <Plus className="w-4 h-4" /> Nuevo Plato
                      </button>
                    </div>

                {/* Filtros por Categorí­a */}
                <div className="flex flex-wrap items-center justify-between gap-3 bg-stone-950 p-3 rounded-2xl border border-stone-800 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-stone-400 font-medium">Filtrar Categorí­a:</span>
                    {(['todas', 'principales', 'entradas', 'bebidas', 'postres'] as const).map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setDishCategoryFilter(cat)}
                        className={`px-3 py-1.5 rounded-xl capitalize font-medium transition-colors cursor-pointer ${
                          dishCategoryFilter === cat
                            ? 'bg-amber-400 text-stone-950 font-bold shadow-xs'
                            : 'bg-stone-900 text-stone-300 hover:text-white border border-stone-800'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>

                  <span className="text-stone-400 text-[11px]">
                    Total: <strong className="text-amber-400">{filteredDishes.length}</strong> plato(s)
                  </span>
                </div>

                {/* Catálogo y Gestión de Platos */}
                <div className="bg-stone-950 border border-stone-800 rounded-2xl overflow-hidden shadow-xl">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-stone-900 text-stone-400 uppercase font-semibold border-b border-stone-800">
                        <tr>
                          <th className="px-4 py-3">Plato / Imagen</th>
                          <th className="px-4 py-3">Categorí­a</th>
                          <th className="px-4 py-3">Precio</th>
                          <th className="px-4 py-3">Estado</th>
                          <th className="px-4 py-3">Descripción</th>
                          <th className="px-4 py-3 text-right">Acciones</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-800/60">
                        {filteredDishes.map((dish) => (
                          <tr key={dish.id} className="hover:bg-stone-900/50 transition-colors">
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-3">
                                <img
                                  src={dish.image}
                                  alt={dish.name}
                                  className="w-12 h-12 rounded-xl object-cover border border-stone-700 shrink-0"
                                />
                                <div>
                                  <span className="font-bold text-stone-100 block text-sm">{dish.name}</span>
                                  {dish.badge && (
                                    <span className="inline-block mt-0.5 px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/20 text-amber-300">
                                      {dish.badge}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-stone-800 text-stone-300">
                                {dish.category}
                              </span>
                            </td>
                            <td className="px-4 py-3 font-mono font-bold text-amber-400 text-sm">
                              S/. {dish.price.toFixed(2)}
                            </td>
                            <td className="px-4 py-3">
                              <button
                                onClick={() => handleToggleDishStatus(dish.id)}
                                className={`px-2.5 py-1 rounded-full text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors ${
                                  dish.status === 'inactivo'
                                    ? 'bg-stone-800 text-stone-400 border border-stone-700 hover:border-emerald-500/40 hover:text-emerald-300'
                                    : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20'
                                }`}
                                title="Haga clic para alternar estado Activo / Inactivo"
                              >
                                {dish.status === 'inactivo' ? (
                                  <>
                                    <X className="w-3 h-3 text-rose-400" /> Inactivo
                                  </>
                                ) : (
                                  <>
                                    <Check className="w-3 h-3 text-emerald-400" /> Activo
                                  </>
                                )}
                              </button>
                            </td>
                            <td className="px-4 py-3 max-w-xs text-stone-400 text-[11px] line-clamp-2">
                              {dish.description}
                            </td>
                            <td className="px-4 py-3 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => handleOpenEditDish(dish)}
                                  className="p-1.5 rounded-lg bg-stone-800 hover:bg-amber-400 hover:text-stone-950 text-stone-300 transition-colors cursor-pointer"
                                  title="Editar plato"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteDish(dish.id)}
                                  className="p-1.5 rounded-lg bg-stone-800 hover:bg-rose-500/20 hover:text-rose-300 text-stone-400 transition-colors cursor-pointer"
                                  title="Eliminar plato"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* MODAL PARA CREAR O EDITAR PLATO */}
                {dishModalOpen && (
                  <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-stone-950 border border-stone-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95">
                      <div className="flex items-center justify-between pb-3 border-b border-stone-800">
                        <div className="flex items-center gap-2">
                          <UtensilsCrossed className="w-4 h-4 text-amber-400" />
                          <h3 className="font-bold text-stone-100 text-sm">
                            {editingDish ? 'Editar Datos del Plato' : 'Registrar Nuevo Plato al Menú'}
                          </h3>
                        </div>
                        <button
                          onClick={() => setDishModalOpen(false)}
                          className="text-stone-400 hover:text-white cursor-pointer"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      <form onSubmit={handleSaveDish} className="space-y-4 text-xs">
                        <div>
                          <label className="block text-stone-300 font-semibold mb-1">Nombre del Plato *</label>
                          <input
                            type="text"
                            required
                            value={dishFormName}
                            onChange={(e) => setDishFormName(e.target.value)}
                            placeholder="Ej. Lomo Saltado en Wok al Pisco"
                            className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-stone-700 text-stone-100 focus:outline-none focus:border-amber-400"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-stone-300 font-semibold mb-1">Categorí­a *</label>
                            <select
                              value={dishFormCategory}
                              onChange={(e) => setDishFormCategory(e.target.value as any)}
                              className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-stone-700 text-stone-100 focus:outline-none focus:border-amber-400"
                            >
                              <option value="entradas">Entradas</option>
                              <option value="principales">Principales</option>
                              <option value="bebidas">Bebidas</option>
                              <option value="postres">Postres</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-stone-300 font-semibold mb-1">Precio (S/.) *</label>
                            <input
                              type="number"
                              step="0.5"
                              required
                              value={dishFormPrice}
                              onChange={(e) => setDishFormPrice(parseFloat(e.target.value) || 0)}
                              className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-stone-700 text-stone-100 font-mono focus:outline-none focus:border-amber-400"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-stone-300 font-semibold mb-1">Estado Operativo</label>
                            <select
                              value={dishFormStatus}
                              onChange={(e) => setDishFormStatus(e.target.value as any)}
                              className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-stone-700 text-stone-100 focus:outline-none focus:border-amber-400"
                            >
                              <option value="activo">Activo (Disponible en carta)</option>
                              <option value="inactivo">Inactivo (Agotado / Fuera de carta)</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-stone-300 font-semibold mb-1">URL Imagen</label>
                            <input
                              type="text"
                              value={dishFormImage}
                              onChange={(e) => setDishFormImage(e.target.value)}
                              placeholder="https://images.unsplash..."
                              className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-stone-700 text-stone-100 focus:outline-none focus:border-amber-400"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-stone-300 font-semibold mb-1">Descripción del Plato</label>
                          <textarea
                            rows={3}
                            value={dishFormDescription}
                            onChange={(e) => setDishFormDescription(e.target.value)}
                            placeholder="Detalle ingredientes, cocción y presentación..."
                            className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-stone-700 text-stone-100 focus:outline-none focus:border-amber-400 resize-none"
                          />
                        </div>

                        <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-800">
                          <button
                            type="button"
                            onClick={() => setDishModalOpen(false)}
                            className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 cursor-pointer"
                          >
                            Cancelar
                          </button>
                          <button
                            type="submit"
                            className="px-5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold cursor-pointer"
                          >
                            {editingDish ? 'Guardar Cambios' : 'Registrar Plato'}
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ========================================================
                VISTA: GESTIONAR MESAS Y SALA
               ======================================================== */}
            {currentSection === 'mesas' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-stone-800 gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h1 className="text-2xl font-bold font-serif-display text-stone-100">
                        Distribución de Mesas y Control de Sala
                      </h1>
                    </div>
                    <p className="text-xs text-stone-400">
                      Monitoreo de ocupación en tiempo real por zona, rotación de comensales y disponibilidad de turnos.
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      const freeTable = tables.find((t) => !reservations.some((r) => r.tableId === t.id && r.status === 'en_mesa'));
                      setWalkInModalTable(freeTable || tables[0]);
                      setWalkInName('Comensal en Puerta (Walk-in)');
                      setWalkInGuests(2);
                    }}
                    className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold text-xs flex items-center gap-2 shadow-lg transition-all cursor-pointer shrink-0"
                  >
                    <Plus className="w-4 h-4" /> Asignar Walk-In (Sin Reserva)
                  </button>
                </div>

                {/* Selector de Fecha, Atajos y Turno */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-4 rounded-2xl bg-stone-950 border border-stone-800 text-xs">
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-amber-400 shrink-0" />
                      <span className="font-semibold text-stone-200">Fecha:</span>
                      <input
                        type="date"
                        value={inspectedDate}
                        onChange={(e) => setInspectedDate(e.target.value)}
                        className="px-3 py-1.5 rounded-xl bg-stone-900 border border-stone-700 text-stone-100 font-mono text-xs focus:outline-none focus:border-amber-400"
                      />
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setInspectedDate(new Date().toISOString().split('T')[0])}
                        className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer border ${
                          inspectedDate === new Date().toISOString().split('T')[0]
                            ? 'bg-amber-400 text-stone-950 font-bold border-amber-400'
                            : 'bg-stone-900 text-stone-400 hover:text-stone-200 border-stone-800'
                        }`}
                      >
                        Hoy
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setInspectedDate('2026-10-31');
                          setInspectedShift('cena');
                        }}
                        className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer border ${
                          inspectedDate === '2026-10-31'
                            ? 'bg-amber-400 text-stone-950 font-bold border-amber-400'
                            : 'bg-stone-900 text-amber-300 hover:text-white border-amber-500/30'
                        }`}
                      >
                        ★ Ver Día con Reservas (31 Oct)
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-stone-400 font-medium">Turno:</span>
                    <button
                      onClick={() => setInspectedShift('almuerzo')}
                      className={`px-3 py-1.5 rounded-xl font-semibold transition-colors cursor-pointer ${
                        inspectedShift === 'almuerzo'
                          ? 'bg-amber-400 text-stone-950 font-bold shadow-xs'
                          : 'bg-stone-900 text-stone-400 hover:text-white border border-stone-800'
                      }`}
                    >
                      Almuerzo (12:30 - 15:30)
                    </button>
                    <button
                      onClick={() => setInspectedShift('cena')}
                      className={`px-3 py-1.5 rounded-xl font-semibold transition-colors cursor-pointer ${
                        inspectedShift === 'cena'
                          ? 'bg-amber-400 text-stone-950 font-bold shadow-xs'
                          : 'bg-stone-900 text-stone-400 hover:text-white border border-stone-800'
                      }`}
                    >
                      Cena (19:00 - 23:00)
                    </button>
                  </div>
                </div>

                {/* Catálogo de Mesas Interactivo para esa fecha y turno */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {tables.map((tbl) => {
                    const activeRes = reservations.find(
                      (r) =>
                        r.tableId === tbl.id &&
                        r.date === inspectedDate &&
                        r.shift === inspectedShift &&
                        r.status !== 'cancelada'
                    );

                    const manualStatus = tableCleanStatus[tbl.id];
                    const statusDisplay: 'ocupada' | 'reservada' | 'limpieza' | 'disponible' = activeRes
                      ? activeRes.status === 'en_mesa'
                        ? 'ocupada'
                        : 'reservada'
                      : manualStatus === 'limpieza'
                      ? 'limpieza'
                      : 'disponible';

                    return (
                      <div
                        key={tbl.id}
                        onClick={() => setSelectedTableModal(tbl)}
                        className={`p-4 rounded-xl border space-y-2.5 text-xs transition-all shadow-md cursor-pointer hover:border-amber-400/60 hover:shadow-lg ${
                          statusDisplay === 'reservada'
                            ? 'bg-amber-950/20 border-amber-500/40'
                            : statusDisplay === 'ocupada'
                            ? 'bg-sky-950/20 border-sky-500/40'
                            : statusDisplay === 'limpieza'
                            ? 'bg-purple-950/20 border-purple-500/40'
                            : 'bg-stone-950 border-stone-800'
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-stone-100 text-sm font-serif-display">
                              Mesa #{tbl.number}
                            </span>
                            <span className="text-[10px] text-stone-500 font-mono">({tbl.capacity}p)</span>
                          </div>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                              statusDisplay === 'disponible'
                                ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20'
                                : statusDisplay === 'reservada'
                                ? 'text-amber-400 bg-amber-500/10 border border-amber-500/30'
                                : statusDisplay === 'ocupada'
                                ? 'text-sky-400 bg-sky-500/10 border border-sky-500/30'
                                : 'text-purple-400 bg-purple-500/10 border border-purple-500/30'
                            }`}
                          >
                            {statusDisplay === 'limpieza' ? 'En Limpieza' : statusDisplay}
                          </span>
                        </div>

                        <p className="text-stone-300">
                          <strong>Zona:</strong> {tbl.zoneName} · <strong>Forma:</strong> {tbl.shape}
                        </p>

                        {activeRes ? (
                          <div className="pt-2 border-t border-stone-800/80 space-y-2" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-between text-[11px]">
                              <p className="text-amber-300 font-semibold truncate">
                                👤 {activeRes.customerName}
                              </p>
                              <span className="text-stone-400 font-mono text-[10px]">{activeRes.time} hrs</span>
                            </div>
                            <p className="text-stone-400 text-[10px]">
                              Código: <strong className="font-mono text-stone-200">{activeRes.code}</strong> . {activeRes.guests} personas
                            </p>

                            <div className="flex items-center gap-1.5 pt-1">
                              {activeRes.status === 'confirmada' && (
                                <button
                                  onClick={() => {
                                    onUpdateStatus(activeRes.id, 'en_mesa');
                                    showActionFeedback(`¡Cliente sentado en Mesa #${tbl.number}!`);
                                  }}
                                  className="flex-1 py-1 px-2 rounded-lg bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/30 font-semibold text-[11px] transition-colors cursor-pointer text-center"
                                >
                                  Sentar Comensal
                                </button>
                              )}
                              {activeRes.status === 'en_mesa' && (
                                <button
                                  onClick={() => {
                                    onUpdateStatus(activeRes.id, 'completada');
                                    setTableCleanStatus((prev) => ({ ...prev, [tbl.id]: 'limpieza' }));
                                    showActionFeedback(`Mesa #${tbl.number} liberada y puesta en limpieza.`);
                                  }}
                                  className="flex-1 py-1 px-2 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 font-semibold text-[11px] transition-colors cursor-pointer text-center"
                                >
                                  Liberar y Limpiar
                                </button>
                              )}
                              <button
                                onClick={() => {
                                  onCancelReservation(activeRes.id);
                                  showActionFeedback(`Reserva ${activeRes.code} cancelada y mesa liberada.`);
                                }}
                                className="py-1 px-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 font-semibold text-[11px] transition-colors cursor-pointer"
                                title="Cancelar reserva"
                              >
                                Cancelar
                              </button>
                            </div>
                          </div>
                        ) : statusDisplay === 'limpieza' ? (
                          <div className="pt-2 border-t border-purple-500/20 space-y-2" onClick={(e) => e.stopPropagation()}>
                            <p className="text-purple-300 text-[11px] flex items-center gap-1">
                              🧹 Mesa en proceso de higienización por meseros
                            </p>
                            <button
                              onClick={() => {
                                setTableCleanStatus((prev) => ({ ...prev, [tbl.id]: 'disponible' }));
                                showActionFeedback(`Mesa #${tbl.number} marcada como limpia y disponible.`);
                              }}
                              className="w-full py-1 px-2 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-purple-200 border border-purple-500/30 font-semibold text-[11px] cursor-pointer"
                            >
                              ✓ Marcar Lista y Disponible
                            </button>
                          </div>
                        ) : (
                          <div className="pt-2 border-t border-stone-800/60 space-y-2" onClick={(e) => e.stopPropagation()}>
                            <p className="text-emerald-400/80 text-[11px] flex items-center gap-1">
                              ✓ Mesa libre para reservar o walk-in
                            </p>
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => {
                                  setWalkInModalTable(tbl);
                                  setWalkInName('Cliente en Puerta');
                                  setWalkInGuests(Math.min(2, tbl.capacity));
                                }}
                                className="flex-1 py-1 px-2 rounded-lg bg-amber-400/10 hover:bg-amber-400/20 text-amber-300 border border-amber-400/30 font-semibold text-[10px] cursor-pointer"
                              >
                                + Walk-in
                              </button>
                              <button
                                onClick={() => {
                                  setTableCleanStatus((prev) => ({ ...prev, [tbl.id]: 'limpieza' }));
                                  showActionFeedback(`Mesa #${tbl.number} marcada en limpieza preventiva.`);
                                }}
                                className="py-1 px-2 rounded-lg bg-stone-900 hover:bg-stone-800 text-stone-400 border border-stone-800 text-[10px] cursor-pointer"
                                title="Poner en limpieza"
                              >
                                🧹 Limpieza
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* MODAL DETALLE DE MESA AL HACER CLIC */}
                {selectedTableModal && (
                  <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
                    <div className="bg-stone-950 border border-stone-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl animate-in fade-in duration-200 text-xs">
                      <div className="flex items-center justify-between pb-3 border-b border-stone-800">
                        <div>
                          <h3 className="text-lg font-bold text-stone-100 font-serif-display">
                            Gestión Integral de Mesa #{selectedTableModal.number}
                          </h3>
                          <span className="text-stone-400 text-[11px]">
                            {selectedTableModal.zoneName} · Capacidad máxima: {selectedTableModal.capacity} comensales
                          </span>
                        </div>
                        <button
                          onClick={() => setSelectedTableModal(null)}
                          className="p-1.5 rounded-lg text-stone-400 hover:text-white bg-stone-900 cursor-pointer"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="p-3 rounded-xl bg-stone-900/60 border border-stone-800 space-y-2">
                        <span className="text-stone-400 font-bold block text-[11px]">Características de la Mesa:</span>
                        <p className="text-stone-300 text-[11px]">{selectedTableModal.description}</p>
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {selectedTableModal.features.map((feat, idx) => (
                            <span key={idx} className="px-2 py-0.5 rounded text-[10px] bg-stone-800 text-amber-300">
                              âœ“ {feat}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2">
                        <span className="text-stone-400">Acción Rápida Operativa:</span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setWalkInModalTable(selectedTableModal);
                              setSelectedTableModal(null);
                              setWalkInName('Cliente Walk-in');
                              setWalkInGuests(Math.min(2, selectedTableModal.capacity));
                            }}
                            className="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold cursor-pointer"
                          >
                            + Asignar Walk-in
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setTableCleanStatus((prev) => ({
                                ...prev,
                                [selectedTableModal.id]: prev[selectedTableModal.id] === 'limpieza' ? 'disponible' : 'limpieza',
                              }));
                              setSelectedTableModal(null);
                              showActionFeedback(`Estado de Mesa #${selectedTableModal.number} actualizado.`);
                            }}
                            className="px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 cursor-pointer"
                          >
                            Alternar Limpieza
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* MODAL ASIGNAR WALK-IN (CLIENTE SIN RESERVA EN PUERTA) */}
                {walkInModalTable && (
                  <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
                    <div className="bg-stone-950 border border-amber-500/30 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95 duration-200 text-xs">
                      <div className="flex items-center justify-between pb-3 border-b border-stone-800">
                        <div>
                          <h3 className="text-lg font-bold text-amber-400 font-serif-display">
                            Asignar Mesa a Cliente Walk-In
                          </h3>
                          <span className="text-stone-400 text-[11px]">
                            Atención directa en puerta sin reserva previa · Mesa #{walkInModalTable.number}
                          </span>
                        </div>
                        <button
                          onClick={() => setWalkInModalTable(null)}
                          className="p-1.5 rounded-lg text-stone-400 hover:text-white bg-stone-900 cursor-pointer"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <label className="block text-stone-300 font-semibold mb-1">Nombre del Comensal o Referencia *</label>
                          <input
                            type="text"
                            value={walkInName}
                            onChange={(e) => setWalkInName(e.target.value)}
                            placeholder="Ej. Familia Gómez / Ejecutivo Banco"
                            className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-stone-700 text-stone-100 text-xs focus:outline-none focus:border-amber-400"
                          />
                        </div>

                        <div>
                          <label className="block text-stone-300 font-semibold mb-1">
                            Número de Personas (Máx. {walkInModalTable.capacity}p) *
                          </label>
                          <input
                            type="number"
                            min={1}
                            max={walkInModalTable.capacity}
                            value={walkInGuests}
                            onChange={(e) => setWalkInGuests(parseInt(e.target.value) || 1)}
                            className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-stone-700 text-stone-100 text-xs focus:outline-none focus:border-amber-400"
                          />
                        </div>

                        <div className="p-3 rounded-xl bg-stone-900 border border-stone-800 text-[11px] text-stone-300 space-y-1">
                          <p><strong>Ubicación:</strong> {walkInModalTable.zoneName}</p>
                          <p><strong>Turno actual:</strong> {inspectedShift.toUpperCase()} ({inspectedDate})</p>
                          <p className="text-emerald-400">✓ Se sentará inmediatamente en sala registrando el tiempo de estancia.</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-800">
                        <button
                          type="button"
                          onClick={() => setWalkInModalTable(null)}
                          className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 cursor-pointer"
                        >
                          Cancelar
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (onCreateReservation) {
                              onCreateReservation({
                                customerName: walkInName || 'Cliente Walk-in',
                                email: 'walkin@restaurant.pe',
                                phone: '+51 900 000 000',
                                notes: 'Cliente Walk-in sentado directamente en puerta por el maitre.',
                                date: inspectedDate,
                                time: new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }),
                                shift: inspectedShift,
                                guests: walkInGuests,
                                tableId: walkInModalTable.id,
                              });
                            }
                            setWalkInModalTable(null);
                            showActionFeedback(`Â¡Cliente ${walkInName} asignado exitosamente a Mesa #${walkInModalTable.number}!`);
                          }}
                          className="px-5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold cursor-pointer shadow-lg"
                        >
                          Sentar a la Mesa Ahora
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ========================================================
                VISTA: CLIENTES Y PERSONAL
               ======================================================== */}
            {currentSection === 'personal_clientes' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-stone-800 gap-3">
                  <div>
                    <h1 className="text-2xl font-bold font-serif-display text-stone-100">
                      Gestión de Clientes y Personal de Sala
                    </h1>
                    <p className="text-xs text-stone-400">
                      Directorio de comensales registrados, historial de reservas y asignación de turnos del equipo.
                    </p>
                  </div>

                  <div className="flex items-center bg-stone-950 p-1 rounded-xl border border-stone-800 text-xs">
                    <button
                      onClick={() => setActiveTabPC('clientes')}
                      className={`px-4 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                        activeTabPC === 'clientes'
                          ? 'bg-amber-400 text-stone-950 shadow-xs'
                          : 'text-stone-400 hover:text-white'
                      }`}
                    >
                      Directorio de Clientes ({clientList.length})
                    </button>
                    <button
                      onClick={() => setActiveTabPC('personal')}
                      className={`px-4 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                        activeTabPC === 'personal'
                          ? 'bg-amber-400 text-stone-950 shadow-xs'
                          : 'text-stone-400 hover:text-white'
                      }`}
                    >
                      Personal de Sala y Cocina ({staffList.length})
                    </button>
                  </div>
                </div>

                {/* TAB 1: CLIENTES */}
                {activeTabPC === 'clientes' && (
                  <div className="bg-stone-950 border border-stone-800 rounded-2xl overflow-hidden shadow-xl">
                    <div className="p-4 border-b border-stone-800 text-xs">
                      <span className="font-bold text-stone-200 block text-sm">Cartera de Comensales y Frecuencia</span>
                      <span className="text-stone-400 text-[11px]">Historial de reservas, preferencia de platos y consumo acumulado</span>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-stone-900 text-stone-400 uppercase font-semibold border-b border-stone-800">
                          <tr>
                            <th className="px-4 py-3">Cliente</th>
                            <th className="px-4 py-3">Contacto</th>
                            <th className="px-4 py-3">Nivel / Categorí­a</th>
                            <th className="px-4 py-3">Total Reservas</th>
                            <th className="px-4 py-3">Gasto Acumulado</th>
                            <th className="px-4 py-3">Plato Favorito</th>
                            <th className="px-4 py-3">Última Visita</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-800/60">
                          {clientList.map((client) => (
                            <tr key={client.id} className="hover:bg-stone-900/50">
                              <td className="px-4 py-3">
                                <span className="font-bold text-stone-100 block">{client.name}</span>
                                <span className="text-[10px] text-stone-500 font-mono">ID: {client.id}</span>
                              </td>
                              <td className="px-4 py-3 text-stone-300">
                                <div>{client.phone}</div>
                                <div className="text-[10px] text-stone-500">{client.email}</div>
                              </td>
                              <td className="px-4 py-3">
                                <span
                                  className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                    client.tier === 'VIP Platino'
                                      ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                                      : client.tier === 'Frecuente'
                                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                      : 'bg-stone-800 text-stone-400'
                                  }`}
                                >
                                  {client.tier}
                                </span>
                              </td>
                              <td className="px-4 py-3 font-mono font-bold text-stone-200">{client.totalReservations} visitas</td>
                              <td className="px-4 py-3 font-mono font-bold text-emerald-400">
                                S/. {client.totalSpent.toFixed(2)}
                              </td>
                              <td className="px-4 py-3 text-amber-300 text-[11px] font-medium">
                                {client.favoriteDish}
                              </td>
                              <td className="px-4 py-3 font-mono text-stone-400">{client.lastVisit}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* TAB 2: PERSONAL */}
                {activeTabPC === 'personal' && (
                  <div className="bg-stone-950 border border-stone-800 rounded-2xl overflow-hidden shadow-xl">
                    <div className="p-4 border-b border-stone-800 text-xs">
                      <span className="font-bold text-stone-200 block text-sm">Equipo de Operaciones de Sala y Cocina</span>
                      <span className="text-stone-400 text-[11px]">Asignación de turnos, puestos operativos y teléfonos de contacto</span>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-stone-900 text-stone-400 uppercase font-semibold border-b border-stone-800">
                          <tr>
                            <th className="px-4 py-3">Colaborador</th>
                            <th className="px-4 py-3">Puesto / Cargo</th>
                            <th className="px-4 py-3">Turno Asignado</th>
                            <th className="px-4 py-3">Teléfono</th>
                            <th className="px-4 py-3">Ingreso</th>
                            <th className="px-4 py-3 text-center">Estado</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-800/60">
                          {staffList.map((st) => (
                            <tr key={st.id} className="hover:bg-stone-900/50">
                              <td className="px-4 py-3 font-bold text-stone-200">{st.name}</td>
                              <td className="px-4 py-3">
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-stone-800 text-amber-400">
                                  {st.role}
                                </span>
                              </td>
                              <td className="px-4 py-3 capitalize text-stone-300 font-medium">{st.shift}</td>
                              <td className="px-4 py-3 font-mono text-stone-400">{st.phone}</td>
                              <td className="px-4 py-3 font-mono text-stone-500">{st.hireDate}</td>
                              <td className="px-4 py-3 text-center">
                                <span
                                  className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                    st.status === 'en_turno'
                                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                      : 'bg-stone-800 text-stone-400'
                                  }`}
                                >
                                  {st.status === 'en_turno' ? 'En Turno' : 'Descanso'}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ========================================================
                VISTA 6: GESTIONAR HORARIOS & TURNOS
               ======================================================== */}
            {currentSection === 'horarios' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-stone-800 gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h1 className="text-2xl font-bold font-serif-display text-stone-100">
                        Gestión de Horarios y Turnos de Servicio
                      </h1>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase">
                        Control de Aforo Activo
                      </span>
                    </div>
                    <p className="text-xs text-stone-400">
                      Haga clic en cualquier franja para ver reservas, pausarla/bloquearla por alta demanda o habilitar turnos.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-xs bg-stone-950 border border-stone-800 px-3 py-1.5 rounded-xl">
                    <Calendar className="w-3.5 h-3.5 text-amber-400" />
                    <span className="text-stone-400">Fecha:</span>
                    <strong className="text-amber-300 font-mono">{inspectedDate}</strong>
                  </div>
                </div>

                {ruleUpdatedToast && (
                  <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-200 text-xs flex items-center justify-between animate-in slide-in-from-top-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>{ruleUpdatedToast}</span>
                    </div>
                    <button onClick={() => setRuleUpdatedToast(null)} className="text-emerald-400 hover:text-white cursor-pointer">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-xs">
                  {/* Turno 1: Almuerzo */}
                  <div className="p-5 rounded-2xl bg-stone-950 border border-stone-800 space-y-4 shadow-md">
                    <div className="flex items-center justify-between">
                      <span className="text-amber-400 font-bold text-sm">Turno 1: Almuerzo Ejecutivo & Familiar</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        Turno Activo
                      </span>
                    </div>

                    <div className="space-y-1">
                      <p className="text-stone-300">
                        Horario de Servicio: <strong className="text-stone-100">12:30 a 15:30 hrs</strong>
                      </p>
                      <p className="text-stone-400 text-[11px]">Capacidad máxima autorizada: 52 comensales (13 mesas).</p>
                    </div>

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

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] text-stone-400 font-semibold block">
                          Franjas Horarias Disponibles (Intervalos de {intervalMinutes} min):
                        </span>
                        <span className="text-[10px] text-amber-400">Click para gestionar</span>
                      </div>

                      <div className="grid grid-cols-3 gap-2 text-center">
                        {['12:30', '13:00', '13:30', '14:00', '14:30', '15:00'].map((time) => {
                          const count = almuerzoRes.filter((r) => r.time === time).length;
                          const isBlocked = blockedSlots.includes(time);
                          return (
                            <button
                              key={time}
                              type="button"
                              onClick={() => setSelectedSlotModal({ time, shift: 'almuerzo' })}
                              className={`p-2.5 rounded-xl border text-xs text-left transition-all cursor-pointer hover:scale-[1.02] shadow-sm ${
                                isBlocked
                                  ? 'bg-rose-950/20 border-rose-500/50 text-rose-300 ring-1 ring-rose-500/30'
                                  : count > 0
                                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-300 font-bold hover:border-amber-400'
                                  : 'bg-stone-900 border-stone-800 text-stone-400 hover:border-stone-700 hover:text-stone-200'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-mono font-bold text-xs">{time} hrs</span>
                                {isBlocked && <Lock className="w-3 h-3 text-rose-400" />}
                              </div>
                              <span className="block text-[10px] font-normal opacity-90 mt-1">
                                {isBlocked ? 'Pausada' : count > 0 ? `${count} res.` : 'Libre'}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Turno 2: Cena */}
                  <div className="p-5 rounded-2xl bg-stone-950 border border-stone-800 space-y-4 shadow-md">
                    <div className="flex items-center justify-between">
                      <span className="text-amber-400 font-bold text-sm">Turno 2: Cena Gourmet de Autor</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        Alta Demanda
                      </span>
                    </div>

                    <div className="space-y-1">
                      <p className="text-stone-300">
                        Horario de Servicio: <strong className="text-stone-100">19:00 a 23:00 hrs</strong>
                      </p>
                      <p className="text-stone-400 text-[11px]">Hora pico estimada: 20:00 a 21:30 hrs. Aforo máximo: 52 comensales.</p>
                    </div>

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

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] text-stone-400 font-semibold block">
                          Franjas Horarias Disponibles (Intervalos de {intervalMinutes} min):
                        </span>
                        <span className="text-[10px] text-amber-400">Click para pausar/activar</span>
                      </div>

                      <div className="grid grid-cols-4 sm:grid-cols-4 gap-2 text-center">
                        {['19:00', '19:30', '20:00', '20:30', '21:00', '21:30', '22:00'].map((time) => {
                          const count = cenaRes.filter((r) => r.time === time).length;
                          const isPeak = time === '20:00' || time === '20:30' || time === '21:00';
                          const isBlocked = blockedSlots.includes(time);
                          return (
                            <button
                              key={time}
                              type="button"
                              onClick={() => setSelectedSlotModal({ time, shift: 'cena' })}
                              className={`p-2.5 rounded-xl border text-xs text-left transition-all cursor-pointer hover:scale-[1.02] shadow-sm ${
                                isBlocked
                                  ? 'bg-rose-950/20 border-rose-500/50 text-rose-300 ring-1 ring-rose-500/30'
                                  : count > 0
                                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-300 font-bold hover:border-amber-400'
                                  : isPeak
                                  ? 'bg-stone-900/90 border-amber-500/30 text-amber-200'
                                  : 'bg-stone-900 border-stone-800 text-stone-400 hover:border-stone-700 hover:text-stone-200'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-mono font-bold text-xs">{time}</span>
                                {isBlocked ? (
                                  <Lock className="w-3 h-3 text-rose-400" />
                                ) : isPeak ? (
                                  <span className="text-[9px] text-amber-400 font-bold">Pico</span>
                                ) : null}
                              </div>
                              <span className="block text-[10px] font-normal opacity-90 mt-1">
                                {isBlocked ? 'Pausada' : count > 0 ? `${count} res.` : 'Libre'}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                {/* MODAL DE GESTIÓN Y DESCONGESTIÓN DE FRANJA HORARIA */}
                {selectedSlotModal && (
                  <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
                    <div className="bg-stone-950 border border-stone-800 rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl animate-in zoom-in-95 duration-200 text-xs">
                      <div className="flex items-center justify-between pb-3 border-b border-stone-800">
                        <div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-amber-400" />
                            <h3 className="text-lg font-bold text-stone-100 font-serif-display">
                              Gestión de Franja: {selectedSlotModal.time} hrs
                            </h3>
                          </div>
                          <span className="text-stone-400 text-[11px] block mt-0.5">
                            Turno: {selectedSlotModal.shift === 'almuerzo' ? 'Almuerzo Ejecutivo' : 'Cena Gourmet'} Â· Fecha: {inspectedDate}
                          </span>
                        </div>
                        <button
                          onClick={() => setSelectedSlotModal(null)}
                          className="p-1.5 rounded-lg text-stone-400 hover:text-white bg-stone-900 cursor-pointer"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Estado de saturación de la franja */}
                      <div className="p-4 rounded-xl bg-stone-900/60 border border-stone-800 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-stone-300 font-semibold">Estado de la Franja:</span>
                          <span
                            className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                              blockedSlots.includes(selectedSlotModal.time)
                                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            }`}
                          >
                            {blockedSlots.includes(selectedSlotModal.time) ? 'Pausada / Bloqueada' : 'Habilitada (Recibiendo Reservas)'}
                          </span>
                        </div>
                        <p className="text-stone-400 text-[11px] leading-relaxed">
                          {blockedSlots.includes(selectedSlotModal.time)
                            ? 'Esta franja está temporalmente bloqueada en la web pública para descongestionar el restaurante y evitar saturación en la cocina.'
                            : 'La franja está activa en el sistema de reservas públicas. Si detecta sobrecarga en cocina, puede pausarla con el botón inferior.'}
                        </p>
                      </div>

                      {/* Reservas en esta franja */}
                      <div>
                        <span className="text-stone-300 font-bold block mb-2">
                          Reservas confirmadas para las {selectedSlotModal.time} hrs:
                        </span>
                        {reservations.filter((r) => r.date === inspectedDate && r.time === selectedSlotModal.time && r.status !== 'cancelada').length > 0 ? (
                          <div className="space-y-2 max-h-40 overflow-y-auto">
                            {reservations
                              .filter((r) => r.date === inspectedDate && r.time === selectedSlotModal.time && r.status !== 'cancelada')
                              .map((r) => (
                                <div key={r.id} className="p-2.5 rounded-lg bg-stone-900 border border-stone-800 flex items-center justify-between">
                                  <div>
                                    <span className="font-bold text-stone-200 block">{r.customerName}</span>
                                    <span className="text-[10px] text-stone-400">Mesa #{r.tableNumber} Â· {r.guests} personas</span>
                                  </div>
                                  <span className="font-mono text-amber-300 font-bold">{r.code}</span>
                                </div>
                              ))}
                          </div>
                        ) : (
                          <p className="text-stone-500 text-[11px] p-3 rounded-lg bg-stone-900/40 text-center">
                            No hay reservas registradas en esta franja horaria.
                          </p>
                        )}
                      </div>

                      {/* Botón de Acción de Descongestión */}
                      <div className="flex items-center justify-between pt-3 border-t border-stone-800">
                        <button
                          type="button"
                          onClick={() => setSelectedSlotModal(null)}
                          className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 cursor-pointer"
                        >
                          Cerrar
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (blockedSlots.includes(selectedSlotModal.time)) {
                              setBlockedSlots((prev) => prev.filter((t) => t !== selectedSlotModal.time));
                              setRuleUpdatedToast(`Franja ${selectedSlotModal.time} hrs desbloqueada y disponible para reservas.`);
                            } else {
                              setBlockedSlots((prev) => [...prev, selectedSlotModal.time]);
                              setRuleUpdatedToast(`Franja ${selectedSlotModal.time} hrs pausada para descongestión operativa.`);
                            }
                            setSelectedSlotModal(null);
                          }}
                          className={`px-4 py-2 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-2 ${
                            blockedSlots.includes(selectedSlotModal.time)
                              ? 'bg-emerald-500 hover:bg-emerald-400 text-stone-950'
                              : 'bg-rose-500 hover:bg-rose-400 text-white'
                          }`}
                        >
                          {blockedSlots.includes(selectedSlotModal.time) ? (
                            <>
                              <Unlock className="w-4 h-4" /> Desbloquear Franja
                            </>
                          ) : (
                            <>
                              <Lock className="w-4 h-4" /> Pausar Franja (Evitar Saturación)
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* 4 Reglas de Negocio Operativas Interactivas */}
                <div className="p-5 rounded-2xl bg-stone-950 border border-stone-800 space-y-3">
                  <div className="flex items-center justify-between border-b border-stone-800 pb-2">
                    <div className="flex items-center gap-2">
                      <Sliders className="w-4 h-4 text-amber-400" />
                      <span className="font-bold text-stone-200 text-xs">Polí­ticas de Rotación y Tolerancia Operativa</span>
                    </div>
                    <span className="text-[10px] text-stone-400">Click en cualquier parámetro para ajustar en vivo</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
                    {/* 1. Rotación */}
                    <div className="p-3 rounded-xl bg-stone-900 border border-stone-800 text-center space-y-1.5">
                      <span className="text-stone-500 uppercase font-bold text-[10px] block">Rotación por Mesa</span>
                      <div className="flex items-center justify-center gap-1">
                        {[60, 90, 120].map((mins) => (
                          <button
                            key={mins}
                            type="button"
                            onClick={() => {
                              setRotationMinutes(mins);
                              setRuleUpdatedToast(`Rotación estimada configurada a ${mins} minutos.`);
                            }}
                            className={`px-2 py-1 rounded text-[11px] font-bold transition-all cursor-pointer ${
                              rotationMinutes === mins
                                ? 'bg-amber-400 text-stone-950'
                                : 'bg-stone-800 text-stone-400 hover:text-white'
                            }`}
                          >
                            {mins}m
                          </button>
                        ))}
                      </div>
                      <span className="text-[10px] text-stone-400 block mt-1">Tiempo de servicio por comensal</span>
                    </div>

                    {/* 2. Tolerancia */}
                    <div className="p-3 rounded-xl bg-stone-900 border border-stone-800 text-center space-y-1.5">
                      <span className="text-stone-500 uppercase font-bold text-[10px] block">Tolerancia Máxima</span>
                      <div className="flex items-center justify-center gap-1">
                        {[10, 15, 20].map((mins) => (
                          <button
                            key={mins}
                            type="button"
                            onClick={() => {
                              setToleranceMinutes(mins);
                              setRuleUpdatedToast(`Tolerancia máxima configurada a ${mins} minutos antes de liberar.`);
                            }}
                            className={`px-2 py-1 rounded text-[11px] font-bold transition-all cursor-pointer ${
                              toleranceMinutes === mins
                                ? 'bg-amber-400 text-stone-950'
                                : 'bg-stone-800 text-stone-400 hover:text-white'
                            }`}
                          >
                            {mins}m
                          </button>
                        ))}
                      </div>
                      <span className="text-[10px] text-stone-400 block mt-1">Minutos antes de cancelar y liberar</span>
                    </div>

                    {/* 3. Intervalo */}
                    <div className="p-3 rounded-xl bg-stone-900 border border-stone-800 text-center space-y-1.5">
                      <span className="text-stone-500 uppercase font-bold text-[10px] block">Intervalo de Bloques</span>
                      <div className="flex items-center justify-center gap-1">
                        {[15, 30, 45].map((mins) => (
                          <button
                            key={mins}
                            type="button"
                            onClick={() => {
                              setIntervalMinutes(mins);
                              setRuleUpdatedToast(`Intervalo de reservas configurado a cada ${mins} minutos.`);
                            }}
                            className={`px-2 py-1 rounded text-[11px] font-bold transition-all cursor-pointer ${
                              intervalMinutes === mins
                                ? 'bg-amber-400 text-stone-950'
                                : 'bg-stone-800 text-stone-400 hover:text-white'
                            }`}
                          >
                            {mins}m
                          </button>
                        ))}
                      </div>
                      <span className="text-[10px] text-stone-400 block mt-1">Espaciado de turnos de llegada</span>
                    </div>

                    {/* 4. Aforo */}
                    <div className="p-3 rounded-xl bg-stone-900 border border-stone-800 text-center space-y-1.5">
                      <span className="text-stone-500 uppercase font-bold text-[10px] block">Aforo Total Sala</span>
                      <span className="font-mono font-bold text-emerald-400 text-base block">52 comensales</span>
                      <span className="text-[10px] text-stone-400 block">13 mesas distribuidas en 4 zonas</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================
                VISTA: REPORTE DE FACTURACIÓN Y VARIACIÓN MENSUAL
               ======================================================== */}
            {currentSection === 'reporte_ventas' && (
              <div className="space-y-6">
                <div className="pb-4 border-b border-stone-800">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-emerald-400 uppercase font-bold">Analá­tica Comercial</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300">
                      Variación vs Mes Anterior
                    </span>
                  </div>
                  <h1 className="text-2xl font-bold font-serif-display text-stone-100">
                    Ventas Mensuales y Variación Comparativa
                  </h1>
                  <p className="text-xs text-stone-400">
                    Consolidado de ingresos facturados por reservas, depósitos deducibles y consumos con evolución mensual.
                  </p>
                </div>

                {/* KPIs Destacados de Variación */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div className="p-4 rounded-xl bg-stone-950 border border-emerald-500/40 bg-gradient-to-br from-stone-950 to-emerald-950/20">
                    <span className="text-stone-400 uppercase font-bold text-[10px] block">Ventas Octubre 2026 (En Curso)</span>
                    <span className="text-2xl font-mono font-bold text-emerald-400 block my-1">S/. 48,250.00</span>
                    <div className="flex items-center gap-1 text-emerald-300 font-semibold text-[11px]">
                      <ArrowUpRight className="w-4 h-4" />
                      <span>+14.61% de variación vs Septiembre (S/. 42,100)</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-stone-950 border border-stone-800">
                    <span className="text-stone-400 uppercase font-bold text-[10px] block">Ticket Promedio Mensual</span>
                    <span className="text-2xl font-mono font-bold text-amber-400 block my-1">S/. 243.68</span>
                    <span className="text-[11px] text-stone-400">198 reservas atendidas este mes</span>
                  </div>

                  <div className="p-4 rounded-xl bg-stone-950 border border-stone-800">
                    <span className="text-stone-400 uppercase font-bold text-[10px] block">Facturación Acumulada Semestre</span>
                    <span className="text-2xl font-mono font-bold text-stone-100 block my-1">S/. 242,350.00</span>
                    <span className="text-[11px] text-emerald-400">Crecimiento constante sostenido</span>
                  </div>
                </div>

                {/* Gráfico de Barras Tailwind */}
                <div className="p-5 rounded-2xl bg-stone-950 border border-stone-800 space-y-4">
                  <span className="font-bold text-stone-200 text-sm block">Evolución de Ventas por Mes (Soles S/.)</span>
                  <div className="grid grid-cols-6 gap-3 items-end h-44 pt-6 pb-2 border-b border-stone-800">
                    {MONTHLY_SALES_REPORT.slice().reverse().map((item, idx) => {
                      const maxSale = 50000;
                      const heightPct = Math.round((item.totalSales / maxSale) * 100);
                      const isPositive = item.variationPct >= 0;
                      return (
                        <div key={idx} className="flex flex-col items-center gap-1 h-full justify-end">
                          <span className="text-[10px] font-mono text-stone-300">
                            S/. {(item.totalSales / 1000).toFixed(1)}k
                          </span>
                          <div
                            className={`w-full rounded-t-lg transition-all duration-500 ${
                              item.status === 'en_curso'
                                ? 'bg-gradient-to-t from-amber-500 to-amber-300'
                                : 'bg-gradient-to-t from-stone-700 to-stone-500'
                            }`}
                            style={{ height: `${heightPct}%` }}
                          />
                          <span className="text-[10px] font-bold text-stone-400 mt-1 truncate">
                            {item.month.split(' ')[0]}
                          </span>
                          <span
                            className={`text-[9px] font-mono font-bold ${
                              isPositive ? 'text-emerald-400' : 'text-rose-400'
                            }`}
                          >
                            {isPositive ? `+${item.variationPct}%` : `${item.variationPct}%`}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Tabla Detallada con Variación */}
                <div className="bg-stone-950 border border-stone-800 rounded-2xl overflow-hidden shadow-xl">
                  <div className="p-4 border-b border-stone-800 text-xs">
                    <span className="font-bold text-stone-200 block text-sm">Tabla Comparativa Mensual con Variación</span>
                    <span className="text-stone-400 text-[11px]">Crecimiento porcentual y volumen de comensales atendidos</span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-stone-900 text-stone-400 uppercase font-semibold border-b border-stone-800">
                        <tr>
                          <th className="px-4 py-3">Mes del Año</th>
                          <th className="px-4 py-3">Ventas Generadas</th>
                          <th className="px-4 py-3">Mes Anterior</th>
                          <th className="px-4 py-3">Variación (%)</th>
                          <th className="px-4 py-3">Reservas</th>
                          <th className="px-4 py-3">Ticket Prom.</th>
                          <th className="px-4 py-3 text-center">Estado</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-800/60">
                        {MONTHLY_SALES_REPORT.map((row, idx) => (
                          <tr key={idx} className="hover:bg-stone-900/50">
                            <td className="px-4 py-3 font-bold text-stone-200">{row.month}</td>
                            <td className="px-4 py-3 font-mono font-bold text-emerald-400 text-sm">
                              S/. {row.totalSales.toFixed(2)}
                            </td>
                            <td className="px-4 py-3 font-mono text-stone-400">S/. {row.prevSales.toFixed(2)}</td>
                            <td className="px-4 py-3">
                              <span
                                className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded font-mono font-bold text-xs ${
                                  row.variationPct >= 0
                                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                    : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                                }`}
                              >
                                {row.variationPct >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                                {row.variationPct >= 0 ? `+${row.variationPct}%` : `${row.variationPct}%`}
                              </span>
                            </td>
                            <td className="px-4 py-3 font-mono text-stone-300">{row.reservationsCount}</td>
                            <td className="px-4 py-3 font-mono text-stone-300">S/. {row.avgTicket.toFixed(2)}</td>
                            <td className="px-4 py-3 text-center">
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                  row.status === 'en_curso'
                                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                    : 'bg-stone-800 text-stone-400'
                                }`}
                              >
                                {row.status === 'en_curso' ? 'En Curso' : 'Cerrado'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================
                VISTA: REPORTE DE RENDIMIENTO DE CARTA Y RANKING
               ======================================================== */}
            {currentSection === 'reporte_platos' && (
              <div className="space-y-6">
                <div className="pb-4 border-b border-stone-800">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-amber-400 uppercase font-bold">Rendimiento Gastronómico</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300">
                      Ranking de Ventas
                    </span>
                  </div>
                  <h1 className="text-2xl font-bold font-serif-display text-stone-100">
                    Reporte de Platos: Mayores Ingresos y Más Vendidos
                  </h1>
                  <p className="text-xs text-stone-400">
                    Métricas de rentabilidad y demanda de la carta según reservas anticipadas y comandas de sala.
                  </p>
                </div>

                {/* 2 Destacados: Top Ingresos vs Top Unidades */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-5 rounded-2xl bg-stone-950 border border-amber-500/40 bg-gradient-to-br from-stone-950 to-amber-950/20">
                    <div className="flex items-center gap-2 mb-1">
                      <Award className="w-4 h-4 text-amber-400" />
                      <span className="text-amber-300 uppercase font-bold text-[10px]">Plato con Mayor Ingreso Facturado</span>
                    </div>
                    <span className="text-lg font-bold text-stone-100 block">Solomillo Wagyu Glaseado a la Trufa</span>
                    <span className="text-2xl font-mono font-bold text-amber-400 block my-1">S/. 13,940.00</span>
                    <span className="text-stone-400 text-[11px]">164 unidades vendidas · Representa el 28.89% de los ingresos de cocina</span>
                  </div>

                  <div className="p-5 rounded-2xl bg-stone-950 border border-sky-500/40 bg-gradient-to-br from-stone-950 to-sky-950/20">
                    <div className="flex items-center gap-2 mb-1">
                      <ShoppingBag className="w-4 h-4 text-sky-400" />
                      <span className="text-sky-300 uppercase font-bold text-[10px]">Plato Más Solicitado en Unidades</span>
                    </div>
                    <span className="text-lg font-bold text-stone-100 block">Cóctel Aura Botánico de Autor</span>
                    <span className="text-2xl font-mono font-bold text-sky-400 block my-1">210 Unidades</span>
                    <span className="text-stone-400 text-[11px]">S/. 7,980.00 facturados · Producto de mayor rotación</span>
                  </div>
                </div>

                {/* Tabla de Ranking de Platos */}
                <div className="bg-stone-950 border border-stone-800 rounded-2xl overflow-hidden shadow-xl">
                  <div className="p-4 border-b border-stone-800 text-xs">
                    <span className="font-bold text-stone-200 block text-sm">Ranking de Rentabilidad y Demanda de Platos</span>
                    <span className="text-stone-400 text-[11px]">Ordenado por contribución económica total a sala</span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-stone-900 text-stone-400 uppercase font-semibold border-b border-stone-800">
                        <tr>
                          <th className="px-4 py-3">Ranking</th>
                          <th className="px-4 py-3">Nombre del Plato</th>
                          <th className="px-4 py-3">Categorí­a</th>
                          <th className="px-4 py-3">Precio Carta</th>
                          <th className="px-4 py-3">Unidades</th>
                          <th className="px-4 py-3">Ingresos Totales</th>
                          <th className="px-4 py-3">% Facturación</th>
                          <th className="px-4 py-3 text-right">Distintivo</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-800/60">
                        {DISH_SALES_RANKING.map((dish, idx) => (
                          <tr key={dish.id} className="hover:bg-stone-900/50">
                            <td className="px-4 py-3 font-mono font-bold text-amber-400">#{idx + 1}</td>
                            <td className="px-4 py-3 font-bold text-stone-100">{dish.name}</td>
                            <td className="px-4 py-3 uppercase text-[10px] text-stone-400 font-bold">{dish.category}</td>
                            <td className="px-4 py-3 font-mono text-stone-300">S/. {dish.price.toFixed(2)}</td>
                            <td className="px-4 py-3 font-mono font-bold text-stone-200">{dish.unitsSold} u.</td>
                            <td className="px-4 py-3 font-mono font-bold text-emerald-400 text-sm">
                              S/. {dish.totalRevenue.toFixed(2)}
                            </td>
                            <td className="px-4 py-3 font-mono text-stone-300">{dish.sharePct}%</td>
                            <td className="px-4 py-3 text-right">
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                {dish.tag}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================
                VISTA 9: REPORTE OCUPACIÓN POR ZONAS
               ======================================================== */}
            {currentSection === 'reporte_zonas' && (
              <div className="space-y-6">
                <div className="pb-4 border-b border-stone-800">
                  <span className="text-xs text-sky-400 uppercase font-bold">Reporte Gerencial Oficial 3</span>
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
                    <span className="font-bold text-stone-200 block">Terraza Jardí­n</span>
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

            {/* ========================================================
                VISTA 10: REPORTE DEMANDA, HORAS PICO & DESCONGESTIÓN OPERATIVA
               ======================================================== */}
            {currentSection === 'reporte_asistencia' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-stone-800 gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-rose-400 uppercase font-bold">Reporte Gerencial Oficial 4</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 uppercase">
                        Descongestión & Capacidad
                      </span>
                    </div>
                    <h1 className="text-2xl font-bold font-serif-display text-stone-100 mt-1">
                      Reporte de Demanda por Turnos, Horas Pico & Descongestión
                    </h1>
                    <p className="text-xs text-stone-400">
                      Análisis de saturación horaria, impacto del depósito de garantí­a en la reducción de No-Shows y matriz de descongestión de cocina y sala.
                    </p>
                  </div>

                  <button
                    onClick={() => window.print()}
                    className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold flex items-center gap-2 border border-stone-700 cursor-pointer shadow-md shrink-0"
                  >
                    <Printer className="w-3.5 h-3.5 text-amber-400" /> Imprimir Reporte Oficial
                  </button>
                </div>

                {/* 4 KPIs de Alto Nivel */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
                  <div className="p-4 rounded-2xl bg-stone-950 border border-emerald-500/40 bg-gradient-to-br from-stone-950 to-emerald-950/20">
                    <span className="text-stone-400 uppercase font-bold text-[10px] block">Asistencia Efectiva (Show-Up)</span>
                    <span className="text-3xl font-mono font-bold text-emerald-400 block my-1">96.2%</span>
                    <span className="text-[11px] text-emerald-300">Solo 3.8% absentismo con tarjeta</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-stone-950 border border-rose-500/40 bg-gradient-to-br from-stone-950 to-rose-950/20">
                    <span className="text-stone-400 uppercase font-bold text-[10px] block">Hora Pico Crí­tica (Peak Hour)</span>
                    <span className="text-2xl font-mono font-bold text-rose-400 block my-1">20:00 - 21:30</span>
                    <span className="text-[11px] text-rose-300">98% saturación de mesas</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-stone-950 border border-stone-800">
                    <span className="text-stone-400 uppercase font-bold text-[10px] block">Rotación Promedio de Mesa</span>
                    <span className="text-2xl font-mono font-bold text-amber-400 block my-1">78 min</span>
                    <span className="text-[11px] text-stone-400">Límite operativo: {rotationMinutes} min</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-stone-950 border border-stone-800">
                    <span className="text-stone-400 uppercase font-bold text-[10px] block">Tolerancia Máxima Aplicada</span>
                    <span className="text-2xl font-mono font-bold text-stone-100 block my-1">{toleranceMinutes} min</span>
                    <span className="text-[11px] text-stone-400">94% de puntualidad en sala</span>
                  </div>
                </div>

                {/* Gráfico Visual: Curva de Demanda y Ocupación Horaria (12:00 a 22:30) */}
                <div className="p-5 rounded-2xl bg-stone-950 border border-stone-800 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-800 pb-3">
                    <div>
                      <span className="font-bold text-stone-200 text-sm block">
                        Curva de Saturación y Demanda Horaria (Almuerzo vs Cena)
                      </span>
                      <span className="text-stone-400 text-xs">
                        Porcentaje de ocupación por intervalo horario y detección de picos de congestión
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-[11px]">
                      <span className="flex items-center gap-1.5 text-emerald-400">
                        <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500 inline-block"></span> Valle (&lt;50%)
                      </span>
                      <span className="flex items-center gap-1.5 text-amber-400">
                        <span className="w-2.5 h-2.5 rounded-sm bg-amber-400 inline-block"></span> Óptimo (50-80%)
                      </span>
                      <span className="flex items-center gap-1.5 text-rose-400 font-bold">
                        <span className="w-2.5 h-2.5 rounded-sm bg-rose-500 inline-block"></span> Pico Crí­tico (&gt;80%)
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-13 gap-2 items-end h-52 pt-8 pb-3 border-b border-stone-800 text-center">
                    {[
                      { time: '12:30', pct: 45, shift: 'alm' },
                      { time: '13:00', pct: 72, shift: 'alm' },
                      { time: '13:30', pct: 88, shift: 'alm', isPeak: true },
                      { time: '14:00', pct: 65, shift: 'alm' },
                      { time: '14:30', pct: 38, shift: 'alm' },
                      { time: '15:00', pct: 20, shift: 'alm' },
                      { time: '19:00', pct: 42, shift: 'cena' },
                      { time: '19:30', pct: 68, shift: 'cena' },
                      { time: '20:00', pct: 100, shift: 'cena', isPeak: true },
                      { time: '20:30', pct: 95, shift: 'cena', isPeak: true },
                      { time: '21:00', pct: 82, shift: 'cena', isPeak: true },
                      { time: '21:30', pct: 60, shift: 'cena' },
                      { time: '22:00', pct: 32, shift: 'cena' },
                    ].map((slot, idx) => (
                      <div key={idx} className="flex flex-col items-center gap-1.5 h-full justify-end group">
                        <span className="text-[10px] font-mono font-bold text-stone-300 opacity-0 group-hover:opacity-100 transition-opacity">
                          {slot.pct}%
                        </span>
                        <div
                          className={`w-full rounded-t-lg transition-all duration-500 shadow-sm ${
                            slot.pct >= 85
                              ? 'bg-gradient-to-t from-rose-600 to-rose-400 ring-1 ring-rose-400/40'
                              : slot.pct >= 60
                              ? 'bg-gradient-to-t from-amber-500 to-amber-300'
                              : 'bg-gradient-to-t from-emerald-600 to-emerald-400'
                          }`}
                          style={{ height: `${slot.pct}%` }}
                        />
                        <span className="text-[10px] font-mono text-stone-400 font-semibold mt-1">
                          {slot.time}
                        </span>
                        {slot.isPeak && (
                          <span className="text-[8px] font-bold uppercase text-rose-400 bg-rose-500/10 px-1 rounded border border-rose-500/20">
                            Pico
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* 2 Columnas de Desglose: Turnos & Comparativo de Absentismo */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                  {/* Desglose de Turnos */}
                  <div className="p-5 rounded-2xl bg-stone-950 border border-stone-800 space-y-3">
                    <span className="font-bold text-stone-200 text-sm block">Distribución de la Demanda por Turnos</span>
                    <div className="space-y-3 pt-1">
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-stone-300 font-medium">Turno Almuerzo Ejecutivo (12:30 a 15:30)</span>
                          <span className="font-mono text-sky-400 font-bold">35% de reservas</span>
                        </div>
                        <div className="w-full h-2.5 rounded-full bg-stone-800 overflow-hidden">
                          <div className="h-full bg-sky-400" style={{ width: '35%' }} />
                        </div>
                        <span className="text-[10px] text-stone-500 mt-1 block">
                          Promedio: 18 mesas atendidas · Ticket medio: S/. 160.00
                        </span>
                      </div>

                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-stone-300 font-medium">Turno Cena Gourmet de Autor (19:00 a 23:00)</span>
                          <span className="font-mono text-amber-400 font-bold">65% de reservas</span>
                        </div>
                        <div className="w-full h-2.5 rounded-full bg-stone-800 overflow-hidden">
                          <div className="h-full bg-amber-400" style={{ width: '65%' }} />
                        </div>
                        <span className="text-[10px] text-stone-500 mt-1 block">
                          Promedio: 34 mesas atendidas · Ticket medio: S/. 280.00
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Impacto de la Garantía con Tarjeta */}
                  <div className="p-5 rounded-2xl bg-stone-950 border border-stone-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-stone-200 text-sm block">Efectividad de la Garantía con Tarjeta</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300">
                        -82.7% No-Shows
                      </span>
                    </div>

                    <div className="space-y-3 pt-1">
                      <div>
                        <div className="flex justify-between text-[11px] mb-1">
                          <span className="text-rose-400">Modelo Antiguo (Sin Tarjeta ni Depósito):</span>
                          <span className="font-mono text-rose-400 font-bold">22.0% Absentismo</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-stone-800 overflow-hidden">
                          <div className="h-full bg-rose-500" style={{ width: '22%' }} />
                        </div>
                        <span className="text-[10px] text-stone-500 mt-0.5 block">
                          Pérdidas estimadas: S/. 3,400 semanales por mesas vací­as reservadas.
                        </span>
                      </div>

                      <div>
                        <div className="flex justify-between text-[11px] mb-1">
                          <span className="text-emerald-400">Modelo Actual (Garantí­a Afianzada con Tarjeta):</span>
                          <span className="font-mono text-emerald-400 font-bold">3.8% Absentismo</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-stone-800 overflow-hidden">
                          <div className="h-full bg-emerald-500" style={{ width: '3.8%' }} />
                        </div>
                        <span className="text-[10px] text-stone-500 mt-0.5 block">
                          Pérdidas reducidas a menos de S/. 280 semanales. Comensales 100% comprometidos.
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Plan Gerencial de Descongestión */}
                <div className="p-5 rounded-2xl bg-amber-950/20 border border-amber-500/30 space-y-3 text-xs">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span className="font-bold text-amber-300 text-sm">
                      Diagnóstico y Plan de Acción de Descongestión Operativa
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                    <div className="p-3 rounded-xl bg-stone-900/80 border border-stone-800 space-y-1">
                      <strong className="text-stone-200 block">1. Desví­o hacia Horas Valle</strong>
                      <p className="text-stone-400 text-[11px]">
                        Incentivar las reservas a las 19:00 y 21:30 hrs ofreciendo cóctel de bienvenida de autor para aplanar el pico de las 20:00 hrs.
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-stone-900/80 border border-stone-800 space-y-1">
                      <strong className="text-stone-200 block">2. Agilización con Pre-Orden</strong>
                      <p className="text-stone-400 text-[11px]">
                        Los clientes que seleccionan platos por adelantado reducen su estancia en 14 minutos, permitiendo un segundo turno sin esperas.
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-stone-900/80 border border-stone-800 space-y-1">
                      <strong className="text-stone-200 block">3. Pausa Dinámica de Franjas</strong>
                      <p className="text-stone-400 text-[11px]">
                        Utilizar el botón "Pausar Franja" en la sección de Horarios cuando cocina alcance el 85% de capacidad para evitar demoras en sala.
                      </p>
                    </div>
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