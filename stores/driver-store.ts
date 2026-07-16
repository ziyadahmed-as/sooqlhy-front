// stores/driver-store.ts — Driver global state
import { create } from 'zustand';
import {
  getDriverProfile,
  getDriverStats,
  getDriverKycStatus,
  fetchDriverAssignments,
  toggleAvailability,
  updateLocation,
  type DriverProfile,
  type DriverStats,
  type DriverKycStatus,
  type DriverOrder,
} from '@/lib/api/driver';

interface DriverState {
  profile: DriverProfile | null;
  stats: DriverStats | null;
  kycStatus: DriverKycStatus | null;
  assignments: DriverOrder[];
  profileLoading: boolean;
  statsLoading: boolean;
  assignmentsLoading: boolean;
  error: string | null;

  loadProfile: () => Promise<void>;
  loadStats: () => Promise<void>;
  loadKycStatus: () => Promise<void>;
  loadAssignments: () => Promise<void>;
  loadAll: () => Promise<void>;
  toggleOnline: () => Promise<void>;
  pushLocation: (lat: number, lng: number) => Promise<void>;
  setProfile: (p: DriverProfile) => void;
}

export const useDriverStore = create<DriverState>((set, get) => ({
  profile: null,
  stats: null,
  kycStatus: null,
  assignments: [],
  profileLoading: false,
  statsLoading: false,
  assignmentsLoading: false,
  error: null,

  async loadProfile() {
    set({ profileLoading: true, error: null });
    try {
      const profile = await getDriverProfile();
      set({ profile, profileLoading: false });
    } catch (e: any) {
      set({ error: e?.response?.data?.detail || 'Failed to load profile', profileLoading: false });
    }
  },

  async loadStats() {
    set({ statsLoading: true });
    try {
      const stats = await getDriverStats();
      set({ stats, statsLoading: false });
    } catch {
      set({ statsLoading: false });
    }
  },

  async loadKycStatus() {
    try {
      const kycStatus = await getDriverKycStatus();
      set({ kycStatus });
    } catch {
      // silently ignore — guard component handles redirection
    }
  },

  async loadAssignments() {
    set({ assignmentsLoading: true });
    try {
      const assignments = await fetchDriverAssignments();
      set({ assignments, assignmentsLoading: false });
    } catch {
      set({ assignmentsLoading: false });
    }
  },

  async loadAll() {
    await Promise.allSettled([
      get().loadProfile(),
      get().loadStats(),
      get().loadKycStatus(),
      get().loadAssignments(),
    ]);
  },

  async toggleOnline() {
    try {
      const result = await toggleAvailability();
      set((state) => ({
        profile: state.profile ? { ...state.profile, status: result.status as any } : null,
      }));
    } catch (e: any) {
      set({ error: e?.response?.data?.detail || 'Failed to toggle availability' });
    }
  },

  async pushLocation(lat: number, lng: number) {
    try {
      const result = await updateLocation(lat, lng);
      set((state) => ({
        profile: state.profile
          ? {
              ...state.profile,
              latitude: result.latitude,
              longitude: result.longitude,
              location_updated_at: result.location_updated_at,
            }
          : null,
      }));
    } catch {
      // silent — location updates are best-effort
    }
  },

  setProfile(p: DriverProfile) {
    set({ profile: p });
  },
}));
