// utils/formatters.ts

import { format, parseISO, differenceInDays, differenceInMonths, differenceInYears } from 'date-fns'
import { fr } from 'date-fns/locale'

// ==================== TYPES ====================

export type Currency = 'CDF' | 'USD'

// ==================== CONFIGURATION DEVISES ====================

const CURRENCY_CONFIG: Record<Currency, { symbol: string; code: string; decimals: number }> = {
  CDF: { symbol: 'FC', code: 'CDF', decimals: 0 },
  USD: { symbol: '$', code: 'USD', decimals: 2 },
}

// ==================== FORMATAGE DE DEVISES ====================

/**
 * Formate un montant avec la devise appropriée (CDF ou USD)
 */
export const formatCurrency = (
  value: number | null | undefined,
  devise: Currency | string = 'CDF',
  showSymbol: boolean = true
): string => {
  if (value === undefined || value === null || isNaN(value)) {
    return `0 ${devise}`
  }

  const normalizedDevise = devise?.toUpperCase() as Currency || 'CDF'
  const config = CURRENCY_CONFIG[normalizedDevise] || CURRENCY_CONFIG.CDF
  
  const formatter = new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: config.decimals,
  })

  const formattedNumber = formatter.format(value)
  const symbol = showSymbol ? config.symbol : config.code

  return `${formattedNumber} ${symbol}`
}

/**
 * Obtient la couleur associée à la devise
 */
export const getCurrencyColor = (devise: Currency | string = 'CDF'): string => {
  return devise?.toUpperCase() === 'USD' ? 'text-blue-600' : 'text-green-600'
}

/**
 * Obtient les classes CSS pour un badge de devise
 */
export const getCurrencyBadgeStyle = (devise: Currency | string = 'CDF'): { bg: string; text: string } => {
  return devise?.toUpperCase() === 'USD'
    ? { bg: 'bg-blue-100', text: 'text-blue-800' }
    : { bg: 'bg-green-100', text: 'text-green-800' }
}

/**
 * Obtient l'emoji associé à la devise
 */
export const getCurrencyEmoji = (devise: Currency | string = 'CDF'): string => {
  return devise?.toUpperCase() === 'USD' ? '💵' : '💰'
}

/**
 * Vérifie si une devise est en USD
 */
export const isUSD = (devise: Currency | string): boolean => {
  return devise?.toUpperCase() === 'USD'
}

/**
 * Vérifie si une devise est en CDF
 */
export const isCDF = (devise: Currency | string): boolean => {
  return devise?.toUpperCase() === 'CDF'
}

// ✅ TAUX DE CHANGE PAR DÉFAUT (pour les calculs à la volée)
export const DEFAULT_TX_RATE = 2250

/**
 * Convertit un montant entre CDF et USD (calcul à la volée)
 */
export const convertCurrency = (
  amount: number,
  fromDevise: Currency | string,
  toDevise: Currency | string,
  tauxChange: number = DEFAULT_TX_RATE
): number => {
  const from = fromDevise?.toUpperCase() as Currency || 'CDF'
  const to = toDevise?.toUpperCase() as Currency || 'CDF'
  
  if (from === to) return amount
  
  if (from === 'USD' && to === 'CDF') {
    return amount * tauxChange
  }
  
  if (from === 'CDF' && to === 'USD') {
    return amount / tauxChange
  }
  
  return amount
}

/**
 * Formate un montant avec conversion automatique
 */
export const formatCurrencyWithConversion = (
  value: number | null | undefined,
  devise: Currency | string = 'CDF',
  targetDevise: Currency | string = 'CDF'
): string => {
  if (value === undefined || value === null || isNaN(value)) {
    return `0 ${targetDevise}`
  }
  
  const converted = convertCurrency(value, devise, targetDevise)
  return formatCurrency(converted, targetDevise)
}

// ==================== FORMATAGE DE NOMBRE ====================

export const formatNumber = (value: number | null | undefined, decimals: number = 0): string => {
  if (value === undefined || value === null || isNaN(value)) return '0'
  return new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value)
}

export const formatPercentage = (value: number | null | undefined, decimals: number = 2): string => {
  if (value === undefined || value === null || isNaN(value)) return '0%'
  return `${(value * 100).toFixed(decimals)}%`
}

// ==================== FORMATAGE DE DATE ====================

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

export const formatDateLong = (date: Date | string | null | undefined): string => {
  return formatDate(date, 'dd MMMM yyyy')
}

export const formatDateTime = (date: Date | string | null | undefined): string => {
  return formatDate(date, 'dd/MM/yyyy HH:mm')
}

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

export const formatDateForInput = (date: Date | string | null | undefined): string => {
  if (!date) return ''
  const dateObj = typeof date === 'string' ? parseISO(date) : new Date(date)
  return format(dateObj, 'yyyy-MM-dd')
}

// ==================== FORMATAGE DE TEXTE ====================

export const capitalize = (str: string): string => {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

export const capitalizeWords = (str: string): string => {
  if (!str) return ''
  return str.split(' ').map(word => capitalize(word)).join(' ')
}

export const truncate = (str: string, length: number = 50): string => {
  if (!str) return ''
  if (str.length <= length) return str
  return str.substring(0, length) + '...'
}

export const getInitials = (nom: string, prenom: string): string => {
  if (!nom && !prenom) return ''
  return `${(prenom?.charAt(0) || '')}${(nom?.charAt(0) || '')}`.toUpperCase()
}

// ==================== FORMATAGE DE NOM ====================

export const formatFullName = (membre: { nom?: string; prenom?: string }): string => {
  if (!membre) return ''
  return `${membre.prenom || ''} ${membre.nom || ''}`.trim()
}

export const getFileNameWithoutExtension = (filename: string): string => {
  if (!filename) return ''
  const lastDotIndex = filename.lastIndexOf('.')
  if (lastDotIndex === -1) return filename
  return filename.substring(0, lastDotIndex)
}

// ==================== FORMATAGE DE STATUT ====================

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

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// ==================== FORMATAGE D'ADRESSE ====================

export const formatAddress = (adresse?: string, ville?: string, codePostal?: string): string => {
  const parts = [adresse, codePostal && ville ? `${codePostal} ${ville}` : ville]
  return parts.filter(Boolean).join(', ')
}

export default {
  formatCurrency,
  getCurrencyColor,
  getCurrencyBadgeStyle,
  getCurrencyEmoji,
  isUSD,
  isCDF,
  DEFAULT_TX_RATE,
  convertCurrency,
  formatCurrencyWithConversion,
  formatNumber,
  formatPercentage,
  formatDate,
  formatDateLong,
  formatDateTime,
  formatRelativeDate,
  formatDateForInput,
  capitalize,
  capitalizeWords,
  truncate,
  getInitials,
  formatFullName,
  getFileNameWithoutExtension,
  getStatusBadgeColor,
  getStatusLabel,
  formatPhoneNumber,
  formatFileSize,
  formatAddress,
}