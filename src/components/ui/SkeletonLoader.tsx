import React from 'react'

interface SkeletonLoaderProps {
  className?: string
  lines?: number
  height?: string
  width?: string
}

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({ 
  className = '', 
  lines = 1,
  height = 'h-4',
  width = 'w-full'
}) => {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, index) => (
        <div
          key={index}
          className={`
            animate-pulse bg-gray-300 rounded
            ${height}
            ${index === lines - 1 ? 'w-3/4' : width}
          `}
        />
      ))}
    </div>
  )
}

export const CardSkeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`bg-white rounded-lg shadow-sm p-6 ${className}`}>
    <div className="animate-pulse">
      <div className="h-6 bg-gray-300 rounded w-3/4 mb-4" />
      <div className="space-y-2">
        <div className="h-4 bg-gray-300 rounded" />
        <div className="h-4 bg-gray-300 rounded w-5/6" />
      </div>
    </div>
  </div>
)

export const TableSkeleton: React.FC<{ rows?: number; className?: string }> = ({ 
  rows = 5, 
  className = '' 
}) => (
  <div className={`space-y-2 ${className}`}>
    {Array.from({ length: rows }).map((_, index) => (
      <div key={index} className="flex space-x-4 p-4 border-b">
        <div className="animate-pulse h-4 bg-gray-300 rounded w-1/4" />
        <div className="animate-pulse h-4 bg-gray-300 rounded w-1/3" />
        <div className="animate-pulse h-4 bg-gray-300 rounded w-1/6" />
        <div className="animate-pulse h-4 bg-gray-300 rounded w-1/5" />
      </div>
    ))}
  </div>
)

export default SkeletonLoader
