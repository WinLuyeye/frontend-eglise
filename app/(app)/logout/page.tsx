// app/(app)/logout/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { LogOut, Loader2, CheckCircle, XCircle } from 'lucide-react'
import Link from 'next/link'

export default function LogoutPage() {
  const router = useRouter()
  const { logout, resetStore, isAuthenticated } = useAuthStore()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [errorMessage, setErrorMessage] = useState<string>('')
  const [countdown, setCountdown] = useState(3)

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login')
      return
    }
    performLogout()
  }, [])

  useEffect(() => {
    if (status === 'success' && countdown > 0) {
      const timer = setTimeout(() => setCountdown(prev => prev - 1), 1000)
      return () => clearTimeout(timer)
    }
    if (status === 'success' && countdown === 0) {
      router.replace('/login')
    }
  }, [status, countdown, router])

  const performLogout = async () => {
    try {
      setStatus('loading')
      await logout()
      resetStore()
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      localStorage.removeItem('auth-storage')
      document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
      document.cookie = 'role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
      setStatus('success')
    } catch (error) {
      console.error('❌ Erreur de déconnexion:', error)
      setStatus('error')
      setErrorMessage(error instanceof Error ? error.message : 'Une erreur est survenue')
    }
  }

  const handleForceRedirect = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('auth-storage')
    resetStore()
    router.replace('/login')
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="text-center space-y-6">
          <div className="relative">
            <div className="w-20 h-20 mx-auto relative">
              <Loader2 className="w-16 h-16 animate-spin text-primary-600 absolute inset-0 m-auto" />
              <div className="absolute inset-0 flex items-center justify-center">
                <LogOut className="w-8 h-8 text-primary-400" />
              </div>
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
              Déconnexion en cours...
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Veuillez patienter...
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="text-center space-y-6 max-w-md mx-auto p-8">
          <div className="w-20 h-20 mx-auto bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
            <CheckCircle className="w-12 h-12 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
              Déconnexion réussie ! 👋
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Vous avez été déconnecté avec succès.
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-4">
              Redirection dans {countdown} secondes...
            </p>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mt-4">
            <div
              className="bg-primary-600 h-1.5 rounded-full transition-all duration-1000"
              style={{ width: `${(countdown / 3) * 100}%` }}
            />
          </div>
          <Link
            href="/login"
            className="inline-block px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            Se reconnecter
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
      <div className="text-center space-y-6 max-w-md mx-auto p-8">
        <div className="w-20 h-20 mx-auto bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
          <XCircle className="w-12 h-12 text-red-600 dark:text-red-400" />
        </div>
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Erreur de déconnexion
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            {errorMessage || 'Une erreur est survenue.'}
          </p>
        </div>
        <button
          onClick={handleForceRedirect}
          className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          Aller à la connexion
        </button>
      </div>
    </div>
  )
}