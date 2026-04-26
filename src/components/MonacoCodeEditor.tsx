import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Editor from '@monaco-editor/react'
import {
  Cloud,
  CloudCog,
  FileCode2,
  FileText,
  GitBranch,
  Globe,
  Link2,
  Plus,
  Radio,
  RefreshCw,
  Save,
  SearchCode,
  Sparkles,
  Users,
  Wifi,
  WifiOff,
  X,
} from 'lucide-react'
import { detectLanguage, languageConfigs, monacoExtensions } from './editor/MonacoExtensions'
import { defaultWorkspaceFiles, WorkspaceSeedFile } from '../data/developerWorkspace'
import { useAuth } from '../hooks/useAuth'
import GitIntegration from './GitIntegration'

interface CodeFile {
  id: string
  name: string
  content: string
  language: string
  updatedAt: string
  isDirty?: boolean
}

interface DeploymentPreview {
  id: string
  label: string
  url: string
  createdAt: string
  status: 'ready' | 'refreshing'
}

interface CollaboratorPresence {
  id: string
  name: string
  transport: 'broadcast' | 'websocket'
  lastSeen: string
}

interface CollaborationMessage {
  type: 'presence' | 'sync'
  workspace: string
  clientId: string
  name: string
  transport: 'broadcast' | 'websocket'
  sentAt: string
  files?: CodeFile[]
  activeFileId?: string | null
}

interface MonacoCodeEditorProps {
  projectId?: string
  theme?: string
  readOnly?: boolean
  onSave?: (files: CodeFile[]) => void
  onFilesChange?: (files: CodeFile[]) => void
  initialFiles?: WorkspaceSeedFile[]
  seedKey?: string
  collaborationChannel?: string
}

const createId = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }

  return `workspace-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

const mapSeedFilesToCodeFiles = (seedFiles: WorkspaceSeedFile[]): CodeFile[] =>
  seedFiles.map((file) => ({
    id: createId(),
    name: file.name,
    content: file.content,
    language: file.language || detectLanguage(file.name, file.content),
    updatedAt: new Date().toISOString(),
    isDirty: false,
  }))

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')

const buildPreviewDocument = (files: CodeFile[]) => {
  const htmlFile = files.find((file) => file.name.toLowerCase().endsWith('.html'))
  const cssFiles = files.filter((file) => file.name.toLowerCase().endsWith('.css'))
  const jsFiles = files.filter((file) => ['.js', '.mjs', '.cjs'].some((extension) => file.name.toLowerCase().endsWith(extension)))

  if (htmlFile) {
    let document = htmlFile.content
    const styles = cssFiles.map((file) => `<style data-file="${file.name}">\n${file.content}\n</style>`).join('\n')
    const scripts = jsFiles.map((file) => `<script data-file="${file.name}">\n${file.content}\n</script>`).join('\n')

    if (styles) {
      document = document.includes('</head>')
        ? document.replace('</head>', `${styles}\n</head>`)
        : `${styles}\n${document}`
    }

    if (scripts) {
      document = document.includes('</body>')
        ? document.replace('</body>', `${scripts}\n</body>`)
        : `${document}\n${scripts}`
    }

    return document
  }

  const primaryFile = files[0]

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Workspace Preview</title>
  <style>
    body {
      margin: 0;
      min-height: 100vh;
      font-family: Inter, system-ui, sans-serif;
      background:
        radial-gradient(circle at top left, rgba(45, 212, 191, 0.15), transparent 28%),
        linear-gradient(180deg, #020617, #0f172a 50%, #111827);
      color: #e2e8f0;
      padding: 32px;
    }

    .panel {
      max-width: 980px;
      margin: 0 auto;
      border: 1px solid rgba(148, 163, 184, 0.16);
      border-radius: 28px;
      background: rgba(15, 23, 42, 0.84);
      padding: 28px;
    }

    .eyebrow {
      display: inline-flex;
      border-radius: 999px;
      padding: 8px 12px;
      background: rgba(45, 212, 191, 0.14);
      color: #99f6e4;
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 0.18em;
      text-transform: uppercase;
    }

    pre {
      overflow: auto;
      border-radius: 20px;
      background: rgba(2, 6, 23, 0.86);
      padding: 18px;
      color: #cbd5e1;
      line-height: 1.65;
    }

    ul {
      color: #94a3b8;
    }
  </style>
</head>
<body>
  <section class="panel">
    <span class="eyebrow">Preview mode</span>
    <h1>Live preview is ready for HTML, CSS, and JavaScript.</h1>
    <p>The current workspace contains ${files.length} files. For framework files like TSX or server code, the editor shows a code snapshot and deployment metadata here.</p>
    <ul>
      ${files.map((file) => `<li>${file.name} • ${file.language}</li>`).join('')}
    </ul>
    <pre>${escapeHtml(primaryFile?.content ?? '// No file selected')}</pre>
  </section>
</body>
</html>`
}

