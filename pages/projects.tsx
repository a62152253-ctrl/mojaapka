import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../src/components/layout/Navbar'
import SearchBar from '../src/components/SearchBar'
import LikeButton from '../src/components/LikeButton'
import { User, Project } from '../src/types'
import { apiClient } from '../src/lib/api'

interface ProjectsPageProps {
  user: User | null
}

export default function ProjectsPage({ user }: ProjectsPageProps) {
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
    fetchProjects()
  }, [user, searchQuery, filters, navigate])

  const fetchProjects = async () => {
    setLoading(true)
    try {
      const params = {
        query: searchQuery,
        ...filters,
        page: 1,
        limit: 20
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
    return null
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Explore Projects</h1>
          <p className="text-gray-400">Discover amazing projects from talented developers</p>
        </div>

        <div className="mb-8">
          <SearchBar onSearch={handleSearch} onFilter={handleFilter} />
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">No projects found</p>
            <p className="text-gray-500 mt-2">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <div key={project.id} className="bg-gray-800 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                {project.images && project.images.length > 0 && (
                  <img
                    src={project.images[0]}
                    alt={project.title}
                    className="w-full h-48 object-cover"
                  />
                )}
                
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-white mb-2">{project.title}</h3>
                  <p className="text-gray-400 mb-4 line-clamp-2">{project.description}</p>
                  
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-lg font-bold text-blue-400">${project.price}</span>
                    <span className="text-sm text-gray-500">{project.category}</span>
                  </div>

                  <div className="flex items-center gap-2 mb-4">
                    <img
                      src={project.author.avatar || '/default-avatar.png'}
                      alt={project.author.username}
                      className="w-6 h-6 rounded-full"
                    />
                    <span className="text-sm text-gray-300">{project.author.username}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <LikeButton
                        project={project}
                        currentUser={user}
                      />
                      <span className="text-sm text-gray-400">
                        {project.comments?.length || 0} comments
                      </span>
                    </div>
                    
                    <button
                      onClick={() => navigate(`/project/${project.id}`)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export async function getServerSideProps(context: any) {
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
