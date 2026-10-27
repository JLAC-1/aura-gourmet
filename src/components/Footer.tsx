import React from 'react';
import { UtensilsCrossed, MapPin, Phone, Mail, Clock, Wine } from 'lucide-react';

interface FooterProps {
  setActiveTab: (tab: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ setActiveTab }) => {
  return (
    <footer className="bg-stone-950 border-t border-stone-800 text-stone-400 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          
          {/* Marca y Concepto */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <UtensilsCrossed className="w-4 h-4" />
              </div>
              <span className="font-serif-display text-lg font-bold text-stone-100">Aura Gourmet</span>
            </div>
            <p className="text-xs text-stone-400 leading-relaxed mb-4">
              Experiencia culinaria de alta cocina de autor con reserva interactiva de mesas, vista panorámica y atención personalizada en Miraflores.
            </p>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[11px] font-medium">
              <Wine className="w-3.5 h-3.5" /> Cocina de Autor & Cava
            </span>
          </div>

          {/* Horarios de Atención */}
          <div>
            <h4 className="text-stone-200 font-semibold mb-3 flex items-center gap-2 text-xs uppercase tracking-wider">
              <Clock className="w-4 h-4 text-amber-400" />
              Horarios de Atención
            </h4>
            <ul className="space-y-2 text-xs text-stone-400">
              <li className="flex justify-between border-b border-stone-800/60 pb-1">
                <span>Almuerzo (Mar - Dom):</span>
                <span className="text-stone-300 font-medium">12:30 - 15:30</span>
              </li>
              <li className="flex justify-between border-b border-stone-800/60 pb-1">
                <span>Cena (Mar - Sáb):</span>
                <span className="text-stone-300 font-medium">19:00 - 23:00</span>
              </li>
              <li className="flex justify-between text-stone-500">
                <span>Lunes:</span>
                <span>Cerrado por descanso</span>
              </li>
            </ul>
          </div>

          {/* Ubicación & Contacto */}
          <div>
            <h4 className="text-stone-200 font-semibold mb-3 flex items-center gap-2 text-xs uppercase tracking-wider">
              <MapPin className="w-4 h-4 text-amber-400" />
              Ubicación & Contacto
            </h4>
            <ul className="space-y-2 text-xs text-stone-400">
              <li className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-stone-500 shrink-0 mt-0.5" />
                <span>Av. Malecón de la Reserva 840, Miraflores, Lima</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-stone-500 shrink-0" />
                <span>+51 (1) 619-8900</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-stone-500 shrink-0" />
                <span>reservas@auragourmet.pe</span>
              </li>
            </ul>
          </div>

          {/* Experiencia Gastronómica */}
          <div>
            <h4 className="text-stone-200 font-semibold mb-3 flex items-center gap-2 text-xs uppercase tracking-wider">
              <Wine className="w-4 h-4 text-amber-400" />
              Experiencia en Sala
            </h4>
            <p className="text-xs text-stone-400 leading-relaxed mb-3">
              Seleccione su mesa favorita en nuestro plano arquitectónico: Ventanales con vista al mar, Salón Central, Terraza Jardín o Zona VIP & Cava privada.
            </p>
            <button
              onClick={() => setActiveTab('reservas')}
              className="text-xs font-semibold text-amber-400 hover:text-amber-300 underline underline-offset-4 cursor-pointer"
            >
              Explorar Plano y Reservar →
            </button>
          </div>

        </div>

        <div className="pt-8 border-t border-stone-800 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-500 gap-4">
          <p>© 2026 Aura Gourmet Restaurant. Todos los derechos reservados.</p>
          <div className="flex items-center gap-4">
            <button onClick={() => setActiveTab('home')} className="hover:text-stone-300 transition-colors cursor-pointer">
              Inicio
            </button>
            <span aria-hidden="true">·</span>
            <button onClick={() => setActiveTab('menu')} className="hover:text-stone-300 transition-colors cursor-pointer">
              Carta Menú
            </button>
            <span aria-hidden="true">·</span>
            <button onClick={() => setActiveTab('reservas')} className="hover:text-stone-300 transition-colors cursor-pointer">
              Reservar Mesa
            </button>
            <span aria-hidden="true">·</span>
            <button onClick={() => setActiveTab('admin')} className="hover:text-stone-300 transition-colors cursor-pointer">
              Acceso Personal
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};