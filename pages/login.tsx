import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Eye, EyeOff, User as UserIcon, Lock, Mail, Code, ShoppingBag,
  Sparkles, Shield, Zap, ArrowRight, CheckCircle, AlertCircle,
  Github, Chrome, Twitter, Heart, Star, Users, TrendingUp
} from 'lucide-react'
import { apiClient } from '../src/lib/api'
import { User } from '../src/types'

export default function Login() {
  const [currentView, setCurrentView] = useState<'login' | 'register' | 'forgot'>('login')
  const [accountType, setAccountType] = useState<'DEVELOPER' | 'USER'>('USER')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState(0)
  const [focusedField, setFocusedField] = useState<string>('')
  const [showSocialLogin, setShowSocialLogin] = useState(true)
  const [rememberMe, setRememberMe] = useState(false)
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  
  const navigate = useNavigate()
  const formRef = useRef<HTMLDivElement>(null)

  // Password strength checker
  useEffect(() => {
    if (formData.password) {
      let strength = 0
      if (formData.password.length >= 8) strength += 25
      if (formData.password.match(/[a-z]/) && formData.password.match(/[A-Z]/)) strength += 25
      if (formData.password.match(/[0-9]/)) strength += 25
      if (formData.password.match(/[^a-zA-Z0-9]/)) strength += 25
      setPasswordStrength(strength)
    } else {
      setPasswordStrength(0)
    }
  }, [formData.password])

  // Animation for view changes
  const switchView = (view: 'login' | 'register' | 'forgot') => {
    setIsAnimating(true)
    setTimeout(() => {
      setCurrentView(view)
      setIsAnimating(false)
    }, 300)
  }

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('token')
    if (token) {
      // Verify token and redirect
      apiClient.getCurrentUser().then(response => {
        if (response.success && response.data) {
          if (response.data.accountType === 'DEVELOPER') {
            navigate('/dashboard')
          } else {
            navigate('/')
          }
        }
      }).catch(() => {
        // Token invalid, continue with login
      })
    }
  }, [navigate])

  const validateRegistration = () => {
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters')
      return false
    }
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return false
    }
    
    if (!formData.email.includes('@')) {
      setError('Please enter a valid email address')
      return false
    }
    
    return true
  }

  const validateEmail = (email: string) => {
    return email.includes('@')
  }

  const handleAuthSuccess = (user: User, token: string, message: string) => {
    localStorage.setItem('token', token)
    apiClient.setToken(token)
    setSuccess(message)
    
    setTimeout(() => {
      if (user.accountType === 'DEVELOPER') {
        navigate('/dashboard')
      } else {
        navigate('/')
      }
    }, 1500)
  }

  const handleLogin = async () => {
    const response = await apiClient.login({
      username: formData.username,
      password: formData.password,
      accountType: accountType
    })
    
    if (response.success && response.data) {
      const { user, token } = response.data
      handleAuthSuccess(user, token, 'Login successful! Redirecting...')
    } else {
      setError(response.error || 'Login failed')
    }
  }

  const handleRegister = async () => {
    if (!validateRegistration()) {
      return
    }
    
    const response = await apiClient.register({
      email: formData.email,
      username: formData.username.trim(),
      password: formData.password,
      accountType: accountType
    })
    
    if (response.success && response.data) {
      const { user, token } = response.data
      handleAuthSuccess(user, token, 'Registration successful!')
    } else {
      setError(response.error || 'Registration failed')
    }
  }

  const handleForgotPassword = async () => {
    if (!validateEmail(formData.email)) {
      setError('Please enter a valid email address')
      return
    }
    
    setSuccess('Password reset link sent to your email')
    setTimeout(() => switchView('login'), 2000)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)
    
    try {
      if (currentView === 'login') {
        await handleLogin()
      } else if (currentView === 'register') {
        await handleRegister()
      } else if (currentView === 'forgot') {
        await handleForgotPassword()
      }
    } catch (error) {
      console.error('Auth error:', error)
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const resetForm = () => {
    setFormData({
      username: '',
      email: '',
      password: '',
      confirmPassword: ''
    })
    setError('')
    setSuccess('')
  }

  const getPasswordStrengthColor = () => {
    if (passwordStrength <= 25) return 'bg-red-500'
    if (passwordStrength <= 50) return 'bg-orange-500'
    if (passwordStrength <= 75) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  const getPasswordStrengthText = () => {
    if (passwordStrength <= 25) return 'Weak'
    if (passwordStrength <= 50) return 'Fair'
    if (passwordStrength <= 75) return 'Good'
    return 'Strong'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900 flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full opacity-20 blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full opacity-20 blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-500 rounded-full opacity-10 blur-3xl"></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo and branding */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
              <Code className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">DevBlox</h1>
          <p className="text-white/70">
            {accountType === 'DEVELOPER' ? 'Build amazing projects' : 'Discover incredible code'}
          </p>
        </div>

        {/* Main card */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-8 shadow-2xl">
          {/* Account type selector */}
          <div className="flex space-x-2 mb-6">
            <button
              onClick={() => setAccountType('USER')}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
                accountType === 'USER'
                  ? 'bg-white text-purple-900 shadow-lg'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              <Users className="w-4 h-4 inline mr-2" />
              User
            </button>
            <button
              onClick={() => setAccountType('DEVELOPER')}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
                accountType === 'DEVELOPER'
                  ? 'bg-white text-purple-900 shadow-lg'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              <Code className="w-4 h-4 inline mr-2" />
              Developer
            </button>
          </div>

          {/* View switcher */}
          <div className="flex space-x-1 mb-6 bg-white/5 rounded-lg p-1">
            {(['login', 'register', 'forgot'] as const).map((view) => (
              <button
                key={view}
                onClick={() => switchView(view)}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all capitalize ${
                  currentView === view
                    ? 'bg-white text-purple-900 shadow'
                    : 'text-white/70 hover:text-white'
                }`}
              >
                {view}
              </button>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username field */}
            {(currentView === 'login' || currentView === 'register') && (
              <div>
                <label className="block text-white/70 text-sm font-medium mb-2">
                  Username
                </label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/50" />
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    onFocus={() => setFocusedField('username')}
                    onBlur={() => setFocusedField('')}
                    className={`w-full pl-10 pr-4 py-3 bg-white/10 border ${
                      focusedField === 'username' ? 'border-white/40' : 'border-white/20'
                    } rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-white/40 transition-all`}
                    placeholder="Enter your username"
                    required
                  />
                </div>
              </div>
            )}

            {/* Email field */}
            {(currentView === 'register' || currentView === 'forgot') && (
              <div>
                <label className="block text-white/70 text-sm font-medium mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/50" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField('')}
                    className={`w-full pl-10 pr-4 py-3 bg-white/10 border ${
                      focusedField === 'email' ? 'border-white/40' : 'border-white/20'
                    } rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-white/40 transition-all`}
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>
            )}

            {/* Password field */}
            {(currentView === 'login' || currentView === 'register') && (
              <div>
                <label className="block text-white/70 text-sm font-medium mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/50" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField('')}
                    className={`w-full pl-10 pr-12 py-3 bg-white/10 border ${
                      focusedField === 'password' ? 'border-white/40' : 'border-white/20'
                    } rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-white/40 transition-all`}
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/50 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>

                {/* Password strength indicator */}
                {currentView === 'register' && formData.password && (
                  <div className="mt-2">
                    <div className="flex items-center justify-between text-xs text-white/70 mb-1">
                      <span>Password strength</span>
                      <span>{getPasswordStrengthText()}</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${getPasswordStrengthColor()}`}
                        style={{ width: `${passwordStrength}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Confirm password field */}
            {currentView === 'register' && (
              <div>
                <label className="block text-white/70 text-sm font-medium mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/50" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    onFocus={() => setFocusedField('confirmPassword')}
                    onBlur={() => setFocusedField('')}
                    className={`w-full pl-10 pr-12 py-3 bg-white/10 border ${
                      focusedField === 'confirmPassword' ? 'border-white/40' : 'border-white/20'
                    } rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-white/40 transition-all`}
                    placeholder="Confirm your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/50 hover:text-white"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            )}

            {/* Remember me checkbox */}
            {currentView === 'login' && (
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="remember"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-purple-600 bg-white/10 border-white/20 rounded focus:ring-purple-500"
                />
                <label htmlFor="remember" className="ml-2 text-sm text-white/70">
                  Remember me
                </label>
              </div>
            )}

            {/* Error/Success messages */}
            {error && (
              <div className="flex items-center space-x-2 p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-400" />
                <span className="text-red-300 text-sm">{error}</span>
              </div>
            )}

            {success && (
              <div className="flex items-center space-x-2 p-3 bg-green-500/20 border border-green-500/30 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span className="text-green-300 text-sm">{success}</span>
              </div>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-white text-purple-900 font-semibold rounded-lg shadow-lg hover:bg-white/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-purple-900 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>{currentView === 'login' ? 'Sign In' : currentView === 'register' ? 'Sign Up' : 'Send Reset'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Social login */}
          {showSocialLogin && currentView !== 'forgot' && (
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/20"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-transparent text-white/50">Or continue with</span>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-3">
                <button className="flex items-center justify-center p-3 bg-white/10 border border-white/20 rounded-lg hover:bg-white/20 transition-all" aria-label="Login with GitHub">
                  <Github className="w-5 h-5 text-white" />
                </button>
                <button className="flex items-center justify-center p-3 bg-white/10 border border-white/20 rounded-lg hover:bg-white/20 transition-all" aria-label="Login with Google">
                  <Chrome className="w-5 h-5 text-white" />
                </button>
                <button className="flex items-center justify-center p-3 bg-white/10 border border-white/20 rounded-lg hover:bg-white/20 transition-all" aria-label="Login with Twitter">
                  <Twitter className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-white/50 text-sm">
          <p>&copy; 2024 DevBlox. Made with <Heart className="w-4 h-4 inline text-red-400" /> for developers</p>
        </div>
      </div>
    </div>
  )
}
