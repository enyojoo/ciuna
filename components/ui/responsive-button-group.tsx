'use client'

import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface ResponsiveButtonGroupProps {
  children: ReactNode
  className?: string
  orientation?: 'horizontal' | 'vertical'
  wrap?: boolean
  spacing?: 'sm' | 'md' | 'lg'
}

export function ResponsiveButtonGroup({ 
  children, 
  className,
  orientation = 'horizontal',
  wrap = true,
  spacing = 'md'
}: ResponsiveButtonGroupProps) {
  const spacingClasses = {
    sm: 'gap-1',
    md: 'gap-2',
    lg: 'gap-3'
  }

  const orientationClasses = {
    horizontal: 'flex-row',
    vertical: 'flex-col'
  }

  const wrapClasses = wrap ? 'flex-wrap' : 'flex-nowrap'

  return (
    <div className={cn(
      'flex',
      orientationClasses[orientation],
      wrapClasses,
      spacingClasses[spacing],
      className
    )}>
      {children}
    </div>
  )
}
