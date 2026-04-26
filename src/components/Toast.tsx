import { useState, useEffect } from 'react'
import { CheckCircle, AlertCircle, AlertTriangle, X, Info } from 'lucide-react'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

interface ToastProps {
  id: string
  type: ToastType
  title: string
  message?: string
  duration?: number
  onClose?: (id: string) => void
}

export default function Toast({ id, type, title, message, duration = 5000, onClose }: ToastProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isLeaving, setIsLeaving] = useState(false)

  useEffect(() => {
    // Trigger entrance animation
    setIsVisible(true)

    // Auto-dismiss after duration
    if (duration > 0) {
      const timer = setTimeout(() => {
        handleClose()
      }, duration)

      return () => clearTimeout(timer)
    }
  }, [duration])

  const handleClose = () => {
    setIsLeaving(true)
    
    // Wait for exit animation before removing
    setTimeout(() => {
      onClose?.(id)
    }, 300)
  }

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5" />
      case 'error':
        return <AlertCircle className="w-5 h-5" />
      case 'warning':
        return <AlertTriangle className="w-5 h-5" />
      case 'info':
        return <Info className="w-5 h-5" />
      default:
        return <Info className="w-5 h-5" />
    }
  }

  const getColors = () => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-green-50',
          border: 'border-green-200',
          icon: 'text-green-600',
          title: 'text-green-900',
          message: 'text-green-700',
          close: 'text-green-400 hover:text-green-600'
        }
      case 'error':
        return {
          bg: 'bg-red-50',
          border: 'border-red-200',
          icon: 'text-red-600',
          title: 'text-red-900',
          message: 'text-red-700',
          close: 'text-red-400 hover:text-red-600'
        }
      case 'warning':
        return {
          bg: 'bg-yellow-50',
          border: 'border-yellow-200',
          icon: 'text-yellow-600',
          title: 'text-yellow-900',
          message: 'text-yellow-700',
          close: 'text-yellow-400 hover:text-yellow-600'
        }
      case 'info':
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          icon: 'text-blue-600',
          title: 'text-blue-900',
          message: 'text-blue-700',
          close: 'text-blue-400 hover:text-blue-600'
        }
      default:
        return {
          bg: 'bg-gray-50',
          border: 'border-gray-200',
          icon: 'text-gray-600',
          title: 'text-gray-900',
          message: 'text-gray-700',
          close: 'text-gray-400 hover:text-gray-600'
        }
    }
  }

  const colors = getColors()

  return (
    <div
      className={`
        transform transition-all duration-300 ease-in-out
        ${isVisible && !isLeaving ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
      `}
    >
      <div className={`
        max-w-sm w-full ${colors.bg} ${colors.border} border rounded-lg shadow-lg
        overflow-hidden backdrop-blur-sm
      `}>
        <div className="p-4">
          <div className="flex items-start">
            {/* Icon */}
            <div className={`flex-shrink-0 ${colors.icon}`}>
              {getIcon()}
            </div>

            {/* Content */}
            <div className="ml-3 w-0 flex-1">
              <p className={`text-sm font-medium ${colors.title}`}>
                {title}
              </p>
              {message && (
                <p className={`mt-1 text-sm ${colors.message}`}>
                  {message}
                </p>
              )}
            </div>

            {/* Close button */}
            <div className="ml-4 flex-shrink-0 flex">
              <button
                className={`inline-flex ${colors.close} transition-colors`}
                onClick={handleClose}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Progress bar (if duration is set) */}
        {duration > 0 && (
          <div className="h-1 bg-gray-200">
            <div
              className={`h-full ${colors.icon} transition-all ease-linear`}
              style={{
                width: '100%',
                animation: `shrink ${duration}ms linear forwards`
              }}
            />
          </div>
        )}
      </div>
    </div>
  )
}

// Toast container component
interface ToastContainerProps {
  toasts: Array<{
    id: string
    type: ToastType
    title: string
    message?: string
    duration?: number
  }>
  onClose: (id: string) => void
}

export function ToastContainer({ toasts, onClose }: ToastContainerProps) {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          {...toast}
          onClose={onClose}
        />
      ))}
    </div>
  )
}

// Hook for managing toasts
export function useToast() {
  const [toasts, setToasts] = useState<Array<{
    id: string
    type: ToastType
    title: string
    message?: string
    duration?: number
  }>>([])

  const showToast = (
    type: ToastType,
    title: string,
    message?: string,
    duration?: number
  ) => {
    const id = Date.now().toString()
    const newToast = { id, type, title, message, duration }
    
    setToasts(prev => [...prev, newToast])
    
    return id
  }

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }

  const toast = {
    success: (title: string, message?: string, duration?: number) =>
      showToast('success', title, message, duration),
    error: (title: string, message?: string, duration?: number) =>
      showToast('error', title, message, duration),
    warning: (title: string, message?: string, duration?: number) =>
      showToast('warning', title, message, duration),
    info: (title: string, message?: string, duration?: number) =>
      showToast('info', title, message, duration),
    dismiss: (id: string) => removeToast(id),
    clear: () => setToasts([])
  }

  return {
    toasts,
    toast,
    removeToast
  }
}

// Add global styles for animation
const style = document.createElement('style')
style.textContent = `
  @keyframes shrink {
    from {
      width: 100%;
    }
    to {
      width: 0%;
    }
  }
`
document.head.appendChild(style)
