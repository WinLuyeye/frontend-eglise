// types/index.ts

export interface Utilisateur {
  id: string
  email: string
  role: Role
  actif: boolean
  membreId?: string
  membre?: Membre
  dernierConnexion?: string
  createdAt: string
}

export interface UtilisateurFormData {
  email: string
  motDePasse?: string
  role: 'pasteur' | 'tresorier' | 'secretaire' | 'chef_departement' | 'administrateur'
  membreId?: string
  actif?: boolean
}

export type Role = 'administrateur' | 'pasteur' | 'tresorier' | 'secretaire' | 'chef_departement' | 'membre'
export type Devise = 'USD' | 'CDF'

export interface TauxChange {
  id: string
  date: string
  tauxUSD: number
  source: string
}

export interface UserState {
  id: string
  email: string
  nom?: string
  prenom?: string
  role: Role
  membreId?: string
  actif: boolean
  dernierConnexion?: string
  createdAt?: string
  updatedAt?: string
}

export interface Membre {
  id: string
  nom: string
  prenom: string
  email?: string
  telephone?: string
  adresse?: string
  dateNaissance?: string
  dateInscription: string
  createdAt: string
  updatedAt: string
  statut: 'actif' | 'inactif' | 'transfere'
  departementId?: string
  departement?: Departement
  utilisateur?: {
    role: Role
    actif: boolean
  }
}

export interface MembreFormData {
  nom: string
  prenom: string
  email?: string
  telephone?: string
  adresse?: string
  dateNaissance?: string
  statut?: 'actif' | 'inactif' | 'transfere'
  departementId?: string
}

export interface Departement {
  id: string
  nom: string
  description?: string
  responsableId?: string
  responsable?: Membre
  _count?: {
    membres: number
    rapports: number
  }
  createdAt: string
}

export interface Categorie {
  id: string
  nom: string
  type: 'entree' | 'sortie'
  description?: string
  createdAt: string
}

// ✅ Types Transaction - MODIFIÉ (suppression des champs de conversion)
export interface Transaction {
  id: string
  type: string
  categorieId: string
  membreId?: string
  montant: number | string
  devise: string            // ✅ UNIQUEMENT la devise
  dateTransaction: string
  description?: string
  justificatif?: string
  createdBy?: string
  createdAt: string
  categorie?: {
    id: string
    nom: string
    type: string
    description?: string
    createdAt?: string
  }
  membre?: {
    id: string
    nom: string
    prenom: string
  }
  createur?: {
    id: string
    email: string
  }
}

export interface TransactionFormData {
  type: 'entree' | 'sortie'
  categorieId: string
  membreId?: string
  montant: number
  devise: Devise          // ✅ UNIQUEMENT la devise
  dateTransaction: string
  description?: string
  justificatif?: string
}

export interface StatsParDevise {
  devise: Devise
  totalEntrees: number
  totalSorties: number
  solde: number
}

// ✅ Rapport financier - MODIFIÉ
export interface FinancialReport {
  periode: {
    debut: string
    fin: string
    libelle: string
  }
  tauxChange: number
  statsParDevise: {
    USD: {
      entrees: number
      sorties: number
      solde: number
      nombre: number
    }
    CDF: {
      entrees: number
      sorties: number
      solde: number
      nombre: number
    }
  }
  total: {
    entrees: number
    sorties: number
    solde: number
    parDevise: {
      USD: {
        entrees: number
        sorties: number
        solde: number
      }
      CDF: {
        entrees: number
        sorties: number
        solde: number
      }
    }
  }
  entreesParCategorie: Record<string, number>
  sortiesParCategorie: Record<string, number>
  evolutionMensuelle: Array<{
    mois: string
    entrees: number
    sorties: number
  }>
  nombreTransactions: {
    entrees: number
    sorties: number
    total: number
    parDevise: {
      USD: number
      CDF: number
    }
  }
  transactions: Transaction[]
}

export interface Rapport {
  id: string
  departementId: string
  departement?: Departement
  titre: string
  contenu: string
  periode: string
  createdBy?: string
  createur?: {
    email: string
    id: string
  }
  createdAt: string
  updatedAt?: string
}

export interface RapportFormData {
  departementId: string
  titre: string
  contenu: string
  periode: string
}

export interface DashboardGlobal {
  membres: {
    total: number
    actifs: number
    tauxActivite: string
    nouveauxMois: number
    nouveauxAnnee: number
  }
  finances: {
    mois: {
      entrees: number
      sorties: number
      solde: number
    }
    annee: {
      entrees: number
      sorties: number
      solde: number
    }
  }
  topDonateurs: Array<{
    id: string
    nom: string
    prenom: string
    total: number
  }>
  rapportsRecents: Rapport[]
  transactionsRecentes: Transaction[]
  evolutionMensuelle: Array<{
    mois: string
    entrees: number
    sorties: number
    solde: number
  }>
}

export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
  pagination?: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

export interface LoginCredentials {
  email: string
  motDePasse: string
}

export interface LoginResponse {
  success: boolean
  token: string
  user: {
    id: string
    email: string
    role: Role
    nom?: string
    prenom?: string
    membreId?: string
  }
}

export interface AuthResponse {
  success: boolean
  token: string
  user: UserState
  message?: string
}

export interface PaginationParams {
  page?: number
  limit?: number
  search?: string
  statut?: string
  type?: string
  devise?: string
  categorieId?: string
  departementId?: string
  dateDebut?: string
  dateFin?: string
  periodeDebut?: string
  periodeFin?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}