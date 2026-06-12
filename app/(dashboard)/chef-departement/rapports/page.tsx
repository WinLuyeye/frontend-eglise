'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { FileText, Plus, Eye, Edit, Trash2, Download, Filter, Calendar, Search } from 'lucide-react'
import { Card, Button, Input, Select, Badge, Table, Pagination, Spinner } from '@/components/ui'
import { useRapportStore } from '@/store/rapportStore'
import { useAuth } from '@/hooks/useAuth'
import { formatDate } from '@/utils/formatters'

export default function ChefDepartementRapportsPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { rapports, total, page, pages, isLoading, fetchRapports, deleteRapport } = useRapportStore()
  
  const [search, setSearch] = useState('')
  const [periodeDebut, setPeriodeDebut] = useState('')
  const [periodeFin, setPeriodeFin] = useState('')
  const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null)
  const [selectedRapport, setSelectedRapport] = useState<any>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)

  useEffect(() => {
    fetchRapports({ 
      page, 
      limit: 10, 
      search, 
      periodeDebut,
      periodeFin
    })
  }, [page, search, periodeDebut, periodeFin])

  const handleDelete = async (id: string) => {
    await deleteRapport(id)
    setShowDeleteModal(null)
  }

  const handleView = (rapport: any) => {
    setSelectedRapport(rapport)
    setShowDetailModal(true)
  }

  const handleExport = () => {
    const headers = ['Titre', 'Période', 'Date création', 'Contenu']
    const csvData = rapports.map(r => [
      r.titre,
      formatDate(r.periode),
      formatDate(r.createdAt),
      r.contenu.replace(/,/g, ' ').substring(0, 200)
    ])
    
    const csvContent = [headers, ...csvData].map(row => row.join(',')).join('\n')
    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `rapports_${formatDate(new Date())}.csv`)
    link.click()
    URL.revokeObjectURL(url)
  }

  const columns = [
    {
      key: 'titre',
      header: 'Titre',
      cell: (r: any) => (
        <div>
          <p className="font-medium">{r.titre}</p>
          <p className="text-xs text-gray-500">{formatDate(r.createdAt)}</p>
        </div>
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
        <span className="text-sm text-gray-600">{r.createur?.email?.split('@')[0] || '-'}</span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      cell: (r: any) => (
        <div className="flex space-x-2">
          <button
            onClick={() => handleView(r)}
            className="rounded-lg p-1 text-blue-600 hover:bg-blue-50"
            title="Voir"
          >
            <Eye className="h-4 w-4" />
          </button>
          <button
            onClick={() => router.push(`/chef-departement/rapports/${r.id}/modifier`)}
            className="rounded-lg p-1 text-green-600 hover:bg-green-50"
            title="Modifier"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={() => setShowDeleteModal(r.id)}
            className="rounded-lg p-1 text-red-600 hover:bg-red-50"
            title="Supprimer"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ]

  if (isLoading && rapports.length === 0) {
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
          <h1 className="text-2xl font-bold text-gray-900">Mes rapports</h1>
          <p className="mt-1 text-sm text-gray-500">Gérez les rapports de votre département</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleExport} disabled={rapports.length === 0}>
            <Download className="mr-2 h-4 w-4" />
            Exporter
          </Button>
          <Button onClick={() => router.push('/chef-departement/rapports/nouveau')}>
            <Plus className="mr-2 h-4 w-4" />
            Nouveau rapport
          </Button>
        </div>
      </div>

      {/* Filtres */}
      <Card className="p-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Input
            placeholder="Rechercher un rapport..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            icon={<Search className="h-4 w-4" />}
          />
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
        <Card className="p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total rapports</p>
              <p className="text-2xl font-bold">{total}</p>
            </div>
            <FileText className="h-8 w-8 text-primary-500" />
          </div>
        </Card>
        <Card className="p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Cette année</p>
              <p className="text-2xl font-bold">
                {rapports.filter(r => new Date(r.createdAt).getFullYear() === new Date().getFullYear()).length}
              </p>
            </div>
            <Calendar className="h-8 w-8 text-green-500" />
          </div>
        </Card>
        <Card className="p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Ce mois</p>
              <p className="text-2xl font-bold">
                {rapports.filter(r => {
                  const date = new Date(r.createdAt)
                  const now = new Date()
                  return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()
                }).length}
              </p>
            </div>
            <FileText className="h-8 w-8 text-blue-500" />
          </div>
        </Card>
        <Card className="p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Dernier rapport</p>
              <p className="text-sm font-medium">
                {rapports[0] ? formatDate(rapports[0].createdAt) : '-'}
              </p>
            </div>
            <FileText className="h-8 w-8 text-purple-500" />
          </div>
        </Card>
      </div>

      {/* Tableau */}
      <Table
        columns={columns}
        data={rapports}
        isLoading={isLoading}
        emptyMessage="Aucun rapport trouvé"
      />

      {/* Pagination */}
      {pages > 1 && (
        <div className="mt-4">
          <Pagination
            currentPage={page}
            totalPages={pages}
            onPageChange={(p) => fetchRapports({ page: p })}
          />
        </div>
      )}

      {/* Modal détails */}
      {showDetailModal && selectedRapport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-2xl rounded-lg bg-white p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-semibold">{selectedRapport.titre}</h3>
                <div className="flex items-center space-x-2 mt-1">
                  <Badge variant="info">{selectedRapport.departement?.nom}</Badge>
                  <span className="text-sm text-gray-500">
                    {formatDate(selectedRapport.periode)}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            <div className="border-t pt-4">
              <p className="whitespace-pre-wrap text-gray-700">{selectedRapport.contenu}</p>
            </div>
            <div className="border-t pt-4 mt-4 flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowDetailModal(false)
                  router.push(`/chef-departement/rapports/${selectedRapport.id}/modifier`)
                }}
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