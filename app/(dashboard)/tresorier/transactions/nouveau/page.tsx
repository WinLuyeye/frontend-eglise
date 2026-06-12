'use client'

import { useRouter } from 'next/navigation'
import { TransactionForm } from '@/components/forms'
import { Card } from '@/components/ui'
import { useTransactions } from '@/hooks/useTransactions'

export default function NouvelleTransactionPage() {
  const router = useRouter()
  const { createTransaction, isLoading } = useTransactions()

  const handleSubmit = async (data: any) => {
    const success = await createTransaction(data)
    if (success) {
      router.push('/tresorier/transactions')
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Nouvelle transaction</h1>
        <p className="mt-1 text-sm text-gray-500">Enregistrez une entrée ou une sortie d'argent</p>
      </div>

      <Card className="p-6">
        <TransactionForm onSubmit={handleSubmit} isSubmitting={isLoading} />
      </Card>
    </div>
  )
}