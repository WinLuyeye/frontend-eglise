'use client'

import { useEffect, useState } from 'react'
import { FileText, Users, Calendar, Plus, Eye, Edit, Trash2, Download, Building2, Clock } from 'lucide-react'
import { StatsCard } from '@/components/dashboard'
import { Card, Button, Badge, Table, Spinner } from '@/components/ui'
import { useRapportStore } from '@/store/rapportStore'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { formatDate } from '@/utils/formatters'

export default function ChefDepartementDashboardPage() {
  const { user } = useAuth()
  const router = useRouter()
  const { rapports, isLoading, fetchRapports, deleteRapport } = useRapportStore()
  const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null)

  useEffect(() => {
    fetchRapports({ limit: 10 })
  }, [])

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
          <p className="font-medium">{r.titre}</p>
          <p className="text-sm text-gray-500">{r.departement?.nom}</p>
        </div>
      ),
    },
    {
      key: 'periode',
      header: 'Période',
      cell: (r: any) => formatDate(r.periode),
    },
    {
      key: 'createdAt',
      header: 'Date',
      cell: (r: any) => formatDate(r.createdAt),
    },
    {
      key: 'actions',
      header: 'Actions',
      cell: (r: any) => (
        <div className="flex space-x-2">
          <button
            onClick={() => router.push(`/chef-departement/rapports/${r.id}`)}
            className="text-blue-600 hover:text-blue-800"
            title="Voir"
          >
            <Eye className="h-4 w-4" />
          </button>
          <button
            onClick={() => router.push(`/chef-departement/rapports/${r.id}/modifier`)}
            className="text-green-600 hover:text-green-800"
            title="Modifier"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={() => setShowDeleteModal(r.id)}
            className="text-red-600 hover:text-red-800"
            title="Supprimer"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
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
      {/* En-tête */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tableau de bord - Chef de Département</h1>
          <p className="mt-1 text-sm text-gray-500">
            Bienvenue, Chef {user?.nom || ''} ! Gérez les rapports de votre département.
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Exporter
          </Button>
          <Button onClick={() => router.push('/chef-departement/rapports/nouveau')}>
            <Plus className="mr-2 h-4 w-4" />
            Nouveau rapport
          </Button>
        </div>
      </div>

      {/* Cartes statistiques */}
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
        {/* Liste des rapports */}
        <div className="lg:col-span-2">
          <Card className="p-4">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Mes rapports</h3>
              <Button variant="ghost" size="sm" onClick={() => router.push('/chef-departement/rapports')}>
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

        {/* Actions rapides */}
        <Card className="p-4">
          <h3 className="mb-4 font-semibold text-gray-900">Actions rapides</h3>
          <div className="space-y-3">
            <button
              onClick={() => router.push('/chef-departement/rapports/nouveau')}
              className="flex w-full items-center justify-between rounded-lg border p-3 transition-colors hover:bg-gray-50"
            >
              <span className="flex items-center">
                <Plus className="mr-3 h-5 w-5 text-primary-600" />
                Nouveau rapport
              </span>
              <span className="text-sm text-gray-500">→</span>
            </button>
            <button
              onClick={() => router.push('/chef-departement/membres')}
              className="flex w-full items-center justify-between rounded-lg border p-3 transition-colors hover:bg-gray-50"
            >
              <span className="flex items-center">
                <Users className="mr-3 h-5 w-5 text-green-600" />
                Voir les membres
              </span>
              <span className="text-sm text-gray-500">→</span>
            </button>
            <button
              onClick={() => router.push('/chef-departement/rapports')}
              className="flex w-full items-center justify-between rounded-lg border p-3 transition-colors hover:bg-gray-50"
            >
              <span className="flex items-center">
                <FileText className="mr-3 h-5 w-5 text-blue-600" />
                Tous mes rapports
              </span>
              <span className="text-sm text-gray-500">→</span>
            </button>
          </div>
        </Card>
      </div>

      {/* Informations du département */}
      <Card className="border-l-4 border-primary-500 bg-primary-50 p-4">
        <div className="flex items-center space-x-2">
          <Building2 className="h-5 w-5 text-primary-600" />
          <h3 className="font-semibold text-gray-900">Votre département</h3>
        </div>
        <p className="mt-1 text-sm text-gray-600">
          Vous êtes responsable du département. N'oubliez pas de soumettre vos rapports mensuels.
        </p>
        <div className="mt-3 flex items-center text-sm text-gray-500">
          <Clock className="mr-2 h-4 w-4" />
          Prochain rapport à soumettre : fin du mois
        </div>
      </Card>

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