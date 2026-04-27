import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Calendar,
  Code,
  DollarSign,
  Download,
  Eye,
  Heart,
  MessageCircle,
  Play,
  Share2,
  ShoppingCart,
  Star,
} from 'lucide-react'
import { ProjectsAPI } from '../api/projects'
import { useAuth } from '../hooks/useAuth'
import CommentSection from './CommentSection'
import {
  Conversation,
  Project,
  User as MarketplaceUser,
} from '../types/index'
import {
  getProjectConversations,
  getUserConversations,
  markConversationAsRead,
  sendMarketplaceMessage,
} from '../services/authService'

const ProjectViewer: React.FC = () => {
  const { user } = useAuth()
  const params = useParams()
  const navigate = useNavigate()
  const id = params.id as string
  const [project, setProject] = useState<Project | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isLiked, setIsLiked] = useState(false)
  const [showCode, setShowCode] = useState(false)
  const [showDemo, setShowDemo] = useState(false)
  const [isPurchasing, setIsPurchasing] = useState(false)
  const [error, setError] = useState('')
  const [messageDraft, setMessageDraft] = useState('')
  const [sendingMessage, setSendingMessage] = useState(false)
  const [projectConversations, setProjectConversations] = useState<Conversation[]>([])

  useEffect(() => {
    if (id) {
      loadProject(id)
    }
  }, [id])

  const loadProject = async (projectId: string) => {
    try {
      setIsLoading(true)
      const response = await ProjectsAPI.getProjectById(projectId)

      if (response.success && response.data) {
        setProject(response.data)
        if (user) {
          setIsLiked(response.data.likes?.some((like: { userId: string }) => like.userId === user.id) ?? false)
        }
      } else {
        setError('Project not found')
      }
    } catch (loadError) {
      console.error('Failed to load project:', loadError)
      setError('Failed to load project')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (!project || !user) {
      setProjectConversations([])
      return
    }

    if (user.accountType === 'DEVELOPER' && user.id === project.authorId) {
      const nextConversations = getProjectConversations(project.id)
      nextConversations.forEach((conversation) => {
        if (conversation.unreadForDeveloper > 0) {
          markConversationAsRead(conversation.id, 'DEVELOPER')
        }
      })
      setProjectConversations(getProjectConversations(project.id))
      return
    }

    if (user.accountType === 'USER') {
      const ownConversation = getUserConversations(user.id, 'USER').filter(
        (conversation) => conversation.projectId === project.id,
      )
      ownConversation.forEach((conversation) => {
        if (conversation.unreadForClient > 0) {
          markConversationAsRead(conversation.id, 'USER')
        }
      })
      setProjectConversations(
        getUserConversations(user.id, 'USER').filter((conversation) => conversation.projectId === project.id),
      )
      return
    }

    setProjectConversations([])
  }, [project, user])

  const handleLike = async () => {
    if (!user) {
      navigate('/login')
      return
    }

    try {
      const response = isLiked
        ? await ProjectsAPI.unlikeProject(user.id, project!.id)
        : await ProjectsAPI.likeProject(user.id, project!.id)

      if (response.success && response.data?.project) {
        setIsLiked(response.data.liked)
        setProject(response.data.project)
      }
    } catch (likeError) {
      console.error('Failed to like project:', likeError)
    }
  }

  const handlePurchase = async () => {
    if (!user || user.accountType !== 'USER') {
      setError('Only users can purchase projects')
      return
    }

    setIsPurchasing(true)

    try {
      setTimeout(() => {
        setIsPurchasing(false)
        alert('Purchase successful! You can now access the project files.')
        setShowCode(true)
      }, 1200)
    } catch (purchaseError) {
      console.error('Failed to purchase project:', purchaseError)
      setError('Failed to purchase project')
      setIsPurchasing(false)
    }
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: project?.title,
          text: project?.description,
          url: window.location.href,
        })
      } catch (shareError) {
        console.error('Failed to share:', shareError)
      }
    } else {
      await navigator.clipboard.writeText(window.location.href)
      alert('Link copied to clipboard!')
    }
  }

  const handleCommentAdded = (comment: any) => {
    setProject((previous) =>
      previous
        ? {
            ...previous,
            comments: [comment, ...(previous.comments || [])],
            commentsCount: (previous.commentsCount ?? previous.comments?.length ?? 0) + 1,
          }
        : null,
    )
  }

  const handleSendMessage = async () => {
    if (!project || !user || user.accountType !== 'USER') {
      return
    }

    const trimmedMessage = messageDraft.trim()
    if (!trimmedMessage) {
      return
    }

    setSendingMessage(true)
    setError('')

    try {
      const conversation = sendMarketplaceMessage({
        projectId: project.id,
        sender: user as MarketplaceUser,
        recipient: project.author,
        body: trimmedMessage,
      })

      setProjectConversations([conversation])
      setMessageDraft('')
    } catch (messageError) {
      console.error('Failed to send message:', messageError)
      setError('Failed to send your message to the builder')
    } finally {
      setSendingMessage(false)
    }
  }

  if (isLoading) {
    return (
      <div className="app-shell flex items-center justify-center px-4">
        <div className="surface-panel-strong w-full max-w-sm p-8 text-center">
          <div className="loading mx-auto mb-4" />
          <p className="font-medium text-stone-200">Loading project preview...</p>
        </div>
      </div>
    )
  }

  if (error || !project) {
    return (
      <div className="app-shell flex items-center justify-center px-4">
        <div className="surface-panel-strong w-full max-w-md p-8 text-center">
          <h2 className="text-2xl font-bold text-white">{error || 'Project not found'}</h2>
          <p className="mt-3 text-stone-400">Head back to the marketplace and try another project.</p>
          <button onClick={() => navigate('/')} className="btn-primary mt-6">
            Go home
          </button>
        </div>
      </div>
    )
  }

  const previewImage = project.thumbnailUrl || project.images?.[0]
  const primaryConversation = projectConversations[0]
  const statusTone =
    project.status === 'PUBLISHED'
      ? 'border-emerald-300/20 bg-emerald-300/10 text-emerald-100'
      : project.status === 'SOLD'
        ? 'border-amber-300/20 bg-amber-300/10 text-amber-100'
        : 'border-white/10 bg-white/[0.05] text-stone-200'

  const stats = [
    { label: 'Likes', value: project.likesCount, icon: Heart },
    { label: 'Comments', value: project.commentsCount, icon: MessageCircle },
    { label: 'Views', value: '1.2k', icon: Eye },
  ]

  return (
    <div className="section-shell py-10">
      <button onClick={() => navigate(-1)} className="btn-ghost mb-6 px-0 py-0">
        <ArrowLeft className="h-4 w-4" />
        Back
      </button>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr),360px]">
        <div className="space-y-8">
          <section className="surface-panel-strong overflow-hidden">
            <div className="relative h-72 overflow-hidden sm:h-96">
              {previewImage ? (
                <img src={previewImage} alt={project.title} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center bg-[radial-gradient(circle_at_top,rgba(45,212,191,0.18),transparent_35%),linear-gradient(180deg,rgba(17,24,39,0.96),rgba(28,25,23,0.96))]">
                  <span className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-medium text-stone-300">
                    Preview image coming soon
                  </span>
                </div>
              )}

              <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/25 to-transparent" />

              <div className="absolute left-6 right-6 top-6 flex flex-wrap items-center justify-between gap-3">
                <span className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${statusTone}`}>
                  {project.status}
                </span>
                <span className="rounded-full border border-white/12 bg-black/25 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-stone-200 backdrop-blur">
                  {project.category}
                </span>
              </div>

              <div className="absolute bottom-6 left-6 right-6">
                <div className="flex flex-wrap items-end justify-between gap-5">
                  <div className="max-w-3xl">
                    <h1 className="text-balance text-4xl font-bold tracking-tight text-white sm:text-5xl">{project.title}</h1>
                    <p className="mt-3 max-w-2xl text-sm leading-7 text-stone-300 sm:text-base">{project.description}</p>
                  </div>
                  <div className="rounded-[1.5rem] border border-white/10 bg-black/20 px-5 py-4 backdrop-blur">
                    <p className="text-xs uppercase tracking-[0.2em] text-stone-500">One-time purchase</p>
                    <div className="mt-2 flex items-center gap-2 font-['Space_Grotesk'] text-3xl font-bold text-amber-100">
                      <DollarSign className="h-6 w-6" />
                      {project.price}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 sm:p-7">
              <div className="flex flex-wrap gap-2">
                {project.tags.map((tag) => (
                  <span key={tag} className="tag-pill">
                    #{tag}
                  </span>
                ))}
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-3">
                {stats.map((stat) => {
                  const Icon = stat.icon

                  return (
                    <div key={stat.label} className="stat-tile p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/[0.06]">
                          <Icon className="h-4 w-4 text-teal-200" />
                        </div>
                        <div>
                          <p className="text-xs uppercase tracking-[0.18em] text-stone-500">{stat.label}</p>
                          <p className="mt-1 font-['Space_Grotesk'] text-2xl font-bold text-white">{stat.value}</p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  onClick={handleLike}
                  disabled={!user}
                  className={`inline-flex items-center gap-2 rounded-full border px-4 py-3 text-sm font-semibold transition ${
                    isLiked
                      ? 'border-rose-300/25 bg-rose-300/15 text-rose-100'
                      : 'border-white/10 bg-white/[0.05] text-stone-200 hover:bg-white/[0.09]'
                  } ${!user ? 'cursor-not-allowed opacity-50' : ''}`}
                >
                  <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
                  {isLiked ? 'Liked' : 'Like project'}
                </button>

                <button onClick={handleShare} className="btn-secondary">
                  <Share2 className="h-4 w-4" />
                  Share
                </button>

                {project.demoUrl && (
                  <button onClick={() => setShowDemo((value) => !value)} className="btn-secondary">
                    <Play className="h-4 w-4" />
                    {showDemo ? 'Hide demo' : 'Try demo'}
                  </button>
                )}

                {(showCode || user?.accountType === 'DEVELOPER') && (
                  <button onClick={() => setShowCode((value) => !value)} className="btn-secondary">
                    <Code className="h-4 w-4" />
                    {showCode ? 'Hide code' : 'View code'}
                  </button>
                )}
              </div>

              {error && <p className="mt-4 text-sm text-rose-300">{error}</p>}
            </div>
          </section>

          {showDemo && project.demoUrl && (
            <section className="surface-panel-strong p-6 sm:p-7">
              <div className="mb-5 flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-2xl font-bold text-white">Live demo</h2>
                  <p className="mt-2 text-sm text-stone-400">Explore the project in context before buying.</p>
                </div>
                <a href={project.demoUrl} target="_blank" rel="noopener noreferrer" className="btn-secondary">
                  Open in new tab
                </a>
              </div>
              <div className="overflow-hidden rounded-[1.5rem] border border-white/10 bg-white">
                <div className="aspect-video">
                  <iframe
                    src={project.demoUrl}
                    className="h-full w-full"
                    title="Project Demo"
                    sandbox="allow-scripts allow-same-origin allow-forms"
                  />
                </div>
              </div>
            </section>
          )}

          
          <CommentSection project={project as any} currentUser={user} onCommentAdded={handleCommentAdded} />

          {user?.accountType === 'USER' && user.id !== project.authorId && (
            <section className="surface-panel-strong p-6 sm:p-7">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-2xl font-bold text-white">Chat with builder</h2>
                  <p className="mt-2 text-sm text-stone-400">
                    Ask about customization, ownership transfer, or implementation details before you buy.
                  </p>
                </div>
                <span className="tag-pill border-sky-300/20 bg-sky-300/10 text-sky-100">
                  Direct contact
                </span>
              </div>

              <div className="mt-6 rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-4">
                {primaryConversation?.messages.length ? (
                  <div className="space-y-3">
                    {primaryConversation.messages.slice(-4).map((message) => (
                      <article key={message.id} className="rounded-2xl border border-white/8 bg-white/[0.04] p-4">
                        <div className="flex items-center justify-between gap-3">
                          <p className="font-medium text-white">@{message.senderUsername}</p>
                          <p className="text-xs uppercase tracking-[0.18em] text-stone-500">
                            {new Date(message.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <p className="mt-2 text-sm leading-6 text-stone-300">{message.body}</p>
                      </article>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm leading-6 text-stone-400">
                    This thread is empty for now. Send the first message to start a direct conversation with @{project.author.username}.
                  </p>
                )}
              </div>

              <div className="mt-5 space-y-3">
                <textarea
                  value={messageDraft}
                  onChange={(event) => setMessageDraft(event.target.value)}
                  className="input-base min-h-[130px] resize-none"
                  placeholder="Hej, interesuje mnie ten projekt. Czy mozesz dopisac..."
                />
                <div className="flex justify-end">
                  <button
                    onClick={handleSendMessage}
                    disabled={!messageDraft.trim() || sendingMessage}
                    className="btn-primary rounded-2xl px-5 py-3 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <MessageCircle className="h-4 w-4" />
                    {sendingMessage ? 'Sending...' : 'Send to builder'}
                  </button>
                </div>
              </div>
            </section>
          )}

          {user?.accountType === 'DEVELOPER' && user.id === project.authorId && (
            <section className="surface-panel-strong p-6 sm:p-7">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-2xl font-bold text-white">Client inbox</h2>
                  <p className="mt-2 text-sm text-stone-400">
                    Messages from buyers interested in this project land here and inside your dashboard.
                  </p>
                </div>
                <span className="tag-pill border-amber-300/20 bg-amber-300/10 text-amber-100">
                  {projectConversations.length} thread{projectConversations.length === 1 ? '' : 's'}
                </span>
              </div>

              <div className="mt-6 space-y-4">
                {projectConversations.length === 0 ? (
                  <div className="rounded-[1.5rem] border border-dashed border-white/10 bg-white/[0.03] px-6 py-10 text-center text-stone-400">
                    No buyer messages for this listing yet.
                  </div>
                ) : (
                  projectConversations.map((conversation) => (
                    <article key={conversation.id} className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-5">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <p className="text-xs uppercase tracking-[0.18em] text-stone-500">Client</p>
                          <h3 className="mt-1 text-lg font-bold text-white">@{conversation.clientUsername}</h3>
                        </div>
                        <span className="text-sm text-stone-500">
                          {new Date(conversation.lastMessageAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="mt-4 space-y-3">
                        {conversation.messages.slice(-2).map((message) => (
                          <div key={message.id} className="rounded-2xl border border-white/8 bg-black/15 p-4">
                            <p className="text-sm font-medium text-white">@{message.senderUsername}</p>
                            <p className="mt-2 text-sm leading-6 text-stone-300">{message.body}</p>
                          </div>
                        ))}
                      </div>
                    </article>
                  ))
                )}
              </div>
            </section>
          )}
        </div>

        <aside className="space-y-6">
          <section className="surface-panel-strong p-6">
            <p className="text-xs uppercase tracking-[0.22em] text-stone-500">Purchase access</p>
            <h2 className="mt-3 text-3xl font-bold text-white">${project.price}</h2>
            <p className="mt-3 text-sm leading-6 text-stone-400">
              One-time access to the build, with demo context and direct access to the creator profile.
            </p>

            {user?.accountType === 'USER' ? (
              <button
                onClick={handlePurchase}
                disabled={isPurchasing}
                className="btn-primary mt-6 w-full justify-center rounded-2xl py-3.5 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ShoppingCart className="h-4 w-4" />
                {isPurchasing ? 'Processing purchase...' : 'Purchase project'}
              </button>
            ) : (
              <button onClick={() => navigate('/login')} className="btn-secondary mt-6 w-full justify-center rounded-2xl py-3.5">
                Sign in as buyer
              </button>
            )}
          </section>

          <section className="surface-panel-strong p-6">
            <h3 className="text-xl font-bold text-white">Builder</h3>
            <div className="mt-5 flex items-center gap-3">
              <img
                src={project.author.avatarUrl || `https://via.placeholder.com/96/0F766E/FFFFFF?text=${project.author.username.slice(0, 2).toUpperCase()}`}
                alt={project.author.username}
                className="h-12 w-12 rounded-full border border-white/10 object-cover"
              />
              <div>
                <p className="font-semibold text-white">@{project.author.username}</p>
                <p className="text-sm text-stone-500">{project.author.bio || 'Independent developer'}</p>
              </div>
            </div>
            <button onClick={() => navigate(`/user/${project.author.username}`)} className="btn-secondary mt-5 w-full justify-center rounded-2xl py-3">
              View profile
            </button>
          </section>

          <section className="surface-panel-strong p-6">
            <h3 className="text-xl font-bold text-white">Project facts</h3>
            <div className="mt-5 space-y-4 text-sm text-stone-300">
              <div className="flex items-center justify-between gap-3">
                <span className="text-stone-500">Created</span>
                <span className="inline-flex items-center gap-2 text-white">
                  <Calendar className="h-4 w-4 text-teal-200" />
                  {new Date(project.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-stone-500">Updated</span>
                <span className="text-white">{new Date(project.updatedAt).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-stone-500">Category</span>
                <span className="text-white">{project.category}</span>
              </div>
            </div>
          </section>

          <section className="surface-panel-strong p-6">
            <h3 className="text-xl font-bold text-white">Quick actions</h3>
            <div className="mt-5 space-y-3">
              {project.githubUrl && (
                <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="btn-secondary w-full justify-center rounded-2xl py-3">
                  <Code className="h-4 w-4" />
                  View on GitHub
                </a>
              )}
              <button className="btn-secondary w-full justify-center rounded-2xl py-3">
                <Download className="h-4 w-4" />
                Download assets
              </button>
              <button className="btn-secondary w-full justify-center rounded-2xl py-3">
                <Star className="h-4 w-4" />
                Save for later
              </button>
            </div>
          </section>
        </aside>
      </div>
    </div>
  )
}

export default ProjectViewer
