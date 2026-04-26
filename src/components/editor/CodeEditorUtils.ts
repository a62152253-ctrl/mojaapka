import { CodeFile, EditorSettings, ErrorInfo } from './CodeEditorTypes'
import { getLanguageByExtension, getLanguageConfig } from './CodeEditorLanguages'

export const generateUniqueId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

export const createNewFile = (name: string, content: string = ''): CodeFile => {
  const language = getLanguageByExtension(name)
  const languageConfig = getLanguageConfig(language)
  return {
    id: generateUniqueId(),
    name,
    content: content || languageConfig?.defaultContent || '',
    language,
    isDirty: false,
    createdAt: new Date(),
    modifiedAt: new Date()
  }
}

export const validateFileName = (name: string, existingFiles: CodeFile[]): string | null => {
  if (!name.trim()) {
    return 'File name cannot be empty'
  }
  
  if (existingFiles.some(file => file.name === name)) {
    return 'File with this name already exists'
  }
  
  const invalidChars = /[<>:"/\\|?*]/
  if (invalidChars.test(name)) {
    return 'File name contains invalid characters'
  }
  
  return null
}

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

export const exportFiles = (files: CodeFile[]): string => {
  const zip = {} as Record<string, string>
  
  files.forEach(file => {
    zip[file.name] = file.content
  })
  
  return JSON.stringify(zip, null, 2)
}

export const importFiles = (jsonString: string): CodeFile[] => {
  try {
    const imported = JSON.parse(jsonString) as Record<string, string>
    return Object.entries(imported).map(([name, content]) => 
      createNewFile(name, content)
    )
  } catch (error) {
    console.error('Failed to import files:', error)
    return []
  }
}

export const downloadFile = (content: string, filename: string, mimeType: string = 'text/plain') => {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  
  URL.revokeObjectURL(url)
}

export const downloadFilesAsZip = async (files: CodeFile[]) => {
  // In a real implementation, you would use a library like JSZip
  // For now, we'll download each file individually
  files.forEach(file => {
    const mimeType = getMimeType(file.language)
    downloadFile(file.content, file.name, mimeType)
  })
}

export const getMimeType = (language: string): string => {
  const mimeTypes: Record<string, string> = {
    html: 'text/html',
    css: 'text/css',
    javascript: 'text/javascript',
    typescript: 'text/typescript',
    json: 'application/json',
    markdown: 'text/markdown',
    xml: 'text/xml'
  }
  
  return mimeTypes[language] || 'text/plain'
}

export const parseErrors = (errors: any[]): ErrorInfo[] => {
  return errors.map(error => ({
    line: error.startLineNumber || error.line || 0,
    column: error.startColumn || error.column || 0,
    message: error.message || 'Unknown error',
    severity: error.severity || 'error',
    source: error.source || 'linter'
  }))
}

export const generatePreviewHtml = (files: CodeFile[]): string => {
  const htmlFile = files.find(file => file.language === 'html')
  const cssFile = files.find(file => file.language === 'css')
  const jsFile = files.find(file => file.language === 'javascript' || file.language === 'typescript')
  
  let html = htmlFile?.content || '<html><body></body></html>'
  
  // Inject CSS if exists
  if (cssFile) {
    const styleTag = `<style>\n${cssFile.content}\n</style>`
    html = html.replace('</head>', `${styleTag}</head>`) || `${styleTag}${html}`
  }
  
  // Inject JS if exists
  if (jsFile) {
    const scriptTag = `<script>\n${jsFile.content}\n</script>`
    html = html.replace('</body>', `${scriptTag}</body>`) || `${html}${scriptTag}`
  }
  
  return html
}

export const getDefaultSettings = (): EditorSettings => ({
  fontSize: 14,
  wordWrap: 'on',
  minimap: true,
  lineNumbers: 'on',
  tabSize: 2,
  insertSpaces: true,
  autoIndent: 'advanced',
  theme: 'dark',
  fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
  fontWeight: 'normal',
  lineHeight: 1.4,
  letterSpacing: 0
})

export const saveSettingsToStorage = (settings: EditorSettings): void => {
  try {
    localStorage.setItem('codeEditorSettings', JSON.stringify(settings))
  } catch (error) {
    console.error('Failed to save settings:', error)
  }
}

export const loadSettingsFromStorage = (): EditorSettings => {
  try {
    const saved = localStorage.getItem('codeEditorSettings')
    if (saved) {
      return { ...getDefaultSettings(), ...JSON.parse(saved) }
    }
  } catch (error) {
    console.error('Failed to load settings:', error)
  }
  
  return getDefaultSettings()
}

export const saveFilesToStorage = (files: CodeFile[]): void => {
  try {
    const filesData = files.map(({ id, name, content, language, isDirty }) => ({
      id, name, content, language, isDirty
    }))
    localStorage.setItem('codeEditorFiles', JSON.stringify(filesData))
  } catch (error) {
    console.error('Failed to save files:', error)
  }
}

export const loadFilesFromStorage = (): CodeFile[] => {
  try {
    const saved = localStorage.getItem('codeEditorFiles')
    if (saved) {
      const filesData = JSON.parse(saved)
      return filesData.map((file: any) => ({
        ...file,
        createdAt: new Date(file.createdAt || Date.now()),
        modifiedAt: new Date(file.modifiedAt || Date.now())
      }))
    }
  } catch (error) {
    console.error('Failed to load files:', error)
  }
  
  return []
}

export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch (error) {
    // Fallback for older browsers
    const textArea = document.createElement('textarea')
    textArea.value = text
    document.body.appendChild(textArea)
    textArea.select()
    
    try {
      document.execCommand('copy')
      return true
    } catch (error) {
      return false
    } finally {
      document.body.removeChild(textArea)
    }
  }
}

export const getLineCount = (content: string): number => {
  return content.split('\n').length
}

export const getWordCount = (content: string): number => {
  return content.trim().split(/\s+/).filter(word => word.length > 0).length
}

export const getCharacterCount = (content: string): number => {
  return content.length
}

export const getFileStats = (content: string) => ({
  lines: getLineCount(content),
  words: getWordCount(content),
  characters: getCharacterCount(content),
  size: formatFileSize(new Blob([content]).size)
})
