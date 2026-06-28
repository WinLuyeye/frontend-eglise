// app/(dashboard)/admin/utilisateurs/[id]/modifier/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { Card, Button, Spinner } from '@/components/ui'
import { UtilisateurForm } from '@/components/forms'
import { utilisateursAPI } from '@/lib/api'

export default function ModifierUtilisateurPage() {
  const router = useRouter()
  const params = useParams()
  const id = params?.id as string
  
  const [utilisateur, setUtilisateur] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (id) {
      fetchUtilisateur()
    }
  }, [id])

  const fetchUtilisateur = async () => {
    setIsLoading(true)
    try {
      const response = await utilisateursAPI.getById(id)
      setUtilisateur(response.data.data)
    } catch (error) {
      console.error('Erreur:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (data: any) => {
    try {
      setIsSubmitting(true)
      await utilisateursAPI.update(id, data)
      router.push(`/admin/utilisateurs/${id}`)
    } catch (error: any) {
      alert(error.response?.data?.message || 'Erreur lors de la modification')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  if (!utilisateur) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <p className="text-gray-500 dark:text-gray-400">Utilisateur non trouvé</p>
        <Button 
          variant="outline" 
          className="mt-4 dark:border-gray-700 dark:text-gray-300"
          onClick={() => router.push('/admin/utilisateurs')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour à la liste
        </Button>
      </div>
    )
  }

  const initialData = {
    email: utilisateur.email,
    role: utilisateur.role,
    actif: utilisateur.actif,
    membreId: utilisateur.membreId || '',
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6 flex items-center space-x-4">
        <button
          onClick={() => router.push(`/admin/utilisateurs/${id}`)}
          className="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-gray-600 dark:text-gray-400" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Modifier l'utilisateur
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {utilisateur.email}
          </p>
        </div>
      </div>

      <Card className="p-6 dark:bg-gray-900 dark:border-gray-800">
        <UtilisateurForm 
          initialData={initialData}
          isEditing={true}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
        />
      </Card>
    </div>
  )
}