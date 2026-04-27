import React, { useState, useEffect, useCallback, useRef } from 'react'
import { 
  FileText, 
  Plus, 
  X, 
  Play, 
  Save, 
  Download, 
  Copy, 
  RefreshCw,
  Users,
  Share2,
  Settings,
  Globe,
  Zap,
  Eye,
  EyeOff,
  Maximize2,
  Terminal,
  Package,
  Code,
  Palette,
  Upload
} from 'lucide-react'
import Editor from '@monaco-editor/react'
import JSZip from 'jszip'
import { defaultWorkspaceFiles, snippetMarketplaceSeed, projectTemplateSeed } from '../../data/developerWorkspace'
import LivePreview from '../LivePreview'
import FileUploader from './FileUploader'
import FileShareManager from './FileShareManager'

interface WorkspaceFile {
  id: string
  name: string
  content: string
  language: string
  modified: boolean
  active?: boolean
}

interface Collaborator {
  id: string
  name: string
  avatar: string
  cursor?: {
    line: number
    column: number
    file: string
  }
  color: string
}

interface LiveWorkspaceProps {
  initialFiles?: WorkspaceFile[]
  templateId?: string
  onShare?: (workspaceId: string) => void
  onExport?: (files: WorkspaceFile[]) => void
  readOnly?: boolean
}

