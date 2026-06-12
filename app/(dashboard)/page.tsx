'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'

const roleRoutes: Record<string, string> = {
  administrateur: '/admin',
  pasteur: '/pasteur',
  tresorier: '/tresorier',
  secretaire: '/secretaire',
  chef_departement: '/chef-departement',
}

export default function DashboardIndexPage() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading, checkAuth } = useAuthStore()
  const [hasRedirected, setHasRedirected] = useState(false)

  useEffect(() => {
    checkAuth()
  }, [])

  useEffect(() => {
    if (hasRedirected) return
    
    if (!isLoading) {
      if (isAuthenticated && user && !hasRedirected) {
        setHasRedirected(true)
        const redirectPath = roleRoutes[user.role] || '/login'
        router.replace(redirectPath)
      } else if (!isAuthenticated && !isLoading && !hasRedirected) {
        setHasRedirected(true)
        router.replace('/login')
      }
    }
  }, [isAuthenticated, isLoading, user, router, hasRedirected])

  return (
    <div className="flex h-screen items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent" />
    </div>
  )
}