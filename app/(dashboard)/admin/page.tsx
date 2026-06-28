// app/(dashboard)/admin/page.tsx
'use client'

import { useEffect, useState, useMemo } from 'react'
import { 
  Users, DollarSign, TrendingUp, Wallet, Building2, FileText, 
  UserPlus, ArrowUpRight, ArrowDownRight, Shield, HandHeart, 
  Church, Landmark, PiggyBank 
} from 'lucide-react'
import { StatsCard, AreaChartCard, RecentTransactions } from '@/components/dashboard'
import { useDashboard } from '@/hooks/useDashboard'
import { useMembers } from '@/hooks/useMembers'
import { useAuth } from '@/hooks/useAuth'
import { useTransactions } from '@/hooks/useTransactions'
import { useRouter } from 'next/navigation'
import { Card, Button } from '@/components/ui'

// Fonction utilitaire pour convertir les strings en nombres
const toNumber = (value: any): number => {
  if (value === null || value === undefined) return 0
  if (typeof value === 'number') return value
  if (typeof value === 'string') return parseFloat(value) || 0
  return 0
}

// Taux de change (1 USD = 2250 CDF)
const TAUX_CHANGE = 2250

// ✅ Fonction pour normaliser le type (gère REVENU/DEPENSE et entree/sortie)
const normalizeType = (type: string): 'entree' | 'sortie' | null => {
  if (!type) return null
  const lower = type.toLowerCase()
  if (lower === 'revenu' || lower === 'entree' || lower === 'revenue') return 'entree'
  if (lower === 'depense' || lower === 'sortie' || lower === 'expense') return 'sortie'
  return null
}

