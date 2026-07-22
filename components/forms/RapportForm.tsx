'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { FileText, Building2, Calendar, Tag, ArrowLeft, AlertCircle } from 'lucide-react'
import { Input, Select, Textarea, Button } from '@/components/ui'
import { useDepartementStore } from '@/store/departementStore'
import { RapportFormData } from '@/types'
import { formatDateForInput } from '@/utils/formatters'
import { useRouter } from 'next/navigation'

// ✅ SCHÉMA AVEC TOUS LES CHAMPS OBLIGATOIRES
const rapportSchema = z.object({
  departementId: z.string()
    .min(1, 'Le département est requis'),
  titre: z.string()
    .min(1, 'Le titre est requis')
    .min(3, 'Le titre doit contenir au moins 3 caractères')
    .max(200, 'Le titre est trop long (max 200 caractères)'),
  contenu: z.string()
    .min(1, 'Le contenu est requis')
    .min(10, 'Le contenu doit contenir au moins 10 caractères'),
  periode: z.string()
    .min(1, 'La période est requise'),
})

interface RapportFormProps {
  initialData?: RapportFormData
  isEditing?: boolean
  onSubmit: (data: RapportFormData) => Promise<void>
  isSubmitting?: boolean
  onCancel?: () => void
}

export const RapportForm = ({ 
  initialData, 
  isEditing = false,
  onSubmit, 
  isSubmitting = false,
  onCancel
}: RapportFormProps) => {
  const router = useRouter()
  const { departements, fetchDepartements } = useDepartementStore()
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<RapportFormData>({
    resolver: zodResolver(rapportSchema),
    defaultValues: {
      departementId: '',
      titre: '',
      contenu: '',
      periode: formatDateForInput(new Date()),
    },
  })

  useEffect(() => {
    fetchDepartements()
  }, [fetchDepartements])

  useEffect(() => {
    if (initialData) {
      reset({
        ...initialData,
        periode: initialData.periode ? formatDateForInput(initialData.periode) : formatDateForInput(new Date()),
      })
    }
  }, [initialData, reset])

  const onSubmitForm = async (data: RapportFormData) => {
    try {
      setError(null)
      
      // ✅ Vérifications supplémentaires avant l'envoi
      if (!data.departementId || data.departementId === '') {
        setError('Veuillez sélectionner un département')
        return
      }
      
      if (!data.titre || data.titre.trim() === '') {
        setError('Le titre est obligatoire')
        return
      }
      
      if (data.titre.length < 3) {
        setError('Le titre doit contenir au moins 3 caractères')
        return
      }
      
      if (!data.contenu || data.contenu.trim() === '') {
        setError('Le contenu est obligatoire')
        return
      }
      
      if (data.contenu.length < 10) {
        setError('Le contenu doit contenir au moins 10 caractères')
        return
      }
      
      if (!data.periode || data.periode === '') {
        setError('La période est obligatoire')
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
  const departementOptions = [
    { value: '', label: '-- Sélectionnez un département --' },
    ...departements.map(d => ({
      value: d.id,
      label: d.nom,
    })),
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
              Veuillez créer un département avant de pouvoir créer un rapport.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
        </div>

        {/* ✅ Période - OBLIGATOIRE */}
        <div>
          <Input
            label="Période *"
            type="month"
            error={errors.periode?.message}
            {...register('periode')}
            required
          />
          {errors.periode && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.periode.message}</p>
          )}
        </div>
      </div>

      {/* ✅ Titre - OBLIGATOIRE */}
      <div>
        <Input
          label="Titre *"
          placeholder="Titre du rapport"
          error={errors.titre?.message}
          {...register('titre')}
          required
        />
        {errors.titre && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.titre.message}</p>
        )}
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Entre 3 et 200 caractères
        </p>
      </div>

      {/* ✅ Contenu - OBLIGATOIRE */}
      <div>
        <Textarea
          label="Contenu *"
          placeholder="Rédigez le contenu du rapport ici..."
          rows={10}
          error={errors.contenu?.message}
          {...register('contenu')}
          required
        />
        {errors.contenu && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.contenu.message}</p>
        )}
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Minimum 10 caractères
        </p>
      </div>

      {/* ✅ Récapitulatif des champs obligatoires */}
      <div className="rounded-lg bg-blue-50 p-3 text-xs text-blue-700 dark:bg-blue-900/20 dark:text-blue-400">
        <p>⚠️ Les champs avec <span className="font-semibold">*</span> sont obligatoires.</p>
      </div>

      <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
        <Button 
          type="button" 
          variant="outline" 
          onClick={handleCancel}
          className="dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Annuler
        </Button>
        <Button 
          type="submit" 
          variant="primary" 
          loading={isSubmitting}
          disabled={isSubmitting || !hasDepartements}
          className="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600"
        >
          {isEditing ? 'Modifier' : 'Créer'}
        </Button>
      </div>
    </form>
  )
}