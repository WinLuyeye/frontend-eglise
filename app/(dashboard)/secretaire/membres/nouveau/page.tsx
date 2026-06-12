'use client'

import { useRouter } from 'next/navigation'
import { MembreForm } from '@/components/forms'
import { Card } from '@/components/ui'
import { useMembers } from '@/hooks/useMembers'

export default function NouveauMembrePage() {
  const router = useRouter()
  const { createMember, isLoading } = useMembers()

  const handleSubmit = async (data: any) => {
    const success = await createMember(data)
    if (success) {
      router.push('/secretaire/membres')
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Nouveau membre</h1>
        <p className="mt-1 text-sm text-gray-500">Ajoutez un nouveau membre à l'église</p>
      </div>

      <Card className="p-6">
        <MembreForm onSubmit={handleSubmit} isSubmitting={isLoading} />
      </Card>
    </div>
  )
}