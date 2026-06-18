'use client'

import { useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Mail, Phone, MapPin, Calendar, Building2, User } from 'lucide-react'
import { Card, Button, Badge, Spinner } from '@/components/ui'
import { useMembers } from '@/hooks/useMembers'
import { formatDate, formatPhoneNumber, getStatusLabel } from '@/utils/formatters'

export default function ChefDepartementMembreDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { selectedMember, fetchMemberById, isLoading } = useMembers()

  useEffect(() => {
    if (params.id) {
      fetchMemberById(params.id as string)
    }
  }, [params.id])

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
        <p className="mt-4 text-gray-500 dark:text-gray-400">Membre non trouvé</p>
        <Button onClick={() => router.push('/chef-departement/membres')} className="mt-4">
          Retour à la liste
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Bouton retour */}
      <button
        onClick={() => router.back()}
        className="flex items-center text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors duration-200"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Retour
      </button>

      {/* Carte principale */}
      <Card className="p-6 dark:bg-gray-900 dark:border-gray-800">
        <div className="flex items-start space-x-4">
          {/* Avatar */}
          <div className="h-20 w-20 rounded-full bg-primary-100 flex items-center justify-center dark:bg-primary-900/30 flex-shrink-0">
            <span className="text-2xl font-bold text-primary-600 dark:text-primary-400">
              {selectedMember.prenom?.charAt(0)}{selectedMember.nom?.charAt(0)}
            </span>
          </div>
          
          <div className="flex-1 min-w-0">
            {/* Nom et statut */}
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {selectedMember.prenom} {selectedMember.nom}
              </h1>
              <Badge variant={selectedMember.statut === 'actif' ? 'success' : 'danger'}>
                {getStatusLabel(selectedMember.statut)}
              </Badge>
            </div>
            
            {/* Informations de contact */}
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {selectedMember.email && (
                <div className="flex items-center text-gray-600 dark:text-gray-300">
                  <Mail className="mr-3 h-5 w-5 flex-shrink-0 text-gray-400 dark:text-gray-500" />
                  <div className="min-w-0">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Email</p>
                    <p className="truncate">{selectedMember.email}</p>
                  </div>
                </div>
              )}
              
              {selectedMember.telephone && (
                <div className="flex items-center text-gray-600 dark:text-gray-300">
                  <Phone className="mr-3 h-5 w-5 flex-shrink-0 text-gray-400 dark:text-gray-500" />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Téléphone</p>
                    <p>{formatPhoneNumber(selectedMember.telephone)}</p>
                  </div>
                </div>
              )}
              
              {selectedMember.departement && (
                <div className="flex items-center text-gray-600 dark:text-gray-300">
                  <Building2 className="mr-3 h-5 w-5 flex-shrink-0 text-gray-400 dark:text-gray-500" />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Département</p>
                    <p className="font-medium text-primary-600 dark:text-primary-400">
                      {selectedMember.departement.nom}
                    </p>
                  </div>
                </div>
              )}
              
              <div className="flex items-center text-gray-600 dark:text-gray-300">
                <Calendar className="mr-3 h-5 w-5 flex-shrink-0 text-gray-400 dark:text-gray-500" />
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Date d'inscription</p>
                  <p>{formatDate(selectedMember.dateInscription)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Adresse */}
        {selectedMember.adresse && (
          <div className="mt-6 border-t border-gray-100 pt-4 dark:border-gray-800">
            <div className="flex items-start text-gray-600 dark:text-gray-300">
              <MapPin className="mr-3 h-5 w-5 flex-shrink-0 text-gray-400 dark:text-gray-500" />
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Adresse</p>
                <p>{selectedMember.adresse}</p>
              </div>
            </div>
          </div>
        )}

        {/* Date de naissance */}
        {selectedMember.dateNaissance && (
          <div className="mt-4 border-t border-gray-100 pt-4 dark:border-gray-800">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Né le {formatDate(selectedMember.dateNaissance)}
            </p>
          </div>
        )}

        {/* Informations supplémentaires */}
        <div className="mt-4 border-t border-gray-100 pt-4 dark:border-gray-800">
          <div className="grid grid-cols-1 gap-2 text-sm text-gray-500 dark:text-gray-400 sm:grid-cols-2">
            <div>
              <span className="font-medium">ID membre :</span> {selectedMember.id}
            </div>
            <div>
              <span className="font-medium">Statut :</span>{' '}
              <Badge variant={selectedMember.statut === 'actif' ? 'success' : 'danger'} size="sm">
                {getStatusLabel(selectedMember.statut)}
              </Badge>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}