'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import {
  Menu,
  Bell,
  Moon,
  Sun,
  User,
  LogOut,
  Settings,
  ChevronDown,
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useUIStore } from '@/store/uiStore'

interface HeaderProps {
  title?: string
}

export const Header = ({ title }: HeaderProps) => {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const { sidebarOpen, toggleSidebar, darkMode, toggleDarkMode } = useUIStore()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // S'assurer que le thème est appliqué au montage
    const isDark = document.documentElement.classList.contains('dark')
    if (darkMode !== isDark) {
      // Si le store dit dark mais que la classe n'est pas appliquée
      if (darkMode) {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    }
  }, [darkMode])

  const getPageTitle = () => {
    if (title) return title
    
    const segments = pathname.split('/').filter(Boolean)
    if (segments.length === 0) return 'Dashboard'
    
    const pageMap: Record<string, string> = {
      admin: 'Administration',
      pasteur: 'Espace Pasteur',
      tresorier: 'Espace Trésorier',
      secretaire: 'Espace Secrétaire',
      'chef-departement': 'Espace Chef de Département',
      membres: 'Gestion des Membres',
      finances: 'Gestion Financière',
      transactions: 'Transactions',
      categories: 'Catégories',
      departements: 'Départements',
      rapports: 'Rapports',
      utilisateurs: 'Utilisateurs',
      parametres: 'Paramètres',
    }
    
    return pageMap[segments[1]] || segments[1] || 'Dashboard'
  }

  const handleToggleTheme = () => {
    toggleDarkMode()
    // Forcer l'application de la classe (double vérification)
    setTimeout(() => {
      const isDark = document.documentElement.classList.contains('dark')
      console.log('🌓 Thème actuel:', isDark ? 'dark' : 'light')
    }, 100)
  }

  if (!mounted) return null

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4 shadow-sm dark:border-gray-800 dark:bg-gray-950">
      {/* Left section */}
      <div className="flex items-center space-x-4">
        <button
          onClick={toggleSidebar}
          className="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-800 lg:hidden"
        >
          <Menu className="h-5 w-5 text-gray-600 dark:text-gray-400" />
        </button>
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
          {getPageTitle()}
        </h1>
      </div>

      {/* Right section */}
      <div className="flex items-center space-x-3">
        {/* Theme toggle */}
        <button
          onClick={handleToggleTheme}
          className="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
          aria-label="Basculer le thème"
        >
          {darkMode ? (
            <Sun className="h-5 w-5 text-yellow-500" />
          ) : (
            <Moon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          )}
        </button>

        {/* Notifications */}
        <button className="relative rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-800">
          <Bell className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500"></span>
        </button>

        {/* User menu */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center space-x-2 rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center dark:bg-primary-900/30">
              <span className="text-primary-600 font-semibold dark:text-primary-400">
                {user?.nom ? user.nom.charAt(0) : user?.email.charAt(0).toUpperCase()}
              </span>
            </div>
            <ChevronDown className="h-4 w-4 text-gray-600 dark:text-gray-400" />
          </button>

          {showUserMenu && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowUserMenu(false)}
              />
              <div className="absolute right-0 mt-2 w-48 rounded-lg border border-gray-200 bg-white py-1 shadow-lg dark:border-gray-700 dark:bg-gray-900 z-20">
                <div className="border-b border-gray-100 px-4 py-2 dark:border-gray-800">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {user?.nom && user?.prenom ? `${user.prenom} ${user.nom}` : user?.email}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {user?.role === 'administrateur' ? 'Administrateur' :
                     user?.role === 'pasteur' ? 'Pasteur' :
                     user?.role === 'tresorier' ? 'Trésorier' :
                     user?.role === 'secretaire' ? 'Secrétaire' :
                     'Chef de Département'}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowUserMenu(false)
                  }}
                  className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                >
                  <User className="mr-2 h-4 w-4" />
                  Mon profil
                </button>
                <button
                  onClick={() => {
                    setShowUserMenu(false)
                  }}
                  className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                >
                  <Settings className="mr-2 h-4 w-4" />
                  Paramètres
                </button>
                <hr className="my-1 border-gray-100 dark:border-gray-800" />
                <button
                  onClick={() => {
                    setShowUserMenu(false)
                    logout()
                  }}
                  className="flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Déconnexion
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  )
}