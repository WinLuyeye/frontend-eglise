// app/(dashboard)/secretaire/departements/nouveau/page.tsx
'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Card, Input, Textarea, Select, Button } from '@/components/ui'
import { useDepartementStore } from '@/store/departementStore'
import { useMembers } from '@/hooks/useMembers'
import { useEffect } from 'react'

const departementSchema = z.object({
  nom: z.string().min(2, 'Le nom doit contenir au moins 2 caractères').max(100, 'Nom trop long'),
  description: z.string().optional(),
  responsableId: z.string().optional(),
})

type DepartementFormData = z.infer<typeof departementSchema>

export default function NouveauDepartementPage() {
  const router = useRouter()
  const { createDepartement, isLoading } = useDepartementStore()
  const { members, fetchMembers } = useMembers()

  useEffect(() => {
    fetchMembers({ limit: 100 })
  }, [])

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<DepartementFormData>({
    resolver: zodResolver(departementSchema),
    defaultValues: {
      nom: '',
      description: '',
      responsableId: '',
    },
  })

  const onSubmit = async (data: DepartementFormData) => {
    const success = await createDepartement(data)
    if (success) {
      router.push('/secretaire/departements')
    }
  }

  const responsableOptions = [
    { value: '', label: 'Aucun responsable' },
    ...members.map(m => ({
      value: m.id,
      label: `${m.prenom} ${m.nom}${m.email ? ` (${m.email})` : ''}`,
    })),
  ]

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6 flex items-center space-x-4">
        <button
          onClick={() => router.push('/secretaire/departements')}
          className="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-gray-600 dark:text-gray-400" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Nouveau département</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Créez un nouveau département pour l'église</p>
        </div>
      </div>

      <Card className="p-6 dark:bg-gray-900 dark:border-gray-800">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Nom du département"
            placeholder="Ex: Chorale, Jeunesse, Enfants..."
            error={errors.nom?.message}
            {...register('nom')}
            className="dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:placeholder-gray-400"
          />
          <Textarea
            label="Description"
            placeholder="Décrivez le rôle et les activités du département"
            rows={4}
            error={errors.description?.message}
            {...register('description')}
            className="dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:placeholder-gray-400"
          />
          <Select
            label="Responsable"
            options={responsableOptions}
            error={errors.responsableId?.message}
            {...register('responsableId')}
            className="dark:bg-gray-800 dark:border-gray-700 dark:text-white"
          />
          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={() => router.back()} className="dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800">
              Annuler
            </Button>
            <Button type="submit" loading={isLoading}>
              Créer le département
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}