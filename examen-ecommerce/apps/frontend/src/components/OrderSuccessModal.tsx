import React from 'react';
import { CheckCircle2, ShoppingBag } from 'lucide-react';
import { Order } from '../types/index.js';
import { formatMoney, formatPercentage } from '../utils/format.js';

interface OrderSuccessModalProps {
  order: Order | null;
  onClose: () => void;
}

export const OrderSuccessModal: React.FC<OrderSuccessModalProps> = ({ order, onClose }) => {
  if (!order) return null;

  return (
    <div
      data-testid="order-success-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn"
    >
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto space-y-6">
        <div className="text-center space-y-2">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900">¡Compra Confirmada!</h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Tu orden fue procesada, validada y persistida por el backend con éxito.
          </p>
        </div>

        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs sm:text-sm space-y-2">
          <div className="flex justify-between items-center pb-2 border-b border-slate-200">
            <span className="text-slate-500 font-medium">ID de Orden:</span>
            <span data-testid="confirmed-order-id" className="font-mono font-bold text-slate-900">
              {order.id}
            </span>
          </div>
          <div className="flex justify-between items-center pb-2 border-b border-slate-200">
            <span className="text-slate-500 font-medium">Estado Transaccional:</span>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
              {order.status}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-500 font-medium">Fecha:</span>
            <span className="text-slate-700">
              {new Date(order.createdAt).toLocaleString('es-ES')}
            </span>
          </div>
        </div>

        {/* Detalle de ítems */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
            Productos Adquiridos
          </h4>
          <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-white">
            {order.items.map(item => (
              <div key={item.productId} className="p-3 flex justify-between items-center text-xs sm:text-sm">
                <div>
                  <span className="font-semibold text-slate-800 block">{item.name}</span>
                  <span className="text-slate-400 text-[11px]">
                    {item.quantity} x {formatMoney(item.unitPriceCents)}
                  </span>
                </div>
                <span className="font-bold text-slate-900">
                  {formatMoney(item.lineTotalCents)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Resumen definitivo del backend */}
        <div className="bg-indigo-50/70 p-4 rounded-2xl border border-indigo-100 space-y-2 text-xs sm:text-sm">
          <div className="flex justify-between text-slate-600">
            <span>Subtotal Original:</span>
            <span>{formatMoney(order.summary.originalSubtotalCents)}</span>
          </div>
          <div className="flex justify-between text-emerald-700 font-medium">
            <span>Descuentos Efectivos ({formatPercentage(order.summary.effectiveSavingsPercentage)}):</span>
            <span>-{formatMoney(order.summary.totalEffectiveDiscountCents)}</span>
          </div>
          {order.summary.isCapReached && (
            <div className="text-[11px] text-amber-700 font-semibold bg-amber-100/70 px-2 py-1 rounded">
              ★ Tope máximo del 35% aplicado exitosamente
            </div>
          )}
          <div className="pt-2 border-t border-indigo-200 flex justify-between items-baseline font-bold text-base text-slate-900">
            <span>Total Cobrado:</span>
            <span data-testid="confirmed-order-total" className="text-xl text-indigo-700">
              {formatMoney(order.summary.finalTotalCents)}
            </span>
          </div>
        </div>

        <button
          data-testid="close-success-modal"
          onClick={onClose}
          className="w-full py-3.5 px-4 rounded-xl font-bold text-sm text-white bg-slate-900 hover:bg-slate-800 active:scale-[0.99] transition-all flex items-center justify-center space-x-2"
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Seguir Comprando</span>
        </button>
      </div>
    </div>
  );
};
