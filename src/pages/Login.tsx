import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  Code,
  Eye,
  EyeOff,
  Lock,
  Mail,
  ShoppingBag,
  Sparkles,
  User,
} from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { authenticateUser, registerUser } from '../services/authService'

interface FormData {
  email: string
  password: string
  username: string
  confirmPassword: string
  rememberMe: boolean
}

interface FormErrors {
  email?: string
  password?: string
  username?: string
  confirmPassword?: string
  general?: string
}

const Login: React.FC = () => {
  const { setUser } = useAuth()
  const navigate = useNavigate()

  const [currentView, setCurrentView] = useState<'login' | 'register' | 'forgot'>('login')
  const [accountType, setAccountType] = useState<'developer' | 'user'>('user')
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    username: '',
    confirmPassword: '',
    rememberMe: false,
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})
  const [success, setSuccess] = useState('')

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.email) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    } else if (currentView === 'register' && !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Use uppercase, lowercase, and a number'
    }

    if (currentView === 'register') {
      if (!formData.username) {
        newErrors.username = 'Username is required'
      } else if (formData.username.length < 3) {
        newErrors.username = 'Username must be at least 3 characters'
      } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
        newErrors.username = 'Username can contain letters, numbers, and underscores'
      }

      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!validateForm()) {
      return
    }

    setLoading(true)
    setErrors({})
    setSuccess('')

    try {
      if (currentView === 'login') {
        const demoAccounts = {
          'developer@example.com': { password: 'dev123', type: 'developer' },
          'user@example.com': { password: 'user123', type: 'user' },
        }

        const account = demoAccounts[formData.email as keyof typeof demoAccounts]

        if (account && account.password === formData.password && account.type === accountType) {
          const authenticatedUser = authenticateUser(
            formData.email,
            formData.password,
            accountType.toUpperCase() as 'USER' | 'DEVELOPER',
          )

          if (!authenticatedUser) {
            throw new Error('Invalid credentials')
          }

          setUser(authenticatedUser)

          if (formData.rememberMe) {
            localStorage.setItem('remembered-email', formData.email)
          }

          setSuccess('Welcome back. Taking you inside...')

          setTimeout(() => {
            navigate(accountType === 'developer' ? '/dashboard' : '/')
          }, 900)
        } else {
          setErrors({
            general: 'Invalid credentials. Try developer@example.com / dev123 or user@example.com / user123.',
          })
        }
      } else if (currentView === 'register') {
        const userData = registerUser({
          email: formData.email,
          username: formData.username,
          password: formData.password,
          accountType: accountType.toUpperCase() as 'USER' | 'DEVELOPER',
        })
        setUser(userData)
        setSuccess('Account created. Redirecting...')

        setTimeout(() => {
          navigate(accountType === 'developer' ? '/dashboard' : '/')
        }, 900)
      } else {
        setSuccess('Password reset link sent. Check your inbox.')

        setTimeout(() => {
          setCurrentView('login')
          setSuccess('')
        }, 1800)
      }
    } catch (error) {
      setErrors({ general: 'Something went wrong. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = event.target

    setFormData((previous) => ({
      ...previous,
      [name]: type === 'checkbox' ? checked : value,
    }))

    if (errors[name as keyof FormErrors]) {
      setErrors((previous) => ({
        ...previous,
        [name]: undefined,
      }))
    }
  }

  const handleQuickLogin = (type: 'developer' | 'user') => {
    const demoAccounts = {
      developer: { email: 'developer@example.com', password: 'dev123' },
      user: { email: 'user@example.com', password: 'user123' },
    }

    const account = demoAccounts[type]
    setFormData((previous) => ({
      ...previous,
      email: account.email,
      password: account.password,
    }))
    setAccountType(type)
  }

  const viewCopy = {
    login: {
      title: 'Sign in to DevBloxi',
      description: 'Access curated projects, message builders, and keep your favorite launches in one place.',
      button: 'Sign in',
    },
    register: {
      title: 'Create your account',
      description: 'Join as a buyer or builder and start shipping with less setup.',
      button: 'Create account',
    },
    forgot: {
      title: 'Reset your password',
      description: 'We will send you a link so you can get back to your projects quickly.',
      button: 'Send reset link',
    },
  } as const

  const currentCopy = viewCopy[currentView]

  const renderFieldError = (message?: string) =>
    message ? (
      <p className="mt-2 flex items-center gap-2 text-sm text-rose-300">
        <AlertCircle className="h-4 w-4" />
        {message}
      </p>
    ) : null

  return (
    <div className="app-shell flex min-h-screen items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
      <div className="section-shell flex max-w-6xl items-center justify-center">
        <div className="grid w-full overflow-hidden rounded-[2rem] border border-white/10 bg-stone-950/75 shadow-medium backdrop-blur-xl lg:grid-cols-[0.95fr,1.05fr]">
          <aside className="relative hidden overflow-hidden border-r border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(45,212,191,0.25),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(245,158,11,0.18),transparent_28%),linear-gradient(180deg,rgba(28,25,23,0.96),rgba(12,10,9,0.98))] p-10 lg:block">
            <span className="eyebrow">
              <Sparkles className="h-3.5 w-3.5" />
              Marketplace access
            </span>

            <h1 className="mt-8 max-w-md text-5xl font-bold tracking-tight text-white">
              Ship less setup.
              <span className="block text-stone-400">Browse better projects.</span>
            </h1>

            <p className="mt-6 max-w-md text-base leading-7 text-stone-300">
              DevBloxi helps developers showcase polished builds and gives buyers the context they need before committing.
            </p>

            <div className="mt-10 grid gap-4">
              <div className="stat-tile">
                <p className="text-xs uppercase tracking-[0.22em] text-stone-500">For buyers</p>
                <p className="mt-3 text-lg font-semibold text-white">Clear previews, pricing, and creator context.</p>
              </div>
              <div className="stat-tile">
                <p className="text-xs uppercase tracking-[0.22em] text-stone-500">For builders</p>
                <p className="mt-3 text-lg font-semibold text-white">A sharper storefront for launches, kits, and MVPs.</p>
              </div>
            </div>

            <div className="mt-10 rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-5">
              <p className="text-sm font-semibold text-stone-200">Demo accounts</p>
              <div className="mt-4 space-y-3 text-sm text-stone-400">
                <div className="flex items-center justify-between rounded-2xl border border-white/8 bg-black/15 px-4 py-3">
                  <span>developer@example.com</span>
                  <span className="text-stone-500">dev123</span>
                </div>
                <div className="flex items-center justify-between rounded-2xl border border-white/8 bg-black/15 px-4 py-3">
                  <span>user@example.com</span>
                  <span className="text-stone-500">user123</span>
                </div>
              </div>
            </div>
          </aside>

          <section className="p-6 sm:p-8 lg:p-10">
            {currentView === 'forgot' && (
              <button onClick={() => setCurrentView('login')} className="btn-ghost mb-6 px-0 py-0">
                <ArrowLeft className="h-4 w-4" />
                Back to login
              </button>
            )}

            <div className="mx-auto max-w-xl">
              <div className="mb-8">
                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-300 to-amber-300 text-lg font-extrabold text-stone-950 shadow-soft">
                  DB
                </div>
                <h2 className="text-4xl font-bold tracking-tight text-white">{currentCopy.title}</h2>
                <p className="mt-3 max-w-lg text-base leading-7 text-stone-400">{currentCopy.description}</p>
              </div>

              {currentView !== 'forgot' && (
                <div className="mb-6 grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setAccountType('developer')}
                    className={`rounded-[1.5rem] border p-4 text-left transition ${
                      accountType === 'developer'
                        ? 'border-teal-300/35 bg-teal-300/12 text-white'
                        : 'border-white/10 bg-white/[0.04] text-stone-300 hover:bg-white/[0.08]'
                    }`}
                  >
                    <Code className="h-5 w-5" />
                    <p className="mt-4 font-semibold">Developer</p>
                    <p className="mt-1 text-sm text-stone-400">Publish and sell your work.</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAccountType('user')}
                    className={`rounded-[1.5rem] border p-4 text-left transition ${
                      accountType === 'user'
                        ? 'border-teal-300/35 bg-teal-300/12 text-white'
                        : 'border-white/10 bg-white/[0.04] text-stone-300 hover:bg-white/[0.08]'
                    }`}
                  >
                    <ShoppingBag className="h-5 w-5" />
                    <p className="mt-4 font-semibold">User</p>
                    <p className="mt-1 text-sm text-stone-400">Discover and purchase projects.</p>
                  </button>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                {currentView === 'register' && (
                  <div>
                    <label className="mb-2 block text-sm font-medium text-stone-300">Username</label>
                    <div className="relative">
                      <User className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-500" />
                      <input
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleInputChange}
                        className="input-base pl-11"
                        placeholder="Choose a username"
                        required
                      />
                    </div>
                    {renderFieldError(errors.username)}
                  </div>
                )}

                <div>
                  <label className="mb-2 block text-sm font-medium text-stone-300">Email address</label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-500" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="input-base pl-11"
                      placeholder="you@example.com"
                      required
                    />
                  </div>
                  {renderFieldError(errors.email)}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-stone-300">Password</label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-500" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="input-base pl-11 pr-12"
                      placeholder="Enter your password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((value) => !value)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-500 transition hover:text-stone-200"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {renderFieldError(errors.password)}
                </div>

                {currentView === 'register' && (
                  <div>
                    <label className="mb-2 block text-sm font-medium text-stone-300">Confirm password</label>
                    <div className="relative">
                      <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-500" />
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        className="input-base pl-11 pr-12"
                        placeholder="Re-enter your password"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword((value) => !value)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-500 transition hover:text-stone-200"
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {renderFieldError(errors.confirmPassword)}
                  </div>
                )}

                {currentView === 'login' && (
                  <label className="flex items-center gap-3 text-sm text-stone-400">
                    <input
                      type="checkbox"
                      id="rememberMe"
                      name="rememberMe"
                      checked={formData.rememberMe}
                      onChange={handleInputChange}
                      className="h-4 w-4 rounded border-white/10 bg-stone-900 text-teal-300 focus:ring-teal-300/30"
                    />
                    Remember me on this device
                  </label>
                )}

                {success && (
                  <div className="flex items-center gap-3 rounded-2xl border border-emerald-300/20 bg-emerald-300/10 px-4 py-3 text-sm text-emerald-100">
                    <CheckCircle className="h-4 w-4" />
                    {success}
                  </div>
                )}

                {errors.general && (
                  <div className="flex items-center gap-3 rounded-2xl border border-rose-300/20 bg-rose-300/10 px-4 py-3 text-sm text-rose-100">
                    <AlertCircle className="h-4 w-4" />
                    {errors.general}
                  </div>
                )}

                <button type="submit" disabled={loading} className="btn-primary w-full justify-center rounded-2xl py-3.5 text-base">
                  {loading ? (
                    <span className="loading border-stone-800 border-t-stone-950" />
                  ) : (
                    <>
                      {currentCopy.button}
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </form>

              {currentView === 'login' && (
                <div className="mt-8 rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-5">
                  <p className="text-sm font-medium text-stone-300">Quick demo access</p>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <button
                      type="button"
                      onClick={() => handleQuickLogin('developer')}
                      className="rounded-2xl border border-white/10 bg-stone-950/80 p-4 text-left transition hover:border-teal-300/25 hover:bg-white/[0.05]"
                    >
                      <Code className="h-5 w-5 text-teal-200" />
                      <p className="mt-4 font-semibold text-white">Developer demo</p>
                      <p className="mt-1 text-sm text-stone-500">Fill builder credentials</p>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickLogin('user')}
                      className="rounded-2xl border border-white/10 bg-stone-950/80 p-4 text-left transition hover:border-teal-300/25 hover:bg-white/[0.05]"
                    >
                      <ShoppingBag className="h-5 w-5 text-amber-200" />
                      <p className="mt-4 font-semibold text-white">User demo</p>
                      <p className="mt-1 text-sm text-stone-500">Fill buyer credentials</p>
                    </button>
                  </div>
                </div>
              )}

              <div className="mt-8 text-center text-sm text-stone-400">
                {currentView === 'login' ? (
                  <>
                    Need an account?{' '}
                    <button onClick={() => setCurrentView('register')} className="font-semibold text-teal-200 transition hover:text-teal-100">
                      Sign up
                    </button>
                    {' · '}
                    <button onClick={() => setCurrentView('forgot')} className="font-semibold text-teal-200 transition hover:text-teal-100">
                      Forgot password?
                    </button>
                  </>
                ) : currentView === 'register' ? (
                  <>
                    Already registered?{' '}
                    <button onClick={() => setCurrentView('login')} className="font-semibold text-teal-200 transition hover:text-teal-100">
                      Sign in
                    </button>
                  </>
                ) : (
                  <button onClick={() => setCurrentView('login')} className="font-semibold text-teal-200 transition hover:text-teal-100">
                    Back to sign in
                  </button>
                )}
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}

export default Login
