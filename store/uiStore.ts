import { create } from 'zustand'

interface UIState {
  sidebarOpen: boolean
  darkMode: boolean
  loading: boolean
  notification: {
    show: boolean
    message: string
    type: 'success' | 'error' | 'info' | 'warning'
  } | null
  
  // Actions
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
  toggleDarkMode: () => void
  setLoading: (loading: boolean) => void
  showNotification: (message: string, type: 'success' | 'error' | 'info' | 'warning') => void
  hideNotification: () => void
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,
  darkMode: false,
  loading: false,
  notification: null,

  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  
  toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),
  
  setLoading: (loading) => set({ loading }),
  
  showNotification: (message, type) =>
    set({
      notification: { show: true, message, type },
    }),
  
  hideNotification: () =>
    set({ notification: null }),
}))