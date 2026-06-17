'use client'

import { useEffect } from 'react'
import './globals.css'
import { useUIStore } from '@/store/uiStore'
import { Toast } from '@/components/ui/Toast'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { darkMode } = useUIStore()

  useEffect(() => {
    // Appliquer le thème au chargement
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [darkMode])

  return (
    <html lang="fr">
      <body className="font-sans antialiased">
        {children}
        <Toast />
      </body>
    </html>
  )
}