import { useDeferredValue, useEffect, useMemo, useState, useCallback } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  Bell,
  Box,
  CheckCircle2,
  Code2,
  Coins,
  Layers,
  Rocket,
  Search,
  SlidersHorizontal,
  Sparkles,
  Star,
  Store,
  Users,
  Zap,
} from 'lucide-react'
import DashboardSidebar from '../../src/components/layout/DashboardSidebar'
import MonacoCodeEditor from '../../src/components/MonacoCodeEditor'
import {
  defaultWorkspaceFiles,
  ProjectTemplateDefinition,
  projectTemplateSeed,
  SnippetListing,
  snippetMarketplaceSeed,
  WorkspaceNotification,
  WorkspaceSeedFile,
  workspaceNotificationsSeed,
} from '../../src/data/developerWorkspace'
import { User, Project, Conversation } from '../../src/types/index'
import { usePerformanceMonitor } from '../../src/hooks/usePerformanceMonitor'
import { useDashboardShortcuts } from '../../src/hooks/useKeyboardShortcuts'
import { useWebSocket } from '../../src/hooks/useWebSocket'
import {
  getUsers,
  getUserConversations,
  markConversationAsRead,
  sendMarketplaceMessage,
} from '../../src/services/authService'
import { ProjectService } from '../../src/services/projectService'

interface DashboardPageProps {
  user: User
}

type DashboardTab = 'overview' | 'projects' | 'clients' | 'snippets' | 'templates' | 'editor' | 'notifications'

interface WorkspacePreset {
  id: string
  label: string
  source: 'template' | 'snippet' | 'workspace'
  files: WorkspaceSeedFile[]
}

const localSnippetStorageKey = 'devbloxi:dashboard:published-snippets'
const notificationStorageKey = 'devbloxi:dashboard:notifications'

const notificationTone: Record<WorkspaceNotification['type'], string> = {
  sale: 'border-emerald-300/20 bg-emerald-300/10 text-emerald-100',
  project: 'border-sky-300/20 bg-sky-300/10 text-sky-100',
  system: 'border-amber-300/20 bg-amber-300/10 text-amber-100',
}

const formatRelativeDate = (value: string) =>
  new Date(value).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