const LiveWorkspace: React.FC<LiveWorkspaceProps> = ({
  initialFiles,
  templateId,
  onShare,
  onExport,
  readOnly = false
}) => {
  const [files, setFiles] = useState<WorkspaceFile[]>(() => {
    if (initialFiles) return initialFiles
    
    if (templateId) {
      const template = projectTemplateSeed.find(t => t.id === templateId)
      if (template) {
        return template.files.map((file, index) => ({
          id: `file-${index}`,
          name: file.name,
          content: file.content,
          language: file.language,
          modified: false,
          active: index === 0
        }))
      }
    }
    
    return defaultWorkspaceFiles.map((file, index) => ({
      id: `file-${index}`,
      name: file.name,
      content: file.content,
      language: file.language,
      modified: false,
      active: index === 0
    }))
  })

  const [activeFileId, setActiveFileId] = useState<string>(files[0]?.id || '')
  const [isPreviewVisible, setIsPreviewVisible] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showTemplates, setShowTemplates] = useState(false)
  const [showSnippets, setShowSnippets] = useState(false)
  const [showCollaborators, setShowCollaborators] = useState(false)
  const [showConsole, setShowConsole] = useState(false)
  const [consoleOutput, setConsoleOutput] = useState<string[]>([])
  const [collaborators, setCollaborators] = useState<Collaborator[]>([])
  const [workspaceName, setWorkspaceName] = useState('Untitled Workspace')
  const [isLiveMode, setIsLiveMode] = useState(false)
  const [previewUrl, setPreviewUrl] = useState('')
  const [showFileUploader, setShowFileUploader] = useState(false)
  const [showShareManager, setShowShareManager] = useState(false)
  
  const editorRef = useRef<any>(null)
  const wsRef = useRef<WebSocket | null>(null)

  const activeFile = files.find(f => f.id === activeFileId)

  // WebSocket connection for real-time collaboration
  useEffect(() => {
    if (isLiveMode) {
      const ws = new WebSocket('ws://localhost:8080/workspace')
      wsRef.current = ws

      ws.onopen = () => {
        console.log('Connected to workspace server')
        ws.send(JSON.stringify({
          type: 'join_workspace',
          workspaceId: workspaceName,
          userId: 'current-user'
        }))
      }

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data)
        handleWebSocketMessage(data)
      }

      ws.onclose = () => {
        console.log('Disconnected from workspace server')
        setIsLiveMode(false)
      }

      return () => {
        ws.close()
      }
    }
  }, [isLiveMode, workspaceName])

  const handleWebSocketMessage = (data: any) => {
    switch (data.type) {
      case 'file_update':
        if (data.userId !== 'current-user') {
          setFiles(prev => prev.map(file => 
            file.id === data.fileId 
              ? { ...file, content: data.content, modified: true }
              : file
          ))
        }
        break
      case 'collaborator_join':
        setCollaborators(prev => [...prev, data.collaborator])
        break
      case 'collaborator_leave':
        setCollaborators(prev => prev.filter(c => c.id !== data.userId))
        break
      case 'cursor_update':
        setCollaborators(prev => prev.map(c => 
          c.id === data.userId 
            ? { ...c, cursor: data.cursor }
            : c
        ))
        break
    }
  }

  const broadcastFileUpdate = useCallback((fileId: string, content: string) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'file_update',
        fileId,
        content,
        userId: 'current-user'
      }))
    }
  }, [])

  const broadcastCursorUpdate = useCallback((line: number, column: number) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'cursor_update',
        cursor: { line, column, file: activeFileId },
        userId: 'current-user'
      }))
    }
  }, [activeFileId])

  const updateFileContent = useCallback((content: string) => {
    setFiles(prev => prev.map(file => 
      file.id === activeFileId 
        ? { ...file, content, modified: true }
        : file
    ))
    
    if (isLiveMode) {
      broadcastFileUpdate(activeFileId, content)
    }
  }, [activeFileId, isLiveMode, broadcastFileUpdate])

  const addNewFile = useCallback(() => {
    const fileName = prompt('Enter file name (e.g., about.html):')
    if (fileName) {
      const extension = fileName.split('.').pop()?.toLowerCase()
      let language = 'plaintext'
      
      switch (extension) {
        case 'html': language = 'html'; break
        case 'css': language = 'css'; break
        case 'js': language = 'javascript'; break
        case 'ts': language = 'typescript'; break
        case 'json': language = 'json'; break
        case 'md': language = 'markdown'; break
      }

      const newFile: WorkspaceFile = {
        id: `file-${Date.now()}`,
        name: fileName,
        content: '',
        language,
        modified: false,
        active: true
      }

      setFiles(prev => [...prev.map(f => ({ ...f, active: false })), newFile])
      setActiveFileId(newFile.id)
    }
  }, [])

  const deleteFile = useCallback((fileId: string) => {
    if (files.length > 1) {
      setFiles(prev => {
        const newFiles = prev.filter(f => f.id !== fileId)
        if (activeFileId === fileId) {
          setActiveFileId(newFiles[0]?.id || '')
        }
        return newFiles
      })
    }
  }, [files.length, activeFileId])

  const duplicateFile = useCallback((fileId: string) => {
    const file = files.find(f => f.id === fileId)
    if (file) {
      const newName = prompt('Enter new file name:', `${file.name.split('.')[0]}-copy.${file.name.split('.').pop()}`)
      if (newName) {
        const newFile: WorkspaceFile = {
          ...file,
          id: `file-${Date.now()}`,
          name: newName,
          modified: false
        }
        setFiles(prev => [...prev, newFile])
      }
    }
  }, [files])

  const exportWorkspace = useCallback(() => {
    if (onExport) {
      onExport(files)
    } else {
      // Default export behavior
      const zip = new JSZip()
      files.forEach(file => {
        zip.file(file.name, file.content)
      })
      
      zip.generateAsync({ type: 'blob' }).then(blob => {
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${workspaceName.replace(/\s+/g, '-').toLowerCase()}.zip`
        a.click()
        URL.revokeObjectURL(url)
      })
    }
  }, [files, workspaceName, onExport])

  const shareWorkspace = useCallback(() => {
    if (onShare) {
      onShare(workspaceName)
    } else {
      // Default share behavior
      const shareUrl = `${window.location.origin}/workspace/${workspaceName.replace(/\s+/g, '-').toLowerCase()}`
      navigator.clipboard.writeText(shareUrl)
      alert('Workspace link copied to clipboard!')
    }
  }, [workspaceName, onShare])

  const handleTemplateSelect = useCallback((templateId: string) => {
    const template = projectTemplateSeed.find(t => t.id === templateId)
    if (template) {
      const newFiles = template.files.map((file, index) => ({
        id: `file-${Date.now()}-${index}`,
        name: file.name,
        content: file.content,
        language: file.language,
        modified: false,
        active: index === 0
      }))
      setFiles(newFiles)
      setActiveFileId(newFiles[0]?.id || '')
      setShowTemplates(false)
    }
  }, [])

  const handleSnippetInsert = useCallback((snippetId: string) => {
    const snippet = snippetMarketplaceSeed.find(s => s.id === snippetId)
    if (snippet && snippet.files.length > 0) {
      const snippetFile = snippet.files[0]
      updateFileContent(activeFile?.content + '\n\n' + snippetFile.content)
      setShowSnippets(false)
    }
  }, [activeFile, updateFileContent])

  const handleFilesUploaded = useCallback((uploadedFiles: any[]) => {
    const newFiles = uploadedFiles.map((file, index) => ({
      id: `file-${Date.now()}-${index}`,
      name: file.name,
      content: file.content,
      language: file.language,
      modified: false,
      active: index === 0,
      path: file.path
    }))

    setFiles(prev => [...prev.map(f => ({ ...f, active: false })), ...newFiles])
    if (newFiles.length > 0) {
      setActiveFileId(newFiles[0].id)
    }
    setShowFileUploader(false)
  }, [])

  const handleShare = useCallback((settings: any) => {
    console.log('Share settings:', settings)
  }, [])

  const handleExport = useCallback((format: 'zip' | 'github' | 'individual') => {
    console.log('Export format:', format)
  }, [])

  const logToConsole = useCallback((message: string, type: 'log' | 'error' | 'warn' = 'log') => {
    const timestamp = new Date().toLocaleTimeString()
    setConsoleOutput(prev => [...prev, `[${timestamp}] ${type.toUpperCase()}: ${message}`])
  }, [])

  const runPreview = useCallback(() => {
    logToConsole('Running preview...')
    const htmlFile = files.find(f => f.name.endsWith('.html'))
    if (htmlFile) {
      const blob = new Blob([htmlFile.content], { type: 'text/html' })
      const url = URL.createObjectURL(blob)
      setPreviewUrl(url)
      logToConsole('Preview generated successfully')
    } else {
      logToConsole('No HTML file found', 'error')
    }
  }, [files, logToConsole])

  const handleEditorDidMount = useCallback((editor: any, monaco: any) => {
    editorRef.current = editor
    
    editor.updateOptions({
      fontSize: 14,
      wordWrap: 'on',
      minimap: { enabled: true },
      scrollBeyondLastLine: false,
      automaticLayout: true,
      readOnly: readOnly,
      theme: 'vs-dark',
      lineNumbers: 'on',
      tabSize: 2,
      insertSpaces: true,
      renderWhitespace: 'selection',
      bracketPairColorization: { enabled: true }
    })

    editor.onDidChangeCursorPosition((e: any) => {
      const position = e.position
      broadcastCursorUpdate(position.lineNumber, position.column)
    })
  }, [readOnly, broadcastCursorUpdate])

  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-50 bg-gray-900 flex">
        <div className="flex-1 flex">
          <div className="w-1/2 border-r border-gray-700">
            <div className="bg-gray-800 px-4 py-2 flex items-center justify-between">
              <span className="text-white text-sm font-medium">{activeFile?.name}</span>
              <button
                onClick={() => setIsFullscreen(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="h-full">
              <Editor
                height="100%"
                width="100%"
                language={activeFile?.language || 'plaintext'}
                value={activeFile?.content || ''}
                theme="vs-dark"
                onChange={(value) => updateFileContent(value || '')}
                onMount={handleEditorDidMount}
                options={{ readOnly }}
              />
            </div>
          </div>
          
          <div className="w-1/2">
            <LivePreview
              project={{
                id: workspaceName,
                title: workspaceName,
                description: 'Live workspace preview',
                tags: [],
                price: 0,
                author: { username: 'user', id: '1', avatar: '' },
                status: 'published' as const,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              }}
              files={files.map(f => ({ name: f.name, content: f.content, language: f.language }))}
              height="100%"
              showControls={true}
            />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen flex bg-gray-900">
      {/* Sidebar */}
      <div className="w-64 bg-gray-800 border-r border-gray-700 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-700">
          <input
            type="text"
            value={workspaceName}
            onChange={(e) => setWorkspaceName(e.target.value)}
            className="w-full bg-gray-700 text-white px-3 py-2 rounded text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Workspace Name"
          />
          
          <div className="flex items-center justify-between mt-3">
            <button
              onClick={() => setIsLiveMode(!isLiveMode)}
              className={`flex items-center px-2 py-1 rounded text-xs transition-colors ${
                isLiveMode 
                  ? 'bg-green-600 text-white' 
                  : 'bg-gray-700 text-gray-400 hover:text-white'
              }`}
            >
              <Zap className="w-3 h-3 mr-1" />
              {isLiveMode ? 'Live' : 'Offline'}
            </button>
            
            <button
              onClick={shareWorkspace}
              className="text-gray-400 hover:text-white"
              title="Share workspace"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* File List */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-white font-medium text-sm">Files</h3>
              <button
                onClick={addNewFile}
                className="text-gray-400 hover:text-white"
                title="Add file"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            
            <div className="space-y-1">
              {files.map((file) => (
                <div
                  key={file.id}
                  className={`group flex items-center justify-between p-2 rounded cursor-pointer transition-colors ${
                    file.id === activeFileId 
                      ? 'bg-blue-600 text-white' 
                      : 'text-gray-400 hover:bg-gray-700 hover:text-white'
                  }`}
                  onClick={() => setActiveFileId(file.id)}
                >
                  <div className="flex items-center">
                    <FileText className="w-4 h-4 mr-2" />
                    <span className="text-sm truncate">{file.name}</span>
                    {file.modified && (
                      <div className="w-2 h-2 bg-yellow-500 rounded-full ml-2" />
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        duplicateFile(file.id)
                      }}
                      className="text-gray-500 hover:text-white"
                      title="Duplicate"
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                    {files.length > 1 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          deleteFile(file.id)
                        }}
                        className="text-gray-500 hover:text-red-400"
                        title="Delete"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Templates & Snippets */}
          <div className="p-4 border-t border-gray-700">
            <div className="space-y-2">
              <button
                onClick={() => setShowFileUploader(!showFileUploader)}
                className="w-full flex items-center px-3 py-2 bg-gray-700 text-gray-300 rounded hover:bg-gray-600 hover:text-white transition-colors text-sm"
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload Files
              </button>
              
              <button
                onClick={() => setShowShareManager(!showShareManager)}
                className="w-full flex items-center px-3 py-2 bg-gray-700 text-gray-300 rounded hover:bg-gray-600 hover:text-white transition-colors text-sm"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share & Export
              </button>
              
              <button
                onClick={() => setShowTemplates(!showTemplates)}
                className="w-full flex items-center px-3 py-2 bg-gray-700 text-gray-300 rounded hover:bg-gray-600 hover:text-white transition-colors text-sm"
              >
                <Package className="w-4 h-4 mr-2" />
                Templates
              </button>
              
              <button
                onClick={() => setShowSnippets(!showSnippets)}
                className="w-full flex items-center px-3 py-2 bg-gray-700 text-gray-300 rounded hover:bg-gray-600 hover:text-white transition-colors text-sm"
              >
                <Code className="w-4 h-4 mr-2" />
                Snippets
              </button>
            </div>
          </div>

          {/* Collaborators */}
          {collaborators.length > 0 && (
            <div className="p-4 border-t border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-white font-medium text-sm">Collaborators</h3>
                <Users className="w-4 h-4 text-gray-400" />
              </div>
              <div className="space-y-2">
                {collaborators.map((collaborator) => (
                  <div key={collaborator.id} className="flex items-center space-x-2">
                    <div 
                      className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium text-white"
                      style={{ backgroundColor: collaborator.color }}
                    >
                      {collaborator.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-gray-400 text-xs">{collaborator.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="p-4 border-t border-gray-700 space-y-2">
          <button
            onClick={runPreview}
            className="w-full flex items-center justify-center bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded transition-colors text-sm"
          >
            <Play className="w-4 h-4 mr-2" />
            Run Preview
          </button>
          
          <button
            onClick={exportWorkspace}
            className="w-full flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded transition-colors text-sm"
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Main Editor Area */}
      <div className="flex-1 flex flex-col">
        {/* Editor Header */}
        <div className="bg-gray-800 border-b border-gray-700 px-4 py-2 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <FileText className="w-4 h-4 mr-2 text-gray-400" />
              <span className="text-white font-medium">{activeFile?.name}</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsPreviewVisible(!isPreviewVisible)}
                className={`text-gray-400 hover:text-white ${!isPreviewVisible ? 'text-blue-500' : ''}`}
                title={isPreviewVisible ? 'Hide preview' : 'Show preview'}
              >
                {isPreviewVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
              
              {isPreviewVisible && (
                <>
                  <button
                    onClick={() => {
                      // Trigger refresh in LivePreview
                      const event = new CustomEvent('refreshPreview')
                      window.dispatchEvent(event)
                    }}
                    className="text-gray-400 hover:text-white"
                    title="Refresh preview"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                  
                  <button
                    onClick={() => {
                      // Toggle live mode
                      const event = new CustomEvent('toggleLiveMode')
                      window.dispatchEvent(event)
                    }}
                    className="text-gray-400 hover:text-white"
                    title="Toggle live mode"
                  >
                    <Zap className="w-4 h-4" />
                  </button>
                  
                  <button
                    onClick={() => {
                      // Toggle dark mode
                      const event = new CustomEvent('toggleDarkMode')
                      window.dispatchEvent(event)
                    }}
                    className="text-gray-400 hover:text-white"
                    title="Toggle dark mode"
                  >
                    <Palette className="w-4 h-4" />
                  </button>
                </>
              )}
              
              <button
                onClick={() => setIsFullscreen(true)}
                className="text-gray-400 hover:text-white"
                title="Fullscreen"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
              
              <button
                onClick={() => setShowConsole(!showConsole)}
                className={`text-gray-400 hover:text-white ${showConsole ? 'text-purple-500' : ''}`}
                title="Toggle console"
              >
                <Terminal className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 text-xs text-gray-500">
            {isLiveMode && (
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                Live
              </div>
            )}
            <span>{activeFile?.language}</span>
          </div>
        </div>

        {/* Editor and Preview */}
        <div className="flex-1 flex">
          <div className={`${isPreviewVisible ? 'w-1/2' : 'w-full'} border-r border-gray-700`}>
            <Editor
              height="100%"
              width="100%"
              language={activeFile?.language || 'plaintext'}
              value={activeFile?.content || ''}
              theme="vs-dark"
              onChange={(value) => updateFileContent(value || '')}
              onMount={handleEditorDidMount}
              options={{ readOnly }}
            />
          </div>
          
          {isPreviewVisible && (
            <div className="w-1/2 bg-white">
              <LivePreview
                project={{
                  id: workspaceName,
                  title: workspaceName,
                  description: 'Live workspace preview',
                  tags: [],
                  price: 0,
                  author: { username: 'user', id: '1', avatar: '' },
                  status: 'published' as const,
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString()
                }}
                files={files.map(f => ({ name: f.name, content: f.content, language: f.language }))}
                height="100%"
                showControls={true}
              />
            </div>
          )}
        </div>

        {/* Console */}
        {showConsole && (
          <div className="h-48 bg-gray-900 border-t border-gray-700">
            <div className="bg-gray-800 px-4 py-2 border-b border-gray-700 flex items-center justify-between">
              <span className="text-white text-sm font-medium">Console</span>
              <button
                onClick={() => setConsoleOutput([])}
                className="text-gray-400 hover:text-white text-xs"
              >
                Clear
              </button>
            </div>
            <div className="p-4 font-mono text-xs overflow-y-auto h-full">
              {consoleOutput.length === 0 ? (
                <div className="text-gray-500">Console output will appear here...</div>
              ) : (
                consoleOutput.map((line, index) => (
                  <div key={index} className="text-green-400 mb-1">{line}</div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Templates Modal */}
      {showTemplates && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-2xl w-full max-h-96 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">Choose Template</h2>
              <button
                onClick={() => setShowTemplates(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 gap-3">
              {projectTemplateSeed.map((template) => (
                <button
                  key={template.id}
                  onClick={() => handleTemplateSelect(template.id)}
                  className="bg-gray-700 hover:bg-gray-600 text-left p-4 rounded-lg transition-colors"
                >
                  <h3 className="font-semibold text-white mb-1">{template.name}</h3>
                  <p className="text-gray-400 text-sm mb-2">{template.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex flex-wrap gap-1">
                      {template.technologies.slice(0, 3).map((tech) => (
                        <span key={tech} className="bg-gray-600 text-xs px-2 py-1 rounded">
                          {tech}
                        </span>
                      ))}
                    </div>
                    <span className="text-gray-500 text-xs">{template.estimatedSetup}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Snippets Modal */}
      {showSnippets && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-2xl w-full max-h-96 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">Insert Snippet</h2>
              <button
                onClick={() => setShowSnippets(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 gap-3">
              {snippetMarketplaceSeed.map((snippet) => (
                <button
                  key={snippet.id}
                  onClick={() => handleSnippetInsert(snippet.id)}
                  className="bg-gray-700 hover:bg-gray-600 text-left p-4 rounded-lg transition-colors"
                >
                  <h3 className="font-semibold text-white mb-1">{snippet.title}</h3>
                  <p className="text-gray-400 text-sm mb-2">{snippet.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex flex-wrap gap-1">
                      {snippet.technologies.slice(0, 3).map((tech) => (
                        <span key={tech} className="bg-gray-600 text-xs px-2 py-1 rounded">
                          {tech}
                        </span>
                      ))}
                    </div>
                    <span className="text-green-400 text-sm">${snippet.price}</span>
                  </div>
                </button>
              ))}
            </div>
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
              files={files}
              workspaceName={workspaceName}
              onShare={handleShare}
              onExport={handleExport}
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default LiveWorkspace
