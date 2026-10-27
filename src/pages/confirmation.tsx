import React from 'react';
import { ReservationData } from '../types';
import { ReservationSummary } from '../components/ReservationSummary';
import { ArrowLeft, CalendarDays } from 'lucide-react';

interface ConfirmationProps {
  reservation: ReservationData | null;
  onNewReservation: () => void;
  onGoHome: () => void;
  onGoAdmin: () => void;
}

export const Confirmation: React.FC<ConfirmationProps> = ({
  reservation,
  onNewReservation,
  onGoHome,
  onGoAdmin,
}) => {
  if (!reservation) {
    return (
      <div className="py-20 text-center max-w-md mx-auto">
        <h2 className="font-serif-display text-2xl font-bold text-stone-200 mb-2">No hay reserva activa</h2>
        <button
          onClick={onNewReservation}
          className="px-6 py-2.5 rounded-xl bg-amber-400 text-stone-950 font-bold text-xs"
        >
          Ir a Reservar Mesa
        </button>
      </div>
    );
  }

  return (
    <div className="py-8 sm:py-12">
      <div className="mb-6 max-w-2xl mx-auto flex items-center justify-between">
        <button onClick={onGoHome} className="text-xs text-stone-400 hover:text-stone-200 flex items-center gap-1.5">
          <ArrowLeft className="w-3.5 h-3.5" /> Volver al Inicio
        </button>
        <span className="text-xs text-stone-500 font-mono">Emisión: {reservation.createdAt}</span>
      </div>

      <ReservationSummary
        reservation={reservation}
        onNewReservation={onNewReservation}
        onGoHome={onGoHome}
        onGoAdmin={onGoAdmin}
      />
    </div>
  );
};