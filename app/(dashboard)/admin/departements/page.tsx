'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Building2, Plus, Edit, Trash2, Eye, Users, FileText, MoreVertical, ChevronRight, Calendar, User, Mail } from 'lucide-react'
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

  // Statistiques globales
  const totalDepartements = departements.length
  const totalMembres = departements.reduce((acc, d) => acc + (d._count?.membres || 0), 0)
  const totalRapports = departements.reduce((acc, d) => acc + (d._count?.rapports || 0), 0)

  const columns = [
    {
      key: 'nom',
      header: 'Département',
      cell: (d: any) => (
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-lg bg-indigo-50 flex items-center justify-center dark:bg-indigo-950/30">
            <Building2 className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <p className="font-medium text-gray-900 dark:text-white">{d.nom}</p>
            {d.description && (
              <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">{d.description}</p>
            )}
          </div>
        </div>
      ),
    },
    {
      key: 'responsable',
      header: 'Responsable',
      cell: (d: any) => (
        <div className="flex items-center space-x-3">
          <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center dark:bg-gray-700">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
              {d.responsable?.prenom?.charAt(0)}{d.responsable?.nom?.charAt(0) || '—'}
            </span>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {d.responsable ? `${d.responsable.prenom} ${d.responsable.nom}` : 'Non assigné'}
            </p>
            {d.responsable?.email && (
              <p className="text-xs text-gray-500 dark:text-gray-400">{d.responsable.email}</p>
            )}
          </div>
        </div>
      ),
    },
    {
      key: 'statistiques',
      header: 'Statistiques',
      cell: (d: any) => (
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1">
            <Users className="h-4 w-4 text-gray-400 dark:text-gray-500" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {d._count?.membres || 0}
            </span>
          </div>
          <div className="flex items-center space-x-1">
            <FileText className="h-4 w-4 text-gray-400 dark:text-gray-500" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {d._count?.rapports || 0}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: 'createdAt',
      header: 'Créé le',
      cell: (d: any) => (
        <div className="flex items-center space-x-2">
          <Calendar className="h-4 w-4 text-gray-400 dark:text-gray-500" />
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {formatDate(d.createdAt)}
          </span>
        </div>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      cell: (d: any) => (
        <div className="flex items-center space-x-1">
          <button
            onClick={() => {
              setSelectedDepartement(d)
              setShowDetailModal(true)
            }}
            className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-200"
            title="Voir détails"
          >
            <Eye className="h-4 w-4" />
          </button>
          <button
            onClick={() => router.push(`/admin/departements/${d.id}/modifier`)}
            className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 hover:text-indigo-600 transition-colors dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-indigo-400"
            title="Modifier"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={() => setShowDeleteModal(d.id)}
            className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 hover:text-red-600 transition-colors dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-red-400"
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
      {/* En-tête avec style amélioré */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center space-x-3">
            <div className="rounded-lg bg-indigo-50 p-2.5 dark:bg-indigo-950/30">
              <Building2 className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Départements
              </h1>
              <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
                Gérez les départements et leurs responsables
              </p>
            </div>
          </div>
        </div>
        <Button 
          onClick={() => router.push('/admin/departements/nouveau')}
          className="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600"
        >
          <Plus className="mr-2 h-4 w-4" />
          Nouveau département
        </Button>
      </div>

      {/* Cartes de statistiques */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="p-4 border-l-4 border-l-indigo-500 dark:border-l-indigo-400">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total départements</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalDepartements}</p>
            </div>
            <div className="rounded-lg bg-indigo-100 p-3 dark:bg-indigo-900/30">
              <Building2 className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            </div>
          </div>
        </Card>

        <Card className="p-4 border-l-4 border-l-emerald-500 dark:border-l-emerald-400">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total membres</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalMembres}</p>
            </div>
            <div className="rounded-lg bg-emerald-100 p-3 dark:bg-emerald-900/30">
              <Users className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
        </Card>

        <Card className="p-4 border-l-4 border-l-purple-500 dark:border-l-purple-400">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total rapports</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalRapports}</p>
            </div>
            <div className="rounded-lg bg-purple-100 p-3 dark:bg-purple-900/30">
              <FileText className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </Card>
      </div>

      {/* Barre de recherche */}
      <Card className="p-4 dark:bg-gray-800/50">
        <div className="flex gap-4">
          <div className="flex-1">
            <Input
              placeholder="Rechercher un département..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              icon={<Building2 className="h-4 w-4" />}
              className="border-gray-200 focus:border-indigo-300 dark:border-gray-700 dark:bg-gray-900"
            />
          </div>
          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
            <span className="font-medium">{filteredDepartements.length}</span>
            <span className="mx-1">résultat{filteredDepartements.length > 1 ? 's' : ''}</span>
          </div>
        </div>
      </Card>

      {/* Tableau des départements */}
      <Table
        columns={columns}
        data={filteredDepartements}
        isLoading={isLoading}
        emptyMessage={
          <div className="flex flex-col items-center justify-center py-12">
            <Building2 className="h-12 w-12 text-gray-300 dark:text-gray-600" />
            <p className="mt-4 text-gray-500 dark:text-gray-400">Aucun département trouvé</p>
            <Button 
              onClick={() => router.push('/admin/departements/nouveau')}
              className="mt-4 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600"
            >
              <Plus className="mr-2 h-4 w-4" />
              Créer un département
            </Button>
          </div>
        }
      />

      {/* Modal de détails - Style amélioré */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        title=""
        size="lg"
        className="max-w-3xl"
      >
        {selectedDepartement && (
          <div className="space-y-6">
            {/* En-tête du modal */}
            <div className="flex items-start justify-between border-b border-gray-200 pb-4 dark:border-gray-700">
              <div className="flex items-center space-x-4">
                <div className="rounded-lg bg-indigo-50 p-3 dark:bg-indigo-950/30">
                  <Building2 className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    {selectedDepartement.nom}
                  </h2>
                  {selectedDepartement.description && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {selectedDepartement.description}
                    </p>
                  )}
                </div>
              </div>
              <Badge className="bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300">
                {selectedDepartement._count?.membres || 0} membres
              </Badge>
            </div>

            {/* Informations principales */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800/50">
                  <h4 className="mb-3 text-sm font-medium text-gray-500 dark:text-gray-400">Responsable</h4>
                  {selectedDepartement.responsable ? (
                    <div className="flex items-center space-x-3">
                      <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center dark:bg-indigo-900/30">
                        <span className="text-lg font-semibold text-indigo-600 dark:text-indigo-400">
                          {selectedDepartement.responsable.prenom?.charAt(0)}
                          {selectedDepartement.responsable.nom?.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {selectedDepartement.responsable.prenom} {selectedDepartement.responsable.nom}
                        </p>
                        <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                          <Mail className="h-3.5 w-3.5" />
                          <span>{selectedDepartement.responsable.email}</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 dark:text-gray-400">Aucun responsable assigné</p>
                  )}
                </div>

                <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800/50">
                  <h4 className="mb-3 text-sm font-medium text-gray-500 dark:text-gray-400">Informations</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Date de création</span>
                      <span className="text-sm text-gray-900 dark:text-white">
                        {formatDate(selectedDepartement.createdAt)}
                      </span>
                    </div>
                    {selectedDepartement.updatedAt && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500 dark:text-gray-400">Dernière modification</span>
                        <span className="text-sm text-gray-900 dark:text-white">
                          {formatDate(selectedDepartement.updatedAt)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800/50">
                <h4 className="mb-3 text-sm font-medium text-gray-500 dark:text-gray-400">Statistiques</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center rounded-lg bg-white p-3 dark:bg-gray-800">
                    <Users className="mx-auto h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                    <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
                      {selectedDepartement._count?.membres || 0}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Membres</p>
                  </div>
                  <div className="text-center rounded-lg bg-white p-3 dark:bg-gray-800">
                    <FileText className="mx-auto h-6 w-6 text-purple-600 dark:text-purple-400" />
                    <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
                      {selectedDepartement._count?.rapports || 0}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Rapports</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Liste des membres */}
            {selectedDepartement.membres && selectedDepartement.membres.length > 0 && (
              <div className="border-t border-gray-200 pt-4 dark:border-gray-700">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-900 dark:text-white">Membres du département</h4>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {selectedDepartement.membres.length} membre{selectedDepartement.membres.length > 1 ? 's' : ''}
                  </span>
                </div>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {selectedDepartement.membres.slice(0, 10).map((membre: any) => (
                    <div 
                      key={membre.id} 
                      className="flex items-center justify-between rounded-lg bg-gray-50 p-3 hover:bg-gray-100 transition-colors dark:bg-gray-800/50 dark:hover:bg-gray-700/50"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center dark:bg-gray-700">
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                            {membre.prenom?.charAt(0)}{membre.nom?.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {membre.prenom} {membre.nom}
                          </p>
                          {membre.email && (
                            <p className="text-xs text-gray-500 dark:text-gray-400">{membre.email}</p>
                          )}
                        </div>
                      </div>
                      <Badge variant={membre.statut === 'actif' ? 'success' : 'secondary'} className="text-xs">
                        {membre.statut === 'actif' ? 'Actif' : 'Inactif'}
                      </Badge>
                    </div>
                  ))}
                  {selectedDepartement.membres.length > 10 && (
                    <p className="text-center text-sm text-gray-500 dark:text-gray-400 py-2">
                      + {selectedDepartement.membres.length - 10} autres membres
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end space-x-3 border-t border-gray-200 pt-4 dark:border-gray-700">
              <Button 
                variant="outline" 
                onClick={() => setShowDetailModal(false)}
                className="border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700"
              >
                Fermer
              </Button>
              <Button 
                onClick={() => router.push(`/admin/departements/${selectedDepartement.id}/modifier`)}
                className="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600"
              >
                <Edit className="mr-2 h-4 w-4" />
                Modifier
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal de confirmation suppression - Style amélioré */}
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
              Êtes-vous sûr de vouloir supprimer ce département ? 
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