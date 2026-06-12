'use client'

import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui'
import { UtilisateurForm } from '@/components/forms'
import { utilisateursAPI } from '@/lib/api'

export default function NouvelUtilisateurPage() {
  const router = useRouter()

  const handleSubmit = async (data: any) => {
    try {
      await utilisateursAPI.create(data)
      router.push('/secretaire/utilisateurs')
    } catch (error) {
      console.error('Erreur:', error)
      alert('Erreur lors de la création')
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Nouvel utilisateur</h1>
        <p className="mt-1 text-sm text-gray-500">Créez un compte utilisateur</p>
      </div>

      <Card className="p-6">
        <UtilisateurForm onSubmit={handleSubmit} />
      </Card>
    </div>
  )
}