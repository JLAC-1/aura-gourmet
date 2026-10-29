import React, { useState } from 'react';
import { PaymentDetails } from '../types';

interface PaymentModalProps {
  guestsCount: number;
  dishesTotal: number;
  customerName: string;
  onPaymentSuccess: (payment: PaymentDetails) => void;
  onCancel?: () => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  guestsCount,
  dishesTotal,
  customerName,
  onPaymentSuccess,
  onCancel,
}) => {
  // Garantía por persona (S/. 30) para amarrar la mesa
  const depositPerGuest = 30;
  const depositTotal = guestsCount * depositPerGuest;
  const grandTotal = depositTotal + dishesTotal;

  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState(customerName || '');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Formato número de tarjeta (4 bloques de 4 dígitos)
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '').slice(0, 16);
    let formatted = value.match(/.{1,4}/g)?.join(' ') || value;
    setCardNumber(formatted);
  };

  // Formato MM/AA
  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '').slice(0, 4);
    if (value.length > 2) {
      value = `${value.slice(0, 2)}/${value.slice(2)}`;
    }
    setCardExpiry(value);
  };

  const getCardBrand = (num: string): 'visa' | 'mastercard' | 'amex' | 'otro' => {
    const raw = num.replace(/\s/g, '');
    if (raw.startsWith('4')) return 'visa';
    if (/^5[1-5]/.test(raw) || /^2[2-7]/.test(raw)) return 'mastercard';
    if (/^3[47]/.test(raw)) return 'amex';
    return 'otro';
  };

  const handleFillDemoCard = () => {
    setCardNumber('4557 8901 2345 6789');
    setCardHolder(customerName || 'CARLOS MENDOZA');
    setCardExpiry('12/28');
    setCardCvv('789');
    setAcceptedTerms(true);
    setErrorMessage(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const rawNumber = cardNumber.replace(/\s/g, '');

    // Validaciones estrictas: Si falta algo NO pasa a reserva
    if (rawNumber.length < 15) {
      setErrorMessage('Por favor ingrese un número de tarjeta bancaria válido (16 dígitos).');
      return;
    }
    if (!cardHolder.trim()) {
      setErrorMessage('Ingrese el nombre y apellido del titular tal como figura en el plástico.');
      return;
    }
    if (cardExpiry.length !== 5 || !cardExpiry.includes('/')) {
      setErrorMessage('Ingrese una fecha de vencimiento válida en formato MM/AA.');
      return;
    }
    if (cardCvv.length < 3) {
      setErrorMessage('Ingrese el código de seguridad CVV (3 dígitos al reverso).');
      return;
    }
    if (!acceptedTerms) {
      setErrorMessage('Debe autorizar el cargo de la garantía de reserva (amarre con tarjeta).');
      return;
    }

    setIsProcessing(true);

    // Simulación de respuesta de pasarela de pago bancaria (1.5 segundos)
    setTimeout(() => {
      setIsProcessing(false);
      const brand = getCardBrand(cardNumber);
      const last4 = rawNumber.slice(-4);
      const randomTxn = 'TXN-AURA-' + Math.floor(100000 + Math.random() * 900000);

      const payment: PaymentDetails = {
        cardNumber: `•••• •••• •••• ${last4}`,
        cardHolder: cardHolder.toUpperCase(),
        cardExpiry,
        cardBrand: brand,
        cardLast4: last4,
        depositAmount: depositTotal,
        dishesAmount: dishesTotal,
        totalPaid: grandTotal,
        paidAt: new Date().toISOString(),
        transactionId: randomTxn,
        status: 'aprobado',
      };

      onPaymentSuccess(payment);
    }, 1500);
  };

  return (
    <div className="bg-stone-900/90 border border-amber-500/30 rounded-2xl p-6 sm:p-8 backdrop-blur-md shadow-2xl relative overflow-hidden">
      {/* Indicador de Seguridad */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-stone-800 gap-4">
        <div>
          <span className="text-xs uppercase tracking-widest text-amber-400 font-semibold flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Pasarela de Pago Segura · Amarre Obligatorio
          </span>
          <h3 className="text-xl sm:text-2xl font-serif font-bold text-stone-100 mt-1">
            Garantía y Afianzamiento de Mesa
          </h3>
          <p className="text-xs text-stone-400 mt-1">
            Para garantizar la exclusividad de su salón y evitar reservas no asistidas (No-Show), se realiza un amarre con tarjeta deducible del consumo en sala.
          </p>
        </div>

        <button
          type="button"
          onClick={handleFillDemoCard}
          className="px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
          title="Autocompletar datos para la presentación"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          Autocompletar Tarjeta Demo
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-6">
        {/* Desglose de Cobro */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-4 rounded-xl bg-stone-950 border border-stone-800">
            <h4 className="text-xs font-bold text-stone-300 uppercase tracking-wider mb-3">
              Desglose de la Reserva
            </h4>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-stone-400">
                <span>Depósito Garantía Mesa ({guestsCount} personas x S/. {depositPerGuest})</span>
                <span className="font-mono text-stone-200">S/. {depositTotal.toFixed(2)}</span>
              </div>
              {dishesTotal > 0 && (
                <div className="flex justify-between text-stone-400">
                  <span>Platos Pre-ordenados en Carta</span>
                  <span className="font-mono text-stone-200">S/. {dishesTotal.toFixed(2)}</span>
                </div>
              )}
              <div className="pt-2 border-t border-stone-800 flex justify-between font-bold text-sm">
                <span className="text-amber-400">Total a Pagar (Amarre):</span>
                <span className="text-amber-400 font-mono text-base">S/. {grandTotal.toFixed(2)}</span>
              </div>
            </div>
            <div className="mt-3 p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-300 flex items-start gap-2">
              <svg className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>El 100% de este importe se restará automáticamente de su cuenta final de consumo en mesa.</span>
            </div>
          </div>

          {/* Tarjeta Visual Interactiva */}
          <div className="p-5 rounded-2xl bg-gradient-to-tr from-stone-950 via-stone-900 to-amber-950/40 border border-amber-500/30 shadow-xl relative overflow-hidden">
            <div className="flex justify-between items-center mb-6">
              <span className="text-[10px] uppercase font-mono tracking-widest text-amber-400 font-bold">
                AURA LUXURY PASS
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-stone-800 text-stone-200 border border-stone-700">
                {getCardBrand(cardNumber).toUpperCase()}
              </span>
            </div>
            <div className="font-mono text-lg tracking-widest text-stone-100 font-semibold my-4">
              {cardNumber || '•••• •••• •••• ••••'}
            </div>
            <div className="flex justify-between items-end text-xs font-mono text-stone-400">
              <div>
                <span className="text-[9px] uppercase tracking-wider block text-stone-500">TITULAR</span>
                <span className="text-stone-200 uppercase font-bold">{cardHolder || 'NOMBRE DEL CLIENTE'}</span>
              </div>
              <div>
                <span className="text-[9px] uppercase tracking-wider block text-stone-500">VENCE</span>
                <span className="text-stone-200">{cardExpiry || 'MM/AA'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Formulario de Pago */}
        <form onSubmit={handleSubmit} className="lg:col-span-7 space-y-4">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 flex items-center gap-2">
              <svg className="w-4 h-4 shrink-0 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{errorMessage}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-stone-300 mb-1">
              Número de Tarjeta (Débito o Crédito)
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="4557 0000 0000 0000"
                value={cardNumber}
                onChange={handleCardNumberChange}
                maxLength={19}
                className="w-full px-4 py-2.5 rounded-xl bg-stone-950 border border-stone-800 focus:border-amber-500 focus:outline-none text-stone-100 font-mono text-sm pl-11"
              />
              <span className="absolute left-3.5 top-2.5 text-stone-500">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-stone-300 mb-1">
              Nombre y Apellidos del Titular
            </label>
            <input
              type="text"
              placeholder="JUAN PÉREZ"
              value={cardHolder}
              onChange={(e) => setCardHolder(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-stone-950 border border-stone-800 focus:border-amber-500 focus:outline-none text-stone-100 text-sm uppercase"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-stone-300 mb-1">
                Vencimiento (MM/AA)
              </label>
              <input
                type="text"
                placeholder="10/27"
                value={cardExpiry}
                onChange={handleExpiryChange}
                maxLength={5}
                className="w-full px-4 py-2.5 rounded-xl bg-stone-950 border border-stone-800 focus:border-amber-500 focus:outline-none text-stone-100 font-mono text-sm text-center"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-stone-300 mb-1">
                CVV / CVC (3 dígitos)
              </label>
              <input
                type="password"
                placeholder="•••"
                value={cardCvv}
                onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                maxLength={4}
                className="w-full px-4 py-2.5 rounded-xl bg-stone-950 border border-stone-800 focus:border-amber-500 focus:outline-none text-stone-100 font-mono text-sm text-center"
              />
            </div>
          </div>

          <div className="pt-2">
            <label className="flex items-start gap-3 cursor-pointer text-xs text-stone-400 select-none">
              <input
                type="checkbox"
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                className="mt-0.5 rounded border-stone-700 text-amber-500 focus:ring-amber-500 bg-stone-950"
              />
              <span>
                Autorizo expresamente el cobro de <strong className="text-amber-300">S/. {grandTotal.toFixed(2)}</strong> como amarre oficial de reserva. Entiendo que si no asisto sin aviso de 3 horas previas, el depósito afianza la mesa.
              </span>
            </label>
          </div>

          <div className="pt-4 flex items-center justify-end gap-3">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="px-5 py-2.5 rounded-xl border border-stone-800 text-stone-400 hover:text-stone-200 text-xs font-semibold transition-all cursor-pointer"
              >
                Volver
              </button>
            )}

            <button
              type="submit"
              disabled={isProcessing}
              className={`px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 shadow-lg cursor-pointer ${
                isProcessing
                  ? 'bg-amber-600/50 text-stone-300 cursor-wait'
                  : 'bg-amber-500 hover:bg-amber-400 text-stone-950 shadow-amber-500/20 hover:scale-[1.02]'
              }`}
            >
              {isProcessing ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-stone-950" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Procesando Cobro con el Banco...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Pagar S/. {grandTotal.toFixed(2)} y Confirmar Reserva
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};