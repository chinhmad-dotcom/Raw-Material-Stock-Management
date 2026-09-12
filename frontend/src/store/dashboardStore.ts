import create from 'zustand';
import type { DashboardSummary } from '../types/dashboard';
import { fetchDashboardSummary, fetchAvailableDates } from '../api/dashboard';

interface DashboardState {
  summary: DashboardSummary | null;
  loading: boolean;
  error: string | null;
  availableDates: string[];
  selectedDate: string | null;
  loadDashboard: (date?: string) => Promise<void>;
  loadAvailableDates: () => Promise<void>;
  setSelectedDate: (date: string) => void;
}

export const useDashboardStore = create<DashboardState>((set, get) => ({
  summary: null,
  loading: false,
  error: null,
  availableDates: [],
  selectedDate: null,
  
  loadDashboard: async (date?: string) => {
    set({ loading: true, error: null });
    try {
      const targetDate = date || get().selectedDate || undefined;
      const [summary, configRes] = await Promise.all([
        fetchDashboardSummary(targetDate),
        fetch('http://localhost:5147/api/settings/silos').catch(() => null)
      ]);
      
      if (configRes && configRes.ok) {
        const configs = await configRes.json();
        summary.silos = summary.silos.filter((s: any) => {
           return !configs.find((c: any) => c.siloCode === s.siloCode && c.materialName === s.materialName && c.isHidden);
        });
        summary.additives = summary.additives.filter((a: any) => {
           const siloCode = a.warehouseLocation || 'WH';
           return !configs.find((c: any) => c.siloCode === siloCode && c.materialName === a.materialName && c.isHidden);
        });
      }
      
      set({ summary, loading: false });
    } catch (error) {
      set({ loading: false, error: error instanceof Error ? error.message : 'Failed to load dashboard' });
    }
  },
  
  loadAvailableDates: async () => {
    try {
      const dates = await fetchAvailableDates();
      const latestDate = dates.length > 0 ? dates[0] : null;
      set({ availableDates: dates, selectedDate: latestDate });
      
      // Load data for the latest date immediately
      if (latestDate) {
         get().loadDashboard(latestDate);
      } else {
         get().loadDashboard();
      }
    } catch (error) {
      console.error('Failed to load available dates', error);
      get().loadDashboard(); // fallback
    }
  },
  
  setSelectedDate: (date: string) => {
    set({ selectedDate: date });
    get().loadDashboard(date);
  }
}));
