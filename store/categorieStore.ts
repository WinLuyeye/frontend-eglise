import { create } from 'zustand'
import { Categorie } from '@/types'
import { categoriesAPI } from '@/lib/api'

interface CategorieState {
  categories: Categorie[]
  entrees: Categorie[]
  sorties: Categorie[]
  isLoading: boolean
  error: string | null
  
  fetchCategories: () => Promise<void>
  createCategorie: (data: { nom: string; type: 'entree' | 'sortie'; description?: string }) => Promise<boolean>
  updateCategorie: (id: string, data: Partial<Categorie>) => Promise<boolean>
  deleteCategorie: (id: string) => Promise<boolean>
  getCategoriesByType: (type: 'entree' | 'sortie') => Categorie[]
  clearError: () => void
}

export const useCategorieStore = create<CategorieState>((set, get) => ({
  categories: [],
  entrees: [],
  sorties: [],
  isLoading: false,
  error: null,

  fetchCategories: async () => {
    set({ isLoading: true, error: null })
    try {
      const response = await categoriesAPI.getAll()
      const categories = response.data.data
      const entrees = categories.filter(c => c.type === 'entree')
      const sorties = categories.filter(c => c.type === 'sortie')
      
      set({
        categories,
        entrees,
        sorties,
        isLoading: false,
      })
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.response?.data?.message || 'Erreur lors du chargement des catégories',
      })
    }
  },

  createCategorie: async (data) => {
    set({ isLoading: true, error: null })
    try {
      await categoriesAPI.create(data)
      await get().fetchCategories()
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

  updateCategorie: async (id, data) => {
    set({ isLoading: true, error: null })
    try {
      await categoriesAPI.update(id, data)
      await get().fetchCategories()
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

  deleteCategorie: async (id) => {
    set({ isLoading: true, error: null })
    try {
      await categoriesAPI.delete(id)
      await get().fetchCategories()
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

  getCategoriesByType: (type) => {
    return get().categories.filter(c => c.type === type)
  },

  clearError: () => set({ error: null }),
}))