// app/(dashboard)/tresorier/transactions/[id]/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Edit, Trash2, Calendar, Building2, User, DollarSign, Landmark, FileText, Tag } from 'lucide-react'
import { Card, Button, Badge, Spinner } from '@/components/ui'
import { useTransactions } from '@/hooks/useTransactions'
import { formatDate, formatDateTime } from '@/utils/formatters'

const TAUX_CHANGE = 2250

export default function TresorierTransactionDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { selectedTransaction, fetchTransactionById, deleteTransaction, isLoading } = useTransactions()
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  useEffect(() => {
    if (params.id) {
      fetchTransactionById(params.id as string)
    }
  }, [params.id])

  const handleDelete = async () => {
    await deleteTransaction(params.id as string)
    router.push('/tresorier/transactions')
  }

  const formatMontant = (montant: number, devise: string) => {
    if (devise === 'USD') {
      return `$${montant.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    }
    return `${montant.toLocaleString()} FC`
  }

  const getTypeColor = (type: string) => {
    return type === 'entree' 
      ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 border-green-200 dark:border-green-700' 
      : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400 border-red-200 dark:border-red-700'
  }

  const getTypeIcon = (type: string) => {
    return type === 'entree' ? '📥' : '📤'
  }

  const getDeviseIcon = (devise: string) => {
    return devise === 'USD' ? '💵' : '💰'
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
      <div className="flex h-96 flex-col items-center justify-center text-center">
        <DollarSign className="h-16 w-16 text-gray-300 dark:text-gray-600" />
        <p className="mt-4 text-gray-500 dark:text-gray-400">Transaction non trouvée</p>
        <Button onClick={() => router.push('/tresorier/transactions')} className="mt-4">
          Retour à la liste
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* En-tête - Dark mode */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="flex items-center text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour
        </button>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={() => router.push(`/tresorier/transactions/${selectedTransaction.id}/modifier`)}
            className="dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            <Edit className="mr-2 h-4 w-4" />
            Modifier
          </Button>
          <Button variant="danger" onClick={() => setShowDeleteModal(true)}>
            <Trash2 className="mr-2 h-4 w-4" />
            Supprimer
          </Button>
        </div>
      </div>

      {/* En-tête coloré selon le type - Dark mode */}
      <div className={`rounded-lg border p-6 ${getTypeColor(selectedTransaction.type)}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-4xl">{getTypeIcon(selectedTransaction.type)}</span>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {selectedTransaction.type === 'entree' ? 'Entrée' : 'Sortie'}
              </h1>
              <p className="text-sm opacity-80">
                Transaction #{selectedTransaction.id.slice(0, 8)}
              </p>
            </div>
          </div>
          <Badge variant={selectedTransaction.type === 'entree' ? 'success' : 'danger'} size="lg">
            {selectedTransaction.type === 'entree' ? 'ENTRÉE' : 'SORTIE'}
          </Badge>
        </div>
      </div>

      {/* Grille d'informations - Dark mode */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Colonne gauche */}
        <div className="space-y-4">
          {/* Montant */}
          <Card className="p-4 dark:bg-gray-900 dark:border-gray-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="rounded-full bg-primary-100 p-2 dark:bg-primary-900/30">
                  <DollarSign className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Montant</p>
                  <p className={`text-2xl font-bold ${selectedTransaction.type === 'entree' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    {formatMontant(selectedTransaction.montant, selectedTransaction.devise || 'CDF')}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <Badge variant={selectedTransaction.devise === 'USD' ? 'info' : 'warning'}>
                  {getDeviseIcon(selectedTransaction.devise || 'CDF')} {selectedTransaction.devise || 'CDF'}
                </Badge>
              </div>
            </div>
            {selectedTransaction.devise === 'USD' && (
              <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 text-center border-t pt-2 dark:border-gray-700">
                Équivalent en CDF: {(selectedTransaction.montant * TAUX_CHANGE).toLocaleString()} FC
                <br />(Taux: 1 USD = {TAUX_CHANGE} CDF)
              </div>
            )}
          </Card>

          {/* Catégorie */}
          <Card className="p-4 dark:bg-gray-900 dark:border-gray-800">
            <div className="flex items-center space-x-3">
              <div className="rounded-full bg-blue-100 p-2 dark:bg-blue-900/30">
                <Tag className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Catégorie</p>
                <p className="font-medium text-gray-900 dark:text-white">{selectedTransaction.categorie?.nom || 'Non catégorisé'}</p>
                {selectedTransaction.categorie?.description && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">{selectedTransaction.categorie.description}</p>
                )}
              </div>
            </div>
          </Card>

          {/* Membre (si entrée) */}
          {selectedTransaction.membre && (
            <Card className="p-4 dark:bg-gray-900 dark:border-gray-800">
              <div className="flex items-center space-x-3">
                <div className="rounded-full bg-green-100 p-2 dark:bg-green-900/30">
                  <User className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Membre</p>
                  <p className="font-medium text-gray-900 dark:text-white">{selectedTransaction.membre.prenom} {selectedTransaction.membre.nom}</p>
                  {selectedTransaction.membre.telephone && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">{selectedTransaction.membre.telephone}</p>
                  )}
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* Colonne droite */}
        <div className="space-y-4">
          {/* Description */}
          <Card className="p-4 dark:bg-gray-900 dark:border-gray-800">
            <div className="flex items-start space-x-3">
              <div className="rounded-full bg-purple-100 p-2 dark:bg-purple-900/30">
                <FileText className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-500 dark:text-gray-400">Description</p>
                <p className="text-gray-700 dark:text-gray-300">
                  {selectedTransaction.description || 'Aucune description'}
                </p>
              </div>
            </div>
          </Card>

          {/* Dates */}
          <Card className="p-4 dark:bg-gray-900 dark:border-gray-800">
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="rounded-full bg-orange-100 p-2 dark:bg-orange-900/30">
                  <Calendar className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Date de la transaction</p>
                  <p className="font-medium text-gray-900 dark:text-white">{formatDate(selectedTransaction.dateTransaction)}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{formatDateTime(selectedTransaction.dateTransaction)}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 border-t pt-3 dark:border-gray-700">
                <div className="rounded-full bg-gray-100 p-2 dark:bg-gray-800">
                  <Building2 className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Date d'enregistrement</p>
                  <p className="font-medium text-gray-900 dark:text-white">{formatDate(selectedTransaction.createdAt)}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Créé par: {selectedTransaction.createur?.email || 'Inconnu'}</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Justificatif */}
          {selectedTransaction.justificatif && (
            <Card className="p-4 dark:bg-gray-900 dark:border-gray-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="rounded-full bg-yellow-100 p-2 dark:bg-yellow-900/30">
                    <FileText className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Justificatif</p>
                    <a
                      href={selectedTransaction.justificatif}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-600 hover:underline dark:text-primary-400"
                    >
                      Voir le justificatif
                    </a>
                  </div>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Informations supplémentaires - Dark mode */}
      <Card className="p-4 dark:bg-gray-900 dark:border-gray-800">
        <div className="text-sm text-gray-500 dark:text-gray-400">
          <div className="flex justify-between border-b pb-2 dark:border-gray-700">
            <span>ID de transaction</span>
            <span className="font-mono text-xs text-gray-700 dark:text-gray-300">{selectedTransaction.id}</span>
          </div>
          <div className="flex justify-between pt-2">
            <span>Dernière modification</span>
            <span className="text-gray-700 dark:text-gray-300">{formatDateTime(selectedTransaction.updatedAt || selectedTransaction.createdAt)}</span>
          </div>
        </div>
      </Card>

      {/* Modal suppression - Dark mode */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/70">
          <div className="w-full max-w-md rounded-lg bg-white p-6 dark:bg-gray-900">
            <div className="flex items-center space-x-3 text-red-600 dark:text-red-400">
              <Trash2 className="h-6 w-6" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Confirmer la suppression</h3>
            </div>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Êtes-vous sûr de vouloir supprimer cette transaction ?
            </p>
            <p className="mt-1 text-sm text-red-500 dark:text-red-400">
              Cette action est irréversible.
            </p>
            <div className="mt-6 flex justify-end space-x-3">
              <Button variant="outline" onClick={() => setShowDeleteModal(false)} className="dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800">
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