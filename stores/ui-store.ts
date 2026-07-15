// stores/ui-store.ts — Global UI state (modals, drawers, overlays)
import { create } from 'zustand';

export type AuthModalMode = 'login' | 'register' | 'forgot' | null;

interface UIState {
  authModal: AuthModalMode;
  cartDrawerOpen: boolean;
  openAuthModal: (mode: AuthModalMode) => void;
  closeAuthModal: () => void;
  openCartDrawer: () => void;
  closeCartDrawer: () => void;
  toggleCartDrawer: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  authModal: null,
  cartDrawerOpen: false,
  openAuthModal: (mode) => set({ authModal: mode }),
  closeAuthModal: () => set({ authModal: null }),
  openCartDrawer: () => set({ cartDrawerOpen: true }),
  closeCartDrawer: () => set({ cartDrawerOpen: false }),
  toggleCartDrawer: () => set((s) => ({ cartDrawerOpen: !s.cartDrawerOpen })),
}));
