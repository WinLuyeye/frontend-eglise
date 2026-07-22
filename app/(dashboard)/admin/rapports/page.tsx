// app/(dashboard)/admin/rapports/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Plus, Download, FileText, Eye, Edit, Trash2, 
  Building2, Calendar, Search, X, Filter, ChevronRight,
  FileSpreadsheet, Clock, User, FolderOpen
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
  const [showFilters, setShowFilters] = useState(false)

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

  // Statistiques globales
  const totalRapports = rapports.length
  const totalDepartementsWithRapports = new Set(rapports.map(r => r.departementId)).size
  const recentRapports = rapports.filter(r => {
    const date = new Date(r.createdAt)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays <= 7
  }).length

  const columns = [
    {
      key: 'titre',
      header: 'Titre',
      cell: (r: any) => (
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-lg bg-indigo-50 flex items-center justify-center dark:bg-indigo-950/30">
            <FileText className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <p className="font-medium text-gray-900 dark:text-white">{r.titre}</p>
            <div className="flex items-center space-x-2 mt-0.5">
              <Building2 className="h-3.5 w-3.5 text-gray-400 dark:text-gray-500" />
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {r.departement?.nom || 'Département inconnu'}
              </span>
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'periode',
      header: 'Période',
      cell: (r: any) => (
        <div className="flex items-center space-x-2">
          <Calendar className="h-4 w-4 text-gray-400 dark:text-gray-500" />
          <span className="text-sm text-gray-700 dark:text-gray-300">
            {formatDate(r.periode)}
          </span>
        </div>
      ),
    },
    {
      key: 'createdAt',
      header: 'Créé le',
      cell: (r: any) => (
        <div className="flex items-center space-x-2">
          <Clock className="h-4 w-4 text-gray-400 dark:text-gray-500" />
          <span className="text-sm text-gray-700 dark:text-gray-300">
            {formatDate(r.createdAt)}
          </span>
        </div>
      ),
    },
    {
      key: 'createur',
      header: 'Créé par',
      cell: (r: any) => (
        <div className="flex items-center space-x-2">
          <div className="h-7 w-7 rounded-full bg-gray-100 flex items-center justify-center dark:bg-gray-700">
            <User className="h-3.5 w-3.5 text-gray-500 dark:text-gray-400" />
          </div>
          <span className="text-sm text-gray-700 dark:text-gray-300">
            {r.createur?.prenom && r.createur?.nom 
              ? `${r.createur.prenom} ${r.createur.nom}`
              : r.createur?.email || 'Système'
            }
          </span>
        </div>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      cell: (r: any) => (
        <div className="flex items-center space-x-1">
          <button
            onClick={() => router.push(`/admin/rapports/${r.id}`)}
            className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 hover:text-indigo-600 transition-colors dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-indigo-400"
            title="Voir"
          >
            <Eye className="h-4 w-4" />
          </button>
          <button
            onClick={() => router.push(`/admin/rapports/${r.id}/modifier`)}
            className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 hover:text-emerald-600 transition-colors dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-emerald-400"
            title="Modifier"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={() => setShowDeleteModal(r.id)}
            className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 hover:text-red-600 transition-colors dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-red-400"
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
      r.departement?.nom?.toLowerCase().includes(search) ||
      r.createur?.nom?.toLowerCase().includes(search) ||
      r.createur?.prenom?.toLowerCase().includes(search)
    )
  })

  if (isLoading && rapports.length === 0) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Spinner size="lg" className="text-indigo-600" />
          <p className="text-sm text-gray-500 dark:text-gray-400">Chargement des rapports...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* En-tête avec style amélioré */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center space-x-3">
            <div className="rounded-lg bg-indigo-50 p-2.5 dark:bg-indigo-950/30">
              <FileText className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Rapports
              </h1>
              <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
                Gérez les rapports soumis par les départements
              </p>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button 
            variant="outline" 
            onClick={() => setShowFilters(!showFilters)}
            className="border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700"
          >
            <Filter className="mr-2 h-4 w-4" />
            Filtres
          </Button>
          <Button 
            onClick={() => router.push('/admin/rapports/nouveau')}
            className="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600"
          >
            <Plus className="mr-2 h-4 w-4" />
            Nouveau rapport
          </Button>
        </div>
      </div>

      {/* Cartes de statistiques */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="p-4 border-l-4 border-l-indigo-500 dark:border-l-indigo-400">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total rapports</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalRapports}</p>
            </div>
            <div className="rounded-lg bg-indigo-100 p-3 dark:bg-indigo-900/30">
              <FileText className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            </div>
          </div>
        </Card>

        <Card className="p-4 border-l-4 border-l-emerald-500 dark:border-l-emerald-400">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Départements actifs</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalDepartementsWithRapports}</p>
            </div>
            <div className="rounded-lg bg-emerald-100 p-3 dark:bg-emerald-900/30">
              <FolderOpen className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
        </Card>

        <Card className="p-4 border-l-4 border-l-purple-500 dark:border-l-purple-400">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Rapports récents</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{recentRapports}</p>
            </div>
            <div className="rounded-lg bg-purple-100 p-3 dark:bg-purple-900/30">
              <Clock className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </Card>
      </div>

      {/* Filtres */}
      {showFilters && (
        <Card className="p-4 animate-in slide-in-from-top-4 duration-200 dark:bg-gray-800/50">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Select
              label="Département"
              value={departementFilter}
              onChange={(e) => setDepartementFilter(e.target.value)}
              options={departementOptions}
              className="dark:bg-gray-900 dark:border-gray-700 dark:text-white"
            />
            <Input
              label="Période début"
              type="date"
              value={periodeDebut}
              onChange={(e) => setPeriodeDebut(e.target.value)}
              className="dark:bg-gray-900 dark:border-gray-700 dark:text-white"
            />
            <Input
              label="Période fin"
              type="date"
              value={periodeFin}
              onChange={(e) => setPeriodeFin(e.target.value)}
              className="dark:bg-gray-900 dark:border-gray-700 dark:text-white"
            />
          </div>
          <div className="mt-4 flex justify-end">
            <Button 
              variant="outline" 
              onClick={() => {
                setDepartementFilter('')
                setPeriodeDebut('')
                setPeriodeFin('')
              }}
              className="mr-2 border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700"
            >
              <X className="mr-2 h-4 w-4" />
              Réinitialiser
            </Button>
          </div>
        </Card>
      )}

      {/* Barre de recherche améliorée */}
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2">
          <Search className="h-4 w-4 text-gray-400 dark:text-gray-500" />
        </div>
        <input
          type="text"
          placeholder="Rechercher un rapport par titre, contenu, département ou auteur..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-10 pr-10 text-gray-900 placeholder-gray-400 focus:border-indigo-300 focus:outline-none focus:ring-1 focus:ring-indigo-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500 dark:focus:border-indigo-500"
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:text-gray-500 dark:hover:bg-gray-700 dark:hover:text-gray-300"
          >
            <X className="h-4 w-4" />
          </button>
        )}
        <div className="absolute right-12 top-1/2 -translate-y-1/2 text-sm text-gray-400 dark:text-gray-500">
          {filteredRapports.length} résultat{filteredRapports.length > 1 ? 's' : ''}
        </div>
      </div>

      {/* Tableau amélioré */}
      <Table
        columns={columns}
        data={filteredRapports}
        isLoading={isLoading}
        emptyMessage={
          <div className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-gray-300 dark:text-gray-600" />
            <p className="mt-4 text-gray-500 dark:text-gray-400">Aucun rapport trouvé</p>
            <p className="text-sm text-gray-400 dark:text-gray-500">
              {searchTerm ? 'Essayez de modifier vos critères de recherche' : 'Créez votre premier rapport'}
            </p>
            {!searchTerm && (
              <Button 
                onClick={() => router.push('/admin/rapports/nouveau')}
                className="mt-4 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600"
              >
                <Plus className="mr-2 h-4 w-4" />
                Créer un rapport
              </Button>
            )}
          </div>
        }
        className="dark:bg-gray-900"
      />

      {/* Pagination améliorée */}
      {pages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Affichage de <span className="font-medium">{filteredRapports.length}</span> rapports
          </div>
          <Pagination
            currentPage={page}
            totalPages={pages}
            onPageChange={(p) => fetchRapports({ page: p })}
            className="dark:text-gray-300"
          />
        </div>
      )}

      {/* Modal suppression amélioré */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md transform animate-in fade-in zoom-in-95 rounded-2xl bg-white p-6 shadow-2xl duration-200 dark:bg-gray-800">
            <div className="flex items-center space-x-3">
              <div className="rounded-full bg-red-100 p-3 dark:bg-red-900/30">
                <Trash2 className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Confirmer la suppression
              </h3>
            </div>
            
            <p className="mt-4 text-sm text-gray-600 dark:text-gray-300">
              Êtes-vous sûr de vouloir supprimer ce rapport ? 
              Cette action est irréversible et supprimera toutes les données associées.
            </p>
            
            <div className="mt-6 flex justify-end space-x-3">
              <Button 
                variant="outline" 
                onClick={() => setShowDeleteModal(null)}
                className="border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700"
              >
                Annuler
              </Button>
              <Button 
                variant="danger" 
                onClick={() => handleDelete(showDeleteModal)}
                className="bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Supprimer
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}