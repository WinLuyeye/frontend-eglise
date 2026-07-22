import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios'
import { ApiResponse, Membre, Transaction, Categorie, Departement, Rapport, DashboardGlobal } from '@/types'

// Configuration de l'instance Axios
const API_URL = process.env.NEXT_PUBLIC_API_URL ||  'https://backend-eglise.onrender.com/api'

console.log('🔧 [API] Configuration:', {
  baseURL: API_URL,
  environment: process.env.NODE_ENV
})

const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
})

// Intercepteur pour ajouter le token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    console.log(`📡 [API Request] ${config.method?.toUpperCase()} ${config.url}`)
    return config
  },
  (error) => {
    console.error('❌ [API Request Error]', error)
    return Promise.reject(error)
  }
)

// Intercepteur pour les réponses - AVEC LOGS DÉTAILLÉS
api.interceptors.response.use(
  (response) => {
    console.log(`✅ [API Response] ${response.status} ${response.config.url}`)
    return response
  },
  (error) => {
    // Log détaillé de l'erreur
    console.error('❌ [API Error] DÉTAILS:')
    console.error('   Status:', error.response?.status)
    console.error('   URL:', error.config?.url)
    console.error('   Method:', error.config?.method)
    console.error('   Message:', error.response?.data?.message || error.message)
    console.error('   Full error response:', error.response?.data)
    
    if (error.response?.status === 401) {
      console.log('🔒 Token expiré ou invalide, redirection vers login')
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    
    if (error.response?.status === 403) {
      console.log('🚫 Accès interdit - Permissions insuffisantes')
    }
    
    if (error.response?.status === 500) {
      console.error('🔥 ERREUR SERVEUR 500 - Vérifiez les logs du backend')
    }
    
    if (error.code === 'ECONNABORTED') {
      console.error('⏱️ Timeout - Le serveur ne répond pas')
    }
    
    if (error.message === 'Network Error') {
      console.error('🌐 Erreur réseau - Vérifiez que le backend est démarré sur le port 5000')
    }
    
    return Promise.reject(error)
  }
)

// ==================== AUTH API ====================
export const authAPI = {
  login: (email: string, motDePasse: string) => {
    console.log('🔐 Tentative de login:', email)
    return api.post('/auth/login', { email, motDePasse })
  },
  
  logout: () => api.post('/auth/logout'),
  
  getMe: () => api.get('/auth/me'),
  
  changePassword: (ancienMotDePasse: string, nouveauMotDePasse: string) =>
    api.post('/auth/change-password', { ancienMotDePasse, nouveauMotDePasse }),
  
  setupAdmin: (email: string, motDePasse: string, nom: string, prenom: string) =>
    api.post('/auth/setup', { email, motDePasse, nom, prenom }),
  
  health: () => api.get('/auth/health'),
}

// ==================== MEMBRES API ====================
export const membresAPI = {
  getAll: (params?: {
    page?: number
    limit?: number
    search?: string
    statut?: string
    departementId?: string
  }) => {
    console.log('📋 Fetching members with params:', params)
    return api.get<ApiResponse<Membre[]>>('/membres', { params })
  },
  
  getById: (id: string) => api.get<ApiResponse<Membre>>(`/membres/${id}`),
  
  create: (data: Partial<Membre>) => api.post<ApiResponse<Membre>>('/membres', data),
  
  update: (id: string, data: Partial<Membre>) =>
    api.put<ApiResponse<Membre>>(`/membres/${id}`, data),
  
  delete: (id: string) => api.delete(`/membres/${id}`),
  
  getStats: () => api.get('/membres/stats/global'),
}

// ==================== TRANSACTIONS API ====================
export const transactionsAPI = {
  getAll: (params?: {
    page?: number
    limit?: number
    type?: 'entree' | 'sortie'
    categorieId?: string
    membreId?: string
    devise?: string
    dateDebut?: string
    dateFin?: string
  }) => {
    console.log('💰 Fetching transactions with params:', params)
    return api.get<ApiResponse<Transaction[]>>('/transactions', { params })
  },
  
  getById: (id: string) => api.get<ApiResponse<Transaction>>(`/transactions/${id}`),
  
  create: (data: Partial<Transaction>) => {
    console.log('💰 Creating transaction:', data)
    return api.post<ApiResponse<Transaction>>('/transactions', data)
  },
  
  update: (id: string, data: Partial<Transaction>) =>
    api.put<ApiResponse<Transaction>>(`/transactions/${id}`, data),
  
  delete: (id: string) => api.delete(`/transactions/${id}`),
  
  getReport: (params?: { periode?: string; dateDebut?: string; dateFin?: string }) => {
    console.log('📊 Fetching report with params:', params)
    return api.get('/transactions/report/summary', { params })
  },
}

// ==================== CATEGORIES API ====================
export const categoriesAPI = {
  getAll: (type?: 'entree' | 'sortie') =>
    api.get<ApiResponse<Categorie[]>>('/categories', { params: { type } }),
  
  getById: (id: string) => api.get<ApiResponse<Categorie>>(`/categories/${id}`),
  
  create: (data: { nom: string; type: 'entree' | 'sortie'; description?: string }) =>
    api.post<ApiResponse<Categorie>>('/categories', data),
  
  update: (id: string, data: Partial<Categorie>) =>
    api.put<ApiResponse<Categorie>>(`/categories/${id}`, data),
  
  delete: (id: string) => api.delete(`/categories/${id}`),
}

// ==================== DEPARTEMENTS API ====================
export const departementsAPI = {
  getAll: () => {
    console.log('🏢 Fetching departments')
    return api.get<ApiResponse<Departement[]>>('/departements')
  },
  
  getById: (id: string) => api.get<ApiResponse<Departement>>(`/departements/${id}`),
  
  create: (data: { nom: string; description?: string; responsableId?: string }) =>
    api.post<ApiResponse<Departement>>('/departements', data),
  
  update: (id: string, data: Partial<Departement>) =>
    api.put<ApiResponse<Departement>>(`/departements/${id}`, data),
  
  delete: (id: string) => api.delete(`/departements/${id}`),
  
  getMembres: (id: string) => api.get(`/departements/${id}/membres`),
}

// ==================== RAPPORTS API ====================
export const rapportsAPI = {
  getAll: (params?: { page?: number; limit?: number; departementId?: string; periodeDebut?: string; periodeFin?: string }) => {
    console.log('📄 Fetching rapports with params:', params)
    return api.get<ApiResponse<Rapport[]>>('/rapports', { params })
  },
  
  getById: (id: string) => api.get<ApiResponse<Rapport>>(`/rapports/${id}`),
  
  create: (data: { departementId: string; titre: string; contenu: string; periode?: string }) =>
    api.post<ApiResponse<Rapport>>('/rapports', data),
  
  update: (id: string, data: Partial<Rapport>) =>
    api.put<ApiResponse<Rapport>>(`/rapports/${id}`, data),
  
  delete: (id: string) => api.delete(`/rapports/${id}`),
  
  getByDepartement: (departementId: string, limit?: number) =>
    api.get(`/rapports/departement/${departementId}`, { params: { limit } }),
}

// ==================== UTILISATEURS API ====================
export const utilisateursAPI = {
  getAll: (params?: { page?: number; limit?: number; search?: string; role?: string; actif?: boolean }) =>
    api.get('/utilisateurs', { params }),
  
  getById: (id: string) => api.get(`/utilisateurs/${id}`),
  
  create: (data: { email: string; motDePasse: string; role: string; membreId?: string }) =>
    api.post('/utilisateurs', data),
  
  update: (id: string, data: { email?: string; role?: string; actif?: boolean; membreId?: string }) =>
    api.put(`/utilisateurs/${id}`, data),
  
  delete: (id: string) => api.delete(`/utilisateurs/${id}`),
  
  resetPassword: (id: string, nouveauMotDePasse: string) =>
    api.post(`/utilisateurs/${id}/reset-password`, { nouveauMotDePasse }),
}

// ==================== DASHBOARD API ====================
export const dashboardAPI = {
  getGlobal: () => {
    console.log('📊 Fetching global dashboard')
    return api.get<ApiResponse<DashboardGlobal>>('/dashboard/global')
  },
  
  getTresorier: () => api.get('/dashboard/tresorier'),
  
  getDepartement: () => api.get('/dashboard/departement'),
}

// ==================== STATS API ====================
export const statsAPI = {
  getMembreStats: () => api.get('/membres/stats/global'),
  getFinancialReport: (params?: { periode?: string; dateDebut?: string; dateFin?: string }) =>
    api.get('/transactions/report/summary', { params }),
}

export default api