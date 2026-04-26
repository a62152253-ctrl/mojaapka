export interface CodeFile {
  id: string
  name: string
  content: string
  language: string
  path?: string
  isDirty?: boolean
  createdAt?: Date
  modifiedAt?: Date
}

export interface EditorTheme {
  name: string
  value: string
  monacoTheme: string
  colors: {
    background: string
    foreground: string
    selection: string
    cursor: string
    lineNumbers: string
  }
}

export interface EditorSettings {
  fontSize: number
  wordWrap: 'on' | 'off' | 'wordWrapColumn' | 'bounded'
  minimap: boolean
  lineNumbers: 'on' | 'off' | 'relative' | 'interval'
  tabSize: number
  insertSpaces: boolean
  autoIndent: 'none' | 'keep' | 'brackets' | 'advanced' | 'full'
  theme: string
  fontFamily: string
  fontWeight: string
  lineHeight: number
  letterSpacing: number
}

export interface LanguageConfig {
  id: string
  name: string
  extensions: string[]
  mimetypes: string[]
  aliases: string[]
  defaultContent?: string
  snippets?: CodeSnippet[]
}

export interface CodeSnippet {
  name: string
  code: string
  description?: string
}

export interface EditorAction {
  id: string
  name: string
  icon: string
  shortcut?: string
  handler: () => void
  disabled?: boolean
}

export interface PreviewConfig {
  enabled: boolean
  autoRefresh: boolean
  refreshDelay: number
  sandbox: string[]
  scale: number
  position: 'right' | 'bottom' | 'popup'
}

export interface ErrorInfo {
  line: number
  column: number
  message: string
  severity: 'error' | 'warning' | 'info'
  source?: string
}

export interface EditorState {
  files: CodeFile[]
  activeFileId: string | null
  settings: EditorSettings
  preview: PreviewConfig
  errors: ErrorInfo[]
  isFullscreen: boolean
  isLoading: boolean
}

export type FileType = 'html' | 'css' | 'javascript' | 'typescript' | 'json' | 'xml' | 'markdown' | 'text'

export interface FileTemplate {
  name: string
  type: FileType
  content: string
  description: string
}
