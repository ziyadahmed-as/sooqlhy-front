// stores/cart-store.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { CartItem, Product } from "../lib/types";

type CartState = {
  items: CartItem[];
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  total: number;
};


export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem(product, quantity = 1) {
        const existing = get().items.find((i) => i.product.id === product.id);
        if (existing) {
          get().updateQuantity(product.id, existing.quantity + quantity);
          return;
        }
        set({ items: [...get().items, { product, quantity }] });
      },
      removeItem(productId) {
        set({ items: get().items.filter((i) => i.product.id !== productId) });
      },
      updateQuantity(productId, quantity) {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }
        set({
          items: get().items.map((i) =>
            i.product.id === productId ? { ...i, quantity } : i
          ),
        });
      },
      clearCart() {
        set({ items: [] });
      },
      get total() {
        return get().items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
      },
    }),
    {
      name: 'cart-storage',
      storage: createJSONStorage(() => localStorage)
    }
  )
);
