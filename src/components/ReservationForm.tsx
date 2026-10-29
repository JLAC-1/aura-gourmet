import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { RestaurantTable, ReservationData, MenuItem, SelectedDishItem, PaymentData } from '../types';
import { RestaurantMap } from './RestaurantMap';
import { InteractiveCalendar } from './InteractiveCalendar';
import { TIME_SLOTS, MENU_ITEMS } from '../data/mockData';
import {
  User,
  Mail,
  Phone,
  Calendar as CalendarIcon,
  Clock,
  Users,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Edit2,
  CreditCard,
  ShieldCheck,
  Lock,
  Utensils,
  Plus,
  Minus,
  Trash2,
  Sparkles,
  Info,
  Check,
} from 'lucide-react';

interface ReservationFormProps {
  tables: RestaurantTable[];
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  selectedShift: 'almuerzo' | 'cena';
  setSelectedShift: (shift: 'almuerzo' | 'cena') => void;
  selectedTime: string;
  setSelectedTime: (time: string) => void;
  selectedGuests: number;
  setSelectedGuests: (guests: number) => void;
  selectedZone: string;
  setSelectedZone: (zone: string) => void;
  selectedTableId: string | null;
  setSelectedTableId: (id: string | null) => void;
  selectedTable: RestaurantTable | null;
  initialSelectedDish?: MenuItem | null;
  onClearInitialSelectedDish?: () => void;
  onCreateReservation: (data: {
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
  }) => { success: boolean; reservation?: ReservationData; error?: string };
  onReservationComplete: (reservation: ReservationData) => void;
}

