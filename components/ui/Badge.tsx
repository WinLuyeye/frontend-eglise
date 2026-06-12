'use client'

import { ReactNode } from 'react'

interface BadgeProps {
  children: ReactNode
  variant?: 'default' | 'secondary' | 'success' | 'warning' | 'danger' | 'info' | 'purple'
  size?: 'sm' | 'md' | 'lg'
  rounded?: boolean
  className?: string
}

export const Badge = ({ children, variant = 'default', size = 'md', rounded = false, className = '' }: BadgeProps) => {
  const variants = {
    default: 'bg-gray-100 text-gray-800',
    secondary: 'bg-gray-100 text-gray-600',  // Ajouter cette ligne
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    danger: 'bg-red-100 text-red-800',
    info: 'bg-blue-100 text-blue-800',
    purple: 'bg-purple-100 text-purple-800',
  }
  
  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-0.5 text-sm',
    lg: 'px-3 py-1 text-base',
  }
  
  const roundedClass = rounded ? 'rounded-full' : 'rounded-md'
  
  return (
    <span className={`inline-flex items-center font-medium ${variants[variant]} ${sizes[size]} ${roundedClass} ${className}`}>
      {children}
    </span>
  )
}