// Types Utilisateur
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
  role: 'pasteur' | 'tresorier' | 'secretaire' | 'chef_departement' | 'administrateur'  // Type plus spécifique
  membreId?: string
  actif?: boolean
}
export type Role = 'pasteur' | 'tresorier' | 'secretaire' | 'chef_departement' | 'administrateur'
export type Devise = 'USD' | 'CDF'

export interface TauxChange {
  id: string
  date: string
  tauxUSD: number  // 1 USD = X CDF
  source: string
}


export interface UserState {
  id: string
  email: string
  role: Role
  nom?: string
  prenom?: string
  membreId?: string
}

// Types Membre
export interface Membre {
  id: string
  nom: string
  prenom: string
  email?: string
  telephone?: string
  adresse?: string
  dateNaissance?: string
  dateInscription: string  // Ajouter cette ligne si elle manque
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

// Types Département
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

// Types Catégorie
export interface Categorie {
  id: string
  nom: string
  type: 'entree' | 'sortie'
  description?: string
  createdAt: string
}

// Types Transaction
export interface Transaction {
  id: string
  type: 'entree' | 'sortie'
  categorieId: string
  categorie?: Categorie
  membreId?: string
  membre?: Membre
  montant: number
  devise: Devise  // Ajouté
  tauxChange?: number  // Ajouté
  montantUSD?: number  // Ajouté
  montantCDF?: number  // Ajouté
  dateTransaction: string
  description?: string
  justificatif?: string
  createdBy?: string
  createdAt: string
}

export interface TransactionFormData {
  type: 'entree' | 'sortie'
  categorieId: string
  membreId?: string
  montant: number
  devise: Devise  // Ajouté
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

// Types Rapport
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
  updatedAt?: string  // Ajouter cette ligne
}

export interface RapportFormData {
  departementId: string
  titre: string
  contenu: string
  periode: string
}

// Types Dashboard
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

// API Response
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

// Login Types
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

// Pagination
// Pagination
export interface PaginationParams {
  page?: number
  limit?: number
  search?: string
  statut?: string
  type?: string
  devise?: string
  categorieId?: string
  departementId?: string      // Ajouter cette ligne
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