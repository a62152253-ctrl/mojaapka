import React from 'react'
import { clsx } from 'clsx'

interface LoaderProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export default function Loader({ size = 'md', className }: LoaderProps) {
  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  }

  return (
    <div
      className={clsx(
        'animate-spin rounded-full border-b-2 border-blue-600',
        sizes[size],
        className
      )}
    />
  )
}

export function FullPageLoader() {
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <Loader size="lg" />
    </div>
  )
}

export function PageLoader() {
  return (
    <div className="flex justify-center py-12">
      <Loader size="md" />
    </div>
  )
}
