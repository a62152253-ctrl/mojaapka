import React, { useState, useEffect, useRef, useCallback } from 'react'
import Editor from '@monaco-editor/react'
import { 
  FileText, Plus, X, Play, Save, Download, Upload, Settings, 
  Copy, Trash2, FolderOpen, Maximize2, Minimize2, Eye, EyeOff,
  Search, Replace, GitBranch, Terminal, Code, CheckCircle, AlertCircle
} from 'lucide-react'
import { CodeFile, EditorSettings, PreviewConfig, ErrorInfo } from './CodeEditorTypes'
import { editorThemes, getThemeByName, defineCustomThemes } from './CodeEditorThemes'
import { getLanguageByExtension } from './CodeEditorLanguages'
import {
  createNewFile, validateFileName, debounce, exportFiles, importFiles,
  downloadFilesAsZip, downloadFile, parseErrors, generatePreviewHtml,
  getDefaultSettings, saveSettingsToStorage, loadSettingsFromStorage,
  saveFilesToStorage, loadFilesFromStorage, copyToClipboard, getFileStats
} from './CodeEditorUtils'
import { monacoExtensions } from './MonacoExtensions'
import { prettierFormatter } from './PrettierFormatter'
import { eslintIntegration } from './ESLintIntegration'

interface EnhancedCodeEditorProps {
  initialFiles?: CodeFile[]
  height?: string
  showPreview?: boolean
  onFilesChange?: (files: CodeFile[]) => void
  readOnly?: boolean
  className?: string
}

