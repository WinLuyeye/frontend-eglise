import { Role } from '@/types'

// ==================== RÔLES ====================
export const ROLES = {
  PASTEUR: 'pasteur' as Role,
  TRESORIER: 'tresorier' as Role,
  SECRETAIRE: 'secretaire' as Role,
  CHEF_DEPARTEMENT: 'chef_departement' as Role,
  ADMINISTRATEUR: 'administrateur' as Role,
}

export const ROLE_LABELS: Record<Role, string> = {
  pasteur: 'Pasteur',
  tresorier: 'Trésorier',
  secretaire: 'Secrétaire',
  chef_departement: 'Chef de Département',
  administrateur: 'Administrateur',
}

export const ROLE_COLORS: Record<Role, string> = {
  pasteur: 'bg-purple-100 text-purple-800',
  tresorier: 'bg-green-100 text-green-800',
  secretaire: 'bg-blue-100 text-blue-800',
  chef_departement: 'bg-orange-100 text-orange-800',
  administrateur: 'bg-red-100 text-red-800',
}

export const ROLE_ICONS: Record<Role, string> = {
  pasteur: '👨‍🏫',
  tresorier: '💰',
  secretaire: '📝',
  chef_departement: '👥',
  administrateur: '⚙️',
}

// ==================== STATUTS DES MEMBRES ====================
export const STATUT_MEMBRE = {
  ACTIF: 'actif',
  INACTIF: 'inactif',
  TRANSFERE: 'transfere',
} as const

export const STATUT_LABELS: Record<string, string> = {
  [STATUT_MEMBRE.ACTIF]: 'Actif',
  [STATUT_MEMBRE.INACTIF]: 'Inactif',
  [STATUT_MEMBRE.TRANSFERE]: 'Transféré',
}

export const STATUT_COLORS: Record<string, string> = {
  [STATUT_MEMBRE.ACTIF]: 'bg-green-100 text-green-800',
  [STATUT_MEMBRE.INACTIF]: 'bg-red-100 text-red-800',
  [STATUT_MEMBRE.TRANSFERE]: 'bg-yellow-100 text-yellow-800',
}

// ==================== TYPES DE TRANSACTIONS ====================
export const TYPE_TRANSACTION = {
  ENTREE: 'entree',
  SORTIE: 'sortie',
} as const

export const TYPE_LABELS: Record<string, string> = {
  [TYPE_TRANSACTION.ENTREE]: 'Entrée',
  [TYPE_TRANSACTION.SORTIE]: 'Sortie',
}

export const TYPE_COLORS: Record<string, string> = {
  [TYPE_TRANSACTION.ENTREE]: 'bg-green-100 text-green-800',
  [TYPE_TRANSACTION.SORTIE]: 'bg-red-100 text-red-800',
}

export const TYPE_ICONS: Record<string, string> = {
  [TYPE_TRANSACTION.ENTREE]: '📥',
  [TYPE_TRANSACTION.SORTIE]: '📤',
}

// ==================== PAGINATION ====================
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  LIMIT_OPTIONS: [10, 25, 50, 100],
}

// ==================== FORMATS DE DATE ====================
export const DATE_FORMATS = {
  DISPLAY: 'DD/MM/YYYY',
  DISPLAY_LONG: 'DD MMMM YYYY',
  DISPLAY_SHORT: 'DD/MM/YY',
  API: 'YYYY-MM-DD',
  DATETIME: 'DD/MM/YYYY HH:mm',
  DATETIME_API: 'YYYY-MM-DD HH:mm:ss',
}

