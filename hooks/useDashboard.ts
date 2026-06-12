import { useEffect, useCallback } from 'react'
import { useDashboardStore } from '@/store/dashboardStore'
import { useUIStore } from '@/store/uiStore'
import { DashboardGlobal } from '@/types'

interface UseDashboardReturn {
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

export const useDashboard = (autoFetch: boolean = true): UseDashboardReturn => {
  const {
    globalData,
    tresorierData,
    departementData,
    isLoading,
    error,
    fetchGlobalDashboard: storeFetchGlobal,
    fetchTresorierDashboard: storeFetchTresorier,
    fetchDepartementDashboard: storeFetchDepartement,
    clearError: storeClearError,
  } = useDashboardStore()
  
  const { showNotification } = useUIStore()

  useEffect(() => {
    if (autoFetch) {
      console.log('🔄 Auto-fetch dashboard global...')
      fetchGlobalDashboard()
    }
  }, [autoFetch])

  // ✅ UNE SEULE DÉCLARATION de fetchGlobalDashboard (correction du doublon)
  const fetchGlobalDashboard = useCallback(async () => {
    console.log('📊 Fetching global dashboard...')
    try {
      await storeFetchGlobal()
      console.log('✅ Dashboard global fetched successfully')
    } catch (err: any) {
      console.error('❌ Error fetching dashboard:', err)
      showNotification(err.message || 'Erreur lors du chargement du dashboard', 'error')
    }
  }, [storeFetchGlobal, showNotification])

  const fetchTresorierDashboard = useCallback(async () => {
    console.log('📊 Fetching tresorier dashboard...')
    try {
      await storeFetchTresorier()
      console.log('✅ Tresorier dashboard fetched successfully')
    } catch (err: any) {
      console.error('❌ Error fetching tresorier dashboard:', err)
      showNotification(err.message || 'Erreur lors du chargement du dashboard trésorier', 'error')
    }
  }, [storeFetchTresorier, showNotification])

  const fetchDepartementDashboard = useCallback(async () => {
    console.log('📊 Fetching departement dashboard...')
    try {
      await storeFetchDepartement()
      console.log('✅ Departement dashboard fetched successfully')
    } catch (err: any) {
      console.error('❌ Error fetching departement dashboard:', err)
      showNotification(err.message || 'Erreur lors du chargement du dashboard département', 'error')
    }
  }, [storeFetchDepartement, showNotification])

  return {
    globalData,
    tresorierData,
    departementData,
    isLoading,
    error,
    fetchGlobalDashboard,
    fetchTresorierDashboard,
    fetchDepartementDashboard,
    clearError: storeClearError,
  }
}

// Hook pour les statistiques du dashboard global
export const useGlobalStats = () => {
  const { globalData, isLoading, fetchGlobalDashboard } = useDashboard(false)

  useEffect(() => {
    fetchGlobalDashboard()
  }, [fetchGlobalDashboard])

  return {
    stats: globalData,
    isLoading,
    refresh: fetchGlobalDashboard,
  }
}

// Hook pour le dashboard trésorier
export const useTresorierStats = () => {
  const { tresorierData, isLoading, fetchTresorierDashboard } = useDashboard(false)

  useEffect(() => {
    fetchTresorierDashboard()
  }, [fetchTresorierDashboard])

  return {
    data: tresorierData,
    isLoading,
    refresh: fetchTresorierDashboard,
  }
}

// Hook pour le dashboard département
export const useDepartementStats = () => {
  const { departementData, isLoading, fetchDepartementDashboard } = useDashboard(false)

  useEffect(() => {
    fetchDepartementDashboard()
  }, [fetchDepartementDashboard])

  return {
    data: departementData,
    isLoading,
    refresh: fetchDepartementDashboard,
  }
}

// Hook pour les indicateurs clés (KPI)
export const useKPIs = () => {
  const { stats, isLoading } = useGlobalStats()

  const kpis = {
    totalMembres: stats?.membres?.total || 0,
    membresActifs: stats?.membres?.actifs || 0,
    tauxActivite: stats?.membres?.tauxActivite || '0',
    entreesMois: stats?.finances?.mois?.entrees || 0,
    sortiesMois: stats?.finances?.mois?.sorties || 0,
    soldeMois: stats?.finances?.mois?.solde || 0,
    entreesAnnee: stats?.finances?.annee?.entrees || 0,
    sortiesAnnee: stats?.finances?.annee?.sorties || 0,
    soldeAnnee: stats?.finances?.annee?.solde || 0,
    evolution: stats?.evolutionMensuelle || [],
    topDonateurs: stats?.topDonateurs || [],
  }

  return {
    kpis,
    isLoading,
  }
}

// Hook pour les transactions récentes
export const useRecentTransactions = (limit: number = 10) => {
  const { stats, isLoading } = useGlobalStats()
  
  const transactions = stats?.transactionsRecentes?.slice(0, limit) || []
  
  return {
    transactions,
    isLoading,
  }
}