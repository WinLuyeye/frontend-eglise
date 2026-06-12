'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Building2, Plus, Edit, Trash2, Eye, Users, FileText, MoreVertical } from 'lucide-react'
import { Card, Button, Input, Badge, Table, Pagination, Modal } from '@/components/ui'
import { useDepartementStore } from '@/store/departementStore'
import { useMembers } from '@/hooks/useMembers'
import { formatDate } from '@/utils/formatters'

export default function DepartementsPage() {
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

  const getResponsableName = (responsableId: string) => {
    const responsable = members.find(m => m.id === responsableId)
    return responsable ? `${responsable.prenom} ${responsable.nom}` : 'Non assigné'
  }

  const columns = [
    {
      key: 'nom',
      header: 'Département',
      cell: (d: any) => (
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center dark:bg-primary-900">
            <Building2 className="h-5 w-5 text-primary-600" />
          </div>
          <div>
            <p className="font-medium text-gray-900 dark:text-white">{d.nom}</p>
            {d.description && (
              <p className="text-sm text-gray-500 line-clamp-1">{d.description}</p>
            )}
          </div>
        </div>
      ),
    },
    {
      key: 'responsable',
      header: 'Responsable',
      cell: (d: any) => (
        <div>
          <p className="text-sm text-gray-900 dark:text-white">
            {d.responsable ? `${d.responsable.prenom} ${d.responsable.nom}` : 'Non assigné'}
          </p>
          {d.responsable?.email && (
            <p className="text-xs text-gray-500">{d.responsable.email}</p>
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
            <p className="text-sm font-semibold text-gray-900 dark:text-white">
              {d._count?.membres || 0}
            </p>
            <p className="text-xs text-gray-500">Membres</p>
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-gray-900 dark:text-white">
              {d._count?.rapports || 0}
            </p>
            <p className="text-xs text-gray-500">Rapports</p>
          </div>
        </div>
      ),
    },
    {
      key: 'createdAt',
      header: 'Créé le',
      cell: (d: any) => (
        <span className="text-sm text-gray-500">{formatDate(d.createdAt)}</span>
      ),
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
            className="rounded-lg p-1 text-blue-600 hover:bg-blue-50"
            title="Voir détails"
          >
            <Eye className="h-4 w-4" />
          </button>
          <button
            onClick={() => router.push(`/admin/departements/${d.id}/modifier`)}
            className="rounded-lg p-1 text-green-600 hover:bg-green-50"
            title="Modifier"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={() => setShowDeleteModal(d.id)}
            className="rounded-lg p-1 text-red-600 hover:bg-red-50"
            title="Supprimer"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Gestion des départements
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Gérez les départements et leurs responsables
          </p>
        </div>
        <Button onClick={() => router.push('/admin/departements/nouveau')}>
          <Plus className="mr-2 h-4 w-4" />
          Nouveau département
        </Button>
      </div>

      {/* Barre de recherche */}
      <Card className="p-4">
        <div className="flex gap-4">
          <div className="flex-1">
            <Input
              placeholder="Rechercher un département..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              icon={<Building2 className="h-4 w-4" />}
            />
          </div>
        </div>
      </Card>

      {/* Tableau des départements */}
      <Table
        columns={columns}
        data={filteredDepartements}
        isLoading={isLoading}
        emptyMessage="Aucun département trouvé"
      />

      {/* Modal de détails */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        title={`Détails du département`}
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
                <p className="text-gray-700">{selectedDepartement.description || 'Aucune description'}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Responsable</label>
                <div className="flex items-center space-x-2 mt-1">
                  <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                    <span className="text-sm font-semibold text-primary-600">
                      {selectedDepartement.responsable?.prenom?.charAt(0)}
                      {selectedDepartement.responsable?.nom?.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium">
                      {selectedDepartement.responsable 
                        ? `${selectedDepartement.responsable.prenom} ${selectedDepartement.responsable.nom}`
                        : 'Non assigné'}
                    </p>
                    {selectedDepartement.responsable?.email && (
                      <p className="text-sm text-gray-500">{selectedDepartement.responsable.email}</p>
                    )}
                  </div>
                </div>
              </div>
              <div>
                <label className="text-sm text-gray-500">Statistiques</label>
                <div className="flex space-x-4 mt-1">
                  <div className="flex items-center space-x-1">
                    <Users className="h-4 w-4 text-gray-400" />
                    <span className="font-medium">{selectedDepartement._count?.membres || 0} membres</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <FileText className="h-4 w-4 text-gray-400" />
                    <span className="font-medium">{selectedDepartement._count?.rapports || 0} rapports</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t pt-4 mt-4">
              <h4 className="font-medium mb-3">Membres du département</h4>
              {selectedDepartement.membres?.length > 0 ? (
                <div className="space-y-2">
                  {selectedDepartement.membres.slice(0, 5).map((membre: any) => (
                    <div key={membre.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50">
                      <div>
                        <p className="font-medium">{membre.prenom} {membre.nom}</p>
                        <p className="text-sm text-gray-500">{membre.email || 'Pas d\'email'}</p>
                      </div>
                      <Badge variant={membre.statut === 'actif' ? 'success' : 'danger'}>
                        {membre.statut === 'actif' ? 'Actif' : 'Inactif'}
                      </Badge>
                    </div>
                  ))}
                  {selectedDepartement.membres.length > 5 && (
                    <p className="text-sm text-gray-500 text-center">
                      + {selectedDepartement.membres.length - 5} autres membres
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">Aucun membre dans ce département</p>
              )}
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <Button variant="outline" onClick={() => setShowDetailModal(false)}>
                Fermer
              </Button>
              <Button onClick={() => router.push(`/admin/departements/${selectedDepartement.id}/modifier`)}>
                <Edit className="mr-2 h-4 w-4" />
                Modifier
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal de confirmation suppression */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-lg bg-white p-6 dark:bg-gray-900">
            <h3 className="text-lg font-semibold">Confirmer la suppression</h3>
            <p className="mt-2 text-gray-600">
              Êtes-vous sûr de vouloir supprimer ce département ?
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