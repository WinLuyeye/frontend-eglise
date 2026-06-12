'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, Spinner } from '@/components/ui'
import { UtilisateurForm } from '@/components/forms'
import { utilisateursAPI } from '@/lib/api'

export default function ModifierUtilisateurPage() {
  const params = useParams()
  const router = useRouter()
  const [utilisateur, setUtilisateur] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchUtilisateur = async () => {
      try {
        const response = await utilisateursAPI.getById(params.id as string)
        setUtilisateur(response.data.data)
      } catch (error) {
        console.error('Erreur:', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchUtilisateur()
  }, [params.id])

  const handleSubmit = async (data: any) => {
    try {
      await utilisateursAPI.update(params.id as string, data)
      router.push('/admin/utilisateurs')
    } catch (error) {
      console.error('Erreur:', error)
      alert('Erreur lors de la modification')
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
      <div className="text-center">
        <p>Utilisateur non trouvé</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Modifier l&lsquo;utilisateur
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {utilisateur.email}
        </p>
      </div>

      <Card className="p-6">
        <UtilisateurForm
          initialData={utilisateur}
          isEditing
          onSubmit={handleSubmit}
        />
      </Card>
    </div>
  )
}