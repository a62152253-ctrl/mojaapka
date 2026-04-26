import { useState, useRef, useCallback } from 'react'
import { GripVertical, ChevronDown, ChevronRight, Plus, X } from 'lucide-react'

interface SplitPane {
  id: string
  type: 'editor' | 'preview' | 'terminal' | 'files'
  title: string
  content: React.ReactNode
  defaultSize?: number
  minSize?: number
  maxSize?: number
  collapsible?: boolean
}

interface CodeSplitterProps {
  panes: SplitPane[]
  direction?: 'horizontal' | 'vertical'
  defaultSizes?: number[]
  onSizeChange?: (sizes: number[]) => void
}

export default function CodeSplitter({ 
  panes, 
  direction = 'horizontal', 
  defaultSizes,
  onSizeChange 
}: CodeSplitterProps) {
  const [sizes, setSizes] = useState<number[]>(defaultSizes || panes.map(() => 100 / panes.length))
  const [collapsedPanes, setCollapsedPanes] = useState<Set<string>>(new Set())
  const [isDragging, setIsDragging] = useState<number | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const handleMouseDown = (index: number) => {
    setIsDragging(index)
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }

  const getContainerDimensions = () => {
    if (!containerRef.current) return { containerSize: 0, containerRect: null }
    
    const containerRect = containerRef.current.getBoundingClientRect()
    const containerSize = direction === 'horizontal' ? containerRect.width : containerRect.height
    
    return { containerSize, containerRect }
  }

  const getMousePosition = (e: MouseEvent, containerRect: DOMRect) => {
    return direction === 'horizontal' ? e.clientX - containerRect.left : e.clientY - containerRect.top
  }

  const calculateNewPaneSize = (mousePos: number, accumulatedSize: number, containerSize: number, paneIndex: number) => {
    const pane = panes[paneIndex]
    const rawSize = Math.max(0, mousePos - accumulatedSize)
    
    return Math.max(
      pane.minSize || 50,
      Math.min(
        pane.maxSize || containerSize,
        rawSize
      )
    )
  }

  const normalizeSizes = (newSizes: number[]) => {
    const total = newSizes.reduce((sum, size, i) => collapsedPanes.has(panes[i].id) ? sum : sum + size, 0)
    
    if (total > 0) {
      for (let i = 0; i < newSizes.length; i++) {
        if (!collapsedPanes.has(panes[i].id)) {
          newSizes[i] = (newSizes[i] / total) * 100
        }
      }
    }
    
    return newSizes
  }

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isDragging === null) return

    const { containerSize, containerRect } = getContainerDimensions()
    if (containerSize === 0 || !containerRect) return

    const mousePos = getMousePosition(e, containerRect)
    const newSizes = [...sizes]
    const totalSize = sizes.reduce((sum, size, i) => collapsedPanes.has(panes[i].id) ? sum : sum + size, 0)
    
    if (totalSize === 0) return

    let accumulatedSize = 0
    for (let i = 0; i <= isDragging; i++) {
      if (!collapsedPanes.has(panes[i].id)) {
        if (i === isDragging) {
          const paneSize = calculateNewPaneSize(mousePos, accumulatedSize, containerSize, i)
          newSizes[i] = (paneSize / containerSize) * 100
          break
        }
        accumulatedSize += (sizes[i] / 100) * containerSize
      }
    }

    const normalizedSizes = normalizeSizes(newSizes)
    setSizes(normalizedSizes)
    onSizeChange?.(normalizedSizes)
  }, [isDragging, sizes, collapsedPanes, panes, direction, onSizeChange])

  const handleMouseUp = useCallback(() => {
    setIsDragging(null)
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseup', handleMouseUp)
  }, [handleMouseMove])

  const toggleCollapse = (paneId: string) => {
    const newCollapsed = new Set(collapsedPanes)
    if (newCollapsed.has(paneId)) {
      newCollapsed.delete(paneId)
    } else {
      newCollapsed.add(paneId)
    }
    setCollapsedPanes(newCollapsed)

    // Redistribute sizes
    const visiblePanes = panes.filter(pane => !newCollapsed.has(pane.id))
    if (visiblePanes.length > 0) {
      const equalSize = 100 / visiblePanes.length
      const newSizes = panes.map(pane => 
        newCollapsed.has(pane.id) ? 0 : equalSize
      )
      setSizes(newSizes)
      onSizeChange?.(newSizes)
    }
  }

  const getPaneStyle = (index: number) => {
    const size = collapsedPanes.has(panes[index].id) ? 0 : sizes[index]
    
    if (direction === 'horizontal') {
      return {
        width: `${size}%`,
        display: size === 0 ? 'none' : 'block'
      }
    } else {
      return {
        height: `${size}%`,
        display: size === 0 ? 'none' : 'block'
      }
    }
  }

  const getSplitterStyle = (index: number) => {
    if (direction === 'horizontal') {
      return {
        width: '4px',
        cursor: 'col-resize',
        left: `${sizes.slice(0, index + 1).reduce((sum, size) => sum + size, 0)}%`
      }
    } else {
      return {
        height: '4px',
        cursor: 'row-resize',
        top: `${sizes.slice(0, index + 1).reduce((sum, size) => sum + size, 0)}%`
      }
    }
  }

  return (
    <div 
      ref={containerRef}
      className={`flex ${direction === 'vertical' ? 'flex-col' : ''} bg-gray-900 relative`}
      style={{ height: '100%' }}
    >
      {panes.map((pane, index) => (
        <div key={pane.id} style={getPaneStyle(index)} className="relative">
          {/* Pane Header */}
          <div className="bg-gray-800 border-b border-gray-700 px-3 py-2 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {pane.collapsible && (
                <button
                  onClick={() => toggleCollapse(pane.id)}
                  className="p-1 text-gray-400 hover:text-white hover:bg-gray-700 rounded"
                >
                  {collapsedPanes.has(pane.id) ? (
                    <ChevronRight className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </button>
              )}
              <span className="text-white text-sm font-medium">{pane.title}</span>
            </div>
            
            <div className="flex items-center space-x-1">
              {/* Additional pane actions can be added here */}
              {pane.type === 'editor' && (
                <button className="p-1 text-gray-400 hover:text-white hover:bg-gray-700 rounded">
                  <Plus className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
          
          {/* Pane Content */}
          <div className="flex-1 overflow-hidden">
            {pane.content}
          </div>
        </div>
      ))}
      
      {/* Splitters */}
      {panes.slice(0, -1).map((_, index) => (
        <div
          key={`splitter-${index}`}
          className="absolute bg-gray-700 hover:bg-blue-600 transition-colors z-10"
          style={getSplitterStyle(index)}
          onMouseDown={() => handleMouseDown(index)}
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <GripVertical className="w-3 h-3 text-gray-400" />
          </div>
        </div>
      ))}
    </div>
  )
}
