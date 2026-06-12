'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { DollarSign, TrendingUp, TrendingDown, Wallet, Calendar, Filter, Download, Landmark, PieChart, ListFilter } from 'lucide-react'
import { StatsCard, PieChartCard, TransactionSummary, RecentTransactions } from '@/components/dashboard'
import { Card, Button, Input, Select, Spinner, Badge } from '@/components/ui'
import { useTransactions } from '@/hooks/useTransactions'
import { useCategorieStore } from '@/store/categorieStore'
import { formatDate } from '@/utils/formatters'

const TAUX_CHANGE = 2250

export default function PasteurFinancesPage() {
  const router = useRouter()
  const { reportData, fetchReport, isLoading } = useTransactions()
  const { categories, entrees: categoriesEntrees, sorties: categoriesSorties, fetchCategories } = useCategorieStore()
  const [periode, setPeriode] = useState('year')
  const [dateDebut, setDateDebut] = useState('')
  const [dateFin, setDateFin] = useState('')
  const [deviseAffichage, setDeviseAffichage] = useState<'USD' | 'CDF'>('CDF')
  
  // Filtres par catégorie
  const [categorieFiltre, setCategorieFiltre] = useState<string>('')
  const [typeFiltre, setTypeFiltre] = useState<'entree' | 'sortie' | 'tous'>('tous')
  const [transactionsFiltrees, setTransactionsFiltrees] = useState<any[]>([])

  useEffect(() => {
    fetchCategories()
    fetchReport({ periode })
  }, [])

  // Mettre à jour les transactions filtrées quand reportData change
  useEffect(() => {
    if (reportData?.dernieresTransactions) {
      let filtered = [...reportData.dernieresTransactions]
      
      if (categorieFiltre) {
        filtered = filtered.filter(t => t.categorie?.id === categorieFiltre || t.categorieId === categorieFiltre)
      }
      
      if (typeFiltre !== 'tous') {
        filtered = filtered.filter(t => t.type === typeFiltre)
      }
      
      setTransactionsFiltrees(filtered)
    }
  }, [reportData, categorieFiltre, typeFiltre])

  const handleFilter = () => {
    if (periode === 'custom' && dateDebut && dateFin) {
      fetchReport({ dateDebut, dateFin })
    } else {
      fetchReport({ periode })
    }
    // Reset des filtres
    setCategorieFiltre('')
    setTypeFiltre('tous')
  }

  const statsParDevise = reportData?.statsParDevise || {}
  
  // Données pour les graphiques - conversion selon devise
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

  // Filtrer les données des graphiques par catégorie sélectionnée
  const entreesFiltrees = categorieFiltre 
    ? entreesParCategorie.filter(c => c.name === categories.find(cat => cat.id === categorieFiltre)?.nom)
    : entreesParCategorie
    
  const sortiesFiltrees = categorieFiltre
    ? sortiesParCategorie.filter(c => c.name === categories.find(cat => cat.id === categorieFiltre)?.nom)
    : sortiesParCategorie

  // Totaux selon la devise d'affichage
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

  const typeOptions = [
    { value: 'tous', label: 'Tous' },
    { value: 'entree', label: 'Entrées' },
    { value: 'sortie', label: 'Sorties' },
  ]

  const categorieOptions = [
    { value: '', label: 'Toutes les catégories' },
    ...categories.map(c => ({ value: c.id, label: c.nom })),
  ]

  const formatMontant = (value: number) => {
    if (deviseAffichage === 'USD') {
      return `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    }
    return `${value.toLocaleString()} FC`
  }

  // Obtenir le nom de la catégorie sélectionnée
  const selectedCategorieNom = categories.find(c => c.id === categorieFiltre)?.nom || ''

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
          <h1 className="text-2xl font-bold text-gray-900">Finances</h1>
          <p className="mt-1 text-sm text-gray-500">Suivez les entrées et sorties de l'église</p>
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
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Exporter
          </Button>
        </div>
      </div>

      {/* Filtres principaux */}
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
            <Filter className="mr-2 h-4 w-4" />
            Appliquer
          </Button>
        </div>
      </Card>

      {/* Filtres par catégorie */}
      <Card className="p-4">
        <div className="flex flex-wrap items-end gap-4">
          <div className="w-64">
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Filtrer par catégorie
            </label>
            <select
              value={categorieFiltre}
              onChange={(e) => setCategorieFiltre(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            >
              {categorieOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className="w-48">
            <Select
              label="Type de transaction"
              value={typeFiltre}
              onChange={(e) => setTypeFiltre(e.target.value as 'entree' | 'sortie' | 'tous')}
              options={typeOptions}
            />
          </div>
          {categorieFiltre && (
            <div className="flex items-center space-x-2">
              <Badge variant="info" size="md" className="flex items-center">
                Filtre: {selectedCategorieNom}
                <button
                  onClick={() => setCategorieFiltre('')}
                  className="ml-2 text-white hover:text-gray-200"
                >
                  ✕
                </button>
              </Badge>
            </div>
          )}
        </div>
      </Card>

      {/* Cartes de synthèse par devise */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Carte USD */}
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
          <p className="mt-2 text-xs text-gray-400 text-center">
            Taux: 1 USD = {TAUX_CHANGE} CDF
          </p>
        </Card>

        {/* Carte CDF */}
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

      {/* Graphiques en camembert */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <PieChartCard
          title={`Entrées par catégorie (${deviseAffichage})${categorieFiltre ? ` - ${selectedCategorieNom}` : ''}`}
          data={entreesFiltrees}
        />
        <PieChartCard
          title={`Sorties par catégorie (${deviseAffichage})${categorieFiltre ? ` - ${selectedCategorieNom}` : ''}`}
          data={sortiesFiltrees}
        />
      </div>

      {/* Liste des transactions filtrées */}
      <RecentTransactions
        transactions={transactionsFiltrees}
        title={`Transactions${categorieFiltre ? ` - ${selectedCategorieNom}` : ''}${typeFiltre !== 'tous' ? ` (${typeFiltre === 'entree' ? 'Entrées' : 'Sorties'})` : ''}`}
        onViewAll={() => router.push('/pasteur/transactions')}
      />

      {/* Info taux de change */}
      <div className="rounded-lg bg-blue-50 p-3 text-center text-sm text-blue-700">
        <p>Taux de change utilisé: 1 USD = {TAUX_CHANGE} CDF</p>
        <p className="text-xs mt-1">Les montants en USD sont convertis automatiquement pour les rapports en CDF</p>
        {categorieFiltre && (
          <p className="text-xs mt-1 text-blue-600">
            Affichage filtré par catégorie: {selectedCategorieNom}
          </p>
        )}
      </div>
    </div>
  )
}