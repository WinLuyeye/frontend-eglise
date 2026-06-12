import { useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'
import { useUIStore } from '@/store/uiStore'
import { UserState, LoginCredentials } from '@/types'
import { getDashboardRoute, hasRole, isAdmin, isPasteur, isTresorier, isSecretaire, isChefDepartement } from '@/lib/auth'

interface UseAuthReturn {
  user: UserState | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  login: (credentials: LoginCredentials) => Promise<boolean>
  logout: () => void
  clearError: () => void
  getDashboardRoute: () => string
  hasRole: (roles: string[]) => boolean
  isAdmin: () => boolean
  isPasteur: () => boolean
  isTresorier: () => boolean
  isSecretaire: () => boolean
  isChefDepartement: () => boolean
}

export const useAuth = (): UseAuthReturn => {
  const {
    user,
    token,
    isAuthenticated,
    isLoading,
    error,
    login: storeLogin,
    logout: storeLogout,
    clearError: storeClearError,
  } = useAuthStore()
  
  const { showNotification } = useUIStore()

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token')
      const user = localStorage.getItem('user')
      if (!token || !user) {
        if (isAuthenticated) {
          storeLogout()
        }
      }
    }
    checkAuth()
  }, [isAuthenticated, storeLogout])

  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    const success = await storeLogin(credentials)
    if (success) {
      showNotification('Connexion réussie', 'success')
    } else {
      showNotification(error || 'Erreur de connexion', 'error')
    }
    return success
  }

  const logout = () => {
    storeLogout()
    showNotification('Déconnexion réussie', 'success')
  }

  return {
    user,
    token,
    isAuthenticated,
    isLoading,
    error,
    login,
    logout,
    clearError: storeClearError,
    getDashboardRoute: () => user ? getDashboardRoute(user.role) : '/login',
    hasRole: (roles: string[]) => hasRole(roles as any),
    isAdmin: () => isAdmin(),
    isPasteur: () => isPasteur(),
    isTresorier: () => isTresorier(),
    isSecretaire: () => isSecretaire(),
    isChefDepartement: () => isChefDepartement(),
  }
}

// Hook pour protéger les routes
export const useRequireAuth = (redirectTo: string = '/login'): boolean => {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push(redirectTo)
    }
  }, [isAuthenticated, isLoading, router, redirectTo])

  return isAuthenticated
}

// Hook pour restreindre l'accès selon les rôles
export const useRequireRole = (roles: string[], redirectTo: string = '/'): boolean => {
  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const hasRequiredRole = user ? roles.includes(user.role) : false

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push('/login')
      } else if (!hasRequiredRole) {
        router.push(redirectTo)
      }
    }
  }, [isAuthenticated, isLoading, hasRequiredRole, router, redirectTo])

  // Retourner un booléen, pas null
  return isAuthenticated && hasRequiredRole
}

import { useRouter } from 'next/navigation'