'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, LayoutDashboard, Users, Wallet, Building2, FileText, UserCog, Settings, LogOut } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { NAV_ITEMS, ROLE_LABELS } from '@/lib/constants'

const iconMap: Record<string, any> = {
  LayoutDashboard,
  Users,
  Wallet,
  Building2,
  FileText,
  UserCog,
  Settings,
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

  if (!mounted || !user) return null

  const navItems = NAV_ITEMS[user.role as keyof typeof NAV_ITEMS] || NAV_ITEMS.admin

  const isActive = (href: string) => {
    if (href === '/admin' && pathname === '/admin') return true
    if (href !== '/admin' && pathname.startsWith(href)) return true
    return false
  }

  return (
    <>
      {/* Bouton menu mobile */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 z-50 rounded-full bg-primary-600 p-3 text-white shadow-lg lg:hidden"
      >
        <Menu className="h-6 w-6" />
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Menu panel */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-50 rounded-t-2xl bg-white shadow-xl transition-transform duration-300 lg:hidden ${
          isOpen ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b p-4">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
              <span className="text-primary-600 font-semibold">
                {user.nom ? user.nom.charAt(0) : user.email.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <p className="font-medium text-gray-900">
                {user.nom && user.prenom ? `${user.prenom} ${user.nom}` : user.email}
              </p>
              <p className="text-xs text-gray-500">{ROLE_LABELS[user.role]}</p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="rounded-lg p-2 hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="max-h-[60vh] overflow-y-auto p-4">
          <ul className="space-y-2">
            {navItems.map((item) => {
              const Icon = iconMap[item.icon]
              const active = isActive(item.href)
              
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`flex items-center rounded-lg px-4 py-3 transition-colors ${
                      active
                        ? 'bg-primary-50 text-primary-600'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {Icon && <Icon className="mr-3 h-5 w-5" />}
                    <span>{item.name}</span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="border-t p-4">
          <button
            onClick={() => {
              setIsOpen(false)
              logout()
            }}
            className="flex w-full items-center rounded-lg px-4 py-3 text-red-600 hover:bg-red-50"
          >
            <LogOut className="mr-3 h-5 w-5" />
            <span>Déconnexion</span>
          </button>
        </div>
      </div>
    </>
  )
}