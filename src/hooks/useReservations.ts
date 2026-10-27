import { useState, useEffect, useMemo, useCallback } from 'react';
import { RestaurantTable, ReservationData } from '../types';
import { INITIAL_TABLES, INITIAL_RESERVATIONS } from '../data/mockData';
import { calculateTableStatusesForSlot, checkReservationConflict, generateReservationCode } from '../services/reservationService';

export function useReservations() {
  // Carga las reservas guardadas en localStorage o usa las iniciales
  const [reservations, setReservations] = useState<ReservationData[]>(() => {
    try {
      const saved = localStorage.getItem('aura_gourmet_reservations');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      // Ignorar error de parseo
    }
    return INITIAL_RESERVATIONS;
  });

  // Guarda en localStorage permanentemente cada vez que se crea o cancela una reserva
  useEffect(() => {
    try {
      localStorage.setItem('aura_gourmet_reservations', JSON.stringify(reservations));
    } catch (e) {
      // Ignorar error
    }
  }, [reservations]);

  const [baseTables] = useState<RestaurantTable[]>(INITIAL_TABLES);
  
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [selectedShift, setSelectedShift] = useState<'almuerzo' | 'cena'>('cena');
  const [selectedTime, setSelectedTime] = useState<string>('20:00');
  const [selectedGuests, setSelectedGuests] = useState<number>(2);
  const [selectedZone, setSelectedZone] = useState<string>('all');
  
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showNotification = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setNotification({ message, type });
    const timer = setTimeout(() => {
      setNotification(null);
    }, 4500);
    return () => clearTimeout(timer);
  }, []);

  const computedTables = useMemo(() => {
    return calculateTableStatusesForSlot(baseTables, reservations, selectedDate, selectedShift, selectedTime);
  }, [baseTables, reservations, selectedDate, selectedShift, selectedTime]);

  useEffect(() => {
    if (selectedTableId) {
      const currentSelectedTable = computedTables.find((t) => t.id === selectedTableId);
      if (currentSelectedTable && currentSelectedTable.status !== 'disponible') {
        setSelectedTableId(null);
        showNotification(
          `La mesa ${currentSelectedTable.number} no está disponible para la fecha/horario seleccionado. Por favor elija otra mesa.`,
          'info'
        );
      }
    }
  }, [selectedDate, selectedShift, computedTables, selectedTableId, showNotification]);

  const selectedTable = useMemo(() => {
    return computedTables.find((t) => t.id === selectedTableId) || null;
  }, [computedTables, selectedTableId]);

  const stats = useMemo(() => {
    const totalTables = computedTables.length;
    const disponibles = computedTables.filter((t) => t.status === 'disponible').length;
    const reservadas = computedTables.filter((t) => t.status === 'reservada').length;
    const ocupadas = computedTables.filter((t) => t.status === 'ocupada').length;
    const occupancyPercentage = Math.round(((totalTables - disponibles) / totalTables) * 100);
    const activeReservationsCount = reservations.filter((r) => r.status !== 'cancelada').length;

    return {
      totalTables,
      disponibles,
      reservadas,
      ocupadas,
      occupancyPercentage,
      activeReservationsCount,
    };
  }, [computedTables, reservations]);

  const createReservation = useCallback((data: {
    customerName: string;
    email: string;
    phone: string;
    notes?: string;
    date: string;
    time: string;
    shift: 'almuerzo' | 'cena';
    guests: number;
    tableId: string;
  }): { success: boolean; reservation?: ReservationData; error?: string } => {
    const targetTable = computedTables.find((t) => t.id === data.tableId);
    if (!targetTable) {
      return { success: false, error: 'Mesa no encontrada en el restaurante.' };
    }

    if (data.guests > targetTable.capacity) {
      return {
        success: false,
        error: `La mesa seleccionada tiene capacidad para ${targetTable.capacity} personas, pero solicitó para ${data.guests}.`,
      };
    }

    const { hasConflict, conflictingReservation } = checkReservationConflict(
      reservations,
      data.tableId,
      data.date,
      data.shift
    );

    if (hasConflict) {
      return {
        success: false,
        error: `Conflicto de horario: La mesa ${targetTable.number} ya se encuentra reservada para ${data.date} (${data.shift}). Código previo: ${conflictingReservation?.code}.`,
      };
    }

    const newReservation: ReservationData = {
      id: `res-${Date.now()}`,
      code: generateReservationCode(),
      customerName: data.customerName.trim(),
      email: data.email.trim(),
      phone: data.phone.trim(),
      notes: data.notes?.trim() || '',
      date: data.date,
      time: data.time,
      shift: data.shift,
      guests: data.guests,
      tableId: targetTable.id,
      tableNumber: targetTable.number,
      tableZone: targetTable.zoneName,
      tableCapacity: targetTable.capacity,
      status: 'confirmada',
      createdAt: new Date().toLocaleString('es-PE', {
        dateStyle: 'short',
        timeStyle: 'short',
      }),
    };

    setReservations((prev) => [newReservation, ...prev]);
    showNotification(`¡Reserva ${newReservation.code} confirmada con éxito! Mesa ${newReservation.tableNumber} asignada.`, 'success');
    return { success: true, reservation: newReservation };
  }, [computedTables, reservations, showNotification]);

  const updateReservationStatus = useCallback((
    reservationId: string,
    newStatus: 'confirmada' | 'en_mesa' | 'completada' | 'cancelada'
  ) => {
    setReservations((prev) =>
      prev.map((r) => (r.id === reservationId ? { ...r, status: newStatus } : r))
    );
    showNotification(`Estado de reserva actualizado a "${newStatus.replace('_', ' ')}".`, 'info');
  }, [showNotification]);

  // Cancelar reserva y liberar la mesa inmediatamente
  const cancelReservation = useCallback((reservationId: string) => {
    setReservations((prev) =>
      prev.map((r) => (r.id === reservationId ? { ...r, status: 'cancelada' } : r))
    );
    showNotification('La reserva ha sido cancelada y la mesa ha quedado liberada.', 'info');
  }, [showNotification]);

  const resetToInitialData = useCallback(() => {
    try {
      localStorage.removeItem('aura_gourmet_reservations');
    } catch (e) {
      // Ignorar
    }
    setReservations(INITIAL_RESERVATIONS);
    setSelectedTableId(null);
    showNotification('Datos de demostración restablecidos a los valores iniciales.', 'info');
  }, [showNotification]);

  return {
    reservations,
    tables: computedTables,
    stats,
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
    createReservation,
    updateReservationStatus,
    cancelReservation,
    resetToInitialData,
    notification,
    showNotification,
  };
}