// app/(dashboard)/secretaire/membres/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Download, Upload, Search, Filter, Eye, Edit, Trash2, Mail, Phone } from 'lucide-react'
import { Card, Button, Input, Select, Badge, Table, Pagination, Spinner } from '@/components/ui'
import { useMembers } from '@/hooks/useMembers'
import { useDepartementStore } from '@/store/departementStore'
import { formatDate, formatPhoneNumber, getStatusLabel } from '@/utils/formatters'

export default function SecretaireMembresPage() {
  const router = useRouter()
  const { members, total, page, pages, isLoading, fetchMembers, deleteMember } = useMembers()
  const { departements, fetchDepartements } = useDepartementStore()
  
  const [search, setSearch] = useState('')
  const [statutFilter, setStatutFilter] = useState('')
  const [departementFilter, setDepartementFilter] = useState('')
  const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null)

  useEffect(() => {
    fetchDepartements()
    fetchMembers({ page, limit: 10, search, statut: statutFilter, departementId: departementFilter })
  }, [page, search, statutFilter, departementFilter])

  const handleDelete = async (id: string) => {
    await deleteMember(id)
    setShowDeleteModal(null)
  }

  const handleExport = () => {
    const headers = ['Nom', 'Prénom', 'Email', 'Téléphone', 'Statut', 'Département', "Date d'inscription"]
    const csvData = members.map(m => [
      m.nom,
      m.prenom,
      m.email || '',
      m.telephone || '',
      getStatusLabel(m.statut),
      m.departement?.nom || '',
      formatDate(m.dateInscription)
    ])
    
    const csvContent = [headers, ...csvData].map(row => row.join(',')).join('\n')
    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `membres_${formatDate(new Date())}.csv`)
    link.click()
    URL.revokeObjectURL(url)
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
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
              <Phone className="mr-1 h-3 w-3" />
              {formatPhoneNumber(m.telephone)}
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'departement',
      header: 'Département',
      cell: (m: any) => (
        <Badge variant="info" size="sm">
          {m.departement?.nom || '-'}
        </Badge>
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
        <span className="text-gray-700 dark:text-gray-300">
          {formatDate(m.dateInscription)}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      cell: (m: any) => (
        <div className="flex space-x-2">
          <button
            onClick={() => router.push(`/secretaire/membres/${m.id}`)}
            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
            title="Voir"
          >
            <Eye className="h-4 w-4" />
          </button>
          <button
            onClick={() => router.push(`/secretaire/membres/${m.id}/modifier`)}
            className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 transition-colors"
            title="Modifier"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={() => setShowDeleteModal(m.id)}
            className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition-colors"
            title="Supprimer"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ]

  const statutOptions = [
    { value: '', label: 'Tous' },
    { value: 'actif', label: 'Actifs' },
    { value: 'inactif', label: 'Inactifs' },
    { value: 'transfere', label: 'Transférés' },
  ]

  const departementOptions = [
    { value: '', label: 'Tous' },
    ...departements.map(d => ({ value: d.id, label: d.nom })),
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
      {/* En-tête - Dark mode */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Gestion des membres</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Gérez tous les membres de l'église</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleExport} className="dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800">
            <Download className="mr-2 h-4 w-4" />
            Exporter
          </Button>
          <Button onClick={() => router.push('/secretaire/membres/nouveau')}>
            <Plus className="mr-2 h-4 w-4" />
            Nouveau membre
          </Button>
        </div>
      </div>

      {/* Filtres - Dark mode */}
      <Card className="p-4 dark:bg-gray-900 dark:border-gray-800">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Input
            placeholder="Rechercher..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            icon={<Search className="h-4 w-4" />}
            className="dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:placeholder-gray-400"
          />
          <Select
            label="Statut"
            value={statutFilter}
            onChange={(e) => setStatutFilter(e.target.value)}
            options={statutOptions}
            className="dark:bg-gray-800 dark:border-gray-700 dark:text-white"
          />
          <Select
            label="Département"
            value={departementFilter}
            onChange={(e) => setDepartementFilter(e.target.value)}
            options={departementOptions}
            className="dark:bg-gray-800 dark:border-gray-700 dark:text-white"
          />
          <Button onClick={() => fetchMembers({ page: 1, search, statut: statutFilter, departementId: departementFilter })}>
            <Filter className="mr-2 h-4 w-4" />
            Filtrer
          </Button>
        </div>
      </Card>

      {/* Tableau */}
      <Table
        columns={columns}
        data={members}
        isLoading={isLoading}
        emptyMessage="Aucun membre trouvé"
      />

      {/* Pagination - Dark mode */}
      {pages > 1 && (
        <div className="mt-4">
          <Pagination
            currentPage={page}
            totalPages={pages}
            onPageChange={(p) => fetchMembers({ page: p })}
          />
        </div>
      )}

      {/* Modal suppression - Dark mode */}
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