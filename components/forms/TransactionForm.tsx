// components/forms/TransactionForm.tsx
'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2 } from 'lucide-react'
import { Input, Select, Textarea, Button } from '@/components/ui'
import { useCategorieStore } from '@/store/categorieStore'
import { useMemberStore } from '@/store/memberStore'
import { TransactionFormData, Devise } from '@/types'
import { formatDateForInput } from '@/utils/formatters'

// ✅ Schéma de validation simplifié
const transactionSchema = z.object({
  type: z.enum(['entree', 'sortie']),
  categorieId: z.string().min(1, 'La catégorie est requise'),
  membreId: z.string().optional(),
  montant: z.number().min(0.01, 'Le montant doit être supérieur à 0'),
  devise: z.enum(['USD', 'CDF']),
  dateTransaction: z.string().min(1, 'La date est requise'),
  description: z.string().optional(),
})

type TransactionFormDataWithType = TransactionFormData & {
  type: 'entree' | 'sortie'
}

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
  } = useForm<TransactionFormDataWithType>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: 'entree',
      categorieId: '',
      membreId: '',
      montant: 0,
      devise: 'CDF',
      dateTransaction: formatDateForInput(new Date()),
      description: '',
    },
  })

  const watchedType = watch('type')
  const watchedDevise = watch('devise')
  const watchedMontant = watch('montant')

  // Mettre à jour le montant converti
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

  // Charger les catégories et les membres
  useEffect(() => {
    fetchCategories()
    fetchMembers({ limit: 100 })
  }, [fetchCategories, fetchMembers])

  useEffect(() => {
    if (initialData) {
      reset({
        ...initialData,
        dateTransaction: initialData.dateTransaction ? formatDateForInput(initialData.dateTransaction) : formatDateForInput(new Date()),
      })
      setSelectedType(initialData.type)
      setSelectedDevise(initialData.devise || 'CDF')
    }
  }, [initialData, reset])

  // ✅ Réinitialiser les champs quand le type change
  useEffect(() => {
    setSelectedType(watchedType)
    setValue('categorieId', '')
    // ✅ Ne réinitialiser membreId que si on passe de sortie à entrée
    if (watchedType === 'entree' && !initialData?.membreId) {
      setValue('membreId', '')
    }
  }, [watchedType, setValue, initialData])

  const onSubmitForm = async (data: TransactionFormDataWithType) => {
    try {
      setError(null)
      
      // ✅ Construire les données à envoyer
      const submitData: any = {
        type: data.type.toLowerCase(),
        categorieId: data.categorieId,
        montant: data.montant,
        devise: data.devise,
        dateTransaction: data.dateTransaction,
        description: data.description || '',
      }
      
      // ✅ Ajouter membreId s'il est présent
      if (data.membreId) {
        submitData.membreId = data.membreId
      }
      
      console.log('📤 Envoi des données:', submitData)
      await onSubmit(submitData)
    } catch (err: any) {
      console.error('❌ Erreur:', err)
      setError(err.message || 'Une erreur est survenue')
    }
  }

  const typeOptions = [
    { value: 'entree', label: 'Entrée' },
    { value: 'sortie', label: 'Sortie' },
  ]

  const deviseOptions = [
    { value: 'USD', label: 'USD (Dollar américain)' },
    { value: 'CDF', label: 'CDF (Franc congolais)' },
  ]

  const getCategorieOptions = () => {
    let categoriesFiltrees: any[] = []
    
    if (selectedType === 'entree') {
      categoriesFiltrees = entrees.length > 0 ? entrees : categories.filter(c => {
        const type = c.type?.toLowerCase() || ''
        return type === 'entree' || type === 'revenu'
      })
    } else {
      categoriesFiltrees = sorties.length > 0 ? sorties : categories.filter(c => {
        const type = c.type?.toLowerCase() || ''
        return type === 'sortie' || type === 'depense'
      })
    }
    
    return categoriesFiltrees.map(c => ({
      value: c.id,
      label: c.nom,
    }))
  }

  const membreOptions = [
    { value: '', label: 'Aucun' },
    ...members.map(m => ({
      value: m.id,
      label: `${m.prenom} ${m.nom}`,
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
        <p className="text-yellow-800 dark:text-yellow-200">
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
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Select
          label="Type"
          options={typeOptions}
          value={watchedType}
          error={errors.type?.message}
          {...register('type', { 
            onChange: (e) => {
              setSelectedType(e.target.value)
            }
          })}
        />

        <Select
          label="Catégorie"
          options={getCategorieOptions()}
          error={errors.categorieId?.message}
          {...register('categorieId')}
        />
      </div>

      {/* ✅ Champ membre visible pour les deux types */}
      <Select
        label={selectedType === 'entree' ? "Membre (requis)" : "Membre (optionnel)"}
        options={membreOptions}
        error={errors.membreId?.message}
        {...register('membreId')}
      />
      
      {/* ✅ Message d'information pour les sorties */}
      {selectedType === 'sortie' && (
        <p className="text-xs text-gray-500 dark:text-gray-400 -mt-2">
          💡 Vous pouvez associer cette sortie à un membre si nécessaire (ex: remboursement, avance).
        </p>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="sm:col-span-1">
          <Select
            label="Devise"
            options={deviseOptions}
            value={watchedDevise}
            error={errors.devise?.message}
            {...register('devise')}
          />
        </div>
        
        <div className="sm:col-span-2">
          <Input
            label="Montant"
            type="number"
            step="0.01"
            placeholder="0.00"
            error={errors.montant?.message}
            {...register('montant', { 
              valueAsNumber: true
            })}
          />
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

      <Input
        label="Date"
        type="date"
        error={errors.dateTransaction?.message}
        {...register('dateTransaction')}
      />

      <Textarea
        label="Description"
        placeholder="Description de la transaction"
        rows={3}
        error={errors.description?.message}
        {...register('description')}
      />

      <div className="flex justify-end space-x-3 pt-4">
        <Button 
          type="button" 
          variant="outline" 
          onClick={() => window.history.back()}
          className="dark:border-gray-700 dark:text-gray-300"
        >
          Annuler
        </Button>
        <Button type="submit" variant="primary" loading={isSubmitting}>
          {initialData ? 'Modifier' : 'Enregistrer'}
        </Button>
      </div>
    </form>
  )
}