'use client'

import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface ResponsiveGridProps {
  children: ReactNode
  className?: string
  cols?: {
    default?: number
    sm?: number
    md?: number
    lg?: number
    xl?: number
  }
  gap?: 'sm' | 'md' | 'lg' | 'xl'
}

export function ResponsiveGrid({ 
  children, 
  className,
  cols = { default: 1, sm: 2, md: 3, lg: 4 },
  gap = 'md'
}: ResponsiveGridProps) {
  const gapClasses = {
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6',
    xl: 'gap-8'
  }

  const colClasses: Record<number, string> = {
    1: 'grid-cols-1',
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
    5: 'grid-cols-5',
    6: 'grid-cols-6'
  }

  const getColClass = (col: number | undefined, fallback: number = 1): string => {
    return colClasses[col || fallback] || colClasses[fallback]
  }

  const responsiveClasses = [
    getColClass(cols.default, 1),
    cols.sm && `sm:${getColClass(cols.sm)}`,
    cols.md && `md:${getColClass(cols.md)}`,
    cols.lg && `lg:${getColClass(cols.lg)}`,
    cols.xl && `xl:${getColClass(cols.xl)}`
  ].filter(Boolean).join(' ')

  return (
    <div className={cn(
      'grid',
      responsiveClasses,
      gapClasses[gap],
      className
    )}>
      {children}
    </div>
  )
}
