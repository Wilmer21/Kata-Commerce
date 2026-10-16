import React, { useState } from 'react';
import { Tag, Check, X } from 'lucide-react';
import { useCartStore } from '../store/useCartStore.js';

export const CouponInput: React.FC = () => {
  const { couponCode, setCouponCode } = useCartStore();
  const [inputVal, setInputVal] = useState(couponCode);
  const isValid = couponCode.trim().toUpperCase() === 'WELCOME2E26';

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponCode(inputVal);
  };

  const handleRemove = () => {
    setInputVal('');
    setCouponCode('');
  };

  return (
    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
      <div className="flex items-center justify-between mb-2">
        <label htmlFor="coupon" className="text-xs font-semibold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
          <Tag className="w-3.5 h-3.5 text-indigo-600" />
          <span>Cupón Promocional</span>
        </label>
        {couponCode && (
          <span
            data-testid="coupon-status-badge"
            className={`text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
              isValid
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                : 'bg-rose-100 text-rose-800 border border-rose-200'
            }`}
          >
            {isValid ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
            {isValid ? 'WELCOME2E26 (-15%)' : 'Inválido'}
          </span>
        )}
      </div>

      <form onSubmit={handleApply} className="flex gap-2">
        <input
          id="coupon"
          data-testid="coupon-input"
          type="text"
          value={inputVal}
          onChange={e => setInputVal(e.target.value)}
          placeholder="Ej: WELCOME2E26"
          className="flex-1 px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono uppercase placeholder:normal-case placeholder:font-sans"
        />
        {couponCode ? (
          <button
            type="button"
            data-testid="remove-coupon-btn"
            onClick={handleRemove}
            className="px-3 py-2 text-xs font-semibold bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors"
          >
            Quitar
          </button>
        ) : (
          <button
            type="submit"
            data-testid="apply-coupon-btn"
            disabled={!inputVal.trim()}
            className="px-4 py-2 text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed rounded-lg transition-colors"
          >
            Aplicar
          </button>
        )}
      </form>
    </div>
  );
};
