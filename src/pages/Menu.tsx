import React, { useState } from 'react';
import { MENU_ITEMS } from '../data/mockData';
import { MenuCard } from '../components/MenuCard';
import { MenuItem } from '../types';
import { Search, CalendarDays } from 'lucide-react';

interface MenuProps {
  onSelectDishForReservation: (dish: MenuItem) => void;
  onGoToReservations: () => void;
}

export const Menu: React.FC<MenuProps> = ({ onSelectDishForReservation, onGoToReservations }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const categories = [
    { id: 'all', label: 'Toda la Carta' },
    { id: 'entradas', label: 'Entradas' },
    { id: 'principales', label: 'Platos Principales' },
    { id: 'bebidas', label: 'Bebidas' },
    { id: 'postres', label: 'Postres' },
  ];

  const filteredItems = MENU_ITEMS.filter((item) => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-10 pb-16">
      <div className="text-center max-w-2xl mx-auto">
        <span className="text-xs text-amber-400 font-semibold uppercase tracking-wider block mb-1">
          Propuesta Gastronómica
        </span>
        <h1 className="font-serif-display text-3xl sm:text-5xl font-bold text-stone-100">
          Carta de Temporada
        </h1>
        <p className="text-xs sm:text-sm text-stone-400 mt-2">
          Ingredientes frescos seleccionados diariamente por nuestro chef.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-stone-900 border border-stone-800 p-4 rounded-2xl">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedCategory === cat.id
                  ? 'bg-amber-400 text-stone-950 font-bold'
                  : 'bg-stone-800 text-stone-300 hover:text-white'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-stone-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar plato o ingrediente..."
            className="w-full pl-10 pr-4 py-2 bg-stone-950 border border-stone-800 rounded-xl text-xs text-stone-200 placeholder-stone-600 focus:border-amber-400"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredItems.map((item) => (
          <MenuCard
            key={item.id}
            item={item}
            onSelectForReservation={onSelectDishForReservation}
          />
        ))}
      </div>

      <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div>
          <h3 className="font-serif-display text-xl sm:text-2xl font-bold text-stone-100">
            ¿Desea degustar estos platos en su mesa preferida?
          </h3>
          <p className="text-xs text-stone-400 mt-1">Seleccione su mesa en el plano interactivo.</p>
        </div>
        <button
          onClick={onGoToReservations}
          className="px-6 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 text-xs font-bold flex items-center gap-2"
        >
          <CalendarDays className="w-4 h-4" /> Ir a Reservar
        </button>
      </div>
    </div>
  );
};