export const ReservationForm: React.FC<ReservationFormProps> = ({
  tables,
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
  initialSelectedDish,
  onClearInitialSelectedDish,
  onCreateReservation,
  onReservationComplete,
}) => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  
  // Paso 1: Contacto
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    notes: '',
  });

  // Paso 4: Platos seleccionados
  const [selectedDishes, setSelectedDishes] = useState<SelectedDishItem[]>([]);
  const [dishCategoryFilter, setDishCategoryFilter] = useState<string>('all');

  // Paso 5: Tarjeta y Pago de Garantía
  const [cardData, setCardData] = useState({
    cardNumber: '',
    cardHolder: '',
    expiry: '',
    cvv: '',
    acceptedTerms: false,
  });
  const [isProcessingPayment, setIsProcessingPayment] = useState<boolean>(false);
  const [paymentSuccessAnim, setPaymentSuccessAnim] = useState<boolean>(false);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Si se eligió un plato desde la carta principal
  useEffect(() => {
    if (initialSelectedDish) {
      setSelectedDishes((prev) => {
        const exists = prev.find((d) => d.dishId === initialSelectedDish.id);
        if (exists) return prev;
        return [
          ...prev,
          {
            dishId: initialSelectedDish.id,
            name: initialSelectedDish.name,
            price: initialSelectedDish.price,
            quantity: 1,
            category: initialSelectedDish.category,
            image: initialSelectedDish.image,
          },
        ];
      });
      if (onClearInitialSelectedDish) onClearInitialSelectedDish();
    }
  }, [initialSelectedDish, onClearInitialSelectedDish]);

  // Cálculos del Depósito de Garantía
  const DEPOSIT_PER_GUEST = 30.0; // S/. 30.00 por comensal (100% deducible)
  const depositAmount = selectedGuests * DEPOSIT_PER_GUEST;
  const dishesAmount = selectedDishes.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalAmountToPay = depositAmount + dishesAmount;

  // Algoritmo de Luhn bancario con soporte de tarjetas demo
  const isValidLuhn = (numStr: string): boolean => {
    const digits = numStr.replace(/\D/g, '');
    if (digits.length < 13 || digits.length > 19) return false;
    if (digits === '4242424242424242' || digits === '4532882014924242' || digits === '4532882014924245') {
      return true;
    }
    let sum = 0;
    let shouldDouble = false;
    for (let i = digits.length - 1; i >= 0; i--) {
      let digit = parseInt(digits.charAt(i), 10);
      if (shouldDouble) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }
      sum += digit;
      shouldDouble = !shouldDouble;
    }
    return sum % 10 === 0;
  };

  // Detección de marca de tarjeta
  const detectCardBrand = (num: string): 'visa' | 'mastercard' | 'amex' | 'otra' => {
    const clean = num.replace(/\s+/g, '');
    if (clean.startsWith('4')) return 'visa';
    if (/^(5[1-5]|2[2-7])/.test(clean)) return 'mastercard';
    if (/^3[47]/.test(clean)) return 'amex';
    return 'otra';
  };

  const cardBrand = detectCardBrand(cardData.cardNumber);

  // Formateador de tarjeta (espacio cada 4 dígitos)
  const handleCardNumberChange = (val: string) => {
    const cleaned = val.replace(/\D/g, '').slice(0, 16);
    const parts = cleaned.match(/[\s\S]{1,4}/g) || [];
    setCardData({ ...cardData, cardNumber: parts.join(' ') });
    if (errors.cardNumber) setErrors((prev) => ({ ...prev, cardNumber: '' }));
  };

  // Formateador de expiración (MM/AA)
  const handleExpiryChange = (val: string) => {
    let cleaned = val.replace(/\D/g, '').slice(0, 4);
    if (cleaned.length >= 3) {
      cleaned = `${cleaned.slice(0, 2)}/${cleaned.slice(2)}`;
    }
    setCardData({ ...cardData, expiry: cleaned });
    if (errors.expiry) setErrors((prev) => ({ ...prev, expiry: '' }));
  };

  // Gestión de platos
  const handleAddDish = (dish: MenuItem) => {
    setSelectedDishes((prev) => {
      const existing = prev.find((d) => d.dishId === dish.id);
      if (existing) {
        return prev.map((d) => (d.dishId === dish.id ? { ...d, quantity: d.quantity + 1 } : d));
      }
      return [
        ...prev,
        {
          dishId: dish.id,
          name: dish.name,
          price: dish.price,
          quantity: 1,
          category: dish.category,
          image: dish.image,
        },
      ];
    });
  };

  const handleUpdateDishQuantity = (dishId: string, delta: number) => {
    setSelectedDishes((prev) =>
      prev
        .map((item) => {
          if (item.dishId === dishId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter((item): item is SelectedDishItem => item !== null)
    );
  };

  const handleRemoveDish = (dishId: string) => {
    setSelectedDishes((prev) => prev.filter((d) => d.dishId !== dishId));
  };

  // Autocompletar datos de demostración
  const handleFillDemoCard = () => {
    setCardData({
      cardNumber: '4242 4242 4242 4242',
      cardHolder: formData.name ? formData.name.toUpperCase() : 'CARLOS MENDOZA PAZ',
      expiry: '12/28',
      cvv: '842',
      acceptedTerms: true,
    });
    setErrors({});
    setSubmitError(null);
  };

  // Validaciones por paso
  const validateStep1 = () => {
    const errs: Record<string, string> = {};
    if (!formData.name.trim()) {
      errs.name = 'El nombre completo es obligatorio';
    } else if (formData.name.trim().length < 3) {
      errs.name = 'Ingrese un nombre válido';
    }

    if (!formData.email.trim()) {
      errs.email = 'El correo electrónico es obligatorio';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errs.email = 'Ingrese un correo electrónico válido';
    }

    const cleanPhone = formData.phone.replace(/\D/g, '');
    if (!cleanPhone) {
      errs.phone = 'El número de celular es obligatorio';
    } else if (!/^9\d{8}$/.test(cleanPhone)) {
      errs.phone = 'El celular debe tener 9 dígitos y empezar con 9 (ej. 987 654 321)';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateStep2 = () => {
    const errs: Record<string, string> = {};
    if (!selectedDate) {
      errs.date = 'Seleccione una fecha de reserva en el calendario';
    }
    if (!selectedTime) {
      errs.time = 'Seleccione una hora válida';
    }
    if (selectedGuests < 1 || selectedGuests > 10) {
      errs.guests = 'Seleccione entre 1 y 10 comensales';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateStep3 = () => {
    const errs: Record<string, string> = {};
    if (!selectedTableId || !selectedTable) {
      errs.table = 'Debe seleccionar una mesa disponible en el plano interactivo';
    } else if (selectedTable.status !== 'disponible') {
      errs.table = 'La mesa seleccionada no está disponible para este horario';
    } else if (selectedGuests > selectedTable.capacity) {
      errs.table = `La mesa ${selectedTable.number} solo soporta hasta ${selectedTable.capacity} comensales.`;
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateStep5 = () => {
    const errs: Record<string, string> = {};
    const cleanNum = cardData.cardNumber.replace(/\s+/g, '');
    if (!cleanNum || cleanNum.length < 15) {
      errs.cardNumber = 'Ingrese un número de tarjeta válido (16 dígitos)';
    } else if (!isValidLuhn(cleanNum)) {
      errs.cardNumber = 'Número de tarjeta inválido (falla la verificación del algoritmo bancario Luhn)';
    }

    if (!cardData.cardHolder.trim() || cardData.cardHolder.trim().length < 3) {
      errs.cardHolder = 'Ingrese el nombre del titular tal como figura en la tarjeta';
    }

    if (!cardData.expiry || !/^(0[1-9]|1[0-2])\/\d{2}$/.test(cardData.expiry)) {
      errs.expiry = 'Formato inválido (MM/AA)';
    }

    if (!cardData.cvv || cardData.cvv.length < 3) {
      errs.cvv = 'CVV inválido (3 o 4 dígitos)';
    }

    if (!cardData.acceptedTerms) {
      errs.acceptedTerms = 'Debe autorizar el depósito de garantía de reserva para continuar';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    setSubmitError(null);
    if (currentStep === 1) {
      if (validateStep1()) setCurrentStep(2);
    } else if (currentStep === 2) {
      if (validateStep2()) setCurrentStep(3);
    } else if (currentStep === 3) {
      if (validateStep3()) setCurrentStep(4);
    } else if (currentStep === 4) {
      setCurrentStep(5);
    }
  };

  const handlePrev = () => {
    setSubmitError(null);
    if (currentStep > 1) setCurrentStep((prev) => prev - 1);
  };

  // Procesar Pago y Reserva
  const handleProcessPaymentAndConfirm = () => {
    if (!selectedTable) {
      setSubmitError('Por favor seleccione una mesa válida.');
      return;
    }

    if (!validateStep5()) {
      setSubmitError('Debe ingresar y validar los datos de su tarjeta para afianzar el depósito de garantía.');
      return;
    }

    setIsProcessingPayment(true);
    setSubmitError(null);

    setTimeout(() => {
      const cleanNum = cardData.cardNumber.replace(/\s+/g, '');
      const last4 = cleanNum.slice(-4) || '4242';
      const txnCode = `TXN-AURA-${Math.floor(100000 + Math.random() * 900000)}`;

      const paymentObj: PaymentData = {
        cardLast4: last4,
        cardBrand: cardBrand,
        cardHolder: cardData.cardHolder.trim().toUpperCase(),
        depositAmount,
        dishesAmount,
        totalPaid: totalAmountToPay,
        transactionId: txnCode,
        paidAt: new Date().toLocaleString('es-PE', { dateStyle: 'short', timeStyle: 'short' }),
        status: 'aprobado',
      };

      const res = onCreateReservation({
        customerName: formData.name,
        email: formData.email,
        phone: formData.phone,
        notes: formData.notes,
        date: selectedDate,
        time: selectedTime,
        shift: selectedShift,
        guests: selectedGuests,
        tableId: selectedTable.id,
        selectedDishes,
        payment: paymentObj,
      });

      setIsProcessingPayment(false);

      if (res.success && res.reservation) {
        setPaymentSuccessAnim(true);
        try {
          confetti({
            particleCount: 90,
            spread: 80,
            origin: { y: 0.6 },
            colors: ['#f59e0b', '#10b981', '#fbbf24', '#ffffff'],
          });
        } catch (e) {
          // Fallback silencioso
        }

        setTimeout(() => {
          onReservationComplete(res.reservation!);
        }, 900);
      } else {
        setSubmitError(res.error || 'La pasarela bancaria rechazó la transacción. Intente nuevamente.');
      }
    }, 1300);
  };

  const todayStr = new Date().toISOString().split('T')[0];

  const stepsList = [
    { step: 1, label: 'Datos Personales' },
    { step: 2, label: 'Calendario y Turno' },
    { step: 3, label: 'Plano y Mesa' },
    { step: 4, label: 'Carta y Platos' },
    { step: 5, label: 'Garantía con Tarjeta' },
  ];

  const filteredMenuItems = MENU_ITEMS.filter((item) => {
    if (dishCategoryFilter === 'all') return true;
    return item.category === dishCategoryFilter;
  });

  return (
    <div className="bg-stone-900 border border-stone-800 rounded-2xl shadow-2xl overflow-hidden">
      
      {/* Barra de progreso de 5 pasos */}
      <div className="bg-stone-950 px-3 sm:px-6 py-5 border-b border-stone-800">
        <div className="flex items-center justify-between max-w-4xl mx-auto overflow-x-auto no-scrollbar">
          {stepsList.map((item, idx) => (
            <div key={item.step} className="flex items-center shrink-0">
              <div className="flex flex-col items-center">
                <div
                  className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                    currentStep === item.step
                      ? 'bg-amber-400 text-stone-950 ring-4 ring-amber-400/20'
                      : currentStep > item.step
                      ? 'bg-emerald-500 text-stone-950 font-bold'
                      : 'bg-stone-800 text-stone-400 border border-stone-700'
                  }`}
                >
                  {currentStep > item.step ? '✓' : item.step}
                </div>
                <span
                  className={`text-[10px] sm:text-[11px] font-medium mt-1.5 whitespace-nowrap ${
                    currentStep === item.step
                      ? 'text-amber-300 font-semibold'
                      : currentStep > item.step
                      ? 'text-emerald-400'
                      : 'text-stone-500'
                  }`}
                >
                  {item.label}
                </span>
              </div>
              {idx < stepsList.length - 1 && (
                <div
                  className={`w-6 sm:w-12 md:w-16 h-0.5 mx-1.5 sm:mx-3 transition-colors ${
                    currentStep > item.step ? 'bg-emerald-500' : 'bg-stone-800'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Contenido del paso actual */}
      <div className="p-5 sm:p-8">
        
        {submitError && (
          <div className="mb-6 p-4 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{submitError}</span>
          </div>
        )}

        {/* PASO 1 */}
        {currentStep === 1 && (
          <div className="max-w-xl mx-auto space-y-5 animate-in fade-in duration-300">
            <div className="text-center sm:text-left mb-6">
              <span className="text-xs text-amber-400 font-semibold uppercase tracking-wider block mb-1">
                Paso 1 de 5 · Información del Comensal
              </span>
              <h3 className="font-serif-display text-2xl font-bold text-stone-100">
                Información de Contacto
              </h3>
              <p className="text-xs text-stone-400 mt-1">
                Por favor ingrese sus datos para emitir su código de reserva oficial.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                Nombre y Apellido <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-500">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ej. Sofia Almenara Valdivia"
                  className={`w-full pl-10 pr-4 py-2.5 bg-stone-950 border rounded-xl text-stone-100 placeholder-stone-600 text-sm focus:outline-none focus:ring-2 transition-all ${
                    errors.name ? 'border-rose-500 focus:ring-rose-500/30' : 'border-stone-800 focus:ring-amber-400/40 focus:border-amber-400'
                  }`}
                />
              </div>
              {errors.name && <p className="text-[11px] text-rose-400 mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                Correo Electrónico <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="sofia@ejemplo.com"
                  className={`w-full pl-10 pr-4 py-2.5 bg-stone-950 border rounded-xl text-stone-100 placeholder-stone-600 text-sm focus:outline-none focus:ring-2 transition-all ${
                    errors.email ? 'border-rose-500 focus:ring-rose-500/30' : 'border-stone-800 focus:ring-amber-400/40 focus:border-amber-400'
                  }`}
                />
              </div>
              {errors.email && <p className="text-[11px] text-rose-400 mt-1">{errors.email}</p>}
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-semibold text-stone-300">
                  Celular de Contacto (WhatsApp) <span className="text-rose-400">*</span>
                </label>
                <span className="text-[11px] text-stone-500 font-mono">
                  {formData.phone.length}/9 dígitos
                </span>
              </div>
              <div className="relative flex items-center">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-500">
                  <Phone className="w-4 h-4" />
                </div>
                <div className="absolute left-9.5 text-xs font-semibold text-stone-400 border-r border-stone-800 pr-2 pointer-events-none">
                  +51
                </div>
                <input
                  type="tel"
                  maxLength={9}
                  inputMode="numeric"
                  value={formData.phone}
                  onChange={(e) => {
                    const onlyDigits = e.target.value.replace(/\D/g, '').slice(0, 9);
                    setFormData({ ...formData, phone: onlyDigits });
                    if (errors.phone) setErrors((prev) => ({ ...prev, phone: '' }));
                  }}
                  placeholder="987654321"
                  className={`w-full pl-20 pr-4 py-2.5 bg-stone-950 border rounded-xl text-stone-100 placeholder-stone-600 text-sm focus:outline-none focus:ring-2 transition-all font-mono tracking-wider ${
                    errors.phone ? 'border-rose-500 focus:ring-rose-500/30' : 'border-stone-800 focus:ring-amber-400/40 focus:border-amber-400'
                  }`}
                />
              </div>
              {errors.phone && <p className="text-[11px] text-rose-400 mt-1">{errors.phone}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                Peticiones Especiales u Ocasión (Opcional)
              </label>
              <textarea
                rows={2}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Ej. Cumpleaños, aniversario, preferencia de copa, alergias..."
                className="w-full px-4 py-2 bg-stone-950 border border-stone-800 rounded-xl text-stone-100 placeholder-stone-600 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400 transition-all"
              />
            </div>
          </div>
        )}

        {/* PASO 2 */}
        {currentStep === 2 && (
          <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-300">
            <div className="text-center sm:text-left mb-4">
              <span className="text-xs text-amber-400 font-semibold uppercase tracking-wider block mb-1">
                Paso 2 de 5 · Calendario y Turno
              </span>
              <h3 className="font-serif-display text-2xl font-bold text-stone-100">
                Seleccione el Día y Horario de su Reserva
              </h3>
              <p className="text-xs text-stone-400 mt-1">
                Haga clic en cualquier día del calendario para comprobar disponibilidad inmediata.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-2 flex items-center justify-between">
                <span>1. Elija el Día en el Calendario:</span>
                <span className="text-amber-400 font-mono text-[11px]">
                  Fecha elegida: {selectedDate}
                </span>
              </label>
              <InteractiveCalendar
                selectedDate={selectedDate}
                onSelectDate={(date) => {
                  setSelectedDate(date);
                  setErrors((prev) => ({ ...prev, date: '' }));
                }}
                minDate={todayStr}
              />
              {errors.date && <p className="text-[11px] text-rose-400 mt-1.5">{errors.date}</p>}
            </div>

            <div className="pt-2">
              <label className="block text-xs font-semibold text-stone-300 mb-2">
                2. Seleccione el Turno de Servicio:
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedShift('almuerzo');
                    setSelectedTime('13:30');
                  }}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    selectedShift === 'almuerzo'
                      ? 'border-amber-400 bg-amber-500/10 text-stone-100 ring-2 ring-amber-400/30'
                      : 'border-stone-800 bg-stone-950 text-stone-400 hover:border-stone-700'
                  }`}
                >
                  <span className="text-sm font-bold block text-stone-100">Almuerzo</span>
                  <span className="text-xs text-stone-400 mt-0.5 block">12:30 a 15:30 hrs</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedShift('cena');
                    setSelectedTime('20:00');
                  }}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    selectedShift === 'cena'
                      ? 'border-amber-400 bg-amber-500/10 text-stone-100 ring-2 ring-amber-400/30'
                      : 'border-stone-800 bg-stone-950 text-stone-400 hover:border-stone-700'
                  }`}
                >
                  <span className="text-sm font-bold block text-stone-100">Cena Gourmet</span>
                  <span className="text-xs text-stone-400 mt-0.5 block">19:00 a 23:00 hrs</span>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-2">
                3. Horario Exacto de Llegada:
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {TIME_SLOTS[selectedShift].map((time) => (
                  <button
                    key={time}
                    type="button"
                    onClick={() => setSelectedTime(time)}
                    className={`py-2.5 px-3 text-xs rounded-xl font-medium transition-all ${
                      selectedTime === time
                        ? 'bg-amber-400 text-stone-950 font-bold shadow-sm'
                        : 'bg-stone-950 border border-stone-800 text-stone-300 hover:border-stone-700'
                    }`}
                  >
                    {time} hrs
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-2">
                4. Número de Comensales:
              </label>
              <div className="grid grid-cols-5 gap-2">
                {[1, 2, 4, 6, 8].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setSelectedGuests(num)}
                    className={`py-3 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                      selectedGuests === num
                        ? 'bg-amber-400 text-stone-950 shadow-sm font-bold'
                        : 'bg-stone-950 border border-stone-800 text-stone-300 hover:border-stone-700'
                    }`}
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>{num} {num === 1 ? 'persona' : 'personas'}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* PASO 3 */}
        {currentStep === 3 && (
          <div className="space-y-4 animate-in fade-in duration-300">
            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="text-stone-300">
                  Disponibilidad para:{' '}
                  <strong className="text-amber-300 font-bold">{selectedDate}</strong> ·{' '}
                  <span className="capitalize font-semibold text-stone-200">Turno {selectedShift} ({selectedTime} hrs)</span> ·{' '}
                  <span>{selectedGuests} comensales</span>
                </span>
              </div>
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="text-amber-400 hover:text-amber-300 underline font-semibold flex items-center gap-1 shrink-0 cursor-pointer"
              >
                <Edit2 className="w-3 h-3" />
                <span>Cambiar fecha u hora</span>
              </button>
            </div>

            <div className="text-center sm:text-left mb-2">
              <span className="text-xs text-amber-400 font-semibold uppercase tracking-wider block mb-0.5">
                Paso 3 de 5 · Selección de Mesa
              </span>
              <h3 className="font-serif-display text-2xl font-bold text-stone-100">
                Selección de Mesa en el Plano Interactivo
              </h3>
              <p className="text-xs text-stone-400">
                Haga clic directamente en una mesa disponible (verde) del plano para elegirla.
              </p>
            </div>

            {errors.table && (
              <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{errors.table}</span>
              </div>
            )}

            <RestaurantMap
              tables={tables}
              selectedTableId={selectedTableId}
              onSelectTable={(table) => {
                setSelectedTableId(table.id);
                setErrors((prev) => ({ ...prev, table: '' }));
              }}
              guestCount={selectedGuests}
              activeZoneFilter={selectedZone}
              onZoneFilterChange={setSelectedZone}
            />
          </div>
        )}

        {/* PASO 4: CARTA Y PLATOS */}
        {currentStep === 4 && (
          <div className="space-y-6 animate-in fade-in duration-300 max-w-4xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-stone-800">
              <div>
                <span className="text-xs text-amber-400 font-semibold uppercase tracking-wider block mb-0.5">
                  Paso 4 de 5 · Experiencia Culinaria
                </span>
                <h3 className="font-serif-display text-2xl font-bold text-stone-100 flex items-center gap-2">
                  <Utensils className="w-6 h-6 text-amber-400" />
                  <span>Pre-selección de Platos para los Comensales</span>
                </h3>
                <p className="text-xs text-stone-400 mt-1">
                  Elija con anticipación los platos de nuestra cocina de autor. Puede seleccionar para todos sus comensales o continuar si prefiere ordenar en mesa.
                </p>
              </div>

              <div className="bg-stone-950 border border-amber-500/30 rounded-xl px-4 py-2.5 flex items-center gap-3 shrink-0">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <div className="text-right">
                  <span className="text-[11px] text-stone-400 block">Pre-orden seleccionada:</span>
                  <span className="text-xs font-bold text-amber-300">
                    {selectedDishes.reduce((acc, d) => acc + d.quantity, 0)} platos (S/. {dishesAmount.toFixed(2)})
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar text-xs">
              {[
                { id: 'all', label: 'Toda la Carta' },
                { id: 'entradas', label: 'Entradas' },
                { id: 'principales', label: 'Platos Principales' },
                { id: 'postres', label: 'Postres de Autor' },
                { id: 'bebidas', label: 'Bebidas & Vinos' },
              ].map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setDishCategoryFilter(cat.id)}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer whitespace-nowrap ${
                    dishCategoryFilter === cat.id
                      ? 'bg-amber-400 text-stone-950 font-bold shadow-sm'
                      : 'bg-stone-950 border border-stone-800 text-stone-300 hover:border-stone-700'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredMenuItems.map((dish) => {
                const currentInOrder = selectedDishes.find((d) => d.dishId === dish.id);
                const qty = currentInOrder ? currentInOrder.quantity : 0;

                return (
                  <div
                    key={dish.id}
                    className={`p-3.5 rounded-xl border transition-all flex flex-col justify-between ${
                      qty > 0
                        ? 'bg-stone-950 border-amber-400/60 ring-1 ring-amber-400/30'
                        : 'bg-stone-950/70 border-stone-800/80 hover:border-stone-700'
                    }`}
                  >
                    <div>
                      <div className="relative h-28 rounded-lg overflow-hidden bg-stone-900 mb-2.5">
                        <img
                          src={dish.image}
                          alt={dish.name}
                          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=400&q=80';
                          }}
                        />
                        {dish.badge && (
                          <span className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded bg-stone-950/90 text-amber-400 text-[10px] font-bold border border-amber-400/30">
                            {dish.badge}
                          </span>
                        )}
                        <span className="absolute bottom-1.5 right-1.5 px-2 py-0.5 rounded bg-stone-950/80 text-stone-200 text-[10px] font-mono">
                          {dish.prepTime || '15 min'}
                        </span>
                      </div>

                      <h4 className="text-xs font-bold text-stone-100 line-clamp-1">{dish.name}</h4>
                      <p className="text-[11px] text-stone-400 mt-1 line-clamp-2 leading-tight">
                        {dish.description}
                      </p>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-stone-800/80 flex items-center justify-between">
                      <span className="text-xs font-bold text-amber-400">
                        S/. {dish.price.toFixed(2)}
                      </span>

                      {qty === 0 ? (
                        <button
                          type="button"
                          onClick={() => handleAddDish(dish)}
                          className="px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-400 hover:text-stone-950 text-amber-400 text-[11px] font-bold border border-amber-500/30 transition-all flex items-center gap-1 cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Agregar</span>
                        </button>
                      ) : (
                        <div className="flex items-center gap-1.5 bg-stone-900 border border-amber-400/40 rounded-lg p-0.5">
                          <button
                            type="button"
                            onClick={() => handleUpdateDishQuantity(dish.id, -1)}
                            className="w-6 h-6 rounded bg-stone-800 hover:bg-stone-700 text-stone-200 flex items-center justify-center text-xs cursor-pointer"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-1.5 text-xs font-bold text-amber-300 font-mono">
                            {qty}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleUpdateDishQuantity(dish.id, 1)}
                            className="w-6 h-6 rounded bg-amber-400 hover:bg-amber-300 text-stone-950 flex items-center justify-center text-xs font-bold cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {selectedDishes.length > 0 && (
              <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/30 space-y-2">
                <span className="text-xs font-semibold text-amber-300 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                  Platos incluidos en su orden:
                </span>
                <div className="flex flex-wrap gap-2 pt-1">
                  {selectedDishes.map((item) => (
                    <div
                      key={item.dishId}
                      className="px-2.5 py-1 rounded-lg bg-stone-950 border border-stone-800 text-stone-200 text-xs flex items-center gap-2"
                    >
                      <span className="text-amber-400 font-bold">{item.quantity}x</span>
                      <span>{item.name}</span>
                      <span className="text-stone-400 font-mono">S/. {(item.price * item.quantity).toFixed(2)}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveDish(item.dishId)}
                        className="text-stone-500 hover:text-rose-400 ml-1 cursor-pointer"
                        title="Eliminar plato"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* PASO 5: GARANTÍA CON TARJETA */}
        {currentStep === 5 && selectedTable && (
          <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-300">
            
            <div className="text-center sm:text-left">
              <span className="text-xs text-amber-400 font-semibold uppercase tracking-wider block mb-1">
                Paso 5 de 5 · Depósito de Garantía de Reserva
              </span>
              <h3 className="font-serif-display text-2xl font-bold text-stone-100 flex items-center gap-2">
                <Lock className="w-5 h-5 text-emerald-400" />
                <span>Garantía y Pago Seguro con Tarjeta</span>
              </h3>
              <p className="text-xs text-stone-400 mt-1">
                Para confirmar su mesa en exclusiva y garantizar la preparación de su velada gastronómica, se requiere un depósito de garantía con tarjeta. <strong className="text-amber-300">El importe es 100% deducible de su consumo final</strong> en el restaurante.
              </p>
            </div>

            {/* Botón de Autocompletar Demo */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="text-stone-300">
                  ¿Probando el prototipo para la presentación?
                </span>
              </div>
              <button
                type="button"
                onClick={handleFillDemoCard}
                className="px-3 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold text-[11px] transition-colors cursor-pointer"
              >
                Autocompletar Tarjeta Demo
              </button>
            </div>

            {/* Desglose de Cobro */}
            <div className="p-4 rounded-xl bg-stone-950 border border-stone-800 space-y-3 text-xs">
              <h4 className="font-semibold text-stone-200 border-b border-stone-800 pb-2 flex items-center justify-between">
                <span>Desglose del Depósito de Garantía</span>
                <span className="text-[11px] text-emerald-400 font-mono">100% Deducible en Sala</span>
              </h4>

              <div className="flex justify-between items-center text-stone-300">
                <span>Depósito por Comensal ({selectedGuests} personas × S/. {DEPOSIT_PER_GUEST.toFixed(2)}):</span>
                <span className="font-mono font-semibold text-stone-100">S/. {depositAmount.toFixed(2)}</span>
              </div>

              {selectedDishes.length > 0 && (
                <div className="flex justify-between items-center text-stone-300">
                  <span>Platos Pre-ordenados ({selectedDishes.reduce((a, b) => a + b.quantity, 0)} platos):</span>
                  <span className="font-mono font-semibold text-stone-100">S/. {dishesAmount.toFixed(2)}</span>
                </div>
              )}

              <div className="pt-2 border-t border-stone-800 flex justify-between items-center text-sm">
                <span className="font-bold text-stone-100">Total a Pagar con Tarjeta:</span>
                <span className="font-bold font-mono text-amber-400 text-base">
                  S/. {totalAmountToPay.toFixed(2)}
                </span>
              </div>

              <div className="text-[11px] text-stone-400 italic">
                * Asignación: Mesa #{selectedTable.number} ({selectedTable.zoneName}) · {selectedDate} ({selectedTime} hrs).
              </div>
            </div>

            {/* Tarjeta Visual */}
            <div className="relative p-5 rounded-2xl bg-gradient-to-tr from-stone-950 via-stone-900 to-amber-950/40 border border-amber-500/30 shadow-xl text-stone-200 overflow-hidden">
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-6 rounded bg-amber-400/80 border border-amber-300 shadow-sm" />
                  <span className="text-[10px] tracking-widest uppercase font-mono text-amber-400">
                    Aura Card Secure
                  </span>
                </div>
                <div className="px-2 py-0.5 rounded bg-stone-900 border border-stone-700 text-xs font-bold uppercase tracking-wider text-amber-300">
                  {cardBrand === 'otra' ? 'Tarjeta' : cardBrand.toUpperCase()}
                </div>
              </div>

              <div className="font-mono text-lg sm:text-xl font-bold tracking-widest text-stone-100 mb-4">
                {cardData.cardNumber || '•••• •••• •••• ••••'}
              </div>

              <div className="flex justify-between items-end text-[11px]">
                <div>
                  <span className="text-stone-500 block text-[9px] uppercase">Titular de la Tarjeta</span>
                  <span className="font-semibold text-stone-200">
                    {cardData.cardHolder || formData.name.toUpperCase() || 'NOMBRE TITULAR'}
                  </span>
                </div>
                <div>
                  <span className="text-stone-500 block text-[9px] uppercase">Vence</span>
                  <span className="font-mono font-semibold text-stone-200">
                    {cardData.expiry || 'MM/AA'}
                  </span>
                </div>
              </div>
            </div>

            {/* Formulario de Entrada de Tarjeta */}
            <div className="space-y-4 bg-stone-950 p-5 rounded-2xl border border-stone-800">
              
              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                  Número de Tarjeta de Crédito o Débito <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-500">
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    maxLength={19}
                    value={cardData.cardNumber}
                    onChange={(e) => handleCardNumberChange(e.target.value)}
                    placeholder="4242 4242 4242 4242"
                    className={`w-full pl-10 pr-4 py-2.5 bg-stone-900 border rounded-xl text-stone-100 placeholder-stone-600 text-sm font-mono tracking-wider focus:outline-none focus:ring-2 transition-all ${
                      errors.cardNumber ? 'border-rose-500 focus:ring-rose-500/30' : 'border-stone-800 focus:ring-amber-400/40 focus:border-amber-400'
                    }`}
                  />
                </div>
                {errors.cardNumber && <p className="text-[11px] text-rose-400 mt-1">{errors.cardNumber}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                  Nombre Impreso en la Tarjeta <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={cardData.cardHolder}
                  onChange={(e) => {
                    setCardData({ ...cardData, cardHolder: e.target.value.toUpperCase() });
                    if (errors.cardHolder) setErrors((prev) => ({ ...prev, cardHolder: '' }));
                  }}
                  placeholder="Ej. CARLOS MENDOZA"
                  className={`w-full px-4 py-2.5 bg-stone-900 border rounded-xl text-stone-100 placeholder-stone-600 text-sm uppercase tracking-wide focus:outline-none focus:ring-2 transition-all ${
                    errors.cardHolder ? 'border-rose-500 focus:ring-rose-500/30' : 'border-stone-800 focus:ring-amber-400/40 focus:border-amber-400'
                  }`}
                />
                {errors.cardHolder && <p className="text-[11px] text-rose-400 mt-1">{errors.cardHolder}</p>}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                    Fecha Vencimiento <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    maxLength={5}
                    value={cardData.expiry}
                    onChange={(e) => handleExpiryChange(e.target.value)}
                    placeholder="MM/AA"
                    className={`w-full px-4 py-2.5 bg-stone-900 border rounded-xl text-stone-100 placeholder-stone-600 text-sm font-mono tracking-wider focus:outline-none focus:ring-2 transition-all ${
                      errors.expiry ? 'border-rose-500 focus:ring-rose-500/30' : 'border-stone-800 focus:ring-amber-400/40 focus:border-amber-400'
                    }`}
                  />
                  {errors.expiry && <p className="text-[11px] text-rose-400 mt-1">{errors.expiry}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1.5 flex items-center justify-between">
                    <span>Código CVV <span className="text-rose-400">*</span></span>
                    <span className="text-[10px] text-stone-500">3 dígitos al reverso</span>
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      maxLength={4}
                      value={cardData.cvv}
                      onChange={(e) => {
                        const clean = e.target.value.replace(/\D/g, '').slice(0, 4);
                        setCardData({ ...cardData, cvv: clean });
                        if (errors.cvv) setErrors((prev) => ({ ...prev, cvv: '' }));
                      }}
                      placeholder="•••"
                      className={`w-full px-4 py-2.5 bg-stone-900 border rounded-xl text-stone-100 placeholder-stone-600 text-sm font-mono tracking-widest focus:outline-none focus:ring-2 transition-all ${
                        errors.cvv ? 'border-rose-500 focus:ring-rose-500/30' : 'border-stone-800 focus:ring-amber-400/40 focus:border-amber-400'
                      }`}
                    />
                    <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-stone-500">
                      <Lock className="w-3.5 h-3.5" />
                    </div>
                  </div>
                  {errors.cvv && <p className="text-[11px] text-rose-400 mt-1">{errors.cvv}</p>}
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={cardData.acceptedTerms}
                    onChange={(e) => {
                      setCardData({ ...cardData, acceptedTerms: e.target.checked });
                      if (errors.acceptedTerms) setErrors((prev) => ({ ...prev, acceptedTerms: '' }));
                    }}
                    className="mt-0.5 w-4 h-4 rounded border-stone-700 bg-stone-900 text-amber-500 focus:ring-amber-400/30"
                  />
                  <span className="text-[11px] text-stone-400 leading-tight">
                    Autorizo el cargo de <strong className="text-stone-200">S/. {totalAmountToPay.toFixed(2)}</strong> como depósito de garantía para la reserva de mesa. Entiendo que este importe se descontará en su totalidad de mi cuenta de consumo en el restaurante.
                  </span>
                </label>
                {errors.acceptedTerms && (
                  <p className="text-[11px] text-rose-400 mt-1.5">{errors.acceptedTerms}</p>
                )}
              </div>

            </div>

            <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/30 flex items-center gap-2.5 text-xs text-emerald-300">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                Transacción bancaria protegida con cifrado SSL de 256 bits. Si el pago no es aprobado, la mesa permanece libre.
              </span>
            </div>

          </div>
        )}

        {/* Botones de Navegación de Pie */}
        <div className="mt-8 pt-5 border-t border-stone-800 flex items-center justify-between">
          {currentStep > 1 ? (
            <button
              type="button"
              disabled={isProcessingPayment}
              onClick={handlePrev}
              className="px-4 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Anterior</span>
            </button>
          ) : (
            <div />
          )}

          {currentStep < 5 ? (
            <button
              type="button"
              onClick={handleNext}
              className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
            >
              <span>Continuar al Paso {currentStep + 1}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              disabled={isProcessingPayment}
              onClick={handleProcessPaymentAndConfirm}
              className={`px-6 py-3.5 rounded-xl text-stone-950 text-xs sm:text-sm font-bold flex items-center gap-2 transition-all shadow-lg cursor-pointer ${
                isProcessingPayment
                  ? 'bg-amber-400/80 cursor-wait'
                  : 'bg-emerald-500 hover:bg-emerald-400 shadow-emerald-500/25 ring-2 ring-emerald-400/30'
              }`}
            >
              {isProcessingPayment ? (
                <>
                  <div className="w-4 h-4 border-2 border-stone-950 border-t-transparent rounded-full animate-spin" />
                  <span>Procesando pago seguro (S/. {totalAmountToPay.toFixed(2)})...</span>
                </>
              ) : (
                <>
                  <CreditCard className="w-4 h-4" />
                  <span>Pagar S/. {totalAmountToPay.toFixed(2)} y Confirmar Reserva</span>
                </>
              )}
            </button>
          )}
        </div>

      </div>
    </div>
  );
};