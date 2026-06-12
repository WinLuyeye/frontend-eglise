'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Download, Calendar, TrendingUp, TrendingDown, DollarSign, Landmark } from 'lucide-react'
import { Card, Button, Select, Input } from '@/components/ui'
import { AreaChartCard, TransactionSummary } from '@/components/dashboard'
import { useTransactions } from '@/hooks/useTransactions'

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

  const periodeOptions = [
    { value: 'month', label: 'Ce mois' },
    { value: 'year', label: 'Cette année' },
    { value: 'custom', label: 'Personnalisé' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Rapports financiers
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Analyses détaillées de vos finances
          </p>
        </div>
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Exporter PDF
        </Button>
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
        </div>
      </Card>

      {/* Résumé par devise */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="p-4">
          <div className="flex items-center space-x-2 mb-4">
            <DollarSign className="h-5 w-5 text-blue-500" />
            <h3 className="font-semibold text-gray-900 dark:text-white">Résumé en USD</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className='text-gray-900 dark:text-white'>Total Entrées</span>
              <span className="font-semibold text-green-600">
                ${statsParDevise?.USD?.entrees?.toLocaleString() || 0}
              </span>
            </div>
            <div className="flex justify-between">
              <span className='text-gray-900 dark:text-white'>Total Sorties</span>
              <span className="font-semibold text-red-600">
                ${statsParDevise?.USD?.sorties?.toLocaleString() || 0}
              </span>
            </div>
            <div className="flex justify-between border-t pt-2">
              <span className='text-gray-900 dark:text-white'>Solde</span>
              <span className={`font-semibold ${(statsParDevise?.USD?.solde || 0) >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                ${statsParDevise?.USD?.solde?.toLocaleString() || 0}
              </span>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-2 mb-4">
            <Landmark className="h-5 w-5 text-green-500" />
            <h3 className="font-semibold text-gray-900 dark:text-white">Résumé en CDF</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className='text-gray-900 dark:text-white'>Total Entrées</span>
              <span className="font-semibold text-green-600">
                {statsParDevise?.CDF?.entrees?.toLocaleString() || 0} FC
              </span>
            </div>
            <div className="flex justify-between">
              <span className='text-gray-900 dark:text-white'>Total Sorties</span>
              <span className="font-semibold text-red-600">
                {statsParDevise?.CDF?.sorties?.toLocaleString() || 0} FC
              </span>
            </div>
            <div className="flex justify-between border-t pt-2">
              <span className='text-gray-900 dark:text-white'>Solde</span>
              <span className={`font-semibold ${(statsParDevise?.CDF?.solde || 0) >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                {statsParDevise?.CDF?.solde?.toLocaleString() || 0} FC
              </span>
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

      <TransactionSummary
        totalEntrees={reportData?.total?.entrees || 0}
        totalSorties={reportData?.total?.sorties || 0}
        solde={(reportData?.total?.entrees || 0) - (reportData?.total?.sorties || 0)}
        devise="CDF"
      />

      <div className="text-center text-xs text-gray-400">
        <p>Taux de change utilisé: 1 USD = {TAUX_CHANGE} CDF</p>
        <p className="mt-1">Rapport généré le {new Date().toLocaleDateString('fr-FR')}</p>
      </div>
    </div>
  )
}