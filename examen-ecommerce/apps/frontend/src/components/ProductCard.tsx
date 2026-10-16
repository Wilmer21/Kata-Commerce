import React from 'react';
import { Plus, Laptop } from 'lucide-react';
import { Product } from '../types/index.js';
import { formatMoney } from '../utils/format.js';
import { useCartStore } from '../store/useCartStore.js';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { items, addItem } = useCartStore();
  const cartItem = items.find(i => i.product.id === product.id);
  const currentInCart = cartItem?.quantity ?? 0;
  const isOutOfStock = product.stock <= 0;
  const isMaxReached = currentInCart >= product.stock;
  const isTech = product.category.toLowerCase() === 'tecnología';

  return (
    <div
      data-testid={`product-card-${product.id}`}
      className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
    >
      <div>
        <div className="relative aspect-video w-full overflow-hidden bg-slate-100">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
          <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
            <span
              className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                isTech
                  ? 'bg-indigo-600 text-white shadow-sm flex items-center gap-1'
                  : 'bg-slate-900/80 backdrop-blur-sm text-white'
              }`}
            >
              {isTech && <Laptop className="w-3 h-3 inline" />}
              {product.category} {isTech && '(-10%)'}
            </span>
          </div>

          <div className="absolute top-3 right-3">
            <span
              className={`text-xs font-semibold px-2 py-0.5 rounded-md ${
                isOutOfStock
                  ? 'bg-rose-100 text-rose-700 border border-rose-200'
                  : product.stock <= 5
                  ? 'bg-amber-100 text-amber-800 border border-amber-200'
                  : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
              }`}
            >
              {isOutOfStock
                ? 'Agotado'
                : product.stock <= 5
                ? `¡Solo ${product.stock} disp.!`
                : `${product.stock} en stock`}
            </span>
          </div>
        </div>

        <div className="p-4 sm:p-5">
          <h3 className="font-semibold text-slate-900 text-base line-clamp-1 group-hover:text-indigo-600 transition-colors">
            {product.name}
          </h3>
          <p className="mt-1 text-xs text-slate-500 line-clamp-2 leading-relaxed">
            {product.description}
          </p>

          <div className="mt-4 flex items-baseline justify-between">
            <div>
              <span className="text-xs text-slate-400 font-medium">Precio Unitario</span>
              <p className="text-xl font-bold text-slate-900">
                {formatMoney(product.priceCents)}
              </p>
            </div>
            {currentInCart > 0 && (
              <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md border border-indigo-100">
                {currentInCart} en carrito
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="p-4 pt-0 sm:p-5 sm:pt-0">
        <button
          data-testid={`add-to-cart-${product.id}`}
          onClick={() => addItem(product)}
          disabled={isOutOfStock || isMaxReached}
          className={`w-full py-2.5 px-4 rounded-xl font-medium text-sm flex items-center justify-center space-x-2 transition-all ${
            isOutOfStock
              ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
              : isMaxReached
              ? 'bg-amber-50 text-amber-700 border border-amber-200 cursor-not-allowed'
              : 'bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white shadow-sm shadow-indigo-100'
          }`}
        >
          {isOutOfStock ? (
            <span>Sin Stock</span>
          ) : isMaxReached ? (
            <span>Máximo Alcanzado ({product.stock})</span>
          ) : (
            <>
              <Plus className="w-4 h-4" />
              <span>Agregar al Carrito</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
