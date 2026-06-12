'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Mail, Lock, LogIn, Church } from 'lucide-react'
import { Input, Button, Card } from '@/components/ui'
import { useAuthStore } from '@/store/authStore'

const loginSchema = z.object({
  email: z.string().email('Email invalide'),
  motDePasse: z.string().min(1, 'Le mot de passe est requis'),
})

type LoginFormData = z.infer<typeof loginSchema>

export default function LoginPage() {
  const router = useRouter()
  const { login, isAuthenticated, isLoading, user, checkAuth } = useAuthStore()
  const [error, setError] = useState<string | null>(null)
  const [isRedirecting, setIsRedirecting] = useState(false)

  // ✅ Déstructurer handleSubmit correctement
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: 'admin@eglise.com',
      motDePasse: 'password123',
    },
  })

  useEffect(() => {
    checkAuth()
  }, [])

  // Redirection après connexion
  useEffect(() => {
    if (isAuthenticated && user && !isRedirecting) {
      setIsRedirecting(true)
      const roleRoutes: Record<string, string> = {
        administrateur: '/admin',
        pasteur: '/pasteur',
        tresorier: '/tresorier',
        secretaire: '/secretaire',
        chef_departement: '/chef-departement',
      }
      const redirectPath = roleRoutes[user.role] || '/'
      router.replace(redirectPath)
    }
  }, [isAuthenticated, user, router, isRedirecting])

  const onSubmit = async (data: LoginFormData) => {
    setError(null)
    const success = await login(data)
    if (!success) {
      setError('Email ou mot de passe incorrect')
    }
  }

  // Si déjà connecté, ne pas afficher le formulaire
  if (isAuthenticated && user && !isRedirecting) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 p-4 dark:from-gray-900 dark:to-gray-800">
      <Card className="w-full max-w-md p-8">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary-100 dark:bg-primary-900">
            <Church className="h-8 w-8 text-primary-600 dark:text-primary-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Gestion d'Église
          </h1>
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

          <Input
            label="Email"
            type="email"
            placeholder="admin@eglise.com"
            icon={<Mail className="h-4 w-4" />}
            error={errors.email?.message}
            {...register('email')}
          />

          <Input
            label="Mot de passe"
            type="password"
            placeholder="••••••••"
            icon={<Lock className="h-4 w-4" />}
            error={errors.motDePasse?.message}
            {...register('motDePasse')}
          />

          <Button
            type="submit"
            variant="primary"
            fullWidth
            loading={isLoading}
            className="mt-6"
          >
            <LogIn className="mr-2 h-4 w-4" />
            Se connecter
          </Button>
        </form>

        <div className="mt-6 text-center text-xs text-gray-500 dark:text-gray-400">
          <p>Comptes de démonstration :</p>
          <p className="mt-1">admin@eglise.com / password123</p>
          <p>pasteur@eglise.com / password123</p>
          <p>tresorier@eglise.com / password123</p>
        </div>
      </Card>
    </div>
  )
}