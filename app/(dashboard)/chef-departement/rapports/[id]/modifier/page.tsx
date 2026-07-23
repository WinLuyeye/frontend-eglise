// app/(dashboard)/chef-departement/rapports/[id]/modifier/page.tsx
'use client'

import { useParams } from 'next/navigation'
import { Suspense } from 'react'
import { RapportForm } from '../../form'
import { Spinner } from '@/components/ui'

export default function EditRapportPage() {
  const params = useParams()
  const id = params.id as string

  return (
    <Suspense fallback={
      <div className="flex h-96 items-center justify-center">
        <Spinner size="lg" />
      </div>
    }>
      <RapportForm mode="edit" rapportId={id} />
    </Suspense>
  )
}