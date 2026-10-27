import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Check } from 'lucide-react';

interface InteractiveCalendarProps {
  selectedDate: string;
  onSelectDate: (date: string) => void;
  minDate?: string;
}

export const InteractiveCalendar: React.FC<InteractiveCalendarProps> = ({
  selectedDate,
  onSelectDate,
  minDate,
}) => {
  const initialDate = selectedDate ? new Date(selectedDate + 'T00:00:00') : new Date();
  const [currentYear, setCurrentYear] = useState<number>(initialDate.getFullYear());
  const [currentMonth, setCurrentMonth] = useState<number>(initialDate.getMonth());

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const weekDayHeaders = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  const getOffsetDateStr = (days: number) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d.toISOString().split('T')[0];
  };

  const tomorrowStr = getOffsetDateStr(1);
  const dayAfterTomorrowStr = getOffsetDateStr(2);
  const weekendStr = (() => {
    const d = new Date();
    const dayOfWeek = d.getDay();
    const daysUntilSaturday = (6 - dayOfWeek + 7) % 7 || 7;
    d.setDate(d.getDate() + daysUntilSaturday);
    return d.toISOString().split('T')[0];
  })();

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
  let firstDayIndex = firstDayOfMonth.getDay() - 1;
  if (firstDayIndex === -1) firstDayIndex = 6;

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  const daysArray = [];
  for (let i = 0; i < firstDayIndex; i++) {
    daysArray.push(null);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    const monthStr = String(currentMonth + 1).padStart(2, '0');
    const dayStr = String(day).padStart(2, '0');
    daysArray.push({
      dayNumber: day,
      dateString: `${currentYear}-${monthStr}-${dayStr}`,
    });
  }

  const selectedDateObj = new Date(selectedDate + 'T00:00:00');
  const selectedDateFormatted = !isNaN(selectedDateObj.getTime())
    ? selectedDateObj.toLocaleDateString('es-PE', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : selectedDate;

  return (
    <div className="bg-stone-950 border border-stone-800 rounded-2xl p-5 shadow-lg select-none">
      
      {/* Botones rápidos */}
      <div className="mb-4 pb-4 border-b border-stone-800/80">
        <span className="text-[11px] text-stone-400 font-semibold uppercase tracking-wider block mb-2">
          Atajos rápidos de selección:
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          <button
            type="button"
            onClick={() => onSelectDate(todayStr)}
            className={`py-2 px-3 rounded-xl border text-center transition-all font-medium ${
              selectedDate === todayStr
                ? 'bg-amber-400 text-stone-950 border-amber-400 font-bold'
                : 'bg-stone-900 border-stone-800 text-stone-300 hover:border-stone-700'
            }`}
          >
            Hoy ({todayStr.slice(8)})
          </button>

          <button
            type="button"
            onClick={() => onSelectDate(tomorrowStr)}
            className={`py-2 px-3 rounded-xl border text-center transition-all font-medium ${
              selectedDate === tomorrowStr
                ? 'bg-amber-400 text-stone-950 border-amber-400 font-bold'
                : 'bg-stone-900 border-stone-800 text-stone-300 hover:border-stone-700'
            }`}
          >
            Mañana ({tomorrowStr.slice(8)})
          </button>

          <button
            type="button"
            onClick={() => onSelectDate(dayAfterTomorrowStr)}
            className={`py-2 px-3 rounded-xl border text-center transition-all font-medium ${
              selectedDate === dayAfterTomorrowStr
                ? 'bg-amber-400 text-stone-950 border-amber-400 font-bold'
                : 'bg-stone-900 border-stone-800 text-stone-300 hover:border-stone-700'
            }`}
          >
            En 2 días
          </button>

          <button
            type="button"
            onClick={() => onSelectDate(weekendStr)}
            className={`py-2 px-3 rounded-xl border text-center transition-all font-medium ${
              selectedDate === weekendStr
                ? 'bg-amber-400 text-stone-950 border-amber-400 font-bold'
                : 'bg-stone-900 border-stone-800 text-stone-300 hover:border-stone-700'
            }`}
          >
            Fin de Semana
          </button>
        </div>
      </div>

      {/* Cabecera del Mes */}
      <div className="flex items-center justify-between mb-3 px-1">
        <button
          type="button"
          onClick={handlePrevMonth}
          className="p-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-stone-300 transition-colors border border-stone-800"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <span className="font-serif-display text-base font-bold text-stone-100 capitalize">
          {monthNames[currentMonth]} {currentYear}
        </span>

        <button
          type="button"
          onClick={handleNextMonth}
          className="p-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-stone-300 transition-colors border border-stone-800"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Días de la semana */}
      <div className="grid grid-cols-7 gap-1 text-center mb-1 text-[11px] font-semibold text-stone-500 uppercase">
        {weekDayHeaders.map((day) => (
          <div key={day} className="py-1">{day}</div>
        ))}
      </div>

      {/* Cuadrícula de días */}
      <div className="grid grid-cols-7 gap-1 text-center">
        {daysArray.map((item, idx) => {
          if (!item) return <div key={`empty-${idx}`} className="h-9 sm:h-10" />;

          const isSelected = item.dateString === selectedDate;
          const isPast = minDate ? item.dateString < minDate : item.dateString < todayStr;
          const isToday = item.dateString === todayStr;

          return (
            <button
              key={item.dateString}
              type="button"
              disabled={isPast}
              onClick={() => onSelectDate(item.dateString)}
              className={`h-9 sm:h-10 rounded-xl text-xs flex flex-col items-center justify-center relative transition-all ${
                isSelected
                  ? 'bg-amber-400 text-stone-950 font-bold shadow-md scale-105'
                  : isPast
                  ? 'text-stone-600 opacity-40 cursor-not-allowed'
                  : isToday
                  ? 'bg-stone-850 text-amber-300 border border-amber-500/40 font-semibold'
                  : 'bg-stone-900/60 text-stone-300 hover:bg-stone-800 border border-stone-800/40'
              }`}
            >
              <span>{item.dayNumber}</span>
              {isToday && !isSelected && (
                <span className="w-1 h-1 rounded-full bg-amber-400 absolute bottom-1" />
              )}
            </button>
          );
        })}
      </div>

      {/* Indicador de fecha activa */}
      <div className="mt-4 pt-3 border-t border-stone-800/80 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-4 h-4 text-amber-400" />
          <span className="text-stone-400">Día seleccionado:</span>
          <span className="text-amber-300 font-bold capitalize">{selectedDateFormatted}</span>
        </div>
        <span className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
          <Check className="w-3.5 h-3.5" />
          Activo
        </span>
      </div>

    </div>
  );
};