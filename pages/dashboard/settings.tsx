import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../../src/components/layout/Navbar'
import { User } from '../../src/types'
import { apiClient } from '../../src/lib/api'

interface SettingsPageProps {
  user: User | null
}

export default function SettingsPage({ user }: SettingsPageProps) {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('profile')
  const [formData, setFormData] = useState({
    username: '',
    bio: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }
    
    setFormData(prev => ({
      ...prev,
      username: user.username,
      bio: user.bio || '',
      email: user.email
    }))
  }, [user, navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (activeTab === 'profile') {
        // Update profile
        await apiClient.updateProfile({
          username: formData.username,
          bio: formData.bio
        })
      } else if (activeTab === 'password') {
        // Update password
        if (formData.newPassword !== formData.confirmPassword) {
          alert('Passwords do not match')
          return
        }
        
        await apiClient.updatePassword({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword
        })
        
        // Clear password fields
        setFormData(prev => ({
          ...prev,
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        }))
      }
      
      alert('Settings updated successfully!')
    } catch (error) {
      console.error('Error updating settings:', error)
      alert('Error updating settings. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar user={user} />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
          <p className="text-gray-400">Manage your account settings and preferences</p>
        </div>

        <div className="bg-gray-800 rounded-lg">
          {/* Tabs */}
          <div className="border-b border-gray-700">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('profile')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'profile'
                    ? 'border-blue-500 text-white'
                    : 'border-transparent text-gray-400 hover:text-gray-300'
                }`}
              >
                Profile
              </button>
              <button
                onClick={() => setActiveTab('password')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'password'
                    ? 'border-blue-500 text-white'
                    : 'border-transparent text-gray-400 hover:text-gray-300'
                }`}
              >
                Password
              </button>
              <button
                onClick={() => setActiveTab('notifications')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'notifications'
                    ? 'border-blue-500 text-white'
                    : 'border-transparent text-gray-400 hover:text-gray-300'
                }`}
              >
                Notifications
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'profile' && (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Avatar
                  </label>
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 bg-gray-700 rounded-full flex items-center justify-center">
                      {user.avatar ? (
                        <img
                          src={user.avatar}
                          alt="Avatar"
                          className="w-20 h-20 rounded-full"
                        />
                      ) : (
                        <span className="text-2xl text-gray-400">
                          {user.username.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div>
                      <button
                        type="button"
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Change Avatar
                      </button>
                      <p className="text-sm text-gray-400 mt-1">
                        JPG, PNG or GIF. Max 2MB.
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Username
                  </label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    aria-label="Username"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    disabled
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-400 cursor-not-allowed"
                    aria-label="Email"
                  />
                  <p className="text-sm text-gray-400 mt-1">
                    Email cannot be changed. Contact support if needed.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Bio
                  </label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    rows={4}
                    placeholder="Tell us about yourself..."
                    aria-label="Bio"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            )}

            {activeTab === 'password' && (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Current Password
                  </label>
                  <input
                    type="password"
                    value={formData.currentPassword}
                    onChange={(e) => setFormData(prev => ({ ...prev, currentPassword: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    aria-label="Current Password"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={formData.newPassword}
                    onChange={(e) => setFormData(prev => ({ ...prev, newPassword: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    minLength={6}
                    aria-label="New Password"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    minLength={6}
                    aria-label="Confirm New Password"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {loading ? 'Updating...' : 'Update Password'}
                  </button>
                </div>
              </form>
            )}

            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-white mb-4">Notification Preferences</h3>
                
                <div className="space-y-4">
                  <label className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium">Email Notifications</p>
                      <p className="text-sm text-gray-400">Receive email updates about your account</p>
                    </div>
                    <input
                      type="checkbox"
                      defaultChecked={true}
                      className="w-5 h-5 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                      aria-label="Email Notifications"
                    />
                  </label>

                  <label className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium">Deal Notifications</p>
                      <p className="text-sm text-gray-400">Get notified when someone makes an offer</p>
                    </div>
                    <input
                      type="checkbox"
                      defaultChecked={true}
                      className="w-5 h-5 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                      aria-label="Deal Notifications"
                    />
                  </label>

                  <label className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium">Comment Notifications</p>
                      <p className="text-sm text-gray-400">Get notified when someone comments on your projects</p>
                    </div>
                    <input
                      type="checkbox"
                      defaultChecked={true}
                      className="w-5 h-5 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                      aria-label="Comment Notifications"
                    />
                  </label>

                  <label className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium">Marketing Emails</p>
                      <p className="text-sm text-gray-400">Receive updates about new features and promotions</p>
                    </div>
                    <input
                      type="checkbox"
                      defaultChecked={false}
                      className="w-5 h-5 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                      aria-label="Marketing Emails"
                    />
                  </label>
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    type="button"
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Save Preferences
                  </button>
                </div>
              </div>
            )}
          </div>
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
