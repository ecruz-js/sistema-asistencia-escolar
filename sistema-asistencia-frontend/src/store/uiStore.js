import { create } from "zustand";

export const useUIStore = create((set) => ({
  sidebarOpen: true,
  loading: false,
  currentDate: new Date().toISOString().split("T")[0],

  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setLoading: (loading) => set({ loading }),
  setCurrentDate: (date) => set({ currentDate: date }),
}));
