import { FileText, Search, Inbox } from 'lucide-react'

interface EmptyStateProps {
  type: 'projects' | 'search' | 'deals' | 'comments' | 'general'
  title?: string
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
}

export default function EmptyState({ type, title, description, action }: EmptyStateProps) {
  const getIcon = () => {
    switch (type) {
      case 'projects':
        return <FileText className="w-16 h-16 text-gray-600" />
      case 'search':
        return <Search className="w-16 h-16 text-gray-600" />
      case 'deals':
        return <Inbox className="w-16 h-16 text-gray-600" />
      case 'comments':
        return <FileText className="w-16 h-16 text-gray-600" />
      default:
        return <FileText className="w-16 h-16 text-gray-600" />
    }
  }

  const getDefaultContent = () => {
    switch (type) {
      case 'projects':
        return {
          title: 'No projects found',
          description: 'Start by creating your first project or browse existing ones.'
        }
      case 'search':
        return {
          title: 'No results found',
          description: 'Try adjusting your search terms or filters.'
        }
      case 'deals':
        return {
          title: 'No deals yet',
          description: 'When you make or receive offers, they will appear here.'
        }
      case 'comments':
        return {
          title: 'No comments yet',
          description: 'Be the first to share your thoughts!'
        }
      default:
        return {
          title: 'Nothing here',
          description: 'Check back later for updates.'
        }
    }
  }

  const content = getDefaultContent()
  const finalTitle = title || content.title
  const finalDescription = description || content.description

  return (
    <div className="text-center py-12">
      <div className="flex justify-center mb-4">
        {getIcon()}
      </div>
      <h3 className="text-lg font-medium text-gray-300 mb-2">{finalTitle}</h3>
      <p className="text-gray-500 mb-6">{finalDescription}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
  )
}
