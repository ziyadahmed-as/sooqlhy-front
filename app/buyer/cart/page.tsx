"use client";
import { useCartStore, useCartTotal } from '@/stores/cart-store';
import { addToCart } from '@/lib/api/catalog';
import { useAuthStore } from '@/stores/auth-store';
import { useRouter } from 'next/navigation';
import { Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { EmptyState } from '@/components/shared/EmptyState';
import { toast } from 'sonner';
import Link from 'next/link';
import Image from 'next/image';

export default function CartPage() {
  const { items, removeItem, updateQuantity, clearCart } = useCartStore();
  const total = useCartTotal();
  const { user } = useAuthStore();
  const router = useRouter();

  const handleCheckout = async () => {
    if (!user) {
      router.push('/auth/login');
      return;
    }
    // Sync cart to backend then navigate
    try {
      await Promise.all(
        items.map((item) =>
          addToCart({ product_id: item.product.id, quantity: item.quantity })
        )
      );
      router.push('/buyer/checkout');
    } catch {
      toast.error('Failed to sync cart. Please try again.');
    }
  };

  const getImageUrl = (product: any): string => {
    if (!product.images || product.images.length === 0) return '/placeholder.jpg';
    const img = product.images[0];
    return typeof img === 'string' ? img : img?.image || '/placeholder.jpg';
  };

  if (items.length === 0) {
    return (
      <div className="p-6 max-w-3xl mx-auto">
        <EmptyState
          title="Your cart is empty"
          description="Add some products to get started."
          icon={<ShoppingBag className="h-12 w-12" />}
          action={
            <Link href="/buyer/catalog" className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium">
              Browse Catalog
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Shopping Cart</h1>
        <button
          onClick={clearCart}
          className="text-sm text-red-500 hover:text-red-700 flex items-center gap-1"
        >
          <Trash2 className="h-3.5 w-3.5" /> Clear Cart
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Items */}
        <div className="lg:col-span-2 space-y-3">
          {items.map(({ product, quantity }) => (
            <div
              key={product.id}
              className="flex items-center gap-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 shadow-sm"
            >
              <div className="relative h-16 w-16 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                <Image
                  src={getImageUrl(product)}
                  alt={product.name || product.title || 'Product'}
                  fill
                  className="object-cover"
                  sizes="64px"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {product.name || product.title}
                </p>
                <p className="text-sm text-gray-500">${Number(product.price).toFixed(2)}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => updateQuantity(product.id, quantity - 1)}
                  className="w-7 h-7 rounded-full border border-gray-300 dark:border-gray-700 flex items-center justify-center text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  −
                </button>
                <span className="w-6 text-center text-sm font-medium">{quantity}</span>
                <button
                  onClick={() => updateQuantity(product.id, quantity + 1)}
                  className="w-7 h-7 rounded-full border border-gray-300 dark:border-gray-700 flex items-center justify-center text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  +
                </button>
              </div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white w-16 text-right">
                ${(Number(product.price) * quantity).toFixed(2)}
              </p>
              <button
                onClick={() => removeItem(product.id)}
                className="text-red-400 hover:text-red-600 p-1"
                aria-label="Remove item"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-sm h-fit space-y-4">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">Order Summary</h2>
          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
            <span>Subtotal ({items.reduce((s, i) => s + i.quantity, 0)} items)</span>
            <span>${total.toFixed(2)}</span>
          </div>
          <div className="border-t border-gray-200 dark:border-gray-800 pt-4 flex justify-between font-semibold text-gray-900 dark:text-white">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>
          <button
            onClick={handleCheckout}
            className="w-full flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold rounded-lg py-3 transition-colors"
          >
            Proceed to Checkout <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
