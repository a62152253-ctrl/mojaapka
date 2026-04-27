import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { DollarSign, FileText, Plus, Tag, X } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'

const CreateProject: React.FC = () => {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [projectData, setProjectData] = useState({
    title: '',
    description: '',
    slug: '',
    price: 0,
    category: 'web-development',
    tags: [] as string[],
  })

  const [tagInput, setTagInput] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const categories = [
    'web-development',
    'mobile-app',
    'desktop-app',
    'game-development',
    'ai-ml',
    'blockchain',
    'iot',
    'other',
  ]

  
  const generateSlug = (title: string) =>
    title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')

  const handleTitleChange = (title: string) => {
    setProjectData((previous) => ({
      ...previous,
      title,
      slug: generateSlug(title),
    }))
  }

  const addTag = () => {
    const tag = tagInput.trim().toLowerCase()
    if (tag && !projectData.tags.includes(tag)) {
      setProjectData((previous) => ({
        ...previous,
        tags: [...previous.tags, tag],
      }))
      setTagInput('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    setProjectData((previous) => ({
      ...previous,
      tags: previous.tags.filter((tag) => tag !== tagToRemove),
    }))
  }

  const handleGoToLiveWorkspace = () => {
    // Save project data to sessionStorage for live workspace
    sessionStorage.setItem('projectTitle', projectData.title)
    sessionStorage.setItem('projectDescription', projectData.description)
    sessionStorage.setItem('projectCategory', projectData.category)
    sessionStorage.setItem('projectTags', JSON.stringify(projectData.tags))
    sessionStorage.setItem('projectPrice', projectData.price.toString())
    
    navigate('/live-workspace')
  }

  
  const helperStats = [
    { label: 'Category', value: projectData.category.replace(/-/g, ' ') },
    { label: 'Tags', value: String(projectData.tags.length) },
    { label: 'Status', value: 'Draft' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900">
      <div className="px-6 py-8 lg:px-12">
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <span className="eyebrow">
              <Plus className="h-3.5 w-3.5" />
              Builder workspace
            </span>
            <h1 className="mt-4 text-5xl font-bold tracking-tight text-white">Create a project listing</h1>
            <p className="mt-4 max-w-3xl text-lg leading-8 text-stone-300">
              Add a clear pitch, a useful preview, and source files that help buyers understand what they are getting.
            </p>
          </div>

          <button onClick={() => navigate('/dashboard')} className="btn-secondary self-start">
            <X className="h-4 w-4" />
            Close editor
          </button>
        </div>

        <div className="max-w-4xl mx-auto">
          <section className="surface-panel-strong p-8 lg:p-10">
            <div className="space-y-8">
              <div>
                <label className="mb-3 block text-lg font-semibold text-stone-200">
                  <FileText className="mr-3 inline h-5 w-5" />
                  Project title
                </label>
                <input
                  type="text"
                  value={projectData.title}
                  onChange={(event) => handleTitleChange(event.target.value)}
                  className="input-base text-lg px-5 py-4"
                  placeholder="Analytics dashboard for SaaS teams"
                />
                {errors.title && <p className="mt-3 text-base text-rose-300">{errors.title}</p>}
              </div>

              <div>
                <label className="mb-3 block text-lg font-semibold text-stone-200">Description</label>
                <textarea
                  value={projectData.description}
                  onChange={(event) => setProjectData((previous) => ({ ...previous, description: event.target.value }))}
                  rows={6}
                  className="input-base text-lg px-5 py-4 min-h-[180px] resize-none"
                  placeholder="Describe the stack, use case, and what makes this build worth buying."
                />
                {errors.description && <p className="mt-3 text-base text-rose-300">{errors.description}</p>}
              </div>

              <div>
                <label className="mb-3 block text-lg font-semibold text-stone-200">Slug</label>
                <input
                  type="text"
                  value={projectData.slug}
                  onChange={(event) => setProjectData((previous) => ({ ...previous, slug: event.target.value }))}
                  className="input-base text-lg px-5 py-4"
                  placeholder="saas-analytics-dashboard"
                />
                {errors.slug && <p className="mt-3 text-base text-rose-300">{errors.slug}</p>}
              </div>

              <div>
                <label className="mb-3 block text-lg font-semibold text-stone-200">
                  <DollarSign className="mr-3 inline h-5 w-5" />
                  Price
                </label>
                <input
                  type="number"
                  value={projectData.price}
                  onChange={(event) => setProjectData((previous) => ({ ...previous, price: Number(event.target.value) }))}
                  className="input-base text-lg px-5 py-4"
                  placeholder="0"
                  min="0"
                />
                {errors.price && <p className="mt-3 text-base text-rose-300">{errors.price}</p>}
              </div>

              <div>
                <label className="mb-3 block text-lg font-semibold text-stone-200">Category</label>
                <select
                  value={projectData.category}
                  onChange={(event) => setProjectData((previous) => ({ ...previous, category: event.target.value }))}
                  className="input-base text-lg px-5 py-4"
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category.replace(/-/g, ' ')}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-3 block text-lg font-semibold text-stone-200">
                  <Tag className="mr-3 inline h-5 w-5" />
                  Tags
                </label>
                <div className="flex gap-4">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(event) => setTagInput(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        event.preventDefault()
                        addTag()
                      }
                    }}
                    className="input-base text-lg px-5 py-4 flex-1"
                    placeholder="react"
                  />
                  <button onClick={addTag} className="btn-primary rounded-2xl px-6 py-4 text-lg font-semibold">
                    Add
                  </button>
                </div>

                <div className="mt-4 flex flex-wrap gap-3">
                  {projectData.tags.map((tag) => (
                    <span key={tag} className="tag-pill border-teal-300/20 bg-teal-300/10 text-teal-100 px-4 py-2 text-base">
                      #{tag}
                      <button onClick={() => removeTag(tag)} className="ml-2 text-teal-50/80 transition hover:text-white">
                        <X className="h-4 w-4" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                {helperStats.map((stat) => (
                  <div key={stat.label} className="stat-tile p-6 text-center">
                    <p className="text-sm uppercase tracking-[0.18em] text-stone-500">{stat.label}</p>
                    <p className="mt-3 font-['Space_Grotesk'] text-2xl font-bold text-white">{stat.value}</p>
                  </div>
                ))}
              </div>

              <div className="flex gap-4">
                <button onClick={handleGoToLiveWorkspace} className="btn-primary flex-1 rounded-2xl px-6 py-5 text-lg font-semibold">
                  Go to Live Workspace
                </button>
              </div>

              {errors.submit && (
                <div className="rounded-2xl border border-rose-300/20 bg-rose-300/10 p-4">
                  <p className="text-rose-300">{errors.submit}</p>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}

export default CreateProject
