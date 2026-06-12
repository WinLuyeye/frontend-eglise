'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

interface TabsContextType {
  activeTab: string
  setActiveTab: (value: string) => void
}

const TabsContext = createContext<TabsContextType | undefined>(undefined)

const useTabs = () => {
  const context = useContext(TabsContext)
  if (!context) {
    throw new Error('useTabs must be used within Tabs')
  }
  return context
}

interface TabsProps {
  defaultValue: string
  children: ReactNode
  className?: string
  onValueChange?: (value: string) => void
}

export const Tabs = ({ defaultValue, children, className = '', onValueChange }: TabsProps) => {
  const [activeTab, setActiveTab] = useState(defaultValue)

  const handleSetActiveTab = (value: string) => {
    setActiveTab(value)
    onValueChange?.(value)
  }

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab: handleSetActiveTab }}>
      <div className={className}>
        {children}
      </div>
    </TabsContext.Provider>
  )
}

interface TabsListProps {
  children: ReactNode
  className?: string
}

export const TabsList = ({ children, className = '' }: TabsListProps) => {
  return (
    <div className={`flex space-x-1 rounded-lg bg-gray-100 p-1 dark:bg-gray-800 ${className}`}>
      {children}
    </div>
  )
}

interface TabsTriggerProps {
  value: string
  children: ReactNode
  className?: string
}

export const TabsTrigger = ({ value, children, className = '' }: TabsTriggerProps) => {
  const { activeTab, setActiveTab } = useTabs()
  const isActive = activeTab === value

  return (
    <button
      onClick={() => setActiveTab(value)}
      className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-all duration-200 ${
        isActive
          ? 'bg-white text-gray-900 shadow-sm dark:bg-gray-900 dark:text-white'
          : 'text-gray-600 hover:bg-white/50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-900/50 dark:hover:text-white'
      } ${className}`}
    >
      {children}
    </button>
  )
}

interface TabsContentProps {
  value: string
  children: ReactNode
  className?: string
}

export const TabsContent = ({ value, children, className = '' }: TabsContentProps) => {
  const { activeTab } = useTabs()

  if (activeTab !== value) return null

  return (
    <div className={`mt-4 ${className}`}>
      {children}
    </div>
  )
}