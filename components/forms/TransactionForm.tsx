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
import { TransactionFormData, Devise } from '@/types'
import { formatDateForInput } from '@/utils/formatters'

// ✅ SCHÉMA SIMPLIFIÉ - Type correct pour Zod
const transactionSchema = z.object({
  type: z.enum(['entree', 'sortie']),
  categorieId: z.string().min(1, 'La catégorie est requise'),
  membreId: z.string().optional(),
  montant: z.number()
    .min(0.01, 'Le montant doit être supérieur à 0')
    .max(999999999, 'Le montant est trop élevé'),
  devise: z.enum(['USD', 'CDF']),
  dateTransaction: z.string().min(1, 'La date est requise'),
  description: z.string().optional(),
})

// ✅ Type dérivé du schéma Zod
type TransactionFormValues = z.infer<typeof transactionSchema>

interface TransactionFormProps {
  initialData?: TransactionFormData
  onSubmit: (data: TransactionFormData) => Promise<void>
  isSubmitting?: boolean
}

const TAUX_CHANGE = 2250

export const TransactionForm = ({ initialData, onSubmit, isSubmitting = false }: TransactionFormProps) => {
  const { categories, entrees, sorties, isLoading: categoriesLoading, fetchCategories } = useCategorieStore()
  const { members, isLoading: membersLoading, fetchMembers } = useMemberStore()
  const [selectedType, setSelectedType] = useState<'entree' | 'sortie'>('entree')
  const [selectedDevise, setSelectedDevise] = useState<Devise>('CDF')
  const [montantConverti, setMontantConverti] = useState<number | null>(null)
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
  const watchedDevise = watch('devise')
  const watchedMontant = watch('montant')

  // ✅ Mettre à jour le montant converti
  useEffect(() => {
    if (watchedMontant && watchedMontant > 0) {
      if (watchedDevise === 'USD') {
        setMontantConverti(watchedMontant * TAUX_CHANGE)
      } else {
        setMontantConverti(watchedMontant / TAUX_CHANGE)
      }
    } else {
      setMontantConverti(null)
    }
  }, [watchedMontant, watchedDevise])

  // ✅ Charger les catégories et les membres
  useEffect(() => {
    fetchCategories()
    fetchMembers({ limit: 100 })
  }, [fetchCategories, fetchMembers])

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
      setSelectedDevise(initialData.devise || 'CDF')
    }
  }, [initialData, reset])

  // ✅ Réinitialiser les champs quand le type change
  useEffect(() => {
    setSelectedType(watchedType)
    setValue('categorieId', '')
    clearErrors('membreId')
  }, [watchedType, setValue, clearErrors])

  const onSubmitForm = async (data: TransactionFormValues) => {
    try {
      setError(null)
      
      // ✅ Validation supplémentaire pour le montant
      if (!data.montant || data.montant <= 0 || isNaN(data.montant)) {
        setError('Le montant est requis et doit être supérieur à 0')
        return
      }

      // ✅ Construire les données à envoyer
      const submitData: any = {
        type: data.type.toLowerCase(),
        categorieId: data.categorieId,
        montant: data.montant,
        devise: data.devise,
        dateTransaction: data.dateTransaction,
        description: data.description || '',
      }
      
      // ✅ Ajouter membreId uniquement s'il est présent
      if (data.membreId && data.membreId.trim() !== '') {
        submitData.membreId = data.membreId
      }
      
      console.log('📤 Envoi des données:', submitData)
      await onSubmit(submitData)
      
      // ✅ Réinitialiser le formulaire après succès
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
      setMontantConverti(null)
      
    } catch (err: any) {
      console.error('❌ Erreur:', err)
      
      // ✅ Gestion des erreurs spécifiques
      if (err.response?.data?.message) {
        setError(err.response.data.message)
      } else if (err.message) {
        setError(err.message)
      } else {
        setError('Une erreur est survenue lors de l\'enregistrement')
      }
    }
  }

  const typeOptions = [
    { value: '', label: '-- Sélectionnez un type --' },
    { value: 'entree', label: 'Entrée' },
    { value: 'sortie', label: 'Sortie' },
  ]

  const deviseOptions = [
    { value: '', label: '-- Sélectionnez une devise --' },
    { value: 'USD', label: 'USD (Dollar américain)' },
    { value: 'CDF', label: 'CDF (Franc congolais)' },
  ]

  const getCategorieOptions = () => {
    let categoriesFiltrees: any[] = []
    
    // ✅ Ajouter une option vide pour forcer la sélection
    const emptyOption = { value: '', label: '-- Sélectionnez une catégorie --' }
    
    if (selectedType === 'entree') {
      categoriesFiltrees = entrees.length > 0 ? entrees : categories.filter(c => {
        const type = c.type?.toLowerCase() || ''
        return type === 'entree' || type === 'revenu' || type === 'income'
      })
    } else {
      categoriesFiltrees = sorties.length > 0 ? sorties : categories.filter(c => {
        const type = c.type?.toLowerCase() || ''
        return type === 'sortie' || type === 'depense' || type === 'expense'
      })
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

  // ✅ Afficher un loader pendant le chargement
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

  // ✅ Si les catégories sont vides
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
      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400 flex items-center">
          <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* ✅ Type - OBLIGATOIRE */}
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
          {errors.type && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.type.message}</p>
          )}
        </div>

        {/* ✅ Catégorie - OBLIGATOIRE */}
        <div>
          <Select
            label="Catégorie *"
            options={getCategorieOptions()}
            error={errors.categorieId?.message}
            {...register('categorieId')}
            required
          />
          {errors.categorieId && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.categorieId.message}</p>
          )}
        </div>
      </div>

      {/* ✅ Membre - OPTIONNEL pour tous les types */}
      <div>
        <Select
          label="Membre (optionnel)"
          options={membreOptions}
          error={errors.membreId?.message}
          {...register('membreId')}
        />
        {errors.membreId && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.membreId.message}</p>
        )}
        
        {/* ✅ Messages d'information */}
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          💡 Vous pouvez associer cette transaction à un membre si nécessaire.
        </p>
        {selectedType === 'entree' && (
          <p className="mt-1 text-xs text-blue-500 dark:text-blue-400">
            ℹ️ Bien que facultatif, il est recommandé d'associer un membre aux entrées.
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {/* ✅ Devise - OBLIGATOIRE */}
        <div className="sm:col-span-1">
          <Select
            label="Devise *"
            options={deviseOptions}
            value={watchedDevise}
            error={errors.devise?.message}
            {...register('devise')}
            required
          />
          {errors.devise && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.devise.message}</p>
          )}
        </div>
        
        {/* ✅ Montant - OBLIGATOIRE */}
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
          {errors.montant && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.montant.message}</p>
          )}
        </div>
      </div>

      {/* Affichage de la conversion */}
      {montantConverti !== null && montantConverti > 0 && (
        <div className="rounded-lg bg-gray-50 p-3 text-sm text-gray-600 dark:bg-gray-800/50 dark:text-gray-400">
          <p>
            Équivalent en {watchedDevise === 'USD' ? 'CDF' : 'USD'} : 
            <span className="ml-2 font-semibold text-gray-900 dark:text-white">
              {watchedDevise === 'USD' 
                ? `${montantConverti.toLocaleString()} CDF` 
                : `${montantConverti.toFixed(2)} USD`}
            </span>
          </p>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
            Taux de change: 1 USD = {TAUX_CHANGE} CDF
          </p>
        </div>
      )}

      {/* ✅ Date - OBLIGATOIRE */}
      <div>
        <Input
          label="Date *"
          type="date"
          error={errors.dateTransaction?.message}
          {...register('dateTransaction')}
          required
        />
        {errors.dateTransaction && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.dateTransaction.message}</p>
        )}
      </div>

      {/* ✅ Description - OPTIONNEL */}
      <Textarea
        label="Description"
        placeholder="Description de la transaction (optionnelle)"
        rows={3}
        error={errors.description?.message}
        {...register('description')}
      />

      {/* ✅ Récapitulatif des champs obligatoires */}
      <div className="rounded-lg bg-blue-50 p-3 text-xs text-blue-700 dark:bg-blue-900/20 dark:text-blue-400">
        <p>⚠️ Les champs avec <span className="font-semibold">*</span> sont obligatoires.</p>
        <p className="mt-1">📌 Le membre est <span className="font-semibold">optionnel</span> pour tous les types de transaction.</p>
      </div>

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