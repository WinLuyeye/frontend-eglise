'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Users, 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  FileText, 
  Church, 
  HandHeart,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  UserPlus,
  Eye
} from 'lucide-react'
import { StatsCard, AreaChartCard, RecentTransactions } from '@/components/dashboard'
import { Card, Button, Badge, Spinner } from '@/components/ui'
import { useDashboard } from '@/hooks/useDashboard'
import { useMembers } from '@/hooks/useMembers'
import { useAuth } from '@/hooks/useAuth'
import { formatCurrency, formatDate } from '@/utils/formatters'

// Fonction utilitaire pour convertir les strings en nombres
const toNumber = (value: any): number => {
  if (value === null || value === undefined) return 0
  if (typeof value === 'number') return value
  if (typeof value === 'string') return parseFloat(value) || 0
  return 0
}

const TAUX_CHANGE = 2250

export default function PasteurDashboardPage() {
  const { user } = useAuth()
  const router = useRouter()
  const { globalData, isLoading, fetchGlobalDashboard } = useDashboard()
  const { members, fetchMembers } = useMembers()
  const [deviseAffichage, setDeviseAffichage] = useState<'USD' | 'CDF'>('CDF')

  useEffect(() => {
    fetchGlobalDashboard()
    fetchMembers({ limit: 5 })
  }, [])

  // Données des membres
  const totalMembres = toNumber(globalData?.membres?.total)
  const membresActifs = toNumber(globalData?.membres?.actifs)
  const nouveauxMois = toNumber(globalData?.membres?.nouveauxMois)
  const tauxActivite = globalData?.membres?.tauxActivite || '0'

  // Données financières
  const entreesMois = toNumber(globalData?.finances?.mois?.entrees)
  const sortiesMois = toNumber(globalData?.finances?.mois?.sorties)
  const soldeMois = entreesMois - sortiesMois

  const entreesAnnee = toNumber(globalData?.finances?.annee?.entrees)
  const sortiesAnnee = toNumber(globalData?.finances?.annee?.sorties)
  const soldeAnnee = entreesAnnee - sortiesAnnee

  // Données pour le graphique
  const chartData = globalData?.evolutionMensuelle?.map(item => ({
    mois: item.mois,
    entrées: toNumber(item.entrees),
    sorties: toNumber(item.sorties),
  })) || []

  // Top donateurs
  const topDonateurs = globalData?.topDonateurs || []
  
  // Rapports récents
  const rapportsRecents = globalData?.rapportsRecents || []

  // Transactions récentes
  const recentTransactions = globalData?.transactionsRecentes || []

  const formatMontant = (montant: number) => {
    if (deviseAffichage === 'USD') {
      return `$${(montant / TAUX_CHANGE).toLocaleString(undefined, { minimumFractionDigits: 2 })}`
    }
    return `${montant.toLocaleString()} FC`
  }

  // Sélecteur de devise
  const DeviseSelector = () => (
    <div className="flex rounded-lg border">
      <button
        onClick={() => setDeviseAffichage('CDF')}
        className={`px-3 py-1 text-sm rounded-l-md transition-colors ${
          deviseAffichage === 'CDF' 
            ? 'bg-primary-500 text-white' 
            : 'text-gray-600 hover:bg-gray-100'
        }`}
      >
        CDF
      </button>
      <button
        onClick={() => setDeviseAffichage('USD')}
        className={`px-3 py-1 text-sm rounded-r-md transition-colors ${
          deviseAffichage === 'USD' 
            ? 'bg-primary-500 text-white' 
            : 'text-gray-600 hover:bg-gray-100'
        }`}
      >
        USD
      </button>
    </div>
  )

  if (isLoading) {
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
        <div className="flex items-center space-x-3">
          <div className="rounded-full bg-primary-100 p-2">
            <Church className="h-6 w-6 text-primary-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Tableau de bord - Pasteur
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Bienvenue, Pasteur {user?.nom || ''} ! Voici la vision globale de l'église.
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <DeviseSelector />
          <Button variant="outline" onClick={() => router.push('/pasteur/rapports')}>
            <FileText className="mr-2 h-4 w-4" />
            Voir les rapports
          </Button>
        </div>
      </div>

      {/* Cartes statistiques - Membres */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Membres"
          value={totalMembres}
          icon={<Users className="h-5 w-5" />}
          color="primary"
        />
        <StatsCard
          title="Membres Actifs"
          value={membresActifs}
          icon={<Users className="h-5 w-5" />}
          color="success"
        />
        <StatsCard
          title="Nouveaux ce mois"
          value={nouveauxMois}
          icon={<UserPlus className="h-5 w-5" />}
          color="info"
        />
        <StatsCard
          title="Taux d'activité"
          value={`${tauxActivite}%`}
          icon={<TrendingUp className="h-5 w-5" />}
          color="warning"
        />
      </div>

      {/* Cartes financières */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatsCard
          title="Entrées du mois"
          value={formatMontant(entreesMois)}
          icon={<TrendingUp className="h-5 w-5" />}
          color="success"
        />
        <StatsCard
          title="Sorties du mois"
          value={formatMontant(sortiesMois)}
          icon={<ArrowDownRight className="h-5 w-5" />}
          color="danger"
        />
        <StatsCard
          title="Solde du mois"
          value={formatMontant(soldeMois)}
          icon={<Wallet className="h-5 w-5" />}
          color={soldeMois >= 0 ? 'success' : 'danger'}
        />
      </div>

      {/* Graphique d'évolution */}
      <AreaChartCard
        title="Évolution financière"
        subtitle={`Entrées et sorties sur les 12 derniers mois (${deviseAffichage})`}
        data={chartData}
        dataKey="entrées"
        xAxisKey="mois"
        colors={['#3b82f6', '#ef4444']}
      />

      {/* Finances annuelles */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatsCard
          title="Total Entrées (Année)"
          value={formatMontant(entreesAnnee)}
          icon={<Wallet className="h-5 w-5" />}
          color="info"
        />
        <StatsCard
          title="Total Sorties (Année)"
          value={formatMontant(sortiesAnnee)}
          icon={<ArrowDownRight className="h-5 w-5" />}
          color="warning"
        />
        <StatsCard
          title="Solde (Année)"
          value={formatMontant(soldeAnnee)}
          icon={<Wallet className="h-5 w-5" />}
          color={soldeAnnee >= 0 ? 'success' : 'danger'}
        />
      </div>

      {/* Transactions et top donateurs */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RecentTransactions
            transactions={recentTransactions}
            title="Transactions récentes"
            onViewAll={() => router.push('/pasteur/finances')}
          />
        </div>
        <Card className="p-4">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <HandHeart className="h-5 w-5 text-primary-600" />
              <h3 className="font-semibold">Top Donateurs</h3>
            </div>
          </div>
          <div className="space-y-3">
            {topDonateurs.length === 0 ? (
              <div className="flex h-32 flex-col items-center justify-center text-center">
                <HandHeart className="h-8 w-8 text-gray-300" />
                <p className="mt-2 text-sm text-gray-500">Aucun donateur</p>
              </div>
            ) : (
              topDonateurs.slice(0, 5).map((donateur, index) => (
                <div key={donateur.id} className="flex items-center justify-between rounded-lg p-2 hover:bg-gray-50">
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
                      <p className="font-medium">{donateur.prenom} {donateur.nom}</p>
                      <p className="text-xs text-gray-500">Total des dons</p>
                    </div>
                  </div>
                  <p className="font-semibold text-green-600">
                    {formatMontant(toNumber(donateur.total))}
                  </p>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      {/* Rapports récents */}
      <Card className="p-4">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900 dark:text-white">Rapports départementaux récents</h3>
          <Button variant="ghost" size="sm" onClick={() => router.push('/pasteur/rapports')}>
            Voir tout
            <ArrowUpRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {rapportsRecents.length === 0 ? (
            <div className="col-span-full flex h-32 flex-col items-center justify-center text-center">
              <FileText className="h-8 w-8 text-gray-300" />
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Aucun rapport récent</p>
            </div>
          ) : (
            rapportsRecents.slice(0, 3).map((rapport) => (
              <div key={rapport.id} className="rounded-lg border p-3 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{rapport.titre}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{rapport.departement?.nom}</p>
                    <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">{formatDate(rapport.createdAt)}</p>
                  </div>
                  <button
                    onClick={() => router.push(`/pasteur/rapports/${rapport.id}`)}
                    className="text-primary-600 hover:text-primary-700"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  )
}