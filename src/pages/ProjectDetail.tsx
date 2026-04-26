import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Heart, MessageCircle, Eye, ArrowLeft, Send, DollarSign, User } from 'lucide-react'
import { Project, Comment } from '../types/index'

const mockProject: Project = {
  id: 1,
  slug: 'burger-website',
  title: 'Modern Burger Restaurant Website',
  description: 'A stunning, fully responsive website for burger restaurants with online ordering system, menu management, and customer reviews. Built with modern web technologies and best practices.',
  thumbnailUrl: 'https://via.placeholder.com/800x400/4F46E5/FFFFFF?text=Modern+Burger+Site',
  demoUrl: 'https://example.com',
  basePrice: 299,
  author: {
    id: 1,
    username: 'devmaster',
    avatarUrl: 'https://via.placeholder.com/48/4F46E5/FFFFFF?text=DM',
    bio: 'Full-stack developer with 5+ years of experience in web development',
    createdAt: '2024-01-01'
  },
  likesCount: 42,
  commentsCount: 8,
  createdAt: '2024-01-15',
  tags: ['react', 'tailwind', 'restaurant', 'ecommerce'],
  code: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Burger Restaurant</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <header class="header">
        <nav class="navbar">
            <div class="logo">🍔 BurgerHub</div>
            <ul class="nav-links">
                <li><a href="#menu">Menu</a></li>
                <li><a href="#about">About</a></li>
                <li><a href="#contact">Contact</a></li>
            </ul>
        </nav>
    </header>
    
    <main>
        <section class="hero">
            <h1>Best Burgers in Town</h1>
            <p>Fresh ingredients, amazing taste</p>
            <button class="cta-button">Order Now</button>
        </section>
        
        <section id="menu" class="menu">
            <h2>Our Menu</h2>
            <div class="menu-grid">
                <div class="menu-item">
                    <h3>Classic Burger</h3>
                    <p>Beef patty, lettuce, tomato, cheese</p>
                    <span class="price">$12.99</span>
                </div>
                <div class="menu-item">
                    <h3>Cheese Burger</h3>
                    <p>Double cheese, beef patty, special sauce</p>
                    <span class="price">$14.99</span>
                </div>
            </div>
        </section>
    </main>
    
    <script src="script.js"></script>
</body>
</html>`
}

const mockComments: Comment[] = [
  {
    id: 1,
    author: {
      id: 2,
      username: 'webdesigner',
      avatarUrl: 'https://via.placeholder.com/32/10B981/FFFFFF?text=WD',
      bio: 'UI/UX Designer',
      createdAt: '2024-01-01'
    },
    content: 'This looks amazing! Great design and functionality.',
    createdAt: '2024-01-16'
  },
  {
    id: 2,
    author: {
      id: 3,
      username: 'foodlover',
      avatarUrl: 'https://via.placeholder.com/32/F59E0B/FFFFFF?text=FL',
      bio: 'Restaurant owner',
      createdAt: '2024-01-01'
    },
    content: 'Perfect for my restaurant! Is it customizable?',
    createdAt: '2024-01-17'
  }
]

const ProjectDetail: React.FC = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [isLiked, setIsLiked] = useState(false)
  const [showDealModal, setShowDealModal] = useState(false)
  const [newComment, setNewComment] = useState('')
  const [comments, setComments] = useState(mockComments)
  const [dealForm, setDealForm] = useState({
    type: 'code',
    message: '',
    offeredPrice: 299
  })

  const project = mockProject

  const handleLike = () => {
    setIsLiked(!isLiked)
  }

  const handleComment = (e: React.FormEvent) => {
    e.preventDefault()
    if (newComment.trim()) {
      const comment: Comment = {
        id: comments.length + 1,
        author: {
          id: 999,
          username: 'currentuser',
          avatarUrl: 'https://via.placeholder.com/32/8B5CF6/FFFFFF?text=CU',
          bio: 'Current user',
          createdAt: '2024-01-01'
        },
        content: newComment,
        createdAt: new Date().toISOString()
      }
      setComments([...comments, comment])
      setNewComment('')
    }
  }

  const handleDealSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Deal submitted:', dealForm)
    setShowDealModal(false)
    // Here you would normally send the deal to the backend
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Back Button */}
      <button
        onClick={() => navigate('/')}
        className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Projects</span>
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Project Header */}
          <div className="bg-white rounded-xl shadow-soft overflow-hidden">
            <img 
              src={project.thumbnailUrl} 
              alt={project.title}
              className="w-full h-64 object-cover"
            />
            
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-3xl font-bold text-gray-900">{project.title}</h1>
                <div className="flex items-center space-x-2">
                  <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                    Available
                  </span>
                  <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm font-medium">
                    ${project.basePrice}
                  </span>
                </div>
              </div>

              <p className="text-gray-600 mb-6">{project.description}</p>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-6">
                {project.tags?.map((tag, index) => (
                  <span key={index} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                    #{tag}
                  </span>
                ))}
              </div>

              {/* Author Info */}
              <div className="flex items-center justify-between border-t border-gray-200 pt-6">
                <div className="flex items-center">
                  <img 
                    src={project.author.avatarUrl} 
                    alt={project.author.username}
                    className="w-12 h-12 rounded-full mr-3"
                  />
                  <div>
                    <h3 className="font-semibold text-gray-900">@{project.author.username}</h3>
                    <p className="text-sm text-gray-600">{project.author.bio}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <button
                    onClick={handleLike}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                      isLiked 
                        ? 'bg-red-100 text-red-600 hover:bg-red-200' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
                    <span>{project.likesCount + (isLiked ? 1 : 0)}</span>
                  </button>
                  
                  <button
                    onClick={() => setShowDealModal(true)}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg hover:opacity-90 transition-opacity flex items-center space-x-2"
                  >
                    <DollarSign className="w-5 h-5" />
                    <span>Buy Project</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Live Demo */}
          <div className="bg-white rounded-xl shadow-soft overflow-hidden">
            <div className="bg-gray-100 border-b border-gray-200 px-6 py-4">
              <h2 className="text-xl font-semibold text-gray-900">Live Demo</h2>
            </div>
            <div className="p-6">
              <iframe
                srcDoc={project.code}
                className="w-full h-96 border border-gray-300 rounded-lg"
                title="Project Demo"
                sandbox="allow-scripts"
              />
            </div>
          </div>

          {/* Comments Section */}
          <div className="bg-white rounded-xl shadow-soft overflow-hidden">
            <div className="bg-gray-100 border-b border-gray-200 px-6 py-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Comments ({comments.length})
              </h2>
            </div>
            
            <div className="p-6">
              {/* Comment Form */}
              <form onSubmit={handleComment} className="mb-6">
                <div className="flex space-x-3">
                  <img 
                    src="https://via.placeholder.com/40/8B5CF6/FFFFFF?text=CU"
                    alt="Current user"
                    className="w-10 h-10 rounded-full"
                  />
                  <div className="flex-1">
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Add a comment..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      rows={3}
                    />
                    <button
                      type="submit"
                      className="mt-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                    >
                      <Send className="w-4 h-4" />
                      <span>Post Comment</span>
                    </button>
                  </div>
                </div>
              </form>

              {/* Comments List */}
              <div className="space-y-4">
                {comments.map((comment) => (
                  <div key={comment.id} className="flex space-x-3">
                    <img 
                      src={comment.author.avatarUrl} 
                      alt={comment.author.username}
                      className="w-10 h-10 rounded-full"
                    />
                    <div className="flex-1">
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-gray-900">
                            @{comment.author.username}
                          </h4>
                          <span className="text-sm text-gray-500">
                            {new Date(comment.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-gray-700">{comment.content}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Project Stats */}
          <div className="bg-white rounded-xl shadow-soft p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Stats</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Likes</span>
                <span className="font-semibold">{project.likesCount + (isLiked ? 1 : 0)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Comments</span>
                <span className="font-semibold">{comments.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Views</span>
                <span className="font-semibold">1.2k</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Created</span>
                <span className="font-semibold">
                  {new Date(project.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-soft p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button
                onClick={() => setShowDealModal(true)}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
              >
                Make an Offer
              </button>
              <button className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors">
                Contact Developer
              </button>
              <button className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors">
                Share Project
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Deal Modal */}
      {showDealModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Make an Offer</h3>
            
            <form onSubmit={handleDealSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Deal Type
                </label>
                <select
                  value={dealForm.type}
                  onChange={(e) => setDealForm({...dealForm, type: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="code">Buy Source Code</option>
                  <option value="license">License Only</option>
                  <option value="custom">Customization</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Offered Price ($)
                </label>
                <input
                  type="number"
                  value={dealForm.offeredPrice}
                  onChange={(e) => setDealForm({...dealForm, offeredPrice: parseInt(e.target.value)})}
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message
                </label>
                <textarea
                  value={dealForm.message}
                  onChange={(e) => setDealForm({...dealForm, message: e.target.value})}
                  placeholder="Tell the developer about your project needs..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows={4}
                />
              </div>

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setShowDealModal(false)}
                  className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
                >
                  Send Offer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default ProjectDetail
