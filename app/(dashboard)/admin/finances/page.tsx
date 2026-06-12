'use client'

import { useEffect, useState } from 'react'
import { DollarSign, TrendingUp, TrendingDown, Wallet, Calendar, Filter, Download, Landmark } from 'lucide-react'
import { StatsCard, BarChartCard, PieChartCard, TransactionSummary } from '@/components/dashboard'
import { Card, Button, Input, Select, Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui'
import { useTransactions } from '@/hooks/useTransactions'
import { useRouter } from 'next/navigation'

const TAUX_CHANGE = 2250

// Composant pour le sélecteur de devise
const DeviseSelector = ({ value, onChange }: { value: 'USD' | 'CDF', onChange: (v: 'USD' | 'CDF') => void }) => {
  return (
    <div className="flex rounded-lg border p-1">
      <button
        onClick={() => onChange('USD')}
        className={`px-3 py-1 text-sm rounded-md transition-colors ${
          value === 'USD' 
            ? 'bg-primary-500 text-white' 
            : 'text-gray-600 hover:bg-gray-100'
        }`}
      >
        USD
      </button>
      <button
        onClick={() => onChange('CDF')}
        className={`px-3 py-1 text-sm rounded-md transition-colors ${
          value === 'CDF' 
            ? 'bg-primary-500 text-white' 
            : 'text-gray-600 hover:bg-gray-100'
        }`}
      >
        CDF
      </button>
    </div>
  )
}

export default function FinancesPage() {
  const router = useRouter()
  const { reportData, fetchReport, isLoading } = useTransactions()
  const [periode, setPeriode] = useState('month')
  const [dateDebut, setDateDebut] = useState('')
  const [dateFin, setDateFin] = useState('')
  const [deviseAffichage, setDeviseAffichage] = useState<'USD' | 'CDF'>('CDF')

  useEffect(() => {
    if (periode === 'custom' && dateDebut && dateFin) {
      fetchReport({ dateDebut, dateFin })
    } else {
      fetchReport({ periode })
    }
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

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Gestion financière
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Suivez les entrées et sorties de votre église
          </p>
        </div>
        <div className="flex space-x-2">
          <DeviseSelector value={deviseAffichage} onChange={setDeviseAffichage} />
          <Button
            variant="outline"
            onClick={() => router.push('/admin/finances/transactions/nouveau')}
          >
            <DollarSign className="mr-2 h-4 w-4" />
            Nouvelle transaction
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Exporter
          </Button>
        </div>
      </div>

      {/* Filtres */}
      <Card className="p-4">
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

      {/* Statistiques par devise */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Stats USD */}
        <Card className="border-l-4 border-l-blue-500">
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <DollarSign className="h-5 w-5 text-blue-500" />
                <h3 className="font-semibold">Transactions USD</h3>
              </div>
              <span className="text-xs text-gray-500">Taux: 1 USD = {TAUX_CHANGE} CDF</span>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2 text-center">
              <div>
                <p className="text-xs text-gray-500">Entrées</p>
                <p className="font-semibold text-green-600">${statsParDevise?.USD?.entrees?.toLocaleString() || 0}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Sorties</p>
                <p className="font-semibold text-red-600">${statsParDevise?.USD?.sorties?.toLocaleString() || 0}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Solde</p>
                <p className={`font-semibold ${(statsParDevise?.USD?.solde || 0) >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                  ${statsParDevise?.USD?.solde?.toLocaleString() || 0}
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Stats CDF */}
        <Card className="border-l-4 border-l-green-500">
          <div className="p-4">
            <div className="flex items-center space-x-2">
              <Landmark className="h-5 w-5 text-green-500" />
              <h3 className="font-semibold">Transactions CDF</h3>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2 text-center">
              <div>
                <p className="text-xs text-gray-500">Entrées</p>
                <p className="font-semibold text-green-600">{statsParDevise?.CDF?.entrees?.toLocaleString() || 0} FC</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Sorties</p>
                <p className="font-semibold text-red-600">{statsParDevise?.CDF?.sorties?.toLocaleString() || 0} FC</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Solde</p>
                <p className={`font-semibold ${(statsParDevise?.CDF?.solde || 0) >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
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
          className="flex items-center rounded-lg border p-4 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
        >
          <div className="mr-3 rounded-full bg-blue-100 p-2 dark:bg-blue-900">
            <DollarSign className="h-5 w-5 text-blue-600" />
          </div>
          <div className="text-left">
            <p className="font-medium text-gray-900 dark:text-white">Toutes les transactions</p>
            <p className="text-sm text-gray-500">Voir l'historique complet</p>
          </div>
        </button>

        <button
          onClick={() => router.push('/admin/finances/categories')}
          className="flex items-center rounded-lg border p-4 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
        >
          <div className="mr-3 rounded-full bg-green-100 p-2 dark:bg-green-900">
            <Wallet className="h-5 w-5 text-green-600" />
          </div>
          <div className="text-left">
            <p className="font-medium text-gray-900 dark:text-white">Catégories</p>
            <p className="text-sm text-gray-500">Gérer les catégories</p>
          </div>
        </button>

        <button
          onClick={() => router.push('/admin/finances/rapports')}
          className="flex items-center rounded-lg border p-4 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
        >
          <div className="mr-3 rounded-full bg-purple-100 p-2 dark:bg-purple-900">
            <TrendingUp className="h-5 w-5 text-purple-600" />
          </div>
          <div className="text-left">
            <p className="font-medium text-gray-900 dark:text-white">Rapports détaillés</p>
            <p className="text-sm text-gray-500">Analyses financières</p>
          </div>
        </button>
      </div>
    </div>
  )
}