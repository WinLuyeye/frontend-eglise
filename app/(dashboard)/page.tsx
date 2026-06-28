// app/(dashboard)/page.tsx
'use client'

import { useAuthStore } from '@/store/authStore'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function DashboardPage() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuthStore()

  useEffect(() => {
    if (isAuthenticated && user) {
      const roleRoutes: Record<string, string> = {
        'administrateur': '/admin',
        'pasteur': '/pasteur',
        'tresorier': '/tresorier',
        'secretaire': '/secretaire',
        'chef_departement': '/chef-departement',
      }
      const redirectPath = roleRoutes[user.role] || '/'
      if (redirectPath !== '/dashboard') {
        router.replace(redirectPath)
      }
    }
  }, [user, isAuthenticated, router])

  return (
    <div className="flex items-center justify-center h-full">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent" />
    </div>
  )
}