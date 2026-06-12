import { create } from 'zustand'
import { Departement } from '@/types'
import { departementsAPI } from '@/lib/api'

interface DepartementState {
  departements: Departement[]
  selectedDepartement: Departement | null
  isLoading: boolean
  error: string | null
  
  fetchDepartements: () => Promise<void>
  fetchDepartementById: (id: string) => Promise<void>
  createDepartement: (data: { nom: string; description?: string; responsableId?: string }) => Promise<boolean>
  updateDepartement: (id: string, data: Partial<Departement>) => Promise<boolean>
  deleteDepartement: (id: string) => Promise<boolean>
  clearError: () => void
}

export const useDepartementStore = create<DepartementState>((set, get) => ({
  departements: [],
  selectedDepartement: null,
  isLoading: false,
  error: null,

  fetchDepartements: async () => {
    set({ isLoading: true, error: null })
    try {
      const response = await departementsAPI.getAll()
      set({
        departements: response.data.data,
        isLoading: false,
      })
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.response?.data?.message || 'Erreur lors du chargement des départements',
      })
    }
  },

  fetchDepartementById: async (id: string) => {
    set({ isLoading: true, error: null })
    try {
      const response = await departementsAPI.getById(id)
      set({
        selectedDepartement: response.data.data,
        isLoading: false,
      })
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.response?.data?.message || 'Département non trouvé',
      })
    }
  },

  createDepartement: async (data) => {
    set({ isLoading: true, error: null })
    try {
      await departementsAPI.create(data)
      await get().fetchDepartements()
      set({ isLoading: false })
      return true
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.response?.data?.message || 'Erreur lors de la création',
      })
      return false
    }
  },

  updateDepartement: async (id, data) => {
    set({ isLoading: true, error: null })
    try {
      await departementsAPI.update(id, data)
      await get().fetchDepartements()
      if (get().selectedDepartement?.id === id) {
        await get().fetchDepartementById(id)
      }
      set({ isLoading: false })
      return true
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.response?.data?.message || 'Erreur lors de la modification',
      })
      return false
    }
  },

  deleteDepartement: async (id) => {
    set({ isLoading: true, error: null })
    try {
      await departementsAPI.delete(id)
      await get().fetchDepartements()
      set({ isLoading: false })
      return true
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.response?.data?.message || 'Erreur lors de la suppression',
      })
      return false
    }
  },

  clearError: () => set({ error: null }),
}))