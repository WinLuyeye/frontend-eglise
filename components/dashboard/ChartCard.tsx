'use client'

import { ReactNode, useState } from 'react'
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { Card } from '@/components/ui'

interface ChartCardProps {
  title: string
  subtitle?: string
  children: ReactNode
  action?: ReactNode
  className?: string
  isLoading?: boolean
}

export const ChartCard = ({ title, subtitle, children, action, className = '', isLoading = false }: ChartCardProps) => {
  if (isLoading) {
    return (
      <Card className={`p-4 ${className}`}>
        <div className="animate-pulse">
          <div className="mb-4">
            <div className="h-5 w-40 rounded bg-gray-200 dark:bg-gray-700" />
            <div className="mt-1 h-4 w-24 rounded bg-gray-200 dark:bg-gray-700" />
          </div>
          <div className="h-64 rounded bg-gray-200 dark:bg-gray-700" />
        </div>
      </Card>
    )
  }

  return (
    <Card className={`p-4 ${className}`}>
      <div className="mb-4 flex items-start justify-between">
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-white">{title}</h3>
          {subtitle && <p className="text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>}
        </div>
        {action && <div>{action}</div>}
      </div>
      <div className="h-80 w-full">{children}</div>
    </Card>
  )
}

interface AreaChartCardProps {
  title: string
  subtitle?: string
  data: Array<{ [key: string]: any }>
  dataKey: string
  xAxisKey: string
  colors?: string[]
  height?: number
  showGrid?: boolean
}

export const AreaChartCard = ({
  title,
  subtitle,
  data = [],
  dataKey,
  xAxisKey,
  colors = ['#3b82f6'],
  height = 300,
  showGrid = true,
}: AreaChartCardProps) => {
  const chartData = Array.isArray(data) ? data : []
  
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-lg border bg-white p-2 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <p className="mb-1 text-xs font-medium text-gray-500 dark:text-gray-400">{label}</p>
          {payload.map((p: any, index: number) => (
            <p key={index} className="text-sm font-semibold" style={{ color: p.color }}>
              {p.name}: {typeof p.value === 'number' ? p.value.toLocaleString() : p.value}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  if (chartData.length === 0) {
    return (
      <ChartCard title={title} subtitle={subtitle}>
        <div className="flex h-full items-center justify-center">
          <p className="text-gray-500">Aucune donnée disponible</p>
        </div>
      </ChartCard>
    )
  }

  return (
    <ChartCard title={title} subtitle={subtitle}>
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />}
          <XAxis dataKey={xAxisKey} tick={{ fontSize: 12 }} stroke="#9ca3af" />
          <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Area
            type="monotone"
            dataKey={dataKey}
            stroke={colors[0]}
            fill={colors[0]}
            fillOpacity={0.2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}

interface BarChartCardProps {
  title: string
  subtitle?: string
  data: Array<{ [key: string]: any }>
  dataKey: string
  xAxisKey: string
  colors?: string[]
  height?: number
  horizontal?: boolean
}

export const BarChartCard = ({
  title,
  subtitle,
  data = [],
  dataKey,
  xAxisKey,
  colors = ['#3b82f6'],
  height = 300,
  horizontal = false,
}: BarChartCardProps) => {
  const chartData = Array.isArray(data) ? data : []
  
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-lg border bg-white p-2 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <p className="mb-1 text-xs font-medium text-gray-500 dark:text-gray-400">{label}</p>
          {payload.map((p: any, index: number) => (
            <p key={index} className="text-sm font-semibold" style={{ color: p.color }}>
              {p.name}: {typeof p.value === 'number' ? p.value.toLocaleString() : p.value}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  if (chartData.length === 0) {
    return (
      <ChartCard title={title} subtitle={subtitle}>
        <div className="flex h-full items-center justify-center">
          <p className="text-gray-500">Aucune donnée disponible</p>
        </div>
      </ChartCard>
    )
  }

  return (
    <ChartCard title={title} subtitle={subtitle}>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={chartData} layout={horizontal ? 'vertical' : 'horizontal'} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis type={horizontal ? 'number' : 'category'} dataKey={horizontal ? undefined : xAxisKey} tick={{ fontSize: 12 }} stroke="#9ca3af" />
          <YAxis type={horizontal ? 'category' : 'number'} dataKey={horizontal ? xAxisKey : undefined} tick={{ fontSize: 12 }} stroke="#9ca3af" width={100} />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Bar dataKey={dataKey} fill={colors[0]} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}

interface PieChartCardProps {
  title: string
  subtitle?: string
  data: Array<{ name: string; value: number }>
  colors?: string[]
  height?: number
}

const defaultColors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4']

export const PieChartCard = ({ title, subtitle, data = [], colors = defaultColors, height = 300 }: PieChartCardProps) => {
  const chartData = Array.isArray(data) && data.length > 0 ? data : []
  
  // Calculer le total pour les pourcentages
  const total = chartData.reduce((sum, item) => sum + (item.value || 0), 0)
  
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const dataItem = payload[0].payload
      const percentage = total > 0 ? ((dataItem.value / total) * 100).toFixed(1) : 0
      return (
        <div className="rounded-lg border bg-white p-2 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <p className="text-sm font-medium text-gray-900 dark:text-white">{dataItem.name}</p>
          <p className="text-sm text-gray-600 dark:text-gray-300">Valeur: {dataItem.value.toLocaleString()} FC</p>
          <p className="text-sm text-gray-600 dark:text-gray-300">Pourcentage: {percentage}%</p>
        </div>
      )
    }
    return null
  }

  if (chartData.length === 0) {
    return (
      <ChartCard title={title} subtitle={subtitle}>
        <div className="flex h-full items-center justify-center">
          <p className="text-gray-500">Aucune donnée disponible</p>
        </div>
      </ChartCard>
    )
  }

  return (
    <ChartCard title={title} subtitle={subtitle}>
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name}: ${percent ? (percent * 100).toFixed(0) : 0}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((_, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}

interface DonutChartCardProps {
  title: string
  subtitle?: string
  data: Array<{ name: string; value: number }>
  colors?: string[]
  height?: number
}

export const DonutChartCard = ({ title, subtitle, data = [], colors = defaultColors, height = 300 }: DonutChartCardProps) => {
  const chartData = Array.isArray(data) && data.length > 0 ? data : []

  if (chartData.length === 0) {
    return (
      <ChartCard title={title} subtitle={subtitle}>
        <div className="flex h-full items-center justify-center">
          <p className="text-gray-500">Aucune donnée disponible</p>
        </div>
      </ChartCard>
    )
  }

  return (
    <ChartCard title={title} subtitle={subtitle}>
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={2}
            dataKey="value"
            label={({ name, percent }) => `${name}: ${percent ? (percent * 100).toFixed(0) : 0}%`}
          >
            {chartData.map((_, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}