// app/(dashboard)/admin/utilisateurs/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Search, Filter, Eye, Edit, Trash2, UserCog, Shield, UserCheck, UserX, X } from 'lucide-react'
import { Card, Button, Input, Select, Badge, Table, Pagination, Spinner } from '@/components/ui'
import { utilisateursAPI } from '@/lib/api'
import { useAuth } from '@/hooks/useAuth'
import { ROLE_LABELS, ROLE_COLORS } from '@/lib/constants'
import { formatDate } from '@/utils/formatters'

interface Utilisateur {
  id: string
  email: string
  role: string
  actif: boolean
  membre?: {
    nom: string
    prenom: string
  }
  dernierConnexion?: string
  createdAt: string
}

export default function UtilisateursPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [utilisateurs, setUtilisateurs] = useState<Utilisateur[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [showResetModal, setShowResetModal] = useState<string | null>(null)
  const [newPassword, setNewPassword] = useState('')
  const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const fetchUtilisateurs = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await utilisateursAPI.getAll({ 
        page, 
        limit: 10, 
        search: search || undefined, 
        role: roleFilter || undefined 
      })
      setUtilisateurs(response.data.data || [])
      setTotal(response.data.pagination?.total || 0)
      setPages(response.data.pagination?.pages || 1)
    } catch (error: any) {
      console.error('Erreur:', error)
      setError(error.response?.data?.message || 'Erreur lors du chargement des utilisateurs')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchUtilisateurs()
  }, [page, search, roleFilter])

  const handleResetPassword = async (id: string) => {
    if (!newPassword || newPassword.length < 6) {
      alert('Le mot de passe doit contenir au moins 6 caractères')
      return
    }
    try {
      await utilisateursAPI.resetPassword(id, newPassword)
      setShowResetModal(null)
      setNewPassword('')
      alert('Mot de passe réinitialisé avec succès')
    } catch (error: any) {
      alert(error.response?.data?.message || 'Erreur lors de la réinitialisation')
    }
  }

  const handleToggleActif = async (id: string, actif: boolean) => {
    try {
      await utilisateursAPI.update(id, { actif: !actif })
      fetchUtilisateurs()
    } catch (error: any) {
      alert(error.response?.data?.message || 'Erreur lors de la modification')
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await utilisateursAPI.delete(id)
      fetchUtilisateurs()
      setShowDeleteModal(null)
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

  const columns = [
    {
      key: 'email',
      header: 'Email',
      cell: (u: Utilisateur) => (
        <div>
          <p className="font-medium text-gray-900 dark:text-white">{u.email}</p>
          {u.membre && (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {u.membre.prenom} {u.membre.nom}
            </p>
          )}
        </div>
      ),
    },
    {
      key: 'role',
      header: 'Rôle',
      cell: (u: Utilisateur) => (
        <Badge variant={getRoleBadgeVariant(u.role)}>
          {ROLE_LABELS[u.role as keyof typeof ROLE_LABELS] || u.role}
        </Badge>
      ),
    },
    {
      key: 'statut',
      header: 'Statut',
      cell: (u: Utilisateur) => (
        <Badge variant={u.actif ? 'success' : 'danger'}>
          {u.actif ? 'Actif' : 'Inactif'}
        </Badge>
      ),
    },
    {
      key: 'dernierConnexion',
      header: 'Dernière connexion',
      cell: (u: Utilisateur) => (
        <span className="text-gray-700 dark:text-gray-300">
          {u.dernierConnexion ? formatDate(u.dernierConnexion) : 'Jamais'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      cell: (u: Utilisateur) => (
        <div className="flex space-x-2">
          <button
            onClick={() => router.push(`/admin/utilisateurs/${u.id}`)}
            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
            title="Voir"
          >
            <Eye className="h-4 w-4" />
          </button>
          <button
            onClick={() => router.push(`/admin/utilisateurs/${u.id}/modifier`)}
            className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 transition-colors"
            title="Modifier"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleToggleActif(u.id, u.actif)}
            className={u.actif ? 'text-orange-600 hover:text-orange-800 dark:text-orange-400 dark:hover:text-orange-300' : 'text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300'}
            title={u.actif ? 'Désactiver' : 'Activer'}
          >
            {u.actif ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
          </button>
          {u.id !== user?.id && (
            <button
              onClick={() => setShowResetModal(u.id)}
              className="text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300 transition-colors"
              title="Réinitialiser mot de passe"
            >
              <Shield className="h-4 w-4" />
            </button>
          )}
          {u.id !== user?.id && (
            <button
              onClick={() => setShowDeleteModal(u.id)}
              className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition-colors"
              title="Supprimer"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      ),
    },
  ]

  const roleOptions = [
    { value: '', label: 'Tous les rôles' },
    { value: 'administrateur', label: 'Administrateur' },
    { value: 'pasteur', label: 'Pasteur' },
    { value: 'tresorier', label: 'Trésorier' },
    { value: 'secretaire', label: 'Secrétaire' },
    { value: 'chef_departement', label: 'Chef de département' },
  ]

  if (isLoading && utilisateurs.length === 0) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Gestion des utilisateurs
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Gérez les accès à la plateforme
          </p>
        </div>
        <Button onClick={() => router.push('/admin/utilisateurs/nouveau')}>
          <Plus className="mr-2 h-4 w-4" />
          Nouvel utilisateur
        </Button>
      </div>

      {/* Filtres */}
      <Card className="p-4 dark:bg-gray-900 dark:border-gray-800">
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
              <input
                type="text"
                placeholder="Rechercher par email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 py-2 pl-10 pr-4 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
          <div className="w-48">
            <Select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              options={roleOptions}
              className="dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            />
          </div>
          <Button variant="outline" onClick={fetchUtilisateurs} className="dark:border-gray-700 dark:text-gray-300">
            <Filter className="mr-2 h-4 w-4" />
            Filtrer
          </Button>
        </div>
      </Card>

      {/* Tableau */}
      <Table
        columns={columns}
        data={utilisateurs}
        isLoading={isLoading}
        emptyMessage="Aucun utilisateur trouvé"
        className="dark:bg-gray-900"
      />

      {/* Pagination */}
      {pages > 1 && (
        <div className="mt-4 dark:text-gray-300">
          <Pagination
            currentPage={page}
            totalPages={pages}
            onPageChange={setPage}          />
        </div>
      )}

      {/* Modal reset password - Dark mode */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/70">
          <div className="w-full max-w-md rounded-lg bg-white p-6 dark:bg-gray-900">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Réinitialiser le mot de passe
            </h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Entrez le nouveau mot de passe (minimum 6 caractères)
            </p>
            <Input
              type="password"
              placeholder="Nouveau mot de passe"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="mt-4 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            />
            <div className="mt-6 flex justify-end space-x-3">
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowResetModal(null)
                  setNewPassword('')
                }}
                className="dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                Annuler
              </Button>
              <Button onClick={() => handleResetPassword(showResetModal)}>
                Réinitialiser
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal suppression - Dark mode */}
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
                onClick={() => setShowDeleteModal(null)}
                className="dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                Annuler
              </Button>
              <Button variant="danger" onClick={() => handleDelete(showDeleteModal)}>
                Supprimer
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}