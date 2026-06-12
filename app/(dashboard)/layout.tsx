'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { Sidebar, Header, MobileNav } from '@/components/layout'
import { useAuthStore } from '@/store/authStore'
import { useUIStore } from '@/store/uiStore'
import { Toaster } from 'sonner'

// Configuration des routes par rôle
const roleRoutes: Record<string, string> = {
  administrateur: '/admin',
  pasteur: '/pasteur',
  tresorier: '/tresorier',
  secretaire: '/secretaire',
  chef_departement: '/chef-departement',
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, isAuthenticated, isLoading, checkAuth } = useAuthStore()
  const { sidebarOpen } = useUIStore()
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    const init = async () => {
      await checkAuth()
      setIsChecking(false)
    }
    init()
  }, [])

  // Éviter les redirections infinies
  useEffect(() => {
    if (isChecking || isLoading) return
    
    if (!isAuthenticated) {
      router.replace('/login')
      return
    }
    
    if (user) {
      const allowedRoute = roleRoutes[user.role]
      // Ne rediriger que si on est sur la racine ou sur une route non autorisée
      if (pathname === '/' || pathname === '/dashboard') {
        router.replace(allowedRoute)
      } else if (!pathname.startsWith(allowedRoute) && pathname !== '/login') {
        router.replace(allowedRoute)
      }
    }
  }, [isAuthenticated, isLoading, isChecking, user, pathname, router])

  if (isChecking || isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent" />
      </div>
    )
  }

  if (!isAuthenticated || !user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Toaster position="top-right" richColors />
      <Sidebar />
      <div className={`transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-20'}`}>
        <Header />
        <main className="p-6">
          {children}
        </main>
      </div>
      <MobileNav />
    </div>
  )
}