import React from 'react'
import { clsx } from 'clsx'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  hover?: boolean
  padding?: 'sm' | 'md' | 'lg'
}

export default function Card({
  children,
  hover = false,
  padding = 'md',
  className,
  ...props
}: CardProps) {
  const baseStyles = 'bg-gray-800 rounded-lg border border-gray-700'
  
  const hoverStyles = hover ? 'hover:border-gray-600 hover:shadow-lg transition-all duration-200' : ''
  
  const paddings = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  }

  return (
    <div
      className={clsx(
        baseStyles,
        hoverStyles,
        paddings[padding],
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
