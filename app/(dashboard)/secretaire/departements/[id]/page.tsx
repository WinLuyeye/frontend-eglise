// app/(dashboard)/secretaire/departements/[id]/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Building2, Users, FileText, Calendar, User, Edit, Trash2 } from 'lucide-react'
import { Card, Button, Badge, Spinner } from '@/components/ui'
import { useDepartementStore } from '@/store/departementStore'
import { useMembers } from '@/hooks/useMembers'
import { formatDate } from '@/utils/formatters'

export default function SecretaireDepartementDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { selectedDepartement, fetchDepartementById, deleteDepartement, isLoading } = useDepartementStore()
  const { members, fetchMembers } = useMembers()
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  useEffect(() => {
    if (params.id) {
      fetchDepartementById(params.id as string)
      fetchMembers({ limit: 100 })
    }
  }, [params.id])

  const handleDelete = async () => {
    await deleteDepartement(params.id as string)
    router.push('/secretaire/departements')
  }

  // Membres du département
  const membresDepartement = members.filter(m => m.departementId === params.id)

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  if (!selectedDepartement) {
    return (
      <div className="flex h-96 flex-col items-center justify-center text-center">
        <Building2 className="h-16 w-16 text-gray-300 dark:text-gray-600" />
        <p className="mt-4 text-gray-500 dark:text-gray-400">Département non trouvé</p>
        <Button onClick={() => router.push('/secretaire/departements')} className="mt-4">
          Retour à la liste
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* En-tête - Dark mode */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="flex items-center text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour
        </button>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={() => router.push(`/secretaire/departements/${selectedDepartement.id}/modifier`)}
            className="dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            <Edit className="mr-2 h-4 w-4" />
            Modifier
          </Button>
          <Button variant="danger" onClick={() => setShowDeleteModal(true)}>
            <Trash2 className="mr-2 h-4 w-4" />
            Supprimer
          </Button>
        </div>
      </div>

      {/* Informations principales - Dark mode */}
      <Card className="p-6 dark:bg-gray-900 dark:border-gray-800">
        <div className="flex items-start space-x-4">
          <div className="h-20 w-20 rounded-full bg-primary-100 flex items-center justify-center dark:bg-primary-900/30">
            <Building2 className="h-10 w-10 text-primary-600 dark:text-primary-400" />
          </div>
          <div className="flex-1">
            <div className="flex items-center flex-wrap gap-2">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {selectedDepartement.nom}
              </h1>
            </div>
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {selectedDepartement.description && (
                <div className="flex items-start text-gray-600 dark:text-gray-300">
                  <div className="mr-3">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Description</p>
                    <p className="dark:text-white">{selectedDepartement.description}</p>
                  </div>
                </div>
              )}
              <div className="flex items-center text-gray-600 dark:text-gray-300">
                <Calendar className="mr-3 h-5 w-5 text-gray-400 dark:text-gray-500" />
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Date de création</p>
                  <p className="dark:text-white">{formatDate(selectedDepartement.createdAt)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Statistiques */}
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-lg bg-gray-50 p-4 text-center dark:bg-gray-800/50">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {selectedDepartement._count?.membres || 0}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Membres</p>
          </div>
          <div className="rounded-lg bg-gray-50 p-4 text-center dark:bg-gray-800/50">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {selectedDepartement._count?.rapports || 0}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Rapports</p>
          </div>
          <div className="rounded-lg bg-gray-50 p-4 text-center dark:bg-gray-800/50">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {selectedDepartement.responsable ? 1 : 0}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Responsable</p>
          </div>
        </div>
      </Card>

      {/* Responsable - Dark mode */}
      <Card className="p-6 dark:bg-gray-900 dark:border-gray-800">
        <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
          Responsable du département
        </h2>
        {selectedDepartement.responsable ? (
          <div className="flex items-center space-x-4 rounded-lg border p-4 dark:border-gray-700">
            <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center dark:bg-primary-900/30">
              <span className="text-lg font-semibold text-primary-600 dark:text-primary-400">
                {selectedDepartement.responsable.prenom?.charAt(0)}
                {selectedDepartement.responsable.nom?.charAt(0)}
              </span>
            </div>
            <div>
              <p className="font-medium text-gray-900 dark:text-white">
                {selectedDepartement.responsable.prenom} {selectedDepartement.responsable.nom}
              </p>
              {selectedDepartement.responsable.email && (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {selectedDepartement.responsable.email}
                </p>
              )}
              <p className="text-xs text-gray-400 dark:text-gray-500">
                Responsable depuis le {formatDate(selectedDepartement.createdAt)}
              </p>
            </div>
          </div>
        ) : (
          <p className="text-gray-500 dark:text-gray-400">Aucun responsable assigné</p>
        )}
      </Card>

      {/* Modal suppression - Dark mode */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/70">
          <div className="w-full max-w-md rounded-lg bg-white p-6 dark:bg-gray-900">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Confirmer la suppression</h3>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Êtes-vous sûr de vouloir supprimer le département &quot;{selectedDepartement.nom}&quot; ?
            </p>
            <p className="mt-1 text-sm text-red-500 dark:text-red-400">
              Cette action est irréversible.
            </p>
            <div className="mt-6 flex justify-end space-x-3">
              <Button variant="outline" onClick={() => setShowDeleteModal(false)} className="dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800">
                Annuler
              </Button>
              <Button variant="danger" onClick={handleDelete}>
                Supprimer
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}