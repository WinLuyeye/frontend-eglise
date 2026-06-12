import { useEffect, useCallback } from 'react'
import { useMemberStore } from '@/store/memberStore'
import { useUIStore } from '@/store/uiStore'
import { MembreFormData, PaginationParams } from '@/types'

interface UseMembersReturn {
  members: any[]
  selectedMember: any | null
  total: number
  page: number
  limit: number
  pages: number
  isLoading: boolean
  error: string | null
  fetchMembers: (params?: PaginationParams) => Promise<void>
  fetchMemberById: (id: string) => Promise<void>
  createMember: (data: MembreFormData) => Promise<boolean>
  updateMember: (id: string, data: Partial<MembreFormData>) => Promise<boolean>
  deleteMember: (id: string) => Promise<boolean>
  setPage: (page: number) => void
  clearError: () => void
}

export const useMembers = (autoFetch: boolean = true, initialParams?: PaginationParams): UseMembersReturn => {
  const {
    members,
    selectedMember,
    total,
    page,
    limit,
    pages,
    isLoading,
    error,
    fetchMembers: storeFetchMembers,
    fetchMemberById: storeFetchMemberById,
    createMember: storeCreateMember,
    updateMember: storeUpdateMember,
    deleteMember: storeDeleteMember,
    setPage: storeSetPage,
    clearError: storeClearError,
  } = useMemberStore()
  
  const { showNotification } = useUIStore()

  useEffect(() => {
    if (autoFetch) {
      storeFetchMembers(initialParams)
    }
  }, [autoFetch, initialParams, storeFetchMembers])

  const fetchMembers = useCallback(async (params?: PaginationParams) => {
    await storeFetchMembers(params)
  }, [storeFetchMembers])

  const fetchMemberById = useCallback(async (id: string) => {
    await storeFetchMemberById(id)
  }, [storeFetchMemberById])

  const createMember = useCallback(async (data: MembreFormData): Promise<boolean> => {
    const success = await storeCreateMember(data)
    if (success) {
      showNotification('Membre créé avec succès', 'success')
    } else {
      showNotification(error || 'Erreur lors de la création', 'error')
    }
    return success
  }, [storeCreateMember, showNotification, error])

  const updateMember = useCallback(async (id: string, data: Partial<MembreFormData>): Promise<boolean> => {
    const success = await storeUpdateMember(id, data)
    if (success) {
      showNotification('Membre modifié avec succès', 'success')
    } else {
      showNotification(error || 'Erreur lors de la modification', 'error')
    }
    return success
  }, [storeUpdateMember, showNotification, error])

  const deleteMember = useCallback(async (id: string): Promise<boolean> => {
    const success = await storeDeleteMember(id)
    if (success) {
      showNotification('Membre supprimé avec succès', 'success')
    } else {
      showNotification(error || 'Erreur lors de la suppression', 'error')
    }
    return success
  }, [storeDeleteMember, showNotification, error])

  return {
    members,
    selectedMember,
    total,
    page,
    limit,
    pages,
    isLoading,
    error,
    fetchMembers,
    fetchMemberById,
    createMember,
    updateMember,
    deleteMember,
    setPage: storeSetPage,
    clearError: storeClearError,
  }
}

// Hook pour les formulaires de membres
export const useMemberForm = (memberId?: string) => {
  const { selectedMember, fetchMemberById, isLoading } = useMembers(false)
  
  useEffect(() => {
    if (memberId) {
      fetchMemberById(memberId)
    }
  }, [memberId, fetchMemberById])

  return {
    initialData: selectedMember,
    isLoading,
    isEditing: !!memberId,
  }
}