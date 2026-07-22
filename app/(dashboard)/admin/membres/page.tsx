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

  // Fonction d'export avec encodage UTF-8 BOM pour les caractères spéciaux
  const handleExport = () => {
    // En-têtes avec BOM pour UTF-8
    const BOM = '\uFEFF'
    
    // Séparateur CSV (point-virgule pour meilleure compatibilité Excel)
    const separator = ';'
    
    // Noms des colonnes
    const headers = [
      'Nom',
      'Prénom',
      'Email',
      'Téléphone',
      'Statut',
      'Département',
      "Date d'inscription"
    ]
    
    // Construction des lignes de données avec échappement des caractères spéciaux
    const rows = members.map(m => {
      // Échapper les guillemets et les séparateurs dans les champs
      const escapeField = (field: string | null | undefined) => {
        if (!field) return ''
        const stringField = String(field)
        // Si le champ contient des guillemets, des séparateurs ou des sauts de ligne, on l'encadre de guillemets
        if (stringField.includes('"') || stringField.includes(separator) || stringField.includes('\n')) {
          return `"${stringField.replace(/"/g, '""')}"`
        }
        return stringField
      }

      return [
        escapeField(m.nom),
        escapeField(m.prenom),
        escapeField(m.email),
        escapeField(m.telephone),
        escapeField(m.statut),
        escapeField(m.departement?.nom),
        m.dateInscription ? new Date(m.dateInscription).toLocaleDateString('fr-FR') : ''
      ].join(separator)
    })
    
    // Construction du contenu CSV complet
    const csvContent = BOM + [
      headers.join(separator),
      ...rows
    ].join('\n')
    
    // Création du blob avec le bon encodage
    const blob = new Blob([csvContent], { 
      type: 'text/csv;charset=utf-8;' 
    })
    
    // Téléchargement du fichier
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `membres_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url) // Libération de la mémoire
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          {/* Titre principal avec style distinctif */}
          <h1 className="text-3xl font-bold text-indigo-600 dark:text-indigo-400 tracking-tight">
            Gestion des membres
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Gérez tous les membres de votre église
          </p>
        </div>
        <div className="flex flex-wrap space-x-2 gap-2">
          <Button 
            variant="outline" 
            onClick={handleExport}
            className="border-indigo-200 text-indigo-600 hover:bg-indigo-50 dark:border-indigo-800 dark:text-indigo-400 dark:hover:bg-indigo-950"
          >
            <Download className="mr-2 h-4 w-4" />
            Exporter
          </Button>
          <Button 
            onClick={() => router.push('/admin/membres/nouveau')}
            className="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600"
          >
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