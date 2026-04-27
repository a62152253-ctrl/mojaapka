import { useState, useEffect, useCallback, useRef } from 'react'
import { 
  Play, 
  Pause, 
  RefreshCw, 
  Maximize2, 
  ExternalLink, 
  Monitor, 
  Smartphone, 
  Tablet, 
  Settings, 
  Eye, 
  EyeOff, 
  Copy, 
  Download,
  Code,
  Layout,
  Zap,
  Globe,
  Moon,
  Sun
} from 'lucide-react'
import { Project } from '../types/index'

interface LivePreviewProps {
  project: Project
  files?: Array<{ name: string; content: string; language: string }>
  height?: string
  showControls?: boolean
}

export default function LivePreview({ 
  project, 
  files, 
  height = '600px', 
  showControls = true 
}: LivePreviewProps) {
  const [previewUrl, setPreviewUrl] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string>('')
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [deviceMode, setDeviceMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop')
  const [showSettings, setShowSettings] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [showConsole, setShowConsole] = useState(false)
  const [consoleLogs, setConsoleLogs] = useState<Array<{type: 'log' | 'error' | 'warn', message: string, timestamp: number}>>([])
  const [zoom, setZoom] = useState(100)
  const [isLiveMode, setIsLiveMode] = useState(false)
  const [refreshInterval, setRefreshInterval] = useState(2000)
  
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const refreshTimerRef = useRef<NodeJS.Timeout | null>(null)

  const generatePreview = async () => {
    setIsLoading(true)
    setError('')

    try {
      let htmlContent = ''

      if (files && files.length > 0) {
        // Use provided files
        const htmlFile = files.find(f => f.name.endsWith('.html'))
        if (htmlFile) {
          htmlContent = htmlFile.content
        } else {
          // Create HTML wrapper for CSS/JS files
          const cssFile = files.find(f => f.name.endsWith('.css'))
          const jsFile = files.find(f => f.name.endsWith('.js'))
          
          htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${project.title}</title>
  ${cssFile ? `<style>\n${cssFile.content}\n</style>` : ''}
  <style>
    ${isDarkMode ? `
      body { background: #1a1a1a; color: #ffffff; }
      .preview-notice { background: #2d2d2d; color: #ffffff; border: 1px solid #444; }
    ` : ''}
    .preview-controls {
      position: fixed;
      top: 10px;
      right: 10px;
      background: rgba(0,0,0,0.8);
      color: white;
      padding: 8px;
      border-radius: 8px;
      font-size: 12px;
      z-index: 1000;
    }
  </style>
</head>
<body>
  <div class="preview-controls">
    DevBloxi Preview • ${deviceMode}
  </div>
  <h1>${project.title}</h1>
  <p>${project.description}</p>
  ${jsFile ? `<script>\n${jsFile.content}\n</script>` : ''}
  <script>
    // Console capture for preview
    const originalLog = console.log;
    const originalError = console.error;
    const originalWarn = console.warn;
    
    console.log = function(...args) {
      originalLog.apply(console, args);
      window.parent.postMessage({
        type: 'console',
        level: 'log',
        message: args.join(' ')
      }, '*');
    };
    
    console.error = function(...args) {
      originalError.apply(console, args);
      window.parent.postMessage({
        type: 'console',
        level: 'error',
        message: args.join(' ')
      }, '*');
    };
    
    console.warn = function(...args) {
      originalWarn.apply(console, args);
      window.parent.postMessage({
        type: 'console',
        level: 'warn',
        message: args.join(' ')
      }, '*');
    };
  </script>
</body>
</html>`
        }
      } else if (project.demoUrl) {
        // Use external demo URL
        setPreviewUrl(project.demoUrl)
        setIsLoading(false)
        return
      } else {
        // Generate demo from project data
        htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${project.title}</title>
  <style>
    body {
      font-family: 'Inter', sans-serif;
      max-width: 800px;
      margin: 0 auto;
      padding: 2rem;
      line-height: 1.6;
      color: #333;
    }
    .header {
      text-align: center;
      margin-bottom: 2rem;
    }
    .title {
      font-size: 2.5rem;
      font-weight: 700;
      color: #1e40af;
      margin-bottom: 0.5rem;
    }
    .description {
      font-size: 1.125rem;
      color: #64748b;
    }
    .tags {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
      margin: 1rem 0;
    }
    .tag {
      background: #3b82f6;
      color: white;
      padding: 0.25rem 0.75rem;
      border-radius: 9999px;
      font-size: 0.875rem;
    }
    .price {
      font-size: 2rem;
      font-weight: 700;
      color: #10b981;
      text-align: center;
      margin: 2rem 0;
    }
    .author {
      text-align: center;
      color: #64748b;
    }
    .demo-notice {
      background: #fef3c7;
      border: 1px solid #f59e0b;
      border-radius: 0.5rem;
      padding: 1rem;
      margin: 2rem 0;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1 class="title">${project.title}</h1>
    <p class="description">${project.description}</p>
    <div class="tags">
      ${project.tags.map(tag => `<span class="tag">#${tag}</span>`).join('')}
    </div>
  </div>
  
  <div class="price">$${project.price}</div>
  
  <div class="demo-notice">
    🚀 This is a demo preview. Purchase to get full source code and files.
  </div>
  
  <div class="author">
    Created by <strong>@${project.author.username}</strong>
  </div>
</body>
</html>`
      }

      // Create blob URL
      const blob = new Blob([htmlContent], { type: 'text/html' })
      const url = URL.createObjectURL(blob)
      setPreviewUrl(url)

    } catch (err) {
      setError('Failed to generate preview')
      console.error('Preview error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const refreshPreview = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
    }
    generatePreview()
  }

  const openInNewTab = () => {
    if (previewUrl) {
      window.open(previewUrl, '_blank')
    }
  }

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }

  const toggleLiveMode = () => {
    setIsLiveMode(!isLiveMode)
  }

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode)
  }

  const toggleAutoRefresh = () => {
    setAutoRefresh(!autoRefresh)
  }

  const toggleConsole = () => {
    setShowConsole(!showConsole)
  }

  const clearConsole = () => {
    setConsoleLogs([])
  }

  const copyPreviewCode = () => {
    const htmlFile = files?.find(f => f.name.endsWith('.html'))
    if (htmlFile) {
      navigator.clipboard.writeText(htmlFile.content)
    }
  }

  const downloadPreview = () => {
    const htmlFile = files?.find(f => f.name.endsWith('.html'))
    if (htmlFile) {
      const blob = new Blob([htmlFile.content], { type: 'text/html' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = htmlFile.name
      a.click()
      URL.revokeObjectURL(url)
    }
  }

  const getDeviceStyles = () => {
    switch (deviceMode) {
      case 'mobile':
        return { 
          width: '375px', 
          height: '667px',
          margin: '0 auto',
          border: '12px solid #1a1a1a',
          borderRadius: '36px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
        }
      case 'tablet':
        return { 
          width: '768px', 
          height: '1024px',
          margin: '0 auto',
          border: '8px solid #1a1a1a',
          borderRadius: '24px',
          boxShadow: '0 15px 40px rgba(0,0,0,0.2)'
        }
      default:
        return { width: '100%', height: '100%' }
    }
  }

  const handleConsoleMessage = useCallback((event: MessageEvent) => {
    if (event.data.type === 'console') {
      setConsoleLogs(prev => [...prev, {
        type: event.data.level,
        message: event.data.message,
        timestamp: Date.now()
      }])
    }
  }, [])

  useEffect(() => {
    window.addEventListener('message', handleConsoleMessage)
    
    // Handle custom events from LiveWorkspace
    const handleRefreshPreview = () => {
      refreshPreview()
    }
    
    const handleToggleLiveMode = () => {
      toggleLiveMode()
    }
    
    const handleToggleDarkMode = () => {
      toggleDarkMode()
    }
    
    window.addEventListener('refreshPreview', handleRefreshPreview)
    window.addEventListener('toggleLiveMode', handleToggleLiveMode)
    window.addEventListener('toggleDarkMode', handleToggleDarkMode)
    
    return () => {
      window.removeEventListener('message', handleConsoleMessage)
      window.removeEventListener('refreshPreview', handleRefreshPreview)
      window.removeEventListener('toggleLiveMode', handleToggleLiveMode)
      window.removeEventListener('toggleDarkMode', handleToggleDarkMode)
    }
  }, [handleConsoleMessage])

  useEffect(() => {
    if (autoRefresh && isLiveMode) {
      refreshTimerRef.current = setInterval(() => {
        refreshPreview()
      }, refreshInterval)
    } else {
      if (refreshTimerRef.current) {
        clearInterval(refreshTimerRef.current)
        refreshTimerRef.current = null
      }
    }

    return () => {
      if (refreshTimerRef.current) {
        clearInterval(refreshTimerRef.current)
      }
    }
  }, [autoRefresh, isLiveMode, refreshInterval])

  useEffect(() => {
    generatePreview()
    
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
      }
    }
  }, [project, isDarkMode, deviceMode])

  return (
    <div className={`bg-gray-800 rounded-lg overflow-hidden ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
      {showControls && (
        <div className="bg-gray-900 border-b border-gray-700">
          {/* Main Controls */}
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <div className={`w-2 h-2 rounded-full ${isLiveMode ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`}></div>
                {isLiveMode ? 'Live Preview' : 'Static Preview'}
              </div>
              
              {/* Device Mode Selector */}
              <div className="flex items-center gap-1 bg-gray-800 rounded-lg p-1">
                <button
                  onClick={() => setDeviceMode('desktop')}
                  className={`p-2 rounded transition-colors ${
                    deviceMode === 'desktop' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
                  }`}
                  title="Desktop"
                >
                  <Monitor className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setDeviceMode('tablet')}
                  className={`p-2 rounded transition-colors ${
                    deviceMode === 'tablet' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
                  }`}
                  title="Tablet"
                >
                  <Tablet className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setDeviceMode('mobile')}
                  className={`p-2 rounded transition-colors ${
                    deviceMode === 'mobile' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
                  }`}
                  title="Mobile"
                >
                  <Smartphone className="w-4 h-4" />
                </button>
              </div>

              {/* Zoom Control */}
              <div className="flex items-center gap-2 text-gray-400">
                <button
                  onClick={() => setZoom(Math.max(25, zoom - 25))}
                  className="p-1 hover:text-white"
                >
                  <span className="text-xs">−</span>
                </button>
                <span className="text-xs font-medium">{zoom}%</span>
                <button
                  onClick={() => setZoom(Math.min(200, zoom + 25))}
                  className="p-1 hover:text-white"
                >
                  <span className="text-xs">+</span>
                </button>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={toggleLiveMode}
                className={`p-2 transition-colors ${
                  isLiveMode ? 'text-green-500' : 'text-gray-400 hover:text-white'
                }`}
                title="Toggle Live Mode"
              >
                <Zap className="w-4 h-4" />
              </button>
              
              <button
                onClick={toggleAutoRefresh}
                className={`p-2 transition-colors ${
                  autoRefresh ? 'text-blue-500' : 'text-gray-400 hover:text-white'
                }`}
                title="Toggle Auto Refresh"
              >
                <RefreshCw className={`w-4 h-4 ${autoRefresh ? 'animate-spin' : ''}`} />
              </button>
              
              <button
                onClick={toggleDarkMode}
                className={`p-2 transition-colors ${
                  isDarkMode ? 'text-yellow-500' : 'text-gray-400 hover:text-white'
                }`}
                title="Toggle Dark Mode"
              >
                {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
              
              <button
                onClick={toggleConsole}
                className={`p-2 transition-colors ${
                  showConsole ? 'text-purple-500' : 'text-gray-400 hover:text-white'
                }`}
                title="Toggle Console"
              >
                <Code className="w-4 h-4" />
              </button>
              
              <button
                onClick={copyPreviewCode}
                className="p-2 text-gray-400 hover:text-white transition-colors"
                title="Copy Code"
              >
                <Copy className="w-4 h-4" />
              </button>
              
              <button
                onClick={downloadPreview}
                className="p-2 text-gray-400 hover:text-white transition-colors"
                title="Download Preview"
              >
                <Download className="w-4 h-4" />
              </button>
              
              <button
                onClick={openInNewTab}
                disabled={!previewUrl}
                className="p-2 text-gray-400 hover:text-white transition-colors disabled:opacity-50"
                title="Open in new tab"
              >
                <ExternalLink className="w-4 h-4" />
              </button>
              
              <button
                onClick={toggleFullscreen}
                className="p-2 text-gray-400 hover:text-white transition-colors"
                title="Toggle fullscreen"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Status Bar */}
          <div className="px-4 pb-2 flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center gap-4">
              <span>{deviceMode.charAt(0).toUpperCase() + deviceMode.slice(1)} View</span>
              {isLiveMode && (
                <span className="text-green-500">
                  Auto-refresh every {refreshInterval / 1000}s
                </span>
              )}
            </div>
            <div className="flex items-center gap-4">
              <span>{files?.length || 0} files</span>
              <span>Zoom: {zoom}%</span>
            </div>
          </div>
        </div>
      )}

      <div className={`relative ${isDarkMode ? 'bg-gray-900' : 'bg-white'} ${isFullscreen ? 'h-full' : ''}`} style={{ height: isFullscreen ? '100%' : height }}>
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p className="text-gray-600 text-sm">Generating preview...</p>
            </div>
          </div>
        )}
        
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <div className="text-center">
              <p className="text-red-600 mb-2">{error}</p>
              <button
                onClick={refreshPreview}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                Try Again
              </button>
            </div>
          </div>
        )}
        
        {previewUrl && !isLoading && !error && (
          <div className="h-full overflow-auto bg-gray-50 p-4">
            <div className="flex justify-center">
              <div 
                style={{ 
                  ...getDeviceStyles(),
                  transform: `scale(${zoom / 100})`,
                  transformOrigin: 'top center',
                  transition: 'transform 0.2s ease'
                }}
              >
                <iframe
                  ref={iframeRef}
                  src={previewUrl}
                  className="w-full h-full border-0 bg-white"
                  title="Live Preview"
                  sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                />
              </div>
            </div>
          </div>
        )}

        {/* Console Panel */}
        {showConsole && (
          <div className="absolute bottom-0 left-0 right-0 h-48 bg-gray-900 border-t border-gray-700">
            <div className="flex items-center justify-between p-2 border-b border-gray-700">
              <div className="flex items-center gap-2">
                <Code className="w-4 h-4 text-purple-400" />
                <span className="text-white text-sm font-medium">Console</span>
                <span className="text-gray-400 text-xs">({consoleLogs.length} messages)</span>
              </div>
              <button
                onClick={clearConsole}
                className="text-gray-400 hover:text-white text-xs"
              >
                Clear
              </button>
            </div>
            <div className="p-2 overflow-y-auto h-full font-mono text-xs">
              {consoleLogs.length === 0 ? (
                <div className="text-gray-500">Console output will appear here...</div>
              ) : (
                consoleLogs.map((log, index) => (
                  <div key={index} className={`mb-1 ${
                    log.type === 'error' ? 'text-red-400' : 
                    log.type === 'warn' ? 'text-yellow-400' : 
                    'text-green-400'
                  }`}>
                    <span className="text-gray-500">
                      [{new Date(log.timestamp).toLocaleTimeString()}]
                    </span>
                    {' '}
                    {log.message}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
