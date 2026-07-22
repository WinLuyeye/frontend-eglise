'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { FileText, Building2, Calendar, Tag, ArrowLeft } from 'lucide-react'
import { Input, Select, Textarea, Button } from '@/components/ui'
import { useDepartementStore } from '@/store/departementStore'
import { RapportFormData } from '@/types'
import { formatDateForInput } from '@/utils/formatters'
import { useRouter } from 'next/navigation' // ✅ IMPORT AJOUTÉ

// Schéma de validation Zod
const rapportSchema = z.object({
  departementId: z.string().min(1, 'Le département est requis'),
  titre: z.string().min(3, 'Le titre doit contenir au moins 3 caractères').max(200, 'Titre trop long'),
  contenu: z.string().min(10, 'Le contenu doit contenir au moins 10 caractères'),
  periode: z.string().min(1, 'La période est requise'),
})

interface RapportFormProps {
  initialData?: RapportFormData
  isEditing?: boolean // ✅ AJOUTÉ
  onSubmit: (data: RapportFormData) => Promise<void>
  isSubmitting?: boolean
  onCancel?: () => void // ✅ PROP OPTIONNELLE
}

export const RapportForm = ({ 
  initialData, 
  isEditing = false, // ✅ AJOUTÉ AVEC VALEUR PAR DÉFAUT
  onSubmit, 
  isSubmitting = false,
  onCancel // ✅ PROP AJOUTÉE
}: RapportFormProps) => {
  const router = useRouter() // ✅ HOOK AJOUTÉ
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
      await onSubmit(data)
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue')
    }
  }

  // ✅ FONCTION POUR GÉRER L'ANNULATION
  const handleCancel = () => {
    if (onCancel) {
      onCancel() // Si une fonction personnalisée est fournie
    } else {
      router.back() // Sinon, retour en arrière par défaut
    }
  }

  const departementOptions = departements.map(d => ({
    value: d.id,
    label: d.nom,
  }))

  return (
    <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-4">
      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950/30 dark:text-red-400">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Select
          label="Département"
          options={departementOptions}
          error={errors.departementId?.message}
          {...register('departementId')}
        />

        <Input
          label="Période"
          type="month"
          error={errors.periode?.message}
          {...register('periode')}
        />
      </div>

      <Input
        label="Titre"
        placeholder="Titre du rapport"
        error={errors.titre?.message}
        {...register('titre')}
      />

      <Textarea
        label="Contenu"
        placeholder="Rédigez le contenu du rapport ici..."
        rows={10}
        error={errors.contenu?.message}
        {...register('contenu')}
      />

      <div className="flex justify-end space-x-3 pt-4">
        <Button 
          type="button" 
          variant="outline" 
          onClick={handleCancel} // ✅ APPEL DE LA FONCTION
          className="border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Annuler
        </Button>
        <Button 
          type="submit" 
          variant="primary" 
          loading={isSubmitting}
          className="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600"
        >
          {isEditing ? 'Modifier' : 'Créer'} {/* ✅ UTILISE isEditing */}
        </Button>
      </div>
    </form>
  )
}