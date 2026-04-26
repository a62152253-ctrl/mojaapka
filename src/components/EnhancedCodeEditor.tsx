import React, { useState, useEffect, useRef, useCallback } from 'react'
import Editor from '@monaco-editor/react'
import { 
  FileText, Plus, X, Play, Save, Download, Upload, Copy, 
  Settings, Terminal, Eye, EyeOff, RefreshCw, FolderOpen,
  Search, Replace, GitBranch, Zap, Code, CheckCircle, AlertCircle
} from 'lucide-react'

interface CodeFile {
  id: string
  name: string
  content: string
  language: string
  path?: string
  isDirty?: boolean
  isTemporary?: boolean
}

interface EditorSettings {
  theme: 'dark' | 'light' | 'vs-dark'
  fontSize: number
  wordWrap: 'on' | 'off'
  minimap: boolean
  lineNumbers: 'on' | 'off'
  tabSize: number
  autoSave: boolean
  autoSaveDelay: number
}

interface EnhancedCodeEditorProps {
  files?: CodeFile[]
  onFilesChange?: (files: CodeFile[]) => void
  height?: string
  showPreview?: boolean
  showTerminal?: boolean
  readOnly?: boolean
  onSave?: (file: CodeFile) => void
  onRun?: (code: string, language: string) => void
  initialLanguage?: string
}

