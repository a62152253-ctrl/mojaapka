import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react'
import Editor from '@monaco-editor/react'
import { FileText, Plus, X, Play, Save, Download, Copy, RefreshCw } from 'lucide-react'
import { CodeFile } from './editor/CodeEditorTypes'
import { getThemeByName, defineCustomThemes } from './editor/CodeEditorThemes'
import LanguageSelector from './editor/LanguageSelector'
import { 
  loadFilesFromStorage, 
  createNewFile, 
  validateFileName, 
  debounce, 
  saveFilesToStorage, 
  copyToClipboard 
} from './editor/CodeEditorUtils'

interface CodeEditorProps {
  language?: string
  value?: string
  onChange?: (value: string) => void
  height?: string
  theme?: string
  readOnly?: boolean
  showPreview?: boolean
}

const CodeEditor: React.FC<CodeEditorProps> = ({
  language = 'javascript',
  value = '',
  onChange,
  height = '600px',
  theme = 'vs-dark',
  readOnly = false,
  showPreview = false
}) => {
  const editorRef = useRef<any>(null)
  const [previewContent, setPreviewContent] = useState<string>('')
  const [previewError, setPreviewError] = useState<string>('')

  const generatePreview = useCallback(() => {
    try {
      setPreviewError('')
      
      if (language === 'html') {
        setPreviewContent(value)
      } else if (language === 'javascript' || language === 'typescript') {
        const wrappedCode = `<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; padding: 20px; background: white; }
    .output { background: #f5f5f5; padding: 10px; border-radius: 4px; margin: 10px 0; }
  </style>
</head>
<body>
  <div id="app"></div>
  <script>
    try {
      ${value}
      document.getElementById('app').innerHTML = '<div class="output">JavaScript executed successfully!</div>';
    } catch (error) {
      document.getElementById('app').innerHTML = '<div class="output" style="color: red;">Error: ' + error.message + '</div>';
    }
  </script>
</body>
</html>`
        setPreviewContent(wrappedCode)
      } else if (language === 'css') {
        const wrappedCSS = `<!DOCTYPE html>
<html>
<head>
  <style>
    ${value}
    body { font-family: Arial, sans-serif; padding: 20px; }
    .demo { background: #f0f0f0; padding: 20px; border-radius: 8px; margin: 10px 0; }
    h1 { color: #333; }
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
        setPreviewContent(wrappedCSS)
      } else {
        setPreviewContent('<div style="padding: 20px; font-family: Arial;">Preview not available for ' + language + '</div>')
      }
    } catch (error) {
      setPreviewError('Error generating preview')
      setPreviewContent('')
    }
  }, [value, language])

  useEffect(() => {
    if (showPreview && value) {
      generatePreview()
    }
  }, [showPreview, value, generatePreview])

  const handleEditorDidMount = useCallback((editor: any, monaco: any) => {
    editorRef.current = editor
    
    defineCustomThemes(monaco)
    
    editor.updateOptions({
      fontSize: 16,
      wordWrap: 'on',
      minimap: { enabled: true },
      scrollBeyondLastLine: false,
      automaticLayout: true,
      readOnly: readOnly,
      theme: getThemeByName(theme).monacoTheme,
      lineNumbers: 'on',
      tabSize: 2,
      insertSpaces: true,
      renderWhitespace: 'selection',
      bracketPairColorization: { enabled: true },
      guides: {
        bracketPairs: true,
        indentation: true
      }
    })
  }, [readOnly, theme])

  const handleEditorChange = useCallback((value: string | undefined) => {
    if (onChange && value !== undefined) {
      onChange(value)
    }
  }, [onChange])

  const editorOptions = useMemo(() => ({
    selectOnLineNumbers: true,
    automaticLayout: true,
    readOnly: readOnly,
    fontSize: 14,
    fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
    wordWrap: 'on' as const,
    minimap: { enabled: true },
    scrollBeyondLastLine: false,
    roundedSelection: false,
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
    hover: { enabled: true },
    completionItems: { snippets: true },
    theme: theme === 'dark' ? 'vs-dark' : 'vs-light'
  }), [readOnly, theme])

  if (showPreview) {
    return (
      <div className="flex h-full" style={{ height }}>
        <div className="w-1/2 border-r border-gray-300">
          <div className="bg-gray-800 text-white px-4 py-2 text-sm font-semibold">
            Code Editor ({language})
          </div>
          <div style={{ height: 'calc(100% - 40px)' }}>
            <Editor
              height="100%"
              width="100%"
              language={language}
              value={value}
              theme={theme === 'dark' ? 'vs-dark' : 'vs-light'}
              onChange={handleEditorChange}
              onMount={handleEditorDidMount}
              options={editorOptions}
            />
          </div>
        </div>
        
        <div className="w-1/2 bg-white">
          <div className="bg-blue-600 text-white px-4 py-2 text-sm font-semibold flex items-center justify-between">
            <span>Live Preview</span>
            <button
              onClick={generatePreview}
              className="bg-blue-500 hover:bg-blue-400 px-3 py-1 rounded text-xs"
            >
              Refresh
            </button>
          </div>
          <div 
            className="overflow-auto"
            style={{ height: 'calc(100% - 40px)', backgroundColor: '#fff' }}
          >
            {previewError ? (
              <div className="p-4 text-red-600">
                Error: {previewError}
              </div>
            ) : (
              <iframe
                srcDoc={previewContent}
                className="w-full h-full border-0"
                title="Live Preview"
                sandbox="allow-scripts"
              />
            )}
          </div>
        </div>
      </div>
    )
  }
};

const CodeEditorComponent = () => {
  const [files, setFiles] = useState<CodeFile[]>(() => {
    const savedFiles = loadFilesFromStorage()
    return savedFiles.length > 0 ? savedFiles : [
      createNewFile('index.html'),
      createNewFile('style.css'),
      createNewFile('script.js')
    ]
  })
  
  const [activeFileIndex, setActiveFileIndex] = useState(0)
  const [previewHtml, setPreviewHtml] = useState('')
  const [isPreviewVisible, setIsPreviewVisible] = useState(true)
  const [currentLanguage, setCurrentLanguage] = useState('javascript')
  const [readOnly] = useState(false)

  const activeFile = files[activeFileIndex]

  const updateFileContent = useCallback((content: string) => {
    const newFiles = [...files]
    newFiles[activeFileIndex] = { ...activeFile, content }
    setFiles(newFiles)
    
    if (activeFile.name.endsWith('.html')) {
      setPreviewHtml(content)
    }
  }, [files, activeFileIndex, activeFile.name, setFiles, setPreviewHtml])

  const addNewFile = useCallback(() => {
    const fileName = prompt('Enter file name (e.g., about.html):')
    if (fileName) {
      const validationError = validateFileName(fileName, files)
      if (validationError) {
        alert(validationError)
        return
      }
      
      const newFile = createNewFile(fileName)
      setFiles(prev => [...prev, newFile])
      setActiveFileIndex(files.length)
    }
  }, [files, setFiles, setActiveFileIndex])

  const deleteFile = useCallback((index: number) => {
    if (files.length > 1) {
      const newFiles = files.filter((_, i) => i !== index)
      setFiles(newFiles)
      if (activeFileIndex >= newFiles.length) {
        setActiveFileIndex(newFiles.length - 1)
      }
    }
  }, [files, activeFileIndex, setFiles, setActiveFileIndex])

  const generatePreview = useCallback(() => {
    const htmlFile = files.find(f => f.name.endsWith('.html'))
    if (htmlFile) {
      setPreviewHtml(htmlFile.content)
      setIsPreviewVisible(true)
    }
  }, [files, setPreviewHtml, setIsPreviewVisible])

  const debouncedSave = useCallback(
    debounce((filesToSave: CodeFile[]) => {
      saveFilesToStorage(filesToSave)
    }, 1000),
    []
  )

  useEffect(() => {
    debouncedSave(files)
  }, [files, debouncedSave])

  const debouncedPreview = useCallback(
    debounce(() => {
      if (isPreviewVisible) {
        generatePreview()
      }
    }, 500),
    [isPreviewVisible, generatePreview]
  )

  useEffect(() => {
    debouncedPreview()
  }, [files, debouncedPreview])

  useEffect(() => {
    generatePreview()
  }, [generatePreview])

  return (
    <div className="flex h-screen bg-gray-900">
      {/* File Sidebar */}
      <div className="w-64 bg-gray-800 border-r border-gray-700">
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold">Files</h3>
            <button
              onClick={addNewFile}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          
          {/* Language Selector */}
          <div className="mb-4">
            <LanguageSelector
              selectedLanguage={currentLanguage}
              onLanguageChange={setCurrentLanguage}
              disabled={readOnly}
            />
          </div>
          
          <div className="space-y-1">
            {files.map((file, index) => (
              <div
                key={index}
                className={`flex items-center justify-between p-2 rounded cursor-pointer transition-colors ${
                  index === activeFileIndex 
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:bg-gray-700 hover:text-white'
                }`}
                onClick={() => setActiveFileIndex(index)}
              >
                <div className="flex items-center">
                  <FileText className="w-4 h-4 mr-2" />
                  <span className="text-sm">{file.name}</span>
                </div>
                {files.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteFile(index);
                    }}
                    className="text-gray-500 hover:text-red-400 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
        
        <div className="absolute bottom-4 left-4 right-4">
          <button
            onClick={() => {
              generatePreview()
              setIsPreviewVisible(true)
            }}
            className="w-full flex items-center justify-center bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded transition-colors"
          >
            <Play className="w-4 h-4 mr-2" />
            Show Preview
          </button>
        </div>
      </div>

      {/* Code Editor */}
      <div className="w-1/2 flex flex-col">
        <div className="bg-gray-800 border-b border-gray-700 px-4 py-2 flex items-center justify-between">
          <div className="flex items-center">
            <FileText className="w-4 h-4 mr-2" />
            <span className="text-white font-medium">{activeFile.name}</span>
          </div>
          <div className="flex items-center space-x-2">
            <button 
              onClick={async () => {
                const success = await copyToClipboard(activeFile.content)
                if (success) {
                  console.log('Code copied to clipboard')
                }
              }}
              className="text-gray-400 hover:text-white transition-colors"
              title="Copy Code"
            >
              <Save className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        <div className="flex-1">
          <textarea
            value={activeFile.content}
            onChange={(e) => updateFileContent(e.target.value)}
            className="w-full h-full bg-gray-900 text-green-400 font-mono text-sm resize-none outline-none p-4"
            style={{ 
              tabSize: 2,
              lineHeight: '1.5',
              fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace'
            }}
            spellCheck={false}
            placeholder={`Start coding in ${activeFile.language}...`}
          />
        </div>
      </div>

      {/* Live Preview */}
      <div className="w-1/2 bg-white border-l border-gray-300">
        <div className="bg-gray-100 border-b border-gray-300 px-4 py-2 flex items-center justify-between">
          <h3 className="font-semibold text-gray-700">Live Preview</h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsPreviewVisible(!isPreviewVisible)}
              className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
            >
              {isPreviewVisible ? 'Hide' : 'Show'}
            </button>
            <button
              onClick={generatePreview}
              className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              Refresh
            </button>
          </div>
        </div>
        <div className="h-full relative">
          {isPreviewVisible && (
            <div className="h-full">
              <iframe
                srcDoc={previewHtml}
                className="w-full h-full border-0"
                title="Live Preview"
                sandbox="allow-scripts allow-same-origin allow-forms"
              />
            </div>
          )}
          {!isPreviewVisible && (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <div className="text-6xl text-gray-400 mb-4">👁️</div>
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
    </div>
  )
}

export default CodeEditor
export { CodeEditorComponent }
