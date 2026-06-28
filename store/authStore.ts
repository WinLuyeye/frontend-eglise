// store/authStore.ts
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import api, { authAPI } from '@/lib/api'

export interface UserState {
  id: string
  email: string
  nom?: string
  prenom?: string
  role: string
  membreId?: string
  actif: boolean
  dernierConnexion?: string
}

export interface LoginCredentials {
  email: string
  motDePasse: string
}

interface AuthState {
  user: UserState | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  
  login: (credentials: LoginCredentials) => Promise<boolean>
  logout: () => Promise<void>
  setUser: (user: UserState) => void
  setToken: (token: string) => void
  clearError: () => void
  checkAuth: () => void
  resetStore: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (credentials) => {
        console.log('🔑 Tentative de connexion:', credentials.email)
        set({ isLoading: true, error: null })
        
        try {
          const response = await authAPI.login(credentials.email, credentials.motDePasse)
          
          console.log('📡 Réponse API:', response.data)
          
          const { data } = response
          
          // Vérifier la structure de la réponse
          if (data && data.success && data.data) {
            const { token, user } = data.data
            
            if (token && user) {
              console.log('✅ Connexion réussie - Rôle:', user.role)
              console.log('👤 Utilisateur:', user)
              
              // Stocker dans localStorage
              localStorage.setItem('token', token)
              localStorage.setItem('user', JSON.stringify(user))
              
              // Stocker dans les cookies (pour le middleware)
              document.cookie = `token=${token}; path=/; max-age=${60 * 60 * 24 * 7}`
              document.cookie = `role=${user.role}; path=/; max-age=${60 * 60 * 24 * 7}`
              
              // Mettre à jour le store
              set({
                user,
                token,
                isAuthenticated: true,
                isLoading: false,
                error: null,
              })
              
              console.log('✅ Store mis à jour - isAuthenticated:', true)
              return true
            }
          }
          
          // Fallback: si la structure est différente
          if (data && data.token && data.user) {
            const { token, user } = data
            
            localStorage.setItem('token', token)
            localStorage.setItem('user', JSON.stringify(user))
            document.cookie = `token=${token}; path=/; max-age=${60 * 60 * 24 * 7}`
            document.cookie = `role=${user.role}; path=/; max-age=${60 * 60 * 24 * 7}`
            
            set({
              user,
              token,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            })
            
            return true
          }
          
          console.warn('⚠️ Format de réponse inattendu:', data)
          set({ 
            isLoading: false, 
            error: 'Format de réponse inattendu',
            isAuthenticated: false 
          })
          return false
          
        } catch (error: any) {
          console.error('❌ Erreur de connexion:', error)
          console.error('❌ Détails:', error.response?.data)
          
          const errorMessage = error.response?.data?.message || 
                              error.response?.data?.error ||
                              error.message || 
                              'Erreur de connexion'
          
          set({
            isLoading: false,
            error: errorMessage,
            isAuthenticated: false,
          })
          return false
        }
      },

      logout: async () => {
        console.log('🔴 Déconnexion en cours...')
        
        try {
          const token = get().token
          if (token) {
            try {
              await authAPI.logout()
              console.log('✅ Logout API réussi')
            } catch (error) {
              console.warn('⚠️ Erreur API logout:', error)
            }
          }
        } catch (error) {
          console.warn('⚠️ Erreur lors du logout API:', error)
        } finally {
          // Nettoyer localStorage
          localStorage.removeItem('token')
          localStorage.removeItem('user')
          localStorage.removeItem('auth-storage')
          
          // Nettoyer les cookies
          document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
          document.cookie = 'role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
          
          // Réinitialiser le store
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          })
          
          console.log('✅ Déconnexion réussie')
        }
      },

      setUser: (user) => {
        localStorage.setItem('user', JSON.stringify(user))
        set({ user })
      },
      
      setToken: (token) => {
        localStorage.setItem('token', token)
        document.cookie = `token=${token}; path=/; max-age=${60 * 60 * 24 * 7}`
        set({ token, isAuthenticated: true })
      },
      
      clearError: () => set({ error: null }),
      
      checkAuth: () => {
        console.log('🔍 checkAuth appelé')
        const token = localStorage.getItem('token')
        const userStr = localStorage.getItem('user')
        
        if (token && userStr) {
          try {
            const user = JSON.parse(userStr)
            console.log('👤 Utilisateur restauré:', user.email, 'Rôle:', user.role)
            set({ user, token, isAuthenticated: true, isLoading: false })
          } catch (error) {
            console.error('❌ Erreur parsing user:', error)
            set({ user: null, token: null, isAuthenticated: false, isLoading: false })
          }
        } else {
          console.log('❌ Aucun token ou user trouvé')
          set({ user: null, token: null, isAuthenticated: false, isLoading: false })
        }
      },
      
      resetStore: () => {
        console.log('🔄 Reset store')
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        localStorage.removeItem('auth-storage')
        document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
        document.cookie = 'role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        })
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ 
        user: state.user, 
        token: state.token, 
        isAuthenticated: state.isAuthenticated 
      }),
    }
  )
)