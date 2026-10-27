import { RestaurantTable, ReservationData, TableStatus } from '../types';

export function calculateTableStatusesForSlot(
  baseTables: RestaurantTable[],
  reservations: ReservationData[],
  selectedDate: string,
  selectedShift: 'almuerzo' | 'cena',
  selectedTime?: string
): RestaurantTable[] {
  const activeReservationsOnDate = reservations.filter(
    (res) => res.date === selectedDate && res.shift === selectedShift && res.status !== 'cancelada'
  );

  return baseTables.map((table) => {
    const matchingReservation = activeReservationsOnDate.find((res) => res.tableId === table.id);

    let calculatedStatus: TableStatus = 'disponible';

    if (matchingReservation) {
      if (matchingReservation.status === 'en_mesa') {
        calculatedStatus = 'ocupada';
      } else {
        calculatedStatus = 'reservada';
      }
    }

    return {
      ...table,
      status: calculatedStatus,
    };
  });
}

export function checkReservationConflict(
  reservations: ReservationData[],
  tableId: string,
  date: string,
  shift: 'almuerzo' | 'cena'
): { hasConflict: boolean; conflictingReservation?: ReservationData } {
  const conflict = reservations.find(
    (res) => res.tableId === tableId && res.date === date && res.shift === shift && res.status !== 'cancelada'
  );

  return {
    hasConflict: !!conflict,
    conflictingReservation: conflict,
  };
}

export function generateReservationCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let randomPart = '';
  for (let i = 0; i < 4; i++) {
    randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `RES-2026-${randomPart}`;
}