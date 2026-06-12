'use client'

import { useState } from 'react'
import { Eye, Edit, Trash2, Mail, Phone, MapPin, Calendar, Building2, UserCheck, UserX, MoreVertical } from 'lucide-react'
import { Card, Badge, Button } from '@/components/ui'
import { Membre } from '@/types'
import { formatDate, formatPhoneNumber, formatRelativeDate, getStatusLabel } from '@/utils/formatters'

interface MemberCardProps {
  member: Membre
  onView: (id: string) => void
  onEdit: (id: string) => void
  onDelete: (id: string) => void
  variant?: 'default' | 'compact' | 'detailed'
}

export const MemberCard = ({ member, onView, onEdit, onDelete, variant = 'default' }: MemberCardProps) => {
  const [showMenu, setShowMenu] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const handleDelete = () => {
    setShowDeleteConfirm(true)
    setShowMenu(false)
  }

  const confirmDelete = () => {
    onDelete(member.id)
    setShowDeleteConfirm(false)
  }

  const getInitials = () => {
    return `${member.prenom?.charAt(0) || ''}${member.nom?.charAt(0) || ''}`.toUpperCase()
  }

  // Utiliser dateInscription ou createdAt selon ce qui est disponible
  const inscriptionDate = (member as any).dateInscription || member.createdAt

  if (variant === 'compact') {
    return (
      <>
        <div className="flex items-center justify-between rounded-lg border p-3 transition-all hover:shadow-md">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
              <span className="text-primary-600 font-semibold">
                {getInitials()}
              </span>
            </div>
            <div>
              <p className="font-medium text-gray-900">
                {member.prenom} {member.nom}
              </p>
              <div className="flex items-center space-x-2 text-xs text-gray-500">
                {member.email && (
                  <span className="flex items-center">
                    <Mail className="mr-1 h-3 w-3" />
                    {member.email}
                  </span>
                )}
                {member.telephone && (
                  <span className="flex items-center">
                    <Phone className="mr-1 h-3 w-3" />
                    {formatPhoneNumber(member.telephone)}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant={member.statut === 'actif' ? 'success' : member.statut === 'inactif' ? 'danger' : 'warning'} size="sm">
              {getStatusLabel(member.statut)}
            </Badge>
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="rounded-lg p-1 hover:bg-gray-100"
              >
                <MoreVertical className="h-4 w-4" />
              </button>
              {showMenu && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
                  <div className="absolute right-0 z-20 mt-1 w-32 rounded-lg border bg-white py-1 shadow-lg">
                    <button
                      onClick={() => { onView(member.id); setShowMenu(false) }}
                      className="flex w-full items-center px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <Eye className="mr-2 h-3 w-3" />
                      Voir
                    </button>
                    <button
                      onClick={() => { onEdit(member.id); setShowMenu(false) }}
                      className="flex w-full items-center px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50"
                    >
                      <Edit className="mr-2 h-3 w-3" />
                      Modifier
                    </button>
                    <button
                      onClick={handleDelete}
                      className="flex w-full items-center px-3 py-1.5 text-sm text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="mr-2 h-3 w-3" />
                      Supprimer
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Modal de confirmation compact */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="w-full max-w-sm rounded-lg bg-white p-4">
              <h3 className="font-semibold">Confirmer</h3>
              <p className="mt-1 text-sm text-gray-600">
                Supprimer {member.prenom} {member.nom} ?
              </p>
              <div className="mt-4 flex justify-end space-x-2">
                <Button size="sm" variant="outline" onClick={() => setShowDeleteConfirm(false)}>
                  Annuler
                </Button>
                <Button size="sm" variant="danger" onClick={confirmDelete}>
                  Supprimer
                </Button>
              </div>
            </div>
          </div>
        )}
      </>
    )
  }

  if (variant === 'detailed') {
    return (
      <>
        <Card className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-4">
              <div className="h-16 w-16 rounded-full bg-primary-100 flex items-center justify-center">
                <span className="text-2xl font-bold text-primary-600">
                  {getInitials()}
                </span>
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {member.prenom} {member.nom}
                  </h3>
                  <Badge variant={member.statut === 'actif' ? 'success' : member.statut === 'inactif' ? 'danger' : 'warning'}>
                    {getStatusLabel(member.statut)}
                  </Badge>
                </div>
                
                <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {member.email && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Mail className="mr-2 h-4 w-4" />
                      {member.email}
                    </div>
                  )}
                  {member.telephone && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Phone className="mr-2 h-4 w-4" />
                      {formatPhoneNumber(member.telephone)}
                    </div>
                  )}
                  {member.departement && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Building2 className="mr-2 h-4 w-4" />
                      {member.departement.nom}
                    </div>
                  )}
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="mr-2 h-4 w-4" />
                    Inscrit le {formatDate(inscriptionDate)}
                  </div>
                </div>

                {member.adresse && (
                  <div className="mt-3 flex items-start text-sm text-gray-600">
                    <MapPin className="mr-2 mt-0.5 h-4 w-4 flex-shrink-0" />
                    <span>{member.adresse}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex space-x-2">
              <button
                onClick={() => onView(member.id)}
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
                title="Voir"
              >
                <Eye className="h-4 w-4" />
              </button>
              <button
                onClick={() => onEdit(member.id)}
                className="rounded-lg p-2 text-blue-500 hover:bg-blue-50"
                title="Modifier"
              >
                <Edit className="h-4 w-4" />
              </button>
              <button
                onClick={handleDelete}
                className="rounded-lg p-2 text-red-500 hover:bg-red-50"
                title="Supprimer"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>

          {member.dateNaissance && (
            <div className="mt-4 border-t pt-3">
              <p className="text-xs text-gray-500">
                Né le {formatDate(member.dateNaissance)} ({formatRelativeDate(member.dateNaissance)})
              </p>
            </div>
          )}
        </Card>

        {/* Modal de confirmation */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="w-full max-w-md rounded-lg bg-white p-6">
              <h3 className="text-lg font-semibold">
                Confirmer la suppression
              </h3>
              <p className="mt-2 text-gray-600">
                Êtes-vous sûr de vouloir supprimer le membre{' '}
                <span className="font-medium">{member.prenom} {member.nom}</span> ?
              </p>
              <div className="mt-6 flex justify-end space-x-3">
                <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
                  Annuler
                </Button>
                <Button variant="danger" onClick={confirmDelete}>
                  Supprimer
                </Button>
              </div>
            </div>
          </div>
        )}
      </>
    )
  }

  // Variant 'default'
  return (
    <>
      <Card className="p-4 transition-all hover:shadow-md">
        <div className="flex flex-col space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center">
                <span className="text-primary-600 font-semibold">
                  {getInitials()}
                </span>
              </div>
              <div>
                <p className="font-semibold text-gray-900">
                  {member.prenom} {member.nom}
                </p>
                {member.departement && (
                  <p className="text-sm text-gray-500">
                    {member.departement.nom}
                  </p>
                )}
              </div>
            </div>
            <Badge variant={member.statut === 'actif' ? 'success' : member.statut === 'inactif' ? 'danger' : 'warning'}>
              {getStatusLabel(member.statut)}
            </Badge>
          </div>

          <div className="space-y-1">
            {member.email && (
              <div className="flex items-center text-sm text-gray-600">
                <Mail className="mr-2 h-3 w-3 flex-shrink-0" />
                <span className="truncate">{member.email}</span>
              </div>
            )}
            {member.telephone && (
              <div className="flex items-center text-sm text-gray-600">
                <Phone className="mr-2 h-3 w-3 flex-shrink-0" />
                {formatPhoneNumber(member.telephone)}
              </div>
            )}
            {member.adresse && (
              <div className="flex items-start text-sm text-gray-600">
                <MapPin className="mr-2 mt-0.5 h-3 w-3 flex-shrink-0" />
                <span className="line-clamp-2">{member.adresse}</span>
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-2 pt-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onView(member.id)}
              className="text-gray-600"
            >
              <Eye className="mr-1 h-3 w-3" />
              Voir
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onEdit(member.id)}
              className="text-blue-600"
            >
              <Edit className="mr-1 h-3 w-3" />
              Modifier
            </Button>
          </div>
        </div>
      </Card>

      {/* Modal de confirmation */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-lg bg-white p-6">
            <h3 className="text-lg font-semibold">
              Confirmer la suppression
            </h3>
            <p className="mt-2 text-gray-600">
              Êtes-vous sûr de vouloir supprimer le membre{' '}
              <span className="font-medium">{member.prenom} {member.nom}</span> ?
            </p>
            <div className="mt-6 flex justify-end space-x-3">
              <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
                Annuler
              </Button>
              <Button variant="danger" onClick={confirmDelete}>
                Supprimer
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}