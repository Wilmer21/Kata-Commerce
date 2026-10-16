import React, { useEffect, useState } from 'react';
import { api } from './services/api.js';
import { Product } from './types/index.js';
import { Header } from './components/Header.js';
import { ProductCard } from './components/ProductCard.js';
import { CartSummary } from './components/CartSummary.js';
import { OrderSuccessModal } from './components/OrderSuccessModal.js';
import { useCartStore } from './store/useCartStore.js';
import { Loader2, RefreshCw, Sparkles } from 'lucide-react';

export const App: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('Todas');

  const { lastConfirmedOrder, resetOrderState } = useCartStore();

  const fetchCatalog = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getProducts();
      setProducts(data);
    } catch (err) {
      setError(
        'No se pudo conectar con el servidor backend. Asegúrate de que el backend esté corriendo en el puerto 3001.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCatalog();
  }, []);

  const categories = ['Todas', ...Array.from(new Set(products.map(p => p.category)))];

  const filteredProducts =
    selectedCategory === 'Todas'
      ? products
      : products.filter(p => p.category === selectedCategory);

  const handleModalClose = () => {
    resetOrderState();
    fetchCatalog(); // Actualizar stock de la tienda tras la compra
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        {/* Banner de Bienvenida y Reglas de la Kata */}
        <div className="mb-8 p-6 rounded-3xl bg-gradient-to-br from-indigo-900 via-indigo-800 to-slate-900 text-white shadow-xl relative overflow-hidden">
          <div className="relative z-10 max-w-2xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              Kata E-Commerce Checkout
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Motor de Descuentos Acumulativos
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-indigo-100/90 leading-relaxed">
              Prueba las reglas en cascada: <strong>10% en Tecnología</strong>, <strong>5% por volumen &gt; $100</strong>, y cupón <strong>WELCOME2E26 (15%)</strong> con tope del <strong>35% LIFO</strong>.
            </p>
          </div>
          <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        </div>

        {/* Layout en dos columnas: Catálogo y Carrito */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Columna Izquierda: Catálogo de Productos (8 cols) */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
                {categories.map(cat => (
                  <button
                    key={cat}
                    data-testid={`filter-category-${cat}`}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all shrink-0 ${
                      selectedCategory === cat
                        ? 'bg-slate-900 text-white shadow-sm'
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <button
                onClick={fetchCatalog}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
                title="Recargar catálogo"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Actualizar</span>
              </button>
            </div>

            {loading ? (
              <div className="p-16 text-center bg-white rounded-3xl border border-slate-200 shadow-sm">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mx-auto mb-3" />
                <p className="text-sm font-semibold text-slate-600">Cargando catálogo desde el backend...</p>
              </div>
            ) : error ? (
              <div className="p-8 text-center bg-rose-50 border border-rose-200 rounded-3xl space-y-3">
                <p className="text-sm text-rose-700 font-semibold">{error}</p>
                <button
                  onClick={fetchCatalog}
                  className="px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-bold hover:bg-rose-700 transition-colors shadow-sm"
                >
                  Reintentar Conexión
                </button>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 text-slate-400">
                No hay productos en esta categoría.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                {filteredProducts.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>

          {/* Columna Derecha: Panel de Checkout (4/5 cols) */}
          <div className="lg:col-span-5 xl:col-span-4 sticky top-24">
            <CartSummary onCheckoutSuccess={fetchCatalog} />
          </div>
        </div>
      </main>

      {/* Modal de Éxito de Compra */}
      <OrderSuccessModal order={lastConfirmedOrder} onClose={handleModalClose} />

      <footer className="mt-auto border-t border-slate-200 bg-white py-6">
        <div className="max-w-7xl mx-auto px-4 text-center text-xs text-slate-400">
          Kata-Commerce © 2026 — Arquitectura Limpia, Precisión Monetaria y Gobernanza de IA
        </div>
      </footer>
    </div>
  );
};
