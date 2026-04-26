import { useState } from 'react'
import { X, DollarSign, MessageSquare } from 'lucide-react'
import { User, Project, Deal } from '../types/index'

interface DealModalProps {
  project: Project
  currentUser: User | null
  isOpen: boolean
  onClose: () => void
  onDealCreated?: (deal: Deal) => void
}

export default function DealModal({ project, currentUser, isOpen, onClose, onDealCreated }: DealModalProps) {
  const [price, setPrice] = useState(project.price)
  const [type, setType] = useState<'BUY' | 'LICENSE'>('BUY')
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (!isOpen || !currentUser || currentUser.accountType !== 'USER') {
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (submitting) return

    setSubmitting(true)
    try {
      const response = await fetch('/api/deals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          price,
          type,
          message: message.trim() || undefined,
          projectId: project.id,
          sellerId: project.authorId,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        onDealCreated?.(data.data)
        onClose()
        setPrice(project.price)
        setType('BUY')
        setMessage('')
      }
    } catch (error) {
      console.error('Error creating deal:', error)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-xl font-semibold text-white">Make an Offer</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <h3 className="text-lg font-medium text-white mb-2">{project.title}</h3>
            <p className="text-gray-400 text-sm">by {project.author.username}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <DollarSign className="w-4 h-4 inline mr-1" />
              Offer Price
            </label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
              min="0"
              step="0.01"
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <p className="text-xs text-gray-500 mt-1">Original price: ${project.price}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Deal Type
            </label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="BUY"
                  checked={type === 'BUY'}
                  onChange={(e) => setType(e.target.value as 'BUY' | 'LICENSE')}
                  className="mr-2"
                />
                <span className="text-gray-300">Buy - Full ownership transfer</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="LICENSE"
                  checked={type === 'LICENSE'}
                  onChange={(e) => setType(e.target.value as 'BUY' | 'LICENSE')}
                  className="mr-2"
                />
                <span className="text-gray-300">License - Usage rights only</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <MessageSquare className="w-4 h-4 inline mr-1" />
              Message (optional)
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Add a message to the seller..."
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              rows={3}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {submitting ? 'Submitting...' : 'Submit Offer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
