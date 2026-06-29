// app/(dashboard)/pasteur/membres/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Filter, Users, Download, Eye, Mail, Phone, MapPin } from 'lucide-react'
import { Card, Button, Input, Select, Badge, Table, Pagination, Spinner } from '@/components/ui'
import { useMembers } from '@/hooks/useMembers'
import { useDepartementStore } from '@/store/departementStore'
import { formatDate, formatPhoneNumber, getStatusLabel } from '@/utils/formatters'

export default function PasteurMembresPage() {
  const router = useRouter()
  const { members, total, page, pages, isLoading, fetchMembers } = useMembers()
  const { departements, fetchDepartements } = useDepartementStore()
  
  const [search, setSearch] = useState('')
  const [statutFilter, setStatutFilter] = useState('')
  const [departementFilter, setDepartementFilter] = useState('')

  useEffect(() => {
    fetchDepartements()
    fetchMembers({ page, limit: 20, search, statut: statutFilter, departementId: departementFilter })
  }, [page, search, statutFilter, departementFilter])

  const handleSearch = () => {
    fetchMembers({ page: 1, limit: 20, search, statut: statutFilter, departementId: departementFilter })
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
          {m.adresse && (
            <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mt-1">
              <MapPin className="mr-1 h-3 w-3" />
              <span className="truncate max-w-[150px]">{m.adresse}</span>
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
        <Badge variant={m.statut === 'actif' ? 'success' : m.statut === 'inactif' ? 'danger' : 'warning'} size="sm">
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
      header: '',
      cell: (m: any) => (
        <button
          onClick={() => router.push(`/pasteur/membres/${m.id}`)}
          className="rounded-lg p-1 text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20 transition-colors"
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
      {/* En-tête */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Liste des membres
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Consultez l'annuaire des membres de l'église
          </p>
        </div>
        <Button 
          variant="outline" 
          onClick={handleExport}
          className="dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
        >
          <Download className="mr-2 h-4 w-4" />
          Exporter
        </Button>
      </div>

      {/* Filtres */}
      <Card className="p-4 dark:bg-gray-900 dark:border-gray-800">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="relative">
            <Input
              placeholder="Rechercher..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              icon={<Search className="h-4 w-4" />}
              className="dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:placeholder-gray-400"
            />
          </div>
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
          <div className="flex items-end">
            <Button onClick={handleSearch} className="w-full">
              <Filter className="mr-2 h-4 w-4" />
              Filtrer
            </Button>
          </div>
        </div>
      </Card>

      {/* Statistiques - Dark mode */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-3 dark:bg-gray-900 dark:border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total membres</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{total}</p>
            </div>
            <Users className="h-8 w-8 text-primary-500 dark:text-primary-400" />
          </div>
        </Card>
        <Card className="p-3 dark:bg-gray-900 dark:border-gray-800">
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
        <Card className="p-3 dark:bg-gray-900 dark:border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Départements</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{departements.length}</p>
            </div>
            <Users className="h-8 w-8 text-blue-500 dark:text-blue-400" />
          </div>
        </Card>
        <Card className="p-3 dark:bg-gray-900 dark:border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Affichage</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{members.length}</p>
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
    </div>
  )
}