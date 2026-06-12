import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { UserState, LoginCredentials } from '@/types'
import api from '@/lib/api'

interface AuthState {
  user: UserState | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  
  login: (credentials: LoginCredentials) => Promise<boolean>
  logout: () => void
  setUser: (user: UserState) => void
  setToken: (token: string) => void
  clearError: () => void
  checkAuth: () => void
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
        set({ isLoading: true, error: null })
        try {
          const response = await api.post('/auth/login', credentials)
          
          if (response.data.success && response.data.token) {
            const { token, user } = response.data
            localStorage.setItem('token', token)
            localStorage.setItem('user', JSON.stringify(user))
            
            set({
              user,
              token,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            })
            return true
          }
          set({ isLoading: false, error: 'Login failed' })
          return false
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.response?.data?.message || 'Erreur de connexion',
            isAuthenticated: false,
          })
          return false
        }
      },

      logout: () => {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          error: null,
          isLoading: false,
        })
      },

      setUser: (user) => {
        localStorage.setItem('user', JSON.stringify(user))
        set({ user })
      },
      
      setToken: (token) => {
        localStorage.setItem('token', token)
        set({ token, isAuthenticated: true })
      },
      
      clearError: () => set({ error: null }),
      
      checkAuth: () => {
        const token = localStorage.getItem('token')
        const userStr = localStorage.getItem('user')
        
        if (token && userStr) {
          try {
            const user = JSON.parse(userStr)
            set({ user, token, isAuthenticated: true, isLoading: false })
          } catch {
            set({ user: null, token: null, isAuthenticated: false, isLoading: false })
          }
        } else {
          set({ user: null, token: null, isAuthenticated: false, isLoading: false })
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user, token: state.token, isAuthenticated: state.isAuthenticated }),
    }
  )
)