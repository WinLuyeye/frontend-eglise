// hooks/useAuth.ts
import { useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'
import { UserState, Role } from '@/types'  // ✅ Importer depuis types

interface UseAuthReturn {
  user: UserState | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  login: (credentials: { email: string; motDePasse: string }) => Promise<boolean>
  logout: () => Promise<void>
  checkAuth: () => void
  hasRole: (role: Role | Role[]) => boolean
  hasAnyRole: (roles: Role[]) => boolean
}

export const useAuth = (): UseAuthReturn => {
  const {
    user,
    token,
    isAuthenticated,
    isLoading,
    error,
    login,
    logout,
    checkAuth,
  } = useAuthStore()

  // Vérifier l'authentification au montage
  useEffect(() => {
    checkAuth()
  }, [])

  // Vérifier si l'utilisateur a un rôle spécifique
  const hasRole = (role: Role | Role[]): boolean => {
    if (!user) return false
    if (Array.isArray(role)) {
      return role.includes(user.role)
    }
    return user.role === role
  }

  // Vérifier si l'utilisateur a au moins un des rôles
  const hasAnyRole = (roles: Role[]): boolean => {
    if (!user) return false
    return roles.includes(user.role)
  }

  return {
    user,
    token,
    isAuthenticated,
    isLoading,
    error,
    login,
    logout,
    checkAuth,
    hasRole,
    hasAnyRole,
  }
}