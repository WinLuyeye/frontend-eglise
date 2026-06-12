import { jwtDecode } from 'jwt-decode'
import { Role, UserState } from '@/types'

interface DecodedToken {
  id: string
  email: string
  role: Role
  exp: number
  iat: number
}

// Vérifier si l'utilisateur est authentifié
export const isAuthenticated = (): boolean => {
  if (typeof window === 'undefined') return false
  
  const token = localStorage.getItem('token')
  if (!token) return false
  
  try {
    const decoded = jwtDecode<DecodedToken>(token)
    return decoded.exp * 1000 > Date.now()
  } catch {
    return false
  }
}

// Récupérer le rôle de l'utilisateur
export const getUserRole = (): Role | null => {
  if (typeof window === 'undefined') return null
  
  const token = localStorage.getItem('token')
  if (!token) return null
  
  try {
    const decoded = jwtDecode<DecodedToken>(token)
    return decoded.role
  } catch {
    return null
  }
}

// Récupérer l'ID de l'utilisateur
export const getUserId = (): string | null => {
  if (typeof window === 'undefined') return null
  
  const token = localStorage.getItem('token')
  if (!token) return null
  
  try {
    const decoded = jwtDecode<DecodedToken>(token)
    return decoded.id
  } catch {
    return null
  }
}

// Récupérer les informations de l'utilisateur stockées
export const getUser = (): UserState | null => {
  if (typeof window === 'undefined') return null
  
  const userStr = localStorage.getItem('user')
  if (!userStr) return null
  
  try {
    return JSON.parse(userStr)
  } catch {
    return null
  }
}

// Déconnexion
export const logout = (): void => {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  window.location.href = '/login'
}

// Vérifier si l'utilisateur a un des rôles spécifiés
export const hasRole = (roles: Role[]): boolean => {
  const userRole = getUserRole()
  if (!userRole) return false
  return roles.includes(userRole)
}

// Vérifier si l'utilisateur est administrateur
export const isAdmin = (): boolean => {
  return hasRole(['administrateur'])
}

// Vérifier si l'utilisateur est pasteur
export const isPasteur = (): boolean => {
  return hasRole(['pasteur', 'administrateur'])
}

// Vérifier si l'utilisateur est trésorier
export const isTresorier = (): boolean => {
  return hasRole(['tresorier', 'administrateur'])
}

// Vérifier si l'utilisateur est secrétaire
export const isSecretaire = (): boolean => {
  return hasRole(['secretaire', 'administrateur'])
}

// Vérifier si l'utilisateur est chef de département
export const isChefDepartement = (): boolean => {
  return hasRole(['chef_departement', 'administrateur'])
}

// Rediriger selon le rôle
export const getDashboardRoute = (role: Role): string => {
  switch (role) {
    case 'administrateur':
      return '/admin'
    case 'pasteur':
      return '/pasteur'
    case 'tresorier':
      return '/tresorier'
    case 'secretaire':
      return '/secretaire'
    case 'chef_departement':
      return '/chef-departement'
    default:
      return '/login'
  }
}

// Formatage du token pour les en-têtes
export const getAuthHeader = (): { Authorization: string } | {} => {
  const token = localStorage.getItem('token')
  if (token) {
    return { Authorization: `Bearer ${token}` }
  }
  return {}
}

// Rafraîchir le token (si implémenté côté backend)
export const refreshToken = async (): Promise<boolean> => {
  try {
    // Implémenter la logique de rafraîchissement si nécessaire
    return true
  } catch {
    return false
  }
}