'use client'

import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface ResponsiveHeaderProps {
  title: string
  description?: string
  children?: ReactNode
  className?: string
  titleSize?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl'
  align?: 'left' | 'center' | 'right'
  mobileStack?: boolean
}

export function ResponsiveHeader({ 
  title, 
  description, 
  children,
  className,
  titleSize = '3xl',
  align = 'left',
  mobileStack = true
}: ResponsiveHeaderProps) {
  const titleSizeClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-3xl',
    '2xl': 'text-4xl',
    '3xl': 'text-3xl md:text-4xl'
  }

  const alignClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right'
  }

  return (
    <div className={cn(
      'flex',
      mobileStack ? 'flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0' : 'items-center justify-between',
      alignClasses[align],
      className
    )}>
      <div className={cn('space-y-1', mobileStack && 'text-center md:text-left')}>
        <h1 className={cn(
          'font-bold',
          titleSizeClasses[titleSize]
        )}>
          {title}
        </h1>
        {description && (
          <p className="text-muted-foreground text-sm md:text-base">
            {description}
          </p>
        )}
      </div>
      {children && (
        <div className={cn(
          'flex',
          mobileStack ? 'flex-col space-y-2 md:flex-row md:space-y-0 md:space-x-2' : 'space-x-2'
        )}>
          {children}
        </div>
      )}
    </div>
  )
}
