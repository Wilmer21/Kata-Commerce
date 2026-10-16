import React from 'react';
import { Percent, Info } from 'lucide-react';
import { DiscountEngineResult } from '../types/index.js';
import { formatMoney, formatPercentage } from '../utils/format.js';

interface DiscountBreakdownProps {
  summary: DiscountEngineResult;
}

export const DiscountBreakdown: React.FC<DiscountBreakdownProps> = ({ summary }) => {
  const { discounts, originalSubtotalCents, totalEffectiveDiscountCents, finalTotalCents, effectiveSavingsPercentage, isCapReached } = summary;

  const hasAnyDiscount = totalEffectiveDiscountCents > 0;

  return (
    <div className="space-y-3 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <span className="text-sm font-medium text-slate-600">Subtotal Original</span>
        <span data-testid="original-subtotal" className="text-base font-semibold text-slate-900">
          {formatMoney(originalSubtotalCents)}
        </span>
      </div>

      {/* Regla 1: Categoría */}
      <div className="flex items-start justify-between text-xs sm:text-sm">
        <div>
          <span className="font-medium text-slate-700">1. Descuento Categoría (10% Tech)</span>
          <p className="text-[11px] text-slate-400">{discounts.category.description}</p>
        </div>
        <span
          data-testid="discount-category-amount"
          className={`font-semibold shrink-0 ml-2 ${
            discounts.category.appliedDiscountCents > 0 ? 'text-emerald-600' : 'text-slate-400'
          }`}
        >
          {discounts.category.appliedDiscountCents > 0 ? `-${formatMoney(discounts.category.appliedDiscountCents)}` : '$0.00'}
        </span>
      </div>

      {/* Regla 2: Volumen */}
      <div className="flex items-start justify-between text-xs sm:text-sm">
        <div>
          <span className="font-medium text-slate-700">2. Descuento Volumen (&gt; $100 USD)</span>
          <p className="text-[11px] text-slate-400">{discounts.volume.description}</p>
        </div>
        <span
          data-testid="discount-volume-amount"
          className={`font-semibold shrink-0 ml-2 ${
            discounts.volume.appliedDiscountCents > 0 ? 'text-emerald-600' : 'text-slate-400'
          }`}
        >
          {discounts.volume.appliedDiscountCents > 0 ? `-${formatMoney(discounts.volume.appliedDiscountCents)}` : '$0.00'}
        </span>
      </div>

      {/* Regla 3: Cupón */}
      <div className="flex items-start justify-between text-xs sm:text-sm">
        <div>
          <span className="font-medium text-slate-700">3. Cupón Promocional (15%)</span>
          <p className="text-[11px] text-slate-400">{discounts.coupon.description}</p>
        </div>
        <span
          data-testid="discount-coupon-amount"
          className={`font-semibold shrink-0 ml-2 ${
            discounts.coupon.appliedDiscountCents > 0 ? 'text-emerald-600' : 'text-slate-400'
          }`}
        >
          {discounts.coupon.appliedDiscountCents > 0 ? `-${formatMoney(discounts.coupon.appliedDiscountCents)}` : '$0.00'}
        </span>
      </div>

      {/* Total Ahorro y Porcentaje */}
      {hasAnyDiscount && (
        <div className="pt-3 border-t border-dashed border-slate-200 flex items-center justify-between text-emerald-700 bg-emerald-50/70 p-3 rounded-xl border border-emerald-100">
          <div className="flex items-center gap-1.5">
            <Percent className="w-4 h-4 text-emerald-600" />
            <span className="text-xs sm:text-sm font-bold">Total Ahorrado ({formatPercentage(effectiveSavingsPercentage)})</span>
          </div>
          <span data-testid="total-savings-amount" className="text-sm sm:text-base font-bold">
            -{formatMoney(totalEffectiveDiscountCents)}
          </span>
        </div>
      )}

      {/* Total Definitivo */}
      <div className="pt-3 border-t border-slate-200 flex items-baseline justify-between">
        <div>
          <span className="text-base font-bold text-slate-900">Total a Pagar</span>
          <span className="block text-[11px] text-slate-400">Impuestos y descuentos incluidos</span>
        </div>
        <span
          data-testid="final-total-amount"
          className="text-2xl font-extrabold text-indigo-600 tracking-tight"
        >
          {formatMoney(finalTotalCents)}
        </span>
      </div>

      {isCapReached && (
        <div className="flex items-center gap-1.5 text-[11px] text-amber-700 bg-amber-50 px-2.5 py-1.5 rounded-lg border border-amber-200">
          <Info className="w-3.5 h-3.5 text-amber-600 shrink-0" />
          <span>El ahorro efectivo fue acotado al 35% máximo según la política de precedencia LIFO.</span>
        </div>
      )}
    </div>
  );
};
