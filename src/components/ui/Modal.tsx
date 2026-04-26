import React, { useEffect } from 'react'
import { X } from 'lucide-react'
import { clsx } from 'clsx'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md'
}: ModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen) return null

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl'
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={onClose}
        />

        {/* Modal */}
        <div
          className={clsx(
            'relative w-full bg-gray-800 rounded-xl shadow-xl border border-gray-700',
            sizes[size]
          )}
        >
          {/* Header */}
          {(title || onClose !== undefined) && (
            <div className="flex items-center justify-between p-6 border-b border-gray-700">
              {title && (
                <h2 className="text-xl font-semibold text-white">{title}</h2>
              )}
              {onClose && (
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-white transition-colors p-1"
                >
                  <X className="w-6 h-6" />
                </button>
              )}
            </div>
          )}

          {/* Content */}
          <div className={title ? 'p-6' : 'p-6 pt-0'}>
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
