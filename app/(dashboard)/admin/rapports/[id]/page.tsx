'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Edit, Trash2, Calendar, Building2, User, FileText } from 'lucide-react'
import { Card, Button, Badge, Spinner } from '@/components/ui'
import { useRapportStore } from '@/store/rapportStore'
import { formatDate, formatDateTime } from '@/utils/formatters'

export default function AdminRapportDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { selectedRapport, fetchRapportById, deleteRapport, isLoading } = useRapportStore()
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  useEffect(() => {
    if (params.id) {
      fetchRapportById(params.id as string)
    }
  }, [params.id])

  const handleDelete = async () => {
    await deleteRapport(params.id as string)
    router.push('/admin/rapports')
  }

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  if (!selectedRapport) {
    return (
      <div className="flex h-96 flex-col items-center justify-center text-center">
        <FileText className="h-16 w-16 text-gray-300" />
        <p className="mt-4 text-gray-500">Rapport non trouvé</p>
        <Button onClick={() => router.push('/admin/rapports')} className="mt-4">
          Retour à la liste
        </Button>
      </div>
    )
  }

  // Récupérer le nom du créateur
  const createurNom = (selectedRapport as any).createur?.email 
    ? (selectedRapport as any).createur.email.split('@')[0]
    : (selectedRapport as any).createdBy || 'Administrateur'

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
            onClick={() => router.push(`/admin/rapports/${selectedRapport.id}/modifier`)}
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

      {/* Contenu du rapport */}
      <Card className="p-6">
        <div className="space-y-6">
          {/* Titre */}
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{selectedRapport.titre}</h1>
            <div className="mt-2 flex flex-wrap gap-3">
              <Badge variant="info">
                <Building2 className="mr-1 h-3 w-3" />
                {selectedRapport.departement?.nom || 'Non assigné'}
              </Badge>
              <Badge variant="default">
                <Calendar className="mr-1 h-3 w-3" />
                Période: {formatDate(selectedRapport.periode)}
              </Badge>
              <Badge variant="default">
                <User className="mr-1 h-3 w-3" />
                Créé par: {createurNom}
              </Badge>
            </div>
          </div>

          {/* Contenu */}
          <div className="border-t pt-4">
            <h3 className="mb-2 font-semibold text-gray-900">Contenu du rapport</h3>
            <div className="prose max-w-none">
              <p className="whitespace-pre-wrap text-gray-700">
                {selectedRapport.contenu || 'Aucun contenu'}
              </p>
            </div>
          </div>

          {/* Informations supplémentaires */}
          <div className="border-t pt-4 text-sm text-gray-500">
            <p>Créé le: {formatDateTime(selectedRapport.createdAt)}</p>
            {/* Utilisation correcte de updatedAt */}
            {(selectedRapport as any).updatedAt && (selectedRapport as any).updatedAt !== selectedRapport.createdAt && (
              <p>Dernière modification: {formatDateTime((selectedRapport as any).updatedAt)}</p>
            )}
          </div>
        </div>
      </Card>

      {/* Modal suppression */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-lg bg-white p-6">
            <h3 className="text-lg font-semibold">Confirmer la suppression</h3>
            <p className="mt-2 text-gray-600">
              Êtes-vous sûr de vouloir supprimer ce rapport ?
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