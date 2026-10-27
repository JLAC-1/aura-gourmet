import React from 'react';
import { RestaurantTable } from '../types';
import { Users, CheckCircle2, Lock, Clock } from 'lucide-react';

interface TableCardProps {
  table: RestaurantTable;
  isSelected: boolean;
  onSelect: (table: RestaurantTable) => void;
  guestCount?: number;
}

export const TableCard: React.FC<TableCardProps> = ({
  table,
  isSelected,
  onSelect,
  guestCount = 2,
}) => {
  const isAvailable = table.status === 'disponible';
  const isReserved = table.status === 'reservada';
  const fitsGuests = !guestCount || table.capacity >= guestCount;

  const getStatusBadge = () => {
    if (isAvailable) {
      return (
        <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
          <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
          Disponible
        </span>
      );
    }
    if (isReserved) {
      return (
        <span className="flex items-center gap-1.5 text-xs font-semibold text-amber-400">
          <Clock className="w-3.5 h-3.5 text-amber-400" />
          Reservada
        </span>
      );
    }
    return (
      <span className="flex items-center gap-1.5 text-xs font-semibold text-rose-400">
        <Lock className="w-3.5 h-3.5 text-rose-400" />
        Ocupada
      </span>
    );
  };

  return (
    <div
      onClick={() => {
        if (isAvailable && fitsGuests) onSelect(table);
      }}
      className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
        isSelected
          ? 'border-amber-400 ring-2 ring-amber-400/40 bg-stone-800'
          : !isAvailable || !fitsGuests
          ? 'border-stone-800/80 bg-stone-900/40 opacity-70 cursor-not-allowed'
          : 'border-stone-800 bg-stone-900 hover:border-stone-600'
      }`}
    >
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-base font-bold text-stone-100 font-serif-display">
            Mesa {table.number}
          </span>
          {getStatusBadge()}
        </div>

        <div className="text-xs text-stone-400 space-y-1 mb-2">
          <p><span className="text-stone-500">Ubicación:</span> {table.zoneName}</p>
          <p className="flex items-center gap-1">
            <Users className="w-3.5 h-3.5 text-amber-400" />
            <span>Capacidad: {table.capacity} personas</span>
          </p>
        </div>
      </div>

      <div className="pt-2 border-t border-stone-800 flex items-center justify-between text-xs">
        {isSelected ? (
          <span className="font-semibold text-amber-400 flex items-center gap-1">
            <CheckCircle2 className="w-4 h-4 text-amber-400" />
            Seleccionada
          </span>
        ) : isAvailable && fitsGuests ? (
          <span className="text-amber-300 font-medium">Elegir mesa →</span>
        ) : (
          <span className="text-stone-500">No disponible</span>
        )}
      </div>
    </div>
  );
};