const EnhancedCodeEditor: React.FC<EnhancedCodeEditorProps> = ({
  initialFiles = [],
  height = '100vh',
  showPreview = true,
  onFilesChange,
  readOnly = false,
  className = ''
}) => {
  const [files, setFiles] = useState<CodeFile[]>(() => {
    const savedFiles = loadFilesFromStorage()
    return savedFiles.length > 0 ? savedFiles : initialFiles.length > 0 ? initialFiles : [
      createNewFile('index.html'),
      createNewFile('style.css'),
      createNewFile('script.js')
    ]
  })
  
  const [activeFileId, setActiveFileId] = useState<string | null>(files[0]?.id || null)
  const [settings, setSettings] = useState<EditorSettings>(loadSettingsFromStorage())
  const [previewConfig, setPreviewConfig] = useState<PreviewConfig>({
    enabled: showPreview,
    autoRefresh: true,
    refreshDelay: 500,
    sandbox: ['allow-scripts', 'allow-same-origin', 'allow-forms'],
    scale: 1,
    position: 'right'
  })
  const [previewHtml, setPreviewHtml] = useState<string>('')
  const [errors, setErrors] = useState<ErrorInfo[]>([])
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [showSearch, setShowSearch] = useState(false)
  const [isPreviewVisible, setIsPreviewVisible] = useState(true)
  
  const editorRef = useRef<any>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const activeFile = files.find(f => f.id === activeFileId)

  // Auto-save files to localStorage
  const debouncedSave = useCallback(
    debounce((filesToSave: CodeFile[]) => {
      saveFilesToStorage(filesToSave)
      onFilesChange?.(filesToSave)
    }, 1000),
    [onFilesChange]
  )

  useEffect(() => {
    debouncedSave(files)
  }, [files, debouncedSave])

  // Auto-generate preview
  const debouncedPreview = useCallback(
    debounce(() => {
      if (previewConfig.autoRefresh && previewConfig.enabled) {
        const html = generatePreviewHtml(files)
        setPreviewHtml(html)
      }
    }, previewConfig.refreshDelay),
    [files, previewConfig.autoRefresh, previewConfig.refreshDelay, previewConfig.enabled]
  )

  useEffect(() => {
    debouncedPreview()
  }, [files, debouncedPreview])

  // Initialize preview on mount
  useEffect(() => {
    if (previewConfig.enabled) {
      const html = generatePreviewHtml(files)
      setPreviewHtml(html)
    }
  }, [])

  const handleEditorDidMount = useCallback((editor: any, monaco: any) => {
    editorRef.current = editor
    
    // Define custom themes
    defineCustomThemes(monaco)
    
    // Setup Monaco extensions
    monacoExtensions.setupAllExtensions(monaco)
    
    // Setup Prettier formatter
    prettierFormatter.setupDocumentFormatter(monaco)
    
    // Setup ESLint integration
    eslintIntegration.setupESLintDiagnostics(monaco)
    
    // Configure editor
    editor.updateOptions({
      fontSize: settings.fontSize,
      wordWrap: settings.wordWrap,
      minimap: { enabled: settings.minimap },
      lineNumbers: settings.lineNumbers,
      tabSize: settings.tabSize,
      insertSpaces: settings.insertSpaces,
      automaticLayout: true,
      readOnly: readOnly,
      fontFamily: settings.fontFamily,
      fontWeight: settings.fontWeight,
      lineHeight: settings.lineHeight,
      letterSpacing: settings.letterSpacing,
      formatOnPaste: true,
      formatOnType: true
    })

    // Set theme and language
    const theme = getThemeByName(settings.theme)
    editor.setModelLanguage(editor.getModel(), activeFile?.language || 'javascript')
    
    // Error handling
    monaco.editor.onDidChangeMarkers(() => {
      const markers = monaco.editor.getModelMarkers({ resource: editor.getModel().uri })
      setErrors(parseErrors(markers))
    })

    // Add keyboard shortcuts
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyF, () => {
      editor.getAction('editor.action.formatDocument').run()
    })
    
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyL, () => {
      editor.getAction('editor.action.startFindReplaceAction').run()
    })
  }, [settings, readOnly, activeFile])

  const handleEditorChange = useCallback((value: string | undefined) => {
    if (!activeFile || value === undefined) return
    
    const updatedFiles = files.map(file => 
      file.id === activeFile.id 
        ? { ...file, content: value, isDirty: true, modifiedAt: new Date() }
        : file
    )
    setFiles(updatedFiles)
  }, [activeFile, files])

  const addNewFile = useCallback(() => {
    const fileName = prompt('Enter file name (e.g., about.html):')
    if (!fileName) return
    
    const validationError = validateFileName(fileName, files)
    if (validationError) {
      alert(validationError)
      return
    }
    
    const newFile = createNewFile(fileName)
    setFiles([...files, newFile])
    setActiveFileId(newFile.id)
  }, [files])

  const deleteFile = useCallback((fileId: string) => {
    if (files.length <= 1) {
      alert('Cannot delete the last file')
      return
    }
    
    const newFiles = files.filter(f => f.id !== fileId)
    setFiles(newFiles)
    
    if (activeFileId === fileId) {
      setActiveFileId(newFiles[0]?.id || null)
    }
  }, [files, activeFileId])

  const duplicateFile = useCallback((file: CodeFile) => {
    const newName = prompt('Enter new file name:', file.name.replace(/\.[^/.]+$/, '-copy$&'))
    if (!newName) return
    
    const validationError = validateFileName(newName, files)
    if (validationError) {
      alert(validationError)
      return
    }
    
    const newFile = createNewFile(newName, file.content)
    setFiles([...files, newFile])
    setActiveFileId(newFile.id)
  }, [files])

  const exportProject = useCallback(() => {
    const data = exportFiles(files)
    downloadFile(data, 'project.json', 'application/json')
  }, [files])

  const importProject = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    
    const reader = new FileReader()
    reader.onload = (e) => {
      const content = e.target?.result as string
      const importedFiles = importFiles(content)
      if (importedFiles.length > 0) {
        setFiles(importedFiles)
        setActiveFileId(importedFiles[0].id)
      }
    }
    reader.readAsText(file)
  }, [])

  const downloadAllFiles = useCallback(() => {
    downloadFilesAsZip(files)
  }, [files])

  const copyCode = useCallback(async () => {
    if (!activeFile) return
    const success = await copyToClipboard(activeFile.content)
    if (success) {
      // Show success message
      console.log('Code copied to clipboard')
    }
  }, [activeFile])

  const refreshPreview = useCallback(() => {
    const html = generatePreviewHtml(files)
    setPreviewHtml(html)
  }, [files])

  const updateSettings = useCallback((newSettings: Partial<EditorSettings>) => {
    const updatedSettings = { ...settings, ...newSettings }
    setSettings(updatedSettings)
    saveSettingsToStorage(updatedSettings)
  }, [settings])

  const stats = activeFile ? getFileStats(activeFile.content) : { lines: 0, words: 0, characters: 0, size: '0 Bytes' }

  return (
    <div className={`flex h-screen bg-gray-900 ${className} ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
      {/* File Sidebar */}
      <div className="w-64 bg-gray-800 border-r border-gray-700 flex flex-col">
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold flex items-center">
              <FolderOpen className="w-4 h-4 mr-2" />
              Files
            </h3>
            <div className="flex items-center space-x-2">
              <button
                onClick={addNewFile}
                className="text-gray-400 hover:text-white transition-colors"
                title="New File"
              >
                <Plus className="w-4 h-4" />
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="text-gray-400 hover:text-white transition-colors"
                title="Import Project"
              >
                <Upload className="w-4 h-4" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={importProject}
                className="hidden"
              />
            </div>
          </div>
          
          <div className="space-y-1 max-h-96 overflow-y-auto">
            {files.map((file) => (
              <div
                key={file.id}
                className={`flex items-center justify-between p-2 rounded cursor-pointer transition-colors group ${
                  file.id === activeFileId 
                    ? 'bg-gray-700 text-white' 
                    : 'text-gray-400 hover:bg-gray-700 hover:text-white'
                }`}
                onClick={() => setActiveFileId(file.id)}
              >
                <div className="flex items-center flex-1 min-w-0">
                  <FileText className="w-4 h-4 mr-2 flex-shrink-0" />
                  <span className="text-sm truncate">{file.name}</span>
                  {file.isDirty && (
                    <div className="w-2 h-2 bg-yellow-400 rounded-full ml-2 flex-shrink-0" />
                  )}
                </div>
                <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      duplicateFile(file)
                    }}
                    className="text-gray-500 hover:text-blue-400 transition-colors"
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
                      className="text-gray-500 hover:text-red-400 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* File Stats */}
        <div className="p-4 border-b border-gray-700">
          <div className="text-xs text-gray-400 space-y-1">
            <div>Lines: {stats.lines}</div>
            <div>Words: {stats.words}</div>
            <div>Size: {stats.size}</div>
          </div>
        </div>

        {/* Actions */}
        <div className="p-4 space-y-2 mt-auto">
          <button
            onClick={downloadAllFiles}
            className="w-full flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-sm transition-colors"
          >
            <Download className="w-4 h-4 mr-2" />
            Download All
          </button>
          <button
            onClick={exportProject}
            className="w-full flex items-center justify-center bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded text-sm transition-colors"
          >
            <Save className="w-4 h-4 mr-2" />
            Export Project
          </button>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="w-full flex items-center justify-center bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded text-sm transition-colors"
          >
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </button>
        </div>
      </div>

      {/* Main Editor Area */}
      <div className="flex-1 flex flex-col">
        {/* Editor Header */}
        <div className="bg-gray-800 border-b border-gray-700 px-4 py-2 flex items-center justify-between">
          <div className="flex items-center">
            <Code className="w-4 h-4 mr-2 text-gray-400" />
            <span className="text-white font-medium">{activeFile?.name || 'No file selected'}</span>
            <span className="ml-2 text-xs text-gray-400">({activeFile?.language})</span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={copyCode}
              className="text-gray-400 hover:text-white transition-colors"
              title="Copy Code"
            >
              <Copy className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="text-gray-400 hover:text-white transition-colors"
              title="Toggle Fullscreen"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setShowSearch(!showSearch)}
              className="text-gray-400 hover:text-white transition-colors"
              title="Search"
            >
              <Search className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Search Bar */}
        {showSearch && (
          <div className="bg-gray-700 border-b border-gray-600 px-4 py-2 flex items-center space-x-2">
            <Search className="w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search in file..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-gray-600 text-white px-3 py-1 rounded text-sm outline-none"
            />
            <button
              onClick={() => setShowSearch(false)}
              className="text-gray-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Code Editor */}
        <div className="flex-1">
          {activeFile ? (
            <Editor
              height="100%"
              width="100%"
              language={activeFile.language}
              value={activeFile.content}
              theme={getThemeByName(settings.theme).monacoTheme}
              onChange={handleEditorChange}
              onMount={handleEditorDidMount}
              options={{
                selectOnLineNumbers: true,
                automaticLayout: true,
                readOnly: readOnly,
                fontSize: settings.fontSize,
                wordWrap: settings.wordWrap,
                minimap: { enabled: settings.minimap },
                lineNumbers: settings.lineNumbers,
                tabSize: settings.tabSize,
                insertSpaces: settings.insertSpaces,
                fontFamily: settings.fontFamily,
                fontWeight: settings.fontWeight,
                lineHeight: settings.lineHeight,
                letterSpacing: settings.letterSpacing,
                scrollBeyondLastLine: false,
                renderWhitespace: 'selection',
                bracketPairColorization: { enabled: true },
                guides: {
                  bracketPairs: true,
                  indentation: true
                }
              }}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              <div className="text-center">
                <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Select a file to start editing</p>
              </div>
            </div>
          )}
        </div>

        {/* Error Panel */}
        {errors.length > 0 && (
          <div className="bg-red-900 border-t border-red-700 px-4 py-2 max-h-32 overflow-y-auto">
            <div className="flex items-center mb-2">
              <AlertCircle className="w-4 h-4 mr-2 text-red-400" />
              <span className="text-red-400 text-sm font-medium">Errors ({errors.length})</span>
            </div>
            {errors.map((error, index) => (
              <div key={index} className="text-xs text-red-300 mb-1">
                Line {error.line}: {error.message}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Preview Panel */}
      {previewConfig.enabled && (
        <div className="w-1/2 bg-white border-l border-gray-300 flex flex-col">
          <div className="bg-gray-100 border-b border-gray-300 px-4 py-2 flex items-center justify-between">
            <div className="flex items-center">
              <Eye className="w-4 h-4 mr-2 text-gray-600" />
              <h3 className="font-semibold text-gray-700">Live Preview</h3>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsPreviewVisible(!isPreviewVisible)}
                className="p-1 text-gray-600 hover:text-gray-800 transition-colors"
                title={isPreviewVisible ? 'Hide Preview' : 'Show Preview'}
              >
                {isPreviewVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
              <button
                onClick={refreshPreview}
                className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                Refresh
              </button>
            </div>
          </div>
          
          <div className="flex-1 relative">
            {isPreviewVisible ? (
              <iframe
                srcDoc={previewHtml}
                className="w-full h-full border-0"
                title="Live Preview"
                sandbox={previewConfig.sandbox.join(' ')}
              />
            ) : (
              <div className="h-full flex items-center justify-center bg-gray-50">
                <div className="text-center">
                  <EyeOff className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-500">Preview is hidden</p>
                  <button
                    onClick={() => setIsPreviewVisible(true)}
                    className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                  >
                    Show Preview
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-h-screen overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Editor Settings</h3>
              <button
                onClick={() => setShowSettings(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Theme</label>
                <select
                  value={settings.theme}
                  onChange={(e) => updateSettings({ theme: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  {editorThemes.map(theme => (
                    <option key={theme.value} value={theme.value}>
                      {theme.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Font Size</label>
                <input
                  type="range"
                  min="10"
                  max="24"
                  value={settings.fontSize}
                  onChange={(e) => updateSettings({ fontSize: parseInt(e.target.value) })}
                  className="w-full"
                />
                <span className="text-xs text-gray-500">{settings.fontSize}px</span>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tab Size</label>
                <input
                  type="number"
                  min="1"
                  max="8"
                  value={settings.tabSize}
                  onChange={(e) => updateSettings({ tabSize: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="wordWrap"
                  checked={settings.wordWrap === 'on'}
                  onChange={(e) => updateSettings({ wordWrap: e.target.checked ? 'on' : 'off' })}
                  className="mr-2"
                />
                <label htmlFor="wordWrap" className="text-sm text-gray-700">Word Wrap</label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="minimap"
                  checked={settings.minimap}
                  onChange={(e) => updateSettings({ minimap: e.target.checked })}
                  className="mr-2"
                />
                <label htmlFor="minimap" className="text-sm text-gray-700">Show Minimap</label>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default EnhancedCodeEditor
