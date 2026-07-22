// components/forms/MembreForm.tsx (version améliorée avec isEditing)
'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { User, Mail, Phone, MapPin, Calendar, Building2, AlertCircle } from 'lucide-react'
import { Input, Select, Textarea, Button } from '@/components/ui'
import { useDepartementStore } from '@/store/departementStore'
import { MembreFormData } from '@/types'
import { formatDateForInput } from '@/utils/formatters'
import { useRouter } from 'next/navigation'

// ✅ SCHÉMA CORRIGÉ - z.enum() ne supporte pas required_error
const membreSchema = z.object({
  nom: z.string()
    .min(1, 'Le nom est requis')
    .min(2, 'Le nom doit contenir au moins 2 caractères')
    .max(100, 'Le nom est trop long (max 100 caractères)'),
  prenom: z.string()
    .min(1, 'Le prénom est requis')
    .min(2, 'Le prénom doit contenir au moins 2 caractères')
    .max(100, 'Le prénom est trop long (max 100 caractères)'),
  email: z.string()
    .email('Email invalide')
    .optional()
    .or(z.literal('')),
  telephone: z.string()
    .min(1, 'Le téléphone est requis')
    .optional(),
  adresse: z.string()
    .optional(),
  dateNaissance: z.string()
    .min(1, 'La date de naissance est requise')
    .optional(),
  statut: z.enum(['actif', 'inactif', 'transfere']).default('actif'),  // ✅ CORRIGÉ
  departementId: z.string()
    .min(1, 'Le département est requis')
    .optional(),
})

interface MembreFormProps {
  initialData?: MembreFormData
  isEditing?: boolean
  onSubmit: (data: MembreFormData) => Promise<void>
  isSubmitting?: boolean
  onCancel?: () => void
}

