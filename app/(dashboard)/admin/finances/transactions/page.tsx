// app/(dashboard)/admin/finances/transactions/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Download, Filter, Eye, Trash2, Edit, Search, X } from 'lucide-react'
import { Card, Button, Input, Select, Badge, Table, Pagination, Spinner } from '@/components/ui'
import { useTransactions } from '@/hooks/useTransactions'
import { useCategorieStore } from '@/store/categorieStore'
import { formatDate } from '@/utils/formatters'

// ✅ Taux de change pour l'affichage UNIQUEMENT
const TAUX_CHANGE = 2250

export default function AdminTransactionsPage() {
  const router = useRouter()
  const { transactions, total, page, pages, isLoading, fetchTransactions, deleteTransaction } = useTransactions()
  const { categories, fetchCategories } = useCategorieStore()
  
  const [typeFilter, setTypeFilter] = useState<'entree' | 'sortie' | ''>('')
  const [categorieFilter, setCategorieFilter] = useState('')
  const [deviseFilter, setDeviseFilter] = useState('')
  const [dateDebut, setDateDebut] = useState('')
  const [dateFin, setDateFin] = useState('')
  const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchCategories()
    fetchTransactions({ 
      page, 
      limit: 10, 
      type: typeFilter || undefined, 
      categorieId: categorieFilter || undefined, 
      devise: deviseFilter || undefined, 
      dateDebut: dateDebut || undefined, 
      dateFin: dateFin || undefined 
    })
  }, [page, typeFilter, categorieFilter, deviseFilter, dateDebut, dateFin])

  const handleDelete = async (id: string) => {
    await deleteTransaction(id)
    setShowDeleteModal(null)
  }

  // ✅ Formatage du montant avec la devise
  const formatMontant = (montant: number, devise: string) => {
    if (devise === 'USD') {
      return `$${montant.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    }
    return `${montant.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })} FC`
  }

  // ✅ Calcul de l'équivalence pour affichage
  const getEquivalence = (montant: number, devise: string) => {
    if (devise === 'USD') {
      return `${(montant * TAUX_CHANGE).toLocaleString()} FC`
    }
    return `${(montant / TAUX_CHANGE).toFixed(2)} USD`
  }

  const columns = [
    {
      key: 'date',
      header: 'Date',
      cell: (t: any) => (
        <span className="text-gray-700 dark:text-gray-300 whitespace-nowrap">
          {formatDate(t.dateTransaction)}
        </span>
      ),
    },
    {
      key: 'type',
      header: 'Type',
      cell: (t: any) => (
        <Badge variant={t.type === 'entree' ? 'success' : 'danger'}>
          {t.type === 'entree' ? 'Entrée' : 'Sortie'}
        </Badge>
      ),
    },
    {
      key: 'categorie',
      header: 'Catégorie',
      cell: (t: any) => (
        <span className="text-gray-700 dark:text-gray-300">
          {t.categorie?.nom || '-'}
        </span>
      ),
    },
    {
      key: 'montant',
      header: 'Montant',
      cell: (t: any) => (
        <div className="flex flex-col">
          <span className={t.type === 'entree' ? 'text-green-600 dark:text-green-400 font-semibold' : 'text-red-600 dark:text-red-400 font-semibold'}>
            {formatMontant(t.montant, t.devise || 'CDF')}
          </span>
          {t.devise === 'USD' && (
            <span className="text-xs text-gray-500 dark:text-gray-400">
              ~ {getEquivalence(t.montant, t.devise)}
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'devise',
      header: 'Devise',
      cell: (t: any) => (
        <Badge variant={t.devise === 'USD' ? 'info' : 'warning'} size="sm">
          {t.devise || 'CDF'}
        </Badge>
      ),
    },
    {
      key: 'membre',
      header: 'Membre',
      cell: (t: any) => (
        <span className="text-gray-700 dark:text-gray-300">
          {t.membre ? `${t.membre.prenom} ${t.membre.nom}` : '-'}
        </span>
      ),
    },
    {
      key: 'description',
      header: 'Description',
      cell: (t: any) => (
        <span className="text-gray-700 dark:text-gray-300" title={t.description || ''}>
          {t.description?.substring(0, 30) || '-'}
          {t.description && t.description.length > 30 && '...'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      cell: (t: any) => (
        <div className="flex space-x-2">
          <button
            onClick={() => router.push(`/admin/finances/transactions/${t.id}`)}
            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
            title="Voir"
          >
            <Eye className="h-4 w-4" />
          </button>
          <button
            onClick={() => router.push(`/admin/finances/transactions/${t.id}/modifier`)}
            className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 transition-colors"
            title="Modifier"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={() => setShowDeleteModal(t.id)}
            className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition-colors"
            title="Supprimer"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ]

  const typeOptions = [
    { value: '', label: 'Tous' },
    { value: 'entree', label: 'Entrées' },
    { value: 'sortie', label: 'Sorties' },
  ]

  const deviseOptions = [
    { value: '', label: 'Toutes' },
    { value: 'USD', label: 'USD (Dollar)' },
    { value: 'CDF', label: 'CDF (Franc Congolais)' },
  ]

  const categorieOptions = [
    { value: '', label: 'Toutes' },
    ...categories.map(c => ({ value: c.id, label: c.nom })),
  ]

  // ✅ Filtrer les transactions par recherche
  const filteredTransactions = transactions.filter(t => {
    if (!searchTerm) return true
    const search = searchTerm.toLowerCase()
    return (
      t.description?.toLowerCase().includes(search) ||
      t.categorie?.nom?.toLowerCase().includes(search) ||
      t.membre?.prenom?.toLowerCase().includes(search) ||
      t.membre?.nom?.toLowerCase().includes(search) ||
      String(t.montant).includes(search) ||
      t.devise?.toLowerCase().includes(search)
    )
  })

  if (isLoading && transactions.length === 0) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  // ✅ Statistiques rapides
  const stats = {
    total: filteredTransactions.length,
    entrees: filteredTransactions.filter(t => t.type === 'entree').length,
    sorties: filteredTransactions.filter(t => t.type === 'sortie').length,
    totalUSD: filteredTransactions
      .filter(t => t.devise === 'USD')
      .reduce((sum, t) => sum + Number(t.montant), 0),
    totalCDF: filteredTransactions
      .filter(t => t.devise === 'CDF')
      .reduce((sum, t) => sum + Number(t.montant), 0),
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Transactions
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Gérez toutes les transactions financières de l'église
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" className="dark:border-gray-700 dark:text-gray-300">
            <Download className="mr-2 h-4 w-4" />
            Exporter
          </Button>
          <Button onClick={() => router.push('/admin/finances/transactions/nouveau')}>
            <Plus className="mr-2 h-4 w-4" />
            Nouvelle transaction
          </Button>
        </div>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card className="p-4 dark:bg-gray-900 dark:border-gray-800">
          <p className="text-sm text-gray-500 dark:text-gray-400">Total</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
        </Card>
        <Card className="p-4 dark:bg-gray-900 dark:border-gray-800">
          <p className="text-sm text-gray-500 dark:text-gray-400">Entrées</p>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.entrees}</p>
        </Card>
        <Card className="p-4 dark:bg-gray-900 dark:border-gray-800">
          <p className="text-sm text-gray-500 dark:text-gray-400">Sorties</p>
          <p className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.sorties}</p>
        </Card>
        <Card className="p-4 dark:bg-gray-900 dark:border-gray-800">
          <p className="text-sm text-gray-500 dark:text-gray-400">Montant total USD</p>
          <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
            ${stats.totalUSD.toFixed(2)}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            + {stats.totalCDF.toLocaleString()} FC
          </p>
        </Card>
      </div>

      {/* Filtres */}
      <Card className="p-4 dark:bg-gray-900 dark:border-gray-800">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <Select
            label="Type"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as 'entree' | 'sortie' | '')}
            options={typeOptions}
            className="dark:bg-gray-800 dark:border-gray-700 dark:text-white"
          />
          <Select
            label="Devise"
            value={deviseFilter}
            onChange={(e) => setDeviseFilter(e.target.value)}
            options={deviseOptions}
            className="dark:bg-gray-800 dark:border-gray-700 dark:text-white"
          />
          <Select
            label="Catégorie"
            value={categorieFilter}
            onChange={(e) => setCategorieFilter(e.target.value)}
            options={categorieOptions}
            className="dark:bg-gray-800 dark:border-gray-700 dark:text-white"
          />
          <Input
            label="Date début"
            type="date"
            value={dateDebut}
            onChange={(e) => setDateDebut(e.target.value)}
            className="dark:bg-gray-800 dark:border-gray-700 dark:text-white"
          />
          <Input
            label="Date fin"
            type="date"
            value={dateFin}
            onChange={(e) => setDateFin(e.target.value)}
            className="dark:bg-gray-800 dark:border-gray-700 dark:text-white"
          />
        </div>
        <div className="mt-4 flex justify-end">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => {
              setTypeFilter('')
              setDeviseFilter('')
              setCategorieFilter('')
              setDateDebut('')
              setDateFin('')
              setSearchTerm('')
            }}
            className="dark:border-gray-700 dark:text-gray-300"
          >
            <Filter className="mr-2 h-4 w-4" />
            Réinitialiser les filtres
          </Button>
        </div>
      </Card>

      {/* Barre de recherche */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
        <input
          type="text"
          placeholder="Rechercher une transaction (description, catégorie, membre, montant)..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 py-2 pl-10 pr-10 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Résultats */}
      <p className="text-sm text-gray-500 dark:text-gray-400">
        {filteredTransactions.length} transaction{filteredTransactions.length > 1 ? 's' : ''} trouvée{filteredTransactions.length > 1 ? 's' : ''}
        {searchTerm && ` pour "${searchTerm}"`}
      </p>

      {/* Tableau */}
      <Table
        columns={columns}
        data={filteredTransactions}
        isLoading={isLoading}
        emptyMessage="Aucune transaction trouvée"
        className="dark:bg-gray-900"
      />

      {/* Pagination */}
      {pages > 1 && (
        <div className="mt-4 dark:text-gray-300">
          <Pagination
            currentPage={page}
            totalPages={pages}
            onPageChange={(p) => fetchTransactions({ page: p })}
          />
        </div>
      )}

      {/* Modal suppression - Dark mode */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/70">
          <div className="w-full max-w-md rounded-lg bg-white p-6 dark:bg-gray-900">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Confirmer la suppression
            </h3>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Cette action est irréversible. Êtes-vous sûr de vouloir supprimer cette transaction ?
            </p>
            <div className="mt-6 flex justify-end space-x-3">
              <Button 
                variant="outline" 
                onClick={() => setShowDeleteModal(null)}
                className="dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                Annuler
              </Button>
              <Button variant="danger" onClick={() => handleDelete(showDeleteModal)}>
                Supprimer
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}