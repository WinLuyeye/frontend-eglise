// components/forms/MembreForm.tsx (version améliorée avec isEditing)
'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { User, Mail, Phone, MapPin, Calendar, Building2 } from 'lucide-react'
import { Input, Select, Textarea, Button } from '@/components/ui'
import { useDepartementStore } from '@/store/departementStore'
import { MembreFormData } from '@/types'
import { formatDateForInput } from '@/utils/formatters'

// Schéma de validation Zod
const membreSchema = z.object({
  nom: z.string().min(2, 'Le nom doit contenir au moins 2 caractères').max(100, 'Nom trop long'),
  prenom: z.string().min(2, 'Le prénom doit contenir au moins 2 caractères').max(100, 'Prénom trop long'),
  email: z.string().email('Email invalide').optional().or(z.literal('')),
  telephone: z.string().optional(),
  adresse: z.string().optional(),
  dateNaissance: z.string().optional(),
  statut: z.enum(['actif', 'inactif', 'transfere']).default('actif'),
  departementId: z.string().optional(),
})

interface MembreFormProps {
  initialData?: MembreFormData
  isEditing?: boolean  // ✅ AJOUTÉ
  onSubmit: (data: MembreFormData) => Promise<void>
  isSubmitting?: boolean
}

export const MembreForm = ({ 
  initialData, 
  isEditing = false,  // ✅ AJOUTÉ avec valeur par défaut
  onSubmit, 
  isSubmitting = false 
}: MembreFormProps) => {
  const { departements, fetchDepartements } = useDepartementStore()
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<MembreFormData>({
    resolver: zodResolver(membreSchema),
    defaultValues: {
      nom: '',
      prenom: '',
      email: '',
      telephone: '',
      adresse: '',
      dateNaissance: '',
      statut: 'actif',
      departementId: '',
    },
  })

  useEffect(() => {
    fetchDepartements()
  }, [fetchDepartements])

  useEffect(() => {
    if (initialData) {
      reset({
        ...initialData,
        dateNaissance: initialData.dateNaissance ? formatDateForInput(initialData.dateNaissance) : '',
      })
    }
  }, [initialData, reset])

  const onSubmitForm = async (data: MembreFormData) => {
    try {
      setError(null)
      await onSubmit(data)
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue')
    }
  }

  const statutOptions = [
    { value: 'actif', label: 'Actif' },
    { value: 'inactif', label: 'Inactif' },
    { value: 'transfere', label: 'Transféré' },
  ]

  const departementOptions = [
    { value: '', label: 'Aucun département' },
    ...departements.map(d => ({ value: d.id, label: d.nom })),
  ]

  return (
    <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-4">
      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input
          label="Nom"
          placeholder="Entrez le nom"
          icon={<User className="h-4 w-4" />}
          error={errors.nom?.message}
          {...register('nom')}
        />
        
        <Input
          label="Prénom"
          placeholder="Entrez le prénom"
          icon={<User className="h-4 w-4" />}
          error={errors.prenom?.message}
          {...register('prenom')}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input
          label="Email"
          type="email"
          placeholder="exemple@email.com"
          icon={<Mail className="h-4 w-4" />}
          error={errors.email?.message}
          {...register('email')}
        />
        
        <Input
          label="Téléphone"
          placeholder="77 123 45 67"
          icon={<Phone className="h-4 w-4" />}
          error={errors.telephone?.message}
          {...register('telephone')}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input
          label="Date de naissance"
          type="date"
          icon={<Calendar className="h-4 w-4" />}
          error={errors.dateNaissance?.message}
          {...register('dateNaissance')}
        />
        
        <Select
          label="Statut"
          options={statutOptions}
          error={errors.statut?.message}
          {...register('statut')}
        />
      </div>

      <Select
        label="Département"
        options={departementOptions}
        error={errors.departementId?.message}
        {...register('departementId')}
      />

      <Textarea
        label="Adresse"
        placeholder="Entrez l'adresse complète"
        rows={3}
        error={errors.adresse?.message}
        {...register('adresse')}
      />

      <div className="flex justify-end space-x-3 pt-4">
        <Button type="button" variant="outline">
          Annuler
        </Button>
        <Button type="submit" variant="primary" loading={isSubmitting}>
          {isEditing ? 'Modifier' : 'Créer'}  {/* ✅ UTILISE isEditing */}
        </Button>
      </div>
    </form>
  )
}