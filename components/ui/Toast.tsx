'use client'

import { useEffect } from 'react'
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react'
import { useUIStore } from '@/store/uiStore'

const icons = {
  success: <CheckCircle className="h-5 w-5 text-green-500" />,
  error: <AlertCircle className="h-5 w-5 text-red-500" />,
  warning: <AlertTriangle className="h-5 w-5 text-yellow-500" />,
  info: <Info className="h-5 w-5 text-blue-500" />,
}

const styles = {
  success: 'border-green-500 bg-green-50 dark:bg-green-950/30',
  error: 'border-red-500 bg-red-50 dark:bg-red-950/30',
  warning: 'border-yellow-500 bg-yellow-50 dark:bg-yellow-950/30',
  info: 'border-blue-500 bg-blue-50 dark:bg-blue-950/30',
}

export const Toast = () => {
  const { notification, hideNotification } = useUIStore()

  useEffect(() => {
    if (notification?.show) {
      const timer = setTimeout(() => {
        hideNotification()
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [notification, hideNotification])

  if (!notification?.show) return null

  const { message, type } = notification

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm">
      <div className={`flex items-start rounded-lg border p-4 shadow-lg ${styles[type]}`}>
        <div className="mr-3 flex-shrink-0">
          {icons[type]}
        </div>
        <div className="flex-1">
          <p className="text-sm text-gray-900 dark:text-gray-100">{message}</p>
        </div>
        <button
          onClick={hideNotification}
          className="ml-3 flex-shrink-0 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}