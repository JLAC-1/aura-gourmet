import { useState, useEffect, useMemo, useCallback } from 'react';
import { RestaurantTable, ReservationData, TableStatus, SelectedDishItem, PaymentData } from '../types';
import { INITIAL_TABLES, INITIAL_RESERVATIONS } from '../data/mockData';
import { calculateTableStatusesForSlot, checkReservationConflict, generateReservationCode } from '../services/reservationService';

export function useReservations() {
  const [reservations, setReservations] = useState<ReservationData[]>(() => {
    try {
      const saved = localStorage.getItem('aura_gourmet_reservations');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      // Fallback to initial mock
    }
    return INITIAL_RESERVATIONS;
  });

  // Keep localStorage in sync whenever reservations change
  useEffect(() => {
    try {
      localStorage.setItem('aura_gourmet_reservations', JSON.stringify(reservations));
    } catch (e) {
      // ignore
    }
  }, [reservations]);

  const [baseTables] = useState<RestaurantTable[]>(INITIAL_TABLES);
  
  // Current slot being viewed or booked
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [selectedShift, setSelectedShift] = useState<'almuerzo' | 'cena'>('cena');
  const [selectedTime, setSelectedTime] = useState<string>('20:00');
  const [selectedGuests, setSelectedGuests] = useState<number>(2);
  const [selectedZone, setSelectedZone] = useState<string>('all');
  
  // Selected table ID by user
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);

  // Success / alert notifications for UX feedback
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showNotification = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setNotification({ message, type });
    const timer = setTimeout(() => {
      setNotification(null);
    }, 4500);
    return () => clearTimeout(timer);
  }, []);

  // Recalculate dynamic tables whenever selectedDate, selectedShift or reservations change
  const computedTables = useMemo(() => {
    return calculateTableStatusesForSlot(baseTables, reservations, selectedDate, selectedShift, selectedTime);
  }, [baseTables, reservations, selectedDate, selectedShift, selectedTime]);

  // Effect to reset selected table if it becomes unavailable when changing date/shift
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

  // Selected table object
  const selectedTable = useMemo(() => {
    return computedTables.find((t) => t.id === selectedTableId) || null;
  }, [computedTables, selectedTableId]);

  // Statistics calculation for admin and overview
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

  // Create a new reservation
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
    selectedDishes?: SelectedDishItem[];
    payment?: PaymentData;
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

    // Check conflict
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
      selectedDishes: data.selectedDishes || [],
      payment: data.payment,
    };

    setReservations((prev) => [newReservation, ...prev]);
    showNotification(`¡Reserva ${newReservation.code} confirmada con éxito! Mesa ${newReservation.tableNumber} asignada.`, 'success');
    return { success: true, reservation: newReservation };
  }, [computedTables, reservations, showNotification]);

  // Update status (e.g. from Admin panel: en_mesa, completada, cancelada)
  const updateReservationStatus = useCallback((
    reservationId: string,
    newStatus: 'confirmada' | 'en_mesa' | 'completada' | 'cancelada'
  ) => {
    setReservations((prev) =>
      prev.map((r) => (r.id === reservationId ? { ...r, status: newStatus } : r))
    );
    showNotification(`Estado de reserva actualizado a "${newStatus.replace('_', ' ')}".`, 'info');
  }, [showNotification]);

  // Cancel reservation
  const cancelReservation = useCallback((reservationId: string) => {
    setReservations((prev) =>
      prev.map((r) => (r.id === reservationId ? { ...r, status: 'cancelada' } : r))
    );
    showNotification('La reserva ha sido cancelada y la mesa ha quedado liberada.', 'info');
  }, [showNotification]);

  // Reset to default mock data
  const resetToInitialData = useCallback(() => {
    try {
      localStorage.removeItem('aura_gourmet_reservations');
    } catch (e) {
      // ignore
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