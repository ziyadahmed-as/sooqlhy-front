// stores/toast-store.ts
import create from 'zustand';
import { persist } from 'zustand/middleware';
import { ToastMessage } from '@/lib/types';
import { v4 as uuidv4 } from 'uuid';

type ToastState = {
  toasts: ToastMessage[];
  addToast: (title: string, description?: string, variant?: ToastMessage['variant']) => void;
  removeToast: (id: string) => void;
};

export const useToastStore = create<ToastState>()(
  persist(
    (set, get) => ({
      toasts: [],
      addToast(title, description = '', variant = 'info') {
        const id = uuidv4();
        const newToast: ToastMessage = { id, title, description, variant };
        set({ toasts: [...get().toasts, newToast] });
        // Auto‑remove after 5 seconds
        setTimeout(() => get().removeToast(id), 5000);
      },
      removeToast(id) {
        set({ toasts: get().toasts.filter((t) => t.id !== id) });
      },
    }),
    {
      name: 'toast-storage',
      getStorage: () => localStorage,
    }
  )
);
