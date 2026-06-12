'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Search, Filter, Eye, Edit, Trash2, UserCog, Shield, UserCheck, UserX } from 'lucide-react'
import { Card, Button, Input, Select, Badge, Table, Pagination, Spinner } from '@/components/ui'
import { utilisateursAPI } from '@/lib/api'
import { useAuth } from '@/hooks/useAuth'
import { ROLE_LABELS } from '@/lib/constants'
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

export default function SecretaireUtilisateursPage() {
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

  const fetchUtilisateurs = async () => {
    setIsLoading(true)
    try {
      const response = await utilisateursAPI.getAll({ page, limit: 10, search, role: roleFilter })
      setUtilisateurs(response.data.data)
      setTotal(response.data.pagination?.total || 0)
      setPages(response.data.pagination?.pages || 1)
    } catch (error) {
      console.error('Erreur:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchUtilisateurs()
  }, [page, search, roleFilter])

  const handleResetPassword = async (id: string) => {
    if (!newPassword) return
    try {
      await utilisateursAPI.resetPassword(id, newPassword)
      setShowResetModal(null)
      setNewPassword('')
      alert('Mot de passe réinitialisé avec succès')
    } catch (error) {
      alert('Erreur lors de la réinitialisation')
    }
  }

  const handleToggleActif = async (id: string, actif: boolean) => {
    try {
      await utilisateursAPI.update(id, { actif: !actif })
      fetchUtilisateurs()
    } catch (error) {
      alert('Erreur lors de la modification')
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await utilisateursAPI.delete(id)
      fetchUtilisateurs()
      setShowDeleteModal(null)
    } catch (error) {
      alert('Erreur lors de la suppression')
    }
  }

  const columns = [
    {
      key: 'email',
      header: 'Email',
      cell: (u: Utilisateur) => (
        <div>
          <p className="font-medium">{u.email}</p>
          {u.membre && (
            <p className="text-sm text-gray-500">
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
        <Badge variant={
          u.role === 'administrateur' ? 'danger' :
          u.role === 'pasteur' ? 'purple' :
          u.role === 'tresorier' ? 'success' :
          u.role === 'secretaire' ? 'info' : 'warning'
        }>
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
      cell: (u: Utilisateur) => u.dernierConnexion ? formatDate(u.dernierConnexion) : 'Jamais',
    },
    {
      key: 'actions',
      header: 'Actions',
      cell: (u: Utilisateur) => (
        <div className="flex space-x-2">
          <button
            onClick={() => router.push(`/secretaire/utilisateurs/${u.id}`)}
            className="text-blue-600 hover:text-blue-800"
            title="Modifier"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleToggleActif(u.id, u.actif)}
            className={u.actif ? 'text-orange-600' : 'text-green-600'}
            title={u.actif ? 'Désactiver' : 'Activer'}
          >
            {u.actif ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
          </button>
          {u.id !== user?.id && (
            <button
              onClick={() => setShowResetModal(u.id)}
              className="text-purple-600 hover:text-purple-800"
              title="Réinitialiser mot de passe"
            >
              <Shield className="h-4 w-4" />
            </button>
          )}
          {u.id !== user?.id && (
            <button
              onClick={() => setShowDeleteModal(u.id)}
              className="text-red-600 hover:text-red-800"
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
    { value: '', label: 'Tous' },
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
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion des utilisateurs</h1>
          <p className="mt-1 text-sm text-gray-500">Gérez les accès à la plateforme</p>
        </div>
        <Button onClick={() => router.push('/secretaire/utilisateurs/nouveau')}>
          <Plus className="mr-2 h-4 w-4" />
          Nouvel utilisateur
        </Button>
      </div>

      {/* Filtres */}
      <Card className="p-4">
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="flex-1">
            <Input
              placeholder="Rechercher par email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              icon={<Search className="h-4 w-4" />}
            />
          </div>
          <div className="w-48">
            <Select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              options={roleOptions}
            />
          </div>
          <Button onClick={() => fetchUtilisateurs()}>
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
      />

      {/* Pagination */}
      {pages > 1 && (
        <div className="mt-4">
          <Pagination
            currentPage={page}
            totalPages={pages}
            onPageChange={setPage}
          />
        </div>
      )}

      {/* Modal reset password */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-lg bg-white p-6">
            <h3 className="text-lg font-semibold">Réinitialiser le mot de passe</h3>
            <p className="mt-2 text-sm text-gray-600">Entrez le nouveau mot de passe</p>
            <Input
              type="password"
              placeholder="Nouveau mot de passe"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="mt-4"
            />
            <div className="mt-6 flex justify-end space-x-3">
              <Button variant="outline" onClick={() => setShowResetModal(null)}>
                Annuler
              </Button>
              <Button onClick={() => handleResetPassword(showResetModal)}>
                Réinitialiser
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal suppression */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-lg bg-white p-6">
            <h3 className="text-lg font-semibold">Confirmer la suppression</h3>
            <p className="mt-2 text-gray-600">Cette action est irréversible.</p>
            <div className="mt-6 flex justify-end space-x-3">
              <Button variant="outline" onClick={() => setShowDeleteModal(null)}>
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