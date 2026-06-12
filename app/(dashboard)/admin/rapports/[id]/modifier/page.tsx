'use client'

import { useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { RapportForm } from '@/components/forms'
import { Card, Spinner } from '@/components/ui'
import { useRapportStore } from '@/store/rapportStore'

export default function ModifierRapportPage() {
  const params = useParams()
  const router = useRouter()
  const { selectedRapport, fetchRapportById, updateRapport, isLoading } = useRapportStore()

  useEffect(() => {
    if (params.id) {
      fetchRapportById(params.id as string)
    }
  }, [params.id])

  const handleSubmit = async (data: any) => {
    const success = await updateRapport(params.id as string, data)
    if (success) {
      router.push('/admin/rapports')
    }
  }

  if (isLoading && !selectedRapport) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  if (!selectedRapport) {
    return (
      <div className="text-center">
        <p className="text-gray-500">Rapport non trouvé</p>
        <button onClick={() => router.back()} className="mt-4 text-primary-600">
          Retour
        </button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Modifier le rapport
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {selectedRapport.titre}
        </p>
      </div>

      <Card className="p-6">
        <RapportForm
          initialData={selectedRapport}
          onSubmit={handleSubmit}
          isSubmitting={isLoading}
        />
      </Card>
    </div>
  )
}