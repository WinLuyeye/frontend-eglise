// components/layout/MobileNav.tsx
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { 
  Menu, 
  X, 
  LayoutDashboard, 
  Users, 
  Wallet, 
  Building2, 
  FileText, 
  UserCog, 
  Settings, 
  LogOut,
  Home,
  ChevronRight,
  User,
  ClipboardList
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { NAV_ITEMS, ROLE_LABELS } from '@/lib/constants'

// Configuration du logo
const LOGO_URL = 'https://res.cloudinary.com/dukqurtfw/image/upload/v1782683211/logo1_raqypr.png'
const LOGO_ALT = 'Logo CECJC - La Communauté des Églises Le Camp de Jésus-Christ'

const iconMap: Record<string, any> = {
  LayoutDashboard,
  Users,
  Wallet,
  Building2,
  FileText,
  UserCog,
  Settings,
  Home,
  ClipboardList,
}

export const MobileNav = () => {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Fermer le menu quand la route change
  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  // Empêcher le scroll quand le menu est ouvert
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!mounted || !user) return null

  const navItems = NAV_ITEMS[user.role as keyof typeof NAV_ITEMS] || NAV_ITEMS.admin

  const isActive = (href: string) => {
    if (href === '/admin' && pathname === '/admin') return true
    if (href !== '/admin' && pathname.startsWith(href)) return true
    return false
  }

  // Récupérer les premiers items pour la bottom nav
  const bottomNavItems = navItems.slice(0, 4)

  return (
    <>
      {/* Bottom Navigation - visible sur mobile */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 dark:bg-gray-900 dark:border-gray-700 lg:hidden">
        <div className="flex items-center justify-around px-2 py-1">
          {bottomNavItems.map((item) => {
            const Icon = iconMap[item.icon]
            const active = isActive(item.href)
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center py-1 px-3 rounded-lg transition-colors ${
                  active
                    ? 'text-primary-600 dark:text-primary-400'
                    : 'text-gray-500 dark:text-gray-400'
                }`}
              >
                {Icon && <Icon className="h-6 w-6" />}
                <span className="text-[10px] mt-0.5">{item.name}</span>
              </Link>
            )
          })}
          
          {/* Bouton menu hamburger */}
          <button
            onClick={() => setIsOpen(true)}
            className="flex flex-col items-center py-1 px-3 rounded-lg text-gray-500 dark:text-gray-400"
          >
            <Menu className="h-6 w-6" />
            <span className="text-[10px] mt-0.5">Menu</span>
          </button>
        </div>
      </div>

      {/* Menu Hamburger Full Screen */}
      <div
        className={`fixed inset-0 z-50 bg-white dark:bg-gray-900 transition-transform duration-300 ease-in-out lg:hidden ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header du menu avec logo */}
        <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center space-x-3">
            <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg">
<Image
  src="https://res.cloudinary.com/dukqurtfw/image/upload/v1782683211/logo1_raqypr.png"
  alt="Logo"
  fill
  sizes="(max-width: 640px) 80vw, (max-width: 1024px) 60vw, 40vw"
  priority // Si c'est un logo important à charger rapidement
  className="object-contain"
/>
            </div>
            <div>
              <p className="font-semibold text-gray-900 dark:text-white text-sm leading-tight">
                C.E.C.J.C.
              </p>
              <p className="text-[10px] text-gray-500 dark:text-gray-400 leading-tight">
                Gestion d'Église
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <X className="h-6 w-6 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        {/* Infos utilisateur */}
        <div className="border-b border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center space-x-3">
            <div className="h-14 w-14 rounded-full bg-primary-100 flex items-center justify-center dark:bg-primary-900/30">
              <span className="text-2xl font-semibold text-primary-600 dark:text-primary-400">
                {user.nom ? user.nom.charAt(0).toUpperCase() : user.email?.charAt(0).toUpperCase() || 'U'}
              </span>
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-900 dark:text-white text-lg">
                {user.nom && user.prenom ? `${user.prenom} ${user.nom}` : user.email}
              </p>
              <div className="flex items-center space-x-2 mt-1">
                <span className="inline-flex items-center rounded-full bg-primary-100 px-2.5 py-0.5 text-xs font-medium text-primary-700 dark:bg-primary-900/30 dark:text-primary-400">
                  {ROLE_LABELS[user.role as keyof typeof ROLE_LABELS] || user.role}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 pb-24">
          <div className="space-y-1">
            <p className="px-3 text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">
              Navigation
            </p>
            {navItems.map((item) => {
              const Icon = iconMap[item.icon]
              const active = isActive(item.href)
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center justify-between rounded-lg px-3 py-3 transition-colors ${
                    active
                      ? 'bg-primary-50 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400'
                      : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                  }`}
                >
                  <div className="flex items-center">
                    {Icon && <Icon className="mr-3 h-5 w-5" />}
                    <span className="font-medium">{item.name}</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                </Link>
              )
            })}
          </div>

          {/* Section déconnexion */}
          <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-4">
            <button
              onClick={() => {
                setIsOpen(false)
                logout()
              }}
              className="flex w-full items-center rounded-lg px-3 py-3 text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
            >
              <LogOut className="mr-3 h-5 w-5" />
              <span className="font-medium">Déconnexion</span>
            </button>
          </div>
        </nav>
      </div>
    </>
  )
}