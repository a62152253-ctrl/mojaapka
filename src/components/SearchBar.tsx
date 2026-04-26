import { useState } from 'react'
import { Search, Filter, X } from 'lucide-react'

interface SearchBarProps {
  onSearch: (query: string) => void
  onFilter: (filters: SearchFilters) => void
  placeholder?: string
}

interface SearchFilters {
  category?: string
  tags?: string[]
  minPrice?: number
  maxPrice?: number
  sortBy?: string
  sortOrder?: string
}

export default function SearchBar({ onSearch, onFilter, placeholder = "Search projects..." }: SearchBarProps) {
  const [query, setQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState<SearchFilters>({
    category: '',
    tags: [],
    minPrice: undefined,
    maxPrice: undefined,
    sortBy: 'createdAt',
    sortOrder: 'desc'
  })

  const categories = [
    'Web Development',
    'Mobile App',
    'Desktop App',
    'Game Development',
    'AI/ML',
    'Data Science',
    'DevOps',
    'UI/UX',
    'Other'
  ]

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch(query)
  }

  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    onFilter(newFilters)
  }

  const clearFilters = () => {
    const emptyFilters = {
      category: '',
      tags: [],
      minPrice: undefined,
      maxPrice: undefined,
      sortBy: 'createdAt',
      sortOrder: 'desc'
    }
    setFilters(emptyFilters)
    onFilter(emptyFilters)
  }

  const activeFilterCount = [
    filters.category,
    filters.minPrice,
    filters.maxPrice,
    filters.sortBy !== 'createdAt' ? filters.sortBy : undefined,
    filters.sortOrder !== 'desc' ? filters.sortOrder : undefined,
  ].filter(Boolean).length

  return (
    <div className="space-y-4">
      <form onSubmit={handleSearch} className="surface-panel flex flex-col gap-3 p-3 md:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-stone-500" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={placeholder}
            className="input-base pl-12"
          />
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className={`inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold transition ${
              showFilters
                ? 'bg-teal-300 text-stone-950'
                : 'border border-white/10 bg-white/[0.05] text-stone-200 hover:bg-white/[0.1]'
            }`}
          >
            <Filter className="h-4 w-4" />
            Filters
            {activeFilterCount > 0 && (
              <span className="rounded-full bg-stone-950/15 px-2 py-0.5 text-xs">
                {activeFilterCount}
              </span>
            )}
          </button>
          <button type="submit" className="btn-primary rounded-2xl px-5 py-3">
            Search
          </button>
        </div>
      </form>

      {showFilters && (
        <div className="surface-panel-strong space-y-5 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-white">Filters</h3>
              <p className="text-sm text-stone-400">Refine price, category, and ordering.</p>
            </div>
            <button
              onClick={clearFilters}
              className="btn-ghost px-3 py-2"
            >
              <X className="h-4 w-4" />
              Clear
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-stone-300">
                Category
              </label>
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="input-base"
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-stone-300">
                Min Price
              </label>
              <input
                type="number"
                value={filters.minPrice || ''}
                onChange={(e) => handleFilterChange('minPrice', e.target.value ? Number(e.target.value) : undefined)}
                placeholder="0"
                min="0"
                className="input-base"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-stone-300">
                Max Price
              </label>
              <input
                type="number"
                value={filters.maxPrice || ''}
                onChange={(e) => handleFilterChange('maxPrice', e.target.value ? Number(e.target.value) : undefined)}
                placeholder="1000"
                min="0"
                className="input-base"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-stone-300">
                Sort By
              </label>
              <select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                className="input-base"
              >
                <option value="createdAt">Date Created</option>
                <option value="price">Price</option>
                <option value="likesCount">Popularity</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-stone-300">
                Sort Order
              </label>
              <select
                value={filters.sortOrder}
                onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
                className="input-base"
              >
                <option value="desc">Descending</option>
                <option value="asc">Ascending</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
