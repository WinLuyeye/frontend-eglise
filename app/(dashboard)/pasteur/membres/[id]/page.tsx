// app/(dashboard)/pasteur/membres/[id]/page.tsx
'use client'

import { useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Mail, Phone, MapPin, Calendar, Building2, User } from 'lucide-react'
import { Card, Button, Badge, Spinner } from '@/components/ui'
import { useMembers } from '@/hooks/useMembers'
import { formatDate, formatPhoneNumber, getStatusLabel } from '@/utils/formatters'

export default function PasteurMembreDetailPage() {
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
        <Button onClick={() => router.push('/pasteur/membres')} className="mt-4">
          Retour à la liste
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="flex items-center text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour
        </button>
      </div>

      <Card className="p-6 dark:bg-gray-900 dark:border-gray-800">
        <div className="flex items-start space-x-4">
          <div className="h-20 w-20 rounded-full bg-primary-100 flex items-center justify-center dark:bg-primary-900/30">
            <span className="text-2xl font-bold text-primary-600 dark:text-primary-400">
              {selectedMember.prenom?.charAt(0)}{selectedMember.nom?.charAt(0)}
            </span>
          </div>
          <div className="flex-1">
            <div className="flex items-center flex-wrap gap-2">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {selectedMember.prenom} {selectedMember.nom}
              </h1>
              <Badge variant={selectedMember.statut === 'actif' ? 'success' : 'danger'}>
                {getStatusLabel(selectedMember.statut)}
              </Badge>
            </div>
            
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {selectedMember.email && (
                <div className="flex items-center text-gray-600 dark:text-gray-300">
                  <Mail className="mr-3 h-5 w-5 text-gray-400 dark:text-gray-500" />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Email</p>
                    <p>{selectedMember.email}</p>
                  </div>
                </div>
              )}
              {selectedMember.telephone && (
                <div className="flex items-center text-gray-600 dark:text-gray-300">
                  <Phone className="mr-3 h-5 w-5 text-gray-400 dark:text-gray-500" />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Téléphone</p>
                    <p>{formatPhoneNumber(selectedMember.telephone)}</p>
                  </div>
                </div>
              )}
              {selectedMember.departement && (
                <div className="flex items-center text-gray-600 dark:text-gray-300">
                  <Building2 className="mr-3 h-5 w-5 text-gray-400 dark:text-gray-500" />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Département</p>
                    <p className="dark:text-white">{selectedMember.departement.nom}</p>
                  </div>
                </div>
              )}
              <div className="flex items-center text-gray-600 dark:text-gray-300">
                <Calendar className="mr-3 h-5 w-5 text-gray-400 dark:text-gray-500" />
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Date d'inscription</p>
                  <p className="dark:text-white">{formatDate(selectedMember.dateInscription)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {selectedMember.adresse && (
          <div className="mt-6 border-t pt-4 dark:border-gray-700">
            <div className="flex items-start text-gray-600 dark:text-gray-300">
              <MapPin className="mr-3 h-5 w-5 flex-shrink-0 text-gray-400 dark:text-gray-500" />
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Adresse</p>
                <p className="dark:text-white">{selectedMember.adresse}</p>
              </div>
            </div>
          </div>
        )}

        {selectedMember.dateNaissance && (
          <div className="mt-4 border-t pt-4 dark:border-gray-700">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Né le <span className="text-gray-700 dark:text-gray-300">{formatDate(selectedMember.dateNaissance)}</span>
            </p>
          </div>
        )}
      </Card>
    </div>
  )
}