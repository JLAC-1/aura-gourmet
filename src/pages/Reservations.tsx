import React from 'react';
import { RestaurantTable, ReservationData, MenuItem, SelectedDishItem, PaymentData } from '../types';
import { ReservationForm } from '../components/ReservationForm';
import { Sparkles, ShieldCheck, Clock, Users, CreditCard, Utensils } from 'lucide-react';

interface ReservationsPageProps {
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
  initialSelectedDish?: MenuItem | null;
  onClearInitialSelectedDish?: () => void;
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
    selectedDishes?: SelectedDishItem[];
    payment?: PaymentData;
  }) => { success: boolean; reservation?: ReservationData; error?: string };
  onReservationComplete: (reservation: ReservationData) => void;
}

export const Reservations: React.FC<ReservationsPageProps> = (props) => {
  return (
    <div className="space-y-8 pb-16">
      
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto">
        <span className="text-xs text-amber-400 font-semibold uppercase tracking-wider block mb-1">
          Proceso Guiado de Reserva & Garantía de Mesa
        </span>
        <h1 className="font-serif-display text-3xl sm:text-5xl font-bold text-stone-100">
          Reserve su Mesa en Tiempo Real
        </h1>
        <p className="text-xs sm:text-sm text-stone-400 mt-2 leading-relaxed">
          Siga los 5 pasos: ingrese sus datos, elija fecha y horario, seleccione su mesa en el plano interactivo, pre-ordene sus platos favoritos y confirme su reserva mediante depósito de garantía con tarjeta.
        </p>
      </div>

      {/* Feature trust highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 max-w-4xl mx-auto text-xs text-stone-300">
        <div className="p-3 rounded-xl bg-stone-900 border border-stone-800 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <span className="font-semibold block text-stone-200">Disponibilidad en Vivo</span>
            <span className="text-stone-400 text-[10px]">Sin sobreventa de mesas</span>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-stone-900 border border-stone-800 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <span className="font-semibold block text-stone-200">Plano Arquitectónico</span>
            <span className="text-stone-400 text-[10px]">Elija su mesa en el mapa</span>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-stone-900 border border-stone-800 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400 shrink-0">
            <Utensils className="w-4 h-4" />
          </div>
          <div>
            <span className="font-semibold block text-stone-200">Carta & Pre-orden</span>
            <span className="text-stone-400 text-[10px]">Platos seleccionados</span>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-stone-900 border border-stone-800 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0">
            <CreditCard className="w-4 h-4" />
          </div>
          <div>
            <span className="font-semibold block text-stone-200">Garantía con Tarjeta</span>
            <span className="text-stone-400 text-[10px]">100% deducible en sala</span>
          </div>
        </div>
      </div>

      {/* Main Stepper Form */}
      <div className="max-w-4xl mx-auto">
        <ReservationForm
          tables={props.tables}
          selectedDate={props.selectedDate}
          setSelectedDate={props.setSelectedDate}
          selectedShift={props.selectedShift}
          setSelectedShift={props.setSelectedShift}
          selectedTime={props.selectedTime}
          setSelectedTime={props.setSelectedTime}
          selectedGuests={props.selectedGuests}
          setSelectedGuests={props.setSelectedGuests}
          selectedZone={props.selectedZone}
          setSelectedZone={props.setSelectedZone}
          selectedTableId={props.selectedTableId}
          setSelectedTableId={props.setSelectedTableId}
          selectedTable={props.selectedTable}
          initialSelectedDish={props.initialSelectedDish}
          onClearInitialSelectedDish={props.onClearInitialSelectedDish}
          onCreateReservation={props.onCreateReservation}
          onReservationComplete={props.onReservationComplete}
        />
      </div>

    </div>
  );
};