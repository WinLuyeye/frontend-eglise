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
      ? 'bg-green-100 text-green-800 border-green-200' 
      : 'bg-red-100 text-red-800 border-red-200'
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
        <DollarSign className="h-16 w-16 text-gray-300" />
        <p className="mt-4 text-gray-500">Transaction non trouvée</p>
        <Button onClick={() => router.push('/tresorier/transactions')} className="mt-4">
          Retour à la liste
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour
        </button>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={() => router.push(`/tresorier/transactions/${selectedTransaction.id}/modifier`)}
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

      {/* En-tête coloré selon le type */}
      <div className={`rounded-lg border p-6 ${getTypeColor(selectedTransaction.type)}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-4xl">{getTypeIcon(selectedTransaction.type)}</span>
            <div>
              <h1 className="text-2xl font-bold">
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

      {/* Grille d'informations */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Colonne gauche */}
        <div className="space-y-4">
          {/* Montant */}
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="rounded-full bg-primary-100 p-2">
                  <DollarSign className="h-5 w-5 text-primary-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Montant</p>
                  <p className={`text-2xl font-bold ${selectedTransaction.type === 'entree' ? 'text-green-600' : 'text-red-600'}`}>
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
              <div className="mt-2 text-xs text-gray-500 text-center border-t pt-2">
                Équivalent en CDF: {(selectedTransaction.montant * TAUX_CHANGE).toLocaleString()} FC
                <br />(Taux: 1 USD = {TAUX_CHANGE} CDF)
              </div>
            )}
          </Card>

          {/* Catégorie */}
          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="rounded-full bg-blue-100 p-2">
                <Tag className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Catégorie</p>
                <p className="font-medium">{selectedTransaction.categorie?.nom || 'Non catégorisé'}</p>
                {selectedTransaction.categorie?.description && (
                  <p className="text-sm text-gray-500">{selectedTransaction.categorie.description}</p>
                )}
              </div>
            </div>
          </Card>

          {/* Membre (si entrée) */}
          {selectedTransaction.membre && (
            <Card className="p-4">
              <div className="flex items-center space-x-3">
                <div className="rounded-full bg-green-100 p-2">
                  <User className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Membre</p>
                  <p className="font-medium">{selectedTransaction.membre.prenom} {selectedTransaction.membre.nom}</p>
                  {selectedTransaction.membre.telephone && (
                    <p className="text-sm text-gray-500">{selectedTransaction.membre.telephone}</p>
                  )}
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* Colonne droite */}
        <div className="space-y-4">
          {/* Description */}
          <Card className="p-4">
            <div className="flex items-start space-x-3">
              <div className="rounded-full bg-purple-100 p-2">
                <FileText className="h-5 w-5 text-purple-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-500">Description</p>
                <p className="text-gray-700">
                  {selectedTransaction.description || 'Aucune description'}
                </p>
              </div>
            </div>
          </Card>

          {/* Dates */}
          <Card className="p-4">
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="rounded-full bg-orange-100 p-2">
                  <Calendar className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Date de la transaction</p>
                  <p className="font-medium">{formatDate(selectedTransaction.dateTransaction)}</p>
                  <p className="text-xs text-gray-500">{formatDateTime(selectedTransaction.dateTransaction)}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 border-t pt-3">
                <div className="rounded-full bg-gray-100 p-2">
                  <Building2 className="h-5 w-5 text-gray-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Date d'enregistrement</p>
                  <p className="font-medium">{formatDate(selectedTransaction.createdAt)}</p>
                  <p className="text-xs text-gray-500">Créé par: {selectedTransaction.createur?.email || 'Inconnu'}</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Justificatif */}
          {selectedTransaction.justificatif && (
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="rounded-full bg-yellow-100 p-2">
                    <FileText className="h-5 w-5 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Justificatif</p>
                    <a
                      href={selectedTransaction.justificatif}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-600 hover:underline"
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

      {/* Informations supplémentaires */}
      <Card className="p-4">
        <div className="text-sm text-gray-500">
          <div className="flex justify-between border-b pb-2">
            <span>ID de transaction</span>
            <span className="font-mono text-xs">{selectedTransaction.id}</span>
          </div>
          <div className="flex justify-between pt-2">
            <span>Dernière modification</span>
            <span>{formatDateTime(selectedTransaction.updatedAt || selectedTransaction.createdAt)}</span>
          </div>
        </div>
      </Card>

      {/* Modal suppression */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-lg bg-white p-6">
            <div className="flex items-center space-x-3 text-red-600">
              <Trash2 className="h-6 w-6" />
              <h3 className="text-lg font-semibold">Confirmer la suppression</h3>
            </div>
            <p className="mt-2 text-gray-600">
              Êtes-vous sûr de vouloir supprimer cette transaction ?
            </p>
            <p className="mt-1 text-sm text-red-500">
              Cette action est irréversible.
            </p>
            <div className="mt-6 flex justify-end space-x-3">
              <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
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