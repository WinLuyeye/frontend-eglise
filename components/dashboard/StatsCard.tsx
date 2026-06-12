'use client'

import { ReactNode } from 'react'
import { TrendingUp, TrendingDown, MoreVertical } from 'lucide-react'
import { Card } from '@/components/ui'

interface StatsCardProps {
  title: string
  value: string | number
  icon: ReactNode
  devise?: 'USD' | 'CDF'
  trend?: {
    value: number
    label?: string
  }
  color?: 'primary' | 'success' | 'warning' | 'danger' | 'info'
  className?: string
  isLoading?: boolean
}

const colorVariants = {
  primary: 'bg-primary-50 text-primary-600',
  success: 'bg-green-50 text-green-600',
  warning: 'bg-yellow-50 text-yellow-600',
  danger: 'bg-red-50 text-red-600',
  info: 'bg-blue-50 text-blue-600',
}

export const StatsCard = ({
  title,
  value,
  icon,
  devise,
  trend,
  color = 'primary',
  className = '',
  isLoading = false,
}: StatsCardProps) => {
  const formatValue = (val: string | number) => {
    if (devise === 'USD') {
      return `$${Number(val).toLocaleString()}`
    } else if (devise === 'CDF') {
      return `${Number(val).toLocaleString()} FC`
    }
    return Number(val).toLocaleString()
  }

  if (isLoading) {
    return (
      <Card className={`p-4 ${className}`}>
        <div className="animate-pulse">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="h-4 w-24 rounded bg-gray-200" />
              <div className="h-8 w-32 rounded bg-gray-200" />
            </div>
            <div className="h-12 w-12 rounded-full bg-gray-200" />
          </div>
        </div>
      </Card>
    )
  }

  return (
    <Card className={`p-4 ${className}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2">
            <p className="text-sm font-medium text-gray-500">{title}</p>
            {devise && (
              <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                {devise}
              </span>
            )}
          </div>
          <p className="mt-2 text-2xl font-bold text-gray-900">{formatValue(value)}</p>
          
          {trend && (
            <div className="mt-2 flex items-center space-x-1">
              {trend.value >= 0 ? (
                <TrendingUp className="h-4 w-4 text-green-500" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-500" />
              )}
              <span className={`text-sm font-medium ${trend.value >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {Math.abs(trend.value)}%
              </span>
              {trend.label && (
                <span className="text-sm text-gray-500">{trend.label}</span>
              )}
            </div>
          )}
        </div>
        
        <div className={`rounded-full p-3 ${colorVariants[color]}`}>
          {icon}
        </div>
      </div>
    </Card>
  )
}

// Ajouter InfoCard ici
interface InfoCardProps {
  title: string
  value: string | number
  description?: string
  icon: ReactNode
  devise?: 'USD' | 'CDF'
  className?: string
}

export const InfoCard = ({ title, value, description, icon, devise, className = '' }: InfoCardProps) => {
  const formatValue = (val: string | number) => {
    if (devise === 'USD') {
      return `$${Number(val).toLocaleString()}`
    } else if (devise === 'CDF') {
      return `${Number(val).toLocaleString()} FC`
    }
    return Number(val).toLocaleString()
  }

  return (
    <Card className={`p-4 ${className}`}>
      <div className="flex items-center space-x-4">
        <div className="rounded-full bg-gray-100 p-3">
          {icon}
        </div>
        <div className="flex-1">
          <p className="text-sm text-gray-500">{title}</p>
          <p className="text-xl font-semibold text-gray-900">{formatValue(value)}</p>
          {description && (
            <p className="text-xs text-gray-500">{description}</p>
          )}
        </div>
      </div>
    </Card>
  )
}