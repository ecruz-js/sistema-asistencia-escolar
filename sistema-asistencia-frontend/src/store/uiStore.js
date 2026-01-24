import { create } from "zustand";
import { persist } from "zustand/middleware";
import { format } from "date-fns";

export const useUIStore = create(
  persist(
    (set) => ({
      sidebarOpen: true,
      loading: false,
      darkMode: false,
      currentDate: format(new Date(), "yyyy-MM-dd"),

      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      setLoading: (loading) => set({ loading }),
      setCurrentDate: (date) => set({ currentDate: date }),
      toggleDarkMode: () => set((state) => {
        const newDarkMode = !state.darkMode;
        // Toggle dark class on document
        if (newDarkMode) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
        return { darkMode: newDarkMode };
      }),
      setDarkMode: (darkMode) => set(() => {
        if (darkMode) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
        return { darkMode };
      }),
    }),
    {
      name: 'ui-storage',
      onRehydrateStorage: () => (state) => {
        // Apply dark mode on initial load
        if (state?.darkMode) {
          document.documentElement.classList.add('dark');
        }
        // Reset date to current date on page reload
        if (state) {
          state.currentDate = format(new Date(), "yyyy-MM-dd");
        }
      },
    }
  )
);
