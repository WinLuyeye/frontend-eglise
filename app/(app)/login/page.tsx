// app/(app)/login/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Mail, Lock, LogIn } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'

// Configuration du logo
const LOGO_URL = 'https://res.cloudinary.com/dukqurtfw/image/upload/v1782683211/logo1_raqypr.png'
const LOGO_ALT = 'Logo CECJC - La Communauté des Églises Le Camp de Jésus-Christ'

const loginSchema = z.object({
  email: z.string().email('Email invalide'),
  motDePasse: z.string().min(1, 'Le mot de passe est requis'),
})

type LoginFormData = z.infer<typeof loginSchema>

// ✅ Mapping des rôles vers les routes
const ROLE_ROUTES: Record<string, string> = {
  'administrateur': '/admin',
  'pasteur': '/pasteur',
  'tresorier': '/tresorier',
  'secretaire': '/secretaire',
  'chef_departement': '/chef-departement',
}

export default function LoginPage() {
  const router = useRouter()
  const { login, isAuthenticated, isLoading, user, checkAuth } = useAuthStore()
  const [error, setError] = useState<string | null>(null)
  const [isRedirecting, setIsRedirecting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: 'jean.dupont@email.com',
      motDePasse: 'Admin@123456',
    },
  })

  useEffect(() => {
    console.log('🔍 Login page - checkAuth')
    checkAuth()
  }, [])

  // ✅ Gestion de la redirection après connexion
  useEffect(() => {
    console.log('🔄 Login page - Auth state:', { 
      isAuthenticated, 
      user, 
      isRedirecting,
      role: user?.role 
    })
    
    if (isAuthenticated && user && !isRedirecting) {
      setIsRedirecting(true)
      
      const redirectPath = ROLE_ROUTES[user.role] || '/dashboard'
      console.log(`🚀 Redirection vers: ${redirectPath} pour le rôle: ${user.role}`)
      
      setTimeout(() => {
        router.replace(redirectPath)
      }, 300)
    }
  }, [isAuthenticated, user, isRedirecting, router])

  const onSubmit = async (data: LoginFormData) => {
    console.log('📝 Tentative de connexion avec:', data.email)
    setError(null)
    setIsRedirecting(false)
    
    const success = await login(data)
    
    if (!success) {
      setError('Email ou mot de passe incorrect')
    } else {
      checkAuth()
    }
  }

  // ✅ Si déjà connecté, afficher un loader
  if (isAuthenticated && user && !isRedirecting) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center from-primary-50 to-primary-100 p-4 dark:from-gray-900 dark:to-gray-800">
      <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-lg shadow-lg p-8">
        <div className="mb-8 text-center">
          {/* ✅ Logo personnalisé */}
          <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-primary-100 dark:bg-primary-900/30 p-2">
            <div className="relative h-16 w-16">
              <Image
                src={LOGO_URL}
                alt={LOGO_ALT}
                fill
                className="object-contain"
                priority
              />
            </div>
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            C.E.C.J.C.
          </h1>
          <p className="text-sm text-primary-600 dark:text-primary-400 font-medium">
            La Communauté des Églises Le Camp de Jésus-Christ
          </p>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Connectez-vous à votre compte
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                placeholder="admin@eglise.com"
                className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2 pl-10 text-gray-900 dark:text-white focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                {...register('email')}
              />
            </div>
            {errors.email && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Mot de passe
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="password"
                placeholder="••••••••"
                className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2 pl-10 text-gray-900 dark:text-white focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                {...register('motDePasse')}
              />
            </div>
            {errors.motDePasse && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.motDePasse.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-lg bg-primary-600 px-4 py-2 text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isLoading ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <>
                <LogIn className="mr-2 h-4 w-4" />
                Se connecter
              </>
            )}
          </button>
        </form>

        {/* ✅ Debug info pour voir le rôle */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg text-xs font-mono">
            <div className="font-bold mb-1">🔍 Comptes de test:</div>
            <div className="space-y-1 text-gray-600 dark:text-gray-400">
              <div>admin: jean.dupont@email.com / Admin@123456 → /admin</div>
              <div>pasteur: david.kibwe@email.com / User@123456 → /pasteur</div>
              <div>tresorier: marie.mbemba@email.com / User@123456 → /tresorier</div>
              <div>secretaire: claire.tshisekedi@email.com / User@123456 → /secretaire</div>
              <div>chef: pierre.kabasele@email.com / User@123456 → /chef-departement</div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}