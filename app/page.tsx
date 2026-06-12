'use client'

import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Spinner } from '@/components/ui'

export default function HomePage() {
  const { isAuthenticated, isLoading, user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated && user) {
        // Rediriger selon le rôle
        const roleRoutes: Record<string, string> = {
          administrateur: '/admin',
          pasteur: '/pasteur',
          tresorier: '/tresorier',
          secretaire: '/secretaire',
          chef_departement: '/chef-departement',
        }
        router.push(roleRoutes[user.role] || '/')
      } else {
        router.push('/login')
      }
    }
  }, [isAuthenticated, isLoading, user, router])

  return (
    <div className="flex h-screen items-center justify-center">
      <Spinner size="lg" />
    </div>
  )
}