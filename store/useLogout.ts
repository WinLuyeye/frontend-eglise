// hooks/useLogout.ts
import { useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'

export const useLogout = () => {
  const router = useRouter()
  const { logout, resetStore } = useAuthStore()

  const handleLogout = useCallback(async () => {
    try {
      console.log('🚪 useLogout: Début de la déconnexion')
      
      // 1. Appeler logout du store
      await logout()
      
      // 2. Reset supplémentaire
      resetStore()
      
      // 3. Nettoyage manuel
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        localStorage.removeItem('auth-storage')
      }
      
      // 4. Rediriger vers login avec timestamp pour forcer le refresh
      router.push(`/login?t=${Date.now()}`)
      
      console.log('✅ useLogout: Déconnexion réussie')
      
    } catch (error) {
      console.error('❌ useLogout: Erreur:', error)
      // En cas d'erreur, forcer le nettoyage et la redirection
      resetStore()
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      localStorage.removeItem('auth-storage')
      router.push(`/login?t=${Date.now()}`)
    }
  }, [logout, resetStore, router])

  return { logout: handleLogout }
}