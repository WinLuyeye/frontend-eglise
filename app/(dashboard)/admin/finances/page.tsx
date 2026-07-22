'use client'

import { useEffect, useState } from 'react'
import { DollarSign, TrendingUp, TrendingDown, Wallet, Calendar, Filter, Download, Landmark, FileSpreadsheet, PieChart, BarChart3 } from 'lucide-react'
import { StatsCard, BarChartCard, PieChartCard, TransactionSummary } from '@/components/dashboard'
import { Card, Button, Input, Select, Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui'
import { useTransactions } from '@/hooks/useTransactions'
import { useRouter } from 'next/navigation'
import * as XLSX from 'xlsx' // Import de la bibliothèque

const TAUX_CHANGE = 2250

// Composant pour le sélecteur de devise
const DeviseSelector = ({ value, onChange }: { value: 'USD' | 'CDF', onChange: (v: 'USD' | 'CDF') => void }) => {
  return (
    <div className="flex rounded-lg border p-1">
      <button
        onClick={() => onChange('USD')}
        className={`px-3 py-1 text-sm rounded-md transition-colors ${
          value === 'USD' 
            ? 'bg-indigo-600 text-white' 
            : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
        }`}
      >
        USD
      </button>
      <button
        onClick={() => onChange('CDF')}
        className={`px-3 py-1 text-sm rounded-md transition-colors ${
          value === 'CDF' 
            ? 'bg-indigo-600 text-white' 
            : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
        }`}
      >
        CDF
      </button>
    </div>
  )
}

export default function FinancesPage() {
  const router = useRouter()
  const { reportData, transactions, fetchReport, fetchTransactions, isLoading } = useTransactions()
  const [periode, setPeriode] = useState('month')
  const [dateDebut, setDateDebut] = useState('')
  const [dateFin, setDateFin] = useState('')
  const [deviseAffichage, setDeviseAffichage] = useState<'USD' | 'CDF'>('CDF')
  const [isExporting, setIsExporting] = useState(false)

// Créez une fonction pour obtenir les dates en fonction de la période
const getDatesFromPeriode = (periode: string): { dateDebut: string, dateFin: string } => {
  const now = new Date()
  let dateDebut = ''
  let dateFin = now.toISOString().split('T')[0]
  
  switch (periode) {
    case 'week':
      const startOfWeek = new Date(now)
      startOfWeek.setDate(now.getDate() - now.getDay())
      startOfWeek.setHours(0, 0, 0, 0)
      dateDebut = startOfWeek.toISOString().split('T')[0]
      break
    case 'month':
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      dateDebut = startOfMonth.toISOString().split('T')[0]
      break
    case 'year':
      const startOfYear = new Date(now.getFullYear(), 0, 1)
      dateDebut = startOfYear.toISOString().split('T')[0]
      break
    default:
      dateDebut = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
  }
  
  return { dateDebut, dateFin }
}

// Ensuite, dans votre useEffect :
useEffect(() => {
  let params: { dateDebut?: string; dateFin?: string } = {}
  
  if (periode === 'custom' && dateDebut && dateFin) {
    params = { dateDebut, dateFin }
  } else {
    const dates = getDatesFromPeriode(periode)
    params = dates
  }
  
  fetchReport(params)
  fetchTransactions(params)
}, [periode, dateDebut, dateFin])

  // Obtenir les données par devise
  const statsParDevise = reportData?.statsParDevise || {}
  
  // Données pour les graphiques (converties selon devise)
  const entreesParCategorie = reportData?.entreesParCategorie 
    ? Object.entries(reportData.entreesParCategorie).map(([name, value]) => ({ 
        name, 
        value: deviseAffichage === 'USD' ? Number(value) / TAUX_CHANGE : Number(value) 
      }))
    : []

  const sortiesParCategorie = reportData?.sortiesParCategorie
    ? Object.entries(reportData.sortiesParCategorie).map(([name, value]) => ({ 
        name, 
        value: deviseAffichage === 'USD' ? Number(value) / TAUX_CHANGE : Number(value) 
      }))
    : []

  // Totaux selon la devise
  const totalEntrees = deviseAffichage === 'USD' 
    ? (reportData?.total?.entrees || 0) / TAUX_CHANGE
    : reportData?.total?.entrees || 0
    
  const totalSorties = deviseAffichage === 'USD'
    ? (reportData?.total?.sorties || 0) / TAUX_CHANGE
    : reportData?.total?.sorties || 0

  const periodeOptions = [
    { value: 'week', label: 'Cette semaine' },
    { value: 'month', label: 'Ce mois' },
    { value: 'year', label: 'Cette année' },
    { value: 'custom', label: 'Personnalisé' },
  ]

  const formatMontant = (value: number) => {
    if (deviseAffichage === 'USD') {
      return `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    }
    return `${value.toLocaleString()} FC`
  }

  // ✅ FONCTION D'EXPORT EXCEL AVEC MULTI-SHEETS
  const handleExportExcel = async () => {
    try {
      setIsExporting(true)

      // Récupérer toutes les transactions
      let transactionsData = transactions
      if (!transactionsData || transactionsData.length === 0) {
        if (periode === 'custom' && dateDebut && dateFin) {
          await fetchTransactions({ dateDebut, dateFin })
        } else {
          const dates = getDatesFromPeriode(periode)
          await fetchTransactions(dates)
        }
        transactionsData = transactions
      }

      // Obtenir la date pour le nom du fichier
      const now = new Date()
      const dateStr = now.toISOString().split('T')[0]
      const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '-')

      // Créer un nouveau classeur
      const wb = XLSX.utils.book_new()

      // ============ SHEET 1: RÉSUMÉ ============
      const summaryData = [
        ['RAPPORT FINANCIER'],
        [`Période: ${periodeOptions.find(p => p.value === periode)?.label || 'Personnalisé'}`],
        [`Date d'export: ${new Date().toLocaleDateString('fr-FR')}`],
        [`Devise d'affichage: ${deviseAffichage}`],
        [],
        ['RÉSUMÉ DES TRANSACTIONS'],
        ['Indicateur', 'Montant'],
        [`Total des entrées`, formatMontant(totalEntrees)],
        [`Total des sorties`, formatMontant(totalSorties)],
        [`Solde`, formatMontant(totalEntrees - totalSorties)],
        [],
        ['STATISTIQUES PAR DEVISE'],
        ['Devise', 'Entrées', 'Sorties', 'Solde'],
      ]

      if (statsParDevise.USD) {
        summaryData.push([
          'USD',
          `$${statsParDevise.USD.entrees?.toLocaleString() || 0}`,
          `$${statsParDevise.USD.sorties?.toLocaleString() || 0}`,
          `$${statsParDevise.USD.solde?.toLocaleString() || 0}`
        ])
      }
      if (statsParDevise.CDF) {
        summaryData.push([
          'CDF',
          `${statsParDevise.CDF.entrees?.toLocaleString() || 0} FC`,
          `${statsParDevise.CDF.sorties?.toLocaleString() || 0} FC`,
          `${statsParDevise.CDF.solde?.toLocaleString() || 0} FC`
        ])
      }

      summaryData.push([])
      summaryData.push(['TAUX DE CHANGE', `1 USD = ${TAUX_CHANGE} CDF`])

      const ws1 = XLSX.utils.aoa_to_sheet(summaryData)
      
      // Style pour la sheet 1 (largeur des colonnes)
      ws1['!cols'] = [
        { wch: 30 },
        { wch: 20 }
      ]
      
      XLSX.utils.book_append_sheet(wb, ws1, 'Résumé')

      // ============ SHEET 2: CATÉGORIES ============
      const categoriesData = [
        ['RÉPARTITION PAR CATÉGORIE'],
        [`Période: ${periodeOptions.find(p => p.value === periode)?.label || 'Personnalisé'}`],
        [`Devise: ${deviseAffichage}`],
        [],
        ['Catégorie', `Entrées (${deviseAffichage})`, `Sorties (${deviseAffichage})`, 'Solde']
      ]

      const allCategories = new Set([
        ...(reportData?.entreesParCategorie ? Object.keys(reportData.entreesParCategorie) : []),
        ...(reportData?.sortiesParCategorie ? Object.keys(reportData.sortiesParCategorie) : [])
      ])

      allCategories.forEach(cat => {
        const entrees = reportData?.entreesParCategorie?.[cat] || 0
        const sorties = reportData?.sortiesParCategorie?.[cat] || 0
        const entreesConverted = deviseAffichage === 'USD' ? entrees / TAUX_CHANGE : entrees
        const sortiesConverted = deviseAffichage === 'USD' ? sorties / TAUX_CHANGE : sorties
        categoriesData.push([
          cat,
          formatMontant(entreesConverted),
          formatMontant(sortiesConverted),
          formatMontant(entreesConverted - sortiesConverted)
        ])
      })

      // Ajouter le total
      categoriesData.push([])
      categoriesData.push([
        'TOTAL',
        formatMontant(totalEntrees),
        formatMontant(totalSorties),
        formatMontant(totalEntrees - totalSorties)
      ])

      const ws2 = XLSX.utils.aoa_to_sheet(categoriesData)
      ws2['!cols'] = [
        { wch: 30 },
        { wch: 20 },
        { wch: 20 },
        { wch: 20 }
      ]
      XLSX.utils.book_append_sheet(wb, ws2, 'Catégories')

      // ============ SHEET 3: TRANSACTIONS DÉTAILLÉES ============
      const transactionsData2 = [
        ['LISTE DES TRANSACTIONS'],
        [`Période: ${periodeOptions.find(p => p.value === periode)?.label || 'Personnalisé'}`],
        [`Devise: ${deviseAffichage}`],
        [],
        [
          'Date',
          'Type',
          'Catégorie',
          'Description',
          `Montant (${deviseAffichage})`,
          'Devise originale',
          'Méthode de paiement',
          'Référence',
          'Statut'
        ]
      ]

      if (transactionsData && transactionsData.length > 0) {
        transactionsData.forEach((t: any) => {
          const montantConverted = deviseAffichage === 'USD' 
            ? (t.devise === 'USD' ? t.montant : t.montant / TAUX_CHANGE)
            : (t.devise === 'CDF' ? t.montant : t.montant * TAUX_CHANGE)
          
          transactionsData2.push([
            new Date(t.dateTransaction).toLocaleDateString('fr-FR'),
            t.type === 'entree' ? 'ENTRÉE' : 'SORTIE',
            t.categorie?.nom || 'Non catégorisé',
            t.description || '',
            formatMontant(montantConverted),
            t.devise || 'CDF',
            t.methodePaiement || '—',
            t.reference || '—',
            t.statut || 'Validé'
          ])
        })
      } else {
        transactionsData2.push(['Aucune transaction trouvée pour cette période'])
      }

      const ws3 = XLSX.utils.aoa_to_sheet(transactionsData2)
      ws3['!cols'] = [
        { wch: 15 },
        { wch: 12 },
        { wch: 25 },
        { wch: 30 },
        { wch: 18 },
        { wch: 12 },
        { wch: 18 },
        { wch: 18 },
        { wch: 12 }
      ]
      XLSX.utils.book_append_sheet(wb, ws3, 'Transactions')

      // ============ SHEET 4: STATISTIQUES MENSUELLES ============
      if (transactionsData && transactionsData.length > 0) {
        const monthlyStats: { [key: string]: { entrees: number, sorties: number } } = {}
        
        transactionsData.forEach((t: any) => {
          const date = new Date(t.dateTransaction)
          const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
          
          if (!monthlyStats[key]) {
            monthlyStats[key] = { entrees: 0, sorties: 0 }
          }
          
          const montant = deviseAffichage === 'USD' 
            ? (t.devise === 'USD' ? t.montant : t.montant / TAUX_CHANGE)
            : (t.devise === 'CDF' ? t.montant : t.montant * TAUX_CHANGE)
          
          if (t.type === 'entree') {
            monthlyStats[key].entrees += montant
          } else {
            monthlyStats[key].sorties += montant
          }
        })

        const monthlyData = [
          ['STATISTIQUES MENSUELLES'],
          [`Devise: ${deviseAffichage}`],
          [],
          ['Mois', 'Entrées', 'Sorties', 'Solde', 'Taux de croissance']
        ]

        const months = Object.keys(monthlyStats).sort()
        let previousSolde = 0
        
        months.forEach((month, index) => {
          const stats = monthlyStats[month]
          const solde = stats.entrees - stats.sorties
          const croissance = index > 0 && previousSolde !== 0 
            ? ((solde - previousSolde) / Math.abs(previousSolde) * 100).toFixed(1)
            : '—'
          
          const [year, monthNum] = month.split('-')
          const monthName = new Date(parseInt(year), parseInt(monthNum) - 1).toLocaleString('fr-FR', { month: 'long' })
          
          monthlyData.push([
            `${monthName} ${year}`,
            formatMontant(stats.entrees),
            formatMontant(stats.sorties),
            formatMontant(solde),
            croissance !== '—' ? `${croissance}%` : croissance
          ])
          
          previousSolde = solde
        })

        const ws4 = XLSX.utils.aoa_to_sheet(monthlyData)
        ws4['!cols'] = [
          { wch: 20 },
          { wch: 18 },
          { wch: 18 },
          { wch: 18 },
          { wch: 18 }
        ]
        XLSX.utils.book_append_sheet(wb, ws4, 'Statistiques mensuelles')
      }

      // ============ SHEET 5: INDICATEURS CLÉS ============
      const kpiData = [
        ['INDICATEURS CLÉS DE PERFORMANCE'],
        [`Période: ${periodeOptions.find(p => p.value === periode)?.label || 'Personnalisé'}`],
        [],
        ['Indicateur', 'Valeur', 'Interprétation'],
        [
          'Nombre total de transactions',
          transactionsData?.length || 0,
          transactionsData && transactionsData.length > 10 ? 'Volume d\'activité élevé' : 'Volume d\'activité modéré'
        ],
        [
          'Taux de conversion (Entrées/Sorties)',
          totalSorties > 0 ? ((totalEntrees / totalSorties) * 100).toFixed(1) + '%' : 'N/A',
          totalSorties > 0 
            ? (totalEntrees / totalSorties > 1 ? 'Bénéficiaire' : 'Déficitaire')
            : 'Aucune sortie'
        ],
        [
          'Ratio de couverture',
          totalSorties > 0 ? (totalEntrees / totalSorties).toFixed(2) : 'N/A',
          totalSorties > 0 
            ? (totalEntrees / totalSorties >= 1 ? 'Couverture suffisante' : 'Couverture insuffisante')
            : 'Aucune sortie'
        ],
        [
          'Solde moyen par transaction',
          transactionsData && transactionsData.length > 0 
            ? formatMontant((totalEntrees + totalSorties) / transactionsData.length)
            : '0'
        ],
        [
          'Taux de croissance (si applicable)',
          '—',
          '—'
        ]
      ]

      const ws5 = XLSX.utils.aoa_to_sheet(kpiData)
      ws5['!cols'] = [
        { wch: 35 },
        { wch: 25 },
        { wch: 30 }
      ]
      XLSX.utils.book_append_sheet(wb, ws5, 'Indicateurs clés')

      // ============ GÉNÉRATION DU FICHIER ============
      const wbout = XLSX.write(wb, { 
        bookType: 'xlsx', 
        type: 'array',
        bookSST: false
      })
      
      const blob = new Blob([wbout], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      })
      
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `rapport_finances_${dateStr}_${timeStr}.xlsx`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

    } catch (error) {
      console.error('Erreur lors de l\'export:', error)
      alert('Une erreur est survenue lors de l\'export du rapport')
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* En-tête avec style amélioré */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Gestion financière
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Suivez les entrées et sorties de votre église
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <DeviseSelector value={deviseAffichage} onChange={setDeviseAffichage} />
          <Button
            variant="outline"
            onClick={() => router.push('/admin/finances/transactions/nouveau')}
            className="border-indigo-200 text-indigo-600 hover:bg-indigo-50 dark:border-indigo-800 dark:text-indigo-400 dark:hover:bg-indigo-950"
          >
            <DollarSign className="mr-2 h-4 w-4" />
            Nouvelle transaction
          </Button>
          <Button 
            onClick={handleExportExcel}
            disabled={isExporting}
            className="bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600"
          >
            {isExporting ? (
              <>
                <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Export en cours...
              </>
            ) : (
              <>
                <FileSpreadsheet className="mr-2 h-4 w-4" />
                Exporter Excel
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Filtres */}
      <Card className="p-4 dark:bg-gray-800/50">
        <div className="flex flex-wrap items-end gap-4">
          <div className="w-48">
            <Select
              label="Période"
              value={periode}
              onChange={(e) => setPeriode(e.target.value)}
              options={periodeOptions}
            />
          </div>
          {periode === 'custom' && (
            <>
              <div className="w-48">
                <Input
                  label="Date début"
                  type="date"
                  value={dateDebut}
                  onChange={(e) => setDateDebut(e.target.value)}
                />
              </div>
              <div className="w-48">
                <Input
                  label="Date fin"
                  type="date"
                  value={dateFin}
                  onChange={(e) => setDateFin(e.target.value)}
                />
              </div>
            </>
          )}
          <Button
            variant="outline"
            onClick={() => periode === 'custom' && dateDebut && dateFin 
              ? fetchReport({ dateDebut, dateFin }) 
              : fetchReport({ periode })}
            className="mb-0.5"
          >
            <Filter className="mr-2 h-4 w-4" />
            Appliquer
          </Button>
        </div>
      </Card>

      {/* Statistiques par devise - Style amélioré */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="border-l-4 border-l-blue-500 dark:border-l-blue-400">
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="rounded-lg bg-blue-100 p-2 dark:bg-blue-900/30">
                  <DollarSign className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="font-semibold dark:text-white">Transactions USD</h3>
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400">Taux: 1 USD = {TAUX_CHANGE} CDF</span>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2 text-center">
              <div className="rounded-lg bg-green-50 p-2 dark:bg-green-900/20">
                <p className="text-xs text-gray-500 dark:text-gray-400">Entrées</p>
                <p className="font-semibold text-green-600 dark:text-green-400">${statsParDevise?.USD?.entrees?.toLocaleString() || 0}</p>
              </div>
              <div className="rounded-lg bg-red-50 p-2 dark:bg-red-900/20">
                <p className="text-xs text-gray-500 dark:text-gray-400">Sorties</p>
                <p className="font-semibold text-red-600 dark:text-red-400">${statsParDevise?.USD?.sorties?.toLocaleString() || 0}</p>
              </div>
              <div className="rounded-lg bg-blue-50 p-2 dark:bg-blue-900/20">
                <p className="text-xs text-gray-500 dark:text-gray-400">Solde</p>
                <p className={`font-semibold ${(statsParDevise?.USD?.solde || 0) >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-orange-600 dark:text-orange-400'}`}>
                  ${statsParDevise?.USD?.solde?.toLocaleString() || 0}
                </p>
              </div>
            </div>
          </div>
        </Card>

        <Card className="border-l-4 border-l-green-500 dark:border-l-green-400">
          <div className="p-4">
            <div className="flex items-center space-x-2">
              <div className="rounded-lg bg-green-100 p-2 dark:bg-green-900/30">
                <Landmark className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="font-semibold dark:text-white">Transactions CDF</h3>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2 text-center">
              <div className="rounded-lg bg-green-50 p-2 dark:bg-green-900/20">
                <p className="text-xs text-gray-500 dark:text-gray-400">Entrées</p>
                <p className="font-semibold text-green-600 dark:text-green-400">{statsParDevise?.CDF?.entrees?.toLocaleString() || 0} FC</p>
              </div>
              <div className="rounded-lg bg-red-50 p-2 dark:bg-red-900/20">
                <p className="text-xs text-gray-500 dark:text-gray-400">Sorties</p>
                <p className="font-semibold text-red-600 dark:text-red-400">{statsParDevise?.CDF?.sorties?.toLocaleString() || 0} FC</p>
              </div>
              <div className="rounded-lg bg-blue-50 p-2 dark:bg-blue-900/20">
                <p className="text-xs text-gray-500 dark:text-gray-400">Solde</p>
                <p className={`font-semibold ${(statsParDevise?.CDF?.solde || 0) >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-orange-600 dark:text-orange-400'}`}>
                  {statsParDevise?.CDF?.solde?.toLocaleString() || 0} FC
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Résumé */}
      <TransactionSummary
        totalEntrees={totalEntrees}
        totalSorties={totalSorties}
        solde={totalEntrees - totalSorties}
        devise={deviseAffichage}
      />

      {/* Graphiques */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <PieChartCard
          title={`Entrées par catégorie (${deviseAffichage})`}
          subtitle="Répartition des entrées"
          data={entreesParCategorie}
        />
        <PieChartCard
          title={`Sorties par catégorie (${deviseAffichage})`}
          subtitle="Répartition des sorties"
          data={sortiesParCategorie}
        />
      </div>

      {/* Liens rapides */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <button
          onClick={() => router.push('/admin/finances/transactions')}
          className="group flex items-center rounded-lg border p-4 transition-all hover:shadow-md dark:border-gray-700"
        >
          <div className="mr-3 rounded-full bg-blue-100 p-2 transition-colors group-hover:bg-blue-200 dark:bg-blue-900/30 dark:group-hover:bg-blue-900/50">
            <DollarSign className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="text-left">
            <p className="font-medium text-gray-900 dark:text-white">Toutes les transactions</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Voir l'historique complet</p>
          </div>
        </button>

        <button
          onClick={() => router.push('/admin/finances/categories')}
          className="group flex items-center rounded-lg border p-4 transition-all hover:shadow-md dark:border-gray-700"
        >
          <div className="mr-3 rounded-full bg-green-100 p-2 transition-colors group-hover:bg-green-200 dark:bg-green-900/30 dark:group-hover:bg-green-900/50">
            <Wallet className="h-5 w-5 text-green-600 dark:text-green-400" />
          </div>
          <div className="text-left">
            <p className="font-medium text-gray-900 dark:text-white">Catégories</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Gérer les catégories</p>
          </div>
        </button>

        <button
          onClick={() => router.push('/admin/finances/rapports')}
          className="group flex items-center rounded-lg border p-4 transition-all hover:shadow-md dark:border-gray-700"
        >
          <div className="mr-3 rounded-full bg-purple-100 p-2 transition-colors group-hover:bg-purple-200 dark:bg-purple-900/30 dark:group-hover:bg-purple-900/50">
            <TrendingUp className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div className="text-left">
            <p className="font-medium text-gray-900 dark:text-white">Rapports détaillés</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Analyses financières</p>
          </div>
        </button>
      </div>
    </div>
  )
}