import React from 'react';
import { ShoppingBag, ShieldCheck } from 'lucide-react';
import { useCartStore } from '../store/useCartStore.js';

export const Header: React.FC = () => {
  const items = useCartStore(state => state.items);
  const totalUnits = items.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-100">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900 leading-tight">
              Kata<span className="text-indigo-600">Commerce</span>
            </h1>
            <p className="text-xs text-slate-500 font-medium hidden sm:block">
              Motor de Descuentos Acumulativos & Gobernanza de IA
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="hidden md:flex items-center space-x-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Precisión en Centavos (Cents)</span>
          </div>

          <div className="flex items-center space-x-2 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
            <span className="text-xs font-semibold text-slate-600">Carrito:</span>
            <span
              data-testid="cart-badge-count"
              className="inline-flex items-center justify-center text-xs font-bold px-2 py-0.5 rounded-full bg-indigo-600 text-white"
            >
              {totalUnits}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
