import { useState, useEffect } from 'react'
import { Play, Pause, RefreshCw, Maximize2, ExternalLink } from 'lucide-react'
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
</head>
<body>
  <h1>${project.title}</h1>
  <p>${project.description}</p>
  ${jsFile ? `<script>\n${jsFile.content}\n</script>` : ''}
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

  useEffect(() => {
    generatePreview()
    
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
      }
    }
  }, [project])

  return (
    <div className={`bg-gray-800 rounded-lg overflow-hidden ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
      {showControls && (
        <div className="flex items-center justify-between p-4 bg-gray-900 border-b border-gray-700">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              Live Preview
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={refreshPreview}
              disabled={isLoading}
              className="p-2 text-gray-400 hover:text-white transition-colors disabled:opacity-50"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
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
      )}

      <div className={`relative bg-white ${isFullscreen ? 'h-full' : ''}`} style={{ height: isFullscreen ? '100%' : height }}>
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
          <iframe
            src={previewUrl}
            className="w-full h-full border-0"
            title="Live Preview"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
          />
        )}
      </div>
    </div>
  )
}
