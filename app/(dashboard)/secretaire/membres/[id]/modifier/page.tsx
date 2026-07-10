// components/forms/MembreForm.tsx
'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button, Input, Select, Textarea } from '@/components/ui'
import { useDepartementStore } from '@/store/departementStore'
import { useEffect } from 'react'

// Schéma de validation
const membreSchema = z.object({
  nom: z.string().min(2, 'Le nom est requis'),
  prenom: z.string().min(2, 'Le prénom est requis'),
  email: z.string().email('Email invalide').optional().or(z.literal('')),
  telephone: z.string().optional().or(z.literal('')),
  adresse: z.string().optional().or(z.literal('')),
  dateNaissance: z.string().optional().or(z.literal('')),
  statut: z.enum(['actif', 'inactif', 'en_attente']),
  departementId: z.string().optional().or(z.literal('')),
})

type MembreFormData = z.infer<typeof membreSchema>

interface MembreFormProps {
  initialData?: Partial<MembreFormData>
  isEditing?: boolean // Ajout de la propriété isEditing
  onSubmit: (data: MembreFormData) => Promise<void>
  isSubmitting?: boolean
}

export const MembreForm = ({
  initialData = {},
  isEditing = false,
  onSubmit,
  isSubmitting = false,
}: MembreFormProps) => {
  const { departements, fetchDepartements, isLoading: departementsLoading } = useDepartementStore()
  
  useEffect(() => {
    fetchDepartements()
  }, [])

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<MembreFormData>({
    resolver: zodResolver(membreSchema),
    defaultValues: {
      nom: initialData.nom || '',
      prenom: initialData.prenom || '',
      email: initialData.email || '',
      telephone: initialData.telephone || '',
      adresse: initialData.adresse || '',
      dateNaissance: initialData.dateNaissance || '',
      statut: (initialData.statut as 'actif' | 'inactif' | 'en_attente') || 'actif',
      departementId: initialData.departementId || '',
    },
  })

  useEffect(() => {
    if (initialData) {
      reset({
        nom: initialData.nom || '',
        prenom: initialData.prenom || '',
        email: initialData.email || '',
        telephone: initialData.telephone || '',
        adresse: initialData.adresse || '',
        dateNaissance: initialData.dateNaissance || '',
        statut: (initialData.statut as 'actif' | 'inactif' | 'en_attente') || 'actif',
        departementId: initialData.departementId || '',
      })
    }
  }, [initialData, reset])

  const statutOptions = [
    { value: 'actif', label: 'Actif' },
    { value: 'inactif', label: 'Inactif' },
    { value: 'en_attente', label: 'En attente' },
  ]

  const departementOptions = departements.map(d => ({
    value: d.id,
    label: d.nom,
  }))

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Nom */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Nom *
          </label>
          <Input
            {...register('nom')}
            placeholder="Nom"
            error={errors.nom?.message}
            className="dark:bg-gray-800 dark:border-gray-700 dark:text-white"
          />
        </div>

        {/* Prénom */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Prénom *
          </label>
          <Input
            {...register('prenom')}
            placeholder="Prénom"
            error={errors.prenom?.message}
            className="dark:bg-gray-800 dark:border-gray-700 dark:text-white"
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Email
          </label>
          <Input
            {...register('email')}
            type="email"
            placeholder="email@exemple.com"
            error={errors.email?.message}
            className="dark:bg-gray-800 dark:border-gray-700 dark:text-white"
          />
        </div>

        {/* Téléphone */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Téléphone
          </label>
          <Input
            {...register('telephone')}
            placeholder="+243 800 000 000"
            error={errors.telephone?.message}
            className="dark:bg-gray-800 dark:border-gray-700 dark:text-white"
          />
        </div>

        {/* Date de naissance */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Date de naissance
          </label>
          <Input
            {...register('dateNaissance')}
            type="date"
            error={errors.dateNaissance?.message}
            className="dark:bg-gray-800 dark:border-gray-700 dark:text-white"
          />
        </div>

        {/* Statut */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Statut *
          </label>
          <Select
            {...register('statut')}
            options={statutOptions}
            error={errors.statut?.message}
            className="dark:bg-gray-800 dark:border-gray-700 dark:text-white"
          />
        </div>

        {/* Département */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Département
          </label>
          <Select
            {...register('departementId')}
            options={departementOptions}
            placeholder="Sélectionner un département"
            isLoading={departementsLoading}
            error={errors.departementId?.message}
            className="dark:bg-gray-800 dark:border-gray-700 dark:text-white"
          />
        </div>

        {/* Adresse */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Adresse
          </label>
          <Textarea
            {...register('adresse')}
            placeholder="Adresse complète"
            rows={3}
            error={errors.adresse?.message}
            className="dark:bg-gray-800 dark:border-gray-700 dark:text-white"
          />
        </div>
      </div>

      {/* Boutons */}
      <div className="flex justify-end space-x-3 pt-4 border-t dark:border-gray-700">
        <Button
          type="button"
          variant="outline"
          onClick={() => window.history.back()}
          className="dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
        >
          Annuler
        </Button>
        <Button
          type="submit"
          isLoading={isSubmitting}
          className="dark:bg-primary-600 dark:hover:bg-primary-700"
        >
          {isEditing ? 'Modifier' : 'Créer'} le membre
        </Button>
      </div>
    </form>
  )
}