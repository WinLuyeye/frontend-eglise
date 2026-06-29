// app/(dashboard)/secretaire/membres/[id]/modifier/page.tsx
'use client'

import { useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { MembreForm } from '@/components/forms'
import { Card, Spinner, Button } from '@/components/ui'
import { useMembers } from '@/hooks/useMembers'

export default function ModifierMembrePage() {
  const params = useParams()
  const router = useRouter()
  const { selectedMember, fetchMemberById, updateMember, isLoading } = useMembers()

  useEffect(() => {
    if (params.id) {
      fetchMemberById(params.id as string)
    }
  }, [params.id])

  const handleSubmit = async (data: any) => {
    const success = await updateMember(params.id as string, data)
    if (success) {
      router.push(`/secretaire/membres/${params.id}`)
    }
  }

  if (isLoading && !selectedMember) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  if (!selectedMember) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <p className="text-gray-500 dark:text-gray-400">Membre non trouvé</p>
        <Button 
          variant="outline" 
          onClick={() => router.back()} 
          className="mt-4 dark:border-gray-700 dark:text-gray-300"
        >
          Retour
        </Button>
      </div>
    )
  }

  const initialData = {
    nom: selectedMember.nom,
    prenom: selectedMember.prenom,
    email: selectedMember.email || '',
    telephone: selectedMember.telephone || '',
    adresse: selectedMember.adresse || '',
    dateNaissance: selectedMember.dateNaissance || '',
    statut: selectedMember.statut || 'actif',
    departementId: selectedMember.departementId || '',
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6 flex items-center space-x-4">
        <button
          onClick={() => router.push(`/secretaire/membres/${params.id}`)}
          className="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-gray-600 dark:text-gray-400" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Modifier le membre</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {selectedMember.prenom} {selectedMember.nom}
          </p>
        </div>
      </div>

      <Card className="p-6 dark:bg-gray-900 dark:border-gray-800">
        <MembreForm
          initialData={initialData}
          isEditing={true}
          onSubmit={handleSubmit}
          isSubmitting={isLoading}
        />
      </Card>
    </div>
  )
}