'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Edit, Trash2, Mail, Phone, MapPin, Calendar, Building2, User } from 'lucide-react'
import { Card, Button, Badge, Spinner } from '@/components/ui'
import { useMembers } from '@/hooks/useMembers'
import { formatDate, formatPhoneNumber, getStatusLabel } from '@/utils/formatters'

export default function SecretaireMembreDetailPage() {
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
    router.push('/secretaire/membres')
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
        <User className="h-16 w-16 text-gray-300" />
        <p className="mt-4 text-gray-500">Membre non trouvé</p>
        <Button onClick={() => router.push('/secretaire/membres')} className="mt-4">
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
            onClick={() => router.push(`/secretaire/membres/${selectedMember.id}/modifier`)}
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

      {/* Informations principales */}
      <Card className="p-6">
        <div className="flex items-start space-x-4">
          <div className="h-20 w-20 rounded-full bg-primary-100 flex items-center justify-center">
            <span className="text-2xl font-bold text-primary-600">
              {selectedMember.prenom?.charAt(0)}{selectedMember.nom?.charAt(0)}
            </span>
          </div>
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl font-bold">{selectedMember.prenom} {selectedMember.nom}</h1>
              <Badge variant={selectedMember.statut === 'actif' ? 'success' : 'danger'}>
                {getStatusLabel(selectedMember.statut)}
              </Badge>
            </div>
            
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {selectedMember.email && (
                <div className="flex items-center text-gray-600">
                  <Mail className="mr-3 h-5 w-5" />
                  <div>
                    <p className="text-xs text-gray-500">Email</p>
                    <p>{selectedMember.email}</p>
                  </div>
                </div>
              )}
              {selectedMember.telephone && (
                <div className="flex items-center text-gray-600">
                  <Phone className="mr-3 h-5 w-5" />
                  <div>
                    <p className="text-xs text-gray-500">Téléphone</p>
                    <p>{formatPhoneNumber(selectedMember.telephone)}</p>
                  </div>
                </div>
              )}
              {selectedMember.departement && (
                <div className="flex items-center text-gray-600">
                  <Building2 className="mr-3 h-5 w-5" />
                  <div>
                    <p className="text-xs text-gray-500">Département</p>
                    <p>{selectedMember.departement.nom}</p>
                  </div>
                </div>
              )}
              <div className="flex items-center text-gray-600">
                <Calendar className="mr-3 h-5 w-5" />
                <div>
                  <p className="text-xs text-gray-500">Date d'inscription</p>
                  <p>{formatDate(selectedMember.dateInscription)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {selectedMember.adresse && (
          <div className="mt-6 border-t pt-4">
            <div className="flex items-start text-gray-600">
              <MapPin className="mr-3 h-5 w-5 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-500">Adresse</p>
                <p>{selectedMember.adresse}</p>
              </div>
            </div>
          </div>
        )}

        {selectedMember.dateNaissance && (
          <div className="mt-4 border-t pt-4">
            <p className="text-sm text-gray-500">
              Né le {formatDate(selectedMember.dateNaissance)}
            </p>
          </div>
        )}
      </Card>

      {/* Modal suppression */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-lg bg-white p-6">
            <h3 className="text-lg font-semibold">Confirmer la suppression</h3>
            <p className="mt-2 text-gray-600">
              Êtes-vous sûr de vouloir supprimer le membre "{selectedMember.prenom} {selectedMember.nom}" ?
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