'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Settings, 
  Building2, 
  Users, 
  DollarSign, 
  Shield, 
  Bell, 
  Mail, 
  Lock, 
  Database, 
  RefreshCw,
  Save,
  Globe,
  Landmark,
  Calendar,
  FileText,
  UserCog,
  ChevronRight,
  CheckCircle,
  AlertCircle,
  Download  // ← Ajouter Download ici
} from 'lucide-react'
import { Card, Button, Input, Select, Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui'
import { useAuth } from '@/hooks/useAuth'
import { useAuthStore } from '@/store/authStore'

// Taux de change par défaut
const TAUX_CHANGE_DEFAUT = 2250

export default function ParametresPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { logout } = useAuthStore()
  
  // États pour les différents formulaires
  const [isLoading, setIsLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  
  // Formulaire général
  const [appName, setAppName] = useState('Gestion d\'Église')
  const [appVersion, setAppVersion] = useState('2.0.0')
  
  // Formulaire devise
  const [tauxChange, setTauxChange] = useState(TAUX_CHANGE_DEFAUT)
  const [devisePrincipale, setDevisePrincipale] = useState('CDF')
  const [deviseSecondaire, setDeviseSecondaire] = useState('USD')
  
  // Formulaire notifications (remplacé par des selects)
  const [emailNotifications, setEmailNotifications] = useState('oui')
  const [rapportNotifications, setRapportNotifications] = useState('oui')
  const [financeNotifications, setFinanceNotifications] = useState('oui')
  
  // Formulaire sécurité
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  
  // Formulaire backup
  const [lastBackup, setLastBackup] = useState('2026-06-10 14:30:00')
  const [autoBackup, setAutoBackup] = useState('oui')

  // Afficher un message de succès temporaire
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(''), 3000)
      return () => clearTimeout(timer)
    }
  }, [successMessage])

  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => setErrorMessage(''), 3000)
      return () => clearTimeout(timer)
    }
  }, [errorMessage])

  // Sauvegarder les paramètres généraux
  const handleSaveGeneral = async () => {
    setIsLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      localStorage.setItem('appName', appName)
      setSuccessMessage('Paramètres généraux sauvegardés avec succès')
    } catch (error) {
      setErrorMessage('Erreur lors de la sauvegarde')
    } finally {
      setIsLoading(false)
    }
  }

  // Sauvegarder le taux de change
  const handleSaveDevise = async () => {
    setIsLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      localStorage.setItem('tauxChange', tauxChange.toString())
      localStorage.setItem('devisePrincipale', devisePrincipale)
      setSuccessMessage('Configuration des devises sauvegardée')
    } catch (error) {
      setErrorMessage('Erreur lors de la sauvegarde')
    } finally {
      setIsLoading(false)
    }
  }

  // Sauvegarder les préférences de notification
  const handleSaveNotifications = async () => {
    setIsLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      localStorage.setItem('emailNotifications', emailNotifications)
      localStorage.setItem('rapportNotifications', rapportNotifications)
      localStorage.setItem('financeNotifications', financeNotifications)
      setSuccessMessage('Préférences de notification sauvegardées')
    } catch (error) {
      setErrorMessage('Erreur lors de la sauvegarde')
    } finally {
      setIsLoading(false)
    }
  }

  // Changer le mot de passe
  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      setErrorMessage('Les mots de passe ne correspondent pas')
      return
    }
    if (newPassword.length < 6) {
      setErrorMessage('Le mot de passe doit contenir au moins 6 caractères')
      return
    }
    
    setIsLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      setSuccessMessage('Mot de passe modifié avec succès')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (error) {
      setErrorMessage('Erreur lors du changement de mot de passe')
    } finally {
      setIsLoading(false)
    }
  }

  // Effectuer une sauvegarde
  const handleBackup = async () => {
    setIsLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 2000))
      const now = new Date()
      setLastBackup(now.toISOString().replace('T', ' ').slice(0, 19))
      setSuccessMessage('Sauvegarde effectuée avec succès')
    } catch (error) {
      setErrorMessage('Erreur lors de la sauvegarde')
    } finally {
      setIsLoading(false)
    }
  }

  // Réinitialiser toutes les données
  const handleResetData = async () => {
    if (confirm('⚠️ Attention ! Cette action supprimera toutes les données de démonstration. Continuer ?')) {
      setIsLoading(true)
      try {
        await new Promise(resolve => setTimeout(resolve, 1500))
        setSuccessMessage('Données réinitialisées avec succès')
      } catch (error) {
        setErrorMessage('Erreur lors de la réinitialisation')
      } finally {
        setIsLoading(false)
      }
    }
  }

  // Exporter les données
  const handleExportData = () => {
    const data = {
      exportDate: new Date().toISOString(),
      appVersion,
      settings: {
        tauxChange,
        devisePrincipale,
        emailNotifications,
        rapportNotifications,
        financeNotifications
      }
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `backup_config_${new Date().toISOString().slice(0, 19)}.json`
    a.click()
    URL.revokeObjectURL(url)
    setSuccessMessage('Configuration exportée avec succès')
  }

  const notificationOptions = [
    { value: 'oui', label: 'Activé' },
    { value: 'non', label: 'Désactivé' },
  ]

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Paramètres</h1>
          <p className="mt-1 text-sm text-gray-500">
            Gérez la configuration de votre application
          </p>
        </div>
        <Button variant="outline" onClick={() => router.push('/admin')}>
          Retour au dashboard
        </Button>
      </div>

      {/* Messages de notification */}
      {successMessage && (
        <div className="flex items-center space-x-2 rounded-lg bg-green-50 p-3 text-green-700">
          <CheckCircle className="h-5 w-5" />
          <span>{successMessage}</span>
        </div>
      )}
      {errorMessage && (
        <div className="flex items-center space-x-2 rounded-lg bg-red-50 p-3 text-red-700">
          <AlertCircle className="h-5 w-5" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Menu des paramètres */}
      <Tabs defaultValue="general" className="space-y-4">
        <TabsList className="flex flex-wrap gap-2">
          <TabsTrigger value="general" className="flex items-center space-x-2">
            <Settings className="h-4 w-4" />
            <span>Général</span>
          </TabsTrigger>
          <TabsTrigger value="devises" className="flex items-center space-x-2">
            <Landmark className="h-4 w-4" />
            <span>Devises</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center space-x-2">
            <Bell className="h-4 w-4" />
            <span>Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="securite" className="flex items-center space-x-2">
            <Lock className="h-4 w-4" />
            <span>Sécurité</span>
          </TabsTrigger>
          <TabsTrigger value="backup" className="flex items-center space-x-2">
            <Database className="h-4 w-4" />
            <span>Sauvegarde</span>
          </TabsTrigger>
          <TabsTrigger value="systeme" className="flex items-center space-x-2">
            <RefreshCw className="h-4 w-4" />
            <span>Système</span>
          </TabsTrigger>
        </TabsList>

        {/* Onglet Général */}
        <TabsContent value="general">
          <Card className="p-6">
            <div className="mb-6 flex items-center space-x-3">
              <Settings className="h-6 w-6 text-primary-600" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Paramètres généraux</h2>
            </div>
            
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Nom de l'application
                </label>
                <Input
                  value={appName}
                  onChange={(e) => setAppName(e.target.value)}
                  placeholder="Gestion d'Église"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Version
                </label>
                <Input
                  value={appVersion}
                  onChange={(e) => setAppVersion(e.target.value)}
                  placeholder="1.0.0"
                  disabled
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <Button onClick={handleSaveGeneral} loading={isLoading}>
                <Save className="mr-2 h-4 w-4" />
                Enregistrer
              </Button>
            </div>
          </Card>
        </TabsContent>

        {/* Onglet Devises */}
        <TabsContent value="devises">
          <Card className="p-6">
            <div className="mb-6 flex items-center space-x-3">
              <Landmark className="h-6 w-6 text-primary-600" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Configuration des devises</h2>
            </div>
            
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Taux de change (1 USD = ? CDF)
                </label>
                <Input
                  type="number"
                  value={tauxChange}
                  onChange={(e) => setTauxChange(Number(e.target.value))}
                />
                <p className="mt-1 text-xs text-gray-500">
                  Utilisé pour convertir automatiquement les montants
                </p>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Devise principale
                </label>
                <Select
                  value={devisePrincipale}
                  onChange={(e) => setDevisePrincipale(e.target.value)}
                  options={[
                    { value: 'CDF', label: 'CDF - Franc congolais' },
                    { value: 'USD', label: 'USD - Dollar américain' }
                  ]}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Devise secondaire
                </label>
                <Select
                  value={deviseSecondaire}
                  onChange={(e) => setDeviseSecondaire(e.target.value)}
                  options={[
                    { value: 'USD', label: 'USD - Dollar américain' },
                    { value: 'CDF', label: 'CDF - Franc congolais' }
                  ]}
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <Button onClick={handleSaveDevise} loading={isLoading}>
                <Save className="mr-2 h-4 w-4" />
                Enregistrer
              </Button>
            </div>
          </Card>
        </TabsContent>

        {/* Onglet Notifications */}
        <TabsContent value="notifications">
          <Card className="p-6">
            <div className="mb-6 flex items-center space-x-3">
              <Bell className="h-6 w-6 text-primary-600" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Préférences de notification</h2>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b pb-4">
                <div>
                  <p className="font-medium">Notifications par email</p>
                  <p className="text-sm text-gray-500">
                    Recevoir des alertes par email
                  </p>
                </div>
                <Select
                  value={emailNotifications}
                  onChange={(e) => setEmailNotifications(e.target.value)}
                  options={notificationOptions}
                  className="w-32"
                />
              </div>
              
              <div className="flex items-center justify-between border-b pb-4">
                <div>
                  <p className="font-medium">Rapports mensuels</p>
                  <p className="text-sm text-gray-500">
                    Être notifié quand un rapport est soumis
                  </p>
                </div>
                <Select
                  value={rapportNotifications}
                  onChange={(e) => setRapportNotifications(e.target.value)}
                  options={notificationOptions}
                  className="w-32"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Alertes financières</p>
                  <p className="text-sm text-gray-500">
                    Être notifié pour les transactions importantes
                  </p>
                </div>
                <Select
                  value={financeNotifications}
                  onChange={(e) => setFinanceNotifications(e.target.value)}
                  options={notificationOptions}
                  className="w-32"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <Button onClick={handleSaveNotifications} loading={isLoading}>
                <Save className="mr-2 h-4 w-4" />
                Enregistrer
              </Button>
            </div>
          </Card>
        </TabsContent>

        {/* Onglet Sécurité */}
        <TabsContent value="securite">
          <Card className="p-6">
            <div className="mb-6 flex items-center space-x-3">
              <Lock className="h-6 w-6 text-primary-600" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Changer le mot de passe</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Mot de passe actuel
                </label>
                <Input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Entrez votre mot de passe actuel"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Nouveau mot de passe
                </label>
                <Input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimum 6 caractères"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Confirmer le mot de passe
                </label>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirmez le nouveau mot de passe"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <Button onClick={handleChangePassword} loading={isLoading}>
                <Lock className="mr-2 h-4 w-4" />
                Changer le mot de passe
              </Button>
            </div>
          </Card>
        </TabsContent>

        {/* Onglet Sauvegarde */}
        <TabsContent value="backup">
          <Card className="p-6">
            <div className="mb-6 flex items-center space-x-3">
              <Database className="h-6 w-6 text-primary-600" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Sauvegarde des données</h2>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b pb-4">
                <div>
                  <p className="font-medium">Sauvegarde automatique</p>
                  <p className="text-sm text-gray-500">
                    Sauvegarde quotidienne à 02h00
                  </p>
                </div>
                <Select
                  value={autoBackup}
                  onChange={(e) => setAutoBackup(e.target.value)}
                  options={notificationOptions}
                  className="w-32"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Dernière sauvegarde</p>
                  <p className="text-sm text-gray-500">
                    {lastBackup}
                  </p>
                </div>
                <Button variant="outline" onClick={handleBackup} loading={isLoading}>
                  <Database className="mr-2 h-4 w-4" />
                  Sauvegarder maintenant
                </Button>
              </div>
            </div>

            <div className="mt-6 border-t pt-4">
              <Button variant="outline" onClick={handleExportData}>
                <Download className="mr-2 h-4 w-4" />
                Exporter la configuration
              </Button>
            </div>
          </Card>
        </TabsContent>

        {/* Onglet Système */}
        <TabsContent value="systeme">
          <Card className="p-6">
            <div className="mb-6 flex items-center space-x-3">
              <RefreshCw className="h-6 w-6 text-primary-600" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Informations système</h2>
            </div>
            
            <div className="space-y-3 text-sm">
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-500">Version de l'application</span>
                <span className="font-medium">{appVersion}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-500">Environnement</span>
                <span className="font-medium">Production</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-500">Base de données</span>
                <span className="font-medium">PostgreSQL (Supabase)</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-500">Dernière connexion</span>
                <span className="font-medium">{new Date().toLocaleString()}</span>
              </div>
            </div>

            <div className="mt-6 border-t pt-4">
              <div className="flex flex-wrap gap-3">
                <Button variant="outline" onClick={() => {
                  if (confirm('Voulez-vous vider le cache ?')) {
                    localStorage.clear()
                    setSuccessMessage('Cache vidé avec succès')
                  }
                }}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Vider le cache
                </Button>
                <Button variant="outline" onClick={handleResetData}>
                  <AlertCircle className="mr-2 h-4 w-4" />
                  Réinitialiser les données
                </Button>
                <Button variant="outline" onClick={logout}>
                  Se déconnecter
                </Button>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Actions rapides */}
      <Card className="p-4">
        <h3 className="mb-3 font-medium text-gray-900 dark:text-white">Actions rapides</h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <button
            onClick={() => router.push('/admin/departements')}
            className="flex items-center rounded-lg border p-3 transition-colors hover:bg-gray-50"
          >
            <Building2 className="mr-3 h-5 w-5 text-primary-600" />
            <span className="text-sm text-gray-900 dark:text-white">Gérer les départements</span>
            <ChevronRight className="ml-auto h-4 w-4 text-gray-400" />
          </button>
          <button
            onClick={() => router.push('/admin/finances/categories')}
            className="flex items-center rounded-lg border p-3 transition-colors hover:bg-gray-50"
          >
            <DollarSign className="mr-3 h-5 w-5 text-green-600" />
            <span className="text-sm text-gray-900 dark:text-white">Gérer les catégories</span>
            <ChevronRight className="ml-auto h-4 w-4 text-gray-400" />
          </button>
          <button
            onClick={() => router.push('/admin/utilisateurs')}
            className="flex items-center rounded-lg border p-3 transition-colors hover:bg-gray-50"
          >
            <UserCog className="mr-3 h-5 w-5 text-blue-600" />
            <span className="text-sm text-gray-900 dark:text-white ">Gérer les utilisateurs</span>
            <ChevronRight className="ml-auto h-4 w-4 text-gray-400" />
          </button>
          <button
            onClick={() => router.push('/admin/rapports')}
            className="flex items-center rounded-lg border p-3 transition-colors hover:bg-gray-50"
          >
            <FileText className="mr-3 h-5 w-5 text-purple-600" />
            <span className="text-sm text-gray-900 dark:text-white">Gérer les rapports</span>
            <ChevronRight className="ml-auto h-4 w-4 text-gray-400" />
          </button>
        </div>
      </Card>
    </div>
  )
}