'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Users, Search, Filter, Eye, Mail, Phone, MapPin, Building2 } from 'lucide-react'
import { Card, Button, Input, Select, Badge, Table, Pagination, Spinner } from '@/components/ui'
import { useMembers } from '@/hooks/useMembers'
import { useAuth } from '@/hooks/useAuth'
import { useDepartementStore } from '@/store/departementStore'
import { formatDate, formatPhoneNumber, getStatusLabel } from '@/utils/formatters'

export default function ChefDepartementMembresPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { members, total, page, pages, isLoading, fetchMembers } = useMembers()
  const { departements, fetchDepartements } = useDepartementStore()
  
  const [search, setSearch] = useState('')
  const [statutFilter, setStatutFilter] = useState('')
  const [departementNom, setDepartementNom] = useState<string>('')

  useEffect(() => {
    fetchDepartements()
    // Le backend filtre automatiquement les membres du département du chef
    fetchMembers({ page, limit: 20, search, statut: statutFilter })
  }, [page, search, statutFilter])

  // Trouver le nom du département du chef
  useEffect(() => {
    if (user?.membreId && departements.length > 0) {
      const dept = departements.find(d => d.responsableId === user.membreId)
      if (dept) {
        setDepartementNom(dept.nom)
      }
    }
  }, [user, departements])

  const handleSearch = () => {
    fetchMembers({ page: 1, limit: 20, search, statut: statutFilter })
  }

  const columns = [
    {
      key: 'membre',
      header: 'Membre',
      cell: (m: any) => (
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center dark:bg-primary-900/30">
            <span className="text-primary-600 font-semibold dark:text-primary-400">
              {m.prenom?.charAt(0)}{m.nom?.charAt(0)}
            </span>
          </div>
          <div>
            <p className="font-medium text-gray-900 dark:text-white">{m.prenom} {m.nom}</p>
            {m.email && (
              <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                <Mail className="mr-1 h-3 w-3" />
                {m.email}
              </div>
            )}
          </div>
        </div>
      ),
    },
    {
      key: 'contact',
      header: 'Contact',
      cell: (m: any) => (
        <div>
          {m.telephone && (
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
              <Phone className="mr-1 h-3 w-3" />
              {formatPhoneNumber(m.telephone)}
            </div>
          )}
          {m.adresse && (
            <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mt-1">
              <MapPin className="mr-1 h-3 w-3" />
              <span className="truncate max-w-[150px] dark:text-gray-400">{m.adresse}</span>
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'statut',
      header: 'Statut',
      cell: (m: any) => (
        <Badge variant={m.statut === 'actif' ? 'success' : 'danger'} size="sm">
          {getStatusLabel(m.statut)}
        </Badge>
      ),
    },
    {
      key: 'dateInscription',
      header: 'Inscription',
      cell: (m: any) => (
        <span className="text-gray-700 dark:text-gray-300">{formatDate(m.dateInscription)}</span>
      ),
    },
    {
      key: 'actions',
      header: '',
      cell: (m: any) => (
        <button
          onClick={() => router.push(`/chef-departement/membres/${m.id}`)}
          className="rounded-lg p-1 text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-950/50"
          title="Voir détails"
        >
          <Eye className="h-4 w-4" />
        </button>
      ),
    },
  ]

  const statutOptions = [
    { value: '', label: 'Tous' },
    { value: 'actif', label: 'Actifs' },
    { value: 'inactif', label: 'Inactifs' },
    { value: 'transfere', label: 'Transférés' },
  ]

  if (isLoading && members.length === 0) {
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
          <div className="flex items-center space-x-3">
            <Users className="h-6 w-6 text-primary-600 dark:text-primary-400" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Membres du département
              </h1>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                Consultez la liste des membres de votre département
              </p>
            </div>
          </div>
          {/* Affichage du département */}
          {departementNom && (
            <div className="mt-2 inline-flex items-center rounded-full bg-primary-100 px-3 py-1 text-sm font-medium text-primary-700 dark:bg-primary-900/30 dark:text-primary-400">
              <Building2 className="mr-1.5 h-4 w-4" />
              {departementNom}
            </div>
          )}
        </div>
      </div>

      {/* Filtres */}
      <Card className="p-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="relative">
            <Input
              placeholder="Rechercher un membre..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              icon={<Search className="h-4 w-4" />}
              className="text-gray-900 dark:text-white"
            />
          </div>
          <Select
            label="Statut"
            value={statutFilter}
            onChange={(e) => setStatutFilter(e.target.value)}
            options={statutOptions}
          />
          <div className="flex items-end">
            <Button onClick={handleSearch} className="w-full">
              <Filter className="mr-2 h-4 w-4" />
              Filtrer
            </Button>
          </div>
        </div>
      </Card>

      {/* Statistiques */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total membres</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{total}</p>
            </div>
            <Users className="h-8 w-8 text-primary-500 dark:text-primary-400" />
          </div>
        </Card>
        <Card className="p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Membres actifs</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {members.filter(m => m.statut === 'actif').length}
              </p>
            </div>
            <Users className="h-8 w-8 text-green-500 dark:text-green-400" />
          </div>
        </Card>
        <Card className="p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Nouveaux ce mois</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {members.filter(m => {
                  const date = new Date(m.createdAt)
                  const now = new Date()
                  return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()
                }).length}
              </p>
            </div>
            <Users className="h-8 w-8 text-blue-500 dark:text-blue-400" />
          </div>
        </Card>
        <Card className="p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Taux d'activité</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {total > 0 ? Math.round((members.filter(m => m.statut === 'actif').length / total) * 100) : 0}%
              </p>
            </div>
            <Users className="h-8 w-8 text-purple-500 dark:text-purple-400" />
          </div>
        </Card>
      </div>

      {/* Tableau */}
      <Table
        columns={columns}
        data={members}
        isLoading={isLoading}
        emptyMessage="Aucun membre trouvé dans votre département"
      />

      {/* Pagination */}
      {pages > 1 && (
        <div className="mt-4">
          <Pagination
            currentPage={page}
            totalPages={pages}
            onPageChange={(p) => fetchMembers({ page: p })}
          />
        </div>
      )}

      {/* Information du département */}
      {departementNom && (
        <Card className="border-l-4 border-primary-500 bg-primary-50 p-4 dark:border-primary-400 dark:bg-primary-950/30">
          <div className="flex items-center space-x-2">
            <Building2 className="h-5 w-5 text-primary-600 dark:text-primary-400" />
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Département : {departementNom}
            </h3>
          </div>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Vous êtes le chef de ce département. Vous pouvez consulter tous les membres qui y sont affiliés.
          </p>
          <div className="mt-2 flex items-center text-sm text-gray-500 dark:text-gray-400">
            <Users className="mr-2 h-4 w-4" />
            {total} membre(s) au total
          </div>
        </Card>
      )}
    </div>
  )
}