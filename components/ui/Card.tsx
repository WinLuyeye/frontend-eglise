'use client'

import { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  title?: string
  subtitle?: string
  icon?: ReactNode
  className?: string
  headerClassName?: string
  bodyClassName?: string
  footer?: ReactNode
  footerClassName?: string
}

export const Card = ({
  children,
  title,
  subtitle,
  icon,
  className = '',
  headerClassName = '',
  bodyClassName = '',
  footer,
  footerClassName = '',
}: CardProps) => {
  return (
    <div className={`rounded-lg border bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900 ${className}`}>
      {/* Header */}
      {(title || subtitle || icon) && (
        <div className={`flex items-center justify-between border-b p-4 dark:border-gray-700 ${headerClassName}`}>
          <div className="flex items-center space-x-3">
            {icon && <div className="text-gray-500">{icon}</div>}
            <div>
              {title && <h3 className="font-semibold text-gray-900 dark:text-white">{title}</h3>}
              {subtitle && <div className="text-sm text-gray-500 dark:text-gray-400">{subtitle}</div>}
            </div>
          </div>
        </div>
      )}
      
      {/* Body */}
      <div className={`p-4 ${bodyClassName}`}>
        {children}
      </div>
      
      {/* Footer */}
      {footer && (
        <div className={`border-t p-4 dark:border-gray-700 ${footerClassName}`}>
          {footer}
        </div>
      )}
    </div>
  )
}

// StatsCard modifié pour éviter les <div> dans <p>
interface StatsCardProps {
  title: string
  value: string | number
  icon?: ReactNode
  trend?: {
    value: number
    isPositive: boolean
  }
  className?: string
}

export const StatsCard = ({ title, value, icon, trend, className = '' }: StatsCardProps) => {
  return (
    <Card className={`p-4 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm text-gray-500 dark:text-gray-400">{title}</div>
          <div className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">{value}</div>
          {trend && (
            <div className={`mt-1 text-xs ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
            </div>
          )}
        </div>
        {icon && <div className="text-gray-400">{icon}</div>}
      </div>
    </Card>
  )
}