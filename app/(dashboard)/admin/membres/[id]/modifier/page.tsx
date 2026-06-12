'use client'

import { useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { MembreForm } from '@/components/forms'
import { Card, Spinner } from '@/components/ui'
import { useMembers } from '@/hooks/useMembers'
import { MembreFormData } from '@/types'

export default function ModifierMembrePage() {
  const params = useParams()
  const router = useRouter()
  const { selectedMember, fetchMemberById, updateMember, isLoading } = useMembers()

  useEffect(() => {
    if (params.id) {
      fetchMemberById(params.id as string)
    }
  }, [params.id])

  const handleSubmit = async (data: MembreFormData) => {
    const success = await updateMember(params.id as string, data)
    if (success) {
      router.push(`/admin/membres/${params.id}`)
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  if (!selectedMember) {
    return (
      <div className="text-center">
        <p className="text-gray-500">Membre non trouvé</p>
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
          Modifier le membre
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {selectedMember.prenom} {selectedMember.nom}
        </p>
      </div>

      <Card className="p-6">
        <MembreForm
          initialData={selectedMember}
          onSubmit={handleSubmit}
          isSubmitting={isLoading}
        />
      </Card>
    </div>
  )
}