import React from 'react'
import { Loader2, Code, Sparkles } from 'lucide-react'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  color?: 'blue' | 'purple' | 'green' | 'red' | 'yellow' | 'white' | 'gray'
  text?: string
  fullScreen?: boolean
  overlay?: boolean
  variant?: 'spinner' | 'dots' | 'pulse' | 'skeleton'
}

export default function LoadingSpinner({
  size = 'md',
  color = 'blue',
  text,
  fullScreen = false,
  overlay = false,
  variant = 'spinner'
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  }

  const colorClasses = {
    blue: 'text-blue-600',
    purple: 'text-purple-600',
    green: 'text-green-600',
    red: 'text-red-600',
    yellow: 'text-yellow-600',
    white: 'text-white',
    gray: 'text-gray-600'
  }

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl'
  }

  const getSpinnerVariant = () => {
    switch (variant) {
      case 'dots':
        return (
          <div className="flex space-x-2">
            <div className={`w-2 h-2 ${colorClasses[color]} rounded-full animate-bounce`} style={{ animationDelay: '0ms' }}></div>
            <div className={`w-2 h-2 ${colorClasses[color]} rounded-full animate-bounce`} style={{ animationDelay: '150ms' }}></div>
            <div className={`w-2 h-2 ${colorClasses[color]} rounded-full animate-bounce`} style={{ animationDelay: '300ms' }}></div>
          </div>
        )
      
      case 'pulse':
        return (
          <div className={`${sizeClasses[size]} ${colorClasses[color]} rounded-full animate-pulse bg-current opacity-75`}></div>
        )
      
      case 'skeleton':
        return (
          <div className="animate-pulse space-y-2">
            <div className="h-4 bg-gray-300 rounded w-3/4"></div>
            <div className="h-4 bg-gray-300 rounded w-1/2"></div>
            <div className="h-4 bg-gray-300 rounded w-5/6"></div>
          </div>
        )
      
      default:
        return (
          <Loader2 className={`${sizeClasses[size]} ${colorClasses[color]} animate-spin`} />
        )
    }
  }

  const content = (
    <div className={`flex flex-col items-center justify-center space-y-4 ${
      fullScreen ? 'min-h-screen' : ''
    } ${overlay ? 'absolute inset-0 bg-white/80 backdrop-blur-sm z-50' : ''}`}>
      {/* Logo/Icon */}
      {variant === 'spinner' && (
        <div className="relative">
          {getSpinnerVariant()}
          {size === 'xl' && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Code className="w-1/2 h-1/2 text-white" />
            </div>
          )}
        </div>
      )}
      
      {variant !== 'spinner' && getSpinnerVariant()}

      {/* Loading Text */}
      {text && (
        <div className="text-center">
          <p className={`${textSizeClasses[size]} ${colorClasses[color]} font-medium`}>
            {text}
          </p>
        </div>
      )}

      {/* Additional decorative elements for full screen */}
      {fullScreen && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-20">
            <Sparkles className="w-8 h-8 text-blue-200 animate-pulse" />
          </div>
          <div className="absolute top-40 right-32">
            <Sparkles className="w-6 h-6 text-purple-200 animate-pulse" style={{ animationDelay: '500ms' }} />
          </div>
          <div className="absolute bottom-32 left-40">
            <Sparkles className="w-10 h-10 text-green-200 animate-pulse" style={{ animationDelay: '1000ms' }} />
          </div>
          <div className="absolute bottom-20 right-20">
            <Sparkles className="w-7 h-7 text-yellow-200 animate-pulse" style={{ animationDelay: '1500ms' }} />
          </div>
        </div>
      )}
    </div>
  )

  return content
}

// Predefined loading states
export const LoadingStates = {
  // Page loading
  FullPage: (text?: string) => (
    <LoadingSpinner
      size="xl"
      color="blue"
      text={text || "Loading..."}
      fullScreen={true}
      variant="spinner"
    />
  ),

  // Button loading
  Button: () => (
    <LoadingSpinner
      size="sm"
      color="white"
      variant="spinner"
    />
  ),

  // Card loading
  Card: () => (
    <LoadingSpinner
      size="md"
      color="purple"
      text="Loading..."
      variant="skeleton"
    />
  ),

  // Form loading
  Form: () => (
    <LoadingSpinner
      size="lg"
      color="blue"
      text="Processing..."
      variant="dots"
    />
  ),

  // Modal loading
  Modal: () => (
    <LoadingSpinner
      size="md"
      color="purple"
      text="Loading..."
      overlay={true}
      variant="spinner"
    />
  ),

  // Minimal loading
  Minimal: () => (
    <LoadingSpinner
      size="sm"
      color="gray"
      variant="dots"
    />
  )
}