// Composant pour le sélecteur de devise
const DeviseSelector = ({ value, onChange }: { value: 'USD' | 'CDF', onChange: (v: 'USD' | 'CDF') => void }) => {
  return (
    <div className="flex rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-1">
      <button
        onClick={() => onChange('USD')}
        className={`px-3 py-1 text-sm rounded-md transition-all duration-200 ${
          value === 'USD' 
            ? 'bg-primary-500 text-white shadow-sm' 
            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
        }`}
      >
        USD
      </button>
      <button
        onClick={() => onChange('CDF')}
        className={`px-3 py-1 text-sm rounded-md transition-all duration-200 ${
          value === 'CDF' 
            ? 'bg-primary-500 text-white shadow-sm' 
            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
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
  const { reportData, fetchReport, transactions } = useTransactions()
  const [deviseAffichage, setDeviseAffichage] = useState<'USD' | 'CDF'>('CDF')

  useEffect(() => {
    fetchGlobalDashboard()
    fetchMembers({ limit: 5 })
    fetchReport({ periode: 'all' })
  }, [])

  // ✅ Calculer les données du dashboard
  const dashboardData = useMemo(() => {
    // Extraire les données du dashboard global
    const membresTotal = toNumber(globalData?.membres?.total)
    const membresActifs = toNumber(globalData?.membres?.actifs)
    const nouveauxMois = toNumber(globalData?.membres?.nouveauxMois)
    const tauxActivite = globalData?.membres?.tauxActivite || '0'
    
    // ✅ Récupérer les transactions - PRIORISER reportData.transactions
    const transactionsList = reportData?.transactions || transactions || []
    
    console.log('📊 Transactions list:', transactionsList.length)
    console.log('📊 Première transaction:', transactionsList[0])
    
    // ✅ Calculer les périodes
    const now = new Date()
    const debutMois = new Date(now.getFullYear(), now.getMonth(), 1)
    const debutAnnee = new Date(now.getFullYear(), 0, 1)
    
    // ✅ Filtrer les transactions du mois
    const transactionsMois = transactionsList.filter(t => {
      const date = new Date(t.dateTransaction)
      return date >= debutMois
    })
    
    // ✅ Filtrer les transactions de l'année
    const transactionsAnnee = transactionsList.filter(t => {
      const date = new Date(t.dateTransaction)
      return date >= debutAnnee
    })
    
    console.log('📊 Transactions du mois:', transactionsMois.length)
    console.log('📊 Transactions de l\'année:', transactionsAnnee.length)
    
    // ✅ Fonction pour calculer les totaux par devise
    const calculerTotaux = (transactionsFiltrees: any[]) => {
      let entreesUSD = 0
      let sortiesUSD = 0
      let entreesCDF = 0
      let sortiesCDF = 0
      
      transactionsFiltrees.forEach(t => {
        const montant = toNumber(t.montant)
        const devise = t.devise || 'CDF'
        const typeNormalise = normalizeType(t.type)
        
        console.log(`💰 ${t.type} -> ${typeNormalise} - ${montant} ${devise}`)
        
        if (typeNormalise === 'entree') {
          if (devise === 'USD') {
            entreesUSD += montant
          } else {
            entreesCDF += montant
          }
        } else if (typeNormalise === 'sortie') {
          if (devise === 'USD') {
            sortiesUSD += montant
          } else {
            sortiesCDF += montant
          }
        }
      })
      
      return {
        entreesUSD,
        sortiesUSD,
        entreesCDF,
        sortiesCDF,
        soldeUSD: entreesUSD - sortiesUSD,
        soldeCDF: entreesCDF - sortiesCDF
      }
    }
    
    // ✅ Calculer les totaux
    const totauxMois = calculerTotaux(transactionsMois)
    const totauxAnnee = calculerTotaux(transactionsAnnee)
    
    // ✅ Entrées/Sorties totales par devise (toutes périodes)
    const statsParDevise = reportData?.statsParDevise || {}
    const totalEntreesUSD = toNumber(statsParDevise?.USD?.entrees)
    const totalSortiesUSD = toNumber(statsParDevise?.USD?.sorties)
    const totalSoldeUSD = toNumber(statsParDevise?.USD?.solde)
    const totalEntreesCDF = toNumber(statsParDevise?.CDF?.entrees)
    const totalSortiesCDF = toNumber(statsParDevise?.CDF?.sorties)
    const totalSoldeCDF = toNumber(statsParDevise?.CDF?.solde)
    
    console.log('📊 Totaux mois CDF:', totauxMois.entreesCDF, totauxMois.sortiesCDF)
    console.log('📊 Totaux mois USD:', totauxMois.entreesUSD, totauxMois.sortiesUSD)
    
    // ✅ Données pour les graphiques
    let evolutionData = globalData?.evolutionMensuelle || []
    
    if (evolutionData.length === 0 && transactionsList.length > 0) {
      const moisMap = {}
      transactionsList.forEach(t => {
        const date = new Date(t.dateTransaction)
        const moisKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
        const moisLabel = date.toLocaleString('fr-FR', { month: 'long', year: 'numeric' })
        const montant = toNumber(t.montant)
        const devise = t.devise || 'CDF'
        const typeNormalise = normalizeType(t.type)
        let montantCDF = devise === 'USD' ? montant * TAUX_CHANGE : montant
        
        if (!moisMap[moisKey]) {
          moisMap[moisKey] = { mois: moisLabel, entrees: 0, sorties: 0 }
        }
        
        if (typeNormalise === 'entree') {
          moisMap[moisKey].entrees += montantCDF
        } else if (typeNormalise === 'sortie') {
          moisMap[moisKey].sorties += montantCDF
        }
      })
      
      evolutionData = Object.values(moisMap).slice(-12)
    }
    
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
    
    return {
      membresTotal,
      membresActifs,
      nouveauxMois,
      tauxActivite,
      
      // Mois
      entreesMoisCDF: totauxMois.entreesCDF,
      sortiesMoisCDF: totauxMois.sortiesCDF,
      soldeMoisCDF: totauxMois.soldeCDF,
      entreesMoisUSD: totauxMois.entreesUSD,
      sortiesMoisUSD: totauxMois.sortiesUSD,
      soldeMoisUSD: totauxMois.soldeUSD,
      
      // Année
      entreesAnneeCDF: totauxAnnee.entreesCDF,
      sortiesAnneeCDF: totauxAnnee.sortiesCDF,
      soldeAnneeCDF: totauxAnnee.soldeCDF,
      entreesAnneeUSD: totauxAnnee.entreesUSD,
      sortiesAnneeUSD: totauxAnnee.sortiesUSD,
      soldeAnneeUSD: totauxAnnee.soldeUSD,
      
      // Totaux globaux
      totalEntreesUSD,
      totalSortiesUSD,
      totalSoldeUSD,
      totalEntreesCDF,
      totalSortiesCDF,
      totalSoldeCDF,
      
      // Graphiques
      chartDataCDF,
      chartDataUSD,
      
      // Transactions récentes
      recentTransactions: transactionsList.slice(0, 5),
      topDonateurs: globalData?.topDonateurs || [],
      evolutionData
    }
  }, [globalData, reportData, transactions])

  const {
    membresTotal,
    membresActifs,
    nouveauxMois,
    tauxActivite,
    entreesMoisCDF,
    sortiesMoisCDF,
    soldeMoisCDF,
    entreesMoisUSD,
    sortiesMoisUSD,
    soldeMoisUSD,
    entreesAnneeCDF,
    sortiesAnneeCDF,
    soldeAnneeCDF,
    entreesAnneeUSD,
    sortiesAnneeUSD,
    soldeAnneeUSD,
    totalEntreesUSD,
    totalSortiesUSD,
    totalSoldeUSD,
    totalEntreesCDF,
    totalSortiesCDF,
    totalSoldeCDF,
    chartDataCDF,
    chartDataUSD,
    recentTransactions,
    topDonateurs
  } = dashboardData

  // ✅ Sélectionner les données selon la devise d'affichage
  const chartData = deviseAffichage === 'USD' ? chartDataUSD : chartDataCDF
  const entreesMois = deviseAffichage === 'USD' ? entreesMoisUSD : entreesMoisCDF
  const sortiesMois = deviseAffichage === 'USD' ? sortiesMoisUSD : sortiesMoisCDF
  const soldeMois = deviseAffichage === 'USD' ? soldeMoisUSD : soldeMoisCDF
  const entreesAnnee = deviseAffichage === 'USD' ? entreesAnneeUSD : entreesAnneeCDF
  const sortiesAnnee = deviseAffichage === 'USD' ? sortiesAnneeUSD : sortiesAnneeCDF
  const soldeAnnee = deviseAffichage === 'USD' ? soldeAnneeUSD : soldeAnneeCDF

  const formatMontant = (montant: number) => {
    if (deviseAffichage === 'USD') {
      return `$${montant.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    }
    return `${montant.toLocaleString()} FC`
  }

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent dark:border-primary-400"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex items-center space-x-3">
          <div className="rounded-full bg-primary-100 p-2 dark:bg-primary-900/30">
            <Church className="h-6 w-6 text-primary-600 dark:text-primary-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Tableau de bord
            </h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Bienvenue, {user?.nom || user?.email || 'Administrateur'} ! Voici un aperçu de votre église.
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <DeviseSelector value={deviseAffichage} onChange={setDeviseAffichage} />
          <Button onClick={() => router.push('/admin/membres/nouveau')}>
            <UserPlus className="mr-2 h-4 w-4" />
            Nouveau membre
          </Button>
        </div>
      </div>

      {/* Membres */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard title="Total Membres" value={membresTotal} icon={<Users className="h-5 w-5" />} color="primary" isLoading={isLoading} />
        <StatsCard title="Membres Actifs" value={membresActifs} icon={<Users className="h-5 w-5" />} color="success" isLoading={isLoading} />
        <StatsCard title="Nouveaux Membres" value={nouveauxMois} icon={<UserPlus className="h-5 w-5" />} color="info" isLoading={isLoading} />
        <StatsCard title="Taux d'activité" value={`${tauxActivite}%`} icon={<TrendingUp className="h-5 w-5" />} color="warning" isLoading={isLoading} />
      </div>

      {/* Soldes par devise */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="overflow-hidden border-l-4 border-l-blue-500 dark:border-l-blue-400">
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 dark:from-blue-950/30 dark:to-blue-900/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="rounded-full bg-blue-500 p-2 dark:bg-blue-600">
                  <DollarSign className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-blue-700 dark:text-blue-300">Solde en USD</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    ${totalSoldeUSD.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
              <Landmark className="h-8 w-8 text-blue-300 dark:text-blue-600" />
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
              <div>
                <p className="text-gray-600 dark:text-gray-400">Entrées USD</p>
                <p className="font-semibold text-green-700 dark:text-green-400">+${totalEntreesUSD.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-400">Sorties USD</p>
                <p className="font-semibold text-red-700 dark:text-red-400">-${totalSortiesUSD.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </Card>

        <Card className="overflow-hidden border-l-4 border-l-green-500 dark:border-l-green-400">
          <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 dark:from-green-950/30 dark:to-green-900/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="rounded-full bg-green-500 p-2 dark:bg-green-600">
                  <PiggyBank className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-green-700 dark:text-green-300">Solde en CDF</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {totalSoldeCDF.toLocaleString()} FC
                  </p>
                </div>
              </div>
              <Landmark className="h-8 w-8 text-green-300 dark:text-green-600" />
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
              <div>
                <p className="text-gray-600 dark:text-gray-400">Entrées CDF</p>
                <p className="font-semibold text-green-700 dark:text-green-400">+{totalEntreesCDF.toLocaleString()} FC</p>
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-400">Sorties CDF</p>
                <p className="font-semibold text-red-700 dark:text-red-400">-{totalSortiesCDF.toLocaleString()} FC</p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Finances mensuelles */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatsCard
          title="Entrées du mois"
          value={entreesMois}
          devise={deviseAffichage}
          icon={<TrendingUp className="h-5 w-5" />}
          color="success"
          isLoading={isLoading}
        />
        <StatsCard
          title="Sorties du mois"
          value={sortiesMois}
          devise={deviseAffichage}
          icon={<ArrowDownRight className="h-5 w-5" />}
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

      {/* Graphique */}
      <AreaChartCard
        title={`Évolution financière (${deviseAffichage === 'USD' ? 'USD' : 'CDF'})`}
        subtitle="Entrées et sorties sur les 12 derniers mois"
        data={chartData}
        dataKey="entrées"
        xAxisKey="mois"
        colors={['#3b82f6', '#ef4444']}
      />

      {/* Finances annuelles */}
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

      {/* Transactions récentes et top donateurs */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RecentTransactions
            transactions={recentTransactions}
            title="Transactions récentes"
            onViewAll={() => router.push('/admin/finances/transactions')}
            isLoading={isLoading}
          />
        </div>

        <Card className="p-4">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <HandHeart className="h-5 w-5 text-primary-600 dark:text-primary-400" />
              <h3 className="font-semibold text-gray-900 dark:text-white">Top Donateurs</h3>
            </div>
            <Button variant="ghost" size="sm" onClick={() => router.push('/admin/finances/rapports')}>
              Voir tout
            </Button>
          </div>
          <div className="space-y-3">
            {topDonateurs.length === 0 ? (
              <div className="flex h-32 flex-col items-center justify-center text-center">
                <HandHeart className="h-8 w-8 text-gray-400 dark:text-gray-600" />
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Aucun donateur enregistré</p>
              </div>
            ) : (
              topDonateurs.slice(0, 5).map((donateur, index) => (
                <div key={donateur.id} className="flex items-center justify-between rounded-lg p-2 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <div className="flex items-center space-x-3">
                    <div className={`flex h-8 w-8 items-center justify-center rounded-full font-bold ${
                      index === 0 ? 'bg-yellow-100 text-yellow-700' :
                      index === 1 ? 'bg-gray-200 text-gray-700' :
                      index === 2 ? 'bg-orange-100 text-orange-700' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {donateur.prenom} {donateur.nom}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Total des dons</p>
                    </div>
                  </div>
                  <p className="font-semibold text-green-700 dark:text-green-400">
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
        <button onClick={() => router.push('/admin/membres')} className="flex items-center rounded-lg border border-gray-200 bg-white p-4 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-gray-800">
          <Users className="mr-3 h-8 w-8 text-primary-600" />
          <div className="text-left">
            <p className="font-medium text-gray-900 dark:text-white">Gérer les membres</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Ajouter, modifier, supprimer</p>
          </div>
        </button>
        <button onClick={() => router.push('/admin/finances/transactions')} className="flex items-center rounded-lg border border-gray-200 bg-white p-4 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-gray-800">
          <DollarSign className="mr-3 h-8 w-8 text-green-600" />
          <div className="text-left">
            <p className="font-medium text-gray-900 dark:text-white">Gérer les finances</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Transactions, rapports</p>
          </div>
        </button>
        <button onClick={() => router.push('/admin/departements')} className="flex items-center rounded-lg border border-gray-200 bg-white p-4 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-gray-800">
          <Building2 className="mr-3 h-8 w-8 text-blue-600" />
          <div className="text-left">
            <p className="font-medium text-gray-900 dark:text-white">Départements</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Gérer les départements</p>
          </div>
        </button>
        <button onClick={() => router.push('/admin/utilisateurs')} className="flex items-center rounded-lg border border-gray-200 bg-white p-4 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-gray-800">
          <Shield className="mr-3 h-8 w-8 text-purple-600" />
          <div className="text-left">
            <p className="font-medium text-gray-900 dark:text-white">Utilisateurs</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Gérer les accès</p>
          </div>
        </button>
      </div>
    </div>
  )
}