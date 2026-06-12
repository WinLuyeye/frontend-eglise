'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Mail, ArrowLeft, Send, CheckCircle, AlertCircle } from 'lucide-react'
import { Input, Button, Card } from '@/components/ui'
import { useUIStore } from '@/store/uiStore'

// Schéma de validation
const forgotPasswordSchema = z.object({
  email: z.string().email('Email invalide'),
})

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>

export default function ForgotPasswordPage() {
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submittedEmail, setSubmittedEmail] = useState('')
  const { showNotification } = useUIStore()

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  })

  const emailValue = watch('email')

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true)
    setError(null)
    
    try {
      // Appel API pour réinitialisation du mot de passe
      // const response = await authAPI.forgotPassword(data.email)
      
      // Simulation d'appel API
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Succès
      setSubmittedEmail(data.email)
      setIsSubmitted(true)
      showNotification('Email de réinitialisation envoyé avec succès', 'success')
      
    } catch (err: any) {
      setError(err.response?.data?.message || 'Une erreur est survenue. Veuillez réessayer.')
      showNotification('Erreur lors de l\'envoi', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  const handleResend = async () => {
    if (!submittedEmail) return
    
    setIsLoading(true)
    setError(null)
    
    try {
      // Renvoyer l'email
      // await authAPI.forgotPassword(submittedEmail)
      await new Promise(resolve => setTimeout(resolve, 1000))
      showNotification('Email renvoyé avec succès', 'success')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors du renvoi')
    } finally {
      setIsLoading(false)
    }
  }

  // État de succès
  if (isSubmitted) {
    return (
      <Card className="p-8 shadow-xl text-center">
        <div className="mb-6 flex justify-center">
          <div className="rounded-full bg-green-100 p-4 dark:bg-green-900/30">
            <Send className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
        </div>
        
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Email envoyé !
        </h2>
        
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Nous avons envoyé un email de réinitialisation à
        </p>
        <p className="mt-1 font-medium text-primary-600 dark:text-primary-400">
          {submittedEmail}
        </p>
        
        <div className="mt-6 rounded-lg bg-blue-50 p-4 text-left dark:bg-blue-900/20">
          <p className="text-sm text-blue-800 dark:text-blue-300">
            📧 Si vous ne recevez pas l'email dans les prochaines minutes :
          </p>
          <ul className="mt-2 ml-4 list-disc text-sm text-blue-700 dark:text-blue-400">
            <li>Vérifiez votre dossier spam / courriers indésirables</li>
            <li>Assurez-vous d'avoir saisi la bonne adresse email</li>
            <li>Attendez quelques minutes et réessayez</li>
          </ul>
        </div>
        
        <div className="mt-6 flex flex-col space-y-3">
          <Button
            variant="outline"
            onClick={handleResend}
            loading={isLoading}
            fullWidth
          >
            Renvoyer l'email
          </Button>
          
          <Link href="/login" className="w-full">
            <Button variant="ghost" fullWidth>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour à la connexion
            </Button>
          </Link>
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-8 shadow-xl">
      {/* En-tête */}
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary-100 dark:bg-primary-900">
          <Mail className="h-8 w-8 text-primary-600 dark:text-primary-400" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Mot de passe oublié ?
        </h1>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Entrez votre adresse email pour recevoir un lien de réinitialisation
        </p>
      </div>

      {/* Message d'erreur */}
      {error && (
        <div className="mb-4 flex items-start space-x-2 rounded-lg bg-red-50 p-3 text-red-600 dark:bg-red-900/20 dark:text-red-400">
          <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {/* Formulaire */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <Input
          label="Adresse email"
          type="email"
          placeholder="votre@email.com"
          icon={<Mail className="h-4 w-4" />}
          error={errors.email?.message}
          autoComplete="email"
          autoFocus
          {...register('email')}
        />

        <Button
          type="submit"
          variant="primary"
          fullWidth
          loading={isLoading}
          disabled={!emailValue}
        >
          Envoyer le lien de réinitialisation
        </Button>

        <div className="text-center">
          <Link
            href="/login"
            className="inline-flex items-center text-sm text-primary-600 hover:underline dark:text-primary-400"
          >
            <ArrowLeft className="mr-1 h-3 w-3" />
            Retour à la connexion
          </Link>
        </div>
      </form>

      {/* Informations supplémentaires */}
      <div className="mt-6 rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
        <p className="text-center text-xs text-gray-500 dark:text-gray-400">
          🔐 Un lien de réinitialisation vous sera envoyé par email.
          Ce lien expire après 24 heures.
        </p>
      </div>
    </Card>
  )
}