export default function EnhancedCodeEditor({
  files = [],
  onFilesChange,
  height = '600px',
  showPreview = true,
  showTerminal = false,
  readOnly = false,
  onSave,
  onRun,
  initialLanguage = 'javascript'
}: EnhancedCodeEditorProps) {
  const [activeFile, setActiveFile] = useState<CodeFile | null>(null)
  const [editorFiles, setEditorFiles] = useState<CodeFile[]>(files)
  const [previewContent, setPreviewContent] = useState<string>('')
  const [previewError, setPreviewError] = useState<string>('')
  const [terminalOutput, setTerminalOutput] = useState<string[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [replaceQuery, setReplaceQuery] = useState('')
  const [showSearch, setShowSearch] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showPreviewPanel, setShowPreviewPanel] = useState(showPreview)
  const [showTerminalPanel, setShowTerminalPanel] = useState(showTerminal)
  const [isFullscreen, setIsFullscreen] = useState(false)
  
  const editorRef = useRef<any>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [settings, setSettings] = useState<EditorSettings>({
    theme: 'vs-dark',
    fontSize: 14,
    wordWrap: 'on',
    minimap: true,
    lineNumbers: 'on',
    tabSize: 2,
    autoSave: true,
    autoSaveDelay: 1000
  })

  // Initialize with default file if no files provided
  useEffect(() => {
    if (files.length === 0 && !activeFile) {
      const defaultFile: CodeFile = {
        id: 'default',
        name: 'index.html',
        content: '<!DOCTYPE html>\n<html>\n<head>\n  <title>New Project</title>\n</head>\n<body>\n  <h1>Hello World!</h1>\n</body>\n</html>',
        language: 'html',
        isDirty: false
      }
      setEditorFiles([defaultFile])
      setActiveFile(defaultFile)
    } else if (files.length > 0 && !activeFile) {
      setActiveFile(files[0])
    }
  }, [files, activeFile])

  // Auto-save functionality
  useEffect(() => {
    if (!settings.autoSave || !activeFile?.isDirty) return

    const timer = setTimeout(() => {
      if (activeFile && activeFile.isDirty) {
        handleSave(activeFile)
      }
    }, settings.autoSaveDelay)

    return () => clearTimeout(timer)
  }, [activeFile?.content, settings.autoSave, settings.autoSaveDelay])

  const handleEditorDidMount = (editor: any, monaco: any) => {
    editorRef.current = editor
    
    // Configure editor
    editor.updateOptions({
      fontSize: settings.fontSize,
      wordWrap: settings.wordWrap,
      minimap: { enabled: settings.minimap },
      lineNumbers: settings.lineNumbers,
      tabSize: settings.tabSize,
      readOnly: readOnly
    })

    // Add keyboard shortcuts
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      if (activeFile) handleSave(activeFile)
    })
    
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyR, () => {
      if (activeFile) handleRun()
    })
    
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyF, () => {
      setShowSearch(true)
    })
  }

  const handleFileChange = (value: string | undefined) => {
    if (!activeFile || value === undefined) return

    const updatedFile = { ...activeFile, content: value, isDirty: true }
    setActiveFile(updatedFile)
    
    const updatedFiles = editorFiles.map(file => 
      file.id === activeFile.id ? updatedFile : file
    )
    setEditorFiles(updatedFiles)
    onFilesChange?.(updatedFiles)
  }

  const handleSave = useCallback((file?: CodeFile) => {
    const fileToSave = file || activeFile
    if (!fileToSave) return

    const updatedFile = { ...fileToSave, isDirty: false }
    setActiveFile(updatedFile)
    
    const updatedFiles = editorFiles.map(f => 
      f.id === fileToSave.id ? updatedFile : f
    )
    setEditorFiles(updatedFiles)
    onFilesChange?.(updatedFiles)
    onSave?.(updatedFile)
  }, [activeFile, editorFiles, onFilesChange, onSave])

  const handleRun = useCallback(() => {
    if (!activeFile) return

    setIsRunning(true)
    setTerminalOutput([`Running ${activeFile.name}...`])

    try {
      if (onRun) {
        onRun(activeFile.content, activeFile.language)
      } else {
        // Default run behavior
        generatePreview()
        setTerminalOutput(prev => [...prev, '✅ Code executed successfully'])
      }
    } catch (error) {
      setTerminalOutput(prev => [...prev, `❌ Error: ${error}`])
    } finally {
      setIsRunning(false)
    }
  }, [activeFile, onRun])

  const generatePreview = useCallback(() => {
    if (!activeFile) return

    try {
      setPreviewError('')
      
      const language = activeFile.language.toLowerCase()
      let htmlContent = ''

      if (language === 'html') {
        htmlContent = activeFile.content
      } else if (language === 'javascript' || language === 'typescript') {
        htmlContent = `<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Inter', sans-serif; padding: 20px; background: #f8fafc; }
    .output { background: white; padding: 15px; border-radius: 8px; margin: 10px 0; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    .error { background: #fef2f2; color: #dc2626; padding: 10px; border-radius: 4px; }
  </style>
</head>
<body>
  <div id="app"></div>
  <script>
    try {
      ${activeFile.content}
      if (typeof result !== 'undefined') {
        document.getElementById('app').innerHTML = '<div class="output">✅ ' + result + '</div>';
      } else {
        document.getElementById('app').innerHTML = '<div class="output">✅ Code executed successfully!</div>';
      }
    } catch (error) {
      document.getElementById('app').innerHTML = '<div class="error">❌ Error: ' + error.message + '</div>';
    }
  </script>
</body>
</html>`
      } else if (language === 'css') {
        htmlContent = `<!DOCTYPE html>
<html>
<head>
  <style>
    ${activeFile.content}
    body { font-family: 'Inter', sans-serif; padding: 20px; background: #f8fafc; }
    .demo { background: white; padding: 20px; border-radius: 8px; margin: 10px 0; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    h1 { color: #1f2937; margin-bottom: 1rem; }
    p { color: #6b7280; margin-bottom: 1rem; }
    button { background: #3b82f6; color: white; padding: 8px 16px; border-radius: 4px; border: none; cursor: pointer; }
    button:hover { background: #2563eb; }
  </style>
</head>
<body>
  <div class="demo">
    <h1>CSS Preview</h1>
    <p>This is a demo element to test your CSS styles.</p>
    <button>Test Button</button>
    <div>Another div element</div>
  </div>
</body>
</html>`
      } else {
        htmlContent = `<div style="padding: 20px; font-family: 'Inter', sans-serif;">
          <h2>Preview not available for ${language}</h2>
          <p>Try HTML, CSS, or JavaScript files for live preview.</p>
        </div>`
      }

      setPreviewContent(htmlContent)
    } catch (error) {
      setPreviewError('Error generating preview')
      setPreviewContent('')
    }
  }, [activeFile])

  const createNewFile = () => {
    const newFile: CodeFile = {
      id: `file-${Date.now()}`,
      name: 'untitled.js',
      content: '',
      language: 'javascript',
      isDirty: false,
      isTemporary: true
    }
    
    setEditorFiles([...editorFiles, newFile])
    setActiveFile(newFile)
  }

  const deleteFile = (fileId: string) => {
    if (editorFiles.length <= 1) return

    const updatedFiles = editorFiles.filter(f => f.id !== fileId)
    setEditorFiles(updatedFiles)
    
    if (activeFile?.id === fileId) {
      setActiveFile(updatedFiles[0])
    }
    
    onFilesChange?.(updatedFiles)
  }

  const duplicateFile = (file: CodeFile) => {
    const duplicatedFile: CodeFile = {
      ...file,
      id: `file-${Date.now()}`,
      name: `${file.name.split('.')[0]}-copy.${file.name.split('.')[1]}`,
      isDirty: false
    }
    
    setEditorFiles([...editorFiles, duplicatedFile])
    setActiveFile(duplicatedFile)
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files) return

    Array.from(files).forEach(file => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const content = e.target?.result as string
        const language = getFileLanguage(file.name)
        
        const newFile: CodeFile = {
          id: `file-${Date.now()}`,
          name: file.name,
          content,
          language,
          isDirty: false
        }
        
        setEditorFiles(prev => [...prev, newFile])
      }
      reader.readAsText(file)
    })
  }

  const getFileLanguage = (filename: string): string => {
    const extension = filename.split('.').pop()?.toLowerCase()
    switch (extension) {
      case 'js': return 'javascript'
      case 'ts': return 'typescript'
      case 'html': return 'html'
      case 'css': return 'css'
      case 'json': return 'json'
      case 'xml': return 'xml'
      case 'md': return 'markdown'
      default: return 'plaintext'
    }
  }

  const downloadFile = (file: CodeFile) => {
    const blob = new Blob([file.content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = file.name
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const downloadAllFiles = () => {
    editorFiles.forEach(file => downloadFile(file))
  }

  // Generate preview when active file changes
  useEffect(() => {
    if (activeFile && showPreviewPanel) {
      generatePreview()
    }
  }, [activeFile, showPreviewPanel, generatePreview])

  return (
    <div className={`bg-gray-900 border border-gray-700 rounded-lg overflow-hidden ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 px-4 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* File Tabs */}
            <div className="flex items-center space-x-1">
              {editorFiles.map((file) => (
                <button
                  key={file.id}
                  onClick={() => setActiveFile(file)}
                  className={`px-3 py-1 rounded text-sm flex items-center space-x-2 transition-colors ${
                    activeFile?.id === file.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  <span>{file.name}</span>
                  {file.isDirty && <div className="w-2 h-2 bg-yellow-400 rounded-full" />}
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      deleteFile(file.id)
                    }}
                    className="ml-1 text-gray-400 hover:text-red-400"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </button>
              ))}
              
              <button
                onClick={createNewFile}
                className="px-2 py-1 bg-gray-700 text-gray-300 hover:bg-gray-600 rounded text-sm"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Action Buttons */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded"
              title="Upload Files"
            >
              <Upload className="w-4 h-4" />
            </button>
            
            <button
              onClick={downloadAllFiles}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded"
              title="Download All"
            >
              <Download className="w-4 h-4" />
            </button>
            
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded"
              title="Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
            
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded"
              title="Toggle Fullscreen"
            >
              {isFullscreen ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      <div className="flex" style={{ height: isFullscreen ? 'calc(100vh - 60px)' : height }}>
        {/* Editor */}
        <div className="flex-1">
          {activeFile ? (
            <Editor
              height="100%"
              language={activeFile.language}
              value={activeFile.content}
              onChange={handleFileChange}
              theme={settings.theme}
              onMount={handleEditorDidMount}
              options={{
                readOnly,
                fontSize: settings.fontSize,
                wordWrap: settings.wordWrap,
                minimap: { enabled: settings.minimap },
                lineNumbers: settings.lineNumbers,
                tabSize: settings.tabSize
              }}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">
              <div className="text-center">
                <FileText className="w-12 h-12 mx-auto mb-4" />
                <p>No file selected</p>
                <button
                  onClick={createNewFile}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Create New File
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Preview Panel */}
        {showPreviewPanel && (
          <div className="w-1/2 border-l border-gray-700 bg-white">
            <div className="bg-gray-800 border-b border-gray-700 px-4 py-2 flex items-center justify-between">
              <span className="text-white text-sm font-medium">Live Preview</span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={generatePreview}
                  className="p-1 text-gray-400 hover:text-white"
                  title="Refresh Preview"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setShowPreviewPanel(false)}
                  className="p-1 text-gray-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            {previewError ? (
              <div className="p-4 text-red-600 bg-red-50">
                {previewError}
              </div>
            ) : (
              <iframe
                srcDoc={previewContent}
                className="w-full h-full border-0"
                title="Preview"
                sandbox="allow-scripts allow-same-origin"
              />
            )}
          </div>
        )}

        {/* Terminal Panel */}
        {showTerminalPanel && (
          <div className="w-80 border-l border-gray-700 bg-gray-900">
            <div className="bg-gray-800 border-b border-gray-700 px-4 py-2 flex items-center justify-between">
              <span className="text-white text-sm font-medium">Terminal</span>
              <button
                onClick={() => setShowTerminalPanel(false)}
                className="p-1 text-gray-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 font-mono text-sm text-green-400 h-48 overflow-y-auto">
              {terminalOutput.map((output, index) => (
                <div key={index}>{output}</div>
              ))}
              {isRunning && (
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                  Running...
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Bar */}
      <div className="bg-gray-800 border-t border-gray-700 px-4 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowPreviewPanel(!showPreviewPanel)}
              className={`px-3 py-1 rounded text-sm flex items-center space-x-1 ${
                showPreviewPanel ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'
              }`}
            >
              <Eye className="w-4 h-4" />
              Preview
            </button>
            
            <button
              onClick={() => setShowTerminalPanel(!showTerminalPanel)}
              className={`px-3 py-1 rounded text-sm flex items-center space-x-1 ${
                showTerminalPanel ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'
              }`}
            >
              <Terminal className="w-4 h-4" />
              Terminal
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => activeFile && handleSave(activeFile)}
              disabled={!activeFile?.isDirty}
              className="px-3 py-1 bg-green-600 text-white rounded text-sm flex items-center space-x-1 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4" />
              Save
            </button>
            
            <button
              onClick={handleRun}
              disabled={isRunning}
              className="px-3 py-1 bg-blue-600 text-white rounded text-sm flex items-center space-x-1 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Play className="w-4 h-4" />
              {isRunning ? 'Running...' : 'Run'}
            </button>
          </div>
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-96">
            <h3 className="text-white font-semibold mb-4">Editor Settings</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-gray-300 text-sm mb-2">Theme</label>
                <select
                  value={settings.theme}
                  onChange={(e) => setSettings({...settings, theme: e.target.value as any})}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                >
                  <option value="vs-dark">Dark</option>
                  <option value="light">Light</option>
                  <option value="dark">Dark (Legacy)</option>
                </select>
              </div>
              
              <div>
                <label className="block text-gray-300 text-sm mb-2">Font Size: {settings.fontSize}px</label>
                <input
                  type="range"
                  min="10"
                  max="24"
                  value={settings.fontSize}
                  onChange={(e) => setSettings({...settings, fontSize: parseInt(e.target.value)})}
                  className="w-full"
                />
              </div>
              
              <div>
                <label className="flex items-center space-x-2 text-gray-300">
                  <input
                    type="checkbox"
                    checked={settings.wordWrap === 'on'}
                    onChange={(e) => setSettings({...settings, wordWrap: e.target.checked ? 'on' : 'off'})}
                  />
                  <span className="text-sm">Word Wrap</span>
                </label>
              </div>
              
              <div>
                <label className="flex items-center space-x-2 text-gray-300">
                  <input
                    type="checkbox"
                    checked={settings.minimap}
                    onChange={(e) => setSettings({...settings, minimap: e.target.checked})}
                  />
                  <span className="text-sm">Show Minimap</span>
                </label>
              </div>
              
              <div>
                <label className="flex items-center space-x-2 text-gray-300">
                  <input
                    type="checkbox"
                    checked={settings.autoSave}
                    onChange={(e) => setSettings({...settings, autoSave: e.target.checked})}
                  />
                  <span className="text-sm">Auto Save</span>
                </label>
              </div>
            </div>
            
            <div className="flex justify-end space-x-2 mt-6">
              <button
                onClick={() => setShowSettings(false)}
                className="px-4 py-2 bg-gray-700 text-gray-300 rounded hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowSettings(false)}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
