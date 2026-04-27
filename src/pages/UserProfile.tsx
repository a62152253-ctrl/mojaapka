import React, { useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Calendar, ExternalLink, Heart, MapPin, MessageCircle, Star, TrendingUp } from 'lucide-react'
import { getUsers } from '../services/authService'

const UserProfile: React.FC = () => {
  const { username } = useParams()
  const navigate = useNavigate()

  const profileUser = useMemo(
    () => getUsers().find((user) => user.username.toLowerCase() === (username ?? '').toLowerCase()),
    [username],
  )
  const publishedProjects = useMemo(
    () => (username ? getProjectsByAuthor(username) : []),
    [username],
  )

  if (!profileUser) {
    return (
      <div className="section-shell py-10">
        <div className="surface-panel-strong p-8 text-center">
          <h1 className="text-3xl font-bold text-white">Profile not found</h1>
          <p className="mt-3 text-stone-400">The creator you are looking for does not exist yet.</p>
          <button onClick={() => navigate('/')} className="btn-primary mt-6">
            Back to home
          </button>
        </div>
      </div>
    )
  }

  const likes = publishedProjects.reduce((sum: number, project: any) => sum + (project.likesCount ?? 0), 0)
  const comments = publishedProjects.reduce((sum: number, project: any) => sum + (project.commentsCount ?? 0), 0)
  const totalValue = publishedProjects.reduce((sum: number, project: any) => sum + (project.price ?? 0), 0)
  const averagePrice = publishedProjects.length ? Math.round(totalValue / publishedProjects.length) : 0

  const stats = [
    { label: 'Projects', value: publishedProjects.length },
    { label: 'Likes', value: likes },
    { label: 'Comments', value: comments },
    { label: 'Avg value', value: `$${averagePrice}` },
  ]

  return (
    <div className="section-shell py-10">
      <button onClick={() => navigate('/')} className="btn-ghost mb-6 px-0 py-0">
        <ArrowLeft className="h-4 w-4" />
        Back to projects
      </button>

      <section className="surface-panel-strong overflow-hidden">
        <div className="h-40 bg-[radial-gradient(circle_at_20%_20%,rgba(45,212,191,0.32),transparent_28%),radial-gradient(circle_at_80%_25%,rgba(251,191,36,0.24),transparent_22%),linear-gradient(135deg,rgba(17,24,39,0.92),rgba(28,25,23,0.96))]" />

        <div className="px-6 pb-8 sm:px-8">
          <div className="-mt-14 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-end">
              <img
                src={profileUser.avatarUrl || profileUser.avatar || `https://api.dicebear.com/9.x/shapes/svg?seed=${profileUser.username}`}
                alt={profileUser.username}
                className="h-28 w-28 rounded-[1.75rem] border-4 border-stone-950 object-cover shadow-medium"
              />
              <div className="max-w-2xl">
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-4xl font-bold text-white">@{profileUser.username}</h1>
                  <span className="tag-pill border-amber-300/20 bg-amber-300/10 text-amber-50">
                    {profileUser.accountType === 'DEVELOPER' ? 'Featured builder' : 'Marketplace member'}
                  </span>
                </div>
                <p className="mt-3 text-base leading-7 text-stone-300">
                  {profileUser.bio || 'Active member of the DevBloxi marketplace.'}
                </p>
              </div>
            </div>

            <button className="btn-secondary self-start">Follow creator</button>
          </div>

          <div className="mt-8 grid gap-4 lg:grid-cols-[1.3fr,0.7fr]">
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="stat-tile flex items-center gap-3">
                <MapPin className="h-4 w-4 text-teal-200" />
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-stone-500">Mode</p>
                  <p className="mt-1 text-sm font-medium text-white">
                    {profileUser.accountType === 'DEVELOPER' ? 'Developer workspace' : 'Buyer account'}
                  </p>
                </div>
              </div>
              <a
                href={`mailto:${profileUser.email}`}
                className="stat-tile flex items-center gap-3 transition hover:bg-white/[0.08]"
              >
                <ExternalLink className="h-4 w-4 text-amber-200" />
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-stone-500">Contact</p>
                  <p className="mt-1 truncate text-sm font-medium text-white">{profileUser.email}</p>
                </div>
              </a>
              <div className="stat-tile flex items-center gap-3">
                <Calendar className="h-4 w-4 text-stone-400" />
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-stone-500">Joined</p>
                  <p className="mt-1 text-sm font-medium text-white">{new Date(profileUser.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {stats.map((stat) => (
                <div key={stat.label} className="stat-tile p-4 text-center">
                  <p className="font-['Space_Grotesk'] text-3xl font-bold text-white">{stat.value}</p>
                  <p className="mt-2 text-xs uppercase tracking-[0.18em] text-stone-500">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mt-10">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.22em] text-stone-500">Published work</p>
            <h2 className="mt-2 text-3xl font-bold text-white">Projects by @{profileUser.username}</h2>
          </div>
          <div className="flex gap-3">
            <button className="btn-secondary rounded-full px-4 py-2.5">
              <TrendingUp className="h-4 w-4" />
              Trending
            </button>
            <button className="btn-secondary rounded-full px-4 py-2.5">
              <Star className="h-4 w-4" />
              Most liked
            </button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {publishedProjects.map((project) => (
            <article key={project.id} className="project-card group cursor-pointer" onClick={() => navigate(`/project/${project.id}`)}>
              <div className="relative h-56 overflow-hidden">
                <img src={project.thumbnailUrl} alt={project.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950 to-transparent" />
                <span className="absolute right-4 top-4 rounded-full border border-amber-300/20 bg-amber-300/15 px-3 py-1 text-sm font-semibold text-amber-50">
                  ${project.price}
                </span>
              </div>

              <div className="p-5">
                <div className="flex flex-wrap gap-2">
                  {project.tags.map((tag: string) => (
                    <span key={tag} className="tag-pill">
                      #{tag}
                    </span>
                  ))}
                </div>
                <h3 className="mt-4 text-2xl font-bold text-white">{project.title}</h3>
                <div className="mt-5 flex items-center justify-between text-sm text-stone-400">
                  <span className="inline-flex items-center gap-2">
                    <Heart className="h-4 w-4 text-rose-300" />
                    {project.likesCount ?? 0}
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <MessageCircle className="h-4 w-4 text-teal-200" />
                    {project.commentsCount ?? 0}
                  </span>
                  <span>{new Date(project.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}

export default UserProfile
