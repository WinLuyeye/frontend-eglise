// app/(dashboard)/pasteur/rapports/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { FileText, Building2, Calendar, Eye, Search, Filter, Download } from 'lucide-react'
import { Card, Button, Input, Select, Badge, Table, Pagination, Spinner } from '@/components/ui'
import { useRapportStore } from '@/store/rapportStore'
import { useDepartementStore } from '@/store/departementStore'
import { formatDate } from '@/utils/formatters'

export default function PasteurRapportsPage() {
  const router = useRouter()
  const { rapports, total, page, pages, isLoading, fetchRapports } = useRapportStore()
  const { departements, fetchDepartements } = useDepartementStore()
  
  const [search, setSearch] = useState('')
  const [departementFilter, setDepartementFilter] = useState('')
  const [periodeDebut, setPeriodeDebut] = useState('')
  const [periodeFin, setPeriodeFin] = useState('')

  useEffect(() => {
    fetchDepartements()
    fetchRapports({ 
      page, 
      limit: 20, 
      search, 
      departementId: departementFilter,
      periodeDebut,
      periodeFin
    })
  }, [page, search, departementFilter, periodeDebut, periodeFin])

  const handleSearch = () => {
    fetchRapports({ page: 1, limit: 20, search, departementId: departementFilter, periodeDebut, periodeFin })
  }

  const handleExport = () => {
    const headers = ['Titre', 'Département', 'Période', 'Date création']
    const csvData = rapports.map(r => [
      r.titre,
      r.departement?.nom || '',
      formatDate(r.periode),
      formatDate(r.createdAt)
    ])
    
    const csvContent = [headers, ...csvData].map(row => row.join(',')).join('\n')
    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `rapports_${formatDate(new Date())}.csv`)
    link.click()
    URL.revokeObjectURL(url)
  }

  const columns = [
    {
      key: 'titre',
      header: 'Titre',
      cell: (r: any) => (
        <div>
          <p className="font-medium text-gray-900 dark:text-white">{r.titre}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">{formatDate(r.createdAt)}</p>
        </div>
      ),
    },
    {
      key: 'departement',
      header: 'Département',
      cell: (r: any) => (
        <Badge variant="info" size="sm">
          {r.departement?.nom || '-'}
        </Badge>
      ),
    },
    {
      key: 'periode',
      header: 'Période',
      cell: (r: any) => (
        <div className="flex items-center space-x-1 text-gray-700 dark:text-gray-300">
          <Calendar className="h-3 w-3 text-gray-400 dark:text-gray-500" />
          <span>{formatDate(r.periode)}</span>
        </div>
      ),
    },
    {
      key: 'actions',
      header: '',
      cell: (r: any) => (
        <button
          onClick={() => router.push(`/pasteur/rapports/${r.id}`)}
          className="rounded-lg p-1 text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20 transition-colors"
        >
          <Eye className="h-4 w-4" />
        </button>
      ),
    },
  ]

  const departementOptions = [
    { value: '', label: 'Tous les départements' },
    ...departements.map(d => ({ value: d.id, label: d.nom })),
  ]

  if (isLoading && rapports.length === 0) {
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Rapports départementaux</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Consultez les rapports des différents départements</p>
        </div>
        <Button variant="outline" onClick={handleExport} className="dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800">
          <Download className="mr-2 h-4 w-4" />
          Exporter
        </Button>
      </div>

      {/* Filtres - Dark mode */}
      <Card className="p-4 dark:bg-gray-900 dark:border-gray-800">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="relative">
            <Input
              placeholder="Rechercher un rapport..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              icon={<Search className="h-4 w-4" />}
              className="dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:placeholder-gray-400"
            />
          </div>
          <Select
            label="Département"
            value={departementFilter}
            onChange={(e) => setDepartementFilter(e.target.value)}
            options={departementOptions}
            className="dark:bg-gray-800 dark:border-gray-700 dark:text-white"
          />
          <Input
            label="Période début"
            type="month"
            value={periodeDebut}
            onChange={(e) => setPeriodeDebut(e.target.value)}
            className="dark:bg-gray-800 dark:border-gray-700 dark:text-white"
          />
          <Input
            label="Période fin"
            type="month"
            value={periodeFin}
            onChange={(e) => setPeriodeFin(e.target.value)}
            className="dark:bg-gray-800 dark:border-gray-700 dark:text-white"
          />
        </div>
        <div className="mt-4 flex justify-end">
          <Button onClick={handleSearch}>
            <Filter className="mr-2 h-4 w-4" />
            Appliquer les filtres
          </Button>
        </div>
      </Card>

      {/* Statistiques - Dark mode */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-3 dark:bg-gray-900 dark:border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total rapports</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{total}</p>
            </div>
            <FileText className="h-8 w-8 text-primary-500 dark:text-primary-400" />
          </div>
        </Card>
        <Card className="p-3 dark:bg-gray-900 dark:border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Départements</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{departements.length}</p>
            </div>
            <Building2 className="h-8 w-8 text-blue-500 dark:text-blue-400" />
          </div>
        </Card>
        <Card className="p-3 dark:bg-gray-900 dark:border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Ce mois</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {rapports.filter(r => {
                  const date = new Date(r.createdAt)
                  const now = new Date()
                  return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()
                }).length}
              </p>
            </div>
            <Calendar className="h-8 w-8 text-green-500 dark:text-green-400" />
          </div>
        </Card>
        <Card className="p-3 dark:bg-gray-900 dark:border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Dernier rapport</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {rapports[0] ? formatDate(rapports[0].createdAt) : '-'}
              </p>
            </div>
            <FileText className="h-8 w-8 text-purple-500 dark:text-purple-400" />
          </div>
        </Card>
      </div>

      {/* Tableau */}
      <Table
        columns={columns}
        data={rapports}
        isLoading={isLoading}
        emptyMessage="Aucun rapport trouvé"
      />

      {/* Pagination - Dark mode */}
      {pages > 1 && (
        <div className="mt-4">
          <Pagination
            currentPage={page}
            totalPages={pages}
            onPageChange={(p) => fetchRapports({ page: p })}
          />
        </div>
      )}
    </div>
  )
}