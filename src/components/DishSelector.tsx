import React, { useState } from 'react';
import { MENU_ITEMS } from '../data/restaurantData';
import { MenuItem, ReservationDishSelection } from '../types';

interface DishSelectorProps {
  selectedDishes: ReservationDishSelection[];
  onAddDish: (dish: MenuItem) => void;
  onRemoveDish: (dishId: string) => void;
}

export const DishSelector: React.FC<DishSelectorProps> = ({
  selectedDishes,
  onAddDish,
  onRemoveDish,
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('todos');

  const categories = [
    { id: 'todos', label: 'Toda la Carta' },
    { id: 'entradas', label: 'Entradas' },
    { id: 'principales', label: 'Principales' },
    { id: 'postres', label: 'Postres' },
    { id: 'cocteleria', label: 'Bebidas & Vinos' },
  ];

  const filteredItems = activeCategory === 'todos'
    ? MENU_ITEMS
    : MENU_ITEMS.filter((item) => item.category === activeCategory);

  const getQuantity = (dishId: string): number => {
    const item = selectedDishes.find((d) => d.dish.id === dishId);
    return item ? item.quantity : 0;
  };

  const totalDishesCount = selectedDishes.reduce((acc, curr) => acc + curr.quantity, 0);
  const totalDishesPrice = selectedDishes.reduce((acc, curr) => acc + curr.dish.price * curr.quantity, 0);

  return (
    <div className="space-y-6">
      {/* Encabezado y resumen flotante */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-stone-900/60 p-4 rounded-xl border border-stone-800">
        <div>
          <h3 className="text-base font-serif font-bold text-stone-100 flex items-center gap-2">
            <span>Pre-selección de Platos para la Mesa</span>
            <span className="text-[11px] font-sans px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20 font-medium">
              Opcional pero recomendado
            </span>
          </h3>
          <p className="text-xs text-stone-400 mt-0.5">
            Seleccione los platos que desea tener listos a su llegada para garantizar frescura y tiempos de cocción óptimos.
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="text-right">
            <span className="text-stone-400 block text-[11px]">Platos Elegidos:</span>
            <span className="text-amber-400 font-bold">{totalDishesCount} unidades</span>
          </div>
          <div className="text-right border-l border-stone-800 pl-4">
            <span className="text-stone-400 block text-[11px]">Subtotal Carta:</span>
            <span className="text-emerald-400 font-bold">S/. {totalDishesPrice.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Selector de Categorías */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setActiveCategory(cat.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
              activeCategory === cat.id
                ? 'bg-amber-500 text-stone-950 font-semibold shadow-md'
                : 'bg-stone-900 text-stone-400 hover:text-stone-200 border border-stone-800'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Grid de Platos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 max-h-[460px] overflow-y-auto pr-1">
        {filteredItems.map((dish) => {
          const qty = getQuantity(dish.id);
          return (
            <div
              key={dish.id}
              className={`p-3.5 rounded-xl border transition-all flex flex-col justify-between ${
                qty > 0
                  ? 'bg-amber-950/20 border-amber-500/50 shadow-md'
                  : 'bg-stone-950/80 border-stone-800/80 hover:border-stone-700'
              }`}
            >
              <div className="flex gap-3">
                <img
                  src={dish.image}
                  alt={dish.name}
                  className="w-16 h-16 rounded-lg object-cover shrink-0 border border-stone-800"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start gap-1">
                    <h4 className="text-xs font-bold text-stone-200 truncate">{dish.name}</h4>
                  </div>
                  <p className="text-[11px] text-stone-400 line-clamp-2 mt-0.5 leading-snug">
                    {dish.description}
                  </p>
                  <div className="mt-1.5 flex items-center justify-between text-xs">
                    <span className="font-mono font-bold text-amber-400">S/. {dish.price.toFixed(2)}</span>
                    {dish.prepTime && (
                      <span className="text-[10px] text-stone-500 font-mono">⏱ {dish.prepTime}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Botones de acción */}
              <div className="mt-3 pt-2.5 border-t border-stone-800/80 flex items-center justify-between">
                <span className="text-[11px] text-stone-400">
                  {qty > 0 ? (
                    <span className="text-amber-300 font-semibold">Subtotal: S/. {(dish.price * qty).toFixed(2)}</span>
                  ) : (
                    'Agregar a la mesa'
                  )}
                </span>

                <div className="flex items-center gap-2">
                  {qty > 0 && (
                    <button
                      type="button"
                      onClick={() => onRemoveDish(dish.id)}
                      className="w-7 h-7 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 flex items-center justify-center font-bold text-xs transition-colors cursor-pointer"
                      title="Quitar uno"
                    >
                      -
                    </button>
                  )}

                  {qty > 0 && (
                    <span className="w-5 text-center font-mono font-bold text-xs text-stone-100">
                      {qty}
                    </span>
                  )}

                  <button
                    type="button"
                    onClick={() => onAddDish(dish)}
                    className="w-7 h-7 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 flex items-center justify-center font-bold text-xs transition-all shadow-sm cursor-pointer"
                    title="Añadir plato"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};