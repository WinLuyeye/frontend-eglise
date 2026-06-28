// src/store/uiStore.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface UIState {
  sidebarOpen: boolean
  darkMode: boolean
  loading: boolean
  notification: {
    show: boolean
    message: string
    type: 'success' | 'error' | 'info' | 'warning'
  } | null
  
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
  toggleDarkMode: () => void
  setDarkMode: (dark: boolean) => void
  setLoading: (loading: boolean) => void
  showNotification: (message: string, type: 'success' | 'error' | 'info' | 'warning') => void
  hideNotification: () => void
}

export const useUIStore = create<UIState>()(
  persist(
    (set, get) => ({
      sidebarOpen: true,
      darkMode: false,
      loading: false,
      notification: null,

      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      
      toggleDarkMode: () => {
        const newDarkMode = !get().darkMode
        set({ darkMode: newDarkMode })
        // Appliquer immédiatement la classe dark
        if (newDarkMode) {
          document.documentElement.classList.add('dark')
        } else {
          document.documentElement.classList.remove('dark')
        }
      },
      
      setDarkMode: (dark) => {
        set({ darkMode: dark })
        if (dark) {
          document.documentElement.classList.add('dark')
        } else {
          document.documentElement.classList.remove('dark')
        }
      },
      
      setLoading: (loading) => set({ loading }),
      
      showNotification: (message, type) =>
        set({
          notification: { show: true, message, type },
        }),
      
      hideNotification: () =>
        set({ notification: null }),
    }),
    {
      name: 'ui-storage',
      partialize: (state) => ({
        sidebarOpen: state.sidebarOpen,
        darkMode: state.darkMode,
      }),
    }
  )
)