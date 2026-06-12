'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Users,
  Wallet,
  Building2,
  FileText,
  UserCog,
  Settings,
  Tags,
  BarChart3,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useUIStore } from '@/store/uiStore'
import { NAV_ITEMS, ROLE_LABELS } from '@/lib/constants'

interface NavItem {
  name: string
  href: string
  icon: string
}

// Map des noms d'icônes vers les composants Lucide
const iconMap: Record<string, any> = {
  LayoutDashboard,
  Users,
  Wallet,
  Building2,
  FileText,
  UserCog,
  Settings,
  Tags,
  BarChart3,
}

export const Sidebar = () => {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const { sidebarOpen, toggleSidebar } = useUIStore()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted || !user) return null

  const navItems = NAV_ITEMS[user.role as keyof typeof NAV_ITEMS] || NAV_ITEMS.admin

  const isActive = (href: string) => {
    if (href === '/admin' && pathname === '/admin') return true
    if (href !== '/admin' && pathname.startsWith(href)) return true
    return false
  }

  return (
    <>
      {/* Overlay pour mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-30 h-screen bg-white shadow-lg transition-all duration-300 dark:bg-gray-900 ${
          sidebarOpen ? 'w-64' : 'w-20'
        }`}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-between border-b px-4 dark:border-gray-700">
          {sidebarOpen ? (
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-lg bg-primary-600 flex items-center justify-center">
                <span className="text-white font-bold text-lg">E</span>
              </div>
              <span className="font-bold text-gray-800 dark:text-white">
                Gestion Église
              </span>
            </div>
          ) : (
            <div className="mx-auto h-8 w-8 rounded-lg bg-primary-600 flex items-center justify-center">
              <span className="text-white font-bold text-lg">E</span>
            </div>
          )}
          
          <button
            onClick={toggleSidebar}
            className="rounded-lg p-1 hover:bg-gray-100 dark:hover:bg-gray-800 lg:block hidden"
          >
            {sidebarOpen ? (
              <ChevronLeft className="h-5 w-5 text-gray-500" />
            ) : (
              <ChevronRight className="h-5 w-5 text-gray-500" />
            )}
          </button>
        </div>

        {/* User Info */}
        <div className={`border-b p-4 dark:border-gray-700 ${!sidebarOpen && 'text-center'}`}>
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center dark:bg-primary-900">
              <span className="text-primary-600 font-semibold dark:text-primary-300">
                {user.nom ? user.nom.charAt(0) : user.email.charAt(0).toUpperCase()}
              </span>
            </div>
            {sidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate dark:text-white">
                  {user.nom && user.prenom ? `${user.prenom} ${user.nom}` : user.email}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {ROLE_LABELS[user.role]}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4">
          <ul className="space-y-2">
            {navItems.map((item) => {
              const Icon = iconMap[item.icon]
              const active = isActive(item.href)
              
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`flex items-center rounded-lg px-3 py-2 transition-colors ${
                      active
                        ? 'bg-primary-50 text-primary-600 dark:bg-primary-900/50 dark:text-primary-400'
                        : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                    } ${!sidebarOpen && 'justify-center'}`}
                  >
                    {Icon && <Icon className={`h-5 w-5 ${sidebarOpen ? 'mr-3' : ''}`} />}
                    {sidebarOpen && <span>{item.name}</span>}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Footer avec bouton logout */}
        <div className="border-t p-4 dark:border-gray-700">
          <button
            onClick={() => logout()}
            className={`flex w-full items-center rounded-lg px-3 py-2 text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 ${
              !sidebarOpen && 'justify-center'
            }`}
          >
            <LogOut className={`h-5 w-5 ${sidebarOpen ? 'mr-3' : ''}`} />
            {sidebarOpen && <span>Déconnexion</span>}
          </button>
        </div>
      </aside>
    </>
  )
}