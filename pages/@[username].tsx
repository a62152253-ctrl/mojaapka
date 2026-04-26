import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Navbar from '../src/components/layout/Navbar'
import ProjectCard from '../src/components/ProjectCard'
import { User, Project } from '../src/types'
import { apiClient } from '../src/lib/api'

interface UserProfilePageProps {
  user: User | null
}

export default function UserProfilePage({ user }: UserProfilePageProps) {
  const navigate = useNavigate()
  const { username } = useParams()
  const [profileUser, setProfileUser] = useState<User | null>(null)
  const [userProjects, setUserProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('projects')

  useEffect(() => {
    if (username && typeof username === 'string') {
      fetchUserProfile()
    }
  }, [username])

  const fetchUserProfile = async () => {
    if (!username || typeof username !== 'string') return

    setLoading(true)
    try {
      // Fetch user profile and projects
      const projectsResponse = await apiClient.getProjects()
      if (projectsResponse.success && projectsResponse.data) {
        // Find user by username and their projects
        const userProjects = projectsResponse.data.filter(project => 
          project.author.username === username
        )
        
        if (userProjects.length > 0) {
          const author = userProjects[0].author
          setProfileUser(author)
          setUserProjects(userProjects)
        } else {
          // User not found
          navigate('/projects')
        }
      }
    } catch (error) {
      console.error('Error fetching user profile:', error)
      navigate('/projects')
    } finally {
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900">
        <Navbar user={user} />
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
        </div>
      </div>
    )
  }

  if (!profileUser) {
    return (
      <div className="min-h-screen bg-gray-900">
        <Navbar user={user} />
        <div className="text-center py-12">
          <p className="text-gray-400 text-lg">User not found</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar user={user} />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Profile Header */}
        <div className="bg-gray-800 rounded-lg p-8 mb-8">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 bg-gray-700 rounded-full flex items-center justify-center">
              {profileUser.avatar ? (
                <img
                  src={profileUser.avatar}
                  alt={profileUser.username}
                  className="w-24 h-24 rounded-full"
                />
              ) : (
                <span className="text-3xl text-gray-400">
                  {profileUser.username.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-white mb-2">@{profileUser.username}</h1>
              <p className="text-gray-400 mb-4">
                {profileUser.bio || 'Software Developer creating amazing projects'}
              </p>
              
              <div className="flex gap-8 text-center">
                <div>
                  <p className="text-2xl font-bold text-white">{userProjects.length}</p>
                  <p className="text-sm text-gray-400">Projects</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">
                    {userProjects.reduce((sum, project) => sum + (project.likes?.length || 0), 0)}
                  </p>
                  <p className="text-sm text-gray-400">Total Likes</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">
                    {userProjects.reduce((sum, project) => sum + (project.comments?.length || 0), 0)}
                  </p>
                  <p className="text-sm text-gray-400">Comments</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="border-b border-gray-700 mb-8">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('projects')}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'projects'
                  ? 'border-blue-500 text-white'
                  : 'border-transparent text-gray-400 hover:text-gray-300'
              }`}
            >
              Projects ({userProjects.length})
            </button>
            <button
              onClick={() => setActiveTab('about')}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'about'
                  ? 'border-blue-500 text-white'
                  : 'border-transparent text-gray-400 hover:text-gray-300'
              }`}
            >
              About
            </button>
            <button
              onClick={() => setActiveTab('activity')}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'activity'
                  ? 'border-blue-500 text-white'
                  : 'border-transparent text-gray-400 hover:text-gray-300'
              }`}
            >
              Activity
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === 'projects' && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-6">Published Projects</h2>
              {userProjects.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-400 text-lg">No projects published yet</p>
                  <p className="text-gray-500 mt-2">Check back later for amazing projects!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {userProjects.map((project) => (
                    <ProjectCard
                      key={project.id}
                      project={project}
                      currentUser={user}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'about' && (
            <div className="bg-gray-800 rounded-lg p-8">
              <h2 className="text-2xl font-bold text-white mb-6">About @{profileUser.username}</h2>
              <div className="space-y-4 text-gray-300">
                <p>
                  {profileUser.bio || 'This developer is focused on creating high-quality web applications and projects.'}
                </p>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Skills & Technologies</h3>
                  <div className="flex flex-wrap gap-2">
                    {['React', 'TypeScript', 'Node.js', 'TailwindCSS', 'Next.js'].map((skill) => (
                      <span
                        key={skill}
                        className="px-3 py-1 bg-gray-700 text-gray-300 rounded-full text-sm"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Member Since</h3>
                  <p>{new Date(profileUser.createdAt).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long' 
                  })}</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'activity' && (
            <div className="bg-gray-800 rounded-lg p-8">
              <h2 className="text-2xl font-bold text-white mb-6">Recent Activity</h2>
              <div className="space-y-4">
                {userProjects.slice(0, 5).map((project) => (
                  <div key={project.id} className="flex items-center gap-4 p-4 bg-gray-700 rounded-lg">
                    <div className="w-12 h-12 bg-gray-600 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold">📁</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-medium">Published new project</p>
                      <p className="text-gray-400">{project.title}</p>
                    </div>
                    <span className="text-sm text-gray-500">
                      {new Date(project.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                ))}
                {userProjects.length === 0 && (
                  <p className="text-gray-400 text-center py-8">No recent activity</p>
                )}
              </div>
            </div>
          )}
        </div>
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
