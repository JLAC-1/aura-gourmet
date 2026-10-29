export type TableStatus = 'disponible' | 'ocupada' | 'reservada';

export type RestaurantZone = 'ventanales' | 'salon_principal' | 'terraza' | 'vip' | 'barra';

export interface RestaurantTable {
  id: string;
  number: number;
  capacity: number;
  zone: RestaurantZone;
  zoneName: string;
  status: TableStatus;
  x: number; // percentage coordinate in floor plan
  y: number; // percentage coordinate in floor plan
  width?: number;
  height?: number;
  shape: 'round' | 'rect' | 'booth';
  features: string[];
  description: string;
}

export interface SelectedDishItem {
  dishId: string;
  name: string;
  price: number;
  quantity: number;
  category: string;
  image?: string;
}

export interface PaymentData {
  cardLast4: string;
  cardBrand: 'visa' | 'mastercard' | 'amex' | 'otra';
  cardHolder: string;
  depositAmount: number; // Monto de garantía por comensal
  dishesAmount: number;  // Subtotal de platos seleccionados
  totalPaid: number;     // Total cobrado
  transactionId: string;
  paidAt: string;
  status: 'aprobado';
}

export interface ReservationData {
  id: string;
  code: string;
  customerName: string;
  email: string;
  phone: string;
  notes?: string;
  date: string; // YYYY-MM-DD
  time: string; // e.g., "19:30"
  shift: 'almuerzo' | 'cena';
  guests: number;
  tableId: string;
  tableNumber: number;
  tableZone: string;
  tableCapacity: number;
  status: 'confirmada' | 'en_mesa' | 'completada' | 'cancelada';
  createdAt: string;
  selectedDishes?: SelectedDishItem[];
  payment?: PaymentData;
}

export interface MenuItem {
  id: string;
  name: string;
  category: 'entradas' | 'principales' | 'bebidas' | 'postres';
  description: string;
  price: number;
  image: string;
  status?: 'activo' | 'inactivo'; 
  badge?: string;
  isChefSpecial?: boolean;
  dietary?: string[];
  prepTime?: string;
}

export interface UsabilityTestResult {
  id: string;
  task: string;
  completionRate: number; // e.g. 96%
  avgTimeSeconds: number;
  initialIssues: string;
  implementedImprovement: string;
  uxPrinciple: string;
}

// Runtime value exports so Vite in development never throws missing named export SyntaxError
export const RestaurantTable = {};
export const ReservationData = {};
export const MenuItem = {};
export const UsabilityTestResult = {};
export const TableStatus = {};
export const RestaurantZone = {};