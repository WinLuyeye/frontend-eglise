import { create } from 'zustand'
import { DashboardGlobal } from '@/types'
import { dashboardAPI } from '@/lib/api'

interface DashboardState {
  globalData: DashboardGlobal | null
  tresorierData: any | null
  departementData: any | null
  isLoading: boolean
  error: string | null
  
  fetchGlobalDashboard: () => Promise<void>
  fetchTresorierDashboard: () => Promise<void>
  fetchDepartementDashboard: () => Promise<void>
  clearError: () => void
}

export const useDashboardStore = create<DashboardState>((set, get) => ({
  globalData: null,
  tresorierData: null,
  departementData: null,
  isLoading: false,
  error: null,

  fetchGlobalDashboard: async () => {
    console.log('📊 DashboardStore: Fetching global dashboard...')
    set({ isLoading: true, error: null })
    try {
      const response = await dashboardAPI.getGlobal()
      console.log('📊 DashboardStore: Response status:', response.status)
      console.log('📊 DashboardStore: Response data:', response.data)
      
      if (response.data && response.data.success && response.data.data) {
        set({
          globalData: response.data.data,
          isLoading: false,
        })
        console.log('✅ DashboardStore: Data set successfully')
      } else {
        console.warn('⚠️ DashboardStore: No data in response', response.data)
        set({ isLoading: false, globalData: null })
      }
    } catch (error: any) {
      console.error('❌ DashboardStore: Error fetching dashboard', error)
      set({
        isLoading: false,
        error: error.response?.data?.message || error.message || 'Erreur lors du chargement du dashboard',
        globalData: null,
      })
    }
  },

  fetchTresorierDashboard: async () => {
    set({ isLoading: true, error: null })
    try {
      const response = await dashboardAPI.getTresorier()
      set({
        tresorierData: response.data.data,
        isLoading: false,
      })
    } catch (error: any) {
      console.error('❌ Error fetching tresorier dashboard:', error)
      set({
        isLoading: false,
        error: error.response?.data?.message || 'Erreur lors du chargement du dashboard trésorier',
      })
    }
  },

  fetchDepartementDashboard: async () => {
    set({ isLoading: true, error: null })
    try {
      const response = await dashboardAPI.getDepartement()
      set({
        departementData: response.data.data,
        isLoading: false,
      })
    } catch (error: any) {
      console.error('❌ Error fetching departement dashboard:', error)
      set({
        isLoading: false,
        error: error.response?.data?.message || 'Erreur lors du chargement du dashboard département',
      })
    }
  },

  clearError: () => set({ error: null }),
}))