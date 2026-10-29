import React from 'react';
import { ReservationData } from '../types';
import {
  CheckCircle2,
  Calendar,
  Clock,
  Ticket,
  Users,
  Download,
  ArrowRight,
  CreditCard,
  Utensils,
} from 'lucide-react';

interface ReservationSummaryProps {
  reservation: ReservationData;
  onNewReservation: () => void;
  onGoHome: () => void;
  onGoAdmin: () => void;
}

export const ReservationSummary: React.FC<ReservationSummaryProps> = ({
  reservation,
  onNewReservation,
  onGoAdmin,
}) => {
  const handlePrint = () => {
    window.print();
  };

  const payment = reservation.payment;
  const hasDishes = reservation.selectedDishes && reservation.selectedDishes.length > 0;

  return (
    <div className="max-w-2xl mx-auto bg-stone-900 border border-stone-800 rounded-2xl overflow-hidden shadow-2xl">
      {/* Header banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-stone-900 to-amber-950/40 p-6 sm:p-8 text-center border-b border-stone-800">
        <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-500/60 flex items-center justify-center mx-auto mb-4 text-emerald-400">
          <CheckCircle2 className="w-9 h-9" />
        </div>
        <span className="text-xs font-semibold text-emerald-400 tracking-wider uppercase block mb-1">
          ¡Amarre y Reserva Confirmados Exitosamente!
        </span>
        <h2 className="font-serif-display text-2xl sm:text-3xl font-bold text-stone-100">
          Esperamos su visita en Aura Gourmet
        </h2>
        <p className="text-xs text-stone-400 mt-2 max-w-md mx-auto">
          Su mesa ha quedado bloqueada en el plano interactivo y su depósito de garantía ha sido afianzado mediante tarjeta.
        </p>
      </div>

      {/* Ticket / Voucher Body */}
      <div className="p-6 sm:p-8 space-y-6">
        
        {/* Code & Customer Banner */}
        <div className="flex flex-col sm:flex-row items-center justify-between p-4 rounded-xl bg-stone-950 border border-stone-800 gap-4">
          <div>
            <span className="text-[11px] text-stone-500 uppercase tracking-wider block">
              Código de Confirmación
            </span>
            <span className="text-xl sm:text-2xl font-mono font-bold text-amber-400 tracking-wider">
              {reservation.code}
            </span>
          </div>
          <div className="text-center sm:text-right">
            <span className="text-[11px] text-stone-500 uppercase tracking-wider block">
              Titular de la Reserva
            </span>
            <span className="text-sm font-semibold text-stone-200">
              {reservation.customerName}
            </span>
          </div>
        </div>

        {/* Detailed Grid: Table, Time, Guests */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-stone-950/60 border border-stone-800/80">
            <span className="text-stone-500 flex items-center gap-1.5 mb-1">
              <Calendar className="w-3.5 h-3.5 text-amber-400" />
              Fecha y Turno
            </span>
            <p className="text-stone-200 font-semibold text-sm">
              {reservation.date} · {reservation.shift === 'cena' ? 'Cena Gourmet' : 'Almuerzo'}
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-stone-950/60 border border-stone-800/80">
            <span className="text-stone-500 flex items-center gap-1.5 mb-1">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              Hora de Llegada
            </span>
            <p className="text-stone-200 font-semibold text-sm">
              {reservation.time} hrs
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-stone-950/60 border border-stone-800/80">
            <span className="text-stone-500 flex items-center gap-1.5 mb-1">
              <Ticket className="w-3.5 h-3.5 text-amber-400" />
              Mesa Asignada en Plano
            </span>
            <p className="text-amber-300 font-bold text-sm">
              Mesa #{reservation.tableNumber} ({reservation.tableZone})
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-stone-950/60 border border-stone-800/80">
            <span className="text-stone-500 flex items-center gap-1.5 mb-1">
              <Users className="w-3.5 h-3.5 text-amber-400" />
              Comensales
            </span>
            <p className="text-stone-200 font-semibold text-sm">
              {reservation.guests} personas (capacidad: {reservation.tableCapacity}p)
            </p>
          </div>
        </div>

        {/* PAYMENT / AMARRE VOUCHER SECTION */}
        <div className="p-4 sm:p-5 rounded-xl bg-gradient-to-r from-stone-950 via-emerald-950/20 to-stone-950 border border-emerald-500/40 space-y-3 text-xs">
          <div className="flex items-center justify-between pb-2 border-b border-stone-800">
            <span className="font-bold text-emerald-400 flex items-center gap-1.5 text-xs uppercase tracking-wider">
              <CreditCard className="w-4 h-4" />
              Comprobante de Amarre Pagado con Tarjeta
            </span>
            <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono text-[11px] font-bold border border-emerald-500/30">
              ESTADO: APROBADO
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 text-[11px]">
            <div>
              <span className="text-stone-500 block">Tarjeta / Método:</span>
              <span className="text-stone-200 font-mono font-semibold uppercase">
                {payment?.cardBrand || 'VISA'} •••• {payment?.cardLast4 || '4242'}
              </span>
            </div>
            <div>
              <span className="text-stone-500 block">N° de Transacción:</span>
              <span className="text-stone-200 font-mono font-semibold">
                {payment?.transactionId || 'TXN-AURA-782109'}
              </span>
            </div>
            <div>
              <span className="text-stone-500 block">Fecha y Hora de Pago:</span>
              <span className="text-stone-200 font-mono">
                {payment?.paidAt || reservation.createdAt}
              </span>
            </div>
          </div>

          <div className="pt-2 border-t border-stone-800/80 flex items-center justify-between">
            <div>
              <span className="text-stone-400 text-xs">Total del Depósito de Garantía:</span>
              <span className="block text-[10px] text-stone-500">
                (Garantía por comensal S/. {payment?.depositAmount ? payment.depositAmount.toFixed(2) : (reservation.guests * 30).toFixed(2)}
                {payment?.dishesAmount ? ` + Platos S/. ${payment.dishesAmount.toFixed(2)}` : ''})
              </span>
            </div>
            <span className="text-base font-bold font-mono text-amber-400">
              S/. {payment?.totalPaid ? payment.totalPaid.toFixed(2) : (reservation.guests * 30).toFixed(2)}
            </span>
          </div>

          <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-300/90 leading-tight">
            ✓ <strong>100% Deducible en el Restaurante:</strong> Al solicitar su cuenta al maître o mozo en sala, los S/. {payment?.totalPaid ? payment.totalPaid.toFixed(2) : (reservation.guests * 30).toFixed(2)} pagados serán descontados del total de su consumo.
          </div>
        </div>

        {/* PRE-ORDERED DISHES SECTION */}
        {hasDishes && (
          <div className="p-4 rounded-xl bg-stone-950 border border-stone-800 space-y-3 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-stone-800">
              <span className="font-semibold text-stone-200 flex items-center gap-1.5">
                <Utensils className="w-3.5 h-3.5 text-amber-400" />
                Platos Pre-ordenados para Cocina:
              </span>
              <span className="text-stone-400 text-[11px]">
                {reservation.selectedDishes!.reduce((a, b) => a + b.quantity, 0)} platos en orden
              </span>
            </div>

            <div className="divide-y divide-stone-800/60">
              {reservation.selectedDishes!.map((dish) => (
                <div key={dish.dishId} className="py-2 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded bg-amber-400/20 text-amber-400 font-bold flex items-center justify-center text-[11px] font-mono">
                      {dish.quantity}
                    </span>
                    <span className="text-stone-200 font-medium">{dish.name}</span>
                  </div>
                  <span className="font-mono text-stone-300">
                    S/. {(dish.price * dish.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Contact info verification */}
        <div className="p-4 rounded-xl bg-stone-950/40 border border-stone-800 text-xs text-stone-400 space-y-1">
          <p>
            <span className="text-stone-500">Correo de confirmación:</span> {reservation.email}
          </p>
          <p>
            <span className="text-stone-500">Teléfono:</span> {reservation.phone}
          </p>
          {reservation.notes && (
            <p className="pt-2 border-t border-stone-800/80">
              <span className="text-stone-500">Petición especial:</span> &ldquo;{reservation.notes}&rdquo;
            </p>
          )}
        </div>

        {/* Tolerance policy */}
        <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300/90 leading-relaxed">
          <strong>Política de tolerancia:</strong> Mantenemos su mesa reservada hasta 15 minutos después de la hora indicada. Si experimenta demoras, puede comunicarse directamente con nuestro maître al +51 (1) 619-8900.
        </div>

        {/* Action Buttons */}
        <div className="pt-4 border-t border-stone-800 flex flex-col sm:flex-row items-center gap-3">
          <button
            onClick={handlePrint}
            className="w-full sm:w-auto flex-1 px-4 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Imprimir Comprobante Fiscal</span>
          </button>

          <button
            onClick={onGoAdmin}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-amber-300 text-xs font-semibold flex items-center justify-center gap-2 transition-colors border border-amber-500/30 cursor-pointer"
          >
            <span>Ver en Panel Maître</span>
          </button>

          <button
            onClick={onNewReservation}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <span>Nueva Reserva</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};