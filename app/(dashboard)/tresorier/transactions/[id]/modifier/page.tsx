'use client'

import { useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { TransactionForm } from '@/components/forms'
import { Card, Spinner } from '@/components/ui'
import { useTransactions } from '@/hooks/useTransactions'

export default function ModifierTransactionPage() {
  const params = useParams()
  const router = useRouter()
  const { selectedTransaction, fetchTransactionById, updateTransaction, isLoading } = useTransactions()

  useEffect(() => {
    if (params.id) {
      fetchTransactionById(params.id as string)
    }
  }, [params.id])

  const handleSubmit = async (data: any) => {
    const success = await updateTransaction(params.id as string, data)
    if (success) {
      router.push('/tresorier/transactions')
    }
  }

  if (isLoading && !selectedTransaction) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  if (!selectedTransaction) {
    return (
      <div className="text-center">
        <p className="text-gray-500">Transaction non trouvée</p>
        <button onClick={() => router.back()} className="mt-4 text-primary-600">
          Retour
        </button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Modifier la transaction</h1>
        <p className="mt-1 text-sm text-gray-500">
          {selectedTransaction.type === 'entree' ? 'Entrée' : 'Sortie'} du {new Date(selectedTransaction.dateTransaction).toLocaleDateString()}
        </p>
      </div>

      <Card className="p-6">
        <TransactionForm
          initialData={selectedTransaction}
          onSubmit={handleSubmit}
          isSubmitting={isLoading}
        />
      </Card>
    </div>
  )
}