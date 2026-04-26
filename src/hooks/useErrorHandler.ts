import { useState, useCallback } from 'react'
import { useToast } from '../components/Toast'

interface ErrorState {
  hasError: boolean
  error: Error | null
  errorInfo: any
}

export function useErrorHandler() {
  const [errorState, setErrorState] = useState<ErrorState>({
    hasError: false,
    error: null,
    errorInfo: null
  })
  
  const { toast } = useToast()

  const handleError = useCallback((error: Error, errorInfo?: any) => {
    console.error('Error caught by handler:', error, errorInfo)
    
    setErrorState({
      hasError: true,
      error,
      errorInfo
    })

    // Show toast notification
    toast.error(
      'Something went wrong',
      error.message || 'An unexpected error occurred'
    )

    // Log to external service (in production)
    if (process.env.NODE_ENV === 'production') {
      // logErrorToService(error, errorInfo)
    }
  }, [toast])

  const resetError = useCallback(() => {
    setErrorState({
      hasError: false,
      error: null,
      errorInfo: null
    })
  }, [])

  const handleAsyncError = useCallback(async (
    asyncFn: () => Promise<any>
  ) => {
    try {
      return await asyncFn()
    } catch (error) {
      handleError(error as Error)
      throw error
    }
  }, [handleError])

  return {
    errorState,
    handleError,
    resetError,
    handleAsyncError
  }
}
