import React, { useState } from 'react'
import { ArrowLeft, Save } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const CreateProject: React.FC = () => {
  const [projectData, setProjectData] = useState({
    title: '',
    description: '',
    basePrice: '',
    tags: ''
  })
  
  const navigate = useNavigate()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Here you would normally save the project
    console.log('Project created:', projectData)
    navigate('/live-workspace')
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setProjectData(prev => ({
      ...prev,
      [name]: value
    }))
  }


  return (
    <div className="max-w-4xl mx-auto px-4 py-8 bg-gray-900 min-h-screen">
      <div className="mb-8">
        <button
          onClick={() => navigate('/')}
          className="flex items-center space-x-2 text-gray-400 hover:text-white mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </button>
        <h1 className="text-3xl font-bold text-white">Create New Project</h1>
        <p className="text-gray-400 mt-2">Share your amazing work with the community</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Project Details Form */}
        <div className="bg-gray-800 rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-6 text-white">Project Details</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Project Title
              </label>
              <input
                type="text"
                name="title"
                value={projectData.title}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-600 rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter project title..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={projectData.description}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-4 py-2 border border-gray-600 rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Describe your project..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Base Price ($)
              </label>
              <input
                type="number"
                name="basePrice"
                value={projectData.basePrice}
                onChange={handleInputChange}
                min="0"
                step="1"
                className="w-full px-4 py-2 border border-gray-600 rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="299"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Tags (comma separated)
              </label>
              <input
                type="text"
                name="tags"
                value={projectData.tags}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-600 rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="react, typescript, tailwind"
              />
            </div>

            <div className="flex space-x-4">
              <button
                type="submit"
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-12 py-6 rounded-xl hover:opacity-90 transition-opacity transform hover:scale-105 shadow-xl text-xl font-bold"
              >
                Create Project
              </button>
            </div>
          </form>
        </div>

        {/* Preview Card */}
        <div className="bg-gray-800 rounded-xl shadow-lg overflow-hidden">
          <div className="p-6">
            <h3 className="text-xl font-semibold mb-4 text-white">Project Preview</h3>
            
            <div className="project-card border border-gray-700 rounded-lg overflow-hidden">
              <div className="relative">
                <div className="w-full h-48 bg-gray-700 flex items-center justify-center">
                  <span className="text-gray-400">Project Preview</span>
                </div>
                {projectData.basePrice && (
                  <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded-lg text-sm">
                    ${projectData.basePrice}
                  </div>
                )}
              </div>

              <div className="p-4">
                <h4 className="font-semibold text-lg mb-2 text-white">
                  {projectData.title || 'Project Title'}
                </h4>
                <p className="text-gray-400 text-sm mb-3">
                  {projectData.description || 'Project description will appear here...'}
                </p>
                
                {projectData.tags && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {projectData.tags.split(',').map((tag, index) => (
                      <span key={index} className="px-2 py-1 bg-gray-600 text-gray-400 text-xs rounded-md">
                        {tag.trim()}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex items-center mb-3">
                  <div className="w-6 h-6 bg-gray-600 rounded-full mr-2"></div>
                  <span className="text-sm text-gray-400">@yourusername</span>
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
