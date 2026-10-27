import React from 'react';
import { RestaurantTable, ReservationData } from '../types';
import { ReservationForm } from '../components/ReservationForm';
import { ShieldCheck, Clock, Users } from 'lucide-react';

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
  onCreateReservation: (data: any) => { success: boolean; reservation?: ReservationData; error?: string };
  onReservationComplete: (reservation: ReservationData) => void;
}

export const Reservations: React.FC<ReservationsPageProps> = (props) => {
  return (
    <div className="space-y-8 pb-16">
      <div className="text-center max-w-2xl mx-auto">
        <span className="text-xs text-amber-400 font-semibold uppercase tracking-wider block mb-1">
          Proceso Guiado de Reserva
        </span>
        <h1 className="font-serif-display text-3xl sm:text-5xl font-bold text-stone-100">
          Reserve su Mesa en Tiempo Real
        </h1>
        <p className="text-xs sm:text-sm text-stone-400 mt-2">
          En el paso 2 podrá escoger el día en el calendario interactivo y en el paso 3 podrá elegir su mesa en el plano.
        </p>
      </div>

      <div className="max-w-4xl mx-auto">
        <ReservationForm {...props} />
      </div>
    </div>
  );
};