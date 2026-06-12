'use client'

import { useRouter } from 'next/navigation'
import { MembreForm } from '@/components/forms'
import { Card } from '@/components/ui'
import { useMembers } from '@/hooks/useMembers'
import { MembreFormData } from '@/types'

export default function NouveauMembrePage() {
  const router = useRouter()
  const { createMember, isLoading } = useMembers()

  const handleSubmit = async (data: MembreFormData) => {
    const success = await createMember(data)
    if (success) {
      router.push('/admin/membres')
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Nouveau membre
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Ajoutez un nouveau membre à votre église
        </p>
      </div>

      <Card className="p-6">
        <MembreForm onSubmit={handleSubmit} isSubmitting={isLoading} />
      </Card>
    </div>
  )
}