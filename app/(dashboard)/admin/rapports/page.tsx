'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { FileText, Plus, Eye, Edit, Trash2, Download, Filter, Building2, Calendar, Search, RefreshCw } from 'lucide-react'
import { Card, Button, Input, Select, Badge, Table, Pagination, Modal, Spinner } from '@/components/ui'
import { useRapportStore } from '@/store/rapportStore'
import { useDepartementStore } from '@/store/departementStore'
import { formatDate } from '@/utils/formatters'

export default function RapportsPage() {
  const router = useRouter()
  const { 
    rapports, 
    total, 
    page, 
    pages, 
    isLoading, 
    fetchRapports, 
    deleteRapport,
    clearError 
  } = useRapportStore()
  const { departements, fetchDepartements } = useDepartementStore()
  
  const [search, setSearch] = useState('')
  const [departementFilter, setDepartementFilter] = useState('')
  const [periodeDebut, setPeriodeDebut] = useState('')
  const [periodeFin, setPeriodeFin] = useState('')
  const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null)
  const [selectedRapport, setSelectedRapport] = useState<any>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)

  useEffect(() => {
    fetchDepartements()
  }, [])

  useEffect(() => {
    const loadRapports = async () => {
      setIsRefreshing(true)
      await fetchRapports({ 
        page, 
        limit: 10, 
        search: search || undefined, 
        departementId: departementFilter || undefined,
        periodeDebut: periodeDebut || undefined,
        periodeFin: periodeFin || undefined
      })
      setIsRefreshing(false)
    }
    loadRapports()
  }, [page, search, departementFilter, periodeDebut, periodeFin])

  const handleDelete = async (id: string) => {
    await deleteRapport(id)
    setShowDeleteModal(null)
    await fetchRapports({ page, limit: 10 })
  }

  const handleView = (rapport: any) => {
    setSelectedRapport(rapport)
    setShowDetailModal(true)
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await fetchRapports({ page, limit: 10 })
    setIsRefreshing(false)
  }

  const handleExport = () => {
    if (rapports.length === 0) return
    
    const headers = ['Titre', 'Département', 'Période', 'Date création', 'Contenu']
    const csvData = rapports.map(r => [
      `"${r.titre.replace(/"/g, '""')}"`,
      `"${(r.departement?.nom || 'Non assigné').replace(/"/g, '""')}"`,
      formatDate(r.periode),
      formatDate(r.createdAt),
      `"${(r.contenu || '').replace(/"/g, '""').substring(0, 500)}"`
    ])
    
    const csvContent = [headers, ...csvData].map(row => row.join(',')).join('\n')
    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `rapports_${formatDate(new Date())}.csv`)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const columns = [
    {
      key: 'titre',
      header: 'Titre',
      cell: (r: any) => (
        <div>
          <p className="font-medium text-gray-900 line-clamp-1">{r.titre}</p>
          <p className="text-xs text-gray-500">{formatDate(r.createdAt)}</p>
        </div>
      ),
    },
    {
      key: 'departement',
      header: 'Département',
      cell: (r: any) => (
        <Badge variant="info" size="sm">
          {r.departement?.nom || 'Non assigné'}
        </Badge>
      ),
    },
    {
      key: 'periode',
      header: 'Période',
      cell: (r: any) => (
        <div className="flex items-center space-x-1">
          <Calendar className="h-3 w-3 text-gray-400" />
          <span className="text-sm">{formatDate(r.periode)}</span>
        </div>
      ),
    },
    {
      key: 'createur',
      header: 'Créé par',
      cell: (r: any) => (
        <span className="text-sm text-gray-600">
          {(r as any).createur?.email?.split('@')[0] || (r as any).createdBy || '-'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      cell: (r: any) => (
        <div className="flex space-x-2">
          <button
            onClick={() => handleView(r)}
            className="rounded-lg p-1.5 text-blue-600 hover:bg-blue-50"
            title="Voir"
          >
            <Eye className="h-4 w-4" />
          </button>
          <button
            onClick={() => router.push(`/admin/rapports/${r.id}/modifier`)}
            className="rounded-lg p-1.5 text-green-600 hover:bg-green-50"
            title="Modifier"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={() => setShowDeleteModal(r.id)}
            className="rounded-lg p-1.5 text-red-600 hover:bg-red-50"
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

  const totalRapports = total || rapports.length
  const departementsAvecRapports = [...new Set(rapports.map(r => r.departementId))].length
  const rapportsCeMois = rapports.filter(r => {
    const date = new Date(r.createdAt)
    const now = new Date()
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()
  }).length
  const dernierRapport = rapports[0]?.createdAt

  const isLoadingData = isLoading || isRefreshing

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Gestion des rapports
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Consultez et gérez les rapports départementaux
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleRefresh} disabled={isLoadingData}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoadingData ? 'animate-spin' : ''}`} />
            Actualiser
          </Button>
          <Button variant="outline" onClick={handleExport} disabled={rapports.length === 0}>
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
      <Card className="p-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <div className="relative lg:col-span-2">
            <Input
              placeholder="Rechercher par titre..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              icon={<Search className="h-4 w-4" />}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Département
            </label>
            <select
              value={departementFilter}
              onChange={(e) => setDepartementFilter(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              disabled={departements.length === 0}
            >
              {departementOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <Input
            label="Période début"
            type="month"
            value={periodeDebut}
            onChange={(e) => setPeriodeDebut(e.target.value)}
          />
          <Input
            label="Période fin"
            type="month"
            value={periodeFin}
            onChange={(e) => setPeriodeFin(e.target.value)}
          />
        </div>
      </Card>

      {/* Statistiques */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total rapports</p>
              <p className="text-2xl font-bold">{totalRapports}</p>
            </div>
            <FileText className="h-8 w-8 text-primary-500" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Départements actifs</p>
              <p className="text-2xl font-bold">{departementsAvecRapports}</p>
            </div>
            <Building2 className="h-8 w-8 text-blue-500" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Rapports ce mois</p>
              <p className="text-2xl font-bold">{rapportsCeMois}</p>
            </div>
            <Calendar className="h-8 w-8 text-green-500" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Dernier rapport</p>
              <p className="text-sm font-medium">
                {dernierRapport ? formatDate(dernierRapport) : '-'}
              </p>
            </div>
            <FileText className="h-8 w-8 text-purple-500" />
          </div>
        </Card>
      </div>

      {/* Tableau des rapports */}
      <Table
        columns={columns}
        data={rapports}
        isLoading={isLoadingData}
        emptyMessage="Aucun rapport trouvé"
      />

      {/* Pagination */}
      {pages > 1 && (
        <div className="mt-4">
          <Pagination
            currentPage={page}
            totalPages={pages}
            onPageChange={(p) => fetchRapports({ page: p, limit: 10 })}
          />
        </div>
      )}

      {/* Modal de détails */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => {
          setShowDetailModal(false)
          setSelectedRapport(null)
        }}
        title="Détails du rapport"
        size="lg"
      >
        {selectedRapport && (
          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {selectedRapport.titre}
                </h3>
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  <Badge variant="info" size="sm">
                    {selectedRapport.departement?.nom || 'Non assigné'}
                  </Badge>
                  <span className="text-sm text-gray-500">
                    📅 {formatDate(selectedRapport.periode)}
                  </span>
                </div>
              </div>
              <div className="text-right text-sm text-gray-500">
                <p>👤 {(selectedRapport as any).createur?.email?.split('@')[0] || 'Inconnu'}</p>
                <p>📆 {formatDate(selectedRapport.createdAt)}</p>
              </div>
            </div>
            
            <div className="border-t pt-4">
              <p className="text-gray-700 whitespace-pre-wrap">
                {selectedRapport.contenu || 'Aucun contenu'}
              </p>
            </div>
            
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => router.push(`/admin/rapports/${selectedRapport.id}/modifier`)}
              >
                <Edit className="mr-2 h-4 w-4" />
                Modifier
              </Button>
              <Button
                variant="danger"
                onClick={() => {
                  setShowDetailModal(false)
                  setShowDeleteModal(selectedRapport.id)
                }}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Supprimer
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal de confirmation suppression */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-lg bg-white p-6">
            <div className="flex items-center space-x-3 text-red-600">
              <Trash2 className="h-6 w-6" />
              <h3 className="text-lg font-semibold">Confirmer la suppression</h3>
            </div>
            <p className="mt-2 text-gray-600">
              Êtes-vous sûr de vouloir supprimer ce rapport ?
            </p>
            <p className="mt-1 text-sm text-red-500">
              Cette action est irréversible.
            </p>
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