// app/(dashboard)/admin/utilisateurs/nouveau/page.tsx
'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { Card, Button } from '@/components/ui'
import { UtilisateurForm } from '@/components/forms'
import { utilisateursAPI } from '@/lib/api'

export default function NouvelUtilisateurPage() {
  const router = useRouter()

  const handleSubmit = async (data: any) => {
    try {
      await utilisateursAPI.create(data)
      router.push('/admin/utilisateurs')
    } catch (error: any) {
      alert(error.response?.data?.message || 'Erreur lors de la création')
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6 flex items-center space-x-4">
        <button
          onClick={() => router.push('/admin/utilisateurs')}
          className="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-gray-600 dark:text-gray-400" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Nouvel utilisateur
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Créez un compte utilisateur
          </p>
        </div>
      </div>

      <Card className="p-6 dark:bg-gray-900 dark:border-gray-800">
        <UtilisateurForm 
          onSubmit={handleSubmit}
          isSubmitting={false}
        />
      </Card>
    </div>
  )
}