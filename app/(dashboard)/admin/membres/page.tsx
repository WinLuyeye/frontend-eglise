'use client'

import { useEffect, useState } from 'react'
import { MemberList } from '@/components/members'
import { useMembers } from '@/hooks/useMembers'
import { useRouter } from 'next/navigation'
import { Plus, Download, Upload } from 'lucide-react'
import { Button } from '@/components/ui'

export default function MembresPage() {
  const router = useRouter()
  const {
    members,
    total,
    page,
    pages,
    isLoading,
    fetchMembers,
    deleteMember,
  } = useMembers()

  const [search, setSearch] = useState('')
  const [statut, setStatut] = useState('')

  useEffect(() => {
    fetchMembers({ page, limit: 10, search, statut })
  }, [page, search, statut])

  const handleSearch = (term: string) => {
    setSearch(term)
    fetchMembers({ page: 1, limit: 10, search: term, statut })
  }

  const handleFilter = (filter: string) => {
    setStatut(filter)
    fetchMembers({ page: 1, limit: 10, search, statut: filter })
  }

  const handleExport = () => {
    // Logique d'export CSV
    const headers = ['Nom', 'Prénom', 'Email', 'Téléphone', 'Statut', 'Département', "Date d'inscription"]
    const csvData = members.map(m => [
      m.nom,
      m.prenom,
      m.email || '',
      m.telephone || '',
      m.statut,
      m.departement?.nom || '',
      new Date(m.dateInscription).toLocaleDateString(),
    ])
    
    const csvContent = [headers, ...csvData].map(row => row.join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', 'membres.csv')
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Gestion des membres
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Gérez tous les membres de votre église
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Exporter
          </Button>
          <Button onClick={() => router.push('/admin/membres/nouveau')}>
            <Plus className="mr-2 h-4 w-4" />
            Nouveau membre
          </Button>
        </div>
      </div>

      <MemberList
        members={members}
        total={total}
        currentPage={page}
        totalPages={pages}
        isLoading={isLoading}
        onPageChange={(p) => fetchMembers({ page: p, limit: 10, search, statut })}
        onSearch={handleSearch}
        onFilter={handleFilter}
        onDelete={deleteMember}
        onView={(id) => router.push(`/admin/membres/${id}`)}
        onEdit={(id) => router.push(`/admin/membres/${id}/modifier`)}
        onExport={handleExport}
      />
    </div>
  )
}