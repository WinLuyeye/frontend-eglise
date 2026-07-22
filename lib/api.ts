// lib/api.ts
import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios'
import { ApiResponse, Membre, Transaction, Categorie, Departement, Rapport, DashboardGlobal } from '@/types'

// Configuration de l'instance Axios
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://backend-eglise.onrender.com/api'

console.log('🔧 [API] Configuration:', {
  baseURL: API_URL,
  environment: process.env.NODE_ENV
})

const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true,
})

// ✅ INTERCEPTEUR REQUÊTE
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    // 🔥 Log détaillé du corps de la requête pour POST/PUT
    if ((config.method === 'post' || config.method === 'put') && config.data) {
      console.log(`📦 [REQUEST BODY] ${config.method.toUpperCase()} ${config.url}:`, config.data)
      console.log(`📦 [REQUEST BODY - JSON]`, JSON.stringify(config.data, null, 2))
      
      // Vérification spécifique pour la devise
      if (config.data.devise !== undefined) {
        console.log(`💵 [DEVISE CHECK] type: ${typeof config.data.devise}, value: "${config.data.devise}"`)
      } else {
        console.warn(`⚠️ [DEVISE CHECK] Champ "devise" manquant dans la requête!`)
      }
    }
    
    console.log(`📡 [API Request] ${config.method?.toUpperCase()} ${config.url}`)
    return config
  },
  (error) => {
    console.error('❌ [API Request Error]', error)
    return Promise.reject(error)
  }
)

