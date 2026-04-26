import { GetServerSideProps } from 'next'
import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import Navbar from '../src/components/layout/Navbar'
import ProjectCard from '../src/components/ProjectCard'
import SearchBar from '../src/components/SearchBar'
import { User, Project } from '../src/types'
import { apiClient } from '../src/lib/api'

export default function IndexPage({ user }: { user: any }) {
  const navigate = useNavigate()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState({
    category: '',
    tags: [],
    minPrice: undefined,
    maxPrice: undefined,
    sortBy: 'createdAt',
    sortOrder: 'desc'
  })

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }
    
    if (user.accountType === 'DEVELOPER') {
      navigate('/dashboard')
      return
    }
    
    fetchProjects()
  }, [user, navigate])

  const fetchProjects = async () => {
    setLoading(true)
    try {
      const params = {
        query: searchQuery,
        ...filters,
        page: 1,
        limit: 12
      }
      
      const response = await apiClient.getProjects(params)
      if (response.success && response.data) {
        setProjects(response.data)
      }
    } catch (error) {
      console.error('Error fetching projects:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
  }

  const handleFilter = (newFilters: any) => {
    setFilters(newFilters)
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    )
  }

  if (user.accountType === 'DEVELOPER') {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar user={user} />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">
            Discover Amazing Projects
          </h1>
          <p className="text-xl text-gray-400 mb-8">
            Browse, buy, and learn from incredible web applications built by talented developers
          </p>
          <div className="flex justify-center gap-4">
            <button
              onClick={() => navigate('/projects')}
              className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-lg"
            >
              Browse All Projects
            </button>
            <button
              onClick={() => navigate('/dashboard/projects/new')}
              className="px-8 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors text-lg"
            >
              Sell Your Project
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <SearchBar onSearch={handleSearch} onFilter={handleFilter} />
        </div>

        {/* Featured Projects */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-white mb-6">Featured Projects</h2>
          
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
            </div>
          ) : projects.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400 text-lg">No projects found</p>
              <p className="text-gray-500 mt-2">Be the first to discover amazing projects!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.slice(0, 6).map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  currentUser={user}
                />
              ))}
            </div>
          )}
          
          {projects.length > 6 && (
            <div className="text-center mt-8">
              <button
                onClick={() => navigate('/projects')}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                View All Projects ({projects.length})
              </button>
            </div>
          )}
        </div>

        {/* Categories */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-white mb-6">Browse by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {['Web Development', 'Mobile App', 'Game Development', 'AI/ML'].map((category) => (
              <button
                key={category}
                onClick={() => {
                  setFilters({ ...filters, category })
                  navigate('/projects')
                }}
                className="p-6 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors text-center"
              >
                <div className="text-2xl mb-2">
                  {category === 'Web Development' && '🌐'}
                  {category === 'Mobile App' && '📱'}
                  {category === 'Game Development' && '🎮'}
                  {category === 'AI/ML' && '🤖'}
                </div>
                <p className="text-white font-medium">{category}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-gray-800 rounded-lg p-6 text-center">
            <div className="text-3xl font-bold text-blue-400 mb-2">{projects.length}</div>
            <div className="text-gray-400">Projects</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-6 text-center">
            <div className="text-3xl font-bold text-green-400 mb-2">150+</div>
            <div className="text-gray-400">Developers</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-6 text-center">
            <div className="text-3xl font-bold text-purple-400 mb-2">500+</div>
            <div className="text-gray-400">Sales</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-6 text-center">
            <div className="text-3xl font-bold text-orange-400 mb-2">4.8★</div>
            <div className="text-gray-400">Avg Rating</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const token = context.req.cookies.token
  
  if (!token) {
    return { props: { user: null } }
  }

  try {
    // TODO: Verify JWT token and get user data
    return { props: { user: null } }
  } catch (error) {
    return { props: { user: null } }
  }
}
