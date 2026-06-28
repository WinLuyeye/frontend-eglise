// app/(dashboard)/admin/finances/transactions/[id]/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { 
  ArrowLeft, 
  Calendar, 
  User, 
  Tag, 
  DollarSign, 
  FileText, 
  Edit, 
  Trash2,
  ArrowUpCircle,
  ArrowDownCircle,
  Landmark,
  Receipt
} from 'lucide-react'
import { Card, Button, Badge, Spinner } from '@/components/ui'
import { useTransactions } from '@/hooks/useTransactions'
import { formatDate } from '@/utils/formatters'

export default function TransactionDetailPage() {
  const router = useRouter()
  const params = useParams()
  const id = params?.id as string
  
  const { selectedTransaction, fetchTransactionById, isLoading, deleteTransaction } = useTransactions()
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  useEffect(() => {
    if (id) {
      fetchTransactionById(id)
    }
  }, [id])

  const handleDelete = async () => {
    await deleteTransaction(id)
    setShowDeleteModal(false)
    router.push('/admin/finances/transactions')
  }

  const formatMontant = (montant: number, devise: string) => {
    if (devise === 'USD') {
      return `$${montant.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    }
    return `${montant.toLocaleString()} FC`
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
        <Receipt className="h-12 w-12 text-gray-400 dark:text-gray-600" />
        <p className="mt-4 text-gray-500 dark:text-gray-400">Transaction non trouvée</p>
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

  const t = selectedTransaction
  const isEntree = t.type === 'entree'

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => router.push('/admin/finances/transactions')}
            className="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Détails de la transaction
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Référence: {t.id.substring(0, 8)}...
            </p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={() => router.push(`/admin/finances/transactions/${id}/modifier`)}
            className="dark:border-gray-700 dark:text-gray-300"
          >
            <Edit className="mr-2 h-4 w-4" />
            Modifier
          </Button>
          <Button
            variant="danger"
            onClick={() => setShowDeleteModal(true)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Supprimer
          </Button>
        </div>
      </div>

      {/* Badge de statut */}
      <div className="flex items-center space-x-3">
        <Badge 
          variant={isEntree ? 'success' : 'danger'} 
          size="lg"
          className="text-sm font-semibold"
        >
          {isEntree ? (
            <ArrowUpCircle className="mr-2 h-4 w-4" />
          ) : (
            <ArrowDownCircle className="mr-2 h-4 w-4" />
          )}
          {isEntree ? 'Entrée' : 'Sortie'}
        </Badge>
        <Badge variant={t.devise === 'USD' ? 'info' : 'warning'} size="lg">
          {t.devise || 'CDF'}
        </Badge>
      </div>

      {/* Informations principales */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Montant */}
        <Card className="p-6 dark:bg-gray-900 dark:border-gray-800">
          <div className="flex items-center space-x-3">
            <div className={`rounded-full p-3 ${isEntree ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}>
              <DollarSign className={`h-6 w-6 ${isEntree ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`} />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Montant</p>
              <p className={`text-2xl font-bold ${isEntree ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {formatMontant(t.montant, t.devise)}
              </p>
            </div>
          </div>
        </Card>

        {/* Date */}
        <Card className="p-6 dark:bg-gray-900 dark:border-gray-800">
          <div className="flex items-center space-x-3">
            <div className="rounded-full bg-blue-100 p-3 dark:bg-blue-900/30">
              <Calendar className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Date de la transaction</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {formatDate(t.dateTransaction)}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Informations détaillées */}
      <Card className="p-6 dark:bg-gray-900 dark:border-gray-800">
        <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
          Informations détaillées
        </h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* Catégorie */}
          <div className="flex items-start space-x-3">
            <div className="rounded-full bg-purple-100 p-2 dark:bg-purple-900/30">
              <Tag className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Catégorie</p>
              <p className="font-medium text-gray-900 dark:text-white">
                {t.categorie?.nom || '-'}
              </p>
              {t.categorie?.description && (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {t.categorie.description}
                </p>
              )}
            </div>
          </div>

          {/* Membre */}
          <div className="flex items-start space-x-3">
            <div className="rounded-full bg-green-100 p-2 dark:bg-green-900/30">
              <User className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Membre</p>
              <p className="font-medium text-gray-900 dark:text-white">
                {t.membre ? `${t.membre.prenom} ${t.membre.nom}` : '-'}
              </p>
            </div>
          </div>

          {/* Devise et taux */}
          <div className="flex items-start space-x-3">
            <div className="rounded-full bg-yellow-100 p-2 dark:bg-yellow-900/30">
              <Landmark className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Devise</p>
              <p className="font-medium text-gray-900 dark:text-white">
                {t.devise || 'CDF'}
              </p>
            </div>
          </div>

          {/* Créé par */}
          <div className="flex items-start space-x-3">
            <div className="rounded-full bg-gray-100 p-2 dark:bg-gray-800">
              <User className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Créé par</p>
              <p className="font-medium text-gray-900 dark:text-white">
                {t.createur?.email || 'Système'}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {formatDate(t.createdAt)}
              </p>
            </div>
          </div>
        </div>

        {/* Description */}
        {t.description && (
          <div className="mt-4 border-t border-gray-200 pt-4 dark:border-gray-700">
            <div className="flex items-start space-x-3">
              <div className="rounded-full bg-gray-100 p-2 dark:bg-gray-800">
                <FileText className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-500 dark:text-gray-400">Description</p>
                <p className="text-gray-900 dark:text-white whitespace-pre-wrap">
                  {t.description || 'Aucune description'}
                </p>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Actions rapides */}
      <Card className="p-4 dark:bg-gray-900 dark:border-gray-800">
        <div className="flex flex-wrap gap-3">
          <Button
            variant="outline"
            onClick={() => router.push(`/admin/finances/transactions/${id}/modifier`)}
            className="dark:border-gray-700 dark:text-gray-300"
          >
            <Edit className="mr-2 h-4 w-4" />
            Modifier
          </Button>
          <Button
            variant="danger"
            onClick={() => setShowDeleteModal(true)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Supprimer
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push('/admin/finances/transactions')}
            className="dark:border-gray-700 dark:text-gray-300"
          >
            Retour à la liste
          </Button>
        </div>
      </Card>

      {/* Modal suppression */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/70">
          <div className="w-full max-w-md rounded-lg bg-white p-6 dark:bg-gray-900">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Confirmer la suppression
            </h3>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Êtes-vous sûr de vouloir supprimer cette transaction ? Cette action est irréversible.
            </p>
            <div className="mt-6 flex justify-end space-x-3">
              <Button 
                variant="outline" 
                onClick={() => setShowDeleteModal(false)}
                className="dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                Annuler
              </Button>
              <Button variant="danger" onClick={handleDelete}>
                Supprimer
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}