// app/(dashboard)/admin/finances/transactions/[id]/modifier/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { Card, Button, Spinner } from '@/components/ui'
import { TransactionForm } from '@/components/forms'
import { useTransactions } from '@/hooks/useTransactions'
import { TransactionFormData } from '@/types'

export default function ModifierTransactionPage() {
  const router = useRouter()
  const params = useParams()
  const id = params?.id as string
  
  const { selectedTransaction, fetchTransactionById, updateTransaction, isLoading } = useTransactions()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (id) {
      fetchTransactionById(id)
    }
  }, [id])

  const handleSubmit = async (data: TransactionFormData) => {
    try {
      setIsSubmitting(true)
      setError(null)
      
      const success = await updateTransaction(id, data)
      if (success) {
        router.push(`/admin/finances/transactions/${id}`)
      }
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  if (!selectedTransaction) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <p className="text-gray-500 dark:text-gray-400">Transaction non trouvée</p>
        <Button 
          variant="outline" 
          className="mt-4 dark:border-gray-700 dark:text-gray-300"
          onClick={() => router.push('/admin/finances/transactions')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour aux transactions
        </Button>
      </div>
    )
  }

  // Préparer les données pour le formulaire
  const initialData: TransactionFormData = {
    type: selectedTransaction.type as 'entree' | 'sortie',
    categorieId: selectedTransaction.categorieId,
    membreId: selectedTransaction.membreId || undefined,
    montant: Number(selectedTransaction.montant),
    devise: selectedTransaction.devise as 'USD' | 'CDF',
    dateTransaction: selectedTransaction.dateTransaction,
    description: selectedTransaction.description || '',
  }

  return (
    <div className="mx-auto max-w-2xl">
      {/* En-tête */}
      <div className="mb-6 flex items-center space-x-4">
        <button
          onClick={() => router.push(`/admin/finances/transactions/${id}`)}
          className="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-gray-600 dark:text-gray-400" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Modifier la transaction
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Référence: {id.substring(0, 8)}...
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Formulaire */}
      <Card className="p-6 dark:bg-gray-900 dark:border-gray-800">
        <TransactionForm 
          initialData={initialData}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
        />
      </Card>
    </div>
  )
}