import { useEffect, useRef, useState, useCallback } from 'react'

interface PerformanceMetrics {
  renderTime: number
  componentCount: number
  reRenderCount: number
  memoryUsage?: number
  timestamp: number
}

interface UsePerformanceMonitorReturn {
  metrics: PerformanceMetrics | null
  startMonitoring: () => void
  stopMonitoring: () => void
  isMonitoring: boolean
  reportPerformance: () => void
}

export const usePerformanceMonitor = (componentName: string): UsePerformanceMonitorReturn => {
  const [isMonitoring, setIsMonitoring] = useState(false)
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null)
  const renderCountRef = useRef(0)
  const startTimeRef = useRef<number>(0)
  const observerRef = useRef<PerformanceObserver | null>(null)

  const measureRender = useCallback(() => {
    if (!isMonitoring) return
    
    renderCountRef.current++
    const renderTime = performance.now() - startTimeRef.current
    
    const componentCount = document.querySelectorAll('[data-component]').length
    
    // Get memory usage if available
    let memoryUsage: number | undefined
    if ('memory' in performance) {
      memoryUsage = (performance as any).memory.usedJSHeapSize
    }

    const newMetrics: PerformanceMetrics = {
      renderTime,
      componentCount,
      reRenderCount: renderCountRef.current,
      memoryUsage,
      timestamp: Date.now()
    }

    setMetrics(newMetrics)
  }, [isMonitoring, setMetrics])

  const startMonitoring = useCallback(() => {
    setIsMonitoring(true)
    renderCountRef.current = 0
    startTimeRef.current = performance.now()

    // Set up performance observer for long tasks
    if ('PerformanceObserver' in window) {
      observerRef.current = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        entries.forEach((entry) => {
          if (entry.duration > 50) { // Long tasks over 50ms
            console.warn(`[Performance] Long task detected in ${componentName}:`, {
              duration: entry.duration,
              startTime: entry.startTime,
              name: entry.name
            })
          }
        })
      })
      
      observerRef.current.observe({ entryTypes: ['longtask'] })
    }

    console.log(`[Performance] Started monitoring ${componentName}`)
  }, [componentName, setIsMonitoring, renderCountRef, startTimeRef])

  const stopMonitoring = useCallback(() => {
    setIsMonitoring(false)
    
    if (observerRef.current) {
      observerRef.current.disconnect()
      observerRef.current = null
    }

    console.log(`[Performance] Stopped monitoring ${componentName}`)
  }, [componentName, setIsMonitoring, observerRef])

  const reportPerformance = useCallback(() => {
    if (!metrics) {
      console.log(`[Performance] No metrics available for ${componentName}`)
      return
    }

    const report = {
      component: componentName,
      ...metrics,
      averageRenderTime: metrics.renderTime / metrics.reRenderCount,
      timestamp: new Date(metrics.timestamp).toISOString()
    }

    console.table(report)
    
    // Performance warnings
    if (metrics.renderTime > 100) {
      console.warn(`[Performance] High render time in ${componentName}: ${metrics.renderTime.toFixed(2)}ms`)
    }
    
    if (metrics.reRenderCount > 10) {
      console.warn(`[Performance] High re-render count in ${componentName}: ${metrics.reRenderCount}`)
    }
    
    if (metrics.memoryUsage && metrics.memoryUsage > 50 * 1024 * 1024) { // 50MB
      console.warn(`[Performance] High memory usage in ${componentName}: ${(metrics.memoryUsage / 1024 / 1024).toFixed(2)}MB`)
    }
  }, [componentName, metrics])

  useEffect(() => {
    if (isMonitoring) {
      measureRender()
    }
  }, [isMonitoring, measureRender])

  useEffect(() => {
    return () => {
      stopMonitoring()
    }
  }, [stopMonitoring])

  return {
    metrics,
    startMonitoring,
    stopMonitoring,
    isMonitoring,
    reportPerformance
  }
}

// Performance monitoring hook for dashboard components
export const useDashboardPerformance = () => {
  const [slowRenders, setSlowRenders] = useState<Array<{name: string; duration: number}>>([])
  const [memoryPressure, setMemoryPressure] = useState(false)

  useEffect(() => {
    // Monitor for memory pressure
    if ('memory' in performance) {
      const checkMemory = () => {
        const memory = (performance as any).memory
        const usage = memory.usedJSHeapSize / memory.jsHeapSizeLimit
        setMemoryPressure(usage > 0.8)
      }

      const interval = setInterval(checkMemory, 5000)
      return () => clearInterval(interval)
    }
  }, [])

  const trackSlowRender = useCallback((componentName: string, duration: number) => {
    if (duration > 100) {
      setSlowRenders(prev => [...prev, { name: componentName, duration }])
      console.warn(`[Performance] Slow render detected: ${componentName} took ${duration.toFixed(2)}ms`)
    }
  }, [setSlowRenders])

  const clearSlowRenders = useCallback(() => {
    setSlowRenders([])
  }, [setSlowRenders])

  return {
    slowRenders,
    memoryPressure,
    trackSlowRender,
    clearSlowRenders
  }
}

export default usePerformanceMonitor
