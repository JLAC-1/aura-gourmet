import React, { useState } from 'react';
import { CalendarDays, Utensils, MapPin, Award, ChevronRight, Sparkles, Compass, ShieldCheck } from 'lucide-react';
import { RestaurantTable } from '../types';

interface HomeProps {
  onGoToReservations: () => void;
  onGoToMenu: () => void;
  onGoToAdmin: () => void;
  tables: RestaurantTable[];
}

export const Home: React.FC<HomeProps> = ({
  onGoToReservations,
  onGoToMenu,
  onGoToAdmin,
  tables,
}) => {
  const [, setHeroImageLoaded] = useState(true);

  const availableTablesCount = tables.filter((t) => t.status === 'disponible').length;

  return (
    <div className="space-y-16 sm:space-y-24 pb-16">
      
      {/* HERO SECTION */}
      <section className="relative min-h-[580px] lg:min-h-[660px] rounded-3xl overflow-hidden border border-stone-800 flex items-center justify-center p-6 sm:p-12 shadow-2xl">
        {/* Background Image */}
        <div className="absolute inset-0 bg-stone-950">
          <img
            src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1600&q=80"
            alt="Salón panorámico de Aura Gourmet Restaurant"
            referrerPolicy="no-referrer"
            onError={() => setHeroImageLoaded(false)}
            className="w-full h-full object-cover opacity-45 scale-105 filter brightness-75 transition-opacity duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-stone-950/90 via-stone-950/40 to-transparent" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-4xl text-left mr-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold mb-6">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Reserva de Mesas con Selección en Plano Digital</span>
          </div>

          <h1 className="font-serif-display text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-stone-100 leading-[1.08] text-balance">
            Cocina de Autor, <br />
            <span className="italic text-amber-400 font-serif">su mesa predilecta</span> <br />
            en un solo toque.
          </h1>

          <p className="mt-6 text-sm sm:text-base text-stone-300 leading-relaxed max-w-2xl text-balance">
            Experimente la alta gastronomía en Miraflores. A diferencia de los métodos tradicionales por teléfono, visualice la ubicación exacta de su mesa en nuestro plano interactivo y confirme en tiempo real sin esperas ni duplicaciones.
          </p>

          {/* CTAs */}
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <button
              onClick={onGoToReservations}
              className="px-6 py-3.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 text-sm font-bold flex items-center gap-2.5 transition-all shadow-lg shadow-amber-400/20 active:scale-98"
            >
              <CalendarDays className="w-4 h-4" />
              <span>Reservar en Plano Interactivo</span>
            </button>

            <button
              onClick={onGoToMenu}
              className="px-6 py-3.5 rounded-xl bg-stone-900/80 hover:bg-stone-800 border border-stone-700 text-stone-200 text-sm font-semibold flex items-center gap-2 transition-colors backdrop-blur-sm"
            >
              <Utensils className="w-4 h-4 text-stone-400" />
              <span>Ver Carta Gastronómica</span>
            </button>
          </div>

          {/* Live Availability Quick Indicator */}
          <div className="mt-10 pt-6 border-t border-stone-800/80 flex flex-wrap items-center gap-6 text-xs text-stone-400">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block animate-pulse" />
              <span className="text-stone-200 font-medium">
                {availableTablesCount} mesas disponibles hoy
              </span>
            </div>
            <span aria-hidden="true" className="text-stone-700">·</span>
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-amber-400" />
              <span>Miraflores, Lima · Ventanales al Malecón</span>
            </div>
            <span aria-hidden="true" className="text-stone-700">·</span>
            <div className="flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-amber-400" />
              <span>Guía Culinaria 2026</span>
            </div>
          </div>
        </div>
      </section>

      {/* QUICK RESERVATION PREVIEW STRIP */}
      <section className="bg-stone-900/80 border border-stone-800 rounded-2xl p-6 shadow-xl -mt-6 sm:-mt-10 relative z-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-center">
          <div>
            <span className="text-[11px] text-stone-500 uppercase tracking-wider block font-semibold">
              Ambientes
            </span>
            <p className="text-sm font-medium text-stone-200 mt-0.5">
              Ventanales, Salón, Terraza o VIP
            </p>
          </div>

          <div>
            <span className="text-[11px] text-stone-500 uppercase tracking-wider block font-semibold">
              Horario Central
            </span>
            <p className="text-sm font-medium text-stone-200 mt-0.5">
              Almuerzo 12:30 | Cena 19:00
            </p>
          </div>

          <div>
            <span className="text-[11px] text-stone-500 uppercase tracking-wider block font-semibold">
              Capacidades
            </span>
            <p className="text-sm font-medium text-stone-200 mt-0.5">
              Desde parejas (2p) a eventos (8p)
            </p>
          </div>

          <div>
            <button
              onClick={onGoToReservations}
              className="w-full py-2.5 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
            >
              <span>Elegir Mesa en Vivo</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* THREE VALUE PILLARS (PRESENTACIÓN DEL RESTAURANTE) */}
      <section className="space-y-6">
        <div className="text-center max-w-2xl mx-auto">
          <span className="text-xs text-amber-400 font-semibold uppercase tracking-wider">
            Experiencia Gastronómica & Digital
          </span>
          <h2 className="font-serif-display text-3xl sm:text-4xl font-bold text-stone-100 mt-2">
            La innovación se sienta a su mesa
          </h2>
          <p className="text-xs sm:text-sm text-stone-400 mt-3 leading-relaxed">
            Eliminamos la incertidumbre de reservar a ciegas. Conozca nuestra propuesta de valor tanto en cocina como en tecnología.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
          
          <div className="p-6 rounded-2xl bg-stone-900 border border-stone-800 hover:border-stone-700 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-4">
              <Compass className="w-6 h-6" />
            </div>
            <h3 className="font-serif-display text-xl font-bold text-stone-100 mb-2">
              Plano Interactivo Real
            </h3>
            <p className="text-xs text-stone-400 leading-relaxed">
              Vea la ubicación de su mesa antes de confirmar: frente al ventanal con vistas al atardecer, en un rincón íntimo del salón o bajo la terraza con iluminación nocturna.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-stone-900 border border-stone-800 hover:border-stone-700 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-4">
              <Utensils className="w-6 h-6" />
            </div>
            <h3 className="font-serif-display text-xl font-bold text-stone-100 mb-2">
              Cocina de Autor
            </h3>
            <p className="text-xs text-stone-400 leading-relaxed">
              Pesca artesanal del día, cortes selectos Wagyu y reinterpretaciones contemporáneas de postres peruanos creados por nuestro equipo de alta cocina.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-stone-900 border border-stone-800 hover:border-stone-700 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-4">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="font-serif-display text-xl font-bold text-stone-100 mb-2">
              Gestión Anti-Duplicados
            </h3>
            <p className="text-xs text-stone-400 leading-relaxed">
              Los horarios y mesas se bloquean al instante mediante nuestro gestor centralizado de disponibilidad, garantizando que su mesa nunca sea sobrevendida.
            </p>
          </div>

        </div>
      </section>

      {/* FEATURED DISHES & SPACES SHOWCASE */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-stone-800 pb-4">
          <div>
            <span className="text-xs text-amber-400 font-semibold uppercase tracking-wider">
              Platos & Ambientes Destacados
            </span>
            <h2 className="font-serif-display text-3xl font-bold text-stone-100 mt-1">
              Degustación & Espacios
            </h2>
          </div>
          <button
            onClick={onGoToMenu}
            className="text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1"
          >
            <span>Ver toda la carta</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Dish 1 */}
          <div className="group rounded-2xl bg-stone-900 border border-stone-800 overflow-hidden hover:border-stone-700 transition-all">
            <div className="aspect-4/3 overflow-hidden bg-stone-950">
              <img
                src="https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=800&q=80"
                alt="Lubina Salteada al Azafrán"
                referrerPolicy="no-referrer"
                loading="lazy"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div className="p-5">
              <span className="text-[11px] text-amber-400 uppercase font-semibold">Pesca de Autor</span>
              <h3 className="font-serif-display text-lg font-bold text-stone-100 mt-1">
                Lubina Salteada al Azafrán
              </h3>
              <p className="text-xs text-stone-400 mt-1.5 line-clamp-2">
                Con risotto sedoso de azafrán, espárragos trigueros y reducción balsámica artesanal.
              </p>
            </div>
          </div>

          {/* Dish 2 */}
          <div className="group rounded-2xl bg-stone-900 border border-stone-800 overflow-hidden hover:border-stone-700 transition-all">
            <div className="aspect-4/3 overflow-hidden bg-stone-950">
              <img
                src="https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80"
                alt="Solomillo Wagyu Glaseado"
                referrerPolicy="no-referrer"
                loading="lazy"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div className="p-5">
              <span className="text-[11px] text-amber-400 uppercase font-semibold">Corte Premium</span>
              <h3 className="font-serif-display text-lg font-bold text-stone-100 mt-1">
                Solomillo Wagyu a la Trufa
              </h3>
              <p className="text-xs text-stone-400 mt-1.5 line-clamp-2">
                Parrilla de carbón vegetal con demi-glace de trufas negras y puré ratte emulsionado.
              </p>
            </div>
          </div>

          {/* Space 1: Terrace Patio */}
          <div className="group rounded-2xl bg-stone-900 border border-stone-800 overflow-hidden hover:border-stone-700 transition-all">
            <div className="aspect-4/3 overflow-hidden bg-stone-950">
              <img
                src="https://images.unsplash.com/photo-1543007630-9710e4a00a20?auto=format&fit=crop&w=800&q=80"
                alt="Terraza Jardín al Aire Libre"
                referrerPolicy="no-referrer"
                loading="lazy"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div className="p-5">
              <span className="text-[11px] text-emerald-400 uppercase font-semibold">Ambiente Exterior</span>
              <h3 className="font-serif-display text-lg font-bold text-stone-100 mt-1">
                Terraza Jardín & Pérgola
              </h3>
              <p className="text-xs text-stone-400 mt-1.5 line-clamp-2">
                Música suave, iluminación tenue entre follaje y mesas exteriores protegidas con estufas.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* CALL TO ACTION BANNER */}
      <section className="bg-gradient-to-r from-amber-950/40 via-stone-900 to-stone-900 border border-amber-500/20 rounded-3xl p-8 sm:p-12 text-center max-w-4xl mx-auto shadow-xl">
        <h2 className="font-serif-display text-3xl sm:text-4xl font-bold text-stone-100 mb-3">
          ¿Planea una celebración especial?
        </h2>
        <p className="text-xs sm:text-sm text-stone-300 max-w-xl mx-auto mb-6 leading-relaxed">
          Elija una mesa con vistas privilegiadas en nuestra zona de ventanales o reserve un booth privado en la cava para su evento.
        </p>
        <button
          onClick={onGoToReservations}
          className="px-8 py-3.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold text-sm shadow-md transition-colors"
        >
          Iniciar Reserva de Mesa
        </button>
      </section>

    </div>
  );
};