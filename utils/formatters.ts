import { format, parseISO, differenceInDays, differenceInMonths, differenceInYears } from 'date-fns'
import { fr } from 'date-fns/locale'

// ==================== FORMATAGE DE NOMBRE ====================

/**
 * Formate un nombre en devise (FCFA)
 * @param value - Le nombre à formater
 * @returns La chaîne formatée
 */
export const formatCurrency = (value: number): string => {
  if (value === undefined || value === null) return '0 FCFA'
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XAF',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value).replace('XAF', 'FCFA')
}

/**
 * Formate un nombre avec séparateur de milliers
 * @param value - Le nombre à formater
 * @returns La chaîne formatée
 */
export const formatNumber = (value: number): string => {
  if (value === undefined || value === null) return '0'
  return new Intl.NumberFormat('fr-FR').format(value)
}

/**
 * Formate un pourcentage
 * @param value - Le nombre à formater (ex: 0.75 pour 75%)
 * @param decimals - Nombre de décimales
 * @returns La chaîne formatée
 */
export const formatPercentage = (value: number, decimals: number = 2): string => {
  if (value === undefined || value === null) return '0%'
  return `${value.toFixed(decimals)}%`
}

// ==================== FORMATAGE DE DATE ====================

/**
 * Formate une date au format français
 * @param date - La date à formater (Date, string ou timestamp)
 * @param formatStr - Le format souhaité (optionnel)
 * @returns La chaîne formatée
 */
export const formatDate = (
  date: Date | string | number | null | undefined,
  formatStr: string = 'dd/MM/yyyy'
): string => {
  if (!date) return ''
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : new Date(date)
    return format(dateObj, formatStr, { locale: fr })
  } catch {
    return ''
  }
}

/**
 * Formate une date complète (jour mois année)
 * @param date - La date à formater
 * @returns La chaîne formatée (ex: "15 janvier 2024")
 */
export const formatDateLong = (date: Date | string | null | undefined): string => {
  return formatDate(date, 'dd MMMM yyyy')
}

/**
 * Formate une date avec heure
 * @param date - La date à formater
 * @returns La chaîne formatée (ex: "15/01/2024 14:30")
 */
export const formatDateTime = (date: Date | string | null | undefined): string => {
  return formatDate(date, 'dd/MM/yyyy HH:mm')
}

/**
 * Formate une date relative (il y a X jours, mois, etc.)
 * @param date - La date à formater
 * @returns La chaîne relative
 */
export const formatRelativeDate = (date: Date | string | null | undefined): string => {
  if (!date) return ''
  
  const dateObj = typeof date === 'string' ? parseISO(date) : new Date(date)
  const now = new Date()
  
  const daysDiff = differenceInDays(now, dateObj)
  const monthsDiff = differenceInMonths(now, dateObj)
  const yearsDiff = differenceInYears(now, dateObj)
  
  if (daysDiff === 0) return "Aujourd'hui"
  if (daysDiff === 1) return "Hier"
  if (daysDiff < 7) return `Il y a ${daysDiff} jours`
  if (monthsDiff < 1) return `Il y a ${Math.floor(daysDiff / 7)} semaines`
  if (monthsDiff === 1) return `Il y a 1 mois`
  if (monthsDiff < 12) return `Il y a ${monthsDiff} mois`
  if (yearsDiff === 1) return `Il y a 1 an`
  return `Il y a ${yearsDiff} ans`
}

/**
 * Formate une date pour les inputs (YYYY-MM-DD)
 * @param date - La date à formater
 * @returns La chaîne formatée pour input
 */
export const formatDateForInput = (date: Date | string | null | undefined): string => {
  if (!date) return ''
  const dateObj = typeof date === 'string' ? parseISO(date) : new Date(date)
  return format(dateObj, 'yyyy-MM-dd')
}

// ==================== FORMATAGE DE TEXTE ====================

/**
 * Capitalise la première lettre d'une chaîne
 * @param str - La chaîne à capitaliser
 * @returns La chaîne capitalisée
 */
