// app/(dashboard)/tresorier/transactions/[id]/modifier/page.tsx
'use client'

import { useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { TransactionForm } from '@/components/forms'
import { Card, Spinner, Button } from '@/components/ui'
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
      router.push(`/tresorier/transactions/${params.id}`)
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
      <div className="flex flex-col items-center justify-center h-96">
        <p className="text-gray-500 dark:text-gray-400">Transaction non trouvée</p>
        <Button 
          variant="outline" 
          onClick={() => router.back()} 
          className="mt-4 dark:border-gray-700 dark:text-gray-300"
        >
          Retour
        </Button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6 flex items-center space-x-4">
        <button
          onClick={() => router.push(`/tresorier/transactions/${params.id}`)}
          className="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-gray-600 dark:text-gray-400" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Modifier la transaction</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {selectedTransaction.type === 'entree' ? 'Entrée' : 'Sortie'} du {new Date(selectedTransaction.dateTransaction).toLocaleDateString()}
          </p>
        </div>
      </div>

      <Card className="p-6 dark:bg-gray-900 dark:border-gray-800">
        <TransactionForm
          initialData={selectedTransaction}
          onSubmit={handleSubmit}
          isSubmitting={isLoading}
        />
      </Card>
    </div>
  )
}