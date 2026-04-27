import { useState, useEffect, useCallback } from 'react'

interface UseAsyncState<T> {
  data: T | null
  loading: boolean
  error: Error | null
}

interface UseAsyncReturn<T> extends UseAsyncState<T> {
  execute: (...args: any[]) => Promise<T>
  reset: () => void
}

export const useAsync = <T>(
  asyncFunction: (...args: any[]) => Promise<T>,
  immediate = false
): UseAsyncReturn<T> => {
  const [state, setState] = useState<UseAsyncState<T>>({
    data: null,
    loading: false,
    error: null,
  })

  const execute = useCallback(
    async (...args: any[]): Promise<T> => {
      setState(prev => ({ ...prev, loading: true, error: null }))
      
      try {
        const data = await asyncFunction(...args)
        setState({ data, loading: false, error: null })
        return data
      } catch (error) {
        const err = error instanceof Error ? error : new Error('Unknown error')
        setState(prev => ({ ...prev, loading: false, error: err }))
        throw err
      }
    },
    [asyncFunction, setState]
  )

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null })
  }, [setState])

  useEffect(() => {
    if (immediate) {
      execute()
    }
  }, [execute, immediate])

  return { ...state, execute, reset }
}

export default useAsync
