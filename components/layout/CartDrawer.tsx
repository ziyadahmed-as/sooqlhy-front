"use client";
import { useCartStore, useCartTotal } from '@/stores/cart-store';
import { X, ShoppingBag, Trash2 } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ open, onClose }) => {
  const { items, removeItem, updateQuantity } = useCartStore();
  const total = useCartTotal();

  const getImageUrl = (product: any): string => {
    if (!product.images || product.images.length === 0) return '/placeholder.jpg';
    const img = product.images[0];
    return typeof img === 'string' ? img : img?.image || '/placeholder.jpg';
  };

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 z-40"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Shopping cart"
        className="fixed right-0 top-0 h-full w-80 max-w-full bg-white dark:bg-gray-900 shadow-2xl z-50 flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-800">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" />
            Cart ({items.reduce((s, i) => s + i.quantity, 0)})
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
            aria-label="Close cart"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto py-4 px-5 space-y-3">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center text-gray-400">
              <ShoppingBag className="h-10 w-10 mb-3" />
              <p className="text-sm">Your cart is empty</p>
            </div>
          ) : (
            items.map(({ product, quantity }) => (
              <div key={product.id} className="flex items-start gap-3">
                <div className="relative h-14 w-14 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                  <Image
                    src={getImageUrl(product)}
                    alt={product.name || product.title || 'Product'}
                    fill
                    className="object-cover"
                    sizes="56px"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-900 dark:text-white truncate">
                    {product.name || product.title}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">${Number(product.price).toFixed(2)} × {quantity}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <button
                      onClick={() => updateQuantity(product.id, quantity - 1)}
                      className="w-5 h-5 rounded border border-gray-300 text-xs flex items-center justify-center hover:bg-gray-100"
                    >
                      −
                    </button>
                    <span className="text-xs font-medium">{quantity}</span>
                    <button
                      onClick={() => updateQuantity(product.id, quantity + 1)}
                      className="w-5 h-5 rounded border border-gray-300 text-xs flex items-center justify-center hover:bg-gray-100"
                    >
                      +
                    </button>
                  </div>
                </div>
                <button
                  onClick={() => removeItem(product.id)}
                  className="text-red-400 hover:text-red-600 flex-shrink-0"
                  aria-label="Remove"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-gray-200 dark:border-gray-800 p-5 space-y-3">
            <div className="flex justify-between text-sm font-semibold text-gray-900 dark:text-white">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
            <Link
              href="/buyer/cart"
              onClick={onClose}
              className="block w-full text-center bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold rounded-lg py-2.5 transition-colors"
            >
              View Cart
            </Link>
            <Link
              href="/buyer/checkout"
              onClick={onClose}
              className="block w-full text-center bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-sm font-semibold rounded-lg py-2.5 transition-colors hover:opacity-90"
            >
              Checkout
            </Link>
          </div>
        )}
      </aside>
    </>
  );
};
