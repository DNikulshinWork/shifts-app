import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface AppState {
  theme: 'light' | 'dark' | 'system';
  setTheme: (theme: 'light' | 'dark' | 'system') => void;

  currentDate: Date;
  setCurrentDate: (date: Date) => void;

  viewDate: Date;
  setViewDate: (date: Date) => void;
  goToPrevMonth: () => void;
  goToNextMonth: () => void;
  goToToday: () => void;

  loadedMonths: Set<string>;
  addLoadedMonth: (yearMonth: string) => void;
  clearLoadedMonths: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      theme: 'system',
      setTheme: (theme) => set({ theme }),

      currentDate: new Date(),
      setCurrentDate: (date) => set({ currentDate: date }),

      viewDate: new Date(),
      setViewDate: (date) => set({ viewDate: date }),

      goToPrevMonth: () => {
        const { viewDate } = get();
        const newDate = new Date(
          viewDate.getFullYear(),
          viewDate.getMonth() - 1,
          1
        );
        set({ viewDate: newDate });
      },

      goToNextMonth: () => {
        const { viewDate } = get();
        const newDate = new Date(
          viewDate.getFullYear(),
          viewDate.getMonth() + 1,
          1
        );
        set({ viewDate: newDate });
      },

      goToToday: () => {
        const today = new Date();
        set({ viewDate: today, currentDate: today });
      },

      loadedMonths: new Set(),
      addLoadedMonth: (yearMonth) => {
        set((state) => ({
          loadedMonths: new Set(state.loadedMonths).add(yearMonth),
        }));
      },
      clearLoadedMonths: () => set({ loadedMonths: new Set() }),
    }),
    {
      name: 'app-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        theme: state.theme,
        viewDate: state.viewDate.toISOString(),
        currentDate: state.currentDate.toISOString(),
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          if (typeof state.viewDate === 'string') {
            state.viewDate = new Date(state.viewDate);
          }
          if (typeof state.currentDate === 'string') {
            state.currentDate = new Date(state.currentDate);
          }
        }
      },
    }
  )
);
