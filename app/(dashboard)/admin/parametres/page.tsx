// app/(dashboard)/admin/parametres/page.tsx
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
  Download,
  Moon,
  Sun,
  Monitor
} from 'lucide-react'
import { Card, Button, Input, Select, Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui'
import { useAuth } from '@/hooks/useAuth'
import { useAuthStore } from '@/store/authStore'
import { useUIStore } from '@/store/uiStore'

// Taux de change par défaut
const TAUX_CHANGE_DEFAUT = 2250

export default function ParametresPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { logout } = useAuthStore()
  const { darkMode, toggleDarkMode } = useUIStore()
  
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
  
  // Formulaire thème
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>(
    darkMode ? 'dark' : 'light'
  )
  
  // Formulaire notifications
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

  // Sauvegarder le thème
  const handleSaveTheme = async () => {
    setIsLoading(true)
    try {
      if (theme === 'dark') {
        toggleDarkMode()
        localStorage.setItem('theme', 'dark')
      } else if (theme === 'light') {
        if (darkMode) toggleDarkMode()
        localStorage.setItem('theme', 'light')
      } else {
        localStorage.setItem('theme', 'system')
        // Vérifier le thème système
        if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
          if (!darkMode) toggleDarkMode()
        } else {
          if (darkMode) toggleDarkMode()
        }
      }
      setSuccessMessage('Thème sauvegardé avec succès')
    } catch (error) {
      setErrorMessage('Erreur lors de la sauvegarde du thème')
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

  const themeOptions = [
    { value: 'light', label: 'Clair' },
    { value: 'dark', label: 'Sombre' },
    { value: 'system', label: 'Système' },
  ]

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Paramètres</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Gérez la configuration de votre application
          </p>
        </div>
        <Button 
          variant="outline" 
          onClick={() => router.push('/admin')}
          className="dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
        >
          Retour au dashboard
        </Button>
      </div>

      {/* Messages de notification - Dark mode */}
      {successMessage && (
        <div className="flex items-center space-x-2 rounded-lg bg-green-50 p-3 text-green-700 dark:bg-green-900/20 dark:text-green-400">
          <CheckCircle className="h-5 w-5" />
          <span>{successMessage}</span>
        </div>
      )}
      {errorMessage && (
        <div className="flex items-center space-x-2 rounded-lg bg-red-50 p-3 text-red-700 dark:bg-red-900/20 dark:text-red-400">
          <AlertCircle className="h-5 w-5" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Menu des paramètres - Dark mode */}
      <Tabs defaultValue="general" className="space-y-4">
        <TabsList className="flex flex-wrap gap-2 dark:bg-gray-900 dark:border-gray-800">
          <TabsTrigger value="general" className="flex items-center space-x-2 dark:text-gray-400 dark:data-[state=active]:text-white">
            <Settings className="h-4 w-4" />
            <span>Général</span>
          </TabsTrigger>
          <TabsTrigger value="devises" className="flex items-center space-x-2 dark:text-gray-400 dark:data-[state=active]:text-white">
            <Landmark className="h-4 w-4" />
            <span>Devises</span>
          </TabsTrigger>
          <TabsTrigger value="theme" className="flex items-center space-x-2 dark:text-gray-400 dark:data-[state=active]:text-white">
            <Monitor className="h-4 w-4" />
            <span>Thème</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center space-x-2 dark:text-gray-400 dark:data-[state=active]:text-white">
            <Bell className="h-4 w-4" />
            <span>Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="securite" className="flex items-center space-x-2 dark:text-gray-400 dark:data-[state=active]:text-white">
            <Lock className="h-4 w-4" />
            <span>Sécurité</span>
          </TabsTrigger>
          <TabsTrigger value="backup" className="flex items-center space-x-2 dark:text-gray-400 dark:data-[state=active]:text-white">
            <Database className="h-4 w-4" />
            <span>Sauvegarde</span>
          </TabsTrigger>
          <TabsTrigger value="systeme" className="flex items-center space-x-2 dark:text-gray-400 dark:data-[state=active]:text-white">
            <RefreshCw className="h-4 w-4" />
            <span>Système</span>
          </TabsTrigger>
        </TabsList>

        {/* Onglet Général - Dark mode */}
        <TabsContent value="general">
          <Card className="p-6 dark:bg-gray-900 dark:border-gray-800">
            <div className="mb-6 flex items-center space-x-3">
              <Settings className="h-6 w-6 text-primary-600 dark:text-primary-400" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Paramètres généraux</h2>
            </div>
            
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Nom de l'application
                </label>
                <Input
                  value={appName}
                  onChange={(e) => setAppName(e.target.value)}
                  placeholder="Gestion d'Église"
                  className="dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Version
                </label>
                <Input
                  value={appVersion}
                  onChange={(e) => setAppVersion(e.target.value)}
                  placeholder="1.0.0"
                  disabled
                  className="dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400"
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

        {/* Onglet Devises - Dark mode */}
        <TabsContent value="devises">
          <Card className="p-6 dark:bg-gray-900 dark:border-gray-800">
            <div className="mb-6 flex items-center space-x-3">
              <Landmark className="h-6 w-6 text-primary-600 dark:text-primary-400" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Configuration des devises</h2>
            </div>
            
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Taux de change (1 USD = ? CDF)
                </label>
                <Input
                  type="number"
                  value={tauxChange}
                  onChange={(e) => setTauxChange(Number(e.target.value))}
                  className="dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Utilisé pour convertir automatiquement les montants
                </p>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Devise principale
                </label>
                <Select
                  value={devisePrincipale}
                  onChange={(e) => setDevisePrincipale(e.target.value)}
                  options={[
                    { value: 'CDF', label: 'CDF - Franc congolais' },
                    { value: 'USD', label: 'USD - Dollar américain' }
                  ]}
                  className="dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Devise secondaire
                </label>
                <Select
                  value={deviseSecondaire}
                  onChange={(e) => setDeviseSecondaire(e.target.value)}
                  options={[
                    { value: 'USD', label: 'USD - Dollar américain' },
                    { value: 'CDF', label: 'CDF - Franc congolais' }
                  ]}
                  className="dark:bg-gray-800 dark:border-gray-700 dark:text-white"
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

        {/* Onglet Thème - Nouveau */}
        <TabsContent value="theme">
          <Card className="p-6 dark:bg-gray-900 dark:border-gray-800">
            <div className="mb-6 flex items-center space-x-3">
              <Monitor className="h-6 w-6 text-primary-600 dark:text-primary-400" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Apparence</h2>
            </div>
            
            <div className="space-y-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Choisissez le thème de l'application
              </p>
              
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <button
                  onClick={() => setTheme('light')}
                  className={`flex flex-col items-center rounded-lg border-2 p-4 transition-all ${
                    theme === 'light' 
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' 
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <Sun className="h-8 w-8 text-yellow-500" />
                  <span className="mt-2 text-sm font-medium text-gray-900 dark:text-white">Clair</span>
                </button>
                
                <button
                  onClick={() => setTheme('dark')}
                  className={`flex flex-col items-center rounded-lg border-2 p-4 transition-all ${
                    theme === 'dark' 
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' 
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <Moon className="h-8 w-8 text-indigo-500" />
                  <span className="mt-2 text-sm font-medium text-gray-900 dark:text-white">Sombre</span>
                </button>
                
                <button
                  onClick={() => setTheme('system')}
                  className={`flex flex-col items-center rounded-lg border-2 p-4 transition-all ${
                    theme === 'system' 
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' 
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <Monitor className="h-8 w-8 text-gray-500" />
                  <span className="mt-2 text-sm font-medium text-gray-900 dark:text-white">Système</span>
                </button>
              </div>
              
              <div className="mt-2 flex items-center rounded-lg bg-blue-50 p-3 text-sm text-blue-700 dark:bg-blue-900/20 dark:text-blue-400">
                <AlertCircle className="mr-2 h-4 w-4" />
                Le thème système utilise les préférences de votre appareil
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <Button onClick={handleSaveTheme} loading={isLoading}>
                <Save className="mr-2 h-4 w-4" />
                Enregistrer
              </Button>
            </div>
          </Card>
        </TabsContent>

        {/* Onglet Notifications - Dark mode */}
        <TabsContent value="notifications">
          <Card className="p-6 dark:bg-gray-900 dark:border-gray-800">
            <div className="mb-6 flex items-center space-x-3">
              <Bell className="h-6 w-6 text-primary-600 dark:text-primary-400" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Préférences de notification</h2>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b pb-4 dark:border-gray-700">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Notifications par email</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Recevoir des alertes par email
                  </p>
                </div>
                <Select
                  value={emailNotifications}
                  onChange={(e) => setEmailNotifications(e.target.value)}
                  options={notificationOptions}
                  className="w-32 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                />
              </div>
              
              <div className="flex items-center justify-between border-b pb-4 dark:border-gray-700">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Rapports mensuels</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Être notifié quand un rapport est soumis
                  </p>
                </div>
                <Select
                  value={rapportNotifications}
                  onChange={(e) => setRapportNotifications(e.target.value)}
                  options={notificationOptions}
                  className="w-32 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Alertes financières</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Être notifié pour les transactions importantes
                  </p>
                </div>
                <Select
                  value={financeNotifications}
                  onChange={(e) => setFinanceNotifications(e.target.value)}
                  options={notificationOptions}
                  className="w-32 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
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

        {/* Onglet Sécurité - Dark mode */}
        <TabsContent value="securite">
          <Card className="p-6 dark:bg-gray-900 dark:border-gray-800">
            <div className="mb-6 flex items-center space-x-3">
              <Lock className="h-6 w-6 text-primary-600 dark:text-primary-400" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Changer le mot de passe</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Mot de passe actuel
                </label>
                <Input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Entrez votre mot de passe actuel"
                  className="dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Nouveau mot de passe
                </label>
                <Input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimum 6 caractères"
                  className="dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Confirmer le mot de passe
                </label>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirmez le nouveau mot de passe"
                  className="dark:bg-gray-800 dark:border-gray-700 dark:text-white"
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

        {/* Onglet Sauvegarde - Dark mode */}
        <TabsContent value="backup">
          <Card className="p-6 dark:bg-gray-900 dark:border-gray-800">
            <div className="mb-6 flex items-center space-x-3">
              <Database className="h-6 w-6 text-primary-600 dark:text-primary-400" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Sauvegarde des données</h2>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b pb-4 dark:border-gray-700">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Sauvegarde automatique</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Sauvegarde quotidienne à 02h00
                  </p>
                </div>
                <Select
                  value={autoBackup}
                  onChange={(e) => setAutoBackup(e.target.value)}
                  options={notificationOptions}
                  className="w-32 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Dernière sauvegarde</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {lastBackup}
                  </p>
                </div>
                <Button variant="outline" onClick={handleBackup} loading={isLoading} className="dark:border-gray-700 dark:text-gray-300">
                  <Database className="mr-2 h-4 w-4" />
                  Sauvegarder maintenant
                </Button>
              </div>
            </div>

            <div className="mt-6 border-t pt-4 dark:border-gray-700">
              <Button variant="outline" onClick={handleExportData} className="dark:border-gray-700 dark:text-gray-300">
                <Download className="mr-2 h-4 w-4" />
                Exporter la configuration
              </Button>
            </div>
          </Card>
        </TabsContent>

        {/* Onglet Système - Dark mode */}
        <TabsContent value="systeme">
          <Card className="p-6 dark:bg-gray-900 dark:border-gray-800">
            <div className="mb-6 flex items-center space-x-3">
              <RefreshCw className="h-6 w-6 text-primary-600 dark:text-primary-400" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Informations système</h2>
            </div>
            
            <div className="space-y-3 text-sm">
              <div className="flex justify-between border-b pb-2 dark:border-gray-700">
                <span className="text-gray-500 dark:text-gray-400">Version de l'application</span>
                <span className="font-medium text-gray-900 dark:text-white">{appVersion}</span>
              </div>
              <div className="flex justify-between border-b pb-2 dark:border-gray-700">
                <span className="text-gray-500 dark:text-gray-400">Environnement</span>
                <span className="font-medium text-gray-900 dark:text-white">Production</span>
              </div>
              <div className="flex justify-between border-b pb-2 dark:border-gray-700">
                <span className="text-gray-500 dark:text-gray-400">Base de données</span>
                <span className="font-medium text-gray-900 dark:text-white">PostgreSQL (Supabase)</span>
              </div>
              <div className="flex justify-between border-b pb-2 dark:border-gray-700">
                <span className="text-gray-500 dark:text-gray-400">Thème actuel</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {darkMode ? 'Sombre' : 'Clair'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Dernière connexion</span>
                <span className="font-medium text-gray-900 dark:text-white">{new Date().toLocaleString()}</span>
              </div>
            </div>

            <div className="mt-6 border-t pt-4 dark:border-gray-700">
              <div className="flex flex-wrap gap-3">
                <Button variant="outline" onClick={() => {
                  if (confirm('Voulez-vous vider le cache ?')) {
                    localStorage.clear()
                    setSuccessMessage('Cache vidé avec succès')
                  }
                }} className="dark:border-gray-700 dark:text-gray-300">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Vider le cache
                </Button>
                <Button variant="outline" onClick={handleResetData} className="dark:border-gray-700 dark:text-gray-300">
                  <AlertCircle className="mr-2 h-4 w-4" />
                  Réinitialiser les données
                </Button>
                <Button variant="outline" onClick={logout} className="dark:border-gray-700 dark:text-gray-300">
                  Se déconnecter
                </Button>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Actions rapides - Dark mode */}
      <Card className="p-4 dark:bg-gray-900 dark:border-gray-800">
        <h3 className="mb-3 font-medium text-gray-900 dark:text-white">Actions rapides</h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <button
            onClick={() => router.push('/admin/departements')}
            className="flex items-center rounded-lg border p-3 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
          >
            <Building2 className="mr-3 h-5 w-5 text-primary-600 dark:text-primary-400" />
            <span className="text-sm text-gray-900 dark:text-white">Gérer les départements</span>
            <ChevronRight className="ml-auto h-4 w-4 text-gray-400" />
          </button>
          <button
            onClick={() => router.push('/admin/finances/categories')}
            className="flex items-center rounded-lg border p-3 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
          >
            <DollarSign className="mr-3 h-5 w-5 text-green-600 dark:text-green-400" />
            <span className="text-sm text-gray-900 dark:text-white">Gérer les catégories</span>
            <ChevronRight className="ml-auto h-4 w-4 text-gray-400" />
          </button>
          <button
            onClick={() => router.push('/admin/utilisateurs')}
            className="flex items-center rounded-lg border p-3 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
          >
            <UserCog className="mr-3 h-5 w-5 text-blue-600 dark:text-blue-400" />
            <span className="text-sm text-gray-900 dark:text-white">Gérer les utilisateurs</span>
            <ChevronRight className="ml-auto h-4 w-4 text-gray-400" />
          </button>
          <button
            onClick={() => router.push('/admin/rapports')}
            className="flex items-center rounded-lg border p-3 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
          >
            <FileText className="mr-3 h-5 w-5 text-purple-600 dark:text-purple-400" />
            <span className="text-sm text-gray-900 dark:text-white">Gérer les rapports</span>
            <ChevronRight className="ml-auto h-4 w-4 text-gray-400" />
          </button>
        </div>
      </Card>
    </div>
  )
}