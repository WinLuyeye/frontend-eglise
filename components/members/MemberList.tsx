'use client'

import { useState } from 'react'
import { Search, Filter, Plus, Download, Upload, MoreVertical, Eye, Edit, Trash2, UserCheck, UserX, Mail, Phone, MapPin } from 'lucide-react'
import { Card, Input, Button, Badge, Table, Pagination } from '@/components/ui'
import { Membre } from '@/types'
import { formatDate, formatPhoneNumber, getStatusBadgeColor, getStatusLabel } from '@/utils/formatters'
import { useRouter } from 'next/navigation'

interface MemberListProps {
  members: Membre[]
  total: number
  currentPage: number
  totalPages: number
  isLoading: boolean
  onPageChange: (page: number) => void
  onSearch: (search: string) => void
  onFilter: (filter: string) => void
  onDelete: (id: string) => void
  onExport?: () => void
  onImport?: () => void
  onView: (id: string) => void
  onEdit: (id: string) => void
}

const statusOptions = [
  { value: 'all', label: 'Tous les statuts' },
  { value: 'actif', label: 'Actifs' },
  { value: 'inactif', label: 'Inactifs' },
  { value: 'transfere', label: 'Transférés' },
]

export const MemberList = ({
  members,
  total,
  currentPage,
  totalPages,
  isLoading,
  onPageChange,
  onSearch,
  onFilter,
  onDelete,
  onExport,
  onImport,
  onView,
  onEdit,
}: MemberListProps) => {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedMember, setSelectedMember] = useState<Membre | null>(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  const handleSearch = () => {
    onSearch(searchTerm)
  }

  const handleStatusFilter = (value: string) => {
    setStatusFilter(value)
    onFilter(value === 'all' ? '' : value)
  }

  const handleDeleteClick = (member: Membre) => {
    setSelectedMember(member)
    setShowDeleteModal(true)
  }

  const confirmDelete = () => {
    if (selectedMember) {
      onDelete(selectedMember.id)
      setShowDeleteModal(false)
      setSelectedMember(null)
    }
  }

  const columns = [
    {
      key: 'nom',
      header: 'Membre',
      cell: (member: Membre) => (
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center dark:bg-primary-900">
            <span className="text-primary-600 font-semibold dark:text-primary-300">
              {member.prenom?.charAt(0)}{member.nom?.charAt(0)}
            </span>
          </div>
          <div>
            <p className="font-medium text-gray-900 dark:text-white">
              {member.prenom} {member.nom}
            </p>
            {member.email && (
              <div className="flex items-center text-xs text-gray-500">
                <Mail className="mr-1 h-3 w-3" />
                {member.email}
              </div>
            )}
          </div>
        </div>
      ),
    },
    {
      key: 'telephone',
      header: 'Contact',
      cell: (member: Membre) => (
        <div>
          {member.telephone && (
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
              <Phone className="mr-1 h-3 w-3" />
              {formatPhoneNumber(member.telephone)}
            </div>
          )}
          {member.adresse && (
            <div className="mt-1 flex items-center text-xs text-gray-500">
              <MapPin className="mr-1 h-3 w-3" />
              {member.adresse.length > 30 ? `${member.adresse.substring(0, 30)}...` : member.adresse}
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'departement',
      header: 'Département',
      cell: (member: Membre) => (
        <Badge variant="info" size="sm">
          {member.departement?.nom || 'Non assigné'}
        </Badge>
      ),
    },
    {
      key: 'statut',
      header: 'Statut',
      cell: (member: Membre) => (
        <Badge variant={member.statut === 'actif' ? 'success' : member.statut === 'inactif' ? 'danger' : 'warning'} size="sm">
          {getStatusLabel(member.statut)}
        </Badge>
      ),
    },
    {
      key: 'dateInscription',
      header: 'Date d\'inscription',
      cell: (member: Membre) => (
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {formatDate(member.dateInscription)}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      cell: (member: Membre) => (
        <div className="flex space-x-2">
          <button
            onClick={() => onView(member.id)}
            className="rounded-lg p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800"
            title="Voir"
          >
            <Eye className="h-4 w-4" />
          </button>
          <button
            onClick={() => onEdit(member.id)}
            className="rounded-lg p-1 text-blue-500 hover:bg-blue-50 hover:text-blue-700 dark:text-blue-400 dark:hover:bg-blue-900/20"
            title="Modifier"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleDeleteClick(member)}
            className="rounded-lg p-1 text-red-500 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-900/20"
            title="Supprimer"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ]

  if (isLoading && members.length === 0) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-10 w-full rounded bg-gray-200 dark:bg-gray-700" />
          <div className="h-64 w-full rounded bg-gray-200 dark:bg-gray-700" />
        </div>
      </Card>
    )
  }

  return (
    <>
      <Card className="p-4">
        {/* Barre d'outils */}
        <div className="mb-4 flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
          <div className="flex flex-1 space-x-2">
            <div className="flex-1 sm:max-w-xs">
              <Input
                placeholder="Rechercher un membre..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                icon={<Search className="h-4 w-4" />}
              />
            </div>
            <Button onClick={handleSearch} size="sm">
              Rechercher
            </Button>
          </div>
          
          <div className="flex space-x-2">
            <div className="w-40">
              <select
                value={statusFilter}
                onChange={(e) => handleStatusFilter(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800"
              >
                {statusOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            {onImport && (
              <Button variant="outline" size="sm" onClick={onImport}>
                <Upload className="mr-2 h-4 w-4" />
                Importer
              </Button>
            )}
            {onExport && (
              <Button variant="outline" size="sm" onClick={onExport}>
                <Download className="mr-2 h-4 w-4" />
                Exporter
              </Button>
            )}
            <Button size="sm" onClick={() => router.push('/admin/membres/nouveau')}>
              <Plus className="mr-2 h-4 w-4" />
              Nouveau membre
            </Button>
          </div>
        </div>

        {/* Tableau des membres */}
        <Table
          columns={columns}
          data={members}
          isLoading={isLoading}
          emptyMessage="Aucun membre trouvé"
        />

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-4">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={onPageChange}
            />
          </div>
        )}

        {/* Informations */}
        <div className="mt-4 text-center text-sm text-gray-500 dark:text-gray-400">
          Affichage de {members.length} membre(s) sur {total} total
        </div>
      </Card>

      {/* Modal de confirmation de suppression */}
      {showDeleteModal && selectedMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-lg bg-white p-6 dark:bg-gray-900">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Confirmer la suppression
            </h3>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Êtes-vous sûr de vouloir supprimer le membre{' '}
              <span className="font-medium">
                {selectedMember.prenom} {selectedMember.nom}
              </span> ?
              Cette action est irréversible.
            </p>
            <div className="mt-6 flex justify-end space-x-3">
              <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
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