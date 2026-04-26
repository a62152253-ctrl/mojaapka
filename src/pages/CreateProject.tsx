import React, { useState } from 'react'
import { ArrowLeft, Save, Play, X } from 'lucide-react'
import CodeEditor from '../components/CodeEditor'
import { useNavigate } from 'react-router-dom'

const CreateProject: React.FC = () => {
  const [showEditor, setShowEditor] = useState(false)
  const [showPreview, setShowPreview] = useState(true)
  const [projectData, setProjectData] = useState({
    title: '',
    description: '',
    thumbnailUrl: '',
    basePrice: '',
    tags: '',
    demoUrl: '',
    code: '',
    language: 'javascript'
  })
  
  const navigate = useNavigate()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Here you would normally save the project
    console.log('Project created:', projectData)
    navigate('/')
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setProjectData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleCodeChange = (value: string) => {
    setProjectData(prev => ({
      ...prev,
      code: value
    }))
  }

  if (showEditor) {
    return (
      <div className="h-screen flex flex-col">
        <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowEditor(false)}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors text-xl py-3 px-5"
            >
              <ArrowLeft className="w-6 h-6" />
              <span className="text-lg">Back to Project Details</span>
            </button>
            <div className="flex items-center gap-2">
              <label className="text-lg font-medium text-gray-700">Language:</label>
              <select
                name="language"
                value={projectData.language}
                onChange={handleInputChange}
                className="px-4 py-2 border border-gray-300 rounded-lg text-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="javascript">JavaScript</option>
                <option value="typescript">TypeScript</option>
                <option value="html">HTML</option>
                <option value="css">CSS</option>
                <option value="json">JSON</option>
                <option value="python">Python</option>
                <option value="php">PHP</option>
              </select>
            </div>
            <button
              onClick={() => setShowPreview(!showPreview)}
              className={`px-4 py-2 rounded-lg text-lg font-medium transition-colors ${
                showPreview 
                  ? 'bg-blue-600 text-white hover:bg-blue-700' 
                  : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
              }`}
            >
              {showPreview ? '👁️ Hide Preview' : '👁️ Show Preview'}
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowEditor(false)}
              className="flex items-center space-x-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors text-lg"
            >
              <Save className="w-6 h-6" />
              <span>Save Code</span>
            </button>
            <button
              onClick={() => setShowEditor(false)}
              className="flex items-center space-x-2 bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors text-lg"
            >
              <X className="w-6 h-6" />
              <span>Cancel</span>
            </button>
          </div>
        </div>
        <div className="flex-1">
          <CodeEditor
            value={projectData.code}
            onChange={handleCodeChange}
            language={projectData.language}
            height="500vh"
            theme="dark"
            showPreview={showPreview}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <button
          onClick={() => navigate('/')}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </button>
        <h1 className="text-3xl font-bold text-gray-900">Create New Project</h1>
        <p className="text-gray-600 mt-2">Share your amazing work with the community</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Project Details Form */}
        <div className="bg-white rounded-xl shadow-soft p-6">
          <h2 className="text-xl font-semibold mb-6">Project Details</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Project Title
              </label>
              <input
                type="text"
                name="title"
                value={projectData.title}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter project title..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={projectData.description}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Describe your project..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Thumbnail URL
              </label>
              <input
                type="url"
                name="thumbnailUrl"
                value={projectData.thumbnailUrl}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://example.com/thumbnail.jpg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Base Price ($)
              </label>
              <input
                type="number"
                name="basePrice"
                value={projectData.basePrice}
                onChange={handleInputChange}
                min="0"
                step="1"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="299"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tags (comma separated)
              </label>
              <input
                type="text"
                name="tags"
                value={projectData.tags}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="react, typescript, tailwind"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Demo URL
              </label>
              <input
                type="url"
                name="demoUrl"
                value={projectData.demoUrl}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://demo.example.com"
              />
            </div>

            <div className="flex space-x-4">
              <button
                type="button"
                onClick={() => setShowEditor(true)}
                className="flex-1 flex items-center justify-center bg-gradient-to-r from-green-500 to-emerald-600 text-white px-8 py-4 rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all transform hover:scale-105 shadow-lg text-lg"
              >
                <Play className="w-6 h-6 mr-2" />
                {projectData.code ? 'Edit Code' : 'Add Code'}
                {projectData.code && (
                  <span className="ml-2 bg-white/20 px-3 py-1 rounded-full text-sm">
                    {projectData.code.length} chars
                  </span>
                )}
              </button>
              
              <button
                type="submit"
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-lg hover:opacity-90 transition-opacity transform hover:scale-105 shadow-lg text-lg"
              >
                Publish Project
              </button>
            </div>
            
            {projectData.code && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2 text-green-700">
                  <Save className="w-4 h-4" />
                  <span className="text-sm font-medium">Code added ({projectData.language})</span>
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Preview Card */}
        <div className="bg-white rounded-xl shadow-soft overflow-hidden">
          <div className="p-6">
            <h3 className="text-xl font-semibold mb-4">Project Preview</h3>
            
            <div className="project-card border border-gray-200 rounded-lg overflow-hidden">
              <div className="relative">
                {projectData.thumbnailUrl ? (
                  <img 
                    src={projectData.thumbnailUrl} 
                    alt={projectData.title}
                    className="w-full h-48 object-cover"
                  />
                ) : (
                  <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-400">No thumbnail</span>
                  </div>
                )}
                {projectData.basePrice && (
                  <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded-lg text-sm">
                    ${projectData.basePrice}
                  </div>
                )}
              </div>

              <div className="p-4">
                <h4 className="font-semibold text-lg mb-2">
                  {projectData.title || 'Project Title'}
                </h4>
                <p className="text-gray-600 text-sm mb-3">
                  {projectData.description || 'Project description will appear here...'}
                </p>
                
                {projectData.tags && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {projectData.tags.split(',').map((tag, index) => (
                      <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md">
                        {tag.trim()}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex items-center mb-3">
                  <div className="w-6 h-6 bg-gray-300 rounded-full mr-2"></div>
                  <span className="text-sm text-gray-600">@yourusername</span>
                </div>

                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center space-x-4">
                    <span className="flex items-center space-x-1">
                      <span className="w-4 h-4">❤️</span>
                      <span>0</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <span className="w-4 h-4">💬</span>
                      <span>0</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <span className="w-4 h-4">👁️</span>
                      <span>0</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CreateProject
