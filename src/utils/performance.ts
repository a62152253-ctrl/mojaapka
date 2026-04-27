// Performance optimization utilities

export const performanceUtils = {
  // Memory management
  cleanup: {
    clearIntervals: (intervals: NodeJS.Timeout[]) => {
      intervals.forEach(clearInterval)
      intervals.length = 0
    },
    
    clearTimeouts: (timeouts: NodeJS.Timeout[]) => {
      timeouts.forEach(clearTimeout)
      timeouts.length = 0
    },
    
    removeEventListeners: (element: HTMLElement, events: Array<{ event: string; handler: EventListener }>) => {
      events.forEach(({ event, handler }) => {
        element.removeEventListener(event, handler)
      })
      events.length = 0
    },
    
    disposeObject: (obj: any) => {
      if (obj && typeof obj === 'object') {
        Object.keys(obj).forEach(key => {
          delete obj[key]
        })
      }
    },
  },
  
  // Debounce and throttle utilities
  debounce: <T extends (...args: any[]) => any>(
    func: T,
    wait: number,
    immediate = false
  ): ((...args: Parameters<T>) => void) => {
    let timeout: NodeJS.Timeout | null = null
    
    return (...args: Parameters<T>) => {
      const later = () => {
        timeout = null
        if (!immediate) func(...args)
      }
      
      const callNow = immediate && !timeout
      
      if (timeout) clearTimeout(timeout)
      timeout = setTimeout(later, wait)
      
      if (callNow) func(...args)
    }
  },
  
  throttle: <T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): ((...args: Parameters<T>) => void) => {
    let inThrottle = false
    
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args)
        inThrottle = true
        setTimeout(() => inThrottle = false, limit)
      }
    }
  },
  
  // RequestAnimationFrame utilities
  raf: {
    schedule: (callback: FrameRequestCallback): number => {
      return requestAnimationFrame(callback)
    },
    
    cancel: (id: number): void => {
      cancelAnimationFrame(id)
    },
    
    throttle: (callback: FrameRequestCallback): FrameRequestCallback => {
      let ticking = false
      
      return (...args) => {
        if (!ticking) {
          ticking = true
          requestAnimationFrame(() => {
            callback(...args)
            ticking = false
          })
        }
      }
    },
  },
  
  // Intersection Observer utilities
  intersectionObserver: {
    create: (
      callback: IntersectionObserverCallback,
      options?: IntersectionObserverInit
    ): IntersectionObserver => {
      return new IntersectionObserver(callback, {
        rootMargin: '50px',
        threshold: 0.1,
        ...options,
      })
    },
    
    observeLazy: (elements: HTMLElement[], callback: (entries: IntersectionObserverEntry[]) => void) => {
      const observer = new IntersectionObserver(callback, {
        rootMargin: '100px',
        threshold: 0.01,
      })
      
      elements.forEach(element => observer.observe(element))
      
      return observer
    },
  },
  
  // Resize Observer utilities
  resizeObserver: {
    create: (callback: ResizeObserverCallback): ResizeObserver => {
      return new ResizeObserver(callback)
    },
    
    observeElement: (element: HTMLElement, callback: ResizeObserverCallback) => {
      const observer = new ResizeObserver(callback)
      observer.observe(element)
      return observer
    },
  },
  
  // Performance monitoring
  monitor: {
    mark: (name: string): void => {
      if (performance.mark) {
        performance.mark(name)
      }
    },
    
    measure: (name: string, startMark: string, endMark?: string): number | undefined => {
      if (performance.measure) {
        performance.measure(name, startMark, endMark)
        const entries = performance.getEntriesByName(name, 'measure')
        return entries[entries.length - 1]?.duration
      }
      return undefined
    },
    
    getMemoryUsage: (): any => {
      if ('memory' in performance) {
        return (performance as any).memory
      }
      return null
    },
    
    getNavigationTiming: (): any => {
      if (performance.timing) {
        const timing = performance.timing
        return {
          dns: timing.domainLookupEnd - timing.domainLookupStart,
          tcp: timing.connectEnd - timing.connectStart,
          request: timing.responseStart - timing.requestStart,
          response: timing.responseEnd - timing.responseStart,
          dom: timing.domContentLoadedEventEnd - timing.domContentLoadedEventStart,
          load: timing.loadEventEnd - timing.loadEventStart,
          total: timing.loadEventEnd - timing.navigationStart,
        }
      }
      return null
    },
  },
  
  // Image optimization
  image: {
    lazyLoad: (img: HTMLImageElement, src: string): void => {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const img = entry.target as HTMLImageElement
              img.src = src
              img.classList.remove('lazy')
              observer.unobserve(img)
            }
          })
        },
        { rootMargin: '50px' }
      )
      
      img.classList.add('lazy')
      observer.observe(img)
    },
    
    preload: (src: string): Promise<HTMLImageElement> => {
      return new Promise((resolve, reject) => {
        const img = new Image()
        img.onload = () => resolve(img)
        img.onerror = reject
        img.src = src
      })
    },
  },
  
  // Bundle optimization
  bundle: {
    loadScript: (src: string, async = true): Promise<void> => {
      return new Promise((resolve, reject) => {
        const script = document.createElement('script')
        script.src = src
        script.async = async
        script.onload = () => resolve()
        script.onerror = reject
        document.head.appendChild(script)
      })
    },
    
    loadStylesheet: (href: string): Promise<void> => {
      return new Promise((resolve, reject) => {
        const link = document.createElement('link')
        link.rel = 'stylesheet'
        link.href = href
        link.onload = () => resolve()
        link.onerror = reject
        document.head.appendChild(link)
      })
    },
  },
  
  // Cache utilities
  cache: {
    create: <T>(maxSize: number = 100): Map<string, { value: T; timestamp: number }> => {
      return new Map()
    },
    
    get: <T>(cache: Map<string, { value: T; timestamp: number }>, key: string, ttl: number = 300000): T | null => {
      const item = cache.get(key)
      if (!item) return null
      
      if (Date.now() - item.timestamp > ttl) {
        cache.delete(key)
        return null
      }
      
      return item.value
    },
    
    set: <T>(cache: Map<string, { value: T; timestamp: number }>, key: string, value: T): void => {
      cache.set(key, { value, timestamp: Date.now() })
    },
    
    clear: <T>(cache: Map<string, { value: T; timestamp: number }>): void => {
      cache.clear()
    },
    
    cleanup: <T>(cache: Map<string, { value: T; timestamp: number }>, ttl: number = 300000): void => {
      const now = Date.now()
      for (const [key, item] of cache.entries()) {
        if (now - item.timestamp > ttl) {
          cache.delete(key)
        }
      }
    },
  },
  
  // Virtual scrolling helpers
  virtualScroll: {
    calculateVisibleRange: (
      scrollTop: number,
      containerHeight: number,
      itemHeight: number,
      totalItems: number,
      overscan: number = 5
    ): { start: number; end: number; offsetY: number } => {
      const start = Math.floor(scrollTop / itemHeight)
      const visibleCount = Math.ceil(containerHeight / itemHeight)
      const end = Math.min(totalItems, start + visibleCount)
      
      return {
        start: Math.max(0, start - overscan),
        end: Math.min(totalItems, end + overscan),
        offsetY: start * itemHeight,
      }
    },
    
    getItemStyle: (index: number, itemHeight: number): React.CSSProperties => {
      return {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: `${itemHeight}px`,
        transform: `translateY(${index * itemHeight}px)`,
      }
    },
  },
  
  // Performance metrics
  metrics: {
    getFPS: (): number => {
      let lastTime = performance.now()
      let frames = 0
      
      const measureFPS = () => {
        frames++
        const currentTime = performance.now()
        
        if (currentTime >= lastTime + 1000) {
          const fps = Math.round((frames * 1000) / (currentTime - lastTime))
          frames = 0
          lastTime = currentTime
          return fps
        }
        
        requestAnimationFrame(measureFPS)
        return 0
      }
      
      return measureFPS()
    },
    
    measureRenderTime: (callback: () => void): number => {
      const start = performance.now()
      callback()
      return performance.now() - start
    },
    
    createPerformanceReport: (): any => {
      const navigation = performanceUtils.monitor.getNavigationTiming()
      const memory = performanceUtils.monitor.getMemoryUsage()
      
      return {
        navigation,
        memory,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight,
        },
      }
    },
  },
}

// Performance hooks utilities
export const createPerformanceHook = () => {
  const metrics = new Map<string, number[]>()
  
  return {
    record: (name: string, value: number) => {
      if (!metrics.has(name)) {
        metrics.set(name, [])
      }
      metrics.get(name)!.push(value)
    },
    
    getAverage: (name: string): number => {
      const values = metrics.get(name) || []
      return values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0
    },
    
    getMax: (name: string): number => {
      const values = metrics.get(name) || []
      return Math.max(...values, 0)
    },
    
    getMin: (name: string): number => {
      const values = metrics.get(name) || []
      return Math.min(...values, Infinity)
    },
    
    getCount: (name: string): number => {
      return metrics.get(name)?.length || 0
    },
    
    clear: (name?: string) => {
      if (name) {
        metrics.delete(name)
      } else {
        metrics.clear()
      }
    },
    
    getAll: () => {
      const result: Record<string, any> = {}
      for (const [name, values] of metrics.entries()) {
        result[name] = {
          count: values.length,
          average: values.reduce((a, b) => a + b, 0) / values.length,
          min: Math.min(...values),
          max: Math.max(...values),
          latest: values[values.length - 1],
        }
      }
      return result
    },
  }
}

export default performanceUtils
