'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { DollarSign, Calendar, Tag, User, FileText, ArrowUpCircle, ArrowDownCircle, Landmark } from 'lucide-react'
import { Input, Select, Textarea, Button } from '@/components/ui'
import { useCategorieStore } from '@/store/categorieStore'
import { useMemberStore } from '@/store/memberStore'
import { TransactionFormData, Devise } from '@/types'
import { formatDateForInput } from '@/utils/formatters'

// Schéma de validation avec devise
const transactionSchema = z.object({
  type: z.enum(['entree', 'sortie']),
  categorieId: z.string().min(1, 'La catégorie est requise'),
  membreId: z.string().optional(),
  montant: z.number().min(0.01, 'Le montant doit être supérieur à 0'),
  devise: z.enum(['USD', 'CDF']),
  dateTransaction: z.string().min(1, 'La date est requise'),
  description: z.string().optional(),
})

interface TransactionFormProps {
  initialData?: TransactionFormData
  onSubmit: (data: TransactionFormData) => Promise<void>
  isSubmitting?: boolean
}

// Taux de change (à récupérer depuis API ou config)
const TAUX_CHANGE = 2250

export const TransactionForm = ({ initialData, onSubmit, isSubmitting = false }: TransactionFormProps) => {
  const { categories, entrees, sorties, fetchCategories } = useCategorieStore()
  const { members, fetchMembers } = useMemberStore()
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
  } = useForm<TransactionFormData>({
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

  useEffect(() => {
    setSelectedType(watchedType)
    setValue('categorieId', '')
  }, [watchedType, setValue])

  const onSubmitForm = async (data: TransactionFormData) => {
    try {
      setError(null)
      await onSubmit(data)
    } catch (err: any) {
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

  const categorieOptions = (selectedType === 'entree' ? entrees : sorties).map(c => ({
    value: c.id,
    label: c.nom,
  }))

  const membreOptions = members.map(m => ({
    value: m.id,
    label: `${m.prenom} ${m.nom}`,
  }))

  return (
    <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-4">
      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Select
          label="Type"
          options={typeOptions}
          error={errors.type?.message}
          {...register('type')}
        />

        <Select
          label="Catégorie"
          options={categorieOptions}
          error={errors.categorieId?.message}
          {...register('categorieId')}
        />
      </div>

      {selectedType === 'entree' && (
        <Select
          label="Membre"
          options={membreOptions}
          error={errors.membreId?.message}
          {...register('membreId')}
        />
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="sm:col-span-1">
          <Select
            label="Devise"
            options={deviseOptions}
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
            {...register('montant', { valueAsNumber: true })}
          />
        </div>
      </div>

      {/* Affichage de la conversion */}
      {montantConverti !== null && (
        <div className="rounded-lg bg-gray-50 p-3 text-sm text-gray-600">
          <p className="text-gray-600">
            Équivalent en {watchedDevise === 'USD' ? 'CDF' : 'USD'} : 
            <span className="ml-2 font-semibold">
              {watchedDevise === 'USD' 
                ? `${montantConverti.toLocaleString()} CDF` 
                : `${montantConverti.toFixed(2)} USD`}
            </span>
          </p>
          <p className="mt-1 text-xs text-gray-500">
            Taux de change: 1 USD = {TAUX_CHANGE} CDF
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input
          label="Date"
          type="date"
          error={errors.dateTransaction?.message}
          {...register('dateTransaction')}
        />
      </div>

      <Textarea
        label="Description"
        placeholder="Description de la transaction"
        rows={3}
        error={errors.description?.message}
        {...register('description')}
      />

      <div className="flex justify-end space-x-3 pt-4">
        <Button type="button" variant="outline">
          Annuler
        </Button>
        <Button type="submit" variant="primary" loading={isSubmitting}>
          {initialData ? 'Modifier' : 'Enregistrer'}
        </Button>
      </div>
    </form>
  )
}