import React from 'react';
import { Sparkles } from 'lucide-react';

interface CapAlertProps {
  isCapReached: boolean;
  effectivePercentage: number;
}

export const CapAlert: React.FC<CapAlertProps> = ({ isCapReached, effectivePercentage }) => {
  if (!isCapReached) return null;

  return (
    <div
      data-testid="cap-alert-banner"
      className="relative overflow-hidden rounded-xl border border-amber-300 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 p-4 text-white shadow-lg shadow-orange-100 animate-fadeIn"
      role="alert"
    >
      <div className="flex items-start space-x-3">
        <div className="p-2 rounded-lg bg-white/20 backdrop-blur-sm shrink-0">
          <Sparkles className="w-5 h-5 text-amber-100 animate-pulse" />
        </div>
        <div className="flex-1">
          <h3 className="text-sm sm:text-base font-bold leading-tight flex items-center gap-1.5">
            ¡Enhorabuena! Has alcanzado el límite máximo de ahorro permitido (35%)
          </h3>
          <p className="mt-1 text-xs sm:text-sm text-amber-100 leading-relaxed">
            Se ha aplicado el tope del 35% sobre tu compra (Ahorro actual: {effectivePercentage}%). Los descuentos calculados han sido optimizados mediante ajuste LIFO para brindarte el máximo beneficio posible.
          </p>
        </div>
      </div>
      <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-white/10 blur-xl pointer-events-none" />
    </div>
  );
};
