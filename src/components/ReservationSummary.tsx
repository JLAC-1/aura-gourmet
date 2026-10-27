import React from 'react';
import { ReservationData } from '../types';
import { CheckCircle2, Calendar, Clock, Ticket, Users, Download, ArrowRight } from 'lucide-react';

interface ReservationSummaryProps {
  reservation: ReservationData;
  onNewReservation: () => void;
  onGoHome: () => void;
  onGoAdmin: () => void;
}

export const ReservationSummary: React.FC<ReservationSummaryProps> = ({
  reservation,
  onNewReservation,
  onGoHome,
  onGoAdmin,
}) => {
  return (
    <div className="max-w-2xl mx-auto bg-stone-900 border border-stone-800 rounded-2xl overflow-hidden shadow-2xl">
      <div className="bg-gradient-to-r from-emerald-950 via-stone-900 to-amber-950/40 p-6 sm:p-8 text-center border-b border-stone-800">
        <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-500/60 flex items-center justify-center mx-auto mb-4 text-emerald-400">
          <CheckCircle2 className="w-9 h-9" />
        </div>
        <span className="text-xs font-semibold text-emerald-400 tracking-wider uppercase block mb-1">
          ¡Reserva Confirmada Exitosamente!
        </span>
        <h2 className="font-serif-display text-2xl sm:text-3xl font-bold text-stone-100">
          Esperamos su visita en Aura Gourmet
        </h2>
        <p className="text-xs text-stone-400 mt-2">
          Su mesa ha quedado bloqueada en el plano interactivo a su nombre.
        </p>
      </div>

      <div className="p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row items-center justify-between p-4 rounded-xl bg-stone-950 border border-stone-800 gap-4">
          <div>
            <span className="text-[11px] text-stone-500 uppercase block">Código Oficial</span>
            <span className="text-xl sm:text-2xl font-mono font-bold text-amber-400">{reservation.code}</span>
          </div>
          <div className="text-center sm:text-right">
            <span className="text-[11px] text-stone-500 uppercase block">Titular</span>
            <span className="text-sm font-semibold text-stone-200">{reservation.customerName}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-stone-950 border border-stone-800">
            <span className="text-stone-500 flex items-center gap-1.5 mb-1"><Calendar className="w-3.5 h-3.5 text-amber-400" /> Fecha y Turno</span>
            <p className="text-stone-200 font-semibold text-sm">{reservation.date} · {reservation.shift === 'cena' ? 'Cena' : 'Almuerzo'}</p>
          </div>

          <div className="p-3.5 rounded-xl bg-stone-950 border border-stone-800">
            <span className="text-stone-500 flex items-center gap-1.5 mb-1"><Clock className="w-3.5 h-3.5 text-amber-400" /> Hora de Llegada</span>
            <p className="text-stone-200 font-semibold text-sm">{reservation.time} hrs</p>
          </div>

          <div className="p-3.5 rounded-xl bg-stone-950 border border-stone-800">
            <span className="text-stone-500 flex items-center gap-1.5 mb-1"><Ticket className="w-3.5 h-3.5 text-amber-400" /> Mesa Asignada</span>
            <p className="text-amber-300 font-bold text-sm">Mesa #{reservation.tableNumber} ({reservation.tableZone})</p>
          </div>

          <div className="p-3.5 rounded-xl bg-stone-950 border border-stone-800">
            <span className="text-stone-500 flex items-center gap-1.5 mb-1"><Users className="w-3.5 h-3.5 text-amber-400" /> Comensales</span>
            <p className="text-stone-200 font-semibold text-sm">{reservation.guests} personas</p>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300">
          <strong>Política de tolerancia:</strong> Guardamos su mesa hasta 15 minutos después de la hora señalada.
        </div>

        <div className="pt-4 border-t border-stone-800 flex flex-col sm:flex-row items-center gap-3">
          <button
            onClick={() => window.print()}
            className="w-full sm:w-auto flex-1 px-4 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" /> Imprimir Comprobante
          </button>

          <button
            onClick={onGoAdmin}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-amber-300 text-xs font-semibold"
          >
            Ver en Admin
          </button>

          <button
            onClick={onNewReservation}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 text-xs font-bold flex items-center justify-center gap-2"
          >
            <span>Nueva Reserva</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};