// app/(dashboard)/admin/rapports/nouveau/page.tsx
'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { Card, Button } from '@/components/ui'
import { RapportForm } from '@/components/forms'
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
      <div className="mb-6 flex items-center space-x-4">
        <button
          onClick={() => router.push('/admin/rapports')}
          className="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-gray-600 dark:text-gray-400" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Nouveau rapport
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Créez un rapport pour un département
          </p>
        </div>
      </div>

      <Card className="p-6 dark:bg-gray-900 dark:border-gray-800">
        <RapportForm onSubmit={handleSubmit} isSubmitting={isLoading} />
      </Card>
    </div>
  )
}