// app/(dashboard)/chef-departement/rapports/nouveau/page.tsx
'use client'

import { Suspense } from 'react'
import { RapportForm } from '../form'
import { Spinner } from '@/components/ui'

export default function NewRapportPage() {
  return (
    <Suspense fallback={
      <div className="flex h-96 items-center justify-center">
        <Spinner size="lg" />
      </div>
    }>
      <RapportForm mode="create" />
    </Suspense>
  )
}