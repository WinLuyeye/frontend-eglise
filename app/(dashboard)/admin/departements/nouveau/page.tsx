'use client'

import { useRouter } from 'next/navigation'
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
      router.push('/admin/departements')
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
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Nouveau département
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Créez un nouveau département pour l'église
        </p>
      </div>

      <Card className="p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Nom du département"
            placeholder="Ex: Chorale, Jeunesse, Enfants..."
            error={errors.nom?.message}
            {...register('nom')}
          />

          <Textarea
            label="Description"
            placeholder="Décrivez le rôle et les activités du département"
            rows={4}
            error={errors.description?.message}
            {...register('description')}
          />

          <Select
            label="Responsable"
            options={responsableOptions}
            error={errors.responsableId?.message}
            {...register('responsableId')}
          />

          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Annuler
            </Button>
            <Button type="submit" variant="primary" loading={isLoading}>
              Créer le département
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}