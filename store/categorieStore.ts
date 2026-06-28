// store/categorieStore.ts
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
  clearError: () => void
}

export const useCategorieStore = create<CategorieState>((set, get) => ({
  categories: [],
  entrees: [],
  sorties: [],
  isLoading: false,
  error: null,

  fetchCategories: async () => {
    console.log('📂 Fetching categories...')
    set({ isLoading: true, error: null })
    try {
      const response = await categoriesAPI.getAll()
      console.log('📂 Categories response:', response.data)
      
      // ✅ Vérifier la structure de la réponse
      let categories: Categorie[] = []
      
      if (response.data?.success && response.data?.data) {
        categories = response.data.data
      } else if (Array.isArray(response.data)) {
        categories = response.data
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        categories = response.data.data
      }
      
      console.log(`📂 ${categories.length} catégories récupérées`)
      
      // ✅ Filtrer par type avec normalisation
      const entrees = categories.filter(c => 
        c.type?.toLowerCase() === 'entree' || 
        c.type?.toLowerCase() === 'revenu' ||
        c.type?.toUpperCase() === 'REVENU'
      )
      
      const sorties = categories.filter(c => 
        c.type?.toLowerCase() === 'sortie' || 
        c.type?.toLowerCase() === 'depense' ||
        c.type?.toUpperCase() === 'DEPENSE'
      )
      
      console.log(`📂 Entrées: ${entrees.length}, Sorties: ${sorties.length}`)
      
      set({
        categories,
        entrees,
        sorties,
        isLoading: false,
        error: null,
      })
    } catch (error: any) {
      console.error('❌ Error fetching categories:', error)
      set({
        isLoading: false,
        error: error.response?.data?.message || error.message || 'Erreur lors du chargement des catégories',
      })
    }
  },

  createCategorie: async (data) => {
    set({ isLoading: true, error: null })
    try {
      const response = await categoriesAPI.create(data)
      if (response.data?.success) {
        await get().fetchCategories()
        return true
      }
      throw new Error(response.data?.message || 'Erreur lors de la création')
    } catch (error: any) {
      console.error('❌ Error creating category:', error)
      set({ isLoading: false, error: error.message })
      return false
    }
  },

  updateCategorie: async (id, data) => {
    set({ isLoading: true, error: null })
    try {
      const response = await categoriesAPI.update(id, data)
      if (response.data?.success) {
        await get().fetchCategories()
        return true
      }
      throw new Error(response.data?.message || 'Erreur lors de la modification')
    } catch (error: any) {
      console.error('❌ Error updating category:', error)
      set({ isLoading: false, error: error.message })
      return false
    }
  },

  deleteCategorie: async (id) => {
    set({ isLoading: true, error: null })
    try {
      const response = await categoriesAPI.delete(id)
      if (response.data?.success) {
        await get().fetchCategories()
        return true
      }
      throw new Error(response.data?.message || 'Erreur lors de la suppression')
    } catch (error: any) {
      console.error('❌ Error deleting category:', error)
      set({ isLoading: false, error: error.message })
      return false
    }
  },

  clearError: () => set({ error: null }),
}))