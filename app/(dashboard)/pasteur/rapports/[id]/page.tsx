// app/(dashboard)/pasteur/rapports/[id]/page.tsx
'use client'

import { useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Calendar, Building2, User, FileText, Download } from 'lucide-react'
import { Card, Button, Badge, Spinner } from '@/components/ui'
import { useRapportStore } from '@/store/rapportStore'
import { formatDate } from '@/utils/formatters'

export default function PasteurRapportDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { selectedRapport, fetchRapportById, isLoading } = useRapportStore()

  useEffect(() => {
    if (params.id) {
      fetchRapportById(params.id as string)
    }
  }, [params.id])

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
        <FileText className="h-16 w-16 text-gray-300 dark:text-gray-600" />
        <p className="mt-4 text-gray-500 dark:text-gray-400">Rapport non trouvé</p>
        <Button onClick={() => router.push('/pasteur/rapports')} className="mt-4">
          Retour à la liste
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
            onClick={() => router.back()}
            className="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{r.titre}</h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Référence: {r.id.substring(0, 8)}...
            </p>
          </div>
        </div>
        <Button variant="outline" className="dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800">
          <Download className="mr-2 h-4 w-4" />
          Exporter PDF
        </Button>
      </div>

      {/* Badges d'information */}
      <div className="flex flex-wrap gap-3">
        <Badge variant="info" size="lg" className="text-sm">
          <Building2 className="mr-2 h-4 w-4" />
          {r.departement?.nom || 'Département inconnu'}
        </Badge>
        <Badge variant="purple" size="lg" className="text-sm">
          <Calendar className="mr-2 h-4 w-4" />
          {formatDate(r.periode)}
        </Badge>
        {r.createur && (
          <Badge variant="secondary" size="lg" className="text-sm">
            <User className="mr-2 h-4 w-4" />
            {r.createur.email}
          </Badge>
        )}
      </div>

      {/* Informations détaillées - Dark mode */}
      <Card className="p-6 dark:bg-gray-900 dark:border-gray-800">
        <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
          Informations détaillées
        </h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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

      {/* Contenu du rapport - Dark mode */}
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

      {/* Actions rapides - Dark mode */}
      <Card className="p-4 dark:bg-gray-900 dark:border-gray-800">
        <div className="flex flex-wrap gap-3">
          <Button
            variant="outline"
            onClick={() => router.push('/pasteur/rapports')}
            className="dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            Retour à la liste
          </Button>
          <Button variant="outline" className="dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800">
            <Download className="mr-2 h-4 w-4" />
            Exporter PDF
          </Button>
        </div>
      </Card>
    </div>
  )
}