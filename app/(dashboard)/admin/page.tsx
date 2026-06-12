'use client'

import { useEffect, useState } from 'react'
import { Users, DollarSign, TrendingUp, Wallet, Building2, FileText, UserPlus, ArrowUpRight, ArrowDownRight, Settings, Shield, HandHeart, Church, Landmark, PiggyBank } from 'lucide-react'
import { StatsCard, AreaChartCard, RecentTransactions, TransactionSummary } from '@/components/dashboard'
import { useDashboard } from '@/hooks/useDashboard'
import { useMembers } from '@/hooks/useMembers'
import { useAuth } from '@/hooks/useAuth'
import { useTransactions } from '@/hooks/useTransactions'
import { useRouter } from 'next/navigation'
import { Card, Button, Tabs } from '@/components/ui'

// Fonction utilitaire pour convertir les strings en nombres
const toNumber = (value: any): number => {
  if (value === null || value === undefined) return 0
  if (typeof value === 'number') return value
  if (typeof value === 'string') return parseFloat(value) || 0
  return 0
}

// Taux de change (1 USD = 2250 CDF)
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

export default function AdminDashboardPage() {
  const { user } = useAuth()
  const router = useRouter()
  const { globalData, isLoading, fetchGlobalDashboard } = useDashboard()
  const { members, fetchMembers } = useMembers()
  const { reportData, fetchReport } = useTransactions()
  const [deviseAffichage, setDeviseAffichage] = useState<'USD' | 'CDF'>('CDF')

  useEffect(() => {
    fetchGlobalDashboard()
    fetchMembers({ limit: 5 })
    fetchReport({ periode: 'year' })
  }, [])

  // Extraire et convertir les données en nombres
  const membresTotal = toNumber(globalData?.membres?.total)
  const membresActifs = toNumber(globalData?.membres?.actifs)
  const nouveauxMois = toNumber(globalData?.membres?.nouveauxMois)
  const tauxActivite = globalData?.membres?.tauxActivite || '0'
  
  // Données financières par devise
  const statsParDevise = reportData?.statsParDevise || {}
  
  // Données du mois
  const entreesMoisCDF = toNumber(globalData?.finances?.mois?.entrees)
  const sortiesMoisCDF = toNumber(globalData?.finances?.mois?.sorties)
  const soldeMoisCDF = entreesMoisCDF - sortiesMoisCDF
  
  const entreesMoisUSD = entreesMoisCDF / TAUX_CHANGE
  const sortiesMoisUSD = sortiesMoisCDF / TAUX_CHANGE
  const soldeMoisUSD = entreesMoisUSD - sortiesMoisUSD
  
  // Données de l'année
  const entreesAnneeCDF = toNumber(globalData?.finances?.annee?.entrees)
  const sortiesAnneeCDF = toNumber(globalData?.finances?.annee?.sorties)
  const soldeAnneeCDF = entreesAnneeCDF - sortiesAnneeCDF
  
  const entreesAnneeUSD = entreesAnneeCDF / TAUX_CHANGE
  const sortiesAnneeUSD = sortiesAnneeCDF / TAUX_CHANGE
  const soldeAnneeUSD = entreesAnneeUSD - sortiesAnneeUSD

  // Données par devise depuis le rapport
  const entreesUSD = toNumber(statsParDevise?.USD?.entrees)
  const sortiesUSD = toNumber(statsParDevise?.USD?.sorties)
  const soldeUSD = toNumber(statsParDevise?.USD?.solde)
  
  const entreesCDF = toNumber(statsParDevise?.CDF?.entrees)
  const sortiesCDF = toNumber(statsParDevise?.CDF?.sorties)
  const soldeCDF = toNumber(statsParDevise?.CDF?.solde)

  // Données pour les graphiques (en USD et CDF)
  const evolutionData = globalData?.evolutionMensuelle || []
  
  const chartDataCDF = evolutionData.map(item => ({
    mois: item.mois,
    entrées: toNumber(item.entrees),
    sorties: toNumber(item.sorties),
  }))
  
  const chartDataUSD = evolutionData.map(item => ({
    mois: item.mois,
    entrées: toNumber(item.entrees) / TAUX_CHANGE,
    sorties: toNumber(item.sorties) / TAUX_CHANGE,
  }))

  // Choisir les données selon la devise sélectionnée
  const chartData = deviseAffichage === 'USD' ? chartDataUSD : chartDataCDF
  const entreesMois = deviseAffichage === 'USD' ? entreesMoisUSD : entreesMoisCDF
  const sortiesMois = deviseAffichage === 'USD' ? sortiesMoisUSD : sortiesMoisCDF
  const soldeMois = deviseAffichage === 'USD' ? soldeMoisUSD : soldeMoisCDF
  const entreesAnnee = deviseAffichage === 'USD' ? entreesAnneeUSD : entreesAnneeCDF
  const sortiesAnnee = deviseAffichage === 'USD' ? sortiesAnneeUSD : sortiesAnneeCDF
  const soldeAnnee = deviseAffichage === 'USD' ? soldeAnneeUSD : soldeAnneeCDF

  const topDonateurs = globalData?.topDonateurs || []
  const recentTransactions = globalData?.transactionsRecentes || []
  const rapportsRecents = globalData?.rapportsRecents || []

  // Formater les montants selon la devise
  const formatMontant = (montant: number) => {
    if (deviseAffichage === 'USD') {
      return `$${montant.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    }
    return `${montant.toLocaleString()} FC`
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center space-x-3">
            <div className="rounded-full bg-primary-100 p-2 dark:bg-primary-900">
              <Church className="h-6 w-6 text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Tableau de bord
              </h1>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Bienvenue, {user?.nom || user?.email || 'Administrateur'} ! Voici un aperçu de votre église.
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <DeviseSelector value={deviseAffichage} onChange={setDeviseAffichage} />
          <Button variant="outline" onClick={() => router.push('/admin/membres/nouveau')}>
            <UserPlus className="mr-2 h-4 w-4" />
            Nouveau membre
          </Button>
        </div>
      </div>

      {/* Cartes de statistiques - Membres */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Membres"
          value={membresTotal}
          icon={<Users className="h-5 w-5" />}
          trend={{ value: 12, label: 'vs mois dernier' }}
          color="primary"
          isLoading={isLoading}
        />
        
        <StatsCard
          title="Membres Actifs"
          value={membresActifs}
          icon={<Users className="h-5 w-5" />}
          trend={{ value: 8, label: 'vs mois dernier' }}
          color="success"
          isLoading={isLoading}
        />
        
        <StatsCard
          title="Nouveaux Membres"
          value={nouveauxMois}
          icon={<UserPlus className="h-5 w-5" />}
          trend={{ value: 5, label: 'ce mois' }}
          color="info"
          isLoading={isLoading}
        />
        
        <StatsCard
          title="Taux d'activité"
          value={`${tauxActivite}%`}
          icon={<TrendingUp className="h-5 w-5" />}
          color="warning"
          isLoading={isLoading}
        />
      </div>

      {/* Section des soldes par devise */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Solde en USD */}
        <Card className="overflow-hidden border-l-4 border-l-blue-500">
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 dark:from-blue-950/30 dark:to-blue-900/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="rounded-full bg-blue-500 p-2">
                  <DollarSign className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Solde en USD</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    ${soldeUSD.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
              <Landmark className="h-8 w-8 text-blue-300" />
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
              <div>
                <p className="text-gray-500">Entrées USD</p>
                <p className="font-semibold text-green-600">+${entreesUSD.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-gray-500">Sorties USD</p>
                <p className="font-semibold text-red-600">-${sortiesUSD.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Solde en CDF */}
        <Card className="overflow-hidden border-l-4 border-l-green-500">
          <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 dark:from-green-950/30 dark:to-green-900/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="rounded-full bg-green-500 p-2">
                  <PiggyBank className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-green-600 dark:text-green-400">Solde en CDF</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {soldeCDF.toLocaleString()} FC
                  </p>
                </div>
              </div>
              <Landmark className="h-8 w-8 text-green-300" />
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
              <div>
                <p className="text-gray-500">Entrées CDF</p>
                <p className="font-semibold text-green-600">+{entreesCDF.toLocaleString()} FC</p>
              </div>
              <div>
                <p className="text-gray-500">Sorties CDF</p>
                <p className="font-semibold text-red-600">-{sortiesCDF.toLocaleString()} FC</p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Cartes de statistiques - Finances mensuelles */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatsCard
          title="Entrées du mois"
          value={entreesMois}
          devise={deviseAffichage}
          icon={<TrendingUp className="h-5 w-5" />}
          trend={{ value: 15, label: 'vs mois dernier' }}
          color="success"
          isLoading={isLoading}
        />
        
        <StatsCard
          title="Sorties du mois"
          value={sortiesMois}
          devise={deviseAffichage}
          icon={<ArrowDownRight className="h-5 w-5" />}
          trend={{ value: 5, label: 'vs mois dernier' }}
          color="danger"
          isLoading={isLoading}
        />
        
        <StatsCard
          title="Solde du mois"
          value={soldeMois}
          devise={deviseAffichage}
          icon={<Wallet className="h-5 w-5" />}
          color={soldeMois >= 0 ? 'success' : 'danger'}
          isLoading={isLoading}
        />
      </div>

      {/* Graphique d'évolution financière avec sélecteur de devise intégré */}
      <AreaChartCard
        title={`Évolution financière (${deviseAffichage === 'USD' ? 'USD' : 'CDF'})`}
        subtitle="Entrées et sorties sur les 12 derniers mois"
        data={chartData}
        dataKey="entrées"
        xAxisKey="mois"
        colors={['#3b82f6', '#ef4444']}
      />

      {/* Cartes de statistiques - Année */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatsCard
          title="Total Entrées (Année)"
          value={entreesAnnee}
          devise={deviseAffichage}
          icon={<Wallet className="h-5 w-5" />}
          color="info"
          isLoading={isLoading}
        />
        <StatsCard
          title="Total Sorties (Année)"
          value={sortiesAnnee}
          devise={deviseAffichage}
          icon={<ArrowDownRight className="h-5 w-5" />}
          color="warning"
          isLoading={isLoading}
        />
        <StatsCard
          title="Solde (Année)"
          value={soldeAnnee}
          devise={deviseAffichage}
          icon={<PiggyBank className="h-5 w-5" />}
          color={soldeAnnee >= 0 ? 'success' : 'danger'}
          isLoading={isLoading}
        />
      </div>

      {/* Section principale avec transactions et top donateurs */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Transactions récentes */}
        <div className="lg:col-span-2">
          <RecentTransactions
            transactions={recentTransactions}
            title="Transactions récentes"
            onViewAll={() => router.push('/admin/finances/transactions')}
            isLoading={isLoading}
          />
        </div>

        {/* Top donateurs */}
        <Card className="p-4">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <HandHeart className="h-5 w-5 text-primary-600" />
              <h3 className="font-semibold text-gray-900 dark:text-white">Top Donateurs</h3>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/admin/finances/rapports')}
            >
              Voir tout
            </Button>
          </div>
          <div className="space-y-3">
            {topDonateurs.length === 0 ? (
              <div className="flex h-32 flex-col items-center justify-center text-center">
                <HandHeart className="h-8 w-8 text-gray-300" />
                <p className="mt-2 text-sm text-gray-500">Aucun donateur enregistré</p>
              </div>
            ) : (
              topDonateurs.slice(0, 5).map((donateur, index) => (
                <div key={donateur.id} className="flex items-center justify-between rounded-lg p-2 hover:bg-gray-50 dark:hover:bg-gray-800">
                  <div className="flex items-center space-x-3">
                    <div className={`flex h-8 w-8 items-center justify-center rounded-full font-bold ${
                      index === 0 ? 'bg-yellow-100 text-yellow-600' :
                      index === 1 ? 'bg-gray-200 text-gray-600' :
                      index === 2 ? 'bg-orange-100 text-orange-600' :
                      'bg-gray-100 text-gray-500'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {donateur.prenom} {donateur.nom}
                      </p>
                      <p className="text-xs text-gray-500">
                        Total des dons
                      </p>
                    </div>
                  </div>
                  <p className="font-semibold text-green-600 dark:text-green-400">
                    {deviseAffichage === 'USD' 
                      ? `$${(toNumber(donateur.total) / TAUX_CHANGE).toLocaleString(undefined, { minimumFractionDigits: 2 })}`
                      : `${toNumber(donateur.total).toLocaleString()} FC`
                    }
                  </p>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      {/* Actions rapides */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <button
          onClick={() => router.push('/admin/membres')}
          className="flex items-center rounded-lg border p-4 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
        >
          <Users className="mr-3 h-8 w-8 text-primary-600" />
          <div className="text-left">
            <p className="font-medium text-gray-900 dark:text-white">Gérer les membres</p>
            <p className="text-sm text-gray-500">Ajouter, modifier, supprimer</p>
          </div>
        </button>

        <button
          onClick={() => router.push('/admin/finances/transactions')}
          className="flex items-center rounded-lg border p-4 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
        >
          <DollarSign className="mr-3 h-8 w-8 text-green-600" />
          <div className="text-left">
            <p className="font-medium text-gray-900 dark:text-white">Gérer les finances</p>
            <p className="text-sm text-gray-500">Transactions, rapports</p>
          </div>
        </button>

        <button
          onClick={() => router.push('/admin/departements')}
          className="flex items-center rounded-lg border p-4 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
        >
          <Building2 className="mr-3 h-8 w-8 text-blue-600" />
          <div className="text-left">
            <p className="font-medium text-gray-900 dark:text-white">Départements</p>
            <p className="text-sm text-gray-500">Gérer les départements</p>
          </div>
        </button>

        <button
          onClick={() => router.push('/admin/utilisateurs')}
          className="flex items-center rounded-lg border p-4 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
        >
          <Shield className="mr-3 h-8 w-8 text-purple-600" />
          <div className="text-left">
            <p className="font-medium text-gray-900 dark:text-white">Utilisateurs</p>
            <p className="text-sm text-gray-500">Gérer les accès</p>
          </div>
        </button>
      </div>

      {/* Version et informations */}
      {/* <Card className="p-4 text-center">
        <div className="text-xs text-gray-400">
          <p>Version 2.0.0 - Support multi-devises (USD/CDF)</p>
          <p className="mt-1">Taux de change: 1 USD = {TAUX_CHANGE} CDF</p>
          <p className="mt-2">
            <span className="inline-flex items-center">
              <div className="mr-1 h-2 w-2 rounded-full bg-blue-500"></div>
              Transactions en USD
            </span>
            <span className="ml-3 inline-flex items-center">
              <div className="mr-1 h-2 w-2 rounded-full bg-green-500"></div>
              Transactions en CDF
            </span>
          </p>
        </div>
      </Card> */}
    </div>
  )
}