// ==================== MESSAGES ====================
export const MESSAGES = {
  // Succès
  LOGIN_SUCCESS: 'Connexion réussie',
  LOGOUT_SUCCESS: 'Déconnexion réussie',
  CREATE_SUCCESS: 'Créé avec succès',
  UPDATE_SUCCESS: 'Modifié avec succès',
  DELETE_SUCCESS: 'Supprimé avec succès',
  
  // Erreurs
  LOGIN_ERROR: 'Email ou mot de passe incorrect',
  NETWORK_ERROR: 'Erreur de connexion au serveur',
  UNAUTHORIZED: 'Non autorisé. Veuillez vous reconnecter.',
  FORBIDDEN: 'Accès refusé. Vous n\'avez pas les droits nécessaires.',
  NOT_FOUND: 'Ressource non trouvée',
  SERVER_ERROR: 'Erreur interne du serveur',
  
  // Validation
  REQUIRED_FIELD: 'Ce champ est requis',
  INVALID_EMAIL: 'Email invalide',
  PASSWORD_TOO_SHORT: 'Le mot de passe doit contenir au moins 6 caractères',
  PASSWORDS_DO_NOT_MATCH: 'Les mots de passe ne correspondent pas',
  
  // Confirmation
  CONFIRM_DELETE: 'Êtes-vous sûr de vouloir supprimer cet élément ?',
  CONFIRM_LOGOUT: 'Êtes-vous sûr de vouloir vous déconnecter ?',
}

// ==================== CHEMINS DE NAVIGATION ====================
export const NAV_ITEMS = {
  admin: [
    { name: 'Dashboard', href: '/admin', icon: 'LayoutDashboard' },
    { name: 'Membres', href: '/admin/membres', icon: 'Users' },
    { name: 'Finances', href: '/admin/finances', icon: 'Wallet' },
    { name: 'Départements', href: '/admin/departements', icon: 'Building2' },
    { name: 'Rapports', href: '/admin/rapports', icon: 'FileText' },
    { name: 'Utilisateurs', href: '/admin/utilisateurs', icon: 'UserCog' },
    { name: 'Paramètres', href: '/admin/parametres', icon: 'Settings' },
  ],
  pasteur: [
    { name: 'Dashboard', href: '/pasteur', icon: 'LayoutDashboard' },
    { name: 'Membres', href: '/pasteur/membres', icon: 'Users' },
    { name: 'Finances', href: '/pasteur/finances', icon: 'Wallet' },
    { name: 'Rapports', href: '/pasteur/rapports', icon: 'FileText' },
  ],
  tresorier: [
    { name: 'Dashboard', href: '/tresorier', icon: 'LayoutDashboard' },
    { name: 'Transactions', href: '/tresorier/transactions', icon: 'Wallet' },
    { name: 'Catégories', href: '/tresorier/categories', icon: 'Tags' },
  ],
  secretaire: [
    { name: 'Dashboard', href: '/secretaire', icon: 'LayoutDashboard' },
    { name: 'Membres', href: '/secretaire/membres', icon: 'Users' },
    { name: 'Utilisateurs', href: '/secretaire/utilisateurs', icon: 'UserCog' },
    { name: 'Départements', href: '/secretaire/departements', icon: 'Building2' },
  ],
  chef_departement: [
    { name: 'Dashboard', href: '/chef-departement', icon: 'LayoutDashboard' },
    { name: 'Rapports', href: '/chef-departement/rapports', icon: 'FileText' },
    { name: 'Membres', href: '/chef-departement/membres', icon: 'Users' },
  ],
}

// ==================== CONFIGURATION API ====================
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  TIMEOUT: 30000,
  RETRY_COUNT: 3,
  RETRY_DELAY: 1000,
}

// ==================== THÈMES ====================
export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system',
}

// ==================== STOCKAGE LOCAL ====================
export const STORAGE_KEYS = {
  TOKEN: 'token',
  USER: 'user',
  THEME: 'theme',
  SIDEBAR_STATE: 'sidebarState',
}

// ==================== EXPRESSIONS RÉGULIÈRES ====================
export const REGEX = {
  EMAIL: /^[^\s@]+@([^\s@.,]+\.)+[^\s@.,]{2,}$/,
  PHONE: /^[0-9+\-\s()]{8,20}$/,
  MONTANT: /^\d+(\.\d{1,2})?$/,
}

// ==================== LIMITES ====================
export const LIMITS = {
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  MAX_DESCRIPTION_LENGTH: 500,
  MAX_TITLE_LENGTH: 200,
  MAX_NOM_LENGTH: 100,
  MAX_PRENOM_LENGTH: 100,
  MAX_ADRESSE_LENGTH: 500,
}