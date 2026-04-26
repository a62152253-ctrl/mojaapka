import { useState } from 'react'
import { Package, ExternalLink, Download, Calendar, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import { Deal } from '../types/index'

interface PurchaseCardProps {
  deal: Deal
  onStatusUpdate?: (dealId: string, status: string) => void
}

export default function PurchaseCard({ deal, onStatusUpdate }: PurchaseCardProps) {
  const [loading, setLoading] = useState(false)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-600 text-white'
      case 'PENDING':
        return 'bg-yellow-600 text-white'
      case 'ACCEPTED':
        return 'bg-blue-600 text-white'
      case 'REJECTED':
        return 'bg-red-600 text-white'
      default:
        return 'bg-gray-600 text-white'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle className="w-4 h-4" />
      case 'PENDING':
        return <Clock className="w-4 h-4" />
      case 'ACCEPTED':
        return <CheckCircle className="w-4 h-4" />
      case 'REJECTED':
        return <XCircle className="w-4 h-4" />
      default:
        return <AlertCircle className="w-4 h-4" />
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700 hover:border-gray-600 transition-all duration-200">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gray-700 rounded-lg flex items-center justify-center">
              <Package className="w-6 h-6 text-gray-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-1">
                {deal.project.title}
              </h3>
              <p className="text-gray-400 text-sm">
                from {deal.seller?.username || 'unknown seller'}
              </p>
            </div>
          </div>
          
          <div className="text-right">
            <p className="text-2xl font-bold text-green-400">${deal.price}</p>
            <p className="text-xs text-gray-500">{formatDate(deal.createdAt)}</p>
          </div>
        </div>

        {/* Deal Type */}
        <div className="flex items-center space-x-2 mb-4">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            deal.type === 'BUY' ? 'bg-blue-600/20 text-blue-400' : 'bg-purple-600/20 text-purple-400'
          }`}>
            {deal.type === 'BUY' ? '🛒 Purchase' : '📜 License'}
          </span>
          <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1 ${getStatusColor(deal.status)}`}>
            {getStatusIcon(deal.status)}
            {deal.status}
          </span>
        </div>

        {/* Message */}
        {deal.message && (
          <div className="mb-4 p-3 bg-gray-700/50 rounded-lg">
            <p className="text-gray-300 text-sm">
              <span className="font-medium">Message:</span> {deal.message}
            </p>
          </div>
        )}

        {/* Project Info */}
        <div className="mb-4 p-3 bg-gray-700/30 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Project Details</span>
            <button
              onClick={() => window.open(`/projects/${deal.project.id}`, '_blank')}
              className="text-blue-400 hover:text-blue-300 text-sm flex items-center space-x-1"
            >
              View Project <ExternalLink className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-1">
            <p className="text-gray-300 text-sm">
              <span className="font-medium">Category:</span> {deal.project.category || 'Uncategorized'}
            </p>
            {deal.project.tags && deal.project.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {deal.project.tags.slice(0, 3).map((tag, index) => (
                  <span key={index} className="px-2 py-1 bg-gray-600 text-gray-300 text-xs rounded">
                    #{tag}
                  </span>
                ))}
                {deal.project.tags.length > 3 && (
                  <span className="px-2 py-1 bg-gray-600 text-gray-300 text-xs rounded">
                    +{deal.project.tags.length - 3}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2 text-sm text-gray-400">
              <Calendar className="w-4 h-4" />
              <span>{formatDate(deal.createdAt)}</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-400">
              <Clock className="w-4 h-4" />
              <span>
                {deal.status === 'PENDING' && 'Awaiting response'}
                {deal.status === 'ACCEPTED' && 'In progress'}
                {deal.status === 'COMPLETED' && 'Completed'}
                {deal.status === 'REJECTED' && 'Rejected'}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {deal.status === 'COMPLETED' && (
              <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm flex items-center space-x-2">
                <Download className="w-4 h-4" />
                Download
              </button>
            )}
            
            <button
              onClick={() => window.open(`/projects/${deal.project.id}`, '_blank')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm flex items-center space-x-2"
            >
              <ExternalLink className="w-4 h-4" />
              View Project
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
