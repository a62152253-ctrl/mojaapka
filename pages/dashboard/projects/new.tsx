import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../../../src/components/layout/Navbar'
import CodeEditor from '../../../src/components/CodeEditor'
import { User, Project } from '../../../src/types'
import { apiClient } from '../../../src/lib/api'

interface NewProjectPageProps {
  user: User | null
}

export default function NewProjectPage({ user }: NewProjectPageProps) {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [files, setFiles] = useState([
    { name: 'index.html', content: '<!DOCTYPE html>\n<html>\n<head>\n  <title>My App</title>\n</head>\n<body>\n  <h1>Hello World!</h1>\n</body>\n</html>', language: 'html' },
    { name: 'style.css', content: 'body {\n  font-family: Arial, sans-serif;\n  margin: 0;\n  padding: 20px;\n}', language: 'css' },
    { name: 'script.js', content: 'console.log("Hello World!");', language: 'javascript' }
  ])
  
  const [projectData, setProjectData] = useState({
    title: '',
    description: '',
    category: 'Web Development',
    tags: [''],
    price: 99,
    demoUrl: '',
    githubUrl: '',
    images: ['']
  })

  const [previewUrl, setPreviewUrl] = useState('')

  useEffect(() => {
    if (!user || user.accountType !== 'DEVELOPER') {
      navigate('/login')
      return
    }
  }, [user, navigate])

  const handleFileChange = (fileName: string, content: string) => {
    setFiles(prev => prev.map(file => 
      file.name === fileName ? { ...file, content } : file
    ))
  }

  const handleAddFile = () => {
    const newFileName = prompt('Enter file name:')
    if (newFileName) {
      const language = newFileName.endsWith('.css') ? 'css' : 
                       newFileName.endsWith('.js') ? 'javascript' : 'html'
      setFiles(prev => [...prev, { name: newFileName, content: '', language }])
    }
  }

  const handleDeleteFile = (fileName: string) => {
    if (files.length > 1) {
      setFiles(prev => prev.filter(file => file.name !== fileName))
    }
  }

  const generateLivePreview = () => {
    const htmlFile = files.find(f => f.name === 'index.html')
    if (htmlFile) {
      const blob = new Blob([htmlFile.content], { type: 'text/html' })
      const url = URL.createObjectURL(blob)
      setPreviewUrl(url)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setLoading(true)
    try {
      // 1. Create project metadata
      const projectResponse = await apiClient.createProject({
        title: projectData.title,
        description: projectData.description,
        category: projectData.category,
        tags: projectData.tags.filter(tag => tag.trim()),
        price: projectData.price,
        demoUrl: projectData.demoUrl,
        githubUrl: projectData.githubUrl,
        images: projectData.images.filter(img => img.trim())
      })

      if (projectResponse.success && projectResponse.data) {
        const project = projectResponse.data
        
        // 2. Save project files to database/storage
        // In a real app, you'd upload files to cloud storage
        // For now, we'll store them in the project description as JSON
        const filesData = JSON.stringify(files)
        
        await apiClient.updateProject(project.id, {
          description: projectData.description + '\n\n<!-- FILES -->\n' + filesData
        })

        // 3. Publish project (make visible to users)
        await apiClient.updateProject(project.id, {
          status: 'PUBLISHED'
        })

        navigate(`/projects/${project.id}`)
      }
    } catch (error) {
      console.error('Error creating project:', error)
      alert('Error creating project. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Create New Project</h1>
          <p className="text-gray-400">Add your application to make it visible to users</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Project Metadata */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-6">Project Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Project Title *
                </label>
                <input
                  type="text"
                  value={projectData.title}
                  onChange={(e) => setProjectData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="My Awesome App"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Category *
                </label>
                <select
                  value={projectData.category}
                  onChange={(e) => setProjectData(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  aria-label="Project Category"
                >
                  <option>Web Development</option>
                  <option>Mobile App</option>
                  <option>Desktop App</option>
                  <option>Game Development</option>
                  <option>AI/ML</option>
                  <option>Data Science</option>
                  <option>DevOps</option>
                  <option>UI/UX</option>
                  <option>Other</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description *
                </label>
                <textarea
                  value={projectData.description}
                  onChange={(e) => setProjectData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  rows={4}
                  placeholder="Describe your project and what it does..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Price ($) *
                </label>
                <input
                  type="number"
                  value={projectData.price}
                  onChange={(e) => setProjectData(prev => ({ ...prev, price: Number(e.target.value) }))}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="99"
                  min="0"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  value={projectData.tags.join(', ')}
                  onChange={(e) => setProjectData(prev => ({ 
                    ...prev, 
                    tags: e.target.value.split(',').map(tag => tag.trim())
                  }))}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="react, typescript, tailwind"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Demo URL (optional)
                </label>
                <input
                  type="url"
                  value={projectData.demoUrl}
                  onChange={(e) => setProjectData(prev => ({ ...prev, demoUrl: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://demo.example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  GitHub URL (optional)
                </label>
                <input
                  type="url"
                  value={projectData.githubUrl}
                  onChange={(e) => setProjectData(prev => ({ ...prev, githubUrl: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://github.com/user/repo"
                />
              </div>
            </div>
          </div>

          {/* Code Editor Section */}
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">Application Code</h2>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={generateLivePreview}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  🚀 Preview
                </button>
                <button
                  type="button"
                  onClick={handleAddFile}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  + Add File
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Code Editor */}
              <div>
                <h3 className="text-lg font-medium text-white mb-4">Code Editor</h3>
                <div className="space-y-4">
                  {files.map((file) => (
                    <div key={file.name} className="bg-gray-900 rounded-lg overflow-hidden">
                      <div className="flex items-center justify-between px-4 py-2 bg-gray-800">
                        <span className="text-sm text-gray-300">{file.name}</span>
                        {files.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleDeleteFile(file.name)}
                            className="text-red-400 hover:text-red-300 text-sm"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                      <CodeEditor
                        value={file.content}
                        onChange={(value) => handleFileChange(file.name, value)}
                        language={file.language}
                        height="300px"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Live Preview */}
              <div>
                <h3 className="text-lg font-medium text-white mb-4">Live Preview</h3>
                <div className="bg-gray-900 rounded-lg p-4 h-[600px]">
                  {previewUrl ? (
                    <iframe
                      src={previewUrl}
                      className="w-full h-full border-0 rounded"
                      title="Live Preview"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-500">
                      <div className="text-center">
                        <p>Click "Preview" to see your app</p>
                        <p className="text-sm mt-2">Make sure you have index.html file</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="px-6 py-3 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !projectData.title.trim()}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Creating...' : '🚀 Publish Project'}
            </button>
          </div>
        </form>
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
