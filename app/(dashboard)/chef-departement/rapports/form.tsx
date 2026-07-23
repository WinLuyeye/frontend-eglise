// app/(dashboard)/chef-departement/rapports/form.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Calendar, Save, X, ArrowLeft, Building2, AlertCircle } from 'lucide-react'
import { Card, Button, Input, Textarea, Spinner } from '@/components/ui'
import { useRapportStore } from '@/store/rapportStore'
import { useDepartementStore } from '@/store/departementStore'
import { useAuth } from '@/hooks/useAuth'

// Fonction utilitaire pour formater la date
const formatDate = (date: string | Date) => {
  if (!date) return ''
  const d = new Date(date)
  if (isNaN(d.getTime())) return ''
  return d.toISOString().split('T')[0]
}

interface RapportFormProps {
  mode: 'create' | 'edit'
  rapportId?: string
  initialData?: {
    id: string
    titre: string
    contenu: string
    periode: string
    departementId: string
  }
}

export function RapportForm({ mode, rapportId, initialData }: RapportFormProps) {
  const router = useRouter()
  const { user } = useAuth()
  const { 
    createRapport, 
    updateRapport, 
    fetchRapportById, 
    isLoading,
    rapports  // ✅ Ajouter rapports depuis le store
  } = useRapportStore()
  const { departements, fetchDepartements, isLoading: deptLoading } = useDepartementStore()
  
  const [formData, setFormData] = useState({
    titre: '',
    contenu: '',
    periode: '',
    departementId: ''
  })
  
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  // Charger les départements
  useEffect(() => {
    fetchDepartements()
  }, [fetchDepartements])

  // Charger les données initiales pour l'édition
  useEffect(() => {
    if (mode === 'edit' && rapportId) {
      const loadRapport = async () => {
        try {
          // ✅ CORRIGÉ: fetchRapportById met à jour le store
          await fetchRapportById(rapportId)
          
          // ✅ Récupérer le rapport depuis la liste des rapports
          const rapport = rapports.find((r: any) => r.id === rapportId)
          
          if (rapport) {
            setFormData({
              titre: rapport.titre || '',
              contenu: rapport.contenu || '',
              periode: rapport.periode ? formatDate(rapport.periode) : '',
              departementId: rapport.departementId || ''
            })
          }
        } catch (err) {
          console.error('Erreur lors du chargement du rapport:', err)
        }
      }
      loadRapport()
    } else if (mode === 'create' && initialData) {
      setFormData({
        titre: initialData.titre || '',
        contenu: initialData.contenu || '',
        periode: initialData.periode || '',
        departementId: initialData.departementId || ''
      })
    }
  }, [mode, rapportId, initialData, fetchRapportById, rapports])

  // Si c'est un chef de département, sélectionner automatiquement son département
  useEffect(() => {
    if (user?.role === 'chef_departement' && departements.length > 0 && !formData.departementId) {
      const dept = departements.find((d: any) => d.responsableId === user.membreId)
      if (dept) {
        setFormData(prev => ({ ...prev, departementId: dept.id }))
      } else if (departements.length > 0) {
        setFormData(prev => ({ ...prev, departementId: departements[0].id }))
      }
    }
  }, [user, departements, formData.departementId])

  const validateForm = () => {
    const errors: Record<string, string> = {}
    
    if (!formData.titre.trim()) {
      errors.titre = 'Le titre est requis'
    } else if (formData.titre.length < 3) {
      errors.titre = 'Le titre doit contenir au moins 3 caractères'
    }
    
    if (!formData.contenu.trim()) {
      errors.contenu = 'Le contenu est requis'
    } else if (formData.contenu.length < 10) {
      errors.contenu = 'Le contenu doit contenir au moins 10 caractères'
    }
    
    if (!formData.departementId) {
      errors.departementId = 'Veuillez sélectionner un département'
    }
    
    if (!formData.periode) {
      errors.periode = 'La période est requise'
    }
    
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitError(null)
    
    if (!validateForm()) {
      return
    }
    
    setIsSubmitting(true)
    
    try {
      const dataToSubmit = {
        titre: formData.titre.trim(),
        contenu: formData.contenu.trim(),
        periode: formData.periode,
        departementId: formData.departementId
      }
      
      console.log('📤 [SUBMIT] Envoi des données:', dataToSubmit)
      
      let result
      if (mode === 'create') {
        result = await createRapport(dataToSubmit)
      } else if (mode === 'edit' && rapportId) {
        result = await updateRapport(rapportId, dataToSubmit)
      }
      
      if (result) {
        router.push('/chef-departement/rapports')
        router.refresh()
      }
    } catch (err: any) {
      console.error('❌ [SUBMIT] Erreur:', err)
      setSubmitError(err.response?.data?.message || err.message || 'Une erreur est survenue lors de l\'enregistrement')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    router.back()
  }

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const availableDepartements = user?.role === 'chef_departement'
    ? departements.filter((d: any) => d.responsableId === user.membreId)
    : departements

  if (isLoading && mode === 'edit') {
    return (
      <div className="flex h-96 items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  const isChefDept = user?.role === 'chef_departement'
  const title = mode === 'create' ? 'Nouveau rapport' : 'Modifier le rapport'

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <button
            onClick={handleCancel}
            className="rounded-full p-2 hover:bg-gray-100 dark:hover:bg-gray-800"
            type="button"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {mode === 'create' 
                ? 'Créez un nouveau rapport pour votre département' 
                : 'Modifiez les informations de votre rapport'}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={handleCancel} type="button">
            <X className="mr-2 h-4 w-4" />
            Annuler
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={isSubmitting}
            className="min-w-[120px]"
            type="button"
          >
            {isSubmitting ? (
              <>
                <Spinner size="sm" className="mr-2" />
                Enregistrement...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                {mode === 'create' ? 'Créer' : 'Enregistrer'}
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Erreur générale */}
      {submitError && (
        <div className="flex items-start space-x-2 rounded-lg border border-red-200 bg-red-50 p-4 text-red-800 dark:border-red-800 dark:bg-red-950/30 dark:text-red-300">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>{submitError}</span>
        </div>
      )}

      {/* Formulaire */}
      <Card className="p-6 dark:bg-gray-900 dark:border-gray-800">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Titre */}
          <div>
            <label htmlFor="titre" className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Titre du rapport *
            </label>
            <Input
              id="titre"
              value={formData.titre}
              onChange={(e) => handleChange('titre', e.target.value)}
              placeholder="Ex: Rapport mensuel - Mars 2024"
              error={formErrors.titre}
              className="dark:bg-gray-800 dark:border-gray-700"
            />
          </div>

          {/* Période */}
          <div>
            <label htmlFor="periode" className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Période *
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                id="periode"
                type="date"
                value={formData.periode}
                onChange={(e) => handleChange('periode', e.target.value)}
                className="pl-10 dark:bg-gray-800 dark:border-gray-700"
                error={formErrors.periode}
              />
            </div>
          </div>

          {/* Département */}
          <div>
            <label htmlFor="departement" className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Département *
            </label>
            <select
              id="departement"
              value={formData.departementId}
              onChange={(e) => handleChange('departementId', e.target.value)}
              disabled={isChefDept || deptLoading}
              className={`w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:focus:border-primary-400 ${
                formErrors.departementId ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''
              }`}
            >
              <option value="">Sélectionner un département</option>
              {availableDepartements.map((dept: any) => (
                <option key={dept.id} value={dept.id}>
                  {dept.nom}
                </option>
              ))}
            </select>
            {formErrors.departementId && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{formErrors.departementId}</p>
            )}
            {isChefDept && (
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                <Building2 className="inline h-3 w-3 mr-1" />
                Vous ne pouvez créer que pour votre département
              </p>
            )}
          </div>

          {/* Contenu */}
          <div>
            <label htmlFor="contenu" className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Contenu du rapport *
            </label>
            <textarea
              id="contenu"
              value={formData.contenu}
              onChange={(e) => handleChange('contenu', e.target.value)}
              placeholder="Rédigez le contenu de votre rapport..."
              rows={12}
              className={`w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:focus:border-primary-400 ${
                formErrors.contenu ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''
              }`}
            />
            {formErrors.contenu && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{formErrors.contenu}</p>
            )}
            <div className="mt-1 flex justify-between text-xs text-gray-500 dark:text-gray-400">
              <span>Minimum 10 caractères</span>
              <span>{formData.contenu.length} caractères</span>
            </div>
          </div>

          {/* Boutons d'action */}
          <div className="flex justify-end space-x-3 border-t border-gray-200 pt-6 dark:border-gray-700">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              className="dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="min-w-[140px]"
            >
              {isSubmitting ? (
                <>
                  <Spinner size="sm" className="mr-2" />
                  Enregistrement...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  {mode === 'create' ? 'Créer le rapport' : 'Enregistrer les modifications'}
                </>
              )}
            </Button>
          </div>
        </form>
      </Card>

      {/* Info supplémentaire pour le chef de département */}
      {isChefDept && (
        <Card className="border-l-4 border-blue-500 bg-blue-50 p-4 dark:border-blue-400 dark:bg-blue-950/30">
          <div className="flex items-start space-x-3">
            <Building2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white">
                En tant que Chef de Département
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Vous êtes responsable de la création et de la gestion des rapports de votre département. 
                Assurez-vous que les rapports sont complets et soumis avant la fin de chaque mois.
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}