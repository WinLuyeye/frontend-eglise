// app/(dashboard)/admin/utilisateurs/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Plus, Search, Filter, Eye, Edit, Trash2, UserCog, 
  Shield, UserCheck, UserX, X, Users, User, Clock,
  ShieldCheck, KeyRound
} from 'lucide-react'
import { Card, Button, Input, Select, Badge, Table, Pagination, Spinner } from '@/components/ui'
import { utilisateursAPI } from '@/lib/api'
import { useAuth } from '@/hooks/useAuth'
import { ROLE_LABELS } from '@/lib/constants'
import { formatDate } from '@/utils/formatters'

// ✅ Définir le type des variantes du Badge
type BadgeVariant = 'secondary' | 'danger' | 'success' | 'warning' | 'info' | 'purple' | 'default'

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
  const [showFilters, setShowFilters] = useState(false)

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

  // ✅ Fonction corrigée avec le type BadgeVariant
  const getRoleBadgeVariant = (role: string): BadgeVariant => {
    const variants: Record<string, BadgeVariant> = {
      administrateur: 'danger',
      pasteur: 'purple',
      tresorier: 'success',
      secretaire: 'info',
      chef_departement: 'warning',
    }
    return variants[role] || 'secondary'
  }

  // Statistiques globales
  const totalUtilisateurs = utilisateurs.length
  const utilisateursActifs = utilisateurs.filter(u => u.actif).length
  const utilisateursInactifs = utilisateurs.filter(u => !u.actif).length
  const administrateurs = utilisateurs.filter(u => u.role === 'administrateur').length

  const columns = [
    {
      key: 'email',
      header: 'Email',
      cell: (u: Utilisateur) => (
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-lg bg-indigo-50 flex items-center justify-center dark:bg-indigo-950/30">
            <User className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <p className="font-medium text-gray-900 dark:text-white">{u.email}</p>
            {u.membre && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {u.membre.prenom} {u.membre.nom}
              </p>
            )}
          </div>
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
        <div className="flex items-center space-x-2">
          <div className={`h-2 w-2 rounded-full ${u.actif ? 'bg-emerald-500' : 'bg-red-500'}`} />
          <Badge variant={u.actif ? 'success' : 'danger'}>
            {u.actif ? 'Actif' : 'Inactif'}
          </Badge>
        </div>
      ),
    },
    {
      key: 'dernierConnexion',
      header: 'Dernière connexion',
      cell: (u: Utilisateur) => (
        <div className="flex items-center space-x-2">
          <Clock className="h-4 w-4 text-gray-400 dark:text-gray-500" />
          <span className="text-sm text-gray-700 dark:text-gray-300">
            {u.dernierConnexion ? formatDate(u.dernierConnexion) : 'Jamais'}
          </span>
        </div>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      cell: (u: Utilisateur) => (
        <div className="flex items-center space-x-1">
          <button
            onClick={() => router.push(`/admin/utilisateurs/${u.id}`)}
            className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 hover:text-indigo-600 transition-colors dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-indigo-400"
            title="Voir"
          >
            <Eye className="h-4 w-4" />
          </button>
          <button
            onClick={() => router.push(`/admin/utilisateurs/${u.id}/modifier`)}
            className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 hover:text-emerald-600 transition-colors dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-emerald-400"
            title="Modifier"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleToggleActif(u.id, u.actif)}
            className={`rounded-lg p-1.5 transition-colors ${
              u.actif 
                ? 'text-gray-500 hover:bg-gray-100 hover:text-amber-600 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-amber-400' 
                : 'text-gray-500 hover:bg-gray-100 hover:text-emerald-600 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-emerald-400'
            }`}
            title={u.actif ? 'Désactiver' : 'Activer'}
          >
            {u.actif ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
          </button>
          {u.id !== user?.id && (
            <button
              onClick={() => setShowResetModal(u.id)}
              className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 hover:text-purple-600 transition-colors dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-purple-400"
              title="Réinitialiser mot de passe"
            >
              <KeyRound className="h-4 w-4" />
            </button>
          )}
          {u.id !== user?.id && (
            <button
              onClick={() => setShowDeleteModal(u.id)}
              className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 hover:text-red-600 transition-colors dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-red-400"
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
        <div className="flex flex-col items-center space-y-4">
          <Spinner size="lg" className="text-indigo-600" />
          <p className="text-sm text-gray-500 dark:text-gray-400">Chargement des utilisateurs...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* En-tête avec style amélioré */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center space-x-3">
            <div className="rounded-lg bg-indigo-50 p-2.5 dark:bg-indigo-950/30">
              <Users className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Utilisateurs
              </h1>
              <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
                Gérez les accès à la plateforme
              </p>
            </div>
          </div>
        </div>
        <Button 
          onClick={() => router.push('/admin/utilisateurs/nouveau')}
          className="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600"
        >
          <Plus className="mr-2 h-4 w-4" />
          Nouvel utilisateur
        </Button>
      </div>

      {/* Cartes de statistiques */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <Card className="p-4 border-l-4 border-l-indigo-500 dark:border-l-indigo-400">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total utilisateurs</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalUtilisateurs}</p>
            </div>
            <div className="rounded-lg bg-indigo-100 p-3 dark:bg-indigo-900/30">
              <Users className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            </div>
          </div>
        </Card>

        <Card className="p-4 border-l-4 border-l-emerald-500 dark:border-l-emerald-400">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Actifs</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">{utilisateursActifs}</p>
            </div>
            <div className="rounded-lg bg-emerald-100 p-3 dark:bg-emerald-900/30">
              <UserCheck className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
        </Card>

        <Card className="p-4 border-l-4 border-l-red-500 dark:border-l-red-400">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Inactifs</p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">{utilisateursInactifs}</p>
            </div>
            <div className="rounded-lg bg-red-100 p-3 dark:bg-red-900/30">
              <UserX className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
          </div>
        </Card>

        <Card className="p-4 border-l-4 border-l-purple-500 dark:border-l-purple-400">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Administrateurs</p>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{administrateurs}</p>
            </div>
            <div className="rounded-lg bg-purple-100 p-3 dark:bg-purple-900/30">
              <Shield className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </Card>
      </div>

      {/* Filtres avec toggle */}
      <div className="flex gap-2">
        <Button 
          variant="outline" 
          onClick={() => setShowFilters(!showFilters)}
          className="border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700"
        >
          <Filter className="mr-2 h-4 w-4" />
          Filtres
        </Button>
        <Button 
          variant="outline" 
          onClick={fetchUtilisateurs} 
          className="border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700"
        >
          <Search className="mr-2 h-4 w-4" />
          Actualiser
        </Button>
      </div>

      {showFilters && (
        <Card className="p-4 animate-in slide-in-from-top-4 duration-200 dark:bg-gray-800/50">
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                <input
                  type="text"
                  placeholder="Rechercher par email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-10 pr-4 text-gray-900 placeholder-gray-400 focus:border-indigo-300 focus:outline-none focus:ring-1 focus:ring-indigo-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:placeholder-gray-500 dark:focus:border-indigo-500"
                />
                {search && (
                  <button
                    onClick={() => setSearch('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:text-gray-500 dark:hover:bg-gray-700 dark:hover:text-gray-300"
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
                className="dark:bg-gray-900 dark:border-gray-700 dark:text-white"
              />
            </div>
            {(search || roleFilter) && (
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearch('')
                  setRoleFilter('')
                }}
                className="border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700"
              >
                <X className="mr-2 h-4 w-4" />
                Réinitialiser
              </Button>
            )}
          </div>
        </Card>
      )}

      {/* Tableau amélioré */}
      <Table
        columns={columns}
        data={utilisateurs}
        isLoading={isLoading}
        emptyMessage={
          <div className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-gray-300 dark:text-gray-600" />
            <p className="mt-4 text-gray-500 dark:text-gray-400">Aucun utilisateur trouvé</p>
            <p className="text-sm text-gray-400 dark:text-gray-500">
              {search || roleFilter ? 'Essayez de modifier vos critères de recherche' : 'Créez votre premier utilisateur'}
            </p>
            {!search && !roleFilter && (
              <Button 
                onClick={() => router.push('/admin/utilisateurs/nouveau')}
                className="mt-4 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600"
              >
                <Plus className="mr-2 h-4 w-4" />
                Créer un utilisateur
              </Button>
            )}
          </div>
        }
        className="dark:bg-gray-900"
      />

      {/* Pagination améliorée */}
      {pages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Affichage de <span className="font-medium">{utilisateurs.length}</span> utilisateurs
          </div>
          <Pagination
            currentPage={page}
            totalPages={pages}
            onPageChange={setPage}
            className="dark:text-gray-300"
          />
        </div>
      )}

      {/* Modal reset password - Style amélioré */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md transform animate-in fade-in zoom-in-95 rounded-2xl bg-white p-6 shadow-2xl duration-200 dark:bg-gray-800">
            <div className="flex items-center space-x-3">
              <div className="rounded-full bg-purple-100 p-3 dark:bg-purple-900/30">
                <KeyRound className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Réinitialiser le mot de passe
              </h3>
            </div>
            
            <p className="mt-4 text-sm text-gray-600 dark:text-gray-300">
              Entrez le nouveau mot de passe pour cet utilisateur. 
              Le mot de passe doit contenir au moins 6 caractères.
            </p>
            
            <div className="mt-4">
              <Input
                type="password"
                placeholder="Nouveau mot de passe"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="dark:bg-gray-900 dark:border-gray-700 dark:text-white"
              />
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowResetModal(null)
                  setNewPassword('')
                }}
                className="border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700"
              >
                Annuler
              </Button>
              <Button 
                onClick={() => handleResetPassword(showResetModal)}
                className="bg-purple-600 hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600"
              >
                <KeyRound className="mr-2 h-4 w-4" />
                Réinitialiser
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal suppression - Style amélioré */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md transform animate-in fade-in zoom-in-95 rounded-2xl bg-white p-6 shadow-2xl duration-200 dark:bg-gray-800">
            <div className="flex items-center space-x-3">
              <div className="rounded-full bg-red-100 p-3 dark:bg-red-900/30">
                <Trash2 className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Confirmer la suppression
              </h3>
            </div>
            
            <p className="mt-4 text-sm text-gray-600 dark:text-gray-300">
              Êtes-vous sûr de vouloir supprimer cet utilisateur ? 
              Cette action est irréversible et supprimera toutes les données associées.
            </p>
            
            <div className="mt-6 flex justify-end space-x-3">
              <Button 
                variant="outline" 
                onClick={() => setShowDeleteModal(null)}
                className="border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700"
              >
                Annuler
              </Button>
              <Button 
                variant="danger" 
                onClick={() => handleDelete(showDeleteModal)}
                className="bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Supprimer
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}