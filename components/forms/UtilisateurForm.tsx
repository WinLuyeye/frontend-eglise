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

// ✅ SCHEMA CORRIGÉ - z.enum() ne supporte pas required_error
const utilisateurSchema = z.object({
  email: z.string()
    .min(1, 'L\'email est requis')
    .email('Email invalide'),
  motDePasse: z.string()
    .min(1, 'Le mot de passe est requis')
    .min(6, 'Le mot de passe doit contenir au moins 6 caractères')
    .optional()
    .or(z.literal('')),
  role: z.enum(['pasteur', 'tresorier', 'secretaire', 'chef_departement', 'administrateur']),  // ✅ CORRIGÉ
  membreId: z.string()
    .min(1, 'Veuillez sélectionner un membre')
    .optional(),
  actif: z.boolean().default(true),
})

// ✅ SCHEMA POUR L'ÉDITION (mot de passe optionnel)
const editUtilisateurSchema = z.object({
  email: z.string()
    .min(1, 'L\'email est requis')
    .email('Email invalide'),
  motDePasse: z.string()
    .min(6, 'Le mot de passe doit contenir au moins 6 caractères')
    .optional()
    .or(z.literal('')),
  role: z.enum(['pasteur', 'tresorier', 'secretaire', 'chef_departement', 'administrateur']),  // ✅ CORRIGÉ
  membreId: z.string()
    .min(1, 'Veuillez sélectionner un membre')
    .optional(),
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

  // ✅ Utiliser le bon schéma selon le mode
  const schema = isEditing ? editUtilisateurSchema : utilisateurSchema

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<UtilisateurFormData>({
    resolver: zodResolver(schema),
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
        motDePasse: '', // ✅ Réinitialiser le mot de passe pour l'édition
      })
    }
  }, [initialData, reset])

  const onSubmitForm = async (data: UtilisateurFormData) => {
    try {
      setError(null)
      
      // ✅ Vérifier que tous les champs obligatoires sont remplis
      if (!data.email || data.email.trim() === '') {
        setError('L\'email est obligatoire')
        return
      }
      
      if (!isEditing && (!data.motDePasse || data.motDePasse.length < 6)) {
        setError('Le mot de passe est obligatoire et doit contenir au moins 6 caractères')
        return
      }
      
      if (!data.role) {
        setError('Le rôle est obligatoire')
        return
      }
      
      // ✅ Vérifier que membreId est sélectionné si le rôle n'est pas administrateur
      if (data.role !== 'administrateur' && (!data.membreId || data.membreId === '')) {
        setError('Veuillez sélectionner un membre associé')
        return
      }
      
      // Vérifier si l'utilisateur a le droit de créer ce rôle
      if (user?.role !== 'administrateur' && data.role === 'administrateur') {
        setError('Vous n\'avez pas les droits pour créer un compte administrateur')
        return
      }
      
      // ✅ Pour l'édition, si motDePasse est vide, on le supprime
      if (isEditing && (!data.motDePasse || data.motDePasse === '')) {
        delete data.motDePasse
      }
      
      await onSubmit(data)
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue')
    }
  }

  const membreOptions = [
    { value: '', label: '-- Sélectionnez un membre --' },
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

  // ✅ Ajouter l'option par défaut pour le rôle
  const roleOptions = [
    { value: '', label: '-- Sélectionnez un rôle --' },
    ...availableRoles,
  ]

  return (
    <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-4">
      {/* ✅ Dark mode pour les erreurs */}
      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400 flex items-center">
          <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* ✅ Dark mode pour l'info */}
      {user?.role !== 'administrateur' && (
        <div className="rounded-lg bg-blue-50 p-3 text-sm text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 flex items-center">
          <Shield className="h-4 w-4 mr-2 flex-shrink-0" />
          Vous ne pouvez pas créer de comptes administrateur.
        </div>
      )}

      {/* ✅ Email - OBLIGATOIRE */}
      <div>
        <Input
          label="Email *"
          type="email"
          placeholder="exemple@eglise.com"
          icon={<Mail className="h-4 w-4" />}
          error={errors.email?.message}
          {...register('email')}
          className="dark:bg-gray-800 dark:border-gray-700 dark:text-white"
          required
        />
        {errors.email && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email.message}</p>
        )}
      </div>

      {/* ✅ Mot de passe - OBLIGATOIRE (sauf en édition) */}
      <div>
        <Input
          label={isEditing ? "Nouveau mot de passe (optionnel)" : "Mot de passe *"}
          type="password"
          placeholder={isEditing ? "Entrez un nouveau mot de passe" : "Entrez le mot de passe"}
          icon={<Lock className="h-4 w-4" />}
          error={errors.motDePasse?.message}
          {...register('motDePasse')}
          className="dark:bg-gray-800 dark:border-gray-700 dark:text-white"
          required={!isEditing}
        />
        {!isEditing && errors.motDePasse && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.motDePasse.message}</p>
        )}
        {isEditing && (
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Laissez vide pour conserver le mot de passe actuel
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* ✅ Rôle - OBLIGATOIRE */}
        <div>
          <Select
            label="Rôle *"
            options={roleOptions}
            error={errors.role?.message}
            {...register('role')}
            className="dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            required
          />
          {errors.role && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.role.message}</p>
          )}
        </div>

        {/* ✅ Statut - OBLIGATOIRE (uniquement en édition) */}
        {isEditing && (
          <div>
            <Select
              label="Statut *"
              options={statutOptions}
              {...register('actif')}
              className="dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              required
            />
          </div>
        )}
      </div>

      {/* ✅ Membre associé - OBLIGATOIRE (sauf pour administrateur) */}
      {selectedRole && selectedRole !== 'administrateur' && (  // ✅ CORRIGÉ - ajout de la vérification selectedRole
        <div>
          <Select
            label="Membre associé *"
            options={membreOptions}
            error={errors.membreId?.message}
            {...register('membreId')}
            className="dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            required
          />
          {errors.membreId && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.membreId.message}</p>
          )}
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Veuillez sélectionner un membre à associer à ce compte
          </p>
        </div>
      )}

      {/* ✅ Avertissement pour administrateur */}
      {selectedRole === 'administrateur' && user?.role === 'administrateur' && (
        <div className="rounded-lg bg-yellow-50 p-3 text-sm text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400">
          <Shield className="h-4 w-4 inline mr-2" />
          Les comptes administrateur ont tous les droits sur la plateforme. Utilisez cette option avec précaution.
        </div>
      )}

      {/* ✅ Avertissement si rôle non sélectionné */}
      {!selectedRole && (
        <div className="rounded-lg bg-amber-50 p-3 text-sm text-amber-700 dark:bg-amber-900/20 dark:text-amber-400">
          <AlertCircle className="h-4 w-4 inline mr-2" />
          Veuillez sélectionner un rôle pour continuer.
        </div>
      )}

      <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
        <Button 
          type="button" 
          variant="outline"
          onClick={() => window.history.back()}
          className="dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
        >
          Annuler
        </Button>
        <Button 
          type="submit" 
          variant="primary" 
          loading={isSubmitting}
          disabled={isSubmitting}
        >
          {isEditing ? 'Modifier' : 'Créer'}
        </Button>
      </div>
    </form>
  )
}