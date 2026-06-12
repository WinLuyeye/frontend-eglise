'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Download, Filter, Eye, Trash2, Edit } from 'lucide-react'
import { Card, Button, Input, Select, Badge, Table, Pagination, Spinner } from '@/components/ui'
import { useTransactions } from '@/hooks/useTransactions'
import { useCategorieStore } from '@/store/categorieStore'
import { formatDate } from '@/utils/formatters'

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

  const formatMontant = (montant: number, devise: string) => {
    if (devise === 'USD') {
      return `$${montant.toLocaleString(undefined, { minimumFractionDigits: 2 })}`
    }
    return `${montant.toLocaleString()} FC`
  }

  const columns = [
    {
      key: 'date',
      header: 'Date',
      cell: (t: any) => formatDate(t.dateTransaction),
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
      cell: (t: any) => t.categorie?.nom || '-',
    },
    {
      key: 'montant',
      header: 'Montant',
      cell: (t: any) => (
        <span className={t.type === 'entree' ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
          {formatMontant(t.montant, t.devise || 'CDF')}
        </span>
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
      cell: (t: any) => t.membre ? `${t.membre.prenom} ${t.membre.nom}` : '-',
    },
    {
      key: 'description',
      header: 'Description',
      cell: (t: any) => t.description?.substring(0, 30) || '-',
    },
    {
      key: 'actions',
      header: 'Actions',
      cell: (t: any) => (
        <div className="flex space-x-2">
          <button
            onClick={() => router.push(`/admin/finances/transactions/${t.id}`)}
            className="text-blue-600 hover:text-blue-800"
            title="Voir"
          >
            <Eye className="h-4 w-4" />
          </button>
          <button
            onClick={() => router.push(`/admin/finances/transactions/${t.id}/modifier`)}
            className="text-green-600 hover:text-green-800"
            title="Modifier"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={() => setShowDeleteModal(t.id)}
            className="text-red-600 hover:text-red-800"
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
    { value: 'USD', label: 'USD' },
    { value: 'CDF', label: 'CDF' },
  ]

  const categorieOptions = [
    { value: '', label: 'Toutes' },
    ...categories.map(c => ({ value: c.id, label: c.nom })),
  ]

  if (isLoading && transactions.length === 0) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>
          <p className="mt-1 text-sm text-gray-500">Gérez toutes les transactions financières</p>
        </div>
        <Button onClick={() => router.push('/admin/finances/transactions/nouveau')}>
          <Plus className="mr-2 h-4 w-4" />
          Nouvelle transaction
        </Button>
      </div>

      {/* Filtres */}
      <Card className="p-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <Select
            label="Type"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as 'entree' | 'sortie' | '')}
            options={typeOptions}
          />
          <Select
            label="Devise"
            value={deviseFilter}
            onChange={(e) => setDeviseFilter(e.target.value)}
            options={deviseOptions}
          />
          <Select
            label="Catégorie"
            value={categorieFilter}
            onChange={(e) => setCategorieFilter(e.target.value)}
            options={categorieOptions}
          />
          <Input
            label="Date début"
            type="date"
            value={dateDebut}
            onChange={(e) => setDateDebut(e.target.value)}
          />
          <Input
            label="Date fin"
            type="date"
            value={dateFin}
            onChange={(e) => setDateFin(e.target.value)}
          />
        </div>
      </Card>

      {/* Tableau */}
      <Table
        columns={columns}
        data={transactions}
        isLoading={isLoading}
        emptyMessage="Aucune transaction trouvée"
      />

      {/* Pagination */}
      {pages > 1 && (
        <div className="mt-4">
          <Pagination
            currentPage={page}
            totalPages={pages}
            onPageChange={(p) => fetchTransactions({ page: p })}
          />
        </div>
      )}

      {/* Modal suppression */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-lg bg-white p-6">
            <h3 className="text-lg font-semibold">Confirmer la suppression</h3>
            <p className="mt-2 text-gray-600">Cette action est irréversible.</p>
            <div className="mt-6 flex justify-end space-x-3">
              <Button variant="outline" onClick={() => setShowDeleteModal(null)}>
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