import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Navbar from '../../src/components/layout/Navbar'
import LikeButton from '../../src/components/LikeButton'
import CommentSection from '../../src/components/CommentSection'
import DealModal from '../../src/components/DealModal'
import { User, Project, Deal } from '../../src/types/index'
import { apiClient } from '../../src/lib/api'
import ErrorBoundary from '../../src/components/ErrorBoundary'
import LoadingSpinner from '../../src/components/LoadingSpinner'
import { useToast } from '../../src/components/Toast'
import { useErrorHandler } from '../../src/hooks/useErrorHandler'

interface ProjectPageProps {
  user: User | null
}

export default function ProjectPage({ user }: ProjectPageProps) {
  const navigate = useNavigate()
  const { slug } = useParams()
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [showDealModal, setShowDealModal] = useState(false)
  
  const { toast } = useToast()
  const { handleError, handleAsyncError } = useErrorHandler()

  useEffect(() => {
    if (slug && typeof slug === 'string') {
      fetchProject()
    }
  }, [slug])

  const fetchProject = async () => {
    if (!slug || typeof slug !== 'string') return

    setLoading(true)
    try {
      const response = await apiClient.getProject(slug)
      
      if (response.success && response.data) {
        setProject(response.data)
        toast.success('Project loaded successfully')
      } else {
        toast.error('Project not found')
        navigate('/projects')
      }
    } catch (error) {
      handleError(error as Error)
      navigate('/projects')
    } finally {
      setLoading(false)
    }
  }

  const handleDealCreated = (deal: Deal) => {
    toast.success('Deal created successfully!')
    setShowDealModal(false)
    // Refresh project data to show new deal
    if (slug && typeof slug === 'string') {
      fetchProject()
    }
  }

  const handleLikeChange = (liked: boolean, likesCount: number) => {
    if (project) {
      setProject({
        ...project,
        likes: liked ? [...project.likes, { 
          id: 'temp', 
          userId: user?.id || '', 
          projectId: String(project.id), 
          createdAt: new Date().toISOString(),
          user: user!,
          project: project
        }] : project.likes.filter(like => like.userId !== user?.id)
      })
    }
  }

  const handleCommentAdded = (comment: any) => {
    if (project) {
      setProject({
        ...project,
        comments: [comment, ...project.comments]
      })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900">
        <Navbar />
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
        </div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gray-900">
        <Navbar />
        <div className="text-center py-12">
          <p className="text-gray-400 text-lg">Project not found</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Project Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">{project.title}</h1>
              <div className="flex items-center gap-4 text-gray-400">
                <div className="flex items-center gap-2">
                  <img
                    src={project.author.avatar || '/default-avatar.png'}
                    alt={project.author.username}
                    className="w-6 h-6 rounded-full"
                  />
                  <span>by {project.author.username}</span>
                </div>
                <span>•</span>
                <span>{project.category}</span>
                <span>•</span>
                <span>{new Date(project.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-3xl font-bold text-green-400">${project.price}</p>
                <p className="text-sm text-gray-400">Base price</p>
              </div>
              
              {user && user.accountType === 'USER' && (
                <button
                  onClick={() => setShowDealModal(true)}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105"
                >
                  💰 I Want to Buy
                </button>
              )}
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-6">
            {project.tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 bg-gray-700 text-gray-300 rounded-full text-sm"
              >
                #{tag}
              </span>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <LikeButton
              project={project}
              currentUser={user}
              onLikeChange={handleLikeChange}
            />
            <span className="text-gray-400">
              💬 {project.comments?.length || 0} comments
            </span>
            <span className="text-gray-400">
              ❤️ {project.likes?.length || 0} likes
            </span>
          </div>
        </div>

        {/* Project Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4">About this project</h2>
              <p className="text-gray-300 whitespace-pre-wrap">{project.description}</p>
            </div>

            {/* Demo/Preview */}
            {project.demoUrl && (
              <div className="bg-gray-800 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-white mb-4">Live Demo</h2>
                <div className="bg-gray-900 rounded-lg overflow-hidden" style={{ height: '600px' }}>
                  <iframe
                    src={project.demoUrl}
                    className="w-full h-full border-0"
                    title="Live Demo"
                    sandbox="allow-scripts allow-same-origin"
                  />
                </div>
              </div>
            )}

            {/* Code Preview (if available) */}
            {project.description.includes('<!-- FILES -->') && (
              <div className="bg-gray-800 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-white mb-4">Code Preview</h2>
                <div className="text-sm text-gray-400">
                  <p>This project includes source code files.</p>
                  <p className="mt-2">Purchase to get full access to all code files.</p>
                </div>
              </div>
            )}

            {/* Comments */}
            <CommentSection
              project={project}
              currentUser={user}
              onCommentAdded={handleCommentAdded}
            />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Author Info */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Developer</h3>
              <div className="flex items-center gap-3 mb-4">
                <img
                  src={project.author.avatar || '/default-avatar.png'}
                  alt={project.author.username}
                  className="w-12 h-12 rounded-full"
                />
                <div>
                  <p className="font-medium text-white">{project.author.username}</p>
                  <p className="text-sm text-gray-400">Software Developer</p>
                </div>
              </div>
              {project.author.bio && (
                <p className="text-gray-300 text-sm">{project.author.bio}</p>
              )}
              <button
                onClick={() => navigate(`/@${project.author.username}`)}
                className="mt-4 w-full px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors"
              >
                View Profile
              </button>
            </div>

            {/* Links */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Links</h3>
              <div className="space-y-3">
                {project.demoUrl && (
                  <a
                    href={project.demoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-center"
                  >
                    🚀 View Live Demo
                  </a>
                )}
                {project.githubUrl && (
                  <a
                    href={project.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors text-center"
                  >
                    📁 View on GitHub
                  </a>
                )}
              </div>
            </div>

            {/* Purchase Info */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Purchase Options</h3>
              <div className="space-y-3 text-sm text-gray-300">
                <div className="flex justify-between">
                  <span>Base Price:</span>
                  <span className="font-bold text-green-400">${project.price}</span>
                </div>
                <div className="flex justify-between">
                  <span>License Type:</span>
                  <span>Full Ownership</span>
                </div>
                <div className="flex justify-between">
                  <span>Support:</span>
                  <span>30 days</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Deal Modal */}
      {user && user.accountType === 'USER' && (
        <DealModal
          project={project}
          currentUser={user}
          isOpen={showDealModal}
          onClose={() => setShowDealModal(false)}
          onDealCreated={handleDealCreated}
        />
      )}
    </div>
  )
}

// This component now works with React Router instead of Next.js