export default function DashboardPage({ user }: DashboardPageProps) {
  const navigate = useNavigate()
  const location = useLocation()
  
  // Performance monitoring
  const { startMonitoring, stopMonitoring, isMonitoring } = usePerformanceMonitor('DashboardPage')
  
  // WebSocket for real-time updates
  const { isConnected, lastMessage, sendMessage } = useWebSocket()
  
  const [activeTab, setActiveTab] = useState<DashboardTab>('overview')
  const [showFilters, setShowFilters] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTechnology, setSelectedTechnology] = useState('all')
  const [selectedType, setSelectedType] = useState<'all' | SnippetListing['type']>('all')
  const [maxPrice, setMaxPrice] = useState(99)
  const [minRating, setMinRating] = useState(4)
  const [workspaceFiles, setWorkspaceFiles] = useState<WorkspaceSeedFile[]>(defaultWorkspaceFiles)
  const [workspacePreset, setWorkspacePreset] = useState<WorkspacePreset>({
    id: 'workspace-default',
    label: 'Default live workspace',
    source: 'workspace',
    files: defaultWorkspaceFiles,
  })
  const [marketplaceSnippets, setMarketplaceSnippets] = useState<SnippetListing[]>(snippetMarketplaceSeed)
  const [notifications, setNotifications] = useState<WorkspaceNotification[]>(workspaceNotificationsSeed)
  const [publishedProjects, setPublishedProjects] = useState<Project[]>([])
  const [clientConversations, setClientConversations] = useState<Conversation[]>([])
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({})
  const [publishTitle, setPublishTitle] = useState('Live collaboration pack')
  const [publishPrice, setPublishPrice] = useState(45)
  const [publishTags, setPublishTags] = useState('react, websocket, monaco')
  const deferredSearch = useDeferredValue(searchTerm)

  useEffect(() => {
    if (!user || user.accountType !== 'DEVELOPER') {
      navigate('/')
    }
  }, [navigate, user])

  // Performance monitoring
  useEffect(() => {
    startMonitoring()
    return () => stopMonitoring()
  }, [startMonitoring, stopMonitoring])

  // WebSocket message handling
  useEffect(() => {
    if (lastMessage) {
      switch (lastMessage.type) {
        case 'notification':
          // Handle real-time notifications
          setNotifications((current) => [lastMessage.data, ...current].slice(0, 12))
          break
        case 'deal_update':
          // Handle deal updates
          if (lastMessage.data.status) {
            // Refresh deals when status changes
            setClientConversations(getUserConversations(user.id, 'DEVELOPER'))
          }
          break
        case 'project_update':
          // Handle project updates
          if (lastMessage.data.id) {
            // Update project in publishedProjects
            setPublishedProjects((current) => 
              current.map(p => p.id === lastMessage.data.id ? { ...p, ...lastMessage.data } : p)
            )
          }
          break
      }
    }
  }, [lastMessage, user.id])

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search)
    const tab = urlParams.get('tab') as DashboardTab
    if (tab && ['overview', 'projects', 'clients', 'snippets', 'templates', 'editor', 'notifications'].includes(tab)) {
      setActiveTab(tab)
    }
  }, [location.search])

  const handleTabChange = useCallback((tab: DashboardTab) => {
    setActiveTab(tab)
    const urlParams = new URLSearchParams()
    urlParams.set('tab', tab)
    navigate(`${location.pathname}?${urlParams.toString()}`, { replace: true })
  }, [navigate, location.pathname])

  // Keyboard shortcuts
  useDashboardShortcuts({
    onSearch: () => {
      const searchInput = document.querySelector('input[placeholder*="Search"]') as HTMLInputElement
      searchInput?.focus()
    },
    onNewProject: () => navigate('/create'),
    onRefresh: () => window.location.reload(),
    onToggleNotifications: () => handleTabChange('notifications'),
    onToggleSettings: () => navigate('/settings'),
    onLogout: () => {
      // Handle logout logic here
      navigate('/login')
    }
  })

  useEffect(() => {
    if (typeof window === 'undefined') return

    const persistedSnippets = window.localStorage.getItem(localSnippetStorageKey)
    if (persistedSnippets) {
      try {
        const parsed = JSON.parse(persistedSnippets) as SnippetListing[]
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMarketplaceSnippets([...parsed, ...snippetMarketplaceSeed])
        }
      } catch (error) {
        console.error('Failed to restore snippet listings:', error)
      }
    }

    const persistedNotifications = window.localStorage.getItem(notificationStorageKey)
    if (persistedNotifications) {
      try {
        const parsed = JSON.parse(persistedNotifications) as WorkspaceNotification[]
        if (Array.isArray(parsed) && parsed.length > 0) {
          setNotifications(parsed)
        }
      } catch (error) {
        console.error('Failed to restore notifications:', error)
      }
    }
  }, [])

  useEffect(() => {
    const loadProjects = async () => {
      const projects = await ProjectService.getProjectsByAuthor(user.id)
      setPublishedProjects(projects)
    }
    loadProjects()
    setClientConversations(getUserConversations(user.id, 'DEVELOPER'))
  }, [user.id])

  useEffect(() => {
    if (typeof window === 'undefined') return

    const published = marketplaceSnippets.filter((snippet) => snippet.author === user.username)
    window.localStorage.setItem(localSnippetStorageKey, JSON.stringify(published))
  }, [marketplaceSnippets, user.username])

  useEffect(() => {
    if (typeof window === 'undefined') return
    window.localStorage.setItem(notificationStorageKey, JSON.stringify(notifications))
  }, [notifications])

  const allTechnologies = useMemo(() => {
    const entries = new Set<string>()

    marketplaceSnippets.forEach((snippet) => {
      snippet.technologies.forEach((technology) => entries.add(technology))
    })

    projectTemplateSeed.forEach((template) => {
      template.technologies.forEach((technology) => entries.add(technology))
    })

    return ['all', ...Array.from(entries).sort()]
  }, [marketplaceSnippets])

  const filteredSnippets = useMemo(() => {
    const query = deferredSearch.trim().toLowerCase()

    return marketplaceSnippets.filter((snippet) => {
      const matchesQuery =
        !query ||
        [snippet.title, snippet.description, snippet.author, ...snippet.technologies]
          .join(' ')
          .toLowerCase()
          .includes(query)

      const matchesTechnology =
        selectedTechnology === 'all' || snippet.technologies.includes(selectedTechnology)

      const matchesType = selectedType === 'all' || snippet.type === selectedType
      const matchesPrice = snippet.price <= maxPrice
      const matchesRating = snippet.rating >= minRating

      return matchesQuery && matchesTechnology && matchesType && matchesPrice && matchesRating
    })
  }, [deferredSearch, marketplaceSnippets, maxPrice, minRating, selectedTechnology, selectedType])

  const filteredTemplates = useMemo(() => {
    const query = deferredSearch.trim().toLowerCase()

    return projectTemplateSeed.filter((template) => {
      const matchesQuery =
        !query ||
        [template.name, template.description, ...template.technologies]
          .join(' ')
          .toLowerCase()
          .includes(query)

      const matchesTechnology =
        selectedTechnology === 'all' || template.technologies.includes(selectedTechnology)

      return matchesQuery && matchesTechnology
    })
  }, [deferredSearch, selectedTechnology])

  const unreadNotifications = useMemo(() => 
    notifications.filter((notification) => notification.unread).length, [notifications]
  )
  const unreadClientThreads = useMemo(() => 
    clientConversations.reduce((sum, conversation) => sum + conversation.unreadForDeveloper, 0), 
    [clientConversations]
  )
  const averageSnippetRating = useMemo(() => 
    marketplaceSnippets.length > 0 
      ? marketplaceSnippets.reduce((sum, snippet) => sum + snippet.rating, 0) / marketplaceSnippets.length
      : 0, 
    [marketplaceSnippets]
  )

  const pushNotification = useCallback((notification: WorkspaceNotification) => {
    setNotifications((current) => [notification, ...current].slice(0, 12))
  }, [])

  const activateWorkspace = useCallback((preset: WorkspacePreset) => {
    setWorkspacePreset(preset)
    setWorkspaceFiles(preset.files)
    handleTabChange('editor')
    pushNotification({
      id: `notif-${Date.now()}`,
      title: preset.source === 'template' ? 'Template loaded' : 'Snippet loaded',
      message: `${preset.label} was sent to the live workspace and is ready for editing.`,
      createdAt: new Date().toISOString(),
      type: 'system',
      unread: true,
    })
  }, [pushNotification])

  const handleLaunchTemplate = useCallback((template: ProjectTemplateDefinition) => {
    activateWorkspace({
      id: template.id,
      label: template.name,
      source: 'template',
      files: template.files,
    })
  }, [activateWorkspace])

  const handleLoadSnippet = useCallback((snippet: SnippetListing) => {
    activateWorkspace({
      id: snippet.id,
      label: snippet.title,
      source: 'snippet',
      files: snippet.files,
    })
  }, [activateWorkspace])

  const handlePublishSnippet = useCallback(() => {
    const filesToPublish = workspaceFiles.length > 0 ? workspaceFiles : workspacePreset.files
    const tags = publishTags
      .split(',')
      .map((value) => value.trim().toLowerCase())
      .filter(Boolean)

    if (!publishTitle.trim() || filesToPublish.length === 0) {
      return
    }

    const snippet: SnippetListing = {
      id: `published-${Date.now()}`,
      title: publishTitle.trim(),
      description: `Published from the live workspace using ${filesToPublish.length} files and real-time collaboration ready assets.`,
      technologies: tags.length > 0 ? tags : ['javascript'],
      price: publishPrice,
      rating: 5,
      sales: 0,
      updatedAt: new Date().toISOString(),
      language: filesToPublish[0]?.language ?? 'javascript',
      type: 'snippet',
      author: user.username,
      files: filesToPublish,
    }

    setMarketplaceSnippets((current) => [snippet, ...current])
    pushNotification({
      id: `notif-sale-${Date.now()}`,
      title: 'Snippet listed',
      message: `${snippet.title} is now visible in the marketplace for $${snippet.price}.`,
      createdAt: new Date().toISOString(),
      type: 'sale',
      unread: true,
    })
  }, [workspaceFiles, workspacePreset, publishTitle, publishTags, publishPrice, user.username, pushNotification])

  const markAllNotificationsAsRead = useCallback(() => {
    setNotifications((current) => current.map((notification) => ({ ...notification, unread: false })))
  }, [])

  const handleDeveloperReply = useCallback((conversation: Conversation) => {
    const draft = replyDrafts[conversation.id]?.trim()
    if (!draft) {
      return
    }

    const recipient = getUsers().find((entry) => entry.id === conversation.clientId)
    if (!recipient) {
      return
    }

    sendMarketplaceMessage({
      projectId: conversation.projectId,
      sender: user,
      recipient,
      body: draft,
    })

    setReplyDrafts((current) => ({
      ...current,
      [conversation.id]: '',
    }))
    setClientConversations(getUserConversations(user.id, 'DEVELOPER'))
  }, [replyDrafts, user])

  const stats = [
    {
      label: 'Live snippets',
      value: marketplaceSnippets.length,
      icon: Store,
      caption: 'Marketplace-ready blocks',
    },
    {
      label: 'Template packs',
      value: projectTemplateSeed.length,
      icon: Layers,
      caption: 'Quick-start stacks',
    },
    {
      label: 'Average rating',
      value: averageSnippetRating.toFixed(1),
      icon: Star,
      caption: 'Across all snippet offers',
    },
    {
      label: 'Unread alerts',
      value: unreadNotifications,
      icon: Bell,
      caption: 'Projects, sales, and updates',
    },
    {
      label: 'Published projects',
      value: publishedProjects.length,
      icon: Box,
      caption: 'Live listings buyers can browse',
    },
    {
      label: 'Client messages',
      value: unreadClientThreads,
      icon: Users,
      caption: 'Unread buyer replies',
    },
  ]

  const tabs = useMemo((): Array<{ id: DashboardTab; label: string; count?: number }> => [
    { id: 'overview', label: 'Overview' },
    { id: 'projects', label: 'Publish projects', count: publishedProjects.length },
    { id: 'clients', label: 'Client chat', count: unreadClientThreads },
    { id: 'snippets', label: 'Snippet market', count: filteredSnippets.length },
    { id: 'templates', label: 'Templates', count: filteredTemplates.length },
    { id: 'editor', label: 'Workspace' },
    { id: 'notifications', label: 'Notifications', count: unreadNotifications },
  ], [publishedProjects.length, unreadClientThreads, filteredSnippets.length, filteredTemplates.length, unreadNotifications])

  return (
    <div className="min-h-screen bg-transparent">
      <div className="mx-auto flex max-w-[1500px] gap-6 px-4 py-8 sm:px-6 xl:px-8">
        <div className="hidden xl:block">
          <DashboardSidebar user={user} activePath={location.pathname} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="mb-8 grid gap-6 xl:grid-cols-[minmax(0,1.2fr),360px]">
            <section className="surface-panel-strong overflow-hidden p-6 sm:p-8">
              <span className="eyebrow">
                <Zap className="h-3.5 w-3.5" />
                Developer workspace
              </span>
              <h1 className="mt-5 text-4xl font-bold tracking-tight text-white sm:text-5xl">
                Build, package, preview, and sell code without leaving the dashboard.
              </h1>
              <p className="mt-4 max-w-3xl text-base leading-7 text-stone-300">
                Real-time collaboration, project templates, advanced search, Monaco live preview, and snippet monetization are now grouped into one place.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <button onClick={() => navigate('/live-workspace')} className="btn-primary">
                  <Rocket className="h-4 w-4" />
                  Open live workspace
                </button>
                <button onClick={() => navigate('/create')} className="btn-secondary">
                  <Box className="h-4 w-4" />
                  Publish a project
                </button>
                <button onClick={() => navigate('/projects')} className="btn-secondary">
                  <Store className="h-4 w-4" />
                  Browse snippets
                </button>
              </div>
            </section>

            <section className="surface-panel-strong p-6">
              <p className="text-xs uppercase tracking-[0.22em] text-stone-500">Workspace focus</p>
              <h2 className="mt-2 text-2xl font-bold text-white">{workspacePreset.label}</h2>
              <p className="mt-3 text-sm leading-6 text-stone-400">
                Source: <span className="text-stone-200">{workspacePreset.source}</span> • Files ready: <span className="text-stone-200">{workspacePreset.files.length}</span>
              </p>

              <div className="mt-6 space-y-3">
                <div className="rounded-3xl border border-teal-300/20 bg-teal-300/10 px-4 py-4">
                  <p className="text-sm font-semibold text-teal-50">Collaboration channel armed</p>
                  <p className="mt-1 text-sm text-teal-100/80">Open another browser tab or connect a WebSocket server to watch the editor sync live.</p>
                </div>
                <div className="rounded-3xl border border-white/10 bg-white/[0.04] px-4 py-4">
                  <p className="text-sm font-semibold text-white">Deployment preview included</p>
                  <p className="mt-1 text-sm text-stone-400">Preview snapshots can be opened directly from the editor panel with hot reload enabled.</p>
                </div>
              </div>
            </section>
          </div>

          <section className="mb-8 grid gap-4 md:grid-cols-2 xl:grid-cols-6">
            {stats.map((stat) => {
              const Icon = stat.icon

              return (
                <article key={stat.label} className="surface-panel-strong p-5">
                  <div className="flex items-center justify-between">
                    <span className="rounded-2xl bg-white/[0.06] p-3 text-teal-200">
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className="text-xs uppercase tracking-[0.22em] text-stone-500">{stat.label}</span>
                  </div>
                  <p className="mt-5 font-['Space_Grotesk'] text-4xl font-bold text-white">{stat.value}</p>
                  <p className="mt-2 text-sm text-stone-400">{stat.caption}</p>
                </article>
              )
            })}
          </section>

          <section className="surface-panel p-4 sm:p-5">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-stone-500" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search snippets, templates, languages, or authors"
                  className="input-base pl-12"
                />
              </div>

              <div className="flex flex-wrap gap-3">
                <button onClick={() => setShowFilters((value) => !value)} className="btn-secondary rounded-full px-4 py-3">
                  <SlidersHorizontal className="h-4 w-4" />
                  Filters
                </button>
                <select
                  value={selectedTechnology}
                  onChange={(event) => setSelectedTechnology(event.target.value)}
                  className="input-base min-w-[180px]"
                >
                  {allTechnologies.map((technology) => (
                    <option key={technology} value={technology}>
                      {technology === 'all' ? 'All technologies' : technology}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {showFilters && (
              <div className="mt-5 grid gap-4 border-t border-white/10 pt-5 lg:grid-cols-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-stone-300">Offer type</label>
                  <select
                    value={selectedType}
                    onChange={(event) => setSelectedType(event.target.value as typeof selectedType)}
                    className="input-base"
                  >
                    <option value="all">All offer types</option>
                    <option value="snippet">Snippet</option>
                    <option value="widget">Widget</option>
                    <option value="integration">Integration</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-stone-300">Max price: ${maxPrice}</label>
                  <input
                    type="range"
                    min="10"
                    max="150"
                    step="1"
                    value={maxPrice}
                    onChange={(event) => setMaxPrice(Number(event.target.value))}
                    className="w-full accent-teal-300"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-stone-300">Min rating: {minRating.toFixed(1)}</label>
                  <input
                    type="range"
                    min="4"
                    max="5"
                    step="0.1"
                    value={minRating}
                    onChange={(event) => setMinRating(Number(event.target.value))}
                    className="w-full accent-teal-300"
                  />
                </div>

                <div className="flex items-end">
                  <button
                    onClick={() => {
                      setSelectedTechnology('all')
                      setSelectedType('all')
                      setMaxPrice(99)
                      setMinRating(4)
                    }}
                    className="btn-ghost h-[50px] w-full justify-center rounded-2xl border border-white/10 bg-white/[0.04]"
                  >
                    Reset filters
                  </button>
                </div>
              </div>
            )}
          </section>

          <section className="mt-8">
            <div className="mb-5 flex flex-wrap gap-2" role="tablist" aria-label="Dashboard sections">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  role="tab"
                  aria-selected={activeTab === tab.id}
                  aria-controls={`tabpanel-${tab.id}`}
                  className={`inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-teal-300 focus:ring-offset-2 focus:ring-offset-stone-900 ${
                    activeTab === tab.id
                      ? 'bg-teal-300 text-stone-950'
                      : 'border border-white/10 bg-white/[0.04] text-stone-300 hover:bg-white/[0.08]'
                  }`}
                >
                  {tab.label}
                  {typeof tab.count === 'number' && (
                    <span className={`rounded-full px-2 py-0.5 text-xs ${activeTab === tab.id ? 'bg-stone-950/10' : 'bg-white/[0.08]'}`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {activeTab === 'overview' && (
              <div role="tabpanel" id="tabpanel-overview" className="grid gap-6 xl:grid-cols-[minmax(0,1.3fr),380px]">
                <section className="surface-panel-strong p-6">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-[0.22em] text-stone-500">High-signal modules</p>
                      <h2 className="mt-2 text-3xl font-bold text-white">Everything requested is now anchored in one workflow</h2>
                    </div>
                    <Sparkles className="h-5 w-5 text-amber-200" />
                  </div>

                  <div className="mt-6 grid gap-4 md:grid-cols-2">
                    {[
                      {
                        title: 'Real-time collaboration',
                        description: 'WebSocket-ready editor channel with browser-tab sync fallback for instant testing.',
                        icon: Users,
                      },
                      {
                        title: 'Snippet marketplace',
                        description: 'Filterable catalog with pricing, ratings, offer types, and publish-from-workspace flow.',
                        icon: Store,
                      },
                      {
                        title: 'Project templates',
                        description: 'Launch a starter directly into Monaco to iterate without leaving the dashboard.',
                        icon: Layers,
                      },
                      {
                        title: 'Deployment preview',
                        description: 'Hot reload iframe and preview snapshot opening from the editor sidebar.',
                        icon: Rocket,
                      },
                      {
                        title: 'Client chat',
                        description: 'Buyers can message you from project pages and every thread is collected here.',
                        icon: Users,
                      },
                    ].map((feature) => {
                      const Icon = feature.icon

                      return (
                        <article key={feature.title} className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-5">
                          <Icon className="h-5 w-5 text-teal-200" />
                          <h3 className="mt-4 text-lg font-bold text-white">{feature.title}</h3>
                          <p className="mt-2 text-sm leading-6 text-stone-400">{feature.description}</p>
                        </article>
                      )
                    })}
                  </div>
                </section>

                <section className="surface-panel-strong p-6">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-[0.22em] text-stone-500">Quick actions</p>
                      <h2 className="mt-2 text-2xl font-bold text-white">Fast lane</h2>
                    </div>
                    <Zap className="h-5 w-5 text-teal-200" />
                  </div>

                  <div className="mt-5 space-y-3">
                    <button onClick={() => handleLaunchTemplate(projectTemplateSeed[0])} className="flex w-full items-center justify-between rounded-3xl border border-white/10 bg-white/[0.04] px-4 py-4 text-left transition hover:bg-white/[0.08]">
                      <span>
                        <span className="block text-sm font-semibold text-white">Start with SaaS template</span>
                        <span className="mt-1 block text-xs text-stone-500">Pushes the full starter into the live workspace</span>
                      </span>
                      <Rocket className="h-4 w-4 text-teal-200" />
                    </button>

                    <button onClick={() => handleTabChange('snippets')} className="flex w-full items-center justify-between rounded-3xl border border-white/10 bg-white/[0.04] px-4 py-4 text-left transition hover:bg-white/[0.08]">
                      <span>
                        <span className="block text-sm font-semibold text-white">Open advanced snippet search</span>
                        <span className="mt-1 block text-xs text-stone-500">Filter by technology, price, rating, and offer type</span>
                      </span>
                      <Search className="h-4 w-4 text-sky-200" />
                    </button>

                    <button onClick={() => handleTabChange('notifications')} className="flex w-full items-center justify-between rounded-3xl border border-white/10 bg-white/[0.04] px-4 py-4 text-left transition hover:bg-white/[0.08]">
                      <span>
                        <span className="block text-sm font-semibold text-white">Review notifications</span>
                        <span className="mt-1 block text-xs text-stone-500">Track new project briefs, snippet sales, and workspace updates</span>
                      </span>
                      <Bell className="h-4 w-4 text-amber-200" />
                    </button>

                    <button onClick={() => handleTabChange('clients')} className="flex w-full items-center justify-between rounded-3xl border border-white/10 bg-white/[0.04] px-4 py-4 text-left transition hover:bg-white/[0.08]">
                      <span>
                        <span className="block text-sm font-semibold text-white">Open buyer chat</span>
                        <span className="mt-1 block text-xs text-stone-500">Reply to incoming questions from users before they purchase</span>
                      </span>
                      <Users className="h-4 w-4 text-sky-200" />
                    </button>
                  </div>
                </section>
              </div>
            )}

            {activeTab === 'projects' && (
              <div className="space-y-6">
                <section className="surface-panel-strong p-6">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-[0.22em] text-stone-500">Project listings</p>
                      <h2 className="mt-2 text-3xl font-bold text-white">Publish and manage buyer-facing projects</h2>
                      <p className="mt-3 max-w-2xl text-sm leading-6 text-stone-400">
                        These cards are visible on the marketplace side. Users can open them, browse previews, and send you messages about a purchase or customization.
                      </p>
                    </div>
                    <button onClick={() => navigate('/create')} className="btn-primary">
                      <Rocket className="h-4 w-4" />
                      New project listing
                    </button>
                  </div>
                </section>

                {publishedProjects.length === 0 ? (
                  <div className="surface-panel-strong px-6 py-16 text-center">
                    <h3 className="text-2xl font-bold text-white">No published projects yet</h3>
                    <p className="mt-3 text-stone-400">Open the creator flow and publish your first listing.</p>
                  </div>
                ) : (
                  <section className="grid gap-6 lg:grid-cols-2">
                    {publishedProjects.map((project) => (
                      <article key={project.id} className="surface-panel-strong overflow-hidden">
                        <div className="h-48 overflow-hidden">
                          {project.thumbnailUrl ? (
                            <img src={project.thumbnailUrl} alt={project.title} className="h-full w-full object-cover" />
                          ) : (
                            <div className="flex h-full items-center justify-center bg-white/[0.04] text-stone-500">
                              Preview pending
                            </div>
                          )}
                        </div>
                        <div className="p-6">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <h3 className="text-2xl font-bold text-white">{project.title}</h3>
                              <p className="mt-2 text-sm leading-6 text-stone-400">{project.description}</p>
                            </div>
                            <span className="font-['Space_Grotesk'] text-3xl font-bold text-amber-200">${project.price}</span>
                          </div>

                          <div className="mt-5 flex flex-wrap gap-2">
                            {project.tags.map((tag) => (
                              <span key={tag} className="tag-pill">
                                #{tag}
                              </span>
                            ))}
                          </div>

                          <div className="mt-6 grid grid-cols-3 gap-3">
                            <div className="rounded-2xl border border-white/8 bg-white/[0.04] p-3 text-center">
                              <p className="text-xs uppercase tracking-[0.2em] text-stone-500">Likes</p>
                              <p className="mt-2 font-['Space_Grotesk'] text-2xl font-bold text-white">{project.likesCount ?? 0}</p>
                            </div>
                            <div className="rounded-2xl border border-white/8 bg-white/[0.04] p-3 text-center">
                              <p className="text-xs uppercase tracking-[0.2em] text-stone-500">Comments</p>
                              <p className="mt-2 font-['Space_Grotesk'] text-2xl font-bold text-white">{project.commentsCount ?? 0}</p>
                            </div>
                            <div className="rounded-2xl border border-white/8 bg-white/[0.04] p-3 text-center">
                              <p className="text-xs uppercase tracking-[0.2em] text-stone-500">Status</p>
                              <p className="mt-2 text-sm font-semibold text-white">{project.status}</p>
                            </div>
                          </div>

                          <div className="mt-6 flex flex-wrap gap-3 border-t border-white/10 pt-5">
                            <button onClick={() => navigate(`/project/${project.id}`)} className="btn-secondary rounded-full px-4 py-2">
                              View listing
                            </button>
                            <button onClick={() => handleTabChange('clients')} className="btn-secondary rounded-full px-4 py-2">
                              Open client chat
                            </button>
                          </div>
                        </div>
                      </article>
                    ))}
                  </section>
                )}
              </div>
            )}

            {activeTab === 'clients' && (
              <div className="space-y-6">
                <section className="surface-panel-strong p-6">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-[0.22em] text-stone-500">Buyer chat</p>
                      <h2 className="mt-2 text-3xl font-bold text-white">Direct messages from clients</h2>
                      <p className="mt-3 max-w-2xl text-sm leading-6 text-stone-400">
                        Every inquiry sent from a project page is stored here so you can qualify the client and continue the sale.
                      </p>
                    </div>
                    <button onClick={markAllNotificationsAsRead} className="btn-secondary rounded-full px-4 py-2">
                      <CheckCircle2 className="h-4 w-4" />
                      Clear dashboard alerts
                    </button>
                  </div>
                </section>

                {clientConversations.length === 0 ? (
                  <div className="surface-panel-strong px-6 py-16 text-center">
                    <h3 className="text-2xl font-bold text-white">No client threads yet</h3>
                    <p className="mt-3 text-stone-400">When a buyer writes from a listing, the conversation will appear here.</p>
                  </div>
                ) : (
                  <div className="grid gap-6 xl:grid-cols-2">
                    {clientConversations.map((conversation) => (
                      <article key={conversation.id} className="surface-panel-strong p-6">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="text-xs uppercase tracking-[0.18em] text-stone-500">Project</p>
                            <h3 className="mt-1 text-2xl font-bold text-white">{conversation.projectTitle}</h3>
                            <p className="mt-2 text-sm text-stone-400">Client: @{conversation.clientUsername}</p>
                          </div>
                          <span className="rounded-full border border-sky-300/20 bg-sky-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-sky-100">
                            {conversation.unreadForDeveloper} unread
                          </span>
                        </div>

                        <div className="mt-5 space-y-3">
                          {conversation.messages.slice(-3).map((message) => (
                            <div key={message.id} className="rounded-2xl border border-white/8 bg-white/[0.04] p-4">
                              <div className="flex items-center justify-between gap-3">
                                <p className="font-medium text-white">@{message.senderUsername}</p>
                                <span className="text-xs uppercase tracking-[0.18em] text-stone-500">
                                  {new Date(message.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                              <p className="mt-2 text-sm leading-6 text-stone-300">{message.body}</p>
                            </div>
                          ))}
                        </div>

                        <div className="mt-5 space-y-3 border-t border-white/10 pt-5">
                          <textarea
                            value={replyDrafts[conversation.id] ?? ''}
                            onChange={(event) =>
                              setReplyDrafts((current) => ({
                                ...current,
                                [conversation.id]: event.target.value,
                              }))
                            }
                            className="input-base min-h-[110px] resize-none"
                            placeholder="Reply to the client from your workspace..."
                          />
                          <div className="flex justify-end">
                            <button onClick={() => handleDeveloperReply(conversation)} className="btn-primary rounded-full px-4 py-2">
                              Reply
                            </button>
                          </div>
                        </div>

                        <div className="mt-5 flex flex-wrap gap-3 border-t border-white/10 pt-5">
                          <button
                            onClick={() => {
                              markConversationAsRead(conversation.id, 'DEVELOPER')
                              setClientConversations(getUserConversations(user.id, 'DEVELOPER'))
                            }}
                            className="btn-secondary rounded-full px-4 py-2"
                          >
                            Mark as read
                          </button>
                          <button onClick={() => navigate(`/project/${conversation.projectId}`)} className="btn-secondary rounded-full px-4 py-2">
                            Open project page
                          </button>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'snippets' && (
              <div className="space-y-6">
                <section className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
                  {filteredSnippets.map((snippet) => (
                    <article key={snippet.id} className="surface-panel-strong p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <span className="rounded-full border border-teal-300/20 bg-teal-300/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-teal-100">
                            {snippet.type}
                          </span>
                          <h3 className="mt-4 text-2xl font-bold text-white">{snippet.title}</h3>
                        </div>
                        <span className="font-['Space_Grotesk'] text-3xl font-bold text-amber-200">${snippet.price}</span>
                      </div>

                      <p className="mt-3 text-sm leading-6 text-stone-400">{snippet.description}</p>

                      <div className="mt-5 flex flex-wrap gap-2">
                        {snippet.technologies.map((technology) => (
                          <span key={technology} className="tag-pill">
                            #{technology}
                          </span>
                        ))}
                      </div>

                      <div className="mt-6 grid grid-cols-3 gap-3">
                        <div className="rounded-2xl border border-white/8 bg-white/[0.04] p-3 text-center">
                          <p className="text-xs uppercase tracking-[0.2em] text-stone-500">Rating</p>
                          <p className="mt-2 font-['Space_Grotesk'] text-2xl font-bold text-white">{snippet.rating.toFixed(1)}</p>
                        </div>
                        <div className="rounded-2xl border border-white/8 bg-white/[0.04] p-3 text-center">
                          <p className="text-xs uppercase tracking-[0.2em] text-stone-500">Sales</p>
                          <p className="mt-2 font-['Space_Grotesk'] text-2xl font-bold text-white">{snippet.sales}</p>
                        </div>
                        <div className="rounded-2xl border border-white/8 bg-white/[0.04] p-3 text-center">
                          <p className="text-xs uppercase tracking-[0.2em] text-stone-500">Files</p>
                          <p className="mt-2 font-['Space_Grotesk'] text-2xl font-bold text-white">{snippet.files.length}</p>
                        </div>
                      </div>

                      <div className="mt-6 flex items-center justify-between gap-3 border-t border-white/10 pt-5">
                        <div>
                          <p className="text-sm font-semibold text-white">@{snippet.author}</p>
                          <p className="text-xs text-stone-500">Updated {formatRelativeDate(snippet.updatedAt)}</p>
                        </div>
                        <button onClick={() => handleLoadSnippet(snippet)} className="btn-secondary rounded-full px-4 py-2">
                          <Code2 className="h-4 w-4" />
                          Load
                        </button>
                      </div>
                    </article>
                  ))}
                </section>

                {filteredSnippets.length === 0 && (
                  <div className="surface-panel-strong px-6 py-16 text-center">
                    <h3 className="text-2xl font-bold text-white">No snippets match these filters</h3>
                    <p className="mt-3 text-stone-400">Try a broader technology or lower the minimum rating.</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'templates' && (
              <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
                {filteredTemplates.map((template) => (
                  <article key={template.id} className="surface-panel-strong p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <span className="rounded-full border border-amber-300/20 bg-amber-300/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-100">
                          {template.category}
                        </span>
                        <h3 className="mt-4 text-2xl font-bold text-white">{template.name}</h3>
                      </div>
                      <Box className="h-5 w-5 text-teal-200" />
                    </div>

                    <p className="mt-3 text-sm leading-6 text-stone-400">{template.description}</p>

                    <div className="mt-5 flex flex-wrap gap-2">
                      {template.technologies.map((technology) => (
                        <span key={technology} className="tag-pill">
                          #{technology}
                        </span>
                      ))}
                    </div>

                    <div className="mt-6 flex items-center justify-between rounded-3xl border border-white/10 bg-white/[0.04] px-4 py-4">
                      <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-stone-500">Estimated setup</p>
                        <p className="mt-1 font-semibold text-white">{template.estimatedSetup}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs uppercase tracking-[0.2em] text-stone-500">Downloads</p>
                        <p className="mt-1 font-semibold text-white">{template.downloads}</p>
                      </div>
                    </div>

                    <div className="mt-6 flex items-center justify-between gap-3 border-t border-white/10 pt-5">
                      <div className="inline-flex items-center gap-2 text-sm text-stone-300">
                        <Star className="h-4 w-4 text-amber-200" />
                        {template.rating.toFixed(1)}
                      </div>
                      <button onClick={() => handleLaunchTemplate(template)} className="btn-primary rounded-full px-4 py-2">
                        <Rocket className="h-4 w-4" />
                        Start
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}

            {activeTab === 'editor' && (
              <div className="space-y-6">
                <section className="surface-panel-strong p-6">
                  <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr),380px]">
                    <div>
                      <p className="text-xs uppercase tracking-[0.22em] text-stone-500">Workspace source</p>
                      <h2 className="mt-2 text-3xl font-bold text-white">{workspacePreset.label}</h2>
                      <p className="mt-3 max-w-2xl text-sm leading-6 text-stone-400">
                        Edit this starter, watch the hot reload preview update instantly, and publish the result as a snippet offer from the panel on the right.
                      </p>

                      <div className="mt-5 flex flex-wrap gap-2">
                        {workspacePreset.files.map((file) => (
                          <span key={file.name} className="tag-pill">
                            {file.name}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="rounded-[1.75rem] border border-white/10 bg-white/[0.04] p-5">
                      <p className="text-sm font-semibold text-white">Publish current workspace as a snippet</p>
                      <div className="mt-4 space-y-3">
                        <input
                          type="text"
                          value={publishTitle}
                          onChange={(event) => setPublishTitle(event.target.value)}
                          className="input-base"
                          placeholder="Snippet title"
                        />
                        <input
                          type="number"
                          min="5"
                          value={publishPrice}
                          onChange={(event) => setPublishPrice(Number(event.target.value))}
                          className="input-base"
                          placeholder="Price"
                        />
                        <input
                          type="text"
                          value={publishTags}
                          onChange={(event) => setPublishTags(event.target.value)}
                          className="input-base"
                          placeholder="react, monaco, websocket"
                        />
                        <button onClick={handlePublishSnippet} className="btn-primary w-full justify-center rounded-2xl">
                          <Coins className="h-4 w-4" />
                          Publish snippet
                        </button>
                      </div>
                    </div>
                  </div>
                </section>

                <MonacoCodeEditor
                  initialFiles={workspacePreset.files}
                  seedKey={workspacePreset.id}
                  onFilesChange={(files) => {
                    setWorkspaceFiles(files.map((file) => ({
                      name: file.name,
                      content: file.content,
                      language: file.language,
                    })))
                  }}
                  onSave={(files) => {
                    setWorkspaceFiles(files.map((file) => ({
                      name: file.name,
                      content: file.content,
                      language: file.language,
                    })))
                  }}
                />
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="surface-panel-strong p-6">
                <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.22em] text-stone-500">Notification center</p>
                    <h2 className="mt-2 text-3xl font-bold text-white">Projects, sales, and workspace alerts</h2>
                  </div>
                  <button onClick={markAllNotificationsAsRead} className="btn-secondary rounded-full px-4 py-2">
                    <CheckCircle2 className="h-4 w-4" />
                    Mark all as read
                  </button>
                </div>

                <div className="space-y-4">
                  {notifications.map((notification) => (
                    <article key={notification.id} className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-5">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className={`rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${notificationTone[notification.type]}`}>
                              {notification.type}
                            </span>
                            {notification.unread && (
                              <span className="rounded-full bg-teal-300/15 px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-teal-100">
                                unread
                              </span>
                            )}
                          </div>
                          <h3 className="mt-4 text-xl font-bold text-white">{notification.title}</h3>
                          <p className="mt-2 text-sm leading-6 text-stone-400">{notification.message}</p>
                        </div>
                        <p className="text-sm text-stone-500">{formatRelativeDate(notification.createdAt)}</p>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}
