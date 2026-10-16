import React from 'react';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { useCartStore } from '../store/useCartStore.js';
import { formatMoney } from '../utils/format.js';
import { CouponInput } from './CouponInput.js';
import { CapAlert } from './CapAlert.js';
import { DiscountBreakdown } from './DiscountBreakdown.js';

interface CartSummaryProps {
  onCheckoutSuccess?: () => void;
}

export const CartSummary: React.FC<CartSummaryProps> = ({ onCheckoutSuccess }) => {
  const {
    items,
    updateQuantity,
    removeItem,
    clearCart,
    isCheckingOut,
    checkoutError,
    executeCheckout,
    calculatePreview,
  } = useCartStore();

  const preview = calculatePreview();

  const handleCheckout = async () => {
    const order = await executeCheckout();
    if (order && onCheckoutSuccess) {
      onCheckoutSuccess();
    }
  };

  if (items.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center shadow-sm">
        <div className="w-14 h-14 mx-auto rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
          <ShoppingBag className="w-7 h-7" />
        </div>
        <h3 className="text-base font-bold text-slate-800">Tu carrito está vacío</h3>
        <p className="mt-1 text-xs text-slate-500 max-w-xs mx-auto">
          Agrega productos del catálogo para simular la cascada de descuentos acumulativos y probar las reglas.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Alerta del 35% si se alcanza el tope */}
      <CapAlert
        isCapReached={preview.isCapReached}
        effectivePercentage={preview.effectiveSavingsPercentage}
      />

      {/* Lista de productos en el carrito */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h2 className="font-bold text-slate-900 text-base">
            Carrito de Compras ({items.reduce((acc, i) => acc + i.quantity, 0)})
          </h2>
          <button
            onClick={clearCart}
            className="text-xs font-semibold text-rose-600 hover:text-rose-700 transition-colors"
          >
            Vaciar todo
          </button>
        </div>

        <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto pr-1">
          {items.map(({ product, quantity }) => (
            <div key={product.id} className="py-3 flex items-center justify-between gap-3">
              <div className="flex items-center space-x-3 min-w-0">
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-12 h-12 rounded-lg object-cover bg-slate-100 shrink-0"
                />
                <div className="min-w-0">
                  <h4 className="text-sm font-semibold text-slate-800 truncate">{product.name}</h4>
                  <span className="text-xs text-slate-400 block">
                    {formatMoney(product.priceCents)} c/u
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-3 shrink-0">
                <div className="flex items-center border border-slate-200 rounded-lg bg-slate-50">
                  <button
                    data-testid={`decrease-qty-${product.id}`}
                    onClick={() => updateQuantity(product.id, quantity - 1)}
                    className="p-1.5 text-slate-500 hover:text-slate-800 transition-colors"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span
                    data-testid={`qty-${product.id}`}
                    className="px-2 text-xs font-bold text-slate-800"
                  >
                    {quantity}
                  </span>
                  <button
                    data-testid={`increase-qty-${product.id}`}
                    onClick={() => updateQuantity(product.id, quantity + 1)}
                    disabled={quantity >= product.stock}
                    className="p-1.5 text-slate-500 hover:text-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                <button
                  data-testid={`remove-item-${product.id}`}
                  onClick={() => removeItem(product.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors"
                  title="Eliminar producto"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Input de cupón */}
      <CouponInput />

      {/* Desglose de descuentos y total */}
      <DiscountBreakdown summary={preview} />

      {/* Mensaje de error si falla el checkout */}
      {checkoutError && (
        <div
          data-testid="checkout-error-banner"
          className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm flex items-start gap-2"
        >
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <span>{checkoutError}</span>
        </div>
      )}

      {/* Botón de Checkout */}
      <button
        data-testid="checkout-button"
        onClick={handleCheckout}
        disabled={isCheckingOut || items.length === 0}
        className="w-full py-3.5 px-6 rounded-xl font-bold text-base text-white bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] disabled:bg-slate-300 disabled:cursor-not-allowed shadow-lg shadow-indigo-200 transition-all flex items-center justify-center space-x-2"
      >
        {isCheckingOut ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Procesando con Backend...</span>
          </>
        ) : (
          <>
            <span>Confirmar Pedido</span>
            <ArrowRight className="w-5 h-5" />
          </>
        )}
      </button>
    </div>
  );
};
