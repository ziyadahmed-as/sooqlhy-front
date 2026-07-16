// stores/moderator-store.ts
import { create } from 'zustand';
import {
  fetchModeratorStats, fetchMyZones,
  type ModeratorStats, type ModeratorZone,
} from '@/lib/api/moderator';

interface ModeratorState {
  stats: ModeratorStats | null;
  zones: ModeratorZone[];
  statsLoading: boolean;
  zonesLoading: boolean;
  error: string | null;
  loadStats: () => Promise<void>;
  loadZones: () => Promise<void>;
  loadAll: () => Promise<void>;
}

export const useModeratorStore = create<ModeratorState>((set, get) => ({
  stats: null,
  zones: [],
  statsLoading: false,
  zonesLoading: false,
  error: null,

  async loadStats() {
    set({ statsLoading: true, error: null });
    try {
      const stats = await fetchModeratorStats();
      set({ stats, statsLoading: false });
    } catch (e: any) {
      set({ error: e?.response?.data?.error || 'Failed to load stats', statsLoading: false });
    }
  },

  async loadZones() {
    set({ zonesLoading: true });
    try {
      const zones = await fetchMyZones();
      set({ zones, zonesLoading: false });
    } catch {
      set({ zonesLoading: false });
    }
  },

  async loadAll() {
    await Promise.allSettled([get().loadStats(), get().loadZones()]);
  },
}));
