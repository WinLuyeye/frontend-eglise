import { create } from 'zustand'
import { Rapport, RapportFormData, PaginationParams, PaginatedResponse } from '@/types'
import { rapportsAPI } from '@/lib/api'

interface RapportState {
  rapports: Rapport[]
  selectedRapport: Rapport | null
  total: number
  page: number
  limit: number
  pages: number
  isLoading: boolean
  error: string | null
  
  fetchRapports: (params?: PaginationParams & { periodeDebut?: string; periodeFin?: string }) => Promise<void>
  fetchRapportById: (id: string) => Promise<void>
  createRapport: (data: RapportFormData) => Promise<boolean>
  updateRapport: (id: string, data: Partial<RapportFormData>) => Promise<boolean>
  deleteRapport: (id: string) => Promise<boolean>
  setPage: (page: number) => void
  clearError: () => void
}

export const useRapportStore = create<RapportState>((set, get) => ({
  rapports: [],
  selectedRapport: null,
  total: 0,
  page: 1,
  limit: 50,
  pages: 0,
  isLoading: false,
  error: null,

  fetchRapports: async (params = {}) => {
    set({ isLoading: true, error: null })
    try {
      const { page = get().page, limit = get().limit } = params
      // Pour le chef département, le backend filtre automatiquement
      const response = await rapportsAPI.getAll({ page, limit, ...params })
      const data = response.data as PaginatedResponse<Rapport>
      
      set({
        rapports: data.data,
        total: data.pagination.total,
        page: data.pagination.page,
        limit: data.pagination.limit,
        pages: data.pagination.pages,
        isLoading: false,
      })
    } catch (error: any) {
      console.error('❌ Error fetching rapports:', error)
      set({
        isLoading: false,
        error: error.response?.data?.message || 'Erreur lors du chargement des rapports',
      })
    }
  },

  fetchRapportById: async (id: string) => {
    set({ isLoading: true, error: null })
    try {
      const response = await rapportsAPI.getById(id)
      set({
        selectedRapport: response.data.data,
        isLoading: false,
      })
    } catch (error: any) {
      console.error('❌ Error fetching rapport by id:', error)
      set({
        isLoading: false,
        error: error.response?.data?.message || 'Rapport non trouvé',
      })
    }
  },

  createRapport: async (data: RapportFormData) => {
    set({ isLoading: true, error: null })
    try {
      await rapportsAPI.create(data)
      await get().fetchRapports({ page: 1 })
      set({ isLoading: false })
      return true
    } catch (error: any) {
      console.error('❌ Error creating rapport:', error)
      set({
        isLoading: false,
        error: error.response?.data?.message || 'Erreur lors de la création',
      })
      return false
    }
  },

  updateRapport: async (id: string, data: Partial<RapportFormData>) => {
    set({ isLoading: true, error: null })
    try {
      await rapportsAPI.update(id, data)
      await get().fetchRapports({ page: get().page })
      set({ isLoading: false })
      return true
    } catch (error: any) {
      console.error('❌ Error updating rapport:', error)
      set({
        isLoading: false,
        error: error.response?.data?.message || 'Erreur lors de la modification',
      })
      return false
    }
  },

  deleteRapport: async (id: string) => {
    set({ isLoading: true, error: null })
    try {
      await rapportsAPI.delete(id)
      await get().fetchRapports({ page: get().page })
      set({ isLoading: false })
      return true
    } catch (error: any) {
      console.error('❌ Error deleting rapport:', error)
      set({
        isLoading: false,
        error: error.response?.data?.message || 'Erreur lors de la suppression',
      })
      return false
    }
  },

  setPage: (page: number) => {
    set({ page })
    get().fetchRapports({ page })
  },

  clearError: () => set({ error: null }),
}))