'use client'

import { useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Card, Input, Textarea, Select, Button, Spinner } from '@/components/ui'
import { useDepartementStore } from '@/store/departementStore'
import { useMembers } from '@/hooks/useMembers'

const departementSchema = z.object({
  nom: z.string().min(2, 'Le nom doit contenir au moins 2 caractères').max(100, 'Nom trop long'),
  description: z.string().optional(),
  responsableId: z.string().optional(),
})

type DepartementFormData = z.infer<typeof departementSchema>

export default function ModifierDepartementPage() {
  const params = useParams()
  const router = useRouter()
  const { selectedDepartement, fetchDepartementById, updateDepartement, isLoading } = useDepartementStore()
  const { members, fetchMembers } = useMembers()

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<DepartementFormData>({
    resolver: zodResolver(departementSchema),
  })

  useEffect(() => {
    fetchMembers({ limit: 100 })
    if (params.id) {
      fetchDepartementById(params.id as string)
    }
  }, [params.id])

  useEffect(() => {
    if (selectedDepartement) {
      reset({
        nom: selectedDepartement.nom,
        description: selectedDepartement.description || '',
        responsableId: selectedDepartement.responsableId || '',
      })
    }
  }, [selectedDepartement, reset])

  const onSubmit = async (data: DepartementFormData) => {
    const success = await updateDepartement(params.id as string, data)
    if (success) {
      router.push('/secretaire/departements')
    }
  }

  if (isLoading && !selectedDepartement) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  if (!selectedDepartement) {
    return (
      <div className="text-center">
        <p className="text-gray-500">Département non trouvé</p>
        <Button onClick={() => router.back()} className="mt-4">
          Retour
        </Button>
      </div>
    )
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
        <h1 className="text-2xl font-bold text-gray-900">Modifier le département</h1>
        <p className="mt-1 text-sm text-gray-500">{selectedDepartement.nom}</p>
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
            <Button type="submit" loading={isLoading}>
              Enregistrer
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}