'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Building2, Plus, Eye, Edit, Trash2, Users, FileText } from 'lucide-react'
import { Card, Button, Input, Badge, Table, Pagination, Spinner, Modal } from '@/components/ui'
import { useDepartementStore } from '@/store/departementStore'
import { useMembers } from '@/hooks/useMembers'
import { formatDate } from '@/utils/formatters'

export default function SecretaireDepartementsPage() {
  const router = useRouter()
  const { departements, isLoading, fetchDepartements, deleteDepartement } = useDepartementStore()
  const { members, fetchMembers } = useMembers()
  const [search, setSearch] = useState('')
  const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null)
  const [selectedDepartement, setSelectedDepartement] = useState<any>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)

  useEffect(() => {
    fetchDepartements()
    fetchMembers({ limit: 100 })
  }, [])

  const filteredDepartements = departements.filter(d =>
    d.nom.toLowerCase().includes(search.toLowerCase()) ||
    d.description?.toLowerCase().includes(search.toLowerCase())
  )

  const handleDelete = async (id: string) => {
    await deleteDepartement(id)
    setShowDeleteModal(null)
  }

  const columns = [
    {
      key: 'nom',
      header: 'Département',
      cell: (d: any) => (
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
            <Building2 className="h-5 w-5 text-primary-600" />
          </div>
          <div>
            <p className="font-medium">{d.nom}</p>
            {d.description && <p className="text-sm text-gray-500 line-clamp-1">{d.description}</p>}
          </div>
        </div>
      ),
    },
    {
      key: 'responsable',
      header: 'Responsable',
      cell: (d: any) => (
        <div>
          {d.responsable ? (
            <>
              <p className="font-medium">{d.responsable.prenom} {d.responsable.nom}</p>
              {d.responsable.email && <p className="text-xs text-gray-500">{d.responsable.email}</p>}
            </>
          ) : (
            <span className="text-gray-400">Non assigné</span>
          )}
        </div>
      ),
    },
    {
      key: 'statistiques',
      header: 'Statistiques',
      cell: (d: any) => (
        <div className="flex space-x-3">
          <div className="text-center">
            <p className="text-sm font-semibold">{d._count?.membres || 0}</p>
            <p className="text-xs text-gray-500">Membres</p>
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold">{d._count?.rapports || 0}</p>
            <p className="text-xs text-gray-500">Rapports</p>
          </div>
        </div>
      ),
    },
    {
      key: 'createdAt',
      header: 'Créé le',
      cell: (d: any) => formatDate(d.createdAt),
    },
    {
      key: 'actions',
      header: 'Actions',
      cell: (d: any) => (
        <div className="flex space-x-2">
          <button
            onClick={() => {
              setSelectedDepartement(d)
              setShowDetailModal(true)
            }}
            className="text-blue-600 hover:text-blue-800"
            title="Voir détails"
          >
            <Eye className="h-4 w-4" />
          </button>
          <button
            onClick={() => router.push(`/secretaire/departements/${d.id}/modifier`)}
            className="text-green-600 hover:text-green-800"
            title="Modifier"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={() => setShowDeleteModal(d.id)}
            className="text-red-600 hover:text-red-800"
            title="Supprimer"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ]

  if (isLoading) {
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
          <h1 className="text-2xl font-bold text-gray-900">Départements</h1>
          <p className="mt-1 text-sm text-gray-500">Gérez les départements de l'église</p>
        </div>
        <Button onClick={() => router.push('/secretaire/departements/nouveau')}>
          <Plus className="mr-2 h-4 w-4" />
          Nouveau département
        </Button>
      </div>

      {/* Recherche */}
      <Card className="p-4">
        <Input
          placeholder="Rechercher un département..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          icon={<Building2 className="h-4 w-4" />}
        />
      </Card>

      {/* Tableau */}
      <Table
        columns={columns}
        data={filteredDepartements}
        isLoading={isLoading}
        emptyMessage="Aucun département trouvé"
      />

      {/* Modal détails */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => {
          setShowDetailModal(false)
          setSelectedDepartement(null)
        }}
        title={selectedDepartement?.nom}
        size="lg"
      >
        {selectedDepartement && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-500">Nom</label>
                <p className="font-medium">{selectedDepartement.nom}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Date de création</label>
                <p>{formatDate(selectedDepartement.createdAt)}</p>
              </div>
              <div className="col-span-2">
                <label className="text-sm text-gray-500">Description</label>
                <p>{selectedDepartement.description || 'Aucune description'}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Responsable</label>
                {selectedDepartement.responsable ? (
                  <p className="font-medium">
                    {selectedDepartement.responsable.prenom} {selectedDepartement.responsable.nom}
                  </p>
                ) : (
                  <p className="text-gray-400">Non assigné</p>
                )}
              </div>
              <div>
                <label className="text-sm text-gray-500">Statistiques</label>
                <div className="flex space-x-4 mt-1">
                  <div className="flex items-center space-x-1">
                    <Users className="h-4 w-4 text-gray-400" />
                    <span>{selectedDepartement._count?.membres || 0} membres</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <FileText className="h-4 w-4 text-gray-400" />
                    <span>{selectedDepartement._count?.rapports || 0} rapports</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>

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