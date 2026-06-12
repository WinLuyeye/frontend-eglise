'use client'

import { useState } from 'react'
import { ArrowUpCircle, ArrowDownCircle, Eye, Download } from 'lucide-react'
import { Card, Badge, Button } from '@/components/ui'
import { Transaction } from '@/types'
import { formatDate, formatDateTime } from '@/utils/formatters'

// Formatage personnalisé selon la devise
const formatCurrencyWithDevise = (montant: number, devise: string) => {
  if (devise === 'USD') {
    return `$${montant.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }
  return `${montant.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })} FC`
}

const getTransactionIcon = (type: string) => {
  return type === 'entree' ? (
    <ArrowUpCircle className="h-8 w-8 text-green-500" />
  ) : (
    <ArrowDownCircle className="h-8 w-8 text-red-500" />
  )
}

const getTransactionBadge = (type: string) => {
  return type === 'entree' ? (
    <Badge variant="success" size="sm">
      Entrée
    </Badge>
  ) : (
    <Badge variant="danger" size="sm">
      Sortie
    </Badge>
  )
}

const getDeviseBadge = (devise: string) => {
  return devise === 'USD' ? (
    <Badge variant="info" size="sm">
      USD
    </Badge>
  ) : (
    <Badge variant="warning" size="sm">
      CDF
    </Badge>
  )
}

interface RecentTransactionsProps {
  transactions: Transaction[]
  title?: string
  maxItems?: number
  onViewAll?: () => void
  onExport?: () => void
  isLoading?: boolean
}

export const RecentTransactions = ({
  transactions,
  title = 'Transactions récentes',
  maxItems = 5,
  onViewAll,
  onExport,
  isLoading = false,
}: RecentTransactionsProps) => {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const displayTransactions = transactions.slice(0, maxItems)

  if (isLoading) {
    return (
      <Card className="p-4">
        <div className="animate-pulse">
          <div className="mb-4 flex items-center justify-between">
            <div className="h-6 w-40 rounded bg-gray-200 dark:bg-gray-700" />
            <div className="flex space-x-2">
              <div className="h-9 w-24 rounded bg-gray-200 dark:bg-gray-700" />
              <div className="h-9 w-24 rounded bg-gray-200 dark:bg-gray-700" />
            </div>
          </div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700" />
                  <div className="space-y-2">
                    <div className="h-4 w-32 rounded bg-gray-200 dark:bg-gray-700" />
                    <div className="h-3 w-24 rounded bg-gray-200 dark:bg-gray-700" />
                  </div>
                </div>
                <div className="text-right">
                  <div className="h-4 w-20 rounded bg-gray-200 dark:bg-gray-700" />
                  <div className="mt-1 h-3 w-16 rounded bg-gray-200 dark:bg-gray-700" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    )
  }

  if (transactions.length === 0) {
    return (
      <Card className="p-4">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900 dark:text-white">{title}</h3>
        </div>
        <div className="flex h-40 flex-col items-center justify-center text-center">
          <p className="text-gray-500 dark:text-gray-400">Aucune transaction récente</p>
          <p className="mt-1 text-sm text-gray-400 dark:text-gray-500">
            Les transactions apparaîtront ici une fois créées
          </p>
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-4">
      <div className="mb-4 flex flex-col justify-between space-y-3 sm:flex-row sm:items-center sm:space-y-0">
        <h3 className="font-semibold text-gray-900 dark:text-white">{title}</h3>
        <div className="flex space-x-2">
          {onExport && (
            <Button variant="outline" size="sm" onClick={onExport}>
              <Download className="mr-2 h-4 w-4" />
              Exporter
            </Button>
          )}
          {onViewAll && (
            <Button variant="outline" size="sm" onClick={onViewAll}>
              <Eye className="mr-2 h-4 w-4" />
              Voir tout
            </Button>
          )}
        </div>
      </div>

      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {displayTransactions.map((transaction) => (
          <div key={transaction.id}>
            <div
              className="flex cursor-pointer items-center justify-between py-3 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800"
              onClick={() => setExpandedId(expandedId === transaction.id ? null : transaction.id)}
            >
              <div className="flex items-center space-x-3">
                {getTransactionIcon(transaction.type)}
                <div>
                  <div className="flex items-center space-x-2">
                    <p className="font-medium text-gray-900 dark:text-white">
                      {transaction.categorie?.nom || 'Catégorie inconnue'}
                    </p>
                    {getDeviseBadge(transaction.devise || 'CDF')}
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {formatDate(transaction.dateTransaction)}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className={`font-semibold ${
                  transaction.type === 'entree'
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-red-600 dark:text-red-400'
                }`}>
                  {transaction.type === 'entree' ? '+' : '-'} {formatCurrencyWithDevise(transaction.montant, transaction.devise || 'CDF')}
                </p>
                <div className="mt-1 flex justify-end space-x-1">
                  {getTransactionBadge(transaction.type)}
                </div>
              </div>
            </div>

            {/* Expanded details */}
            {expandedId === transaction.id && (
              <div className="border-t border-gray-100 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-800/50">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Description</p>
                    <p className="text-sm text-gray-900 dark:text-white">
                      {transaction.description || 'Aucune description'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Devise</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {transaction.devise === 'USD' ? 'USD (Dollar américain)' : 'CDF (Franc congolais)'}
                    </p>
                  </div>
                  {transaction.membre && (
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Membre</p>
                      <p className="text-sm text-gray-900 dark:text-white">
                        {transaction.membre.prenom} {transaction.membre.nom}
                      </p>
                    </div>
                  )}
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Date complète</p>
                    <p className="text-sm text-gray-900 dark:text-white">
                      {formatDateTime(transaction.dateTransaction)}
                    </p>
                  </div>
                  {transaction.justificatif && (
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Justificatif</p>
                      <a
                        href={transaction.justificatif}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary-600 hover:underline dark:text-primary-400"
                      >
                        Voir le justificatif
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {transactions.length > maxItems && (
        <div className="mt-4 text-center">
          <Button variant="ghost" size="sm" onClick={onViewAll}>
            Voir les {transactions.length - maxItems} autres transactions
          </Button>
        </div>
      )}
    </Card>
  )
}

interface TransactionSummaryProps {
  totalEntrees: number
  totalSorties: number
  solde: number
  devise?: 'USD' | 'CDF'
  className?: string
}

export const TransactionSummary = ({ totalEntrees, totalSorties, solde, devise = 'CDF', className = '' }: TransactionSummaryProps) => {
  const formatCurrency = (amount: number) => {
    if (devise === 'USD') {
      return `$${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    }
    return `${amount.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })} FC`
  }

  return (
    <Card className={`p-4 ${className}`}>
      <div className="mb-2 flex items-center justify-between">
        <p className="text-sm text-gray-500">Devise: {devise === 'USD' ? 'USD ($)' : 'CDF (FC)'}</p>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Entrées</p>
          <p className="text-xl font-bold text-green-600 dark:text-green-400">
            {formatCurrency(totalEntrees)}
          </p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Sorties</p>
          <p className="text-xl font-bold text-red-600 dark:text-red-400">
            {formatCurrency(totalSorties)}
          </p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">Solde</p>
          <p className={`text-xl font-bold ${solde >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
            {formatCurrency(solde)}
          </p>
        </div>
      </div>
    </Card>
  )
}