const getInitialFiles = (projectId?: string, initialFiles?: WorkspaceSeedFile[]) => {
  if (initialFiles && initialFiles.length > 0) {
    return mapSeedFilesToCodeFiles(initialFiles)
  }

  if (projectId) {
    return mapSeedFilesToCodeFiles([
      {
        name: 'README.md',
        language: 'markdown',
        content: `# Project ${projectId}

Live project files were not loaded from a backend yet.
Use this workspace to review or prepare the source preview for buyers.`,
      },
    ])
  }

  return mapSeedFilesToCodeFiles(defaultWorkspaceFiles)
}

const formatTime = (value?: string | Date | null) => {
  if (!value) return 'now'

  const date = new Date(value)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  
  if (diffMins < 1) return 'now'
  if (diffMins < 60) return `${diffMins}m ago`
  
  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return `${diffHours}h ago`
  
  const diffDays = Math.floor(diffHours / 24)
  if (diffDays < 7) return `${diffDays}d ago`
  
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  })
}

const transportTone: Record<'broadcast' | 'websocket', string> = {
  broadcast: 'border-teal-300/20 bg-teal-300/10 text-teal-100',
  websocket: 'border-sky-300/20 bg-sky-300/10 text-sky-100',
}

const MonacoCodeEditor: React.FC<MonacoCodeEditorProps> = ({
  projectId,
  theme = 'vs-dark',
  readOnly = false,
  onSave,
  onFilesChange,
  initialFiles,
  seedKey,
  collaborationChannel,
}) => {
  const { user } = useAuth()
  const workspaceKey = projectId ?? seedKey ?? 'local-workspace'
  const storageKey = `devbloxi:workspace:${workspaceKey}`
  const websocketStorageKey = `devbloxi:workspace:${workspaceKey}:ws`
  const clientIdRef = useRef(createId())
  const editorRef = useRef<any>(null)
  const monacoRef = useRef<any>(null)
  const broadcastRef = useRef<BroadcastChannel | null>(null)
  const websocketRef = useRef<WebSocket | null>(null)
  const skipNextSyncRef = useRef(false)
  const deploymentUrlRef = useRef<string | null>(null)
  const collaborationWorkspace = collaborationChannel ?? `devbloxi-live-${workspaceKey}`

  const [files, setFiles] = useState<CodeFile[]>(() => getInitialFiles(projectId, initialFiles))
  const [activeFileId, setActiveFileId] = useState<string | null>(null)
  const [showPreview, setShowPreview] = useState(true)
  const [autoReload, setAutoReload] = useState(true)
  const [previewContent, setPreviewContent] = useState('')
  const [previewUrl, setPreviewUrl] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null)
  const [lastSyncAt, setLastSyncAt] = useState<string | null>(null)
  const [websocketUrl, setWebsocketUrl] = useState('')
  const [connectionState, setConnectionState] = useState<'offline' | 'local' | 'connecting' | 'online' | 'error'>('local')
  const [collaborators, setCollaborators] = useState<CollaboratorPresence[]>([])
  const [deployments, setDeployments] = useState<DeploymentPreview[]>([])

  const activeFile = useMemo(() => files.find((file) => file.id === activeFileId) ?? files[0] ?? null, [activeFileId, files])
  const supportedLanguages = useMemo(() => languageConfigs.map((language) => language.name).join(', '), [])
  const changedFiles = useMemo(() => files.filter((file) => file.isDirty).length, [files])
  const collaboratorCount = collaborators.length + 1

  const updatePresence = useCallback((presence: CollaboratorPresence) => {
    setCollaborators((current) => {
      const next = current.filter((item) => item.id !== presence.id)
      next.push(presence)
      return next.sort((left, right) => right.lastSeen.localeCompare(left.lastSeen))
    })
  }, [])

  const applySeed = useCallback((nextFiles: CodeFile[]) => {
    setFiles(nextFiles)
    setActiveFileId(nextFiles[0]?.id ?? null)
    setPreviewContent(buildPreviewDocument(nextFiles))
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return

    const persistedWebsocket = window.localStorage.getItem(websocketStorageKey)
    if (persistedWebsocket) {
      setWebsocketUrl(persistedWebsocket)
    }
  }, [websocketStorageKey])

  useEffect(() => {
    if (typeof window === 'undefined') return

    if (seedKey && initialFiles && initialFiles.length > 0) {
      const seededFiles = getInitialFiles(projectId, initialFiles)
      window.localStorage.setItem(storageKey, JSON.stringify(seededFiles))
      applySeed(seededFiles)
      return
    }

    const persisted = window.localStorage.getItem(storageKey)
    if (persisted) {
      try {
        const parsed = JSON.parse(persisted) as CodeFile[]
        if (Array.isArray(parsed) && parsed.length > 0) {
          applySeed(parsed)
          return
        }
      } catch (error) {
        console.error('Failed to restore workspace files:', error)
      }
    }

    const fallback = getInitialFiles(projectId, initialFiles)
    applySeed(fallback)
  }, [applySeed, initialFiles, projectId, seedKey, storageKey])

  useEffect(() => {
    if (activeFileId || files.length === 0) return
    setActiveFileId(files[0].id)
  }, [activeFileId, files])

  useEffect(() => {
    if (typeof window === 'undefined') return
    window.localStorage.setItem(storageKey, JSON.stringify(files))
    onFilesChange?.(files)
  }, [files, onFilesChange, storageKey])

  useEffect(() => {
    if (!autoReload) return

    const timeout = window.setTimeout(() => {
      setPreviewContent(buildPreviewDocument(files))
    }, 180)

    return () => window.clearTimeout(timeout)
  }, [autoReload, files])

  useEffect(() => {
    if (!previewContent) return

    if (deploymentUrlRef.current) {
      URL.revokeObjectURL(deploymentUrlRef.current)
    }

    const blob = new Blob([previewContent], { type: 'text/html' })
    const nextUrl = URL.createObjectURL(blob)
    deploymentUrlRef.current = nextUrl
    setPreviewUrl(nextUrl)

    return () => {
      if (deploymentUrlRef.current === nextUrl) {
        URL.revokeObjectURL(nextUrl)
        deploymentUrlRef.current = null
      }
    }
  }, [previewContent])

  const handleCollaborationMessage = useCallback((message: CollaborationMessage) => {
    if (message.workspace !== collaborationWorkspace || message.clientId === clientIdRef.current) {
      return
    }

    updatePresence({
      id: message.clientId,
      name: message.name,
      transport: message.transport,
      lastSeen: message.sentAt,
    })

    if (message.type === 'sync' && message.files && message.files.length > 0) {
      skipNextSyncRef.current = true
      setFiles(message.files)
      setActiveFileId(message.activeFileId ?? message.files[0]?.id ?? null)
      setLastSyncAt(message.sentAt)
    }
  }, [collaborationWorkspace, updatePresence])

  const sendCollaborationMessage = useCallback((payload: Omit<CollaborationMessage, 'clientId' | 'name' | 'sentAt'>) => {
    const message: CollaborationMessage = {
      ...payload,
      clientId: clientIdRef.current,
      name: user?.username ?? 'builder',
      sentAt: new Date().toISOString(),
    }

    broadcastRef.current?.postMessage(message)

    if (websocketRef.current?.readyState === WebSocket.OPEN) {
      websocketRef.current.send(JSON.stringify(message))
    }

    setLastSyncAt(message.sentAt)
  }, [user?.username])

  useEffect(() => {
    if (typeof window === 'undefined') return

    if ('BroadcastChannel' in window) {
      const channel = new BroadcastChannel(collaborationWorkspace)
      broadcastRef.current = channel
      setConnectionState((current) => (current === 'online' ? current : 'local'))
      channel.onmessage = (event: MessageEvent<CollaborationMessage>) => {
        handleCollaborationMessage(event.data)
      }

      return () => {
        channel.close()
        broadcastRef.current = null
      }
    }

    setConnectionState('offline')
    return undefined
  }, [collaborationWorkspace, handleCollaborationMessage])

  useEffect(() => {
    if (!websocketUrl) {
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(websocketStorageKey)
      }

      if (websocketRef.current) {
        websocketRef.current.close()
      }

      setConnectionState((current) => (current === 'online' ? 'local' : current === 'connecting' ? 'local' : current))
      return
    }

    if (typeof window !== 'undefined') {
      window.localStorage.setItem(websocketStorageKey, websocketUrl)
    }

    setConnectionState('connecting')

    try {
      const socket = new WebSocket(websocketUrl)
      websocketRef.current = socket

      socket.onopen = () => {
        setConnectionState('online')
        sendCollaborationMessage({
          type: 'presence',
          workspace: collaborationWorkspace,
          transport: 'websocket',
        })
      }

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data) as CollaborationMessage
          handleCollaborationMessage(data)
        } catch (error) {
          console.error('Failed to parse websocket collaboration message:', error)
        }
      }

      socket.onerror = () => {
        setConnectionState('error')
      }

      socket.onclose = () => {
        setConnectionState('local')
      }

      return () => {
        socket.close()
      }
    } catch (error) {
      console.error('WebSocket connection failed:', error)
      setConnectionState('error')
      return undefined
    }
  }, [collaborationWorkspace, handleCollaborationMessage, sendCollaborationMessage, websocketStorageKey, websocketUrl])

  useEffect(() => {
    const interval = window.setInterval(() => {
      sendCollaborationMessage({
        type: 'presence',
        workspace: collaborationWorkspace,
        transport: websocketRef.current?.readyState === WebSocket.OPEN ? 'websocket' : 'broadcast',
      })
    }, 9000)

    sendCollaborationMessage({
      type: 'presence',
      workspace: collaborationWorkspace,
      transport: websocketRef.current?.readyState === WebSocket.OPEN ? 'websocket' : 'broadcast',
    })

    return () => window.clearInterval(interval)
  }, [collaborationWorkspace, sendCollaborationMessage])

  const cleanupStaleCollaborators = () => {
    const now = Date.now()
    setCollaborators((current) =>
      current.filter((presence) => now - new Date(presence.lastSeen).getTime() < 30000),
    )
  }

  useEffect(() => {
    const cleanup = window.setInterval(cleanupStaleCollaborators, 5000)
    return () => window.clearInterval(cleanup)
  }, [])

  useEffect(() => {
    if (skipNextSyncRef.current) {
      skipNextSyncRef.current = false
      return
    }

    const timeout = window.setTimeout(() => {
      sendCollaborationMessage({
        type: 'sync',
        workspace: collaborationWorkspace,
        transport: websocketRef.current?.readyState === WebSocket.OPEN ? 'websocket' : 'broadcast',
        files,
        activeFileId,
      })
    }, 220)

    return () => window.clearTimeout(timeout)
  }, [activeFileId, collaborationWorkspace, files, sendCollaborationMessage])

  const configureMonacoIntelligence = useCallback((monaco: any) => {
    const compilerOptions = {
      allowJs: true,
      allowNonTsExtensions: true,
      jsx: monaco.languages.typescript.JsxEmit.ReactJSX,
      module: monaco.languages.typescript.ModuleKind.ESNext,
      moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
      target: monaco.languages.typescript.ScriptTarget.ES2020,
      esModuleInterop: true,
      noEmit: true,
      typeRoots: ['node_modules/@types'],
    }

    monaco.languages.typescript.javascriptDefaults.setCompilerOptions(compilerOptions)
    monaco.languages.typescript.typescriptDefaults.setCompilerOptions(compilerOptions)
    monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
      noSemanticValidation: false,
      noSyntaxValidation: false,
    })
    monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
      noSemanticValidation: false,
      noSyntaxValidation: false,
    })

    monaco.languages.typescript.javascriptDefaults.addExtraLib(
      `declare module 'react' {
        export function useState<T>(initialState: T): [T, (value: T) => void];
        export function useEffect(effect: () => void | (() => void), deps?: unknown[]): void;
      }`,
      'file:///node_modules/@types/react/index.d.ts',
    )

    const createCompletionProvider = (language: any, monaco: any) => {
    if (!language.snippets || language.snippets.length === 0) return

    monaco.languages.registerCompletionItemProvider(language.id, {
      provideCompletionItems: () => ({
        suggestions: language.snippets!.map((snippet: any) => ({
          label: snippet.name,
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: snippet.code,
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: snippet.description,
        })),
      }),
    })
  }

  languageConfigs.forEach((language) => {
    createCompletionProvider(language, monaco)
  })
  }, [])

  const handleEditorDidMount = useCallback((editor: any, monaco: any) => {
    editorRef.current = editor
    monacoRef.current = monaco

    monacoExtensions.setupAllExtensions()
    configureMonacoIntelligence(monaco)

    editor.updateOptions({
      automaticLayout: true,
      bracketPairColorization: { enabled: true },
      fontFamily: 'JetBrains Mono, Monaco, Menlo, "Ubuntu Mono", monospace',
      fontLigatures: true,
      fontSize: 14,
      inlineSuggest: { enabled: true },
      lightbulb: { enabled: 'on' },
      minimap: { enabled: false },
      quickSuggestions: {
        comments: false,
        other: true,
        strings: true,
      },
      parameterHints: { enabled: true },
      readOnly,
      scrollBeyondLastLine: false,
      suggest: {
        preview: true,
        showKeywords: true,
        showSnippets: true,
      },
      wordWrap: 'on',
    })
  }, [configureMonacoIntelligence, readOnly])

  useEffect(() => {
    if (!editorRef.current || !monacoRef.current || !activeFile) return

    const model = editorRef.current.getModel()
    if (!model) return

    monacoRef.current.editor.setModelLanguage(model, activeFile.language)
  }, [activeFile])

  const handleEditorChange = useCallback((value: string | undefined) => {
    if (value === undefined || !activeFile) return

    setFiles((current) =>
      current.map((file) =>
        file.id === activeFile.id
          ? {
              ...file,
              content: value,
              updatedAt: new Date().toISOString(),
              isDirty: true,
            }
          : file,
      ),
    )
  }, [activeFile])

  const handleCreateFile = () => {
    const fileName = window.prompt('Enter a file name, for example `feature.tsx`.')
    if (!fileName) return

    const language = detectLanguage(fileName)
    const nextFile: CodeFile = {
      id: createId(),
      name: fileName,
      content: '',
      language,
      updatedAt: new Date().toISOString(),
      isDirty: true,
    }

    setFiles((current) => [...current, nextFile])
    setActiveFileId(nextFile.id)
  }

  const handleDeleteFile = (fileId: string) => {
    if (files.length <= 1) return

    const nextFiles = files.filter((file) => file.id !== fileId)
    setFiles(nextFiles)

    if (activeFileId === fileId) {
      setActiveFileId(nextFiles[0]?.id ?? null)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)

    const cleanFiles = files.map((file) => ({ ...file, isDirty: false }))
    setFiles(cleanFiles)
    onSave?.(cleanFiles)
    setLastSavedAt(new Date().toISOString())

    window.setTimeout(() => {
      setIsSaving(false)
    }, 250)
  }

  const handleRefreshPreview = () => {
    setPreviewContent(buildPreviewDocument(files))
  }

  const handleCreateDeploymentPreview = () => {
    if (!previewUrl) return

    const deployment: DeploymentPreview = {
      id: createId(),
      label: `Preview ${deployments.length + 1}`,
      url: previewUrl,
      createdAt: new Date().toISOString(),
      status: 'ready',
    }

    setDeployments((current) => [deployment, ...current].slice(0, 4))
    window.open(previewUrl, '_blank', 'noopener,noreferrer')
  }

  const collaborationBadge =
    connectionState === 'online'
      ? { label: 'WebSocket live', icon: Wifi, tone: 'border-sky-300/20 bg-sky-300/10 text-sky-100' }
      : connectionState === 'connecting'
        ? { label: 'Connecting', icon: Radio, tone: 'border-amber-300/20 bg-amber-300/10 text-amber-100' }
        : connectionState === 'error'
          ? { label: 'Socket fallback', icon: WifiOff, tone: 'border-rose-300/20 bg-rose-300/10 text-rose-100' }
          : connectionState === 'offline'
            ? { label: 'Offline', icon: WifiOff, tone: 'border-white/10 bg-white/[0.05] text-stone-300' }
            : { label: 'Local live sync', icon: Wifi, tone: 'border-teal-300/20 bg-teal-300/10 text-teal-100' }

  const CollaborationIcon = collaborationBadge.icon

  return (
    <div className="grid h-[calc(100vh-220px)] min-h-[720px] gap-4 xl:grid-cols-[260px,minmax(0,1fr),340px]">
      <aside className="surface-panel-strong flex min-h-0 flex-col overflow-hidden">
        <div className="border-b border-white/10 px-5 py-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-stone-500">Workspace</p>
              <h3 className="mt-1 text-xl font-bold text-white">Files</h3>
            </div>
            {!readOnly && (
              <button onClick={handleCreateFile} className="btn-secondary rounded-full px-3 py-2">
                <Plus className="h-4 w-4" />
                New
              </button>
            )}
          </div>

          <div className="mt-4 flex flex-wrap gap-2 text-xs text-stone-400">
            <span className="tag-pill">{files.length} files</span>
            <span className="tag-pill">{changedFiles} changed</span>
            <span className="tag-pill">{collaboratorCount} collaborators</span>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-3 py-3">
          {files.map((file) => {
            const isActive = activeFile?.id === file.id

            return (
              <button
                key={file.id}
                onClick={() => setActiveFileId(file.id)}
                className={`mb-2 flex w-full items-center justify-between rounded-2xl border px-3 py-3 text-left transition ${
                  isActive
                    ? 'border-teal-300/30 bg-teal-300/12 text-white'
                    : 'border-transparent bg-white/[0.04] text-stone-300 hover:border-white/10 hover:bg-white/[0.06]'
                }`}
              >
                <span className="flex min-w-0 items-center gap-3">
                  <FileText className="h-4 w-4 flex-shrink-0" />
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold">{file.name}</span>
                    <span className="block text-xs text-stone-500">{file.language}</span>
                  </span>
                </span>

                <span className="flex items-center gap-2">
                  {file.isDirty && <span className="h-2 w-2 rounded-full bg-amber-300" />}
                  {!readOnly && files.length > 1 && (
                    <span
                      role="button"
                      tabIndex={0}
                      onClick={(event) => {
                        event.stopPropagation()
                        handleDeleteFile(file.id)
                      }}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault()
                          handleDeleteFile(file.id)
                        }
                      }}
                      className="rounded-full p-1 text-stone-500 transition hover:bg-white/10 hover:text-white"
                    >
                      <X className="h-3.5 w-3.5" />
                    </span>
                  )}
                </span>
              </button>
            )
          })}
        </div>

        <div className="border-t border-white/10 px-4 py-4">
          <div className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-semibold ${collaborationBadge.tone}`}>
            <CollaborationIcon className="h-3.5 w-3.5" />
            {collaborationBadge.label}
          </div>

          <p className="mt-3 text-xs leading-6 text-stone-400">
            Hot reload and live sync are enabled. Current collaboration channel: <span className="text-stone-200">{collaborationWorkspace}</span>.
          </p>
        </div>
      </aside>

      <section className="surface-panel-strong flex min-h-0 flex-col overflow-hidden">
        <div className="border-b border-white/10 px-5 py-4">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-stone-500">Editor</p>
              <div className="mt-1 flex items-center gap-3">
                <h3 className="text-xl font-bold text-white">{activeFile?.name ?? 'Workspace file'}</h3>
                <span className="tag-pill">{activeFile?.language ?? 'plaintext'}</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button onClick={() => setAutoReload((value) => !value)} className="btn-secondary rounded-full px-4 py-2">
                <RefreshCw className={`h-4 w-4 ${autoReload ? '' : 'opacity-60'}`} />
                {autoReload ? 'Hot reload on' : 'Hot reload off'}
              </button>
              <button onClick={() => setShowPreview((value) => !value)} className="btn-secondary rounded-full px-4 py-2">
                <Globe className="h-4 w-4" />
                {showPreview ? 'Hide preview' : 'Show preview'}
              </button>
              <button onClick={handleSave} disabled={isSaving || readOnly} className="btn-primary rounded-full px-4 py-2 disabled:cursor-not-allowed disabled:opacity-70">
                <Save className="h-4 w-4" />
                {isSaving ? 'Saving' : 'Save'}
              </button>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5">
              <Radio className="h-3.5 w-3.5 text-teal-200" />
              <span className="text-xs font-medium text-stone-300">{supportedLanguages}</span>
            </div>
            <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5">
              <Sparkles className="h-3.5 w-3.5 text-amber-200" />
              <span className="text-xs font-medium text-stone-300">IntelliSense</span>
            </div>
            <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5">
              <Globe className="h-3.5 w-3.5 text-blue-200" />
              <span className="text-xs font-medium text-stone-300">Preview {showPreview ? 'live' : 'off'}</span>
            </div>
            {lastSavedAt && (
              <div className="flex items-center gap-2 rounded-full border border-green-300/20 bg-green-300/10 px-3 py-1.5">
                <Save className="h-3.5 w-3.5 text-green-300" />
                <span className="text-xs font-medium text-green-300">Saved {formatTime(lastSavedAt)}</span>
              </div>
            )}
          </div>
        </div>

        <div className={`grid min-h-0 flex-1 ${showPreview ? 'xl:grid-cols-[minmax(0,1fr),minmax(320px,38%)]' : 'grid-cols-1'}`}>
          <div className="min-h-0 border-r border-white/10">
            <Editor
              key={workspaceKey}
              height="100%"
              language={activeFile?.language ?? 'plaintext'}
              theme={theme}
              value={activeFile?.content ?? ''}
              onChange={handleEditorChange}
              onMount={handleEditorDidMount}
              options={{
                minimap: { enabled: false },
                readOnly,
                scrollBeyondLastLine: false,
              }}
            />
          </div>

          {showPreview && (
            <div className="flex min-h-0 flex-col bg-stone-50">
              <div className="flex items-center justify-between border-b border-stone-200 px-4 py-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-stone-500">Deployment preview</p>
                  <p className="mt-1 text-sm font-semibold text-stone-700">Live iframe with hot reload</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={handleRefreshPreview} className="inline-flex items-center gap-2 rounded-full border border-stone-200 px-3 py-2 text-xs font-semibold text-stone-700 transition hover:bg-stone-100">
                    <RefreshCw className="h-3.5 w-3.5" />
                    Refresh
                  </button>
                  <button onClick={handleCreateDeploymentPreview} disabled={!previewUrl} className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2.5 text-xs font-semibold text-white shadow-lg transition-all hover:shadow-xl hover:scale-105 disabled:cursor-not-allowed disabled:opacity-70 disabled:shadow-none">
                    <Sparkles className="h-4 w-4" />
                    Launch preview
                  </button>
                </div>
              </div>

              <div className="min-h-0 flex-1 bg-white">
                <iframe
                  srcDoc={previewContent}
                  className="h-full w-full border-0"
                  title="DevBloxi live preview"
                  sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                />
              </div>
            </div>
          )}
        </div>
      </section>

      <aside className="space-y-4">
        <section className="surface-panel-strong p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-stone-500">Collaboration</p>
              <h3 className="mt-1 text-xl font-bold text-white">Real-time channel</h3>
            </div>
            <Users className="h-5 w-5 text-teal-200" />
          </div>

          <div className="mt-4 space-y-3">
            <label className="block text-sm font-medium text-stone-300">
              WebSocket endpoint
            </label>
            <input
              type="text"
              value={websocketUrl}
              onChange={(event) => setWebsocketUrl(event.target.value)}
              placeholder="ws://localhost:3001/workspace"
              className="input-base"
            />
            <p className="text-xs leading-6 text-stone-400">
              Without a server the editor still syncs live between browser tabs using <span className="text-stone-200">BroadcastChannel</span>. Add a WebSocket URL to share edits across clients.
            </p>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-semibold ${collaborationBadge.tone}`}>
              <CollaborationIcon className="h-3.5 w-3.5" />
              {collaborationBadge.label}
            </span>
            <span className="flex items-center gap-1.5 rounded-full border border-blue-300/20 bg-blue-300/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-blue-100">
              <Wifi className="h-3 w-3" />
              Sync {formatTime(lastSyncAt)}
            </span>
          </div>

          <div className="mt-5 space-y-3">
            <p className="text-sm font-semibold text-white">Active collaborators</p>
            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-3">
              <div className="mb-3 flex items-center justify-between rounded-2xl border border-teal-300/20 bg-teal-300/10 px-3 py-3">
                <div>
                  <p className="text-sm font-semibold text-teal-50">{user?.username ?? 'You'}</p>
                  <p className="text-xs text-teal-100/80">Current session</p>
                </div>
                <span className="rounded-full bg-teal-300/20 px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-teal-100">
                  owner
                </span>
              </div>

              {collaborators.length === 0 ? (
                <p className="text-sm leading-6 text-stone-400">
                  No remote collaborators yet. Open the same workspace in another tab or connect a WebSocket server to test live collaboration.
                </p>
              ) : (
                <div className="space-y-2">
                  {collaborators.map((collaborator) => (
                    <div key={collaborator.id} className="flex items-center justify-between rounded-2xl border border-white/8 bg-white/[0.04] px-3 py-3">
                      <div>
                        <p className="text-sm font-semibold text-white">{collaborator.name}</p>
                        <p className="text-xs text-stone-400 flex items-center gap-1">
                          <span className="w-1.5 h-1 rounded-full bg-green-400"></span>
                          {formatTime(collaborator.lastSeen)}
                        </p>
                      </div>
                      <span className={`rounded-full border px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${transportTone[collaborator.transport]}`}>
                        {collaborator.transport}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="surface-panel-strong p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-stone-500">DX stack</p>
              <h3 className="mt-1 text-xl font-bold text-white">IntelliSense + preview</h3>
            </div>
            <Sparkles className="h-5 w-5 text-amber-200" />
          </div>

          <div className="mt-4 grid gap-3">
            <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-4">
              <div className="flex items-center gap-3">
                <SearchCode className="h-4 w-4 text-teal-200" />
                <p className="text-sm font-semibold text-white">Code completion</p>
              </div>
              <p className="mt-2 text-sm leading-6 text-stone-400">
                Snippet completion is registered for HTML, CSS, JavaScript, TypeScript, PHP, Python, Go, Rust, GraphQL, YAML, Dockerfile, SQL, and Markdown.
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-4">
              <div className="flex items-center gap-3">
                <FileCode2 className="h-4 w-4 text-sky-200" />
                <p className="text-sm font-semibold text-white">Hot reload</p>
              </div>
              <p className="mt-2 text-sm leading-6 text-stone-400">
                The preview iframe refreshes automatically after edits, so HTML/CSS/JS changes render instantly without a manual rebuild.
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-4">
              <div className="flex items-center gap-3">
                <CloudCog className="h-4 w-4 text-amber-200" />
                <p className="text-sm font-semibold text-white">Deployment previews</p>
              </div>
              <p className="mt-2 text-sm leading-6 text-stone-400">
                Open a local preview snapshot in a separate tab and track the latest generated previews on the right.
              </p>
            </div>
          </div>
        </section>

        <section className="surface-panel-strong p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-stone-500">Deploy log</p>
              <h3 className="mt-1 text-xl font-bold text-white">Recent previews</h3>
            </div>
            <Link2 className="h-5 w-5 text-teal-200" />
          </div>

          <div className="mt-4 space-y-3">
            {deployments.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-white/12 bg-white/[0.03] p-4 text-sm leading-6 text-stone-400">
                No preview has been opened yet. Generate one from the live iframe to create a deployment snapshot.
              </div>
            ) : (
              deployments.map((deployment) => (
                <button
                  key={deployment.id}
                  onClick={() => window.open(deployment.url, '_blank', 'noopener,noreferrer')}
                  className="flex w-full items-center justify-between rounded-3xl border border-white/10 bg-white/[0.04] px-4 py-4 text-left transition hover:bg-white/[0.06]"
                >
                  <span>
                    <span className="block text-sm font-semibold text-white">{deployment.label}</span>
                    <span className="block text-xs text-stone-400 flex items-center gap-1">
                      <span className="w-1.5 h-1 rounded-full bg-teal-400"></span>
                      {formatTime(deployment.createdAt)} • {deployment.status}
                    </span>
                  </span>
                  <Globe className="h-4 w-4 text-teal-200" />
                </button>
              ))
            )}
          </div>
        </section>

        <section className="surface-panel-strong overflow-hidden">
          <div className="border-b border-white/10 px-5 py-4">
            <div className="flex items-center gap-3">
              <GitBranch className="h-4 w-4 text-stone-300" />
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-stone-500">Source control</p>
                <h3 className="mt-1 text-lg font-bold text-white">Git integration</h3>
              </div>
            </div>
          </div>
          <div className="p-4">
            <GitIntegration repositoryPath={workspaceKey} onCommit={() => setLastSavedAt(new Date().toISOString())} />
          </div>
        </section>
      </aside>
    </div>
  )
}

export default MonacoCodeEditor
