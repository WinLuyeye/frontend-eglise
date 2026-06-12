'use client'

import { useRouter } from 'next/navigation'
import { RapportForm } from '@/components/forms'
import { Card } from '@/components/ui'
import { useRapportStore } from '@/store/rapportStore'

export default function NouveauRapportPage() {
  const router = useRouter()
  const { createRapport, isLoading } = useRapportStore()

  const handleSubmit = async (data: any) => {
    const success = await createRapport(data)
    if (success) {
      router.push('/admin/rapports')
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Nouveau rapport
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Créez un rapport pour un département
        </p>
      </div>

      <Card className="p-6">
        <RapportForm onSubmit={handleSubmit} isSubmitting={isLoading} />
      </Card>
    </div>
  )
}