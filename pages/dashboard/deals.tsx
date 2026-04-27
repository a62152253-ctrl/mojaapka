import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../../src/components/layout/Navbar'
import { User, Deal } from '../../src/types/index'
import { apiClient } from '../../src/lib/api'

interface DealsPageProps {
  user: User | null
}

export default function DealsPage({ user }: DealsPageProps) {
  const navigate = useNavigate()
  const [deals, setDeals] = useState<Deal[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }
    fetchDeals()
  }, [user, filter, navigate])

  const fetchDeals = async () => {
    setLoading(true)
    try {
      const params: any = { page: 1, limit: 20 }
      if (filter !== 'all') {
        params.status = filter
      }
      
      const response = await apiClient.getDeals(params)
      if (response.success && response.data) {
        setDeals(response.data)
      }
    } catch (error) {
      console.error('Error fetching deals:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (dealId: string, status: string) => {
    try {
      await apiClient.updateDealStatus(dealId, status)
      fetchDeals()
    } catch (error) {
      console.error('Error updating deal status:', error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-600'
      case 'ACCEPTED': return 'bg-blue-600'
      case 'REJECTED': return 'bg-red-600'
      case 'COMPLETED': return 'bg-green-600'
      default: return 'bg-gray-600'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING': return '⏳'
      case 'ACCEPTED': return '✅'
      case 'REJECTED': return '❌'
      case 'COMPLETED': return '🎉'
      default: return '📄'
    }
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            {user.accountType === 'DEVELOPER' ? 'Deal Requests' : 'My Deals'}
          </h1>
          <p className="text-gray-400">
            {user.accountType === 'DEVELOPER' 
              ? 'Manage incoming deal requests for your projects'
              : 'Track your project purchases and licenses'
            }
          </p>
        </div>

        <div className="flex flex-wrap gap-2" role="tablist" aria-label="Deal status filters">
          {['all', 'PENDING', 'ACCEPTED', 'REJECTED', 'COMPLETED'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              role="tab"
              aria-selected={filter === status}
              aria-controls={`deals-${status}`}
              className={`px-4 py-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 ${
                filter === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {status.charAt(0) + status.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
          </div>
        ) : deals.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">No deals found</p>
            <p className="text-gray-500 mt-2">
              {user.accountType === 'DEVELOPER' 
                ? 'When buyers make offers on your projects, they will appear here'
                : 'Start by making offers on projects you\'re interested in'
              }
            </p>
          </div>
        ) : (
          <div className="space-y-4" role="tabpanel" id={`deals-${filter}`}>
            {deals.map((deal) => (
              <div key={deal.id} className="bg-gray-800 rounded-lg p-6" role="article" aria-labelledby={`deal-title-${deal.id}`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 id={`deal-title-${deal.id}`} className="text-lg font-semibold text-white">{deal.project.title}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs text-white ${getStatusColor(deal.status)}`}>
                        {getStatusIcon(deal.status)} {deal.status}
                      </span>
                      <span className="px-2 py-1 bg-gray-700 rounded-full text-xs text-gray-300">
                        {deal.type}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-400">Price</p>
                        <p className="text-lg font-bold text-green-400">${deal.price}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-gray-400">
                          {user.accountType === 'DEVELOPER' ? 'Buyer' : 'Seller'}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <img
                            src={user.accountType === 'DEVELOPER' ? deal.buyer?.avatar || '/default-avatar.png' : deal.seller?.avatar || '/default-avatar.png'}
                            alt={user.accountType === 'DEVELOPER' ? deal.buyer?.username || 'Unknown' : deal.seller?.username || 'Unknown'}
                            className="w-6 h-6 rounded-full"
                          />
                          <span className="text-gray-300">
                            {user.accountType === 'DEVELOPER' ? deal.buyer?.username || 'Unknown' : deal.seller?.username || 'Unknown'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {deal.message && (
                      <div className="mb-4">
                        <p className="text-sm text-gray-400 mb-1">Message</p>
                        <p className="text-gray-300">{deal.message}</p>
                      </div>
                    )}

                    <div className="text-sm text-gray-500">
                      Created: {new Date(deal.createdAt).toLocaleDateString()}
                    </div>
                  </div>

                  {user.accountType === 'DEVELOPER' && deal.status === 'PENDING' && (
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => handleStatusUpdate(deal.id, 'ACCEPTED')}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleStatusUpdate(deal.id, 'REJECTED')}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                      >
                        Reject
                      </button>
                    </div>
                  )}

                  {user.accountType === 'DEVELOPER' && deal.status === 'ACCEPTED' && (
                    <button
                      onClick={() => handleStatusUpdate(deal.id, 'COMPLETED')}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors ml-4"
                    >
                      Mark Complete
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

