import { useEffect, useCallback } from 'react'
import { useTransactionStore } from '@/store/transactionStore'
import { useUIStore } from '@/store/uiStore'
import { TransactionFormData, PaginationParams } from '@/types'

// Définir un type plus spécifique pour les paramètres
type FetchTransactionsParams = PaginationParams & {
  type?: 'entree' | 'sortie'
  devise?: string
  categorieId?: string
}

interface UseTransactionsReturn {
  transactions: any[]
  selectedTransaction: any | null
  total: number
  page: number
  limit: number
  pages: number
  isLoading: boolean
  error: string | null
  reportData: any | null
  fetchTransactions: (params?: FetchTransactionsParams) => Promise<void>
  fetchTransactionById: (id: string) => Promise<void>
  createTransaction: (data: TransactionFormData) => Promise<boolean>
  updateTransaction: (id: string, data: Partial<TransactionFormData>) => Promise<boolean>
  deleteTransaction: (id: string) => Promise<boolean>
  fetchReport: (params?: { periode?: string; dateDebut?: string; dateFin?: string }) => Promise<void>
  setPage: (page: number) => void
  clearError: () => void
}

export const useTransactions = (autoFetch: boolean = true, initialParams?: FetchTransactionsParams): UseTransactionsReturn => {
  const {
    transactions,
    selectedTransaction,
    total,
    page,
    limit,
    pages,
    isLoading,
    error,
    reportData,
    fetchTransactions: storeFetchTransactions,
    fetchTransactionById: storeFetchTransactionById,
    createTransaction: storeCreateTransaction,
    updateTransaction: storeUpdateTransaction,
    deleteTransaction: storeDeleteTransaction,
    fetchReport: storeFetchReport,
    setPage: storeSetPage,
    clearError: storeClearError,
  } = useTransactionStore()
  
  const { showNotification } = useUIStore()

  useEffect(() => {
    if (autoFetch) {
      console.log('🔄 Auto-fetching transactions with params:', initialParams)
      storeFetchTransactions(initialParams)
    }
  }, [autoFetch, initialParams, storeFetchTransactions])

  const fetchTransactions = useCallback(async (params?: FetchTransactionsParams) => {
    console.log('📊 Fetching transactions with params:', params)
    await storeFetchTransactions(params)
  }, [storeFetchTransactions])

  const fetchTransactionById = useCallback(async (id: string) => {
    console.log('🔍 Fetching transaction by id:', id)
    await storeFetchTransactionById(id)
  }, [storeFetchTransactionById])

  const createTransaction = useCallback(async (data: TransactionFormData): Promise<boolean> => {
    console.log('💰 Creating transaction:', data)
    const success = await storeCreateTransaction(data)
    if (success) {
      showNotification('Transaction enregistrée avec succès', 'success')
    } else {
      showNotification(error || 'Erreur lors de l\'enregistrement', 'error')
    }
    return success
  }, [storeCreateTransaction, showNotification, error])

  const updateTransaction = useCallback(async (id: string, data: Partial<TransactionFormData>): Promise<boolean> => {
    console.log('✏️ Updating transaction:', id, data)
    const success = await storeUpdateTransaction(id, data)
    if (success) {
      showNotification('Transaction modifiée avec succès', 'success')
    } else {
      showNotification(error || 'Erreur lors de la modification', 'error')
    }
    return success
  }, [storeUpdateTransaction, showNotification, error])

  const deleteTransaction = useCallback(async (id: string): Promise<boolean> => {
    console.log('🗑️ Deleting transaction:', id)
    const success = await storeDeleteTransaction(id)
    if (success) {
      showNotification('Transaction supprimée avec succès', 'success')
    } else {
      showNotification(error || 'Erreur lors de la suppression', 'error')
    }
    return success
  }, [storeDeleteTransaction, showNotification, error])

  const fetchReport = useCallback(async (params?: { periode?: string; dateDebut?: string; dateFin?: string }) => {
    console.log('📊 Fetching financial report with params:', params)
    await storeFetchReport(params)
  }, [storeFetchReport])

  return {
    transactions,
    selectedTransaction,
    total,
    page,
    limit,
    pages,
    isLoading,
    error,
    reportData,
    fetchTransactions,
    fetchTransactionById,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    fetchReport,
    setPage: storeSetPage,
    clearError: storeClearError,
  }
}