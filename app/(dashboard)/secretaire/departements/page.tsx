// app/(dashboard)/secretaire/departements/page.tsx
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
          <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center dark:bg-primary-900/30">
            <Building2 className="h-5 w-5 text-primary-600 dark:text-primary-400" />
          </div>
          <div>
            <p className="font-medium text-gray-900 dark:text-white">{d.nom}</p>
            {d.description && <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">{d.description}</p>}
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
              <p className="font-medium text-gray-900 dark:text-white">{d.responsable.prenom} {d.responsable.nom}</p>
              {d.responsable.email && <p className="text-xs text-gray-500 dark:text-gray-400">{d.responsable.email}</p>}
            </>
          ) : (
            <span className="text-gray-400 dark:text-gray-500">Non assigné</span>
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
            <p className="text-sm font-semibold text-gray-900 dark:text-white">{d._count?.membres || 0}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Membres</p>
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-gray-900 dark:text-white">{d._count?.rapports || 0}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Rapports</p>
          </div>
        </div>
      ),
    },
    {
      key: 'createdAt',
      header: 'Créé le',
      cell: (d: any) => (
        <span className="text-gray-700 dark:text-gray-300">
          {formatDate(d.createdAt)}
        </span>
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
            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
            title="Voir détails"
          >
            <Eye className="h-4 w-4" />
          </button>
          <button
            onClick={() => router.push(`/secretaire/departements/${d.id}/modifier`)}
            className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 transition-colors"
            title="Modifier"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={() => setShowDeleteModal(d.id)}
            className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition-colors"
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
      {/* En-tête - Dark mode */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Départements</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Gérez les départements de l'église</p>
        </div>
        <Button onClick={() => router.push('/secretaire/departements/nouveau')}>
          <Plus className="mr-2 h-4 w-4" />
          Nouveau département
        </Button>
      </div>

      {/* Recherche - Dark mode */}
      <Card className="p-4 dark:bg-gray-900 dark:border-gray-800">
        <Input
          placeholder="Rechercher un département..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          icon={<Building2 className="h-4 w-4" />}
          className="dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:placeholder-gray-400"
        />
      </Card>

      {/* Tableau */}
      <Table
        columns={columns}
        data={filteredDepartements}
        isLoading={isLoading}
        emptyMessage="Aucun département trouvé"
      />

      {/* Modal détails - Dark mode */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => {
          setShowDetailModal(false)
          setSelectedDepartement(null)
        }}
        title={selectedDepartement?.nom}
        size="lg"
        className="dark:bg-gray-900 dark:border-gray-800"
      >
        {selectedDepartement && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-500 dark:text-gray-400">Nom</label>
                <p className="font-medium text-gray-900 dark:text-white">{selectedDepartement.nom}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500 dark:text-gray-400">Date de création</label>
                <p className="text-gray-700 dark:text-gray-300">{formatDate(selectedDepartement.createdAt)}</p>
              </div>
              <div className="col-span-2">
                <label className="text-sm text-gray-500 dark:text-gray-400">Description</label>
                <p className="text-gray-700 dark:text-gray-300">{selectedDepartement.description || 'Aucune description'}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500 dark:text-gray-400">Responsable</label>
                {selectedDepartement.responsable ? (
                  <p className="font-medium text-gray-900 dark:text-white">
                    {selectedDepartement.responsable.prenom} {selectedDepartement.responsable.nom}
                  </p>
                ) : (
                  <p className="text-gray-400 dark:text-gray-500">Non assigné</p>
                )}
              </div>
              <div>
                <label className="text-sm text-gray-500 dark:text-gray-400">Statistiques</label>
                <div className="flex space-x-4 mt-1">
                  <div className="flex items-center space-x-1 text-gray-600 dark:text-gray-300">
                    <Users className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                    <span>{selectedDepartement._count?.membres || 0} membres</span>
                  </div>
                  <div className="flex items-center space-x-1 text-gray-600 dark:text-gray-300">
                    <FileText className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                    <span>{selectedDepartement._count?.rapports || 0} rapports</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal suppression - Dark mode */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/70">
          <div className="w-full max-w-md rounded-lg bg-white p-6 dark:bg-gray-900">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Confirmer la suppression</h3>
            <p className="mt-2 text-gray-600 dark:text-gray-400">Cette action est irréversible.</p>
            <div className="mt-6 flex justify-end space-x-3">
              <Button variant="outline" onClick={() => setShowDeleteModal(null)} className="dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800">
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