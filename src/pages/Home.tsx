import React, { useEffect, useState } from 'react'
import {
  ArrowRight,
  Clock3,
  Eye,
  Grid,
  Heart,
  LayoutList,
  MessageCircle,
  Rocket,
  Search,
  Sparkles,
  Star,
  TrendingUp,
  Users,
} from 'lucide-react'
import { Project } from '../types/index'
import { useNavigate } from 'react-router-dom'
import { ProjectService } from '../services/projectService'

const formatPrice = (project: Project) => {
  const value = project.basePrice ?? project.price ?? 0
  return `$${value.toLocaleString()}`
}

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

const ProjectCard: React.FC<{ project: Project; viewMode: 'grid' | 'list' }> = ({ project, viewMode }) => {
  const [isLiked, setIsLiked] = useState(false)
  const navigate = useNavigate()
  const isList = viewMode === 'list'

  return (
    <article
      className={`project-card group ${isList ? 'md:grid md:grid-cols-[300px,1fr]' : ''}`}
      onClick={() => navigate(`/project/${project.id}`)}
    >
      <div className={`relative overflow-hidden ${isList ? 'h-full min-h-[260px]' : 'h-64'}`}>
        <img
          src={project.thumbnailUrl}
          alt={project.title}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/25 to-transparent" />
        <div className="absolute left-4 right-4 top-4 flex items-start justify-between gap-3">
          <span className="tag-pill border-amber-300/20 bg-amber-300/15 text-amber-50">
            {formatPrice(project)}
          </span>
          <span className="tag-pill">{project.tags[0]}</span>
        </div>
        <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-sm text-stone-200">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/25 px-3 py-1 backdrop-blur">
            <Eye className="h-4 w-4 text-teal-200" />
            {(project.likesCount ?? 0) * 9 + 320}
          </span>
          <span className="rounded-full border border-white/10 bg-black/25 px-3 py-1 backdrop-blur">
            {formatDate(project.createdAt)}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-5 p-6">
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {project.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="tag-pill text-stone-300">
                #{tag}
              </span>
            ))}
          </div>
          <div>
            <h3 className="text-2xl font-bold tracking-tight text-white">{project.title}</h3>
            <p className="mt-2 line-clamp-3 text-sm leading-6 text-stone-300">{project.description}</p>
          </div>
        </div>

        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img
              src={typeof project.author === 'string' ? 'https://api.dicebear.com/9.x/shapes/svg?seed=' + project.author : (project.author.avatarUrl || 'https://api.dicebear.com/9.x/shapes/svg?seed=' + project.author.username)}
              alt={typeof project.author === 'string' ? project.author : project.author.username}
              className="h-11 w-11 rounded-full border border-white/10 object-cover"
            />
            <div>
              <p className="text-sm font-semibold text-white">@{typeof project.author === 'string' ? project.author : project.author.username}</p>
              <p className="text-xs text-stone-500">{typeof project.author === 'string' ? 'Developer' : (project.author.bio || 'Developer')}</p>
            </div>
          </div>
          <div className="hidden text-right md:block">
            <p className="text-xs uppercase tracking-[0.24em] text-stone-500">Base price</p>
            <p className="mt-1 font-['Space_Grotesk'] text-2xl font-bold text-amber-200">
              {formatPrice(project)}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-white/8 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-2 text-sm text-stone-400">
            <button
              onClick={(event) => {
                event.stopPropagation()
                setIsLiked((value) => !value)
              }}
              className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 transition ${
                isLiked
                  ? 'border-rose-300/30 bg-rose-300/15 text-rose-100'
                  : 'border-white/10 bg-white/[0.05] text-stone-300 hover:bg-white/[0.08]'
              }`}
            >
              <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
              {(project.likesCount ?? 0) + (isLiked ? 1 : 0)}
            </button>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-3 py-2">
              <MessageCircle className="h-4 w-4 text-teal-200" />
              {project.commentsCount ?? 0}
            </span>
          </div>
          <button
            onClick={(event) => {
              event.stopPropagation()
              navigate(`/project/${project.id}`)
            }}
            className="btn-secondary rounded-full px-4 py-2.5"
          >
            Open project
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </article>
  )
}

const Home: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'trending' | 'latest' | 'top'>('trending')
  const [searchTerm, setSearchTerm] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [projects, setProjects] = useState<Project[]>([])
  const navigate = useNavigate()

  useEffect(() => {
    ProjectService.getAllProjects().then(setProjects)
  }, [])

  const filteredProjects = projects
    .filter((project) => {
      const query = searchTerm.trim().toLowerCase()
      if (!query) return true

      return [
        project.title,
        project.description,
        project.author.username,
        ...(project.tags ?? []),
      ]
        .join(' ')
        .toLowerCase()
        .includes(query)
    })
    .sort((left, right) => {
      if (activeTab === 'latest') {
        return new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()
      }

      if (activeTab === 'top') {
        return (right.likesCount ?? 0) - (left.likesCount ?? 0)
      }

      return (right.commentsCount ?? 0) + (right.likesCount ?? 0) - ((left.commentsCount ?? 0) + (left.likesCount ?? 0))
    })

  const featuredDevelopers = ['devmaster', 'coder123', 'webdev'].map((username) => {
    const authorProjects = projects.filter((project) => project.author.username === username)

    return {
      username,
      avatar: authorProjects[0]?.author.avatarUrl,
      likes: authorProjects.reduce((sum, project) => sum + (project.likesCount ?? 0), 0),
      projects: authorProjects.length,
      revenue: authorProjects.reduce((sum, project) => sum + (project.basePrice ?? project.price ?? 0), 0),
      bio: authorProjects[0]?.author.bio ?? 'Independent developer',
    }
  })

  const heroStats = [
    { label: 'Curated projects', value: '120+' },
    { label: 'Active builders', value: '38' },
    { label: 'Avg. response', value: '< 2h' },
  ]

  return (
    <div className="app-shell pb-16">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[34rem] bg-[radial-gradient(circle_at_top,rgba(45,212,191,0.18),transparent_35%),radial-gradient(circle_at_70%_15%,rgba(251,191,36,0.14),transparent_24%)]" />

      <section className="section-shell pt-10 sm:pt-14">
        <div className="grid gap-8 lg:grid-cols-[1.15fr,0.85fr] lg:items-end">
          <div className="space-y-8">
            <span className="eyebrow">
              <Sparkles className="h-3.5 w-3.5" />
              Curated by developers
            </span>

            <div className="space-y-5">
              <h1 className="max-w-4xl text-balance text-5xl font-bold tracking-tight text-white sm:text-6xl">
                Better than a code dump.
                <span className="block text-stone-400">A marketplace for polished, shippable projects.</span>
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-stone-300">
                Discover production-ready templates, MVPs, and launch kits with clear previews, sharp documentation,
                and people you can actually contact.
              </p>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row">
              <button className="btn-primary" onClick={() => setActiveTab('trending')}>
                <Rocket className="h-4 w-4" />
                Browse trending
              </button>
              <button className="btn-secondary" onClick={() => navigate(`/user/${featuredDevelopers[0]?.username ?? 'devmaster'}`)}>
                <Users className="h-4 w-4" />
                Meet top builders
              </button>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {heroStats.map((stat) => (
                <div key={stat.label} className="stat-tile">
                  <p className="text-xs uppercase tracking-[0.2em] text-stone-500">{stat.label}</p>
                  <p className="mt-3 font-['Space_Grotesk'] text-3xl font-bold text-white">{stat.value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="surface-panel-strong overflow-hidden p-6 sm:p-8">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-stone-500">This week</p>
                <h2 className="mt-2 text-2xl font-bold text-white">Launch-ready picks</h2>
              </div>
              <span className="rounded-full border border-teal-300/20 bg-teal-300/10 px-3 py-1 text-xs font-semibold text-teal-100">
                Hand-reviewed
              </span>
            </div>

            <div className="mt-8 space-y-4">
              {projects.slice(0, 3).map((project, index) => (
                <button
                  key={project.id}
                  onClick={() => navigate(`/project/${project.id}`)}
                  className="flex w-full items-center gap-4 rounded-3xl border border-white/8 bg-white/[0.04] p-4 text-left transition hover:border-teal-300/25 hover:bg-white/[0.07]"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/8 text-sm font-bold text-stone-100">
                    0{index + 1}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-white">{project.title}</p>
                    <p className="mt-1 truncate text-sm text-stone-400">{project.author.username} · {project.tags.slice(0, 2).join(' / ')}</p>
                  </div>
                  <p className="font-['Space_Grotesk'] text-lg font-bold text-amber-200">{formatPrice(project)}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section-shell mt-12">
        <div className="surface-panel p-4 sm:p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-stone-500" />
              <input
                type="text"
                placeholder="Search by stack, niche, or creator"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                className="input-base pl-12"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {[
                { key: 'trending', label: 'Trending', icon: TrendingUp },
                { key: 'latest', label: 'Latest', icon: Clock3 },
                { key: 'top', label: 'Top rated', icon: Star },
              ].map((item) => {
                const Icon = item.icon

                return (
                  <button
                    key={item.key}
                    onClick={() => setActiveTab(item.key as typeof activeTab)}
                    className={`inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition ${
                      activeTab === item.key
                        ? 'bg-teal-300 text-stone-950'
                        : 'border border-white/10 bg-white/[0.04] text-stone-300 hover:bg-white/[0.08]'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </button>
                )
              })}

              <button
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                className="btn-ghost rounded-full border border-white/10 bg-white/[0.04] px-4 py-2.5"
              >
                {viewMode === 'grid' ? <LayoutList className="h-4 w-4" /> : <Grid className="h-4 w-4" />}
                {viewMode === 'grid' ? 'List view' : 'Grid view'}
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="section-shell mt-10">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.22em] text-stone-500">Marketplace picks</p>
            <h2 className="mt-2 text-3xl font-bold text-white">
              {filteredProjects.length} projects worth opening
            </h2>
          </div>
          <p className="max-w-xl text-sm leading-6 text-stone-400">
            Every card gives you pricing, preview context, and builder info up front, so browsing feels faster and more trustworthy.
          </p>
        </div>

        {filteredProjects.length === 0 ? (
          <div className="surface-panel-strong px-6 py-16 text-center">
            <h3 className="text-2xl font-bold text-white">No matches yet</h3>
            <p className="mt-3 text-stone-400">Try a stack name, creator, or broader category.</p>
          </div>
        ) : (
          <div className={`grid gap-6 ${viewMode === 'grid' ? 'lg:grid-cols-2' : 'grid-cols-1'}`}>
            {filteredProjects.map((project) => (
              <ProjectCard key={project.id} project={project} viewMode={viewMode} />
            ))}
          </div>
        )}
      </section>

      <section className="section-shell mt-16">
        <div className="grid gap-6 lg:grid-cols-3">
          {featuredDevelopers.map((developer, index) => (
            <article key={developer.username} className="surface-panel-strong p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <img
                    src={developer.avatar}
                    alt={developer.username}
                    className="h-14 w-14 rounded-2xl border border-white/10 object-cover"
                  />
                  <div>
                    <p className="text-xs uppercase tracking-[0.22em] text-stone-500">Builder 0{index + 1}</p>
                    <h3 className="mt-1 text-2xl font-bold text-white">@{developer.username}</h3>
                  </div>
                </div>
                <span className="tag-pill border-amber-300/20 bg-amber-300/12 text-amber-100">
                  Featured
                </span>
              </div>

              <p className="mt-5 text-sm leading-6 text-stone-300">{developer.bio}</p>

              <div className="mt-6 grid grid-cols-3 gap-3">
                <div className="stat-tile p-4 text-center">
                  <p className="font-['Space_Grotesk'] text-2xl font-bold text-white">{developer.projects}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.16em] text-stone-500">Projects</p>
                </div>
                <div className="stat-tile p-4 text-center">
                  <p className="font-['Space_Grotesk'] text-2xl font-bold text-white">{developer.likes}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.16em] text-stone-500">Likes</p>
                </div>
                <div className="stat-tile p-4 text-center">
                  <p className="font-['Space_Grotesk'] text-2xl font-bold text-white">${developer.revenue}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.16em] text-stone-500">Value</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="section-shell mt-16">
        <div className="surface-panel-strong overflow-hidden px-6 py-10 sm:px-10">
          <div className="grid gap-8 lg:grid-cols-[1fr,auto] lg:items-center">
            <div>
              <span className="eyebrow border-amber-300/20 bg-amber-300/10 text-amber-50">
                Ready to ship faster
              </span>
              <h2 className="mt-5 max-w-2xl text-4xl font-bold tracking-tight text-white">
                Save days of setup and get straight to customization.
              </h2>
              <p className="mt-4 max-w-2xl text-base leading-7 text-stone-300">
                Browse a cleaner catalog, open a live preview, and reach the builder before you buy. That is the whole point.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
              <button className="btn-primary" onClick={() => projects[0] && navigate(`/project/${projects[0].id}`)}>
                Open featured project
              </button>
              <button className="btn-secondary" onClick={() => setSearchTerm('react')}>
                Search React builds
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home