export const MembreForm = ({ 
  initialData, 
  isEditing = false,
  onSubmit, 
  isSubmitting = false,
  onCancel
}: MembreFormProps) => {
  const router = useRouter()
  const { departements, fetchDepartements } = useDepartementStore()
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
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

  const watchedStatut = watch('statut')

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
      
      // ✅ Vérifications supplémentaires avant l'envoi
      if (!data.nom || data.nom.trim() === '') {
        setError('Le nom est obligatoire')
        return
      }
      
      if (data.nom.length < 2) {
        setError('Le nom doit contenir au moins 2 caractères')
        return
      }
      
      if (!data.prenom || data.prenom.trim() === '') {
        setError('Le prénom est obligatoire')
        return
      }
      
      if (data.prenom.length < 2) {
        setError('Le prénom doit contenir au moins 2 caractères')
        return
      }
      
      if (!data.telephone || data.telephone.trim() === '') {
        setError('Le numéro de téléphone est obligatoire')
        return
      }
      
      if (!data.dateNaissance || data.dateNaissance === '') {
        setError('La date de naissance est obligatoire')
        return
      }
      
      if (!data.departementId || data.departementId === '') {
        setError('Veuillez sélectionner un département')
        return
      }
      
      if (!data.statut) {
        setError('Le statut est obligatoire')
        return
      }
      
      await onSubmit(data)
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue')
    }
  }

  const handleCancel = () => {
    if (onCancel) {
      onCancel()
    } else {
      router.back()
    }
  }

  // ✅ Ajouter une option vide pour forcer la sélection
  const statutOptions = [
    { value: '', label: '-- Sélectionnez un statut --' },
    { value: 'actif', label: 'Actif' },
    { value: 'inactif', label: 'Inactif' },
    { value: 'transfere', label: 'Transféré' },
  ]

  const departementOptions = [
    { value: '', label: '-- Sélectionnez un département --' },
    ...departements.map(d => ({ value: d.id, label: d.nom })),
  ]

  // ✅ Vérifier si des départements existent
  const hasDepartements = departements.length > 0

  return (
    <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-4">
      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400 flex items-center">
          <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* ✅ Avertissement si aucun département n'existe */}
      {!hasDepartements && !initialData && (
        <div className="rounded-lg bg-yellow-50 p-4 text-sm text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400 flex items-start">
          <AlertCircle className="h-5 w-5 mr-3 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">Aucun département disponible</p>
            <p className="mt-1 text-xs text-yellow-600 dark:text-yellow-500">
              Veuillez créer un département avant de pouvoir ajouter un membre.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* ✅ Nom - OBLIGATOIRE */}
        <div>
          <Input
            label="Nom *"
            placeholder="Entrez le nom"
            icon={<User className="h-4 w-4" />}
            error={errors.nom?.message}
            {...register('nom')}
            required
          />
          {errors.nom && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.nom.message}</p>
          )}
        </div>
        
        {/* ✅ Prénom - OBLIGATOIRE */}
        <div>
          <Input
            label="Prénom *"
            placeholder="Entrez le prénom"
            icon={<User className="h-4 w-4" />}
            error={errors.prenom?.message}
            {...register('prenom')}
            required
          />
          {errors.prenom && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.prenom.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* ✅ Email - OPTIONNEL */}
        <div>
          <Input
            label="Email"
            type="email"
            placeholder="exemple@email.com"
            icon={<Mail className="h-4 w-4" />}
            error={errors.email?.message}
            {...register('email')}
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email.message}</p>
          )}
        </div>
        
        {/* ✅ Téléphone - OBLIGATOIRE */}
        <div>
          <Input
            label="Téléphone *"
            placeholder="77 123 45 67"
            icon={<Phone className="h-4 w-4" />}
            error={errors.telephone?.message}
            {...register('telephone')}
            required
          />
          {errors.telephone && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.telephone.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* ✅ Date de naissance - OBLIGATOIRE */}
        <div>
          <Input
            label="Date de naissance *"
            type="date"
            icon={<Calendar className="h-4 w-4" />}
            error={errors.dateNaissance?.message}
            {...register('dateNaissance')}
            required
          />
          {errors.dateNaissance && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.dateNaissance.message}</p>
          )}
        </div>
        
        {/* ✅ Statut - OBLIGATOIRE */}
        <div>
          <Select
            label="Statut *"
            options={statutOptions}
            error={errors.statut?.message}
            {...register('statut')}
            required
          />
          {errors.statut && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.statut.message}</p>
          )}
        </div>
      </div>

      {/* ✅ Département - OBLIGATOIRE */}
      <div>
        <Select
          label="Département *"
          options={departementOptions}
          error={errors.departementId?.message}
          {...register('departementId')}
          required
          disabled={!hasDepartements}
        />
        {errors.departementId && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.departementId.message}</p>
        )}
        {!hasDepartements && (
          <p className="mt-1 text-xs text-yellow-600 dark:text-yellow-500">
            ⚠️ Aucun département disponible. Veuillez en créer un d'abord.
          </p>
        )}
      </div>

      {/* ✅ Adresse - OPTIONNEL */}
      <div>
        <Textarea
          label="Adresse"
          placeholder="Entrez l'adresse complète (optionnel)"
          rows={3}
          error={errors.adresse?.message}
          {...register('adresse')}
        />
        {errors.adresse && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.adresse.message}</p>
        )}
      </div>

      {/* ✅ Récapitulatif des champs obligatoires */}
      <div className="rounded-lg bg-blue-50 p-3 text-xs text-blue-700 dark:bg-blue-900/20 dark:text-blue-400">
        <p>⚠️ Les champs avec <span className="font-semibold">*</span> sont obligatoires.</p>
        <p className="mt-1 text-gray-500 dark:text-gray-400">
          L&lsquo;email et l&lsquo;adresse sont optionnels.
        </p>
      </div>

      <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
        <Button 
          type="button" 
          variant="outline" 
          onClick={handleCancel}
          className="dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
        >
          Annuler
        </Button>
        <Button 
          type="submit" 
          variant="primary" 
          loading={isSubmitting}
          disabled={isSubmitting || !hasDepartements}
        >
          {isEditing ? 'Modifier' : 'Créer'}
        </Button>
      </div>
    </form>
  )
}