import { REGEX, LIMITS } from '@/lib/constants'

// ==================== VALIDATIONS DE BASE ====================

/**
 * Vérifie si une valeur est vide
 * @param value - La valeur à vérifier
 * @returns True si vide
 */
export const isEmpty = (value: any): boolean => {
  if (value === null || value === undefined) return true
  if (typeof value === 'string') return value.trim() === ''
  if (Array.isArray(value)) return value.length === 0
  if (typeof value === 'object') return Object.keys(value).length === 0
  return false
}

/**
 * Vérifie si une valeur est un email valide
 * @param email - L'email à vérifier
 * @returns True si valide
 */
export const isValidEmail = (email: string): boolean => {
  if (!email) return false
  return REGEX.EMAIL.test(email)
}

/**
 * Vérifie si une valeur est un numéro de téléphone valide
 * @param phone - Le téléphone à vérifier
 * @returns True si valide
 */
export const isValidPhone = (phone: string): boolean => {
  if (!phone) return true // Optionnel
  return REGEX.PHONE.test(phone)
}

/**
 * Vérifie si une valeur est un montant valide
 * @param amount - Le montant à vérifier
 * @returns True si valide
 */
export const isValidAmount = (amount: number | string): boolean => {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount
  if (isNaN(numAmount)) return false
  if (numAmount <= 0) return false
  return REGEX.MONTANT.test(numAmount.toString())
}

/**
 * Vérifie si une valeur est une date valide
 * @param date - La date à vérifier
 * @returns True si valide
 */
export const isValidDate = (date: string | Date): boolean => {
  if (!date) return false
  const d = new Date(date)
  return !isNaN(d.getTime())
}

/**
 * Vérifie si une date n'est pas dans le futur
 * @param date - La date à vérifier
 * @returns True si valide (date dans le passé ou présent)
 */
export const isNotFutureDate = (date: string | Date): boolean => {
  if (!isValidDate(date)) return false
  return new Date(date) <= new Date()
}

/**
 * Vérifie si une date n'est pas dans le passé
 * @param date - La date à vérifier
 * @returns True si valide (date dans le futur ou présent)
 */
export const isNotPastDate = (date: string | Date): boolean => {
  if (!isValidDate(date)) return false
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return new Date(date) >= today
}

// ==================== VALIDATIONS DE LONGUEUR ====================

/**
 * Vérifie la longueur d'une chaîne
 * @param value - La chaîne à vérifier
 * @param min - Longueur minimale
 * @param max - Longueur maximale
 * @returns True si valide
 */
export const isLengthValid = (value: string, min: number = 0, max: number = Infinity): boolean => {
  if (!value) return min === 0
  const length = value.trim().length
  return length >= min && length <= max
}

/**
 * Vérifie si un nom est valide
 * @param nom - Le nom à vérifier
 * @returns True si valide
 */
export const isValidName = (nom: string): boolean => {
  return isLengthValid(nom, 2, LIMITS.MAX_NOM_LENGTH)
}

/**
 * Vérifie si une description est valide
 * @param description - La description à vérifier
 * @returns True si valide
 */
export const isValidDescription = (description: string): boolean => {
  if (!description) return true
  return isLengthValid(description, 0, LIMITS.MAX_DESCRIPTION_LENGTH)
}

// ==================== VALIDATIONS D'OBJETS ====================

/**
 * Valide les données d'un membre
 * @param data - Les données du membre
 * @returns Un objet contenant les erreurs
 */
export const validateMembre = (data: {
  nom: string
  prenom: string
  email?: string
  telephone?: string
}): Record<string, string> => {
  const errors: Record<string, string> = {}

  if (!data.nom) {
    errors.nom = 'Le nom est requis'
  } else if (!isValidName(data.nom)) {
    errors.nom = `Le nom doit contenir entre 2 et ${LIMITS.MAX_NOM_LENGTH} caractères`
  }

  if (!data.prenom) {
    errors.prenom = 'Le prénom est requis'
  } else if (!isValidName(data.prenom)) {
    errors.prenom = `Le prénom doit contenir entre 2 et ${LIMITS.MAX_PRENOM_LENGTH} caractères`
  }

  if (data.email && !isValidEmail(data.email)) {
    errors.email = 'Email invalide'
  }

  if (data.telephone && !isValidPhone(data.telephone)) {
    errors.telephone = 'Numéro de téléphone invalide'
  }

  return errors
}

/**
 * Valide les données d'une transaction
 * @param data - Les données de la transaction
 * @returns Un objet contenant les erreurs
 */
export const validateTransaction = (data: {
  type: 'entree' | 'sortie'
  categorieId: string
  montant: number
  dateTransaction: string
  membreId?: string
}): Record<string, string> => {
  const errors: Record<string, string> = {}

  if (!data.type) {
    errors.type = 'Le type est requis'
  }

  if (!data.categorieId) {
    errors.categorieId = 'La catégorie est requise'
  }

  if (!data.montant) {
    errors.montant = 'Le montant est requis'
  } else if (!isValidAmount(data.montant)) {
    errors.montant = 'Le montant doit être supérieur à 0'
  }

  if (!data.dateTransaction) {
    errors.dateTransaction = 'La date est requise'
  } else if (!isValidDate(data.dateTransaction)) {
    errors.dateTransaction = 'Date invalide'
  }

  if (data.type === 'entree' && !data.membreId) {
    errors.membreId = 'Le membre est requis pour une entrée'
  }

  return errors
}

