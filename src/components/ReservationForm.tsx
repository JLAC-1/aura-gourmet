import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { RestaurantTable, ReservationData } from '../types';
import { RestaurantMap } from './RestaurantMap';
import { InteractiveCalendar } from './InteractiveCalendar';
import { TIME_SLOTS } from '../data/mockData';
import { User, Mail, Phone, Calendar as CalendarIcon, Users, ArrowRight, ArrowLeft, CheckCircle2, AlertCircle, Edit2 } from 'lucide-react';

interface ReservationFormProps {
  tables: RestaurantTable[];
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  selectedShift: 'almuerzo' | 'cena';
  setSelectedShift: (shift: 'almuerzo' | 'cena') => void;
  selectedTime: string;
  setSelectedTime: (time: string) => void;
  selectedGuests: number;
  setSelectedGuests: (guests: number) => void;
  selectedZone: string;
  setSelectedZone: (zone: string) => void;
  selectedTableId: string | null;
  setSelectedTableId: (id: string | null) => void;
  selectedTable: RestaurantTable | null;
  onCreateReservation: (data: {
    customerName: string;
    email: string;
    phone: string;
    notes?: string;
    date: string;
    time: string;
    shift: 'almuerzo' | 'cena';
    guests: number;
    tableId: string;
  }) => { success: boolean; reservation?: ReservationData; error?: string };
  onReservationComplete: (reservation: ReservationData) => void;
}