// ✅ INTERCEPTEUR RÉPONSE
api.interceptors.response.use(
  (response: AxiosResponse) => {
    console.log(`✅ [API Response] ${response.status} ${response.config.url}`)
    return response
  },
  (error) => {
    console.error('❌ [API Error] DÉTAILS:')
    console.error('   Status:', error.response?.status)
    console.error('   URL:', error.config?.url)
    console.error('   Method:', error.config?.method)
    console.error('   Message:', error.response?.data?.message || error.message)
    console.error('   Full error response:', error.response?.data)
    
    // Afficher le corps de la requête qui a échoué
    if (error.config?.data) {
      console.error('   Request body:', error.config.data)
      try {
        const parsed = JSON.parse(error.config.data)
        console.error('   Request body (parsed):', parsed)
        if (parsed.devise !== undefined) {
          console.error(`   Devise in request: "${parsed.devise}" (type: ${typeof parsed.devise})`)
        } else {
          console.error('   ⚠️ Devise field MISSING in request!')
        }
      } catch (e) {
        console.error('   Request body (raw):', error.config.data)
      }
    }
    
    if (error.response?.status === 401) {
      console.log('🔒 Token expiré ou invalide, redirection vers login')
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
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
  
  create: (data: Partial<Membre>) => {
    console.log('👤 Creating member:', data)
    return api.post<ApiResponse<Membre>>('/membres', data)
  },
  
  update: (id: string, data: Partial<Membre>) => {
    console.log('✏️ Updating member:', id, data)
    return api.put<ApiResponse<Membre>>(`/membres/${id}`, data)
  },
  
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
  
  // ✅ VERSION CORRIGÉE AVEC MULTIPLES FORMATS DE DEVISES
  create: (data: Partial<Transaction>) => {
    console.log('💰 Creating transaction - DATA REÇUE:', data)
    console.log('💰 Type de devise reçu:', typeof data.devise, data.devise)
    
    // 🔥 Normaliser la devise
    let deviseValue = 'CDF'
    if (data.devise) {
      const normalized = String(data.devise).toUpperCase().trim()
      if (normalized === 'USD' || normalized === 'CDF') {
        deviseValue = normalized
      }
    }
    
    console.log('💵 Devise normalisée:', deviseValue)
    
    // 🔥 CONSTRUIRE L'OBJET AVEC TOUS LES CHAMPS
    const payload: any = {
      type: String(data.type).toLowerCase().trim(),
      categorieId: String(data.categorieId).trim(),
      montant: typeof data.montant === 'string' ? parseFloat(data.montant) : Number(data.montant),
      // ✅ Envoyer la devise dans plusieurs formats pour être sûr
      devise: deviseValue,
      currency: deviseValue,
      deviseCode: deviseValue,
      DEVISE: deviseValue,
      deviseValue: deviseValue,
      dateTransaction: data.dateTransaction,
    }
    
    // ✅ Ajouter description si présente
    if (data.description && String(data.description).trim() !== '') {
      payload.description = String(data.description).trim()
    }
    
    // ✅ Ajouter membreId si présent
    if (data.membreId && String(data.membreId).trim() !== '') {
      payload.membreId = String(data.membreId).trim()
    }
    
    // 🔥 VÉRIFICATION CRITIQUE - S'assurer que devise est une chaîne non-vide
    if (!payload.devise || payload.devise === '') {
      payload.devise = 'CDF'
      payload.currency = 'CDF'
    }
    
    console.log('📤 Envoi des données nettoyées:', payload)
    console.log('📤 Type de devise:', typeof payload.devise, payload.devise)
    console.log('📤 Tous les champs de devise:', {
      devise: payload.devise,
      currency: payload.currency,
      deviseCode: payload.deviseCode,
      DEVISE: payload.DEVISE,
      deviseValue: payload.deviseValue
    })
    console.log('📤 Type de montant:', typeof payload.montant, payload.montant)
    console.log('📤 JSON stringifié:', JSON.stringify(payload))
    
    return api.post<ApiResponse<Transaction>>('/transactions', payload)
  },
  
  // ✅ VERSION CORRIGÉE POUR UPDATE
  update: (id: string, data: Partial<Transaction>) => {
    console.log('✏️ Updating transaction:', id, data)
    
    const payload: any = {}
    
    if (data.type) payload.type = String(data.type).toLowerCase().trim()
    if (data.categorieId) payload.categorieId = String(data.categorieId).trim()
    if (data.montant) {
      payload.montant = typeof data.montant === 'string' ? parseFloat(data.montant) : Number(data.montant)
    }
    
    // ✅ Normaliser la devise pour l'update
    if (data.devise) {
      let deviseValue = String(data.devise).toUpperCase().trim()
      if (deviseValue !== 'USD' && deviseValue !== 'CDF') {
        deviseValue = 'CDF'
      }
      payload.devise = deviseValue
      payload.currency = deviseValue
      payload.deviseCode = deviseValue
    }
    
    if (data.dateTransaction) payload.dateTransaction = data.dateTransaction
    if (data.description) {
      const desc = String(data.description).trim()
      if (desc) payload.description = desc
    }
    if (data.membreId) {
      const membre = String(data.membreId).trim()
      if (membre) payload.membreId = membre
    }
    
    console.log('📤 Update payload:', payload)
    console.log('📤 Update JSON:', JSON.stringify(payload))
    return api.put<ApiResponse<Transaction>>(`/transactions/${id}`, payload)
  },
  
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
  
  create: (data: { nom: string; type: 'entree' | 'sortie'; description?: string }) => {
    const payload = {
      nom: String(data.nom).trim(),
      type: data.type,
      ...(data.description && { description: String(data.description).trim() })
    }
    console.log('📂 Creating category:', payload)
    return api.post<ApiResponse<Categorie>>('/categories', payload)
  },
  
  update: (id: string, data: Partial<Categorie>) => {
    console.log('✏️ Updating category:', id, data)
    return api.put<ApiResponse<Categorie>>(`/categories/${id}`, data)
  },
  
  delete: (id: string) => api.delete(`/categories/${id}`),
}

// ==================== DEPARTEMENTS API ====================
export const departementsAPI = {
  getAll: () => {
    console.log('🏢 Fetching departments')
    return api.get<ApiResponse<Departement[]>>('/departements')
  },
  
  getById: (id: string) => api.get<ApiResponse<Departement>>(`/departements/${id}`),
  
  create: (data: { nom: string; description?: string; responsableId?: string }) => {
    const payload = {
      nom: String(data.nom).trim(),
      ...(data.description && { description: String(data.description).trim() }),
      ...(data.responsableId && { responsableId: String(data.responsableId).trim() })
    }
    console.log('🏢 Creating department:', payload)
    return api.post<ApiResponse<Departement>>('/departements', payload)
  },
  
  update: (id: string, data: Partial<Departement>) => {
    console.log('✏️ Updating department:', id, data)
    return api.put<ApiResponse<Departement>>(`/departements/${id}`, data)
  },
  
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
  
  create: (data: { departementId: string; titre: string; contenu: string; periode?: string }) => {
    const payload = {
      departementId: String(data.departementId).trim(),
      titre: String(data.titre).trim(),
      contenu: String(data.contenu).trim(),
      ...(data.periode && { periode: data.periode })
    }
    console.log('📄 Creating report:', payload)
    return api.post<ApiResponse<Rapport>>('/rapports', payload)
  },
  
  update: (id: string, data: Partial<Rapport>) => {
    console.log('✏️ Updating report:', id, data)
    return api.put<ApiResponse<Rapport>>(`/rapports/${id}`, data)
  },
  
  delete: (id: string) => api.delete(`/rapports/${id}`),
  
  getByDepartement: (departementId: string, limit?: number) =>
    api.get(`/rapports/departement/${departementId}`, { params: { limit } }),
}

// ==================== UTILISATEURS API ====================
export const utilisateursAPI = {
  getAll: (params?: { page?: number; limit?: number; search?: string; role?: string; actif?: boolean }) =>
    api.get('/utilisateurs', { params }),
  
  getById: (id: string) => api.get(`/utilisateurs/${id}`),
  
  create: (data: { email: string; motDePasse: string; role: string; membreId?: string }) => {
    const payload = {
      email: String(data.email).trim().toLowerCase(),
      motDePasse: data.motDePasse,
      role: data.role,
      ...(data.membreId && { membreId: String(data.membreId).trim() })
    }
    console.log('👤 Creating user:', { ...payload, motDePasse: '***' })
    return api.post('/utilisateurs', payload)
  },
  
  update: (id: string, data: { email?: string; role?: string; actif?: boolean; membreId?: string }) => {
    const payload: any = {}
    if (data.email) payload.email = String(data.email).trim().toLowerCase()
    if (data.role) payload.role = data.role
    if (data.actif !== undefined) payload.actif = data.actif
    if (data.membreId) payload.membreId = String(data.membreId).trim()
    console.log('✏️ Updating user:', id, payload)
    return api.put(`/utilisateurs/${id}`, payload)
  },
  
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