'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Calendar, Building2, User, FileText } from 'lucide-react'
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
        <FileText className="h-16 w-16 text-gray-300" />
        <p className="mt-4 text-gray-500">Rapport non trouvé</p>
        <Button onClick={() => router.push('/pasteur/rapports')} className="mt-4">
          Retour à la liste
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
      </div>

      {/* Contenu */}
      <Card className="overflow-hidden">
        <div className="bg-gradient-to-r from-primary-500 to-primary-600 p-6 text-white">
          <h1 className="text-2xl font-bold">{selectedRapport.titre}</h1>
          <p className="mt-2 text-primary-100">Rapport départemental</p>
        </div>

        <div className="grid grid-cols-1 gap-4 border-b p-4 sm:grid-cols-3">
          <div className="flex items-center space-x-2 text-gray-600">
            <Building2 className="h-4 w-4" />
            <span className="text-sm">Département:</span>
            <Badge variant="info" size="sm">{selectedRapport.departement?.nom || 'Non assigné'}</Badge>
          </div>
          <div className="flex items-center space-x-2 text-gray-600">
            <Calendar className="h-4 w-4" />
            <span className="text-sm">Période:</span>
            <span className="text-sm font-medium">{formatDate(selectedRapport.periode)}</span>
          </div>
          <div className="flex items-center space-x-2 text-gray-600">
            <User className="h-4 w-4" />
            <span className="text-sm">Créé par:</span>
            <span className="text-sm font-medium">{selectedRapport.createur?.email?.split('@')[0] || 'Administrateur'}</span>
          </div>
        </div>

        <div className="p-6">
          <h3 className="mb-3 flex items-center text-lg font-semibold">
            <FileText className="mr-2 h-5 w-5" />
            Contenu du rapport
          </h3>
          <div className="prose max-w-none rounded-lg bg-gray-50 p-4">
            <p className="whitespace-pre-wrap text-gray-700">
              {selectedRapport.contenu || 'Aucun contenu'}
            </p>
          </div>
        </div>

        <div className="border-t bg-gray-50 p-4 text-sm text-gray-500">
          <p>Créé le: {formatDate(selectedRapport.createdAt)}</p>
        </div>
      </Card>
    </div>
  )
}