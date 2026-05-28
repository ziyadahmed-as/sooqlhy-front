import React, { useEffect, useState } from 'react';
import { useCartStore } from '@/stores/cart-store';
import type { CartItem } from '@/lib/types';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// Simple button component – replace with your UI library if needed
const Button = ({ children, onClick, className, type = 'button' }: React.ButtonHTMLAttributes<HTMLButtonElement> & { children: React.ReactNode; className?: string }) => (
  <button type={type} onClick={onClick} className={`px-4 py-2 rounded ${className}`}>
    {children}
  </button>
);

/**
 * CartDrawer – slide‑in sidebar that shows the current cart.
 * Props:
 *  - isOpen: boolean – whether the drawer is visible.
 *  - onClose: () => void – called when user dismisses the drawer.
 */
export const CartDrawer: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const router = useRouter();
  const { items, addItem, removeItem, updateQuantity, clearCart, total } = useCartStore();
  const [loading, setLoading] = useState(false);

  // Load cart from backend when drawer opens (GET /api/orders/cart/)
  useEffect(() => {
    if (!isOpen) return;
    const fetchCart = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/orders/cart/', { credentials: 'include' });
        if (res.ok) {
          const data: CartItem[] = await res.json();
          // Replace store state with fresh data
          // Simple approach: clear then add each
          clearCart();
          data.forEach(item => addItem(item.product, item.quantity));
        }
      } catch (e) {
        console.error('Failed to load cart', e);
      } finally {
        setLoading(false);
      }
    };
    fetchCart();
  }, [isOpen]);

  const handleQtyChange = async (productId: string, newQty: number) => {
    // Optimistic UI update
    updateQuantity(productId, newQty);
    try {
      await fetch('/api/orders/cart/add_item/', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_id: productId, quantity: newQty }),
      });
    } catch (e) {
      console.error('Qty update failed', e);
    }
  };

  const handleRemove = async (productId: string) => {
    removeItem(productId);
    try {
      await fetch('/api/orders/cart/add_item/', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_id: productId, quantity: 0 }),
      });
    } catch (e) {
      console.error('Remove failed', e);
    }
  };

  const handleClear = async () => {
    clearCart();
    try {
      await fetch('/api/orders/cart/clear/', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (e) {
      console.error('Clear cart failed', e);
    }
  };

  const proceedToCheckout = () => {
    router.push('/checkout');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div className="flex-1 bg-black opacity-30" onClick={onClose} />
      {/* Drawer */}
      <aside className="w-96 bg-white shadow-lg p-4 flex flex-col" aria-label="Cart drawer">
        <h2 className="text-xl font-semibold mb-4">Your Cart</h2>
        {loading ? (
          <p>Loading…</p>
        ) : items.length === 0 ? (
          <p className="text-gray-500">Your cart is empty.</p>
        ) : (
          <ul className="flex-1 overflow-y-auto space-y-3 mb-4">
            {items.map(item => (
              <li key={item.product.id} className="flex items-center gap-3 border-b pb-2">
                {/* Product thumbnail – using first image if available */}
                {item.product.images && item.product.images[0] && (
                  <img src={item.product.images[0]} alt={item.product.title} className="w-12 h-12 object-cover rounded" />
                )}
                <div className="flex-1">
                  <p className="font-medium">{item.product.title}</p>
                  <p className="text-sm text-gray-600">${item.product.price.toFixed(2)}</p>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    onClick={() => handleQtyChange(item.product.id, Math.max(1, item.quantity - 1))}
                    className="bg-gray-200"
                  >‑</Button>
                  <span className="px-2">{item.quantity}</span>
                  <Button
                    onClick={() => handleQtyChange(item.product.id, item.quantity + 1)}
                    className="bg-gray-200"
                  >+</Button>
                </div>
                <Button onClick={() => handleRemove(item.product.id)} className="text-red-600">
                  ✕
                </Button>
              </li>
            ))}
          </ul>
        )}
        <div className="border-t pt-3">
          <p className="font-semibold mb-2">Subtotal: ${total.toFixed(2)}</p>
          <div className="flex gap-2">
            <Button onClick={handleClear} className="bg-gray-100 text-gray-800">
              Clear cart
            </Button>
            <Button onClick={proceedToCheckout} className="bg-primary-600 text-white flex-1">
              Proceed to checkout
            </Button>
          </div>
        </div>
        <Button onClick={onClose} className="mt-2 text-gray-500">
          Close
        </Button>
      </aside>
    </div>
  );
};
