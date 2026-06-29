// app/(dashboard)/secretaire/page.tsx
'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Users, UserPlus, UserCog, Building2, FileText, Download, Upload, Search, Mail, Phone, Calendar } from 'lucide-react'
import { StatsCard } from '@/components/dashboard'
import { Card, Button, Input, Badge, Table, Spinner } from '@/components/ui'
import { useMembers } from '@/hooks/useMembers'
import { useDepartementStore } from '@/store/departementStore'
import { useAuth } from '@/hooks/useAuth'
import { formatDate, formatPhoneNumber } from '@/utils/formatters'

export default function SecretaireDashboardPage() {
  const { user } = useAuth()
  const router = useRouter()
  const { members, total, isLoading, fetchMembers } = useMembers()
  const { departements, fetchDepartements } = useDepartementStore()

  useEffect(() => {
    fetchMembers({ limit: 5 })
    fetchDepartements()
  }, [])

  const recentMembers = members.slice(0, 5)
  const membresActifs = members.filter(m => m.statut === 'actif').length
  const nouveauxMois = members.filter(m => {
    const date = new Date(m.createdAt)
    const now = new Date()
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()
  }).length

  const columns = [
    {
      key: 'nom',
      header: 'Membre',
      cell: (m: any) => (
        <div>
          <p className="font-medium text-gray-900 dark:text-white">{m.prenom} {m.nom}</p>
          {m.email && (
            <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
              <Mail className="mr-1 h-3 w-3" />
              {m.email}
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'telephone',
      header: 'Contact',
      cell: (m: any) => (
        <span className="text-gray-700 dark:text-gray-300">
          {m.telephone ? formatPhoneNumber(m.telephone) : '-'}
        </span>
      ),
    },
    {
      key: 'statut',
      header: 'Statut',
      cell: (m: any) => (
        <Badge variant={m.statut === 'actif' ? 'success' : 'danger'}>
          {m.statut === 'actif' ? 'Actif' : 'Inactif'}
        </Badge>
      ),
    },
    {
      key: 'date',
      header: 'Inscription',
      cell: (m: any) => (
        <span className="text-gray-700 dark:text-gray-300">
          {formatDate(m.dateInscription)}
        </span>
      ),
    },
  ]

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* En-tête - Dark mode */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Tableau de bord - Secrétaire</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Bienvenue, {user?.nom || ''} ! Gérez les membres et les utilisateurs.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" className="dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800">
            <Upload className="mr-2 h-4 w-4" />
            Importer
          </Button>
          <Button variant="outline" className="dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800">
            <Download className="mr-2 h-4 w-4" />
            Exporter
          </Button>
          <Button onClick={() => router.push('/secretaire/membres/nouveau')}>
            <UserPlus className="mr-2 h-4 w-4" />
            Nouveau membre
          </Button>
        </div>
      </div>

      {/* Cartes statistiques - Dark mode */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Membres"
          value={total.toLocaleString()}
          icon={<Users className="h-5 w-5" />}
          color="primary"
        />
        <StatsCard
          title="Membres Actifs"
          value={membresActifs.toLocaleString()}
          icon={<Users className="h-5 w-5" />}
          color="success"
        />
        <StatsCard
          title="Nouveaux ce mois"
          value={nouveauxMois.toLocaleString()}
          icon={<Calendar className="h-5 w-5" />}
          color="info"
        />
        <StatsCard
          title="Départements"
          value={departements.length.toString()}
          icon={<Building2 className="h-5 w-5" />}
          color="warning"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Derniers membres inscrits - Dark mode */}
        <Card className="p-4 dark:bg-gray-900 dark:border-gray-800">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900 dark:text-white">Derniers membres inscrits</h3>
            <Button variant="ghost" size="sm" onClick={() => router.push('/secretaire/membres')} className="dark:text-gray-400 dark:hover:text-white">
              Voir tout
            </Button>
          </div>
          <Table
            columns={columns}
            data={recentMembers}
            isLoading={isLoading}
            emptyMessage="Aucun membre"
          />
        </Card>

        {/* Actions rapides - Dark mode */}
        <Card className="p-4 dark:bg-gray-900 dark:border-gray-800">
          <h3 className="mb-4 font-semibold text-gray-900 dark:text-white">Actions rapides</h3>
          <div className="space-y-3">
            <button
              onClick={() => router.push('/secretaire/membres')}
              className="flex w-full items-center justify-between rounded-lg border p-3 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800/50"
            >
              <span className="flex items-center text-gray-700 dark:text-gray-300">
                <Users className="mr-3 h-5 w-5 text-primary-600 dark:text-primary-400" />
                Gérer les membres
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">→</span>
            </button>
            <button
              onClick={() => router.push('/secretaire/membres/nouveau')}
              className="flex w-full items-center justify-between rounded-lg border p-3 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800/50"
            >
              <span className="flex items-center text-gray-700 dark:text-gray-300">
                <UserPlus className="mr-3 h-5 w-5 text-green-600 dark:text-green-400" />
                Ajouter un membre
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">→</span>
            </button>
            <button
              onClick={() => router.push('/secretaire/utilisateurs')}
              className="flex w-full items-center justify-between rounded-lg border p-3 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800/50"
            >
              <span className="flex items-center text-gray-700 dark:text-gray-300">
                <UserCog className="mr-3 h-5 w-5 text-blue-600 dark:text-blue-400" />
                Gérer les utilisateurs
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">→</span>
            </button>
            <button
              onClick={() => router.push('/secretaire/departements')}
              className="flex w-full items-center justify-between rounded-lg border p-3 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800/50"
            >
              <span className="flex items-center text-gray-700 dark:text-gray-300">
                <Building2 className="mr-3 h-5 w-5 text-purple-600 dark:text-purple-400" />
                Gérer les départements
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">→</span>
            </button>
          </div>
        </Card>
      </div>

      {/* Recherche rapide - Dark mode */}
      <Card className="p-4 dark:bg-gray-900 dark:border-gray-800">
        <h3 className="mb-4 font-semibold text-gray-900 dark:text-white">Rechercher un membre</h3>
        <div className="flex gap-2">
          <div className="flex-1">
            <Input
              placeholder="Nom, prénom ou email..."
              icon={<Search className="h-4 w-4" />}
              className="dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:placeholder-gray-400"
            />
          </div>
          <Button>Rechercher</Button>
        </div>
      </Card>
    </div>
  )
}