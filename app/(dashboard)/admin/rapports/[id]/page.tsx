// app/(dashboard)/admin/rapports/[id]/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { 
  ArrowLeft, 
  Calendar, 
  Building2, 
  User, 
  FileText, 
  Edit, 
  Trash2,
  Download
} from 'lucide-react'
import { Card, Button, Badge, Spinner } from '@/components/ui'
import { useRapportStore } from '@/store/rapportStore'
import { formatDate } from '@/utils/formatters'

export default function RapportDetailPage() {
  const router = useRouter()
  const params = useParams()
  const id = params?.id as string
  
  const { selectedRapport, fetchRapportById, deleteRapport, isLoading } = useRapportStore()
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  useEffect(() => {
    if (id) {
      fetchRapportById(id)
    }
  }, [id])

  const handleDelete = async () => {
    await deleteRapport(id)
    setShowDeleteModal(false)
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
      <div className="flex flex-col items-center justify-center h-96">
        <FileText className="h-12 w-12 text-gray-400 dark:text-gray-600" />
        <p className="mt-4 text-gray-500 dark:text-gray-400">Rapport non trouvé</p>
        <Button 
          variant="outline" 
          className="mt-4 dark:border-gray-700 dark:text-gray-300"
          onClick={() => router.push('/admin/rapports')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour aux rapports
        </Button>
      </div>
    )
  }

  const r = selectedRapport

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => router.push('/admin/rapports')}
            className="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {r.titre}
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Référence: {r.id.substring(0, 8)}...
            </p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" className="dark:border-gray-700 dark:text-gray-300">
            <Download className="mr-2 h-4 w-4" />
            Exporter PDF
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push(`/admin/rapports/${id}/modifier`)}
            className="dark:border-gray-700 dark:text-gray-300"
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
      <Card className="p-6 dark:bg-gray-900 dark:border-gray-800">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Département */}
          <div className="flex items-start space-x-3">
            <div className="rounded-full bg-purple-100 p-2 dark:bg-purple-900/30">
              <Building2 className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Département</p>
              <p className="font-medium text-gray-900 dark:text-white">
                {r.departement?.nom || '-'}
              </p>
            </div>
          </div>

          {/* Période */}
          <div className="flex items-start space-x-3">
            <div className="rounded-full bg-blue-100 p-2 dark:bg-blue-900/30">
              <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Période</p>
              <p className="font-medium text-gray-900 dark:text-white">
                {formatDate(r.periode)}
              </p>
            </div>
          </div>

          {/* Créé par */}
          <div className="flex items-start space-x-3">
            <div className="rounded-full bg-green-100 p-2 dark:bg-green-900/30">
              <User className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Créé par</p>
              <p className="font-medium text-gray-900 dark:text-white">
                {r.createur?.email || 'Système'}
              </p>
            </div>
          </div>

          {/* Date de création */}
          <div className="flex items-start space-x-3">
            <div className="rounded-full bg-gray-100 p-2 dark:bg-gray-800">
              <Calendar className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Date de création</p>
              <p className="font-medium text-gray-900 dark:text-white">
                {formatDate(r.createdAt)}
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Contenu */}
      <Card className="p-6 dark:bg-gray-900 dark:border-gray-800">
        <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
          Contenu du rapport
        </h2>
        <div className="prose prose-sm max-w-none dark:prose-invert">
          {r.contenu.split('\n').map((paragraph: string, index: number) => (
            <p key={index} className="text-gray-700 dark:text-gray-300">
              {paragraph}
            </p>
          ))}
        </div>
      </Card>

      {/* Actions rapides */}
      <Card className="p-4 dark:bg-gray-900 dark:border-gray-800">
        <div className="flex flex-wrap gap-3">
          <Button
            variant="outline"
            onClick={() => router.push(`/admin/rapports/${id}/modifier`)}
            className="dark:border-gray-700 dark:text-gray-300"
          >
            <Edit className="mr-2 h-4 w-4" />
            Modifier
          </Button>
          <Button variant="danger" onClick={() => setShowDeleteModal(true)}>
            <Trash2 className="mr-2 h-4 w-4" />
            Supprimer
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push('/admin/rapports')}
            className="dark:border-gray-700 dark:text-gray-300"
          >
            Retour à la liste
          </Button>
        </div>
      </Card>

      {/* Modal suppression */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/70">
          <div className="w-full max-w-md rounded-lg bg-white p-6 dark:bg-gray-900">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Confirmer la suppression
            </h3>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Êtes-vous sûr de vouloir supprimer ce rapport ? Cette action est irréversible.
            </p>
            <div className="mt-6 flex justify-end space-x-3">
              <Button 
                variant="outline" 
                onClick={() => setShowDeleteModal(false)}
                className="dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
              >
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