export const capitalize = (str: string): string => {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

/**
 * Capitalise la première lettre de chaque mot
 * @param str - La chaîne à formater
 * @returns La chaîne avec chaque mot capitalisé
 */
export const capitalizeWords = (str: string): string => {
  if (!str) return ''
  return str.split(' ').map(word => capitalize(word)).join(' ')
}

/**
 * Tronque une chaîne avec des points de suspension
 * @param str - La chaîne à tronquer
 * @param length - Longueur maximale
 * @returns La chaîne tronquée
 */
export const truncate = (str: string, length: number = 50): string => {
  if (!str) return ''
  if (str.length <= length) return str
  return str.substring(0, length) + '...'
}

/**
 * Génère des initiales à partir d'un nom et prénom
 * @param nom - Le nom
 * @param prenom - Le prénom
 * @returns Les initiales (ex: "JD")
 */
export const getInitials = (nom: string, prenom: string): string => {
  if (!nom && !prenom) return ''
  return `${(prenom?.charAt(0) || '')}${(nom?.charAt(0) || '')}`.toUpperCase()
}

// ==================== FORMATAGE DE NOM ====================

/**
 * Formate le nom complet d'un membre
 * @param membre - Le membre avec nom et prenom
 * @returns Le nom complet formaté
 */
export const formatFullName = (membre: { nom?: string; prenom?: string }): string => {
  if (!membre) return ''
  return `${membre.prenom || ''} ${membre.nom || ''}`.trim()
}

/**
 * Formate un nom de fichier sans extension
 * @param filename - Le nom du fichier
 * @returns Le nom sans extension
 */
export const getFileNameWithoutExtension = (filename: string): string => {
  if (!filename) return ''
  const lastDotIndex = filename.lastIndexOf('.')
  if (lastDotIndex === -1) return filename
  return filename.substring(0, lastDotIndex)
}

// ==================== FORMATAGE DE STATUT ====================

/**
 * Retourne la classe CSS pour un badge de statut
 * @param statut - Le statut
 * @returns La classe CSS
 */
export const getStatusBadgeColor = (statut: string): string => {
  const colors: Record<string, string> = {
    actif: 'bg-green-100 text-green-800',
    inactif: 'bg-red-100 text-red-800',
    transfere: 'bg-yellow-100 text-yellow-800',
    entree: 'bg-green-100 text-green-800',
    sortie: 'bg-red-100 text-red-800',
    pasteur: 'bg-purple-100 text-purple-800',
    tresorier: 'bg-blue-100 text-blue-800',
    secretaire: 'bg-indigo-100 text-indigo-800',
    chef_departement: 'bg-orange-100 text-orange-800',
    administrateur: 'bg-red-100 text-red-800',
  }
  return colors[statut] || 'bg-gray-100 text-gray-800'
}

/**
 * Retourne le libellé formaté d'un statut
 * @param statut - Le statut
 * @returns Le libellé formaté
 */
export const getStatusLabel = (statut: string): string => {
  const labels: Record<string, string> = {
    actif: 'Actif',
    inactif: 'Inactif',
    transfere: 'Transféré',
    entree: 'Entrée',
    sortie: 'Sortie',
    pasteur: 'Pasteur',
    tresorier: 'Trésorier',
    secretaire: 'Secrétaire',
    chef_departement: 'Chef de Département',
    administrateur: 'Administrateur',
  }
  return labels[statut] || statut
}

// ==================== FORMATAGE DE TÉLÉPHONE ====================

/**
 * Formate un numéro de téléphone
 * @param phone - Le numéro de téléphone
 * @returns Le numéro formaté (ex: 77 123 45 67)
 */
export const formatPhoneNumber = (phone: string): string => {
  if (!phone) return ''
  const cleaned = phone.replace(/\D/g, '')
  if (cleaned.length === 9) {
    return cleaned.replace(/(\d{2})(\d{3})(\d{2})(\d{2})/, '$1 $2 $3 $4')
  }
  if (cleaned.length === 10) {
    return cleaned.replace(/(\d{3})(\d{2})(\d{2})(\d{2})(\d{2})/, '+$1 $2 $3 $4 $5')
  }
  return phone
}

// ==================== FORMATAGE DE FICHIER ====================

/**
 * Formate la taille d'un fichier
 * @param bytes - La taille en bytes
 * @returns La taille formatée (ex: "1.5 MB")
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// ==================== FORMATAGE D'ADRESSE ====================

/**
 * Formate une adresse complète
 * @param adresse - L'adresse
 * @param ville - La ville
 * @param codePostal - Le code postal
 * @returns L'adresse formatée
 */
export const formatAddress = (adresse?: string, ville?: string, codePostal?: string): string => {
  const parts = [adresse, codePostal && ville ? `${codePostal} ${ville}` : ville]
  return parts.filter(Boolean).join(', ')
}