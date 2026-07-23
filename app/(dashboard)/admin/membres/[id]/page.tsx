'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Edit, Trash2, Mail, Phone, MapPin, Calendar, Building2, User, CreditCard, Wallet } from 'lucide-react'
import { Card, Button, Badge, Spinner } from '@/components/ui'
import { useMembers } from '@/hooks/useMembers'
import { formatDate, formatPhoneNumber, getStatusLabel } from '@/utils/formatters'
import { Transaction } from '@/types'

export default function AdminMembreDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { selectedMember, fetchMemberById, deleteMember, isLoading } = useMembers()
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  useEffect(() => {
    if (params.id) {
      fetchMemberById(params.id as string)
    }
  }, [params.id])

  const handleDelete = async () => {
    await deleteMember(params.id as string)
    router.push('/admin/membres')
  }

  // ✅ CORRIGÉ: Gérer les types string | number
  const formatMontant = (montant: number | string | undefined, devise: string) => {
    // Convertir en nombre si c'est une string
    const montantNum = typeof montant === 'string' ? parseFloat(montant) : (montant || 0)
    
    if (devise === 'USD') {
      return `$${montantNum.toLocaleString()}`
    }
    return `${montantNum.toLocaleString()} FC`
  }

  // Palette de couleurs professionnelle et minimaliste
  const getStatusColor = (statut: string) => {
    const colors = {
      actif: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300',
      inactif: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
      suspendu: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300',
      'en attente': 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300'
    }
    return colors[statut as keyof typeof colors] || colors.inactif
  }

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  if (!selectedMember) {
    return (
      <div className="flex h-96 flex-col items-center justify-center text-center">
        <User className="h-16 w-16 text-gray-300 dark:text-gray-600" />
        <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">Membre non trouvé</h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Ce membre n'existe pas ou a été supprimé</p>
        <Button onClick={() => router.push('/admin/membres')} className="mt-4">
          Retour à la liste
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <button
          onClick={() => router.back()}
          className="flex items-center text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour
        </button>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => router.push(`/admin/membres/${selectedMember.id}/modifier`)}>
            <Edit className="mr-2 h-4 w-4" />
            Modifier
          </Button>
          <Button variant="danger" onClick={() => setShowDeleteModal(true)}>
            <Trash2 className="mr-2 h-4 w-4" />
            Supprimer
          </Button>
        </div>
      </div>

      {/* Carte principale - design épuré */}
      <Card className="p-6 dark:bg-gray-800/50">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
          {/* Avatar */}
          <div className="flex-shrink-0">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700">
              <span className="text-xl font-semibold text-gray-700 dark:text-gray-300">
                {selectedMember.prenom?.charAt(0)}{selectedMember.nom?.charAt(0)}
              </span>
            </div>
          </div>

          {/* Informations */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white truncate">
                {selectedMember.prenom} {selectedMember.nom}
              </h1>
              <Badge className={getStatusColor(selectedMember.statut)}>
                {getStatusLabel(selectedMember.statut)}
              </Badge>
            </div>
            
            {/* Grille d'informations */}
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {selectedMember.email && (
                <div className="flex items-center text-gray-600 dark:text-gray-300">
                  <Mail className="mr-3 h-4 w-4 text-gray-400 dark:text-gray-500" />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Email</p>
                    <p className="text-sm">{selectedMember.email}</p>
                  </div>
                </div>
              )}
              
              {selectedMember.telephone && (
                <div className="flex items-center text-gray-600 dark:text-gray-300">
                  <Phone className="mr-3 h-4 w-4 text-gray-400 dark:text-gray-500" />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Téléphone</p>
                    <p className="text-sm">{formatPhoneNumber(selectedMember.telephone)}</p>
                  </div>
                </div>
              )}

              {selectedMember.departement && (
                <div className="flex items-center text-gray-600 dark:text-gray-300">
                  <Building2 className="mr-3 h-4 w-4 text-gray-400 dark:text-gray-500" />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Département</p>
                    <p className="text-sm">{selectedMember.departement.nom}</p>
                  </div>
                </div>
              )}

              <div className="flex items-center text-gray-600 dark:text-gray-300">
                <Calendar className="mr-3 h-4 w-4 text-gray-400 dark:text-gray-500" />
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Inscription</p>
                  <p className="text-sm">{formatDate(selectedMember.dateInscription)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Informations supplémentaires */}
        {(selectedMember.adresse || selectedMember.dateNaissance) && (
          <div className="mt-6 grid gap-4 border-t border-gray-200 pt-6 dark:border-gray-700 sm:grid-cols-2">
            {selectedMember.adresse && (
              <div className="flex items-start text-gray-600 dark:text-gray-300">
                <MapPin className="mr-3 h-4 w-4 flex-shrink-0 text-gray-400 dark:text-gray-500" />
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Adresse</p>
                  <p className="text-sm">{selectedMember.adresse}</p>
                </div>
              </div>
            )}

            {selectedMember.dateNaissance && (
              <div className="flex items-start text-gray-600 dark:text-gray-300">
                <User className="mr-3 h-4 w-4 flex-shrink-0 text-gray-400 dark:text-gray-500" />
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Date de naissance</p>
                  <p className="text-sm">{formatDate(selectedMember.dateNaissance)}</p>
                </div>
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Transactions - design épuré */}
      {selectedMember.transactions && selectedMember.transactions.length > 0 && (
        <Card className="p-6 dark:bg-gray-800/50">
          <div className="mb-4 flex items-center justify-between border-b border-gray-200 pb-4 dark:border-gray-700">
            <div className="flex items-center">
              <Wallet className="mr-2 h-5 w-5 text-gray-500 dark:text-gray-400" />
              <h3 className="font-semibold text-gray-900 dark:text-white">Transactions récentes</h3>
            </div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {selectedMember.transactions.length}
            </span>
          </div>
          
          <div className="space-y-3">
            {selectedMember.transactions.map((transaction: Transaction) => (
              <div key={transaction.id} className="flex items-center justify-between border-b border-gray-100 pb-3 last:border-0 last:pb-0 dark:border-gray-700/50">
                <div className="flex items-center space-x-3">
                  <CreditCard className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {transaction.categorie?.nom || 'Transaction'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {formatDate(transaction.dateTransaction)}
                    </p>
                  </div>
                </div>
                <p className={`text-sm font-semibold ${
                  transaction.type === 'entree' 
                    ? 'text-green-600 dark:text-green-400' 
                    : 'text-red-600 dark:text-red-400'
                }`}>
                  {transaction.type === 'entree' ? '+' : '-'} {formatMontant(transaction.montant, transaction.devise || 'CDF')}
                </p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Modal suppression - design épuré */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-lg bg-white p-6 dark:bg-gray-800">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Confirmer la suppression
            </h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
              Êtes-vous sûr de vouloir supprimer le membre{' '}
              <span className="font-semibold text-gray-900 dark:text-white">
                {selectedMember.prenom} {selectedMember.nom}
              </span>
              ?
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