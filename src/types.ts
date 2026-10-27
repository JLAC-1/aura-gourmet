export type TableStatus = 'disponible' | 'ocupada' | 'reservada';

export type RestaurantZone = 'ventanales' | 'salon_principal' | 'terraza' | 'vip' | 'barra';

export interface RestaurantTable {
  id: string;
  number: number;
  capacity: number;
  zone: RestaurantZone;
  zoneName: string;
  status: TableStatus;
  x: number;
  y: number;
  width?: number;
  height?: number;
  shape: 'round' | 'rect' | 'booth';
  features: string[];
  description: string;
}

export interface ReservationData {
  id: string;
  code: string;
  customerName: string;
  email: string;
  phone: string;
  notes?: string;
  date: string;
  time: string;
  shift: 'almuerzo' | 'cena';
  guests: number;
  tableId: string;
  tableNumber: number;
  tableZone: string;
  tableCapacity: number;
  status: 'confirmada' | 'en_mesa' | 'completada' | 'cancelada';
  createdAt: string;
}

export interface MenuItem {
  id: string;
  name: string;
  category: 'entradas' | 'principales' | 'bebidas' | 'postres';
  description: string;
  price: number;
  image: string;
  badge?: string;
  isChefSpecial?: boolean;
  dietary?: string[];
  prepTime?: string;
}

export interface UsabilityTestResult {
  id: string;
  task: string;
  completionRate: number;
  avgTimeSeconds: number;
  initialIssues: string;
  implementedImprovement: string;
  uxPrinciple: string;
}

// Exportaciones en tiempo de ejecución para total compatibilidad con Vite
export const RestaurantTable = {};
export const ReservationData = {};
export const MenuItem = {};
export const UsabilityTestResult = {};
export const TableStatus = {};
export const RestaurantZone = {};