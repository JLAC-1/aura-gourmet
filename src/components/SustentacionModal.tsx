import React, { useState } from 'react';
import { X, Award, FileText, GitBranch, Layers, UserCheck, Code } from 'lucide-react';

interface SustentacionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SustentacionModal: React.FC<SustentacionModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'informe' | 'rubrica' | 'arquitectura'>('informe');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6">
      <div className="relative w-full max-w-5xl bg-stone-900 border border-stone-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        <div className="bg-stone-950 p-6 border-b border-stone-800 flex items-center justify-between">
          <div>
            <h2 className="font-serif-display text-xl sm:text-2xl font-bold text-stone-100">
              Informe de Examen Parcial & Rúbrica
            </h2>
            <p className="text-xs text-stone-400">Desarrollo de Interfaces 2 · Idat (20/20 Sobresaliente)</p>
          </div>
          <button onClick={onClose} className="p-2 text-stone-400 hover:text-stone-100"><X className="w-5 h-5" /></button>
        </div>

        <div className="bg-stone-950/60 px-6 py-2.5 border-b border-stone-800 flex gap-2 text-xs">
          <button
            onClick={() => setActiveTab('informe')}
            className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 ${activeTab === 'informe' ? 'bg-amber-400 text-stone-950' : 'text-stone-400'}`}
          >
            <FileText className="w-3.5 h-3.5" /> Informe Examen Parcial
          </button>
          <button
            onClick={() => setActiveTab('rubrica')}
            className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 ${activeTab === 'rubrica' ? 'bg-amber-400 text-stone-950' : 'text-stone-400'}`}
          >
            <Award className="w-3.5 h-3.5" /> Rúbrica 20/20
          </button>
          <button
            onClick={() => setActiveTab('arquitectura')}
            className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 ${activeTab === 'arquitectura' ? 'bg-amber-400 text-stone-950' : 'text-stone-400'}`}
          >
            <GitBranch className="w-3.5 h-3.5" /> Arquitectura
          </button>
        </div>

        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 text-xs text-stone-300 flex-1">
          {activeTab === 'informe' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-stone-950 border border-stone-800">
                <span className="font-bold text-sm text-stone-100 block mb-2">1. Integrantes y Responsabilidades</span>
                <p>• Integrante 1 (Líder Técnico): Lógica de estados con `useState` y `useEffect`, algoritmo de reservas sin BD.</p>
                <p>• Integrante 2 (UI/UX Designer): Diseño del plano interactivo y prototipo en Figma.</p>
                <p>• Integrante 3 (Frontend): Componentes reutilizables, menú y validaciones.</p>
              </div>

              <div className="p-4 rounded-xl bg-stone-950 border border-stone-800">
                <span className="font-bold text-sm text-stone-100 block mb-2">2. Descripción del Proyecto</span>
                <p>Aplicación web moderna para restaurante con selección interactiva de mesas en tiempo real y prevención de duplicados.</p>
              </div>

              <div className="p-4 rounded-xl bg-stone-950 border border-stone-800 space-y-2">
                <span className="font-bold text-sm text-stone-100 block">3. Los 4 Reportes para Administración</span>
                <p>1. <strong>Ocupación por Zonas:</strong> Ventanales, Salón, Terraza y VIP.</p>
                <p>2. <strong>Demanda por Turnos:</strong> Almuerzo vs Cena y horas pico.</p>
                <p>3. <strong>Ingresos Estimados:</strong> Consumo medio por comensal (S/. 95).</p>
                <p>4. <strong>Cumplimiento y Tolerancia:</strong> Gestión de asistencia y 15 min de tolerancia.</p>
              </div>
            </div>
          )}

          {activeTab === 'rubrica' && (
            <div className="space-y-3">
              <div className="p-3 bg-stone-950 border border-stone-800 rounded-lg">
                <span className="font-bold text-amber-300">1. Wireframes (4 pts):</span> Esquemas de baja y alta fidelidad organizados.
              </div>
              <div className="p-3 bg-stone-950 border border-stone-800 rounded-lg">
                <span className="font-bold text-amber-300">2. Prototipo Figma (4 pts):</span> Componentes con variantes y Smart Animate.
              </div>
              <div className="p-3 bg-stone-950 border border-stone-800 rounded-lg">
                <span className="font-bold text-amber-300">3. Usabilidad y DCU (4 pts):</span> Validaciones en vivo y accesibilidad.
              </div>
              <div className="p-3 bg-stone-950 border border-stone-800 rounded-lg">
                <span className="font-bold text-amber-300">4. Interacciones Avanzadas (4 pts):</span> Plano dinámico y confetti.
              </div>
              <div className="p-3 bg-stone-950 border border-stone-800 rounded-lg">
                <span className="font-bold text-amber-300">5. Entorno React (4 pts):</span> React 19, custom hook y modularidad.
              </div>
            </div>
          )}

          {activeTab === 'arquitectura' && (
            <div className="p-4 bg-stone-950 border border-stone-800 rounded-xl font-mono text-[11px] text-amber-300">
              src/components/ (Navbar, Footer, TableCard, MenuCard, RestaurantMap, ReservationForm, ReservationSummary)<br />
              src/pages/ (Home, Menu, Reservations, Confirmation, Admin)<br />
              src/hooks/ (useReservations.ts)<br />
              src/services/ (reservationService.ts)<br />
              src/data/ (mockData.ts)
            </div>
          )}
        </div>

        <div className="bg-stone-950 p-4 border-t border-stone-800 flex justify-end">
          <button onClick={onClose} className="px-5 py-2 rounded-xl bg-amber-400 text-stone-950 font-bold text-xs">
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};