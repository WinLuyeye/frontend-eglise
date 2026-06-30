// app/(dashboard)/chef-departement/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { FileText, Users, Calendar, Plus, Eye, Edit, Trash2, Download, Building2, Clock, User, Award } from 'lucide-react'
import { StatsCard } from '@/components/dashboard'
import { Card, Button, Table, Spinner } from '@/components/ui'
import { useRapportStore } from '@/store/rapportStore'
import { useDepartementStore } from '@/store/departementStore'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { formatDate } from '@/utils/formatters'

export default function ChefDepartementDashboardPage() {
  const { user } = useAuth()
  const router = useRouter()
  const { rapports, isLoading, fetchRapports, deleteRapport } = useRapportStore()
  const { departements, fetchDepartements } = useDepartementStore()
  const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null)
  const [departementNom, setDepartementNom] = useState<string>('')
  const [loadingDept, setLoadingDept] = useState(true)

  useEffect(() => {
    fetchRapports({ limit: 10 })
    fetchDepartements()
  }, [])

  // Trouver le nom du département du chef
  useEffect(() => {
    if (user?.membreId && departements.length > 0) {
      const dept = departements.find(d => d.responsableId === user.membreId)
      if (dept) {
        setDepartementNom(dept.nom)
      } else if (departements.length > 0) {
        setDepartementNom(departements[0].nom)
      }
      setLoadingDept(false)
    } else if (departements.length > 0) {
      setDepartementNom(departements[0].nom)
      setLoadingDept(false)
    } else {
      setLoadingDept(false)
    }
  }, [user, departements])

  const handleDelete = async (id: string) => {
    await deleteRapport(id)
    setShowDeleteModal(null)
  }

  const columns = [
    {
      key: 'titre',
      header: 'Titre',
      cell: (r: any) => (
        <div>
          <p className="font-medium text-gray-900 dark:text-white">{r.titre}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">{r.departement?.nom}</p>
        </div>
      ),
    },
    {
      key: 'periode',
      header: 'Période',
      cell: (r: any) => (
        <span className="text-gray-700 dark:text-gray-300">{formatDate(r.periode)}</span>
      ),
    },
    {
      key: 'createdAt',
      header: 'Date',
      cell: (r: any) => (
        <span className="text-gray-700 dark:text-gray-300">{formatDate(r.createdAt)}</span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      cell: (r: any) => (
        <div className="flex space-x-2">
          <button
            onClick={() => router.push(`/chef-departement/rapports/${r.id}`)}
            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
            title="Voir"
          >
            <Eye className="h-4 w-4" />
          </button>
          <button
            onClick={() => router.push(`/chef-departement/rapports/${r.id}/modifier`)}
            className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300"
            title="Modifier"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={() => setShowDeleteModal(r.id)}
            className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
            title="Supprimer"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ]

  if (isLoading || loadingDept) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  const chefNomComplet = user?.prenom && user?.nom 
    ? `${user.prenom} ${user.nom}` 
    : user?.nom || 'Chef de département'
  
  const deptFromRapports = rapports.length > 0 ? rapports[0].departement?.nom : null
  const displayDepartement = departementNom || deptFromRapports || 'votre département'

  let messageBienvenue = ''
  if (departementNom) {
    messageBienvenue = `Bonjour ${chefNomComplet}, vous êtes le chef du département ${departementNom}.`
  } else if (deptFromRapports) {
    messageBienvenue = `Bonjour ${chefNomComplet}, vous êtes le chef du département ${deptFromRapports}.`
  } else {
    messageBienvenue = `Bonjour ${chefNomComplet}, vous êtes le chef de votre département.`
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center space-x-3">
            <div className="rounded-full bg-primary-100 p-3 dark:bg-primary-900/30">
              <Award className="h-8 w-8 text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Tableau de bord - Chef de Département
              </h1>
              <div className="mt-2">
                <p className="text-base font-medium text-gray-800 dark:text-gray-200">
                  {messageBienvenue}
                </p>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  Gérez les rapports et les activités de votre département.
                </p>
              </div>
            </div>
          </div>
          {displayDepartement && (
            <div className="mt-3 inline-flex items-center rounded-full bg-primary-100 px-4 py-1.5 text-sm font-medium text-primary-700 dark:bg-primary-900/30 dark:text-primary-400">
              <Building2 className="mr-2 h-4 w-4" />
              Département : {displayDepartement}
            </div>
          )}
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" className="dark:border-gray-700 dark:text-gray-300">
            <Download className="mr-2 h-4 w-4" />
            Exporter
          </Button>
          <Button onClick={() => router.push('/chef-departement/rapports/nouveau')}>
            <Plus className="mr-2 h-4 w-4" />
            Nouveau rapport
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Rapports"
          value={rapports.length.toString()}
          icon={<FileText className="h-5 w-5" />}
          color="primary"
          isLoading={isLoading}
        />
        <StatsCard
          title="Rapports cette année"
          value={rapports.filter(r => new Date(r.createdAt).getFullYear() === new Date().getFullYear()).length.toString()}
          icon={<Calendar className="h-5 w-5" />}
          color="success"
          isLoading={isLoading}
        />
        <StatsCard
          title="Membres du département"
          value="0"
          icon={<Users className="h-5 w-5" />}
          color="info"
          isLoading={isLoading}
        />
        <StatsCard
          title="Dernier rapport"
          value={rapports[0] ? formatDate(rapports[0].createdAt) : '-'}
          icon={<FileText className="h-5 w-5" />}
          color="warning"
          isLoading={isLoading}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card className="p-4 dark:bg-gray-900 dark:border-gray-800">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900 dark:text-white">Mes rapports</h3>
              <Button variant="ghost" size="sm" onClick={() => router.push('/chef-departement/rapports')} className="dark:text-gray-400 dark:hover:text-white">
                Voir tout
              </Button>
            </div>
            <Table
              columns={columns}
              data={rapports.slice(0, 5)}
              isLoading={isLoading}
              emptyMessage="Aucun rapport"
            />
          </Card>
        </div>

        <Card className="p-4 dark:bg-gray-900 dark:border-gray-800">
          <h3 className="mb-4 font-semibold text-gray-900 dark:text-white">Actions rapides</h3>
          <div className="space-y-3">
            <button
              onClick={() => router.push('/chef-departement/rapports/nouveau')}
              className="flex w-full items-center justify-between rounded-lg border border-gray-200 bg-white p-3 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-gray-800"
            >
              <span className="flex items-center text-gray-700 dark:text-gray-300">
                <Plus className="mr-3 h-5 w-5 text-primary-600 dark:text-primary-400" />
                Nouveau rapport
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">→</span>
            </button>
            <button
              onClick={() => router.push('/chef-departement/membres')}
              className="flex w-full items-center justify-between rounded-lg border border-gray-200 bg-white p-3 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-gray-800"
            >
              <span className="flex items-center text-gray-700 dark:text-gray-300">
                <Users className="mr-3 h-5 w-5 text-green-600 dark:text-green-400" />
                Voir les membres
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">→</span>
            </button>
            <button
              onClick={() => router.push('/chef-departement/rapports')}
              className="flex w-full items-center justify-between rounded-lg border border-gray-200 bg-white p-3 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-gray-800"
            >
              <span className="flex items-center text-gray-700 dark:text-gray-300">
                <FileText className="mr-3 h-5 w-5 text-blue-600 dark:text-blue-400" />
                Tous mes rapports
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">→</span>
            </button>
          </div>
        </Card>
      </div>

      <Card className="border-l-4 border-primary-500 bg-primary-50 p-4 dark:border-primary-400 dark:bg-primary-950/30">
        <div className="flex items-center space-x-2">
          <Building2 className="h-5 w-5 text-primary-600 dark:text-primary-400" />
          <h3 className="font-semibold text-gray-900 dark:text-white">
            Votre département : {displayDepartement || 'Non assigné'}
          </h3>
        </div>
        <div className="mt-2 space-y-2">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {departementNom 
              ? `En tant que chef du département ${departementNom}, vous êtes responsable de la coordination des activités et de la soumission des rapports mensuels.`
              : `Vous êtes responsable de votre département. N'oubliez pas de soumettre vos rapports mensuels.`
            }
          </p>
          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
            <Clock className="mr-2 h-4 w-4" />
            Prochain rapport à soumettre : fin du mois
          </div>
          {chefNomComplet && (
            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
              <User className="mr-2 h-4 w-4" />
              Chef : {chefNomComplet}
            </div>
          )}
          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
            <FileText className="mr-2 h-4 w-4" />
            Total rapports soumis : {rapports.length}
          </div>
        </div>
      </Card>

      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/70">
          <div className="w-full max-w-md rounded-lg bg-white p-6 dark:bg-gray-900">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Confirmer la suppression</h3>
            <p className="mt-2 text-gray-600 dark:text-gray-400">Cette action est irréversible.</p>
            <div className="mt-6 flex justify-end space-x-3">
              <Button variant="outline" onClick={() => setShowDeleteModal(null)} className="dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800">
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