// app/(dashboard)/admin/finances/rapports/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Download, Calendar, TrendingUp, TrendingDown, DollarSign, Landmark, FileText, Printer } from 'lucide-react'
import { Card, Button, Select, Input, Badge } from '@/components/ui'
import { AreaChartCard, TransactionSummary } from '@/components/dashboard'
import { useTransactions } from '@/hooks/useTransactions'
import { formatDate } from '@/utils/formatters'

const TAUX_CHANGE = 2250

export default function RapportsFinanciersPage() {
  const router = useRouter()
  const { reportData, fetchReport, isLoading } = useTransactions()
  const [periode, setPeriode] = useState('year')
  const [dateDebut, setDateDebut] = useState('')
  const [dateFin, setDateFin] = useState('')

  useEffect(() => {
    if (periode === 'custom' && dateDebut && dateFin) {
      fetchReport({ dateDebut, dateFin })
    } else {
      fetchReport({ periode })
    }
  }, [periode, dateDebut, dateFin])

  const statsParDevise = reportData?.statsParDevise || {}
  const evolutionData = reportData?.evolutionMensuelle || []
  const totalEntrees = reportData?.total?.entrees || 0
  const totalSorties = reportData?.total?.sorties || 0
  const solde = totalEntrees - totalSorties

  const periodeOptions = [
    { value: 'month', label: 'Ce mois' },
    { value: 'year', label: 'Cette année' },
    { value: 'custom', label: 'Personnalisé' },
  ]

  const handlePrint = () => {
    window.print()
  }

  const handleExportPDF = () => {
    // Logique d'export PDF à implémenter
    console.log('Export PDF')
  }

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent dark:border-primary-400 mx-auto" />
          <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">Chargement du rapport...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Rapports financiers
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Analyses détaillées de vos finances
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handlePrint} className="dark:border-gray-700 dark:text-gray-300">
            <Printer className="mr-2 h-4 w-4" />
            Imprimer
          </Button>
          <Button variant="outline" onClick={handleExportPDF} className="dark:border-gray-700 dark:text-gray-300">
            <Download className="mr-2 h-4 w-4" />
            Exporter PDF
          </Button>
        </div>
      </div>

      {/* Filtres */}
      <Card className="p-4 dark:bg-gray-900 dark:border-gray-800">
        <div className="flex flex-wrap items-end gap-4">
          <div className="w-48">
            <Select
              label="Période"
              value={periode}
              onChange={(e) => setPeriode(e.target.value)}
              options={periodeOptions}
              className="dark:bg-gray-800 dark:border-gray-700 dark:text-white"
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
                  className="dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                />
              </div>
              <div className="w-48">
                <Input
                  label="Date fin"
                  type="date"
                  value={dateFin}
                  onChange={(e) => setDateFin(e.target.value)}
                  className="dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                />
              </div>
            </>
          )}
          <Button variant="ghost" className="dark:text-gray-300 dark:hover:bg-gray-800">
            <Calendar className="mr-2 h-4 w-4" />
            Appliquer
          </Button>
        </div>
      </Card>

      {/* Résumé global */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="p-4 dark:bg-gray-900 dark:border-gray-800">
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-green-500" />
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Entrées</h3>
          </div>
          <p className="mt-2 text-2xl font-bold text-green-600 dark:text-green-400">
            {totalEntrees.toLocaleString()} FC
          </p>
        </Card>

        <Card className="p-4 dark:bg-gray-900 dark:border-gray-800">
          <div className="flex items-center space-x-2">
            <TrendingDown className="h-5 w-5 text-red-500" />
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Sorties</h3>
          </div>
          <p className="mt-2 text-2xl font-bold text-red-600 dark:text-red-400">
            {totalSorties.toLocaleString()} FC
          </p>
        </Card>

        <Card className="p-4 dark:bg-gray-900 dark:border-gray-800">
          <div className="flex items-center space-x-2">
            <DollarSign className="h-5 w-5 text-blue-500" />
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Solde</h3>
          </div>
          <p className={`mt-2 text-2xl font-bold ${solde >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-orange-600 dark:text-orange-400'}`}>
            {solde.toLocaleString()} FC
          </p>
        </Card>
      </div>

      {/* Résumé par devise */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="p-4 dark:bg-gray-900 dark:border-gray-800">
          <div className="flex items-center space-x-2 mb-4">
            <div className="rounded-full bg-blue-100 p-2 dark:bg-blue-900/30">
              <DollarSign className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white">Résumé en USD</h3>
            <Badge variant="info" size="sm">USD</Badge>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-800">
              <span className="text-gray-600 dark:text-gray-400">Total Entrées</span>
              <span className="font-semibold text-green-600 dark:text-green-400">
                ${statsParDevise?.USD?.entrees?.toLocaleString() || 0}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-800">
              <span className="text-gray-600 dark:text-gray-400">Total Sorties</span>
              <span className="font-semibold text-red-600 dark:text-red-400">
                ${statsParDevise?.USD?.sorties?.toLocaleString() || 0}
              </span>
            </div>
            <div className="flex justify-between items-center pt-2">
              <span className="text-gray-600 dark:text-gray-400 font-medium">Solde</span>
              <span className={`font-bold ${(statsParDevise?.USD?.solde || 0) >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-orange-600 dark:text-orange-400'}`}>
                ${statsParDevise?.USD?.solde?.toLocaleString() || 0}
              </span>
            </div>
            <div className="mt-2 text-xs text-gray-500 dark:text-gray-500">
              {statsParDevise?.USD?.nombre || 0} transactions
            </div>
          </div>
        </Card>

        <Card className="p-4 dark:bg-gray-900 dark:border-gray-800">
          <div className="flex items-center space-x-2 mb-4">
            <div className="rounded-full bg-green-100 p-2 dark:bg-green-900/30">
              <Landmark className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white">Résumé en CDF</h3>
            <Badge variant="warning" size="sm">CDF</Badge>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-800">
              <span className="text-gray-600 dark:text-gray-400">Total Entrées</span>
              <span className="font-semibold text-green-600 dark:text-green-400">
                {statsParDevise?.CDF?.entrees?.toLocaleString() || 0} FC
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-800">
              <span className="text-gray-600 dark:text-gray-400">Total Sorties</span>
              <span className="font-semibold text-red-600 dark:text-red-400">
                {statsParDevise?.CDF?.sorties?.toLocaleString() || 0} FC
              </span>
            </div>
            <div className="flex justify-between items-center pt-2">
              <span className="text-gray-600 dark:text-gray-400 font-medium">Solde</span>
              <span className={`font-bold ${(statsParDevise?.CDF?.solde || 0) >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-orange-600 dark:text-orange-400'}`}>
                {statsParDevise?.CDF?.solde?.toLocaleString() || 0} FC
              </span>
            </div>
            <div className="mt-2 text-xs text-gray-500 dark:text-gray-500">
              {statsParDevise?.CDF?.nombre || 0} transactions
            </div>
          </div>
        </Card>
      </div>

      {/* Évolution */}
      <AreaChartCard
        title="Évolution financière"
        subtitle="Entrées et sorties sur la période (en CDF)"
        data={evolutionData}
        dataKey="entrées"
        xAxisKey="mois"
        colors={['#3b82f6', '#ef4444']}
      />

      {/* Entrées par catégorie */}
      {reportData?.entreesParCategorie && Object.keys(reportData.entreesParCategorie).length > 0 && (
        <Card className="p-4 dark:bg-gray-900 dark:border-gray-800">
          <h3 className="mb-4 font-semibold text-gray-900 dark:text-white">Entrées par catégorie</h3>
          <div className="space-y-2">
            {Object.entries(reportData.entreesParCategorie).map(([categorie, montant]) => (
              <div key={categorie} className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-800">
                <span className="text-gray-700 dark:text-gray-300">{categorie}</span>
                <span className="font-semibold text-green-600 dark:text-green-400">
                  {Number(montant).toLocaleString()} FC
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Sorties par catégorie */}
      {reportData?.sortiesParCategorie && Object.keys(reportData.sortiesParCategorie).length > 0 && (
        <Card className="p-4 dark:bg-gray-900 dark:border-gray-800">
          <h3 className="mb-4 font-semibold text-gray-900 dark:text-white">Sorties par catégorie</h3>
          <div className="space-y-2">
            {Object.entries(reportData.sortiesParCategorie).map(([categorie, montant]) => (
              <div key={categorie} className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-800">
                <span className="text-gray-700 dark:text-gray-300">{categorie}</span>
                <span className="font-semibold text-red-600 dark:text-red-400">
                  {Number(montant).toLocaleString()} FC
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* TransactionSummary */}
      <TransactionSummary
        totalEntrees={totalEntrees}
        totalSorties={totalSorties}
        solde={solde}
        devise="CDF"
      />

      {/* Informations de bas de page */}
      <Card className="p-4 text-center dark:bg-gray-900 dark:border-gray-800">
        <div className="text-xs text-gray-500 dark:text-gray-400">
          <p>Taux de change utilisé: 1 USD = {TAUX_CHANGE} CDF</p>
          <p className="mt-1">
            Rapport généré le {new Date().toLocaleDateString('fr-FR', { 
              day: 'numeric', 
              month: 'long', 
              year: 'numeric' 
            })} à {new Date().toLocaleTimeString('fr-FR', { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </p>
          <p className="mt-1">
            Période: {periode === 'custom' 
              ? `du ${dateDebut} au ${dateFin}`
              : periode === 'month' 
                ? 'ce mois'
                : 'cette année'
            }
          </p>
          <div className="mt-3 flex justify-center space-x-4">
            <span className="inline-flex items-center">
              <span className="mr-1 inline-block h-2 w-2 rounded-full bg-green-500"></span>
              <span className="text-gray-600 dark:text-gray-400">Entrées</span>
            </span>
            <span className="inline-flex items-center">
              <span className="mr-1 inline-block h-2 w-2 rounded-full bg-red-500"></span>
              <span className="text-gray-600 dark:text-gray-400">Sorties</span>
            </span>
            <span className="inline-flex items-center">
              <span className="mr-1 inline-block h-2 w-2 rounded-full bg-blue-500"></span>
              <span className="text-gray-600 dark:text-gray-400">Solde</span>
            </span>
          </div>
        </div>
      </Card>

      {/* Boutons d'action rapides */}
      <div className="flex flex-wrap gap-3">
        <Button
          variant="outline"
          onClick={() => router.push('/admin/finances/transactions')}
          className="dark:border-gray-700 dark:text-gray-300"
        >
          <FileText className="mr-2 h-4 w-4" />
          Voir toutes les transactions
        </Button>
        <Button
          variant="outline"
          onClick={() => router.push('/admin/finances/transactions/nouveau')}
          className="dark:border-gray-700 dark:text-gray-300"
        >
          <TrendingUp className="mr-2 h-4 w-4" />
          Nouvelle transaction
        </Button>
      </div>
    </div>
  )
}