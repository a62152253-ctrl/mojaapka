import { useNavigate } from 'react-router-dom'
import { ExternalLink, Eye, MessageCircle } from 'lucide-react'
import { User, Project } from '../types/index'
import LikeButton from './LikeButton'

interface ProjectCardProps {
  project: Project
  currentUser: User | null
}

export default function ProjectCard({ project, currentUser }: ProjectCardProps) {
  const navigate = useNavigate()
  const previewImage = project.thumbnailUrl || project.images?.[0]

  const handleProjectClick = () => {
    navigate(`/project/${project.id}`)
  }

  return (
    <article className="project-card group">
      <button onClick={handleProjectClick} className="block w-full text-left">
        <div className="relative h-52 overflow-hidden bg-stone-900">
          {previewImage ? (
            <img src={previewImage} alt={project.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
          ) : (
            <div className="flex h-full items-center justify-center bg-[radial-gradient(circle_at_top,rgba(45,212,191,0.15),transparent_32%),linear-gradient(180deg,rgba(17,24,39,0.96),rgba(28,25,23,0.96))]">
              <div className="text-center">
                <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-lg font-bold text-stone-200">
                  DB
                </div>
                <p className="text-sm text-stone-500">Preview coming soon</p>
              </div>
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/20 to-transparent" />

          <div className="absolute left-4 right-4 top-4 flex items-start justify-between gap-3">
            <span className="rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-100">
              {project.status}
            </span>

            {project.demoUrl && (
              <a
                href={project.demoUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(event) => event.stopPropagation()}
                className="inline-flex items-center gap-1 rounded-full border border-white/12 bg-black/20 px-3 py-1 text-xs font-medium text-white backdrop-blur transition hover:bg-black/35"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                Demo
              </a>
            )}
          </div>

          <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-stone-400">Base price</p>
              <p className="mt-1 font-['Space_Grotesk'] text-2xl font-bold text-amber-100">${project.price}</p>
            </div>
            <div className="rounded-full border border-white/12 bg-black/25 px-3 py-1 text-xs font-medium text-stone-200 backdrop-blur">
              {project.category}
            </div>
          </div>
        </div>
      </button>

      <div className="p-6">
        <button onClick={handleProjectClick} className="block text-left">
          <h3 className="text-xl font-bold text-white transition group-hover:text-teal-100">{project.title}</h3>
          <p className="mt-2 line-clamp-2 text-sm leading-6 text-stone-400">{project.description}</p>
        </button>

        <div className="mt-5 flex items-center gap-3">
          <img
            src={project.author.avatar || project.author.avatarUrl || '/default-avatar.png'}
            alt={project.author.username}
            className="h-10 w-10 rounded-full border border-white/10 object-cover"
          />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-white">@{project.author.username}</p>
            <p className="truncate text-xs text-stone-500">{project.author.bio || 'Independent developer'}</p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {project.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="tag-pill">
              #{tag}
            </span>
          ))}
          {project.tags.length > 3 && <span className="tag-pill">+{project.tags.length - 3}</span>}
        </div>

        <div className="mt-5 flex items-center justify-between border-t border-white/8 pt-4">
          <div className="flex flex-wrap items-center gap-2 text-sm text-stone-400">
            <LikeButton project={project} currentUser={currentUser} />
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-2">
              <MessageCircle className="h-4 w-4 text-teal-200" />
              {project.comments?.length || 0}
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-2">
              <Eye className="h-4 w-4 text-stone-400" />
              {Math.floor(Math.random() * 1000) + 100}
            </span>
          </div>

          <button onClick={handleProjectClick} className="btn-secondary rounded-full px-4 py-2.5">
            Details
          </button>
        </div>
      </div>
    </article>
  )
}
