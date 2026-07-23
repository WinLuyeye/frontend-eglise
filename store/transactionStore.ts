// store/transactionStore.ts

import { create } from 'zustand'
import { Transaction, TransactionFormData, PaginationParams, PaginatedResponse } from '@/types'
import { transactionsAPI } from '@/lib/api'

interface TransactionState {
  transactions: Transaction[]
  selectedTransaction: Transaction | null
  total: number
  page: number
  limit: number
  pages: number
  isLoading: boolean
  error: string | null
  reportData: any | null
  
  fetchTransactions: (params?: PaginationParams & { type?: 'entree' | 'sortie'; devise?: string; categorieId?: string }) => Promise<void>
  fetchTransactionById: (id: string) => Promise<void>
  createTransaction: (data: TransactionFormData) => Promise<boolean>
  updateTransaction: (id: string, data: Partial<TransactionFormData>) => Promise<boolean>
  deleteTransaction: (id: string) => Promise<boolean>
  fetchReport: (params?: { periode?: string; dateDebut?: string; dateFin?: string }) => Promise<void>
  setPage: (page: number) => void
  clearError: () => void
}

export const useTransactionStore = create<TransactionState>((set, get) => ({
  transactions: [],
  selectedTransaction: null,
  total: 0,
  page: 1,
  limit: 50,
  pages: 0,
  isLoading: false,
  error: null,
  reportData: null,

  fetchTransactions: async (params = {}) => {
    set({ isLoading: true, error: null })
    try {
      const { page = get().page, limit = get().limit } = params
      const apiParams: any = {
        page,
        limit,
        ...(params.type && { type: params.type }),
        ...(params.categorieId && { categorieId: params.categorieId }),
        ...(params.devise && { devise: params.devise }),
        ...(params.dateDebut && { dateDebut: params.dateDebut }),
        ...(params.dateFin && { dateFin: params.dateFin }),
        ...(params.search && { search: params.search }),
        ...(params.statut && { statut: params.statut }),
        ...(params.departementId && { departementId: params.departementId }),
      }
      const response = await transactionsAPI.getAll(apiParams)
      const data = response.data as PaginatedResponse<Transaction>
      
      console.log('📊 Transactions fetched:', data.data?.length || 0)
      console.log('💵 Premier devise:', data.data?.[0]?.devise)
      
      set({
        transactions: data.data || [],
        total: data.pagination?.total || 0,
        page: data.pagination?.page || 1,
        limit: data.pagination?.limit || 50,
        pages: data.pagination?.pages || 0,
        isLoading: false,
      })
    } catch (error: any) {
      console.error('❌ Error fetching transactions:', error)
      set({
        isLoading: false,
        error: error.response?.data?.message || 'Erreur lors du chargement des transactions',
      })
    }
  },

  fetchTransactionById: async (id: string) => {
    set({ isLoading: true, error: null })
    try {
      const response = await transactionsAPI.getById(id)
      set({
        selectedTransaction: response.data.data,
        isLoading: false,
      })
    } catch (error: any) {
      console.error('❌ Error fetching transaction by id:', error)
      set({
        isLoading: false,
        error: error.response?.data?.message || 'Transaction non trouvée',
      })
    }
  },

  // ✅ MODIFIÉ - Suppression des champs de conversion
  createTransaction: async (data: TransactionFormData) => {
    set({ isLoading: true, error: null })
    try {
      const cleanedData: any = {
        type: data.type,
        categorieId: data.categorieId.trim(),
        montant: typeof data.montant === 'string' 
          ? parseFloat(data.montant) 
          : Number(data.montant),
        devise: typeof data.devise === 'string' && data.devise.trim() !== ''
          ? data.devise.trim().toUpperCase()
          : 'CDF',
        dateTransaction: data.dateTransaction,
      }

      if (data.description && data.description.trim() !== '') {
        cleanedData.description = data.description.trim()
      }
      
      if (data.membreId && data.membreId.trim() !== '') {
        cleanedData.membreId = data.membreId.trim()
      }

      console.log('💰 Données nettoyées avant envoi:', cleanedData)

      const response = await transactionsAPI.create(cleanedData)
      console.log('💰 Transaction created:', response.data.data)
      
      await get().fetchTransactions({ page: 1 })
      set({ isLoading: false })
      return true
    } catch (error: any) {
      console.error('❌ Error creating transaction:', error)
      console.error('❌ Réponse d\'erreur détaillée:', error.response?.data)
      set({
        isLoading: false,
        error: error.response?.data?.message || 'Erreur lors de la création',
      })
      return false
    }
  },

  // ✅ MODIFIÉ - Suppression des champs de conversion
  updateTransaction: async (id: string, data: Partial<TransactionFormData>) => {
    set({ isLoading: true, error: null })
    try {
      const cleanedData: any = {}
      
      if (data.type) cleanedData.type = data.type
      if (data.categorieId) cleanedData.categorieId = data.categorieId.trim()
      if (data.montant) cleanedData.montant = Number(data.montant)
      if (data.devise) cleanedData.devise = String(data.devise).trim().toUpperCase()
      if (data.dateTransaction) cleanedData.dateTransaction = data.dateTransaction
      if (data.description) cleanedData.description = data.description.trim()
      if (data.membreId) cleanedData.membreId = data.membreId.trim()

      console.log('✏️ Données nettoyées pour update:', cleanedData)
      
      const response = await transactionsAPI.update(id, cleanedData)
      console.log('✏️ Transaction updated:', response.data.data)
      
      await get().fetchTransactions({ page: get().page })
      set({ 
        isLoading: false,
        selectedTransaction: response.data.data 
      })
      return true
    } catch (error: any) {
      console.error('❌ Error updating transaction:', error)
      set({
        isLoading: false,
        error: error.response?.data?.message || 'Erreur lors de la modification',
      })
      return false
    }
  },

  deleteTransaction: async (id: string) => {
    set({ isLoading: true, error: null })
    try {
      await transactionsAPI.delete(id)
      console.log('🗑️ Transaction deleted:', id)
      await get().fetchTransactions({ page: get().page })
      set({ isLoading: false })
      return true
    } catch (error: any) {
      console.error('❌ Error deleting transaction:', error)
      set({
        isLoading: false,
        error: error.response?.data?.message || 'Erreur lors de la suppression',
      })
      return false
    }
  },

  fetchReport: async (params = {}) => {
    console.log('📊 fetchReport called with params:', params)
    set({ isLoading: true, error: null })
    try {
      const response = await transactionsAPI.getReport(params)
      console.log('📡 Report response status:', response.status)
      
      const data = response.data
      console.log('📊 Report data received:', data)
      
      if (data?.success) {
        const reportData = data.data
        console.log('📊 Stats par devise:', reportData?.statsParDevise)
        console.log('📊 Transactions USD:', reportData?.statsParDevise?.USD)
        console.log('📊 Transactions CDF:', reportData?.statsParDevise?.CDF)
        console.log('📊 Nombre total de transactions:', reportData?.nombreTransactions?.total || 0)
        
        set({
          reportData: reportData,
          isLoading: false,
          error: null,
        })
      } else {
        console.warn('⚠️ Report non réussi:', data)
        set({
          isLoading: false,
          error: data?.message || 'Erreur lors du chargement du rapport',
          reportData: null,
        })
      }
    } catch (error: any) {
      console.error('❌ Error fetching report:', error)
      console.error('❌ Error details:', error.response?.data)
      set({
        isLoading: false,
        error: error.response?.data?.message || error.message || 'Erreur lors du chargement du rapport',
        reportData: null,
      })
    }
  },

  setPage: (page: number) => {
    set({ page })
    get().fetchTransactions({ page })
  },

  clearError: () => set({ error: null }),
}))