// app/(dashboard)/admin/utilisateurs/[id]/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { 
  ArrowLeft, 
  Mail, 
  User, 
  Shield, 
  Calendar, 
  Edit, 
  Trash2,
  UserCheck,
  UserX,
  Clock,
  Building2,
  Phone,
  AlertCircle
} from 'lucide-react'
import { Card, Button, Badge, Spinner } from '@/components/ui'
import { utilisateursAPI } from '@/lib/api'
import { ROLE_LABELS, ROLE_COLORS, ROLE_ICONS } from '@/lib/constants'
import { formatDate } from '@/utils/formatters'

interface Utilisateur {
  id: string
  email: string
  role: string
  actif: boolean
  membre?: {
    id: string
    nom: string
    prenom: string
    telephone?: string
    email?: string
    adresse?: string
    departement?: {
      id: string
      nom: string
    }
  }
  dernierConnexion?: string
  createdAt: string
  updatedAt?: string
}

export default function UtilisateurDetailPage() {
  const router = useRouter()
  const params = useParams()
  const id = params?.id as string
  
  const [utilisateur, setUtilisateur] = useState<Utilisateur | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showResetModal, setShowResetModal] = useState(false)
  const [newPassword, setNewPassword] = useState('')

  useEffect(() => {
    if (id) {
      fetchUtilisateur()
    }
  }, [id])

  const fetchUtilisateur = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await utilisateursAPI.getById(id)
      setUtilisateur(response.data.data)
    } catch (error: any) {
      console.error('Erreur:', error)
      setError(error.response?.data?.message || 'Erreur lors du chargement de l\'utilisateur')
    } finally {
      setIsLoading(false)
    }
  }

  const handleToggleActif = async () => {
    if (!utilisateur) return
    try {
      await utilisateursAPI.update(id, { actif: !utilisateur.actif })
      fetchUtilisateur()
    } catch (error: any) {
      alert(error.response?.data?.message || 'Erreur lors de la modification')
    }
  }

  const handleResetPassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      alert('Le mot de passe doit contenir au moins 6 caractères')
      return
    }
    try {
      await utilisateursAPI.resetPassword(id, newPassword)
      setShowResetModal(false)
      setNewPassword('')
      alert('Mot de passe réinitialisé avec succès')
    } catch (error: any) {
      alert(error.response?.data?.message || 'Erreur lors de la réinitialisation')
    }
  }

  const handleDelete = async () => {
    try {
      await utilisateursAPI.delete(id)
      setShowDeleteModal(false)
      router.push('/admin/utilisateurs')
    } catch (error: any) {
      alert(error.response?.data?.message || 'Erreur lors de la suppression')
    }
  }

  const getRoleBadgeVariant = (role: string) => {
    const variants: Record<string, string> = {
      administrateur: 'danger',
      pasteur: 'purple',
      tresorier: 'success',
      secretaire: 'info',
      chef_departement: 'warning',
    }
    return variants[role] || 'default'
  }

  const getRoleColor = (role: string) => {
    const colors: Record<string, string> = {
      administrateur: 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30',
      pasteur: 'text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/30',
      tresorier: 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30',
      secretaire: 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30',
      chef_departement: 'text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/30',
    }
    return colors[role] || 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800'
  }

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  if (error || !utilisateur) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <AlertCircle className="h-12 w-12 text-red-400 dark:text-red-500" />
        <p className="mt-4 text-gray-500 dark:text-gray-400">
          {error || 'Utilisateur non trouvé'}
        </p>
        <Button 
          variant="outline" 
          className="mt-4 dark:border-gray-700 dark:text-gray-300"
          onClick={() => router.push('/admin/utilisateurs')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour à la liste
        </Button>
      </div>
    )
  }

  const u = utilisateur
  const isCurrentUser = id === u.id // Pour ne pas pouvoir se supprimer soi-même

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => router.push('/admin/utilisateurs')}
            className="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {u.email}
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              ID: {u.id.substring(0, 8)}...
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={handleToggleActif}
            className={u.actif 
              ? 'border-orange-500 text-orange-600 hover:bg-orange-50 dark:border-orange-400 dark:text-orange-400 dark:hover:bg-orange-900/20' 
              : 'border-green-500 text-green-600 hover:bg-green-50 dark:border-green-400 dark:text-green-400 dark:hover:bg-green-900/20'
            }
          >
            {u.actif ? (
              <>
                <UserX className="mr-2 h-4 w-4" />
                Désactiver
              </>
            ) : (
              <>
                <UserCheck className="mr-2 h-4 w-4" />
                Activer
              </>
            )}
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowResetModal(true)}
            className="dark:border-gray-700 dark:text-gray-300"
          >
            <Shield className="mr-2 h-4 w-4" />
            Réinitialiser MDP
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push(`/admin/utilisateurs/${id}/modifier`)}
            className="dark:border-gray-700 dark:text-gray-300"
          >
            <Edit className="mr-2 h-4 w-4" />
            Modifier
          </Button>
          {!isCurrentUser && (
            <Button variant="danger" onClick={() => setShowDeleteModal(true)}>
              <Trash2 className="mr-2 h-4 w-4" />
              Supprimer
            </Button>
          )}
        </div>
      </div>

      {/* Badges */}
      <div className="flex flex-wrap gap-3">
        <Badge variant={getRoleBadgeVariant(u.role)} size="lg" className="text-sm">
          <Shield className="mr-2 h-4 w-4" />
          {ROLE_LABELS[u.role as keyof typeof ROLE_LABELS] || u.role}
        </Badge>
        <Badge variant={u.actif ? 'success' : 'danger'} size="lg" className="text-sm">
          {u.actif ? (
            <>
              <UserCheck className="mr-2 h-4 w-4" />
              Actif
            </>
          ) : (
            <>
              <UserX className="mr-2 h-4 w-4" />
              Inactif
            </>
          )}
        </Badge>
        {u.membre && (
          <Badge variant="info" size="lg" className="text-sm">
            <User className="mr-2 h-4 w-4" />
            {u.membre.prenom} {u.membre.nom}
          </Badge>
        )}
      </div>

      {/* Informations détaillées */}
      <Card className="p-6 dark:bg-gray-900 dark:border-gray-800">
        <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
          Informations détaillées
        </h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Email */}
          <div className="flex items-start space-x-3">
            <div className={`rounded-full p-2 ${getRoleColor(u.role)}`}>
              <Mail className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
              <p className="font-medium text-gray-900 dark:text-white">{u.email}</p>
            </div>
          </div>

          {/* Rôle */}
          <div className="flex items-start space-x-3">
            <div className={`rounded-full p-2 ${getRoleColor(u.role)}`}>
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Rôle</p>
              <p className="font-medium text-gray-900 dark:text-white">
                {ROLE_LABELS[u.role as keyof typeof ROLE_LABELS] || u.role}
              </p>
            </div>
          </div>

          {/* Statut */}
          <div className="flex items-start space-x-3">
            <div className={`rounded-full p-2 ${u.actif ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}>
              {u.actif ? (
                <UserCheck className="h-5 w-5 text-green-600 dark:text-green-400" />
              ) : (
                <UserX className="h-5 w-5 text-red-600 dark:text-red-400" />
              )}
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Statut</p>
              <p className={`font-medium ${u.actif ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {u.actif ? 'Actif' : 'Inactif'}
              </p>
            </div>
          </div>

          {/* Dernière connexion */}
          <div className="flex items-start space-x-3">
            <div className="rounded-full bg-yellow-100 p-2 dark:bg-yellow-900/30">
              <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Dernière connexion</p>
              <p className="font-medium text-gray-900 dark:text-white">
                {u.dernierConnexion ? formatDate(u.dernierConnexion) : 'Jamais'}
              </p>
            </div>
          </div>

          {/* Date de création */}
          <div className="flex items-start space-x-3">
            <div className="rounded-full bg-gray-100 p-2 dark:bg-gray-800">
              <Calendar className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Date de création</p>
              <p className="font-medium text-gray-900 dark:text-white">
                {formatDate(u.createdAt)}
              </p>
            </div>
          </div>

          {/* Date de mise à jour */}
          {u.updatedAt && (
            <div className="flex items-start space-x-3">
              <div className="rounded-full bg-gray-100 p-2 dark:bg-gray-800">
                <Calendar className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Dernière modification</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {formatDate(u.updatedAt)}
                </p>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Membre associé */}
      {u.membre && (
        <Card className="p-6 dark:bg-gray-900 dark:border-gray-800">
          <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
            Membre associé
          </h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="flex items-start space-x-3">
              <div className="rounded-full bg-indigo-100 p-2 dark:bg-indigo-900/30">
                <User className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Nom complet</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {u.membre.prenom} {u.membre.nom}
                </p>
              </div>
            </div>

            {u.membre.email && (
              <div className="flex items-start space-x-3">
                <div className="rounded-full bg-blue-100 p-2 dark:bg-blue-900/30">
                  <Mail className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                  <p className="font-medium text-gray-900 dark:text-white">{u.membre.email}</p>
                </div>
              </div>
            )}

            {u.membre.telephone && (
              <div className="flex items-start space-x-3">
                <div className="rounded-full bg-green-100 p-2 dark:bg-green-900/30">
                  <Phone className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Téléphone</p>
                  <p className="font-medium text-gray-900 dark:text-white">{u.membre.telephone}</p>
                </div>
              </div>
            )}

            {u.membre.departement && (
              <div className="flex items-start space-x-3">
                <div className="rounded-full bg-purple-100 p-2 dark:bg-purple-900/30">
                  <Building2 className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Département</p>
                  <p className="font-medium text-gray-900 dark:text-white">{u.membre.departement.nom}</p>
                </div>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Actions rapides */}
      <Card className="p-4 dark:bg-gray-900 dark:border-gray-800">
        <div className="flex flex-wrap gap-3">
          <Button
            variant="outline"
            onClick={() => router.push(`/admin/utilisateurs/${id}/modifier`)}
            className="dark:border-gray-700 dark:text-gray-300"
          >
            <Edit className="mr-2 h-4 w-4" />
            Modifier
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowResetModal(true)}
            className="dark:border-gray-700 dark:text-gray-300"
          >
            <Shield className="mr-2 h-4 w-4" />
            Réinitialiser MDP
          </Button>
          {!isCurrentUser && (
            <Button variant="danger" onClick={() => setShowDeleteModal(true)}>
              <Trash2 className="mr-2 h-4 w-4" />
              Supprimer
            </Button>
          )}
          <Button
            variant="outline"
            onClick={() => router.push('/admin/utilisateurs')}
            className="dark:border-gray-700 dark:text-gray-300"
          >
            Retour à la liste
          </Button>
        </div>
      </Card>

      {/* Modal reset password */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/70">
          <div className="w-full max-w-md rounded-lg bg-white p-6 dark:bg-gray-900">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Réinitialiser le mot de passe
            </h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Entrez le nouveau mot de passe pour <span className="font-medium">{u.email}</span>
            </p>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
              Minimum 6 caractères
            </p>
            <input
              type="password"
              placeholder="Nouveau mot de passe"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="mt-4 w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2 text-gray-900 dark:text-white focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
            <div className="mt-6 flex justify-end space-x-3">
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowResetModal(false)
                  setNewPassword('')
                }}
                className="dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                Annuler
              </Button>
              <Button onClick={handleResetPassword}>
                Réinitialiser
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal suppression */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/70">
          <div className="w-full max-w-md rounded-lg bg-white p-6 dark:bg-gray-900">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Confirmer la suppression
            </h3>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action est irréversible.
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