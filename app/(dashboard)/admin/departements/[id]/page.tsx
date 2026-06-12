'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Building2, Users, FileText, Edit, Trash2, ArrowLeft, Mail, Phone } from 'lucide-react'
import { Card, Button, Badge, Spinner } from '@/components/ui'
import { useDepartementStore } from '@/store/departementStore'
import { formatDate } from '@/utils/formatters'

export default function DepartementDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { selectedDepartement, fetchDepartementById, isLoading } = useDepartementStore()
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  useEffect(() => {
    if (params.id) {
      fetchDepartementById(params.id as string)
    }
  }, [params.id])

  const handleDelete = async () => {
    // La suppression sera gérée par le store
    setShowDeleteModal(false)
  }

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  if (!selectedDepartement) {
    return (
      <div className="text-center">
        <p className="text-gray-500">Département non trouvé</p>
        <Button onClick={() => router.back()} className="mt-4">
          Retour
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour
        </button>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={() => router.push(`/admin/departements/${selectedDepartement.id}/modifier`)}
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

      {/* Informations principales */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 p-6">
          <div className="flex items-start space-x-4">
            <div className="h-16 w-16 rounded-full bg-primary-100 flex items-center justify-center">
              <Building2 className="h-8 w-8 text-primary-600" />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {selectedDepartement.nom}
              </h1>
              {selectedDepartement.description && (
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                  {selectedDepartement.description}
                </p>
              )}
              <p className="mt-2 text-sm text-gray-500">
                Créé le {formatDate(selectedDepartement.createdAt)}
              </p>
            </div>
          </div>
        </Card>

        {/* Statistiques */}
        <Card className="p-6">
          <h3 className="mb-4 font-semibold">Statistiques</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Membres</span>
              <span className="font-semibold text-lg">{selectedDepartement._count?.membres || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Rapports</span>
              <span className="font-semibold text-lg">{selectedDepartement._count?.rapports || 0}</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Responsable */}
      {selectedDepartement.responsable && (
        <Card className="p-6">
          <h3 className="mb-4 font-semibold">Responsable du département</h3>
          <div className="flex items-center space-x-4">
            <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center">
              <span className="text-lg font-semibold text-primary-600">
                {selectedDepartement.responsable.prenom?.charAt(0)}
                {selectedDepartement.responsable.nom?.charAt(0)}
              </span>
            </div>
            <div>
              <p className="font-medium text-lg">
                {selectedDepartement.responsable.prenom} {selectedDepartement.responsable.nom}
              </p>
              <div className="flex space-x-4 mt-1">
                {selectedDepartement.responsable.email && (
                  <div className="flex items-center text-sm text-gray-500">
                    <Mail className="mr-1 h-3 w-3" />
                    {selectedDepartement.responsable.email}
                  </div>
                )}
                {selectedDepartement.responsable.telephone && (
                  <div className="flex items-center text-sm text-gray-500">
                    <Phone className="mr-1 h-3 w-3" />
                    {selectedDepartement.responsable.telephone}
                  </div>
                )}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Modal suppression */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-lg bg-white p-6 dark:bg-gray-900">
            <h3 className="text-lg font-semibold">Confirmer la suppression</h3>
            <p className="mt-2 text-gray-600">
              Êtes-vous sûr de vouloir supprimer le département "{selectedDepartement.nom}" ?
              Cette action est irréversible.
            </p>
            <div className="mt-6 flex justify-end space-x-3">
              <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
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