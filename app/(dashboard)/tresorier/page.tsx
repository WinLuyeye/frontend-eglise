'use client'

import { useEffect, useState } from 'react'
import { DollarSign, TrendingUp, TrendingDown, Wallet, PieChart, FileText, Plus, Download, Calendar, Landmark } from 'lucide-react'
import { StatsCard, PieChartCard, RecentTransactions, TransactionSummary } from '@/components/dashboard'
import { Card, Button, Select, Input, Spinner } from '@/components/ui'
import { useTransactions } from '@/hooks/useTransactions'
import { useCategorieStore } from '@/store/categorieStore'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'

const TAUX_CHANGE = 2250

export default function TresorierDashboardPage() {
  const { user } = useAuth()
  const router = useRouter()
  const { reportData, fetchReport, isLoading } = useTransactions()
  const { entrees, sorties, fetchCategories } = useCategorieStore()
  const [periode, setPeriode] = useState('month')
  const [dateDebut, setDateDebut] = useState('')
  const [dateFin, setDateFin] = useState('')
  const [deviseAffichage, setDeviseAffichage] = useState<'USD' | 'CDF'>('CDF')

  useEffect(() => {
    fetchCategories()
    fetchReport({ periode })
  }, [])

  const handleFilter = () => {
    if (periode === 'custom' && dateDebut && dateFin) {
      fetchReport({ dateDebut, dateFin })
    } else {
      fetchReport({ periode })
    }
  }

  const statsParDevise = reportData?.statsParDevise || {}
  
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

  const getTotalEntrees = () => {
    if (deviseAffichage === 'USD') {
      return (statsParDevise.USD?.entrees || 0)
    }
    return (statsParDevise.CDF?.entrees || 0)
  }

  const getTotalSorties = () => {
    if (deviseAffichage === 'USD') {
      return (statsParDevise.USD?.sorties || 0)
    }
    return (statsParDevise.CDF?.sorties || 0)
  }

  const getSolde = () => {
    if (deviseAffichage === 'USD') {
      return (statsParDevise.USD?.solde || 0)
    }
    return (statsParDevise.CDF?.solde || 0)
  }

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

  if (isLoading && !reportData) {
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
          <h1 className="text-2xl font-bold text-gray-900">Tableau de bord - Trésorier</h1>
          <p className="mt-1 text-sm text-gray-500">
            Bienvenue, {user?.nom || ''} ! Gérez les finances de l'église.
          </p>
        </div>
        <div className="flex space-x-2">
          <div className="flex rounded-lg border">
            <button
              onClick={() => setDeviseAffichage('CDF')}
              className={`px-3 py-1 text-sm rounded-l-md transition-colors ${
                deviseAffichage === 'CDF' ? 'bg-primary-500 text-white' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              CDF
            </button>
            <button
              onClick={() => setDeviseAffichage('USD')}
              className={`px-3 py-1 text-sm rounded-r-md transition-colors ${
                deviseAffichage === 'USD' ? 'bg-primary-500 text-white' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              USD
            </button>
          </div>
          <Button onClick={() => router.push('/tresorier/transactions/nouveau')}>
            <Plus className="mr-2 h-4 w-4" />
            Nouvelle transaction
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Exporter
          </Button>
        </div>
      </div>

      {/* Filtres période */}
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
          <Button onClick={handleFilter} className="mb-0.5">
            <Calendar className="mr-2 h-4 w-4" />
            Appliquer
          </Button>
        </div>
      </Card>

      {/* Résumé par devise */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card className="border-l-4 border-l-blue-500 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">USD - Dollar américain</p>
              <div className="mt-2 grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="text-xs text-gray-400">Entrées</p>
                  <p className="text-lg font-bold text-green-600">
                    ${(statsParDevise.USD?.entrees || 0).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Sorties</p>
                  <p className="text-lg font-bold text-red-600">
                    ${(statsParDevise.USD?.sorties || 0).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Solde</p>
                  <p className={`text-lg font-bold ${(statsParDevise.USD?.solde || 0) >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                    ${(statsParDevise.USD?.solde || 0).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
            <DollarSign className="h-8 w-8 text-blue-500" />
          </div>
          <p className="mt-2 text-xs text-gray-400 text-center">Taux: 1 USD = {TAUX_CHANGE} CDF</p>
        </Card>

        <Card className="border-l-4 border-l-green-500 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">CDF - Franc congolais</p>
              <div className="mt-2 grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="text-xs text-gray-400">Entrées</p>
                  <p className="text-lg font-bold text-green-600">
                    {(statsParDevise.CDF?.entrees || 0).toLocaleString()} FC
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Sorties</p>
                  <p className="text-lg font-bold text-red-600">
                    {(statsParDevise.CDF?.sorties || 0).toLocaleString()} FC
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Solde</p>
                  <p className={`text-lg font-bold ${(statsParDevise.CDF?.solde || 0) >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                    {(statsParDevise.CDF?.solde || 0).toLocaleString()} FC
                  </p>
                </div>
              </div>
            </div>
            <Landmark className="h-8 w-8 text-green-500" />
          </div>
        </Card>
      </div>

      {/* Résumé dans la devise sélectionnée */}
      <TransactionSummary
        totalEntrees={getTotalEntrees()}
        totalSorties={getTotalSorties()}
        solde={getSolde()}
        devise={deviseAffichage}
      />

      {/* Graphiques par catégorie */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <PieChartCard
          title={`Répartition des entrées (${deviseAffichage})`}
          subtitle="Par catégorie"
          data={entreesParCategorie}
        />
        <PieChartCard
          title={`Répartition des sorties (${deviseAffichage})`}
          subtitle="Par catégorie"
          data={sortiesParCategorie}
        />
      </div>

      {/* Transactions récentes */}
      <RecentTransactions
        transactions={reportData?.dernieresTransactions || []}
        title="Dernières transactions enregistrées"
        onViewAll={() => router.push('/tresorier/transactions')}
        onExport={() => {}}
        isLoading={isLoading}
      />

      {/* Actions rapides */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <button
          onClick={() => router.push('/tresorier/categories')}
          className="flex items-center rounded-lg border p-4 transition-colors hover:bg-gray-50"
        >
          <div className="mr-3 rounded-full bg-blue-100 p-2">
            <PieChart className="h-5 w-5 text-blue-600" />
          </div>
          <div className="text-left">
            <p className="font-medium">Gérer les catégories</p>
            <p className="text-sm text-gray-500">Ajouter, modifier, supprimer</p>
          </div>
        </button>

        <button
          onClick={() => router.push('/tresorier/rapports')}
          className="flex items-center rounded-lg border p-4 transition-colors hover:bg-gray-50"
        >
          <div className="mr-3 rounded-full bg-green-100 p-2">
            <FileText className="h-5 w-5 text-green-600" />
          </div>
          <div className="text-left">
            <p className="font-medium">Rapports financiers</p>
            <p className="text-sm text-gray-500">Analyses détaillées</p>
          </div>
        </button>

        <button
          onClick={() => router.push('/tresorier/transactions')}
          className="flex items-center rounded-lg border p-4 transition-colors hover:bg-gray-50"
        >
          <div className="mr-3 rounded-full bg-purple-100 p-2">
            <DollarSign className="h-5 w-5 text-purple-600" />
          </div>
          <div className="text-left">
            <p className="font-medium">Historique complet</p>
            <p className="text-sm text-gray-500">Toutes les transactions</p>
          </div>
        </button>
      </div>

      {/* Info taux de change */}
      <div className="rounded-lg bg-blue-50 p-3 text-center text-sm text-blue-700">
        <p>Taux de change utilisé: 1 USD = {TAUX_CHANGE} CDF</p>
        <p className="text-xs mt-1">Les montants en USD sont convertis automatiquement</p>
      </div>
    </div>
  )
}