/**
 * Valide les données d'un utilisateur
 * @param data - Les données de l'utilisateur
 * @returns Un objet contenant les erreurs
 */
export const validateUtilisateur = (data: {
  email: string
  motDePasse?: string
  role: string
  membreId?: string
}): Record<string, string> => {
  const errors: Record<string, string> = {}

  if (!data.email) {
    errors.email = 'L\'email est requis'
  } else if (!isValidEmail(data.email)) {
    errors.email = 'Email invalide'
  }

  if (data.motDePasse && data.motDePasse.length < 6) {
    errors.motDePasse = 'Le mot de passe doit contenir au moins 6 caractères'
  }

  if (!data.role) {
    errors.role = 'Le rôle est requis'
  }

  return errors
}

/**
 * Valide les données de connexion
 * @param data - Les données de connexion
 * @returns Un objet contenant les erreurs
 */
export const validateLogin = (data: {
  email: string
  motDePasse: string
}): Record<string, string> => {
  const errors: Record<string, string> = {}

  if (!data.email) {
    errors.email = 'L\'email est requis'
  } else if (!isValidEmail(data.email)) {
    errors.email = 'Email invalide'
  }

  if (!data.motDePasse) {
    errors.motDePasse = 'Le mot de passe est requis'
  }

  return errors
}

/**
 * Valide les données d'un rapport
 * @param data - Les données du rapport
 * @returns Un objet contenant les erreurs
 */
export const validateRapport = (data: {
  titre: string
  contenu: string
  departementId: string
}): Record<string, string> => {
  const errors: Record<string, string> = {}

  if (!data.titre) {
    errors.titre = 'Le titre est requis'
  } else if (!isLengthValid(data.titre, 3, LIMITS.MAX_TITLE_LENGTH)) {
    errors.titre = `Le titre doit contenir entre 3 et ${LIMITS.MAX_TITLE_LENGTH} caractères`
  }

  if (!data.contenu) {
    errors.contenu = 'Le contenu est requis'
  }

  if (!data.departementId) {
    errors.departementId = 'Le département est requis'
  }

  return errors
}

/**
 * Valide les données d'un département
 * @param data - Les données du département
 * @returns Un objet contenant les erreurs
 */
export const validateDepartement = (data: {
  nom: string
  description?: string
}): Record<string, string> => {
  const errors: Record<string, string> = {}

  if (!data.nom) {
    errors.nom = 'Le nom du département est requis'
  } else if (!isLengthValid(data.nom, 2, 100)) {
    errors.nom = 'Le nom doit contenir entre 2 et 100 caractères'
  }

  if (data.description && !isValidDescription(data.description)) {
    errors.description = `La description ne peut pas dépasser ${LIMITS.MAX_DESCRIPTION_LENGTH} caractères`
  }

  return errors
}

// ==================== VALIDATEURS POUR FORMULAIRES ====================

/**
 * Schéma de validation pour Zod (si utilisé)
 */
export const validationSchemas = {
  login: {
    email: (value: string) => isValidEmail(value) || 'Email invalide',
    motDePasse: (value: string) => (value && value.length >= 6) || 'Mot de passe trop court (min 6 caractères)',
  },
  membre: {
    nom: (value: string) => (value && value.length >= 2) || 'Le nom est requis (min 2 caractères)',
    prenom: (value: string) => (value && value.length >= 2) || 'Le prénom est requis (min 2 caractères)',
    email: (value: string) => !value || isValidEmail(value) || 'Email invalide',
    telephone: (value: string) => !value || isValidPhone(value) || 'Téléphone invalide',
  },
  transaction: {
    montant: (value: number) => (value > 0) || 'Le montant doit être supérieur à 0',
    dateTransaction: (value: string) => isValidDate(value) || 'Date invalide',
  },
}

// ==================== UTILITAIRES DE VALIDATION ====================

/**
 * Nettoie un objet en supprimant les champs vides
 * @param obj - L'objet à nettoyer
 * @returns L'objet nettoyé
 */
export const cleanObject = <T extends Record<string, any>>(obj: T): Partial<T> => {
  const result: Partial<T> = {}
  for (const key in obj) {
    if (obj[key] !== undefined && obj[key] !== null && obj[key] !== '') {
      result[key] = obj[key]
    }
  }
  return result
}

/**
 * Convertit une chaîne en nombre pour les montants
 * @param value - La valeur à convertir
 * @returns Le nombre converti
 */
export const parseAmount = (value: string | number): number => {
  if (typeof value === 'number') return value
  const parsed = parseFloat(value.replace(/\s/g, '').replace(',', '.'))
  return isNaN(parsed) ? 0 : parsed
}