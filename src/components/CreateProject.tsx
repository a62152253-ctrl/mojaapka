import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { DollarSign, Eye, FileText, Plus, Save, Tag, Upload, X } from 'lucide-react'
import MonacoCodeEditor from './MonacoCodeEditor'
import { ProjectsAPI } from '../api/projects'
import { useAuth } from '../hooks/useAuth'

interface CodeFile {
  id: string
  name: string
  content: string
  language: string
}

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
    thumbnailUrl: '',
  })

  const [files, setFiles] = useState<CodeFile[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
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

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!projectData.title.trim()) newErrors.title = 'Title is required'
    if (!projectData.description.trim()) newErrors.description = 'Description is required'

    if (!projectData.slug.trim()) {
      newErrors.slug = 'Slug is required'
    } else if (!/^[a-z0-9-]+$/.test(projectData.slug)) {
      newErrors.slug = 'Use lowercase letters, numbers, and hyphens only'
    }

    if (projectData.price < 0) {
      newErrors.price = 'Price must be at least 0'
    }

    if (files.length === 0) {
      newErrors.files = 'Add at least one file in the editor before publishing'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

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

  const handleSaveProject = async () => {
    if (!validateForm()) return

    if (!user) {
      navigate('/login')
      return
    }

    try {
      setIsSaving(true)

      const projectResponse = await ProjectsAPI.createProject({
        title: projectData.title,
        description: projectData.description,
        slug: projectData.slug,
        price: projectData.price,
        category: projectData.category,
        tags: projectData.tags,
        authorId: user.id,
        thumbnailUrl: projectData.thumbnailUrl,
        files: files.map((file) => ({
          name: file.name,
          content: file.content,
          language: file.language,
        })),
      })

      if (projectResponse.success && projectResponse.data) {
        navigate(`/project/${projectResponse.data.id}`)
      } else {
        setErrors({ submit: 'Failed to create project' })
      }
    } catch (error) {
      console.error('Create project error:', error)
      setErrors({ submit: 'An error occurred while creating the project' })
    } finally {
      setIsSaving(false)
    }
  }

  const handleThumbnailUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (loadEvent) => {
      setProjectData((previous) => ({
        ...previous,
        thumbnailUrl: loadEvent.target?.result as string,
      }))
    }
    reader.readAsDataURL(file)
  }

  const helperStats = [
    { label: 'Category', value: projectData.category.replace(/-/g, ' ') },
    { label: 'Tags', value: String(projectData.tags.length) },
    { label: 'Files', value: String(files.length) },
  ]

  return (
    <div className="section-shell py-10">
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <span className="eyebrow">
            <Plus className="h-3.5 w-3.5" />
            Builder workspace
          </span>
          <h1 className="mt-4 text-4xl font-bold tracking-tight text-white">Create a project listing</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-stone-400">
            Add a clear pitch, a useful preview, and source files that help buyers understand what they are getting.
          </p>
        </div>

        <button onClick={() => navigate('/dashboard')} className="btn-secondary self-start">
          <X className="h-4 w-4" />
          Close editor
        </button>
      </div>

      <div className="grid gap-8 xl:grid-cols-[420px,minmax(0,1fr)]">
        <section className="surface-panel-strong p-6 sm:p-7">
          <div className="space-y-6">
            <div>
              <label className="mb-2 block text-sm font-medium text-stone-300">
                <FileText className="mr-2 inline h-4 w-4" />
                Project title
              </label>
              <input
                type="text"
                value={projectData.title}
                onChange={(event) => handleTitleChange(event.target.value)}
                className="input-base"
                placeholder="Analytics dashboard for SaaS teams"
              />
              {errors.title && <p className="mt-2 text-sm text-rose-300">{errors.title}</p>}
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-stone-300">Description</label>
              <textarea
                value={projectData.description}
                onChange={(event) => setProjectData((previous) => ({ ...previous, description: event.target.value }))}
                rows={5}
                className="input-base min-h-[150px] resize-none"
                placeholder="Describe the stack, use case, and what makes this build worth buying."
              />
              {errors.description && <p className="mt-2 text-sm text-rose-300">{errors.description}</p>}
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-stone-300">Slug</label>
              <input
                type="text"
                value={projectData.slug}
                onChange={(event) => setProjectData((previous) => ({ ...previous, slug: event.target.value }))}
                className="input-base"
                placeholder="saas-analytics-dashboard"
              />
              {errors.slug && <p className="mt-2 text-sm text-rose-300">{errors.slug}</p>}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-stone-300">
                  <DollarSign className="mr-2 inline h-4 w-4" />
                  Price
                </label>
                <input
                  type="number"
                  value={projectData.price}
                  onChange={(event) => setProjectData((previous) => ({ ...previous, price: parseFloat(event.target.value) || 0 }))}
                  min="0"
                  step="0.01"
                  className="input-base"
                  placeholder="299"
                />
                {errors.price && <p className="mt-2 text-sm text-rose-300">{errors.price}</p>}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-stone-300">Category</label>
                <select
                  value={projectData.category}
                  onChange={(event) => setProjectData((previous) => ({ ...previous, category: event.target.value }))}
                  className="input-base"
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category.replace('-', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase())}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-stone-300">
                <Tag className="mr-2 inline h-4 w-4" />
                Tags
              </label>
              <div className="flex gap-3">
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
                  className="input-base flex-1"
                  placeholder="react"
                />
                <button onClick={addTag} className="btn-primary rounded-2xl px-4 py-3">
                  Add
                </button>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {projectData.tags.map((tag) => (
                  <span key={tag} className="tag-pill border-teal-300/20 bg-teal-300/10 text-teal-100">
                    #{tag}
                    <button onClick={() => removeTag(tag)} className="ml-2 text-teal-50/80 transition hover:text-white">
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-stone-300">
                <Upload className="mr-2 inline h-4 w-4" />
                Thumbnail
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleThumbnailUpload}
                className="input-base file:mr-4 file:rounded-full file:border-0 file:bg-white/8 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-stone-200"
              />

              {projectData.thumbnailUrl && (
                <div className="mt-4 overflow-hidden rounded-[1.5rem] border border-white/10">
                  <img src={projectData.thumbnailUrl} alt="Thumbnail preview" className="h-44 w-full object-cover" />
                </div>
              )}
            </div>

            <div className="grid grid-cols-3 gap-3">
              {helperStats.map((stat) => (
                <div key={stat.label} className="stat-tile p-4 text-center">
                  <p className="text-xs uppercase tracking-[0.18em] text-stone-500">{stat.label}</p>
                  <p className="mt-2 font-['Space_Grotesk'] text-xl font-bold text-white">{stat.value}</p>
                </div>
              ))}
            </div>

            {errors.files && <p className="rounded-2xl border border-rose-300/20 bg-rose-300/10 px-4 py-3 text-sm text-rose-200">{errors.files}</p>}
            {errors.submit && <p className="rounded-2xl border border-rose-300/20 bg-rose-300/10 px-4 py-3 text-sm text-rose-200">{errors.submit}</p>}

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                onClick={handleSaveProject}
                disabled={isSaving}
                className="btn-primary flex-1 justify-center rounded-2xl py-3.5 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                {isSaving ? 'Publishing...' : 'Publish project'}
              </button>
              <button onClick={() => setShowPreview((value) => !value)} className="btn-secondary rounded-2xl px-4 py-3.5">
                <Eye className="h-4 w-4" />
                {showPreview ? 'Hide preview' : 'Show preview'}
              </button>
            </div>
          </div>
        </section>

        <section className="space-y-6">
          {showPreview && (
            <div className="surface-panel p-5">
              <p className="text-xs uppercase tracking-[0.22em] text-stone-500">Listing preview</p>
              <div className="mt-4 project-card">
                {projectData.thumbnailUrl ? (
                  <img src={projectData.thumbnailUrl} alt="Project preview" className="h-52 w-full object-cover" />
                ) : (
                  <div className="flex h-52 items-center justify-center bg-[radial-gradient(circle_at_top,rgba(45,212,191,0.15),transparent_32%),linear-gradient(180deg,rgba(17,24,39,0.96),rgba(28,25,23,0.96))] text-sm text-stone-500">
                    Thumbnail preview will appear here
                  </div>
                )}
                <div className="p-6">
                  <div className="flex flex-wrap gap-2">
                    {projectData.tags.map((tag) => (
                      <span key={tag} className="tag-pill">
                        #{tag}
                      </span>
                    ))}
                  </div>
                  <h3 className="mt-4 text-2xl font-bold text-white">{projectData.title || 'Untitled project'}</h3>
                  <p className="mt-2 text-sm leading-6 text-stone-400">
                    {projectData.description || 'Your short project pitch will appear here.'}
                  </p>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-sm text-stone-500">{projectData.category.replace(/-/g, ' ')}</span>
                    <span className="font-['Space_Grotesk'] text-2xl font-bold text-amber-100">${projectData.price || 0}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="surface-panel-strong overflow-hidden">
            <div className="border-b border-white/8 px-6 py-5">
              <h2 className="text-2xl font-bold text-white">Source editor</h2>
              <p className="mt-2 text-sm text-stone-400">
                Add the files buyers will preview and eventually receive after purchase.
              </p>
            </div>
            <div className="h-[640px]">
              <MonacoCodeEditor onSave={setFiles} onFilesChange={setFiles} readOnly={false} />
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

export default CreateProject
