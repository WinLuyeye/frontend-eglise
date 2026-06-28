// app/(dashboard)/admin/rapports/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Plus, Download, FileText, Eye, Edit, Trash2, 
  Building2, Calendar, Search, X 
} from 'lucide-react'
import { Card, Button, Input, Select, Badge, Table, Pagination, Spinner } from '@/components/ui'
import { useRapportStore } from '@/store/rapportStore'
import { useDepartementStore } from '@/store/departementStore'
import { formatDate } from '@/utils/formatters'

export default function AdminRapportsPage() {
  const router = useRouter()
  const { rapports, total, page, pages, isLoading, fetchRapports, deleteRapport } = useRapportStore()
  const { departements, fetchDepartements } = useDepartementStore()
  
  const [departementFilter, setDepartementFilter] = useState('')
  const [periodeDebut, setPeriodeDebut] = useState('')
  const [periodeFin, setPeriodeFin] = useState('')
  const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchDepartements()
    fetchRapports({ 
      page, 
      limit: 10,
      departementId: departementFilter || undefined,
      periodeDebut: periodeDebut || undefined,
      periodeFin: periodeFin || undefined
    })
  }, [page, departementFilter, periodeDebut, periodeFin])

  const handleDelete = async (id: string) => {
    await deleteRapport(id)
    setShowDeleteModal(null)
  }

  const columns = [
    {
      key: 'titre',
      header: 'Titre',
      cell: (r: any) => (
        <div>
          <p className="font-medium text-gray-900 dark:text-white">{r.titre}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {r.departement?.nom}
          </p>
        </div>
      ),
    },
    {
      key: 'periode',
      header: 'Période',
      cell: (r: any) => (
        <span className="text-gray-700 dark:text-gray-300">
          {formatDate(r.periode)}
        </span>
      ),
    },
    {
      key: 'createdAt',
      header: 'Date de création',
      cell: (r: any) => (
        <span className="text-gray-700 dark:text-gray-300">
          {formatDate(r.createdAt)}
        </span>
      ),
    },
    {
      key: 'createur',
      header: 'Créé par',
      cell: (r: any) => (
        <span className="text-gray-700 dark:text-gray-300">
          {r.createur?.email || 'Système'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      cell: (r: any) => (
        <div className="flex space-x-2">
          <button
            onClick={() => router.push(`/admin/rapports/${r.id}`)}
            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
            title="Voir"
          >
            <Eye className="h-4 w-4" />
          </button>
          <button
            onClick={() => router.push(`/admin/rapports/${r.id}/modifier`)}
            className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 transition-colors"
            title="Modifier"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={() => setShowDeleteModal(r.id)}
            className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition-colors"
            title="Supprimer"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ]

  const departementOptions = [
    { value: '', label: 'Tous les départements' },
    ...departements.map(d => ({ value: d.id, label: d.nom })),
  ]

  // Filtrer les rapports par recherche
  const filteredRapports = rapports.filter(r => {
    if (!searchTerm) return true
    const search = searchTerm.toLowerCase()
    return (
      r.titre?.toLowerCase().includes(search) ||
      r.contenu?.toLowerCase().includes(search) ||
      r.departement?.nom?.toLowerCase().includes(search)
    )
  })

  if (isLoading && rapports.length === 0) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Rapports des départements
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Gérez les rapports soumis par les départements
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" className="dark:border-gray-700 dark:text-gray-300">
            <Download className="mr-2 h-4 w-4" />
            Exporter
          </Button>
          <Button onClick={() => router.push('/admin/rapports/nouveau')}>
            <Plus className="mr-2 h-4 w-4" />
            Nouveau rapport
          </Button>
        </div>
      </div>

      {/* Filtres */}
      <Card className="p-4 dark:bg-gray-900 dark:border-gray-800">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Select
            label="Département"
            value={departementFilter}
            onChange={(e) => setDepartementFilter(e.target.value)}
            options={departementOptions}
            className="dark:bg-gray-800 dark:border-gray-700 dark:text-white"
          />
          <Input
            label="Période début"
            type="date"
            value={periodeDebut}
            onChange={(e) => setPeriodeDebut(e.target.value)}
            className="dark:bg-gray-800 dark:border-gray-700 dark:text-white"
          />
          <Input
            label="Période fin"
            type="date"
            value={periodeFin}
            onChange={(e) => setPeriodeFin(e.target.value)}
            className="dark:bg-gray-800 dark:border-gray-700 dark:text-white"
          />
        </div>
      </Card>

      {/* Barre de recherche */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
        <input
          type="text"
          placeholder="Rechercher un rapport..."
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

      {/* Tableau */}
      <Table
        columns={columns}
        data={filteredRapports}
        isLoading={isLoading}
        emptyMessage="Aucun rapport trouvé"
        className="dark:bg-gray-900"
      />

      {/* Pagination */}
      {pages > 1 && (
        <div className="mt-4">
          <Pagination
            currentPage={page}
            totalPages={pages}
            onPageChange={(p) => fetchRapports({ page: p })}
            className="dark:text-gray-300"
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
              Êtes-vous sûr de vouloir supprimer ce rapport ? Cette action est irréversible.
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