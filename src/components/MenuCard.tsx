import React, { useState } from 'react';
import { MenuItem } from '../types';
import { Utensils, Clock, Sparkles } from 'lucide-react';

interface MenuCardProps {
  item: MenuItem;
  onSelectForReservation?: (item: MenuItem) => void;
}

export const MenuCard: React.FC<MenuCardProps> = ({ item, onSelectForReservation }) => {
  const [imageError, setImageError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(item.image);

  const fallbackByCategory: Record<string, string> = {
    principales: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
    entradas: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
    postres: 'https://images.unsplash.com/photo-1587314168485-3236d6710814?auto=format&fit=crop&w=800&q=80',
    bebidas: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=800&q=80',
  };

  const handleImageError = () => {
    const fallback = fallbackByCategory[item.category];
    if (fallback && currentSrc !== fallback) {
      setCurrentSrc(fallback);
    } else {
      setImageError(true);
    }
  };

  return (
    <article className="group bg-stone-900 border border-stone-800 rounded-xl overflow-hidden hover:border-stone-700 transition-all duration-300 flex flex-col h-full shadow-xs hover:-translate-y-1">
      {/* Image Container with Fallback */}
      <div className="relative aspect-4/3 w-full overflow-hidden bg-stone-950">
        {!imageError ? (
          <img
            src={currentSrc}
            alt={item.name}
            referrerPolicy="no-referrer"
            loading="lazy"
            decoding="async"
            onLoad={() => setIsLoaded(true)}
            onError={handleImageError}
            className={`w-full h-full object-cover group-hover:scale-105 transition-all duration-500 ease-out ${
              isLoaded ? 'opacity-100' : 'opacity-80'
            }`}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-stone-950 text-stone-600 p-6 text-center">
            <Utensils className="w-10 h-10 mb-2 text-stone-700" />
            <span className="text-xs font-serif-display text-stone-400">{item.name}</span>
          </div>
        )}

        {/* Subtle Scrim */}
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-transparent to-transparent pointer-events-none" />

        {/* Chef special indicator */}
        {item.isChefSpecial && (
          <div className="absolute top-3 left-3 bg-stone-900/90 backdrop-blur-md border border-amber-500/30 text-amber-300 text-[11px] font-medium px-2.5 py-1 rounded-sm flex items-center gap-1 shadow-sm">
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>{item.badge || 'Especial'}</span>
          </div>
        )}

        {/* Prep Time */}
        {item.prepTime && (
          <div className="absolute bottom-3 right-3 text-[11px] text-stone-300 bg-stone-950/80 px-2 py-0.5 rounded backdrop-blur-xs flex items-center gap-1">
            <Clock className="w-3 h-3 text-stone-400" />
            <span className="tabular-nums">{item.prepTime}</span>
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="p-5 flex flex-col flex-1 justify-between">
        <div>
          {/* Unboxed Metadata Header */}
          <div className="flex items-center gap-2 text-xs text-stone-500 uppercase tracking-wider mb-1.5 font-medium">
            <span>{item.category}</span>
            {item.dietary && item.dietary.length > 0 && (
              <>
                <span aria-hidden="true">·</span>
                <span className="text-stone-400">{item.dietary.join(', ')}</span>
              </>
            )}
          </div>

          <h3 className="font-serif-display text-lg font-bold text-stone-100 group-hover:text-amber-300 transition-colors line-clamp-1">
            {item.name}
          </h3>

          <p className="mt-2 text-xs text-stone-400 leading-relaxed line-clamp-3">
            {item.description}
          </p>
        </div>

        {/* Price & Action Row */}
        <div className="mt-4 pt-3 border-t border-stone-800/80 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-stone-500 block leading-none">Precio</span>
            <span className="text-lg font-semibold text-amber-400 tabular-nums">
              S/. {item.price.toFixed(2)}
            </span>
          </div>

          {onSelectForReservation && (
            <button
              onClick={() => onSelectForReservation(item)}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-stone-800 text-stone-200 hover:bg-amber-400 hover:text-stone-900 transition-colors"
            >
              Degustar en Reserva
            </button>
          )}
        </div>
      </div>
    </article>
  );
};
