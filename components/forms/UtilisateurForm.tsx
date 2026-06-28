// components/forms/UtilisateurForm.tsx
'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Mail, Lock, UserCog, User, Shield, AlertCircle } from 'lucide-react'
import { Input, Select, Button } from '@/components/ui'
import { useMemberStore } from '@/store/memberStore'
import { useAuth } from '@/hooks/useAuth'
import { ROLE_LABELS } from '@/lib/constants'
import { UtilisateurFormData } from '@/types'

const utilisateurSchema = z.object({
  email: z.string().email('Email invalide'),
  motDePasse: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères').optional().or(z.literal('')),
  role: z.enum(['pasteur', 'tresorier', 'secretaire', 'chef_departement', 'administrateur']),
  membreId: z.string().optional(),
  actif: z.boolean().default(true),
})

interface UtilisateurFormProps {
  initialData?: UtilisateurFormData
  isEditing?: boolean
  onSubmit: (data: UtilisateurFormData) => Promise<void>
  isSubmitting?: boolean
}

export const UtilisateurForm = ({ initialData, isEditing = false, onSubmit, isSubmitting = false }: UtilisateurFormProps) => {
  const { members, fetchMembers } = useMemberStore()
  const { user } = useAuth()
  const [error, setError] = useState<string | null>(null)
  
  // 🔒 Déterminer les rôles disponibles selon l'utilisateur connecté
  const getAvailableRoles = () => {
    const allRoles = [
      { value: 'pasteur', label: ROLE_LABELS.pasteur },
      { value: 'tresorier', label: ROLE_LABELS.tresorier },
      { value: 'secretaire', label: ROLE_LABELS.secretaire },
      { value: 'chef_departement', label: ROLE_LABELS.chef_departement },
    ]
    
    // Seul l'administrateur peut créer/modifier des administrateurs
    if (user?.role === 'administrateur') {
      allRoles.push({ value: 'administrateur', label: ROLE_LABELS.administrateur })
    }
    
    return allRoles
  }

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<UtilisateurFormData>({
    resolver: zodResolver(utilisateurSchema),
    defaultValues: {
      email: '',
      motDePasse: '',
      role: 'secretaire',
      membreId: '',
      actif: true,
    },
  })

  const selectedRole = watch('role')

  useEffect(() => {
    fetchMembers({ limit: 100 })
  }, [fetchMembers])

  useEffect(() => {
    if (initialData) {
      reset({
        ...initialData,
        role: initialData.role as any,
      })
    }
  }, [initialData, reset])

  const onSubmitForm = async (data: UtilisateurFormData) => {
    try {
      setError(null)
      // Vérifier si l'utilisateur a le droit de créer ce rôle
      if (user?.role !== 'administrateur' && data.role === 'administrateur') {
        setError('Vous n\'avez pas les droits pour créer un compte administrateur')
        return
      }
      if (isEditing && !data.motDePasse) {
        delete data.motDePasse
      }
      await onSubmit(data)
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue')
    }
  }

  const membreOptions = [
    { value: '', label: 'Aucun membre associé' },
    ...members.map(m => ({
      value: m.id,
      label: `${m.prenom} ${m.nom}${m.email ? ` (${m.email})` : ''}`,
    })),
  ]

  const statutOptions = [
    { value: 'true', label: 'Actif' },
    { value: 'false', label: 'Inactif' },
  ]

  const availableRoles = getAvailableRoles()

  return (
    <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-4">
      {/* ✅ Dark mode pour les erreurs */}
      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400 flex items-center">
          <AlertCircle className="h-4 w-4 mr-2" />
          {error}
        </div>
      )}

      {/* ✅ Dark mode pour l'info */}
      {user?.role !== 'administrateur' && (
        <div className="rounded-lg bg-blue-50 p-3 text-sm text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 flex items-center">
          <Shield className="h-4 w-4 mr-2" />
          Vous ne pouvez pas créer de comptes administrateur.
        </div>
      )}

      <Input
        label="Email"
        type="email"
        placeholder="exemple@eglise.com"
        icon={<Mail className="h-4 w-4" />}
        error={errors.email?.message}
        {...register('email')}
        className="dark:bg-gray-800 dark:border-gray-700 dark:text-white"
      />

      <Input
        label={isEditing ? "Nouveau mot de passe (laisser vide pour ne pas changer)" : "Mot de passe"}
        type="password"
        placeholder={isEditing ? "Entrez un nouveau mot de passe" : "Entrez le mot de passe"}
        icon={<Lock className="h-4 w-4" />}
        error={errors.motDePasse?.message}
        {...register('motDePasse')}
        className="dark:bg-gray-800 dark:border-gray-700 dark:text-white"
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Select
          label="Rôle"
          options={availableRoles}
          error={errors.role?.message}
          {...register('role')}
          className="dark:bg-gray-800 dark:border-gray-700 dark:text-white"
        />

        {isEditing && (
          <Select
            label="Statut"
            options={statutOptions}
            {...register('actif')}
            className="dark:bg-gray-800 dark:border-gray-700 dark:text-white"
          />
        )}
      </div>

      {selectedRole !== 'administrateur' && (
        <Select
          label="Membre associé"
          options={membreOptions}
          error={errors.membreId?.message}
          {...register('membreId')}
          className="dark:bg-gray-800 dark:border-gray-700 dark:text-white"
        />
      )}

      {/* ✅ Dark mode pour l'avertissement */}
      {selectedRole === 'administrateur' && user?.role === 'administrateur' && (
        <div className="rounded-lg bg-yellow-50 p-3 text-sm text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400">
          <Shield className="h-4 w-4 inline mr-2" />
          Les comptes administrateur ont tous les droits sur la plateforme. Utilisez cette option avec précaution.
        </div>
      )}

      <div className="flex justify-end space-x-3 pt-4">
        <Button 
          type="button" 
          variant="outline"
          onClick={() => window.history.back()}
          className="dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
        >
          Annuler
        </Button>
        <Button type="submit" variant="primary" loading={isSubmitting}>
          {isEditing ? 'Modifier' : 'Créer'}
        </Button>
      </div>
    </form>
  )
}