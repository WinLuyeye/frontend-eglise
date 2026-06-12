import { create } from 'zustand'
import { Membre, MembreFormData, PaginationParams, PaginatedResponse } from '@/types'
import { membresAPI } from '@/lib/api'

interface MemberState {
  members: Membre[]
  selectedMember: Membre | null
  total: number
  page: number
  limit: number
  pages: number
  isLoading: boolean
  error: string | null
  
  // Actions
  fetchMembers: (params?: PaginationParams) => Promise<void>
  fetchMemberById: (id: string) => Promise<void>
  createMember: (data: MembreFormData) => Promise<boolean>
  updateMember: (id: string, data: Partial<MembreFormData>) => Promise<boolean>
  deleteMember: (id: string) => Promise<boolean>
  setPage: (page: number) => void
  clearError: () => void
}

export const useMemberStore = create<MemberState>((set, get) => ({
  members: [],
  selectedMember: null,
  total: 0,
  page: 1,
  limit: 50,
  pages: 0,
  isLoading: false,
  error: null,

  fetchMembers: async (params = {}) => {
    set({ isLoading: true, error: null })
    try {
      const { page = get().page, limit = get().limit } = params
      const response = await membresAPI.getAll({ page, limit, ...params })
      const data = response.data as PaginatedResponse<Membre>
      
      set({
        members: data.data,
        total: data.pagination.total,
        page: data.pagination.page,
        limit: data.pagination.limit,
        pages: data.pagination.pages,
        isLoading: false,
      })
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.response?.data?.message || 'Erreur lors du chargement des membres',
      })
    }
  },

  fetchMemberById: async (id: string) => {
    set({ isLoading: true, error: null })
    try {
      const response = await membresAPI.getById(id)
      set({
        selectedMember: response.data.data,
        isLoading: false,
      })
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.response?.data?.message || 'Membre non trouvé',
      })
    }
  },

  createMember: async (data: MembreFormData) => {
    set({ isLoading: true, error: null })
    try {
      await membresAPI.create(data)
      await get().fetchMembers({ page: 1 })
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

  updateMember: async (id: string, data: Partial<MembreFormData>) => {
    set({ isLoading: true, error: null })
    try {
      await membresAPI.update(id, data)
      await get().fetchMembers({ page: get().page })
      if (get().selectedMember?.id === id) {
        await get().fetchMemberById(id)
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

  deleteMember: async (id: string) => {
    set({ isLoading: true, error: null })
    try {
      await membresAPI.delete(id)
      await get().fetchMembers({ page: get().page })
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

  setPage: (page: number) => {
    set({ page })
    get().fetchMembers({ page })
  },

  clearError: () => set({ error: null }),
}))