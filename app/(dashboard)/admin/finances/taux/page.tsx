'use client'

import { useState, useEffect } from 'react'
import { Card, Input, Button, Table } from '@/components/ui'
import { formatDate } from '@/utils/formatters'

interface TauxChange {
  id: string
  date: string
  tauxUSD: number
  source: string
}

export default function TauxChangePage() {
  const [taux, setTaux] = useState<TauxChange[]>([])
  const [nouveauTaux, setNouveauTaux] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    fetchTaux()
  }, [])

  const fetchTaux = async () => {
    // Récupérer l'historique des taux
    setIsLoading(true)
    try {
      const response = await fetch('/api/taux-change')
      const data = await response.json()
      setTaux(data)
    } catch (error) {
      console.error('Erreur:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      await fetch('/api/taux-change', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tauxUSD: parseFloat(nouveauTaux) })
      })
      setNouveauTaux('')
      await fetchTaux()
    } catch (error) {
      console.error('Erreur:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const columns = [
    { key: 'date', header: 'Date', cell: (t: TauxChange) => formatDate(t.date) },
    { key: 'tauxUSD', header: '1 USD = X CDF', cell: (t: TauxChange) => t.tauxUSD.toLocaleString() },
    { key: 'source', header: 'Source', cell: (t: TauxChange) => t.source },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Gestion des taux de change</h1>
        <p className="mt-1 text-sm text-gray-500">
          Configurez le taux de change entre USD et CDF
        </p>
      </div>

      <Card className="p-4">
        <form onSubmit={handleSubmit} className="flex gap-4">
          <div className="flex-1">
            <Input
              type="number"
              step="0.01"
              placeholder="Taux de change (1 USD = ? CDF)"
              value={nouveauTaux}
              onChange={(e) => setNouveauTaux(e.target.value)}
              required
            />
          </div>
          <Button type="submit" loading={isLoading}>
            Mettre à jour
          </Button>
        </form>
      </Card>

      <Card className="p-4">
        <h3 className="mb-4 font-semibold">Historique des taux</h3>
        <Table columns={columns} data={taux} isLoading={isLoading} />
      </Card>

      <div className="rounded-lg bg-blue-50 p-4">
        <p className="text-sm text-blue-800">
          💡 Le taux de change actuel est utilisé pour convertir automatiquement 
          les montants dans les rapports financiers.
        </p>
      </div>
    </div>
  )
}