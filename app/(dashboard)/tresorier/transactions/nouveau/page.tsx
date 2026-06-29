// app/(dashboard)/tresorier/transactions/nouveau/page.tsx
'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { TransactionForm } from '@/components/forms'
import { Card, Button } from '@/components/ui'
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
      <div className="mb-6 flex items-center space-x-4">
        <button
          onClick={() => router.push('/tresorier/transactions')}
          className="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-gray-600 dark:text-gray-400" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Nouvelle transaction</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Enregistrez une entrée ou une sortie d'argent</p>
        </div>
      </div>

      <Card className="p-6 dark:bg-gray-900 dark:border-gray-800">
        <TransactionForm onSubmit={handleSubmit} isSubmitting={isLoading} />
      </Card>
    </div>
  )
}