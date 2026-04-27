import { useState, useEffect, useRef } from 'react'
import { Play, Save, FolderOpen, Settings, Terminal, Eye, GitBranch, Users, Share2, Zap, Video, MessageSquare, Mic, MicOff, VideoOff, Monitor, Smartphone, Tablet, Code, FileText, Image, Music, Download, Upload, RefreshCw, Copy, Check, X, ChevronDown, Plus, Minus, Maximize2, Volume2, VolumeX, Briefcase, Moon, Sun, Palette, ExternalLink, Edit, Trash2, Layout, Layers, PictureInPicture, Bot, Sparkles, BookOpen } from 'lucide-react'
import Editor from '@monaco-editor/react'
import { useNavigate } from 'react-router-dom'
import FileUploader from '../components/workspace/FileUploader'
import FileShareManager from '../components/workspace/FileShareManager'
import MoreDropdown, { createWorkspaceDropdownItems, createPreviewDropdownItems } from '../components/ui/MoreDropdown'
import { WorkspaceWebSocket, createWorkspaceConnection } from '../utils/workspaceWebSocket'

// Import React hooks for the demo code
import React from 'react'

export default function LiveWorkspace() {
  const navigate = useNavigate()
  
  // Project data from create project form
  const [projectData, setProjectData] = useState({
    title: '',
    description: '',
    category: '',
    tags: [] as string[],
    price: 0
  })
  
  // Check if there's a template code in sessionStorage
  const [activeFile, setActiveFile] = useState(() => {
    const templateName = sessionStorage.getItem('templateName')
    return templateName ? `${templateName}.js` : 'index.js'
  })
  
  const [code, setCode] = useState(() => {
    const templateCode = sessionStorage.getItem('workspaceTemplate')
    if (templateCode) {
      // Clear sessionStorage after loading
      sessionStorage.removeItem('workspaceTemplate')
      sessionStorage.removeItem('templateName')
      return templateCode
    }
    
    return `// Live Workspace - Real-time Collaboration
// Start coding and see changes instantly

import React from 'react';
import ReactDOM from 'react-dom/client';

function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Live Workspace
        </h1>
        <p className="text-gray-600 mb-8">
          Real-time collaborative coding environment
        </p>
        
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-semibold mb-4">Interactive Demo</h2>
          <p className="text-gray-600 mb-4">
            Current count: <span className="font-bold text-blue-600">{count}</span>
          </p>
          <button
            onClick={() => setCount(count + 1)}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Increment Count
          </button>
        </div>
      </div>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);`
  })

  // Load project data from sessionStorage
  useEffect(() => {
    const title = sessionStorage.getItem('projectTitle')
    const description = sessionStorage.getItem('projectDescription')
    const category = sessionStorage.getItem('projectCategory')
    const tags = sessionStorage.getItem('projectTags')
    const price = sessionStorage.getItem('projectPrice')
    
    if (title || description || category) {
      setProjectData({
        title: title || '',
        description: description || '',
        category: category || '',
        tags: tags ? JSON.parse(tags) : [],
        price: price ? parseInt(price) : 0
      })
      
      // Clear sessionStorage after loading
      sessionStorage.removeItem('projectTitle')
      sessionStorage.removeItem('projectDescription')
      sessionStorage.removeItem('projectCategory')
      sessionStorage.removeItem('projectTags')
      sessionStorage.removeItem('projectPrice')
    }
  }, [])
  
  const [isPreviewMode, setIsPreviewMode] = useState(false)
  const [isTerminalOpen, setIsTerminalOpen] = useState(false)
  const [activeCollaborators, setActiveCollaborators] = useState(2)
  const [isVideoCallActive, setIsVideoCallActive] = useState(false)
  const [isAudioEnabled, setIsAudioEnabled] = useState(true)
  const [isVideoEnabled, setIsVideoEnabled] = useState(true)
  const [screenShareActive, setScreenShareActive] = useState(false)
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop')
  const [fontSize, setFontSize] = useState(14)
  const [wordWrap, setWordWrap] = useState(true)
  const [showMinimap, setShowMinimap] = useState(true)
  const [autoSave, setAutoSave] = useState(true)
  const [liveCompile, setLiveCompile] = useState(true)
  const [showChat, setShowChat] = useState(false)
  const [isLiveMode, setIsLiveMode] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [showConsole, setShowConsole] = useState(false)
  const [consoleLogs, setConsoleLogs] = useState<Array<{type: 'log' | 'error' | 'warn', message: string, timestamp: number}>>([])
  const [zoom, setZoom] = useState(100)
  const [previewUrl, setPreviewUrl] = useState('')
  const [chatMessages, setChatMessages] = useState([
    { id: '1', sender: 'Sarah', message: 'Great work on the component!', timestamp: '2:30 PM', isMe: false },
    { id: '2', sender: 'You', message: 'Thanks! Just added the new features', timestamp: '2:32 PM', isMe: true },
    { id: '3', sender: 'Mike', message: 'Can we review the PR together?', timestamp: '2:35 PM', isMe: false }
  ])
  const [newMessage, setNewMessage] = useState('')
  const [showParticipants, setShowParticipants] = useState(false)
  const [connectionQuality, setConnectionQuality] = useState('excellent')
  
  // WebSocket state
  const [wsConnection, setWsConnection] = useState<WorkspaceWebSocket | null>(null)
  const [realTimeCollaborators, setRealTimeCollaborators] = useState<any[]>([])
  const [isWebSocketConnected, setIsWebSocketConnected] = useState(false)
  const [workspaceId] = useState(() => `workspace-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`)
  
  // File management state
  const [workspaceFiles, setWorkspaceFiles] = useState([
    { name: 'index.js', type: 'javascript', size: '2.4KB', content: code },
    { name: 'App.css', type: 'css', size: '1.2KB', content: 'body { margin: 0; padding: 20px; font-family: Arial; }' },
    { name: 'package.json', type: 'json', size: '0.8KB', content: '{\n  "name": "workspace",\n  "version": "1.0.0"\n}' },
    { name: 'README.md', type: 'markdown', size: '3.1KB', content: '# Live Workspace\n\nReal-time collaborative coding environment.' }
  ])
  const [showFileUploader, setShowFileUploader] = useState(false)
  const [showShareManager, setShowShareManager] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [showNewFileDialog, setShowNewFileDialog] = useState(false)
  const [newFileName, setNewFileName] = useState('')
  const [newFileType, setNewFileType] = useState('javascript')
  const [renamingFile, setRenamingFile] = useState<string | null>(null)
  const [renameValue, setRenameValue] = useState('')
  
  // Split screen state
  const [isSplitScreen, setIsSplitScreen] = useState(false)
  const [splitDirection, setSplitDirection] = useState<'horizontal' | 'vertical'>('vertical')
  const [activeFile2, setActiveFile2] = useState('App.css')
  const [code2, setCode2] = useState('body { margin: 0; padding: 20px; font-family: Arial; }')
  
  // Picture-in-Picture state
  const [isPiPMode, setIsPiPMode] = useState(false)
  const [pipPosition, setPipPosition] = useState({ x: 20, y: 20 })
  const [pipSize, setPipSize] = useState({ width: 400, height: 300 })
  const [isDraggingPiP, setIsDraggingPiP] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  
  // AI Assistant state
  const [isAIAssistantOpen, setIsAIAssistantOpen] = useState(false)
  const [aiMessages, setAiMessages] = useState([
    { id: 1, sender: 'AI', message: 'Hello! I\'m your coding assistant. How can I help you today?', isAI: true }
  ])
  const [aiInput, setAiInput] = useState('')
  const [isAIProcessing, setIsAIProcessing] = useState(false)
  
  // Smart Templates state
  const [isTemplatesOpen, setIsTemplatesOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [templateSearch, setTemplateSearch] = useState('')
  
  const editorRef = useRef<any>(null)
  const editorRef2 = useRef<any>(null)

  // Handle console messages from iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'console') {
        setConsoleLogs(prev => [...prev, {
          type: event.data.level,
          message: event.data.message,
          timestamp: Date.now()
        }])
      }
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [])

  // Initialize WebSocket connection
  useEffect(() => {
    const userId = `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const ws = createWorkspaceConnection(workspaceId, userId)
    
    ws.connect().then(() => {
      console.log('WebSocket connected to workspace:', workspaceId)
      ws.joinWorkspace()
    }).catch(console.error)

    // Set up event listeners
    ws.onConnectionChange((connected) => {
      setIsWebSocketConnected(connected)
      setConnectionQuality(connected ? 'excellent' : 'poor')
    })

    ws.onCollaboratorJoin((collaborator) => {
      setRealTimeCollaborators(prev => {
        const exists = prev.find(c => c.id === collaborator.id)
        if (!exists) {
          return [...prev, collaborator]
        }
        return prev
      })
    })

    ws.onCollaboratorLeave((userId) => {
      setRealTimeCollaborators(prev => prev.filter(c => c.id !== userId))
    })

    ws.onCursorUpdate((cursor) => {
      // Update cursor positions in real-time
      console.log('Cursor update:', cursor)
    })

    ws.onChatMessage((message) => {
      setChatMessages(prev => [...prev, {
        id: message.id,
        sender: message.username,
        message: message.message,
        timestamp: new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isMe: false
      }])
    })

    setWsConnection(ws)

    return () => {
      ws.disconnect()
    }
  }, [workspaceId])

  // Split screen functions
  const toggleSplitScreen = () => {
    setIsSplitScreen(!isSplitScreen)
    if (!isSplitScreen) {
      // Initialize second editor with current file
      setActiveFile2(activeFile)
      setCode2(code)
    }
  }

  const toggleSplitDirection = () => {
    setSplitDirection(prev => prev === 'vertical' ? 'horizontal' : 'vertical')
  }

  const handleFileSelect2 = (file: any) => {
    setActiveFile2(file.name)
    setCode2(file.content)
  }

  // Picture-in-Picture functions
  const togglePiPMode = () => {
    setIsPiPMode(!isPiPMode)
  }

  const handlePiPMouseDown = (e: React.MouseEvent) => {
    setIsDraggingPiP(true)
    setDragOffset({
      x: e.clientX - pipPosition.x,
      y: e.clientY - pipPosition.y
    })
  }

  const handlePiPMouseMove = (e: React.MouseEvent) => {
    if (isDraggingPiP) {
      setPipPosition({
        x: e.clientX - dragOffset.x,
        y: e.clientY - dragOffset.y
      })
    }
  }

  const handlePiPMouseUp = () => {
    setIsDraggingPiP(false)
  }

  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (isDraggingPiP) {
        setPipPosition({
          x: e.clientX - dragOffset.x,
          y: e.clientY - dragOffset.y
        })
      }
    }

    const handleGlobalMouseUp = () => {
      setIsDraggingPiP(false)
    }

    if (isDraggingPiP) {
      document.addEventListener('mousemove', handleGlobalMouseMove)
      document.addEventListener('mouseup', handleGlobalMouseUp)
    }

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove)
      document.removeEventListener('mouseup', handleGlobalMouseUp)
    }
  }, [isDraggingPiP, dragOffset])

  // Send file updates via WebSocket
  useEffect(() => {
    if (wsConnection && isWebSocketConnected) {
      wsConnection.sendFileUpdate(activeFile, code)
      if (isSplitScreen) {
        wsConnection.sendFileUpdate(activeFile2, code2)
      }
    }
  }, [code, activeFile, code2, activeFile2, wsConnection, isWebSocketConnected, isSplitScreen])

  // Auto-refresh in live mode
  useEffect(() => {
    if (isLiveMode && isPreviewMode) {
      const interval = setInterval(() => {
        generatePreview()
      }, 2000)
      return () => clearInterval(interval)
    }
  }, [isLiveMode, isPreviewMode, code])

  const files = [
    { name: 'index.js', type: 'javascript', size: '2.4KB' },
    { name: 'App.css', type: 'css', size: '1.2KB' },
    { name: 'package.json', type: 'json', size: '0.8KB' },
    { name: 'README.md', type: 'markdown', size: '3.1KB' }
  ]

  const collaborators = [
    { 
      name: 'You', 
      status: 'active', 
      color: 'bg-blue-500',
      role: 'owner',
      cursor: { line: 15, column: 25 },
      isSpeaking: false,
      isVideoOn: true
    },
    { 
      name: 'Sarah', 
      status: 'active', 
      color: 'bg-green-500',
      role: 'editor',
      cursor: { line: 8, column: 12 },
      isSpeaking: false,
      isVideoOn: true
    },
    { 
      name: 'Mike', 
      status: 'idle', 
      color: 'bg-yellow-500',
      role: 'viewer',
      cursor: null,
      isSpeaking: true,
      isVideoOn: false
    },
    { 
      name: 'Alex', 
      status: 'active', 
      color: 'bg-purple-500',
      role: 'editor',
      cursor: { line: 22, column: 8 },
      isSpeaking: false,
      isVideoOn: true
    }
  ]
  
  // Toast notification helper
  const showToast = (message: string, type: 'success' | 'error' | 'warning' = 'success') => {
    const toast = document.createElement('div')
    const bgColor = type === 'success' ? 'bg-green-600' : type === 'error' ? 'bg-red-600' : 'bg-yellow-600'
    toast.className = `fixed top-4 right-4 ${bgColor} text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-pulse`
    toast.textContent = message
    document.body.appendChild(toast)
    setTimeout(() => toast.remove(), 3000)
  }

  const handleSendMessage = () => {
    if (newMessage.trim() && wsConnection) {
      const message = {
        id: Date.now().toString(),
        sender: 'You',
        message: newMessage,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isMe: true
      }
      
      // Send via WebSocket
      wsConnection.sendChatMessage(newMessage, 'You')
      
      // Add to local state
      setChatMessages([...chatMessages, message])
      setNewMessage('')
    }
  }
  
  const toggleVideoCall = () => {
    setIsVideoCallActive(!isVideoCallActive)
  }
  
  const toggleScreenShare = () => {
    setScreenShareActive(!screenShareActive)
  }
  
  const getConnectionQualityColor = (quality: string) => {
    switch (quality) {
      case 'excellent': return 'text-green-500'
      case 'good': return 'text-yellow-500'
      case 'poor': return 'text-red-500'
      default: return 'text-gray-500'
    }
  }
  
  const getDeviceIcon = (device: string) => {
    switch (device) {
      case 'desktop': return <Monitor className="w-4 h-4" />
      case 'tablet': return <Tablet className="w-4 h-4" />
      case 'mobile': return <Smartphone className="w-4 h-4" />
      default: return <Monitor className="w-4 h-4" />
    }
  }

  const handleRun = () => {
    generatePreview()
    setIsPreviewMode(true)
    // Auto-refresh preview after generation
    setTimeout(() => {
      if (previewUrl) {
        const iframe = document.querySelector('iframe[title="Live Preview"]') as HTMLIFrameElement
        if (iframe) {
          iframe.src = previewUrl
        }
      }
    }, 100)
  }
  
  const generatePreview = () => {
    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${projectData.title || 'Live Workspace'}</title>
  <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
  <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  <style>
    ${isDarkMode ? `
      body { background: #1a1a1a; color: #ffffff; }
      .preview-notice { background: #2d2d2d; color: #ffffff; border: 1px solid #444; }
    ` : ''}
    body {
      font-family: 'Inter', system-ui, sans-serif;
      margin: 0;
      padding: 20px;
      min-height: 100vh;
    }
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
    DevBloxi Preview • ${previewDevice}
  </div>
  <div id="root"></div>
  <script>
    // Console capture
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
  <script type="text/babel">
    ${code}
  </script>
</body>
</html>`

    const blob = new Blob([htmlContent], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    
    // Clean up previous URL to prevent memory leaks
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
    }
    
    setPreviewUrl(url)
    
    // Force iframe reload if already in preview mode
    if (isPreviewMode) {
      setTimeout(() => {
        const iframe = document.querySelector('iframe[title="Live Preview"]') as HTMLIFrameElement
        if (iframe) {
          iframe.src = url
        }
      }, 100)
    }
  }

  const handleUploadAllProjects = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.webkitdirectory = true
    input.multiple = true
    input.onchange = (e) => {
      const files = (e.target as HTMLInputElement).files
      if (files && files.length > 0) {
        processAllProjects(files)
      }
    }
    input.click()
  }

  const processAllProjects = async (files: FileList) => {
    setIsUploading(true)
    try {
      const uploadedFiles: any[] = []
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const content = await readFileAsText(file)
        uploadedFiles.push({
          name: file.name,
          type: getLanguageFromExtension(file.name),
          size: `${(file.size / 1024).toFixed(1)}KB`,
          content
        })
      }
      
      setWorkspaceFiles(prev => [...prev, ...uploadedFiles])
      
      // Notify collaborators via WebSocket
      if (wsConnection && isWebSocketConnected) {
        wsConnection.sendMessage({
          type: 'file_update',
          workspaceId,
          userId: wsConnection.getUserId(),
          timestamp: Date.now(),
          data: { 
            action: 'files_uploaded',
            files: uploadedFiles.map(f => ({ name: f.name, size: f.size }))
          }
        })
      }
      
      // Show success message
      console.log(`Successfully imported ${uploadedFiles.length} files`)
      
      // Show success notification
      showToast(`Successfully uploaded ${uploadedFiles.length} files!`, 'success')
    } catch (error) {
      console.error('Error importing projects:', error)
      showToast('Error uploading files', 'error')
    } finally {
      setIsUploading(false)
    }
  }

  const readFileAsText = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => resolve(e.target?.result as string)
      reader.onerror = () => reject(new Error(`Failed to read file: ${file.name}`))
      reader.readAsText(file)
    })
  }

  const getLanguageFromExtension = (filename: string): string => {
    const ext = filename.split('.').pop()?.toLowerCase()
    switch (ext) {
      case 'html': return 'html'
      case 'css': return 'css'
      case 'js': return 'javascript'
      case 'jsx': return 'javascript'
      case 'ts': return 'typescript'
      case 'tsx': return 'typescript'
      case 'json': return 'json'
      case 'md': return 'markdown'
      case 'xml': return 'xml'
      case 'svg': return 'xml'
      default: return 'plaintext'
    }
  }

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code)
    // Show success feedback
  }
  
  const handleDownloadCode = () => {
    const blob = new Blob([code], { type: 'text/javascript' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = activeFile
    a.click()
    URL.revokeObjectURL(url)
  }
  
  const handleUploadCode = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.js,.jsx,.ts,.tsx,.html,.css,.json'
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (e) => {
          setCode(e.target?.result as string)
          setActiveFile(file.name)
        }
        reader.readAsText(file)
      }
    }
    input.click()
  }

  const toggleLiveMode = () => {
    setIsLiveMode(!isLiveMode)
  }

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode)
    generatePreview()
  }

  const toggleConsole = () => {
    setShowConsole(!showConsole)
  }

  const clearConsole = () => {
    setConsoleLogs([])
  }

  const getDeviceStyles = () => {
    switch (previewDevice) {
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

  const handleFilesUploaded = (uploadedFiles: any[]) => {
    const newFiles = uploadedFiles.map((file, index) => ({
      name: file.name,
      type: file.language,
      size: `${(file.content.length / 1024).toFixed(1)}KB`,
      content: file.content
    }))

    setWorkspaceFiles(prev => [...prev, ...newFiles])
    setShowFileUploader(false)

    // Notify collaborators via WebSocket
    if (wsConnection && isWebSocketConnected) {
      wsConnection.sendMessage({
        type: 'file_update',
        workspaceId,
        userId: wsConnection.getUserId(),
        timestamp: Date.now(),
        data: { 
          action: 'files_uploaded',
          files: newFiles.map(f => ({ name: f.name, size: f.size }))
        }
      })
    }

    // Show success notification
    showToast(`Successfully uploaded ${uploadedFiles.length} files!`, 'success')
  }

  const handleShare = (settings: any) => {
    console.log('Share settings:', settings)
    // Share workspace via WebSocket
    if (wsConnection && isWebSocketConnected) {
      wsConnection.sendMessage({
        type: 'file_update',
        workspaceId,
        userId: wsConnection.getUserId(),
        timestamp: Date.now(),
        data: { 
          action: 'workspace_shared',
          settings,
          workspaceName: projectData.title || 'Live Workspace'
        }
      })
    }
  }

  const handleExport = (format: 'zip' | 'github' | 'individual') => {
    console.log('Export format:', format)
    // Track export action
    if (wsConnection && isWebSocketConnected) {
      wsConnection.sendMessage({
        type: 'file_update',
        workspaceId,
        userId: wsConnection.getUserId(),
        timestamp: Date.now(),
        data: { 
          action: 'workspace_exported',
          format,
          fileCount: workspaceFiles.length
        }
      })
    }
  }

  const handleFileSelect = (file: any) => {
    setActiveFile(file.name)
    setCode(file.content)
  }

  // File management functions
  const createNewFile = () => {
    if (!newFileName.trim()) return

    const fileExtension = getFileExtension(newFileType)
    const fullName = newFileName.includes('.') ? newFileName : `${newFileName}.${fileExtension}`
    
    // Check if file already exists
    if (workspaceFiles.find(f => f.name === fullName)) {
      showToast('File with this name already exists!', 'error')
      return
    }

    const defaultContent = getDefaultContent(newFileType)
    const newFile = {
      name: fullName,
      type: newFileType,
      size: `${(defaultContent.length / 1024).toFixed(1)}KB`,
      content: defaultContent
    }

    setWorkspaceFiles(prev => [...prev, newFile])
    setActiveFile(fullName)
    setCode(defaultContent)

    // Notify via WebSocket
    if (wsConnection && isWebSocketConnected) {
      wsConnection.sendMessage({
        type: 'file_update',
        workspaceId,
        userId: wsConnection.getUserId(),
        timestamp: Date.now(),
        data: { 
          action: 'file_created',
          file: { name: fullName, type: newFileType }
        }
      })
    }

    // Reset dialog
    setShowNewFileDialog(false)
    setNewFileName('')
    setNewFileType('javascript')
    
    showToast(`File ${fullName} created successfully`, 'success')
  }

  const deleteFile = (fileName: string) => {
    if (workspaceFiles.length <= 1) {
      showToast('Cannot delete the last file!', 'error')
      return
    }

    if (confirm(`Are you sure you want to delete ${fileName}?`)) {
      setWorkspaceFiles(prev => prev.filter(f => f.name !== fileName))
      
      // If deleting active file, switch to first available file
      if (activeFile === fileName) {
        const remainingFiles = workspaceFiles.filter(f => f.name !== fileName)
        if (remainingFiles.length > 0) {
          setActiveFile(remainingFiles[0].name)
          setCode(remainingFiles[0].content)
        }
      }

      // Notify via WebSocket
      if (wsConnection && isWebSocketConnected) {
        wsConnection.sendMessage({
          type: 'file_update',
          workspaceId,
          userId: wsConnection.getUserId(),
          timestamp: Date.now(),
          data: { 
            action: 'file_deleted',
            fileName
          }
        })
      }
      
      showToast(`File ${fileName} deleted successfully`, 'success')
    }
  }

  const startRenamingFile = (fileName: string) => {
    setRenamingFile(fileName)
    setRenameValue(fileName)
  }

  const renameFile = () => {
    if (!renameValue.trim() || !renamingFile) return

    // Check if new name already exists
    if (renameValue !== renamingFile && workspaceFiles.find(f => f.name === renameValue)) {
      showToast('File with this name already exists!', 'error')
      return
    }

    setWorkspaceFiles(prev => prev.map(f => 
      f.name === renamingFile 
        ? { ...f, name: renameValue }
        : f
    ))

    // Update active file if it was renamed
    if (activeFile === renamingFile) {
      setActiveFile(renameValue)
    }

    // Notify via WebSocket
    if (wsConnection && isWebSocketConnected) {
      wsConnection.sendMessage({
        type: 'file_update',
        workspaceId,
        userId: wsConnection.getUserId(),
        timestamp: Date.now(),
        data: { 
          action: 'file_renamed',
          oldName: renamingFile,
          newName: renameValue
        }
      })
    }

    // Reset renaming state
    setRenamingFile(null)
    setRenameValue('')
    
    showToast(`File renamed to ${renameValue}`, 'success')
  }

  const getFileExtension = (fileType: string): string => {
    switch (fileType) {
      case 'javascript': return 'js'
      case 'typescript': return 'ts'
      case 'html': return 'html'
      case 'css': return 'css'
      case 'json': return 'json'
      case 'markdown': return 'md'
      default: return 'txt'
    }
  }

  const getDefaultContent = (fileType: string): string => {
    switch (fileType) {
      case 'javascript':
        return `// New JavaScript File
console.log('Hello, World!');

function main() {
  // Your code here
}

main();`
      case 'typescript':
        return `// New TypeScript File
console.log('Hello, World!');

function main(): void {
  // Your code here
}

main();`
      case 'html':
        return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New HTML File</title>
</head>
<body>
  <h1>Hello, World!</h1>
</body>
</html>`
      case 'css':
        return `/* New CSS File */
body {
  margin: 0;
  padding: 20px;
  font-family: Arial, sans-serif;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
}`
      case 'json':
        return `{
  "name": "project",
  "version": "1.0.0",
  "description": "New project"
}`
      case 'markdown':
        return `# New Markdown File

## Description
This is a new markdown file.

### Features
- Feature 1
- Feature 2
- Feature 3

### Usage
\`\`\`javascript
console.log('Example code');
\`\`\``
      default:
        return `// New File
// Add your content here`
    }
  }

  const getFileDropdownItems = (fileName: string) => [
  {
    id: 'rename',
    label: 'Rename',
    icon: <Edit className="w-4 h-4" />,
    onClick: () => startRenamingFile(fileName)
  },
  {
    id: 'duplicate',
    label: 'Duplicate',
    icon: <Copy className="w-4 h-4" />,
    onClick: () => {
      const file = workspaceFiles.find(f => f.name === fileName)
      if (file) {
        const baseName = fileName.replace(/\.[^/.]+$/, '')
        const extension = fileName.split('.').pop()
        const duplicateName = `${baseName}-copy.${extension}`
        
        const duplicateFile = {
          name: duplicateName,
          type: file.type,
          size: file.size,
          content: file.content
        }
        
        setWorkspaceFiles(prev => [...prev, duplicateFile])
        
        // Notify via WebSocket
        if (wsConnection && isWebSocketConnected) {
          wsConnection.sendMessage({
            type: 'file_update',
            workspaceId,
            userId: wsConnection.getUserId(),
            timestamp: Date.now(),
            data: { 
              action: 'file_duplicated',
              originalFile: fileName,
              newFile: duplicateName
            }
          })
        }
      }
    }
  },
  {
    id: 'download',
    label: 'Download',
    icon: <Download className="w-4 h-4" />,
    onClick: () => {
      const file = workspaceFiles.find(f => f.name === fileName)
      if (file) {
        const blob = new Blob([file.content], { type: 'text/plain' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = fileName
        a.click()
        URL.revokeObjectURL(url)
      }
    }
  },
  { divider: true } as any,
  {
    id: 'delete',
    label: 'Delete',
    icon: <Trash2 className="w-4 h-4" />,
    onClick: () => deleteFile(fileName),
    danger: true
  }
]

  const handleWorkspaceAction = (action: string) => {
    switch (action) {
      case 'upload-files':
        setShowFileUploader(true)
        break
      case 'share-workspace':
        setShowShareManager(true)
        break
      case 'export-project':
        // Export functionality
        console.log('Export project')
        setShowShareManager(true)
        break
      case 'duplicate-workspace':
        // Duplicate workspace
        console.log('Duplicate workspace')
        if (wsConnection && isWebSocketConnected) {
          wsConnection.sendMessage({
            type: 'file_update',
            workspaceId,
            userId: wsConnection.getUserId(),
            timestamp: Date.now(),
            data: { action: 'workspace_duplicated' }
          })
        }
        break
      case 'star-workspace':
        // Star workspace
        console.log('Star workspace')
        if (wsConnection && isWebSocketConnected) {
          wsConnection.sendMessage({
            type: 'file_update',
            workspaceId,
            userId: wsConnection.getUserId(),
            timestamp: Date.now(),
            data: { action: 'workspace_starred' }
          })
        }
        break
      case 'settings':
        // Open settings
        console.log('Open settings')
        break
    }
  }

  const handlePreviewAction = (action: string) => {
    switch (action) {
      case 'refresh':
        generatePreview()
        break
      case 'dark-mode':
        toggleDarkMode()
        break
      case 'view-source':
        // View source code
        console.log('View source')
        break
      case 'copy-code':
        handleCopyCode()
        break
      case 'open-new-tab':
        if (previewUrl) {
          window.open(previewUrl, '_blank')
        }
        break
      case 'share-link':
        if (previewUrl) {
          navigator.clipboard.writeText(window.location.href)
        }
        break
    }
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div>
                <h1 className="text-lg font-semibold text-white">Live Workspace</h1>
                {projectData.title && (
                  <div className="mt-1 flex items-center gap-2">
                    <span className="text-sm text-gray-400">Project:</span>
                    <span className="text-sm font-medium text-white">{projectData.title}</span>
                    {projectData.price > 0 && (
                      <span className="text-sm font-bold text-green-400">${projectData.price}</span>
                    )}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full animate-pulse ${
                  isWebSocketConnected ? 'bg-green-500' : 'bg-red-500'
                }`}></div>
                <span className="text-sm text-gray-400">
                  {isWebSocketConnected ? 'Live' : 'Offline'}
                </span>
                {realTimeCollaborators.length > 0 && (
                  <span className="text-xs text-blue-400">
                    +{realTimeCollaborators.length} collaborators
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Upload Status Indicator */}
              {isUploading && (
                <div className="flex items-center gap-2 px-3 py-1 bg-yellow-600 text-white rounded-lg text-sm">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  Importing projects...
                </div>
              )}

              {/* Collaborators */}
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-gray-500" />
                <div className="flex -space-x-2">
                  {collaborators.slice(0, 3).map((collaborator, index) => (
                    <div
                      key={index}
                      className={`w-6 h-6 ${collaborator.color} rounded-full border-2 border-white flex items-center justify-center`}
                      title={collaborator.name}
                    >
                      <span className="text-white text-xs font-bold">
                        {collaborator.name[0]}
                      </span>
                    </div>
                  ))}
                  {collaborators.length > 3 && (
                    <div className="w-6 h-6 bg-gray-500 rounded-full border-2 border-white flex items-center justify-center">
                      <span className="text-white text-xs">+{collaborators.length - 3}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Split Screen Controls */}
              <div className="flex items-center gap-1 bg-gray-700 rounded-lg p-1">
                <button
                  onClick={toggleSplitScreen}
                  className={`p-1 rounded transition-colors ${
                    isSplitScreen ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
                  }`}
                  title="Toggle Split Screen"
                >
                  <Layout className="w-3 h-3" />
                </button>
                {isSplitScreen && (
                  <button
                    onClick={toggleSplitDirection}
                    className="p-1 rounded text-gray-400 hover:text-white transition-colors"
                    title="Change Split Direction"
                  >
                    {splitDirection === 'vertical' ? <Layers className="w-3 h-3" /> : <Layers className="w-3 h-3 rotate-90" />}
                  </button>
                )}
              </div>

              {/* Picture-in-Picture Control */}
              <button
                onClick={togglePiPMode}
                className={`p-1 rounded transition-colors ${
                  isPiPMode ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'
                }`}
                title="Toggle Picture-in-Picture"
              >
                <PictureInPicture className="w-4 h-4" />
              </button>

              {/* Actions */}
              <button
                onClick={handleRun}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <Play className="w-4 h-4" />
                Run
              </button>
              
              <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                <Save className="w-4 h-4" />
                Save
              </button>

              <button 
                onClick={() => navigate('/create-project')}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                <Briefcase className="w-4 h-4" />
                Create Project for Client
              </button>

              <button 
                onClick={handleUploadAllProjects}
                className={`flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors ${
                  isUploading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                title="Import all projects from computer"
                disabled={isUploading}
              >
                <FolderOpen className={`w-4 h-4 ${isUploading ? 'animate-pulse' : ''}`} />
                {isUploading ? 'Importing...' : 'Import All Projects'}
              </button>

              <button 
                onClick={() => setShowFileUploader(true)}
                className="p-2 text-gray-600 hover:text-gray-900"
                title="Upload Files"
              >
                <Upload className="w-4 h-4" />
              </button>

              <button 
                onClick={() => setShowShareManager(true)}
                className="p-2 text-gray-600 hover:text-gray-900"
                title="Share & Export"
              >
                <Share2 className="w-4 h-4" />
              </button>

              <MoreDropdown 
                items={createWorkspaceDropdownItems(handleWorkspaceAction)}
                size="sm"
                variant="minimal"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex h-screen pt-14">
        {/* Sidebar - File Explorer(s) */}
        <div className={`bg-gray-800 text-white border-r border-gray-700 ${
          isSplitScreen ? (splitDirection === 'vertical' ? 'w-32' : 'w-64') : 'w-64'
        }`}>
          {/* First File Explorer */}
          <div className="p-4 border-b border-gray-700">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-400">
                {isSplitScreen ? 'Editor 1' : 'Explorer'}
              </h3>
              <button
                onClick={() => setShowNewFileDialog(true)}
                className="p-1 text-gray-400 hover:text-white hover:bg-gray-700 rounded"
                title="Create new file"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
            <div className="space-y-1">
              {workspaceFiles.map((file) => (
                <div key={file.name} className="group">
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => handleFileSelect(file)}
                      className={`flex-1 text-left px-2 py-1 rounded transition-colors flex items-center gap-1 text-xs ${
                        activeFile === file.name
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-300 hover:bg-gray-700'
                      }`}
                    >
                      <FileText className="w-3 h-3" />
                      <span className="truncate">{file.name}</span>
                    </button>
                    <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1">
                      <MoreDropdown 
                        items={getFileDropdownItems(file.name)}
                        size="sm"
                        variant="minimal"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Second File Explorer for Split Screen */}
          {isSplitScreen && (
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-400">Editor 2</h3>
              </div>
              <div className="space-y-1">
                {workspaceFiles.map((file) => (
                  <button
                    key={`2-${file.name}`}
                    onClick={() => handleFileSelect2(file)}
                    className={`w-full text-left px-2 py-1 rounded transition-colors flex items-center gap-1 text-xs ${
                      activeFile2 === file.name
                        ? 'bg-purple-600 text-white'
                        : 'text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    <FileText className="w-3 h-3" />
                    <span className="truncate">{file.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Git Status */}
          <div className="border-t border-gray-700 p-4">
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <GitBranch className="w-4 h-4" />
              <span>main</span>
            </div>
            <div className="mt-2 text-xs text-gray-500">
              <div>● 2 modified</div>
              <div>+ 15 lines</div>
              <div>- 3 lines</div>
            </div>
          </div>
        </div>

        {/* Main Editor Area */}
        <div className={`flex flex-col ${
          isSplitScreen ? (splitDirection === 'vertical' ? 'flex-1' : 'flex-1') : 'flex-1'
        }`}>
          {/* Enhanced Tabs */}
          <div className="bg-gray-800 border-b border-gray-700">
            <div className="px-4 py-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsPreviewMode(!isPreviewMode)}
                    className={`flex items-center gap-2 px-3 py-1 rounded transition-colors ${
                      isPreviewMode ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    <Eye className="w-4 h-4" />
                    Preview
                  </button>
                  
                  {isPreviewMode && (
                    <>
                      {/* Device Mode Selector */}
                      <div className="flex items-center gap-1 bg-gray-700 rounded-lg p-1 ml-2">
                        <button
                          onClick={() => setPreviewDevice('desktop')}
                          className={`p-1 rounded transition-colors ${
                            previewDevice === 'desktop' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
                          }`}
                          title="Desktop"
                        >
                          <Monitor className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => setPreviewDevice('tablet')}
                          className={`p-1 rounded transition-colors ${
                            previewDevice === 'tablet' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
                          }`}
                          title="Tablet"
                        >
                          <Tablet className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => setPreviewDevice('mobile')}
                          className={`p-1 rounded transition-colors ${
                            previewDevice === 'mobile' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
                          }`}
                          title="Mobile"
                        >
                          <Smartphone className="w-3 h-3" />
                        </button>
                      </div>

                      <button
                        onClick={toggleLiveMode}
                        className={`p-1 rounded transition-colors ${
                          isLiveMode ? 'text-green-500' : 'text-gray-400 hover:text-white'
                        }`}
                        title="Toggle Live Mode"
                      >
                        <Zap className="w-3 h-3" />
                      </button>
                      
                      <button
                        onClick={toggleDarkMode}
                        className={`p-1 rounded transition-colors ${
                          isDarkMode ? 'text-yellow-500' : 'text-gray-400 hover:text-white'
                        }`}
                        title="Toggle Dark Mode"
                      >
                        {isDarkMode ? <Sun className="w-3 h-3" /> : <Moon className="w-3 h-3" />}
                      </button>
                      
                      <button
                        onClick={toggleConsole}
                        className={`p-1 rounded transition-colors ${
                          showConsole ? 'text-purple-500' : 'text-gray-400 hover:text-white'
                        }`}
                        title="Toggle Console"
                      >
                        <Code className="w-3 h-3" />
                      </button>

                      {/* Zoom Control */}
                      <div className="flex items-center gap-1 text-gray-400">
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
                    </>
                  )}
                  
                  <button
                    onClick={() => setIsTerminalOpen(!isTerminalOpen)}
                    className={`flex items-center gap-2 px-3 py-1 rounded transition-colors ${
                      isTerminalOpen ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    <Terminal className="w-4 h-4" />
                    Terminal
                  </button>
                </div>

                {/* Status indicators */}
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  {isPreviewMode && (
                    <>
                      <span>{previewDevice.charAt(0).toUpperCase() + previewDevice.slice(1)}</span>
                      {isLiveMode && (
                        <span className="text-green-500 flex items-center gap-1">
                          <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                          Live
                        </span>
                      )}
                      {isDarkMode && <span>Dark</span>}
                      <span>Zoom: {zoom}%</span>
                      
                      {/* Preview More Dropdown */}
                      <MoreDropdown 
                        items={createPreviewDropdownItems(handlePreviewAction)}
                        size="sm"
                        variant="minimal"
                      />
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Editor or Preview - Split Screen Support */}
          <div className={`flex ${
            isSplitScreen 
              ? (splitDirection === 'vertical' ? 'flex-1' : 'flex-1')
              : 'flex-1'
          }`}>
            {!isPreviewMode ? (
              <div className={
                isSplitScreen 
                  ? (splitDirection === 'vertical' 
                      ? 'flex flex-1' 
                      : 'flex flex-col flex-1')
                  : 'flex-1'
              }>
                {/* First Editor */}
                <div className={
                  isSplitScreen 
                    ? (splitDirection === 'vertical' ? 'flex-1 border-r border-gray-700' : 'flex-1 border-b border-gray-700')
                    : 'flex-1'
                }>
                  <div className="bg-gray-700 px-3 py-1 text-xs text-gray-300 flex items-center justify-between">
                    <span>{activeFile}</span>
                    <span className="text-blue-400">Editor 1</span>
                  </div>
                  <div className={isSplitScreen ? 'h-[calc(100%-2rem)]' : 'h-full'}>
                    <Editor
                      height="100%"
                      language="javascript"
                      value={code}
                      onChange={(value) => setCode(value || '')}
                      theme="vs-dark"
                      onMount={(editor, monaco) => {
                        editorRef.current = editor
                        
                        // Enhanced Monaco features
                        editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
                          // Save functionality
                          console.log('Code saved')
                        })
                        
                        // Enable IntelliSense
                        monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
                          target: monaco.languages.typescript.ScriptTarget.ES2020,
                          allowNonTsExtensions: true,
                          moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs
                        })

                        // Track cursor position for real-time collaboration
                        editor.onDidChangeCursorPosition((e) => {
                          if (wsConnection && isWebSocketConnected) {
                            wsConnection.sendCursorUpdate(
                              e.position.lineNumber,
                              e.position.column,
                              activeFile
                            )
                          }
                        })
                      }}
                      options={{
                        minimap: { enabled: !isSplitScreen || splitDirection === 'horizontal' },
                        fontSize: isSplitScreen ? 12 : 14,
                        fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
                        lineNumbers: 'on',
                        roundedSelection: false,
                        scrollBeyondLastLine: false,
                        automaticLayout: true,
                        wordWrap: 'on',
                        bracketPairColorization: { enabled: true },
                        guides: {
                          indentation: true,
                          bracketPairs: true
                        },
                        suggest: {
                          showKeywords: true,
                          showSnippets: true,
                          showFunctions: true
                        },
                        quickSuggestions: {
                          other: true,
                          comments: true,
                          strings: true
                        },
                        parameterHints: { enabled: true },
                        hover: { enabled: true }
                      }}
                    />
                  </div>
                </div>

                {/* Second Editor for Split Screen */}
                {isSplitScreen && (
                  <div className="flex-1">
                    <div className="bg-gray-700 px-3 py-1 text-xs text-gray-300 flex items-center justify-between">
                      <span>{activeFile2}</span>
                      <span className="text-purple-400">Editor 2</span>
                    </div>
                    <div className="h-[calc(100%-2rem)]">
                      <Editor
                        height="100%"
                        language="javascript"
                        value={code2}
                        onChange={(value) => setCode2(value || '')}
                        theme="vs-dark"
                        onMount={(editor, monaco) => {
                          editorRef2.current = editor
                          
                          // Track cursor position for second editor
                          editor.onDidChangeCursorPosition((e) => {
                            if (wsConnection && isWebSocketConnected) {
                              wsConnection.sendCursorUpdate(
                                e.position.lineNumber,
                                e.position.column,
                                activeFile2
                              )
                            }
                          })
                        }}
                        options={{
                          minimap: { enabled: splitDirection === 'horizontal' },
                          fontSize: 12,
                          fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
                          lineNumbers: 'on',
                          roundedSelection: false,
                          scrollBeyondLastLine: false,
                          automaticLayout: true,
                          wordWrap: 'on',
                          bracketPairColorization: { enabled: true },
                          guides: {
                            indentation: true,
                            bracketPairs: true
                          }
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex-1 flex">
                <div className="flex-1 bg-gray-50 p-4">
                  <div className="flex justify-center">
                    <div 
                      style={{ 
                        ...getDeviceStyles(),
                        transform: `scale(${zoom / 100})`,
                        transformOrigin: 'top center',
                        transition: 'transform 0.2s ease'
                      }}
                    >
                      {previewUrl ? (
                        <iframe
                          src={previewUrl}
                          className="w-full h-full border-0 bg-white"
                          title="Live Preview"
                          sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                        />
                      ) : (
                        <div className="w-full h-full bg-white flex items-center justify-center text-gray-500">
                          <div className="text-center">
                            <p className="text-lg mb-4">Click "Run" to see your code in action</p>
                            <button
                              onClick={handleRun}
                              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            >
                              Run Preview
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Console Panel */}
                {showConsole && (
                  <div className="w-80 bg-gray-900 border-l border-gray-700">
                    <div className="flex items-center justify-between p-3 border-b border-gray-700">
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
                    <div className="p-3 overflow-y-auto h-full font-mono text-xs">
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
            )}

            {/* Live Collaboration Panel */}
            <div className="w-80 bg-gray-800 border-l border-gray-700 p-4">
              <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                <Zap className="w-4 h-4 text-yellow-500" />
                Live Activity
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-2 bg-gray-700 rounded">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">Sarah</p>
                    <p className="text-xs text-gray-400">Editing App.css</p>
                  </div>
                  <span className="text-xs text-gray-500">now</span>
                </div>
                
                <div className="flex items-center gap-3 p-2 bg-gray-700 rounded">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">Mike</p>
                    <p className="text-xs text-gray-400">Viewing preview</p>
                  </div>
                  <span className="text-xs text-gray-500">2m ago</span>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-700">
                <h4 className="text-sm font-medium text-white mb-2">Code Changes</h4>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded"></div>
                    <span className="text-gray-400">+ Added useState import</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded"></div>
                    <span className="text-gray-400">~ Modified App component</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Terminal */}
          {isTerminalOpen && (
            <div className="h-48 bg-gray-900 text-green-400 border-t border-gray-700 p-4 font-mono text-sm">
              <div className="mb-2">$ npm start</div>
              <div>Starting development server...</div>
              <div>Compiled successfully!</div>
              <div>You can now view app in browser.</div>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-gray-400">$</span>
                <span className="animate-pulse">_</span>
              </div>
            </div>
          )}
        </div>

      {/* New File Dialog */}
      {showNewFileDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold text-white mb-4">Create New File</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  File Name
                </label>
                <input
                  type="text"
                  value={newFileName}
                  onChange={(e) => setNewFileName(e.target.value)}
                  placeholder="Enter file name (without extension)"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  File Type
                </label>
                <select
                  value={newFileType}
                  onChange={(e) => setNewFileType(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="javascript">JavaScript (.js)</option>
                  <option value="typescript">TypeScript (.ts)</option>
                  <option value="html">HTML (.html)</option>
                  <option value="css">CSS (.css)</option>
                  <option value="json">JSON (.json)</option>
                  <option value="markdown">Markdown (.md)</option>
                </select>
              </div>

              <div className="bg-gray-700 rounded-lg p-3">
                <div className="text-sm text-gray-300">
                  File will be created as: <span className="font-mono text-blue-400">
                    {newFileName || 'filename'}.{getFileExtension(newFileType)}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-2 mt-6">
              <button
                onClick={() => {
                  setShowNewFileDialog(false)
                  setNewFileName('')
                  setNewFileType('javascript')
                }}
                className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={createNewFile}
                disabled={!newFileName.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create File
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Picture-in-Picture Window */}
      {isPiPMode && previewUrl && (
        <div
          className="fixed bg-gray-800 border border-gray-600 rounded-lg shadow-2xl z-50"
          style={{
            left: `${pipPosition.x}px`,
            top: `${pipPosition.y}px`,
            width: `${pipSize.width}px`,
            height: `${pipSize.height}px`,
            cursor: isDraggingPiP ? 'grabbing' : 'grab'
          }}
          onMouseDown={handlePiPMouseDown}
          onMouseMove={handlePiPMouseMove}
          onMouseUp={handlePiPMouseUp}
        >
          {/* PiP Header */}
          <div className="bg-gray-700 px-2 py-1 rounded-t-lg flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-gray-300">Preview</span>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPipSize(prev => ({ 
                  width: prev.width === 400 ? 600 : 400, 
                  height: prev.height === 300 ? 450 : 300 
                }))}
                className="p-1 text-gray-400 hover:text-white"
                title="Resize"
              >
                <Maximize2 className="w-3 h-3" />
              </button>
              <button
                onClick={togglePiPMode}
                className="p-1 text-gray-400 hover:text-white"
                title="Close"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          </div>
          
          {/* PiP Content */}
          <div className="h-[calc(100%-2rem)] bg-white">
            <iframe
              src={previewUrl}
              className="w-full h-full border-0"
              title="PiP Preview"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
            />
          </div>
        </div>
      )}

      {/* File Uploader Modal */}
      {showFileUploader && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">Upload Files or Folders</h2>
              <button
                onClick={() => setShowFileUploader(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <FileUploader onFilesUploaded={handleFilesUploaded} />
          </div>
        </div>
      )}

      {/* Share Manager Modal */}
      {showShareManager && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">Share & Export Workspace</h2>
              <button
                onClick={() => setShowShareManager(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <FileShareManager 
              files={workspaceFiles.map(f => ({ 
                id: f.name, 
                name: f.name, 
                content: f.content, 
                language: f.type, 
                modified: false 
              }))}
              workspaceName={projectData.title || 'Live Workspace'}
              onShare={handleShare}
              onExport={handleExport}
            />
          </div>
        </div>
      )}
      </div>
    </div>
  )
}