export const ReservationForm: React.FC<ReservationFormProps> = ({
  tables,
  selectedDate,
  setSelectedDate,
  selectedShift,
  setSelectedShift,
  selectedTime,
  setSelectedTime,
  selectedGuests,
  setSelectedGuests,
  selectedZone,
  setSelectedZone,
  selectedTableId,
  setSelectedTableId,
  selectedTable,
  onCreateReservation,
  onReservationComplete,
}) => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    notes: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Validación Paso 1 (Datos Personales y Celular 9 dígitos)
  const validateStep1 = () => {
    const errs: Record<string, string> = {};
    if (!formData.name.trim()) {
      errs.name = 'El nombre completo es obligatorio';
    } else if (formData.name.trim().length < 3) {
      errs.name = 'Ingrese un nombre válido';
    }

    if (!formData.email.trim()) {
      errs.email = 'El correo electrónico es obligatorio';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errs.email = 'Ingrese un correo electrónico válido';
    }

    const cleanPhone = formData.phone.replace(/\D/g, '');
    if (!cleanPhone) {
      errs.phone = 'El número de celular es obligatorio';
    } else if (!/^9\d{8}$/.test(cleanPhone)) {
      errs.phone = 'El celular debe tener exactamente 9 dígitos y empezar con 9 (ej. 987 654 321)';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Validación Paso 2 (Fecha, Turno, Comensales)
  const validateStep2 = () => {
    const errs: Record<string, string> = {};
    if (!selectedDate) {
      errs.date = 'Seleccione una fecha de reserva en el calendario';
    }
    if (!selectedTime) {
      errs.time = 'Seleccione una hora válida';
    }
    if (selectedGuests < 1 || selectedGuests > 10) {
      errs.guests = 'Seleccione entre 1 y 10 comensales';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Validación Paso 3 (Mesa del plano)
  const validateStep3 = () => {
    const errs: Record<string, string> = {};
    if (!selectedTableId || !selectedTable) {
      errs.table = 'Debe seleccionar una mesa disponible en el plano interactivo';
    } else if (selectedTable.status !== 'disponible') {
      errs.table = 'La mesa seleccionada no está disponible para este horario';
    } else if (selectedGuests > selectedTable.capacity) {
      errs.table = `La mesa ${selectedTable.number} solo soporta hasta ${selectedTable.capacity} comensales.`;
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    setSubmitError(null);
    if (currentStep === 1) {
      if (validateStep1()) setCurrentStep(2);
    } else if (currentStep === 2) {
      if (validateStep2()) setCurrentStep(3);
    } else if (currentStep === 3) {
      if (validateStep3()) setCurrentStep(4);
    }
  };

  const handlePrev = () => {
    setSubmitError(null);
    if (currentStep > 1) setCurrentStep((prev) => prev - 1);
  };

  const handleConfirmReservation = () => {
    if (!selectedTable) {
      setSubmitError('Por favor seleccione una mesa válida.');
      return;
    }

    const res = onCreateReservation({
      customerName: formData.name,
      email: formData.email,
      phone: formData.phone,
      notes: formData.notes,
      date: selectedDate,
      time: selectedTime,
      shift: selectedShift,
      guests: selectedGuests,
      tableId: selectedTable.id,
    });

    if (res.success && res.reservation) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#f59e0b', '#10b981', '#fbbf24', '#ffffff'],
        });
      } catch (e) {
        // Fallback sin confeti
      }
      onReservationComplete(res.reservation);
    } else {
      setSubmitError(res.error || 'No se pudo completar la reserva.');
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="bg-stone-900 border border-stone-800 rounded-2xl shadow-xl overflow-hidden">
      {/* Barra de progreso de 4 pasos */}
      <div className="bg-stone-950 px-4 sm:px-8 py-5 border-b border-stone-800">
        <div className="flex items-center justify-between max-w-3xl mx-auto">
          {[
            { step: 1, label: 'Datos Personales' },
            { step: 2, label: 'Calendario y Horario' },
            { step: 3, label: 'Plano y Mesa' },
            { step: 4, label: 'Confirmación' },
          ].map((item, idx) => (
            <div key={item.step} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                    currentStep === item.step
                      ? 'bg-amber-400 text-stone-950 ring-4 ring-amber-400/20'
                      : currentStep > item.step
                      ? 'bg-emerald-500 text-stone-950 font-bold'
                      : 'bg-stone-800 text-stone-400 border border-stone-700'
                  }`}
                >
                  {currentStep > item.step ? '✓' : item.step}
                </div>
                <span
                  className={`text-[11px] font-medium mt-1.5 hidden sm:block ${
                    currentStep === item.step
                      ? 'text-amber-300 font-semibold'
                      : currentStep > item.step
                      ? 'text-emerald-400'
                      : 'text-stone-500'
                  }`}
                >
                  {item.label}
                </span>
              </div>
              {idx < 3 && (
                <div
                  className={`w-10 sm:w-20 h-0.5 mx-2 sm:mx-4 transition-colors ${
                    currentStep > item.step ? 'bg-emerald-500' : 'bg-stone-800'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="p-6 sm:p-8">
        {submitError && (
          <div className="mb-6 p-4 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{submitError}</span>
          </div>
        )}

        {/* PASO 1: DATOS PERSONALES */}
        {currentStep === 1 && (
          <div className="max-w-xl mx-auto space-y-5 animate-in fade-in duration-300">
            <div className="text-center sm:text-left mb-6">
              <span className="text-xs text-amber-400 font-semibold uppercase tracking-wider block mb-1">
                Paso 1 de 4
              </span>
              <h3 className="font-serif text-2xl font-bold text-stone-100">
                Información de Contacto
              </h3>
              <p className="text-xs text-stone-400 mt-1">
                Por favor ingrese sus datos para emitir su código de reserva oficial.
              </p>
            </div>

            {/* Nombre */}
            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                Nombre y Apellido <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-500">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ej. Sofia Almenara Valdivia"
                  className={`w-full pl-10 pr-4 py-2.5 bg-stone-950 border rounded-xl text-stone-100 placeholder-stone-600 text-sm focus:outline-none focus:ring-2 transition-all ${
                    errors.name ? 'border-rose-500 focus:ring-rose-500/30' : 'border-stone-800 focus:ring-amber-400/40 focus:border-amber-400'
                  }`}
                />
              </div>
              {errors.name && <p className="text-[11px] text-rose-400 mt-1">{errors.name}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                Correo Electrónico <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="sofia@ejemplo.com"
                  className={`w-full pl-10 pr-4 py-2.5 bg-stone-950 border rounded-xl text-stone-100 placeholder-stone-600 text-sm focus:outline-none focus:ring-2 transition-all ${
                    errors.email ? 'border-rose-500 focus:ring-rose-500/30' : 'border-stone-800 focus:ring-amber-400/40 focus:border-amber-400'
                  }`}
                />
              </div>
              {errors.email && <p className="text-[11px] text-rose-400 mt-1">{errors.email}</p>}
            </div>

            {/* Celular con 9 dígitos y prefijo +51 */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-semibold text-stone-300">
                  Celular de Contacto (WhatsApp) <span className="text-rose-400">*</span>
                </label>
                <span className="text-[11px] text-stone-500 font-mono">
                  {formData.phone.length}/9 dígitos
                </span>
              </div>
              <div className="relative flex items-center">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-500">
                  <Phone className="w-4 h-4" />
                </div>
                <div className="absolute left-9.5 text-xs font-semibold text-stone-400 border-r border-stone-800 pr-2 pointer-events-none">
                  +51
                </div>
                <input
                  type="tel"
                  maxLength={9}
                  inputMode="numeric"
                  value={formData.phone}
                  onChange={(e) => {
                    const onlyDigits = e.target.value.replace(/\D/g, '').slice(0, 9);
                    setFormData({ ...formData, phone: onlyDigits });
                    if (errors.phone) setErrors((prev) => ({ ...prev, phone: '' }));
                  }}
                  placeholder="987654321"
                  className={`w-full pl-20 pr-4 py-2.5 bg-stone-950 border rounded-xl text-stone-100 placeholder-stone-600 text-sm focus:outline-none focus:ring-2 transition-all font-mono tracking-wider ${
                    errors.phone ? 'border-rose-500 focus:ring-rose-500/30' : 'border-stone-800 focus:ring-amber-400/40 focus:border-amber-400'
                  }`}
                />
              </div>
              {errors.phone && <p className="text-[11px] text-rose-400 mt-1">{errors.phone}</p>}
            </div>

            {/* Notas opcionales */}
            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                Peticiones Especiales u Ocasión (Opcional)
              </label>
              <textarea
                rows={2}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Ej. Cumpleaños, aniversario, alergia a mariscos o frutos secos..."
                className="w-full px-4 py-2 bg-stone-950 border border-stone-800 rounded-xl text-stone-100 placeholder-stone-600 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400 transition-all"
              />
            </div>
          </div>
        )}

        {/* PASO 2: CALENDARIO, TURNO Y COMENSALES */}
        {currentStep === 2 && (
          <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-300">
            <div className="text-center sm:text-left mb-4">
              <span className="text-xs text-amber-400 font-semibold uppercase tracking-wider block mb-1">
                Paso 2 de 4 · Selección de Fecha
              </span>
              <h3 className="font-serif text-2xl font-bold text-stone-100">
                Seleccione el Día y Horario de su Reserva
              </h3>
              <p className="text-xs text-stone-400 mt-1">
                Haga clic en cualquier día del calendario o use los botones de acceso rápido.
              </p>
            </div>

            {/* Calendario Interactivo */}
            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-2 flex items-center justify-between">
                <span>1. Elija el Día en el Calendario:</span>
                <span className="text-amber-400 font-mono text-[11px]">
                  Fecha elegida: {selectedDate}
                </span>
              </label>
              <InteractiveCalendar
                selectedDate={selectedDate}
                onSelectDate={(date) => {
                  setSelectedDate(date);
                  setErrors((prev) => ({ ...prev, date: '' }));
                }}
                minDate={todayStr}
              />
              {errors.date && <p className="text-[11px] text-rose-400 mt-1.5">{errors.date}</p>}
            </div>

            {/* Turnos */}
            <div className="pt-2">
              <label className="block text-xs font-semibold text-stone-300 mb-2">
                2. Seleccione el Turno de Servicio:
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedShift('almuerzo');
                    setSelectedTime('13:30');
                  }}
                  className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                    selectedShift === 'almuerzo'
                      ? 'border-amber-400 bg-amber-500/10 text-stone-100 ring-2 ring-amber-400/30'
                      : 'border-stone-800 bg-stone-950 text-stone-400 hover:border-stone-700'
                  }`}
                >
                  <span className="text-sm font-bold block text-stone-100">Almuerzo</span>
                  <span className="text-xs text-stone-400 mt-0.5 block">12:30 a 15:30 hrs</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedShift('cena');
                    setSelectedTime('20:00');
                  }}
                  className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                    selectedShift === 'cena'
                      ? 'border-amber-400 bg-amber-500/10 text-stone-100 ring-2 ring-amber-400/30'
                      : 'border-stone-800 bg-stone-950 text-stone-400 hover:border-stone-700'
                  }`}
                >
                  <span className="text-sm font-bold block text-stone-100">Cena Gourmet</span>
                  <span className="text-xs text-stone-400 mt-0.5 block">19:00 a 23:00 hrs</span>
                </button>
              </div>
            </div>

            {/* Horas exactas */}
            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-2">
                3. Horario Exacto de Llegada:
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {TIME_SLOTS[selectedShift].map((time) => (
                  <button
                    key={time}
                    type="button"
                    onClick={() => setSelectedTime(time)}
                    className={`py-2.5 px-3 text-xs rounded-xl font-medium transition-all cursor-pointer ${
                      selectedTime === time
                        ? 'bg-amber-400 text-stone-950 font-bold shadow-sm'
                        : 'bg-stone-950 border border-stone-800 text-stone-300 hover:border-stone-700'
                    }`}
                  >
                    {time} hrs
                  </button>
                ))}
              </div>
            </div>

            {/* Número de comensales */}
            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-2">
                4. Número de Comensales:
              </label>
              <div className="grid grid-cols-5 gap-2">
                {[1, 2, 4, 6, 8].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setSelectedGuests(num)}
                    className={`py-3 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      selectedGuests === num
                        ? 'bg-amber-400 text-stone-950 shadow-sm font-bold'
                        : 'bg-stone-950 border border-stone-800 text-stone-300 hover:border-stone-700'
                    }`}
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>{num} {num === 1 ? 'persona' : 'personas'}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* PASO 3: PLANO INTERACTIVO Y SELECCIÓN DE MESA */}
        {currentStep === 3 && (
          <div className="space-y-4 animate-in fade-in duration-300">
            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="text-stone-300">
                  Mostrando disponibilidad en plano para:{' '}
                  <strong className="text-amber-300 font-bold">{selectedDate}</strong> ·{' '}
                  <span className="capitalize font-semibold text-stone-200">Turno {selectedShift} ({selectedTime} hrs)</span> ·{' '}
                  <span>{selectedGuests} comensales</span>
                </span>
              </div>
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="text-amber-400 hover:text-amber-300 underline font-semibold flex items-center gap-1 shrink-0 cursor-pointer"
              >
                <Edit2 className="w-3 h-3" />
                <span>Cambiar fecha u hora</span>
              </button>
            </div>

            <div className="text-center sm:text-left mb-2">
              <span className="text-xs text-amber-400 font-semibold uppercase tracking-wider block mb-0.5">
                Paso 3 de 4 · Selección de Mesa
              </span>
              <h3 className="font-serif text-2xl font-bold text-stone-100">
                Selección de Mesa en el Plano Interactivo
              </h3>
              <p className="text-xs text-stone-400">
                Haga clic directamente en una mesa disponible (verde) del plano para elegirla.
              </p>
            </div>

            {errors.table && (
              <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{errors.table}</span>
              </div>
            )}

            <RestaurantMap
              tables={tables}
              selectedTableId={selectedTableId}
              onSelectTable={(table) => {
                setSelectedTableId(table.id);
                setErrors((prev) => ({ ...prev, table: '' }));
              }}
              guestCount={selectedGuests}
              activeZoneFilter={selectedZone}
              onZoneFilterChange={setSelectedZone}
            />
          </div>
        )}

        {/* PASO 4: CONFIRMACIÓN DEFINITIVA */}
        {currentStep === 4 && selectedTable && (
          <div className="max-w-xl mx-auto space-y-6 animate-in fade-in duration-300">
            <div className="text-center sm:text-left mb-6">
              <span className="text-xs text-amber-400 font-semibold uppercase tracking-wider block mb-1">
                Paso 4 de 4
              </span>
              <h3 className="font-serif text-2xl font-bold text-stone-100">
                Confirmación de la Reserva
              </h3>
              <p className="text-xs text-stone-400 mt-1">
                Revise cuidadosamente los datos antes de emitir la reserva definitiva.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-stone-950 border border-stone-800 space-y-4 text-xs">
              <div className="flex justify-between items-center pb-3 border-b border-stone-800">
                <span className="text-stone-400 font-medium">Titular:</span>
                <span className="text-stone-100 font-bold text-sm">{formData.name}</span>
              </div>

              <div className="flex justify-between items-center pb-3 border-b border-stone-800">
                <span className="text-stone-400 font-medium">Correo & Teléfono:</span>
                <span className="text-stone-300 text-right">
                  {formData.email} · +51 {formData.phone}
                </span>
              </div>

              <div className="flex justify-between items-center pb-3 border-b border-stone-800">
                <span className="text-stone-400 font-medium">Fecha y Horario:</span>
                <span className="text-stone-100 font-bold">
                  {selectedDate} a las {selectedTime} hrs ({selectedShift === 'cena' ? 'Cena' : 'Almuerzo'})
                </span>
              </div>

              <div className="flex justify-between items-center pb-3 border-b border-stone-800">
                <span className="text-stone-400 font-medium">Comensales:</span>
                <span className="text-stone-100 font-bold">{selectedGuests} personas</span>
              </div>

              <div className="flex justify-between items-center pt-1">
                <span className="text-stone-400 font-medium">Mesa en Plano:</span>
                <div className="text-right">
                  <span className="text-amber-400 font-bold text-sm block">
                    Mesa #{selectedTable.number}
                  </span>
                  <span className="text-[11px] text-stone-400">
                    {selectedTable.zoneName} · Capacidad hasta {selectedTable.capacity}p
                  </span>
                </div>
              </div>

              {formData.notes && (
                <div className="pt-3 border-t border-stone-800 text-stone-400">
                  <span className="text-stone-500 block mb-0.5 font-medium">Notas adicionales:</span>
                  <p className="italic text-stone-300">&ldquo;{formData.notes}&rdquo;</p>
                </div>
              )}
            </div>

            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300">
              ✓ Al confirmar, la mesa quedará registrada en el sistema sin recargo alguno y bloqueada para otros comensales.
            </div>
          </div>
        )}

        {/* Botones de Navegación del Wizard */}
        <div className="mt-8 pt-5 border-t border-stone-800 flex items-center justify-between">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={handlePrev}
              className="px-4 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Anterior</span>
            </button>
          ) : (
            <div />
          )}

          {currentStep < 4 ? (
            <button
              type="button"
              onClick={handleNext}
              className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
            >
              <span>Continuar al Paso {currentStep + 1}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleConfirmReservation}
              className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-stone-950 text-xs sm:text-sm font-bold flex items-center gap-2 transition-colors shadow-lg shadow-emerald-500/20 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Confirmar y Reservar Mesa Definitiva</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};