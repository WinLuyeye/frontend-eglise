// components/forms/TransactionForm.tsx
'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, AlertCircle } from 'lucide-react'
import { Input, Select, Textarea, Button } from '@/components/ui'
import { useCategorieStore } from '@/store/categorieStore'
import { useMemberStore } from '@/store/memberStore'
import { TransactionFormData } from '@/types'
import { formatDateForInput } from '@/utils/formatters'

// ✅ Schéma de validation aligné avec le backend
const transactionSchema = z.object({
  type: z.enum(['entree', 'sortie'], {
    required_error: 'Le type est requis',
    invalid_type_error: 'Le type doit être "entree" ou "sortie"',
  }),
  categorieId: z.string().min(1, 'La catégorie est requise'),
  membreId: z.string().optional(),
  montant: z.number()
    .min(0.01, 'Le montant doit être supérieur à 0')
    .max(999999999, 'Le montant est trop élevé'),
  devise: z.enum(['USD', 'CDF']).default('CDF'),
  dateTransaction: z.string().min(1, 'La date est requise'),
  description: z.string().optional(),
})

type TransactionFormValues = z.infer<typeof transactionSchema>

interface TransactionFormProps {
  initialData?: TransactionFormData
  onSubmit: (data: TransactionFormData) => Promise<void>
  isSubmitting?: boolean
}

export const TransactionForm = ({ 
  initialData, 
  onSubmit, 
  isSubmitting = false 
}: TransactionFormProps) => {
  const { categories, entrees, sorties, isLoading: categoriesLoading, fetchCategories } = useCategorieStore()
  const { members, isLoading: membersLoading, fetchMembers } = useMemberStore()
  const [selectedType, setSelectedType] = useState<'entree' | 'sortie'>('entree')
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    reset,
    clearErrors,
  } = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: 'entree',
      categorieId: '',
      membreId: '',
      montant: undefined,
      devise: 'CDF',
      dateTransaction: formatDateForInput(new Date()),
      description: '',
    },
  })

  const watchedType = watch('type')

  // Chargement des données
  useEffect(() => {
    fetchCategories()
    fetchMembers({ limit: 100 })
  }, [fetchCategories, fetchMembers])

  // Initialisation avec les données existantes
  useEffect(() => {
    if (initialData) {
      reset({
        type: initialData.type,
        categorieId: initialData.categorieId,
        membreId: initialData.membreId || '',
        montant: initialData.montant,
        devise: initialData.devise || 'CDF',
        dateTransaction: initialData.dateTransaction ? formatDateForInput(initialData.dateTransaction) : formatDateForInput(new Date()),
        description: initialData.description || '',
      })
      setSelectedType(initialData.type)
    }
  }, [initialData, reset])

  // Réinitialiser la catégorie quand le type change
  useEffect(() => {
    setSelectedType(watchedType)
    setValue('categorieId', '')
    clearErrors('membreId')
  }, [watchedType, setValue, clearErrors])

  // Soumission du formulaire
  const onSubmitForm = async (data: TransactionFormValues) => {
    try {
      setError(null)
      
      // Validation du montant
      if (!data.montant || data.montant <= 0 || isNaN(data.montant)) {
        setError('Le montant est requis et doit être supérieur à 0')
        return
      }

      // ✅ Données exactement comme attendues par le backend
      const submitData: TransactionFormData = {
        type: data.type,
        categorieId: data.categorieId,
        montant: data.montant,
        devise: data.devise,
        dateTransaction: data.dateTransaction,
        description: data.description?.trim() || undefined,
        membreId: data.membreId?.trim() || undefined,
      }
      
      console.log('📤 Envoi au backend:', submitData)
      
      // Appel au parent
      await onSubmit(submitData)
      
      // Reset après succès
      reset({
        type: 'entree',
        categorieId: '',
        membreId: '',
        montant: undefined,
        devise: 'CDF',
        dateTransaction: formatDateForInput(new Date()),
        description: '',
      })
      setError(null)
      
    } catch (err: any) {
      console.error('❌ Erreur:', err)
      
      // Gestion des erreurs du backend
      if (err.response?.data?.message) {
        setError(err.response.data.message)
      } else if (err.response?.data?.errors) {
        const errorMessages = err.response.data.errors.map((e: any) => e.message).join(', ')
        setError(errorMessages)
      } else if (err.message) {
        setError(err.message)
      } else {
        setError('Une erreur est survenue lors de l\'enregistrement')
      }
    }
  }

  // Options des sélecteurs
  const typeOptions = [
    { value: '', label: '-- Sélectionnez un type --' },
    { value: 'entree', label: 'Entrée' },
    { value: 'sortie', label: 'Sortie' },
  ]

  const deviseOptions = [
    { value: 'CDF', label: 'CDF (Franc congolais)' },
    { value: 'USD', label: 'USD (Dollar américain)' },
  ]

  const getCategorieOptions = () => {
    const emptyOption = { value: '', label: '-- Sélectionnez une catégorie --' }
    
    // Filtrer les catégories par type
    let categoriesFiltrees = []
    if (selectedType === 'entree') {
      categoriesFiltrees = entrees.length > 0 
        ? entrees 
        : categories.filter(c => c.type?.toLowerCase() === 'entree')
    } else {
      categoriesFiltrees = sorties.length > 0 
        ? sorties 
        : categories.filter(c => c.type?.toLowerCase() === 'sortie')
    }
    
    return [
      emptyOption,
      ...categoriesFiltrees.map(c => ({
        value: c.id,
        label: c.nom,
      }))
    ]
  }

  const membreOptions = [
    { value: '', label: '-- Sélectionnez un membre (optionnel) --' },
    ...members.map(m => ({
      value: m.id,
      label: `${m.prenom} ${m.nom}${m.email ? ` (${m.email})` : ''}`,
    })),
  ]

  // États de chargement
  if (categoriesLoading || membersLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary-600" />
          <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">Chargement des données...</p>
        </div>
      </div>
    )
  }

  // Pas de catégories
  if (categories.length === 0 && !categoriesLoading) {
    return (
      <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-6 text-center dark:border-yellow-800 dark:bg-yellow-900/20">
        <AlertCircle className="mx-auto h-8 w-8 text-yellow-600 dark:text-yellow-400" />
        <p className="mt-3 text-yellow-800 dark:text-yellow-200">
          Aucune catégorie trouvée. Veuillez créer des catégories avant d'ajouter une transaction.
        </p>
        <button
          type="button"
          onClick={() => fetchCategories()}
          className="mt-3 text-sm text-primary-600 hover:underline dark:text-primary-400"
        >
          Rafraîchir
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-4">
      {/* Affichage des erreurs */}
      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400 flex items-start gap-2">
          <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Type et Catégorie */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <Select
            label="Type *"
            options={typeOptions}
            value={watchedType}
            error={errors.type?.message}
            {...register('type', { 
              onChange: (e) => {
                setSelectedType(e.target.value)
                clearErrors('membreId')
              }
            })}
            required
          />
        </div>

        <div>
          <Select
            label="Catégorie *"
            options={getCategorieOptions()}
            error={errors.categorieId?.message}
            {...register('categorieId')}
            required
          />
        </div>
      </div>

      {/* Membre */}
      <div>
        <Select
          label="Membre (optionnel)"
          options={membreOptions}
          error={errors.membreId?.message}
          {...register('membreId')}
        />
      </div>

      {/* Devise et Montant */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="sm:col-span-1">
          <Select
            label="Devise *"
            options={deviseOptions}
            error={errors.devise?.message}
            {...register('devise')}
            required
          />
        </div>
        
        <div className="sm:col-span-2">
          <Input
            label="Montant *"
            type="number"
            step="0.01"
            min="0.01"
            placeholder="0.00"
            error={errors.montant?.message}
            {...register('montant', { 
              valueAsNumber: true,
              setValueAs: (v) => v === '' ? undefined : parseFloat(v),
            })}
            required
          />
        </div>
      </div>

      {/* Date */}
      <div>
        <Input
          label="Date *"
          type="date"
          error={errors.dateTransaction?.message}
          {...register('dateTransaction')}
          required
        />
      </div>

      {/* Description */}
      <Textarea
        label="Description (optionnelle)"
        placeholder="Description de la transaction (optionnelle)"
        rows={3}
        error={errors.description?.message}
        {...register('description')}
      />

      {/* Information */}
      <div className="rounded-lg bg-gray-50 p-3 text-xs text-gray-600 dark:bg-gray-800/50 dark:text-gray-400 border border-gray-200 dark:border-gray-700">
        <p>
          <span className="font-semibold text-red-500">*</span> Champs obligatoires.
        </p>
        <p className="mt-1 text-gray-500 dark:text-gray-500">
          💰 La devise sélectionnée sera enregistrée avec le montant.
        </p>
      </div>

      {/* Actions */}
      <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
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
          variant="primary" 
          loading={isSubmitting}
          disabled={isSubmitting}
        >
          {initialData ? 'Modifier' : 'Enregistrer'}
        </Button>
      </div>
    </form>
  )
}