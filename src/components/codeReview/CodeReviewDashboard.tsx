import React, { useState, useEffect } from 'react'
import {
  GitPullRequest,
  MessageSquare,
  CheckCircle,
  XCircle,
  Clock,
  Users,
  FileText,
  TestTube,
  Settings,
  Plus,
  Search,
  Filter,
  ChevronDown,
  Eye,
  GitBranch,
  Shield,
  Zap,
  TrendingUp
} from 'lucide-react'
import {
  CodeReview,
  ReviewStatus,
  ReviewTemplate,
  ReviewStatistics,
  TestSuite,
  ReviewNotification
} from '../../types/codeReview'
import { CodeReviewService } from '../../services/codeReviewService'
import { User } from '../../types'

interface CodeReviewDashboardProps {
  user: User
  projectId?: string
}

const statusColors: Record<ReviewStatus, string> = {
  PENDING: '#6B7280',
  IN_REVIEW: '#3B82F6',
  CHANGES_REQUESTED: '#F59E0B',
  APPROVED: '#10B981',
  MERGED: '#8B5CF6',
  CLOSED: '#EF4444',
  DRAFT: '#6B7280'
}

const statusIcons: Record<ReviewStatus, React.ReactNode> = {
  PENDING: <Clock className="w-4 h-4" />,
  IN_REVIEW: <Eye className="w-4 h-4" />,
  CHANGES_REQUESTED: <XCircle className="w-4 h-4" />,
  APPROVED: <CheckCircle className="w-4 h-4" />,
  MERGED: <GitPullRequest className="w-4 h-4" />,
  CLOSED: <XCircle className="w-4 h-4" />,
  DRAFT: <FileText className="w-4 h-4" />
}

export default function CodeReviewDashboard({ user, projectId }: CodeReviewDashboardProps) {
  const [reviews, setReviews] = useState<CodeReview[]>([])
  const [templates, setTemplates] = useState<ReviewTemplate[]>([])
  const [statistics, setStatistics] = useState<ReviewStatistics | null>(null)
  const [notifications, setNotifications] = useState<ReviewNotification[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<ReviewStatus | 'ALL'>('ALL')
  const [showFilters, setShowFilters] = useState(false)
  const [activeTab, setActiveTab] = useState<'reviews' | 'templates' | 'statistics' | 'settings'>('reviews')
  const [selectedReview, setSelectedReview] = useState<CodeReview | null>(null)
  const [showReviewModal, setShowReviewModal] = useState(false)

  useEffect(() => {
    loadData()
  }, [projectId])

  const loadData = async () => {
    try {
      const [userReviews, projectTemplates, projectStats, userNotifications] = await Promise.all([
        projectId ? CodeReviewService.getReviewsByProject(projectId) : CodeReviewService.getReviewsByUser(user.id),
        projectId ? CodeReviewService.getTemplatesByProject(projectId) : Promise.resolve([]),
        projectId ? CodeReviewService.getReviewStatistics(projectId) : Promise.resolve(null as ReviewStatistics | null),
        CodeReviewService.getNotifications(user.id)
      ])

      setReviews(userReviews)
      setTemplates(projectTemplates)
      setStatistics(projectStats)
      setNotifications(userNotifications.filter(n => !n.read))
    } catch (error) {
      console.error('Failed to load code review data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateReview = async () => {
    const title = prompt('Enter review title:')
    if (!title) return

    const description = prompt('Enter review description:')
    if (!description) return

    const branchName = prompt('Enter branch name:')
    if (!branchName) return

    try {
      const newReview = await CodeReviewService.createReview({
        title,
        description,
        projectId: projectId || 'default-project',
        authorId: user.id,
        branchName,
        baseBranch: 'main',
        files: [],
        requiredApprovals: 2
      })

      setReviews([newReview, ...reviews])
      setSelectedReview(newReview)
      setShowReviewModal(true)
    } catch (error) {
      console.error('Failed to create review:', error)
    }
  }

  const handleSubmitReview = async (reviewId: string, decision: 'APPROVE' | 'REQUEST_CHANGES' | 'COMMENT') => {
    const comment = prompt('Enter review comment:')
    if (!comment && decision !== 'COMMENT') return

    try {
      const review = reviews.find(r => r.id === reviewId)
      if (!review) return

      const reviewer = review.reviewers.find(r => r.userId === user.id)
      if (!reviewer) return

      await CodeReviewService.submitReview({
        reviewId,
        reviewerId: reviewer.id,
        decision,
        comment
      })

      loadData() // Refresh data
    } catch (error) {
      console.error('Failed to submit review:', error)
    }
  }

  const handleRunTests = async (reviewId: string) => {
    try {
      const testSuite = await CodeReviewService.runTests(reviewId)
      console.log('Test suite started:', testSuite)
    } catch (error) {
      console.error('Failed to run tests:', error)
    }
  }

  const filteredReviews = reviews.filter(review => {
    const matchesSearch = review.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         review.description?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = selectedStatus === 'ALL' || review.status === selectedStatus
    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status: ReviewStatus) => statusColors[status]
  const getStatusIcon = (status: ReviewStatus) => statusIcons[status]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-gray-900">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <GitPullRequest className="w-6 h-6 text-blue-500" />
            <h1 className="text-2xl font-bold">Code Reviews</h1>
            {projectId && <span className="text-gray-400">Project: {projectId}</span>}
          </div>

          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search reviews..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-3 py-2 bg-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className="p-2 bg-gray-700 rounded-lg hover:bg-gray-600"
            >
              <Filter className="w-4 h-4" />
            </button>

            <button
              onClick={handleCreateReview}
              className="px-3 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 flex items-center"
            >
              <Plus className="w-4 h-4 mr-1" />
              Create Review
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1">
          {[
            { id: 'reviews', label: 'Reviews', count: reviews.length },
            { id: 'templates', label: 'Templates', count: templates.length },
            { id: 'statistics', label: 'Statistics', count: 0 },
            { id: 'settings', label: 'Settings', count: 0 }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              <span>{tab.label}</span>
              {tab.count > 0 && (
                <span className="bg-gray-600 px-2 py-0.5 rounded-full text-xs">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-gray-800 border-b border-gray-700 p-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-400">Status:</span>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value as any)}
                className="bg-gray-700 rounded px-3 py-1 text-sm"
              >
                <option value="ALL">All Status</option>
                {Object.entries(statusColors).map(([status]) => (
                  <option key={status} value={status}>{status.replace('_', ' ')}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {activeTab === 'reviews' && (
          <div className="p-6">
            {statistics && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-gray-800 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Total Reviews</span>
                    <GitPullRequest className="w-5 h-5 text-blue-500" />
                  </div>
                  <p className="text-2xl font-bold mt-2">{statistics.totalReviews}</p>
                </div>

                <div className="bg-gray-800 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Pending</span>
                    <Clock className="w-5 h-5 text-yellow-500" />
                  </div>
                  <p className="text-2xl font-bold mt-2">{statistics.pendingReviews}</p>
                </div>

                <div className="bg-gray-800 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Approval Rate</span>
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  </div>
                  <p className="text-2xl font-bold mt-2">{statistics.approvalRate.toFixed(1)}%</p>
                </div>

                <div className="bg-gray-800 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Avg Review Time</span>
                    <TrendingUp className="w-5 h-5 text-purple-500" />
                  </div>
                  <p className="text-2xl font-bold mt-2">{statistics.averageTimeToReview.toFixed(1)}h</p>
                </div>
              </div>
            )}

            <div className="space-y-4">
              {filteredReviews.map(review => (
                <div key={review.id} className="bg-gray-800 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <div
                          className="flex items-center space-x-1 px-2 py-1 rounded-full text-xs"
                          style={{ backgroundColor: getStatusColor(review.status) + '20', color: getStatusColor(review.status) }}
                        >
                          {getStatusIcon(review.status)}
                          <span>{review.status.replace('_', ' ')}</span>
                        </div>
                        <GitBranch className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-400">{review.branchName}</span>
                        <span className="text-sm text-gray-400">→</span>
                        <span className="text-sm text-gray-400">{review.baseBranch}</span>
                      </div>

                      <h3 className="text-lg font-semibold mb-2">{review.title}</h3>
                      {review.description && (
                        <p className="text-gray-400 mb-3">{review.description}</p>
                      )}

                      <div className="flex items-center space-x-4 text-sm text-gray-400">
                        <div className="flex items-center space-x-1">
                          <FileText className="w-4 h-4" />
                          <span>{review.files.length} files</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Users className="w-4 h-4" />
                          <span>{review.reviewers.length} reviewers</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MessageSquare className="w-4 h-4" />
                          <span>{review.comments.length} comments</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <CheckCircle className="w-4 h-4" />
                          <span>{review.approvals}/{review.requiredApprovals} approvals</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 ml-4">
                      {review.reviewers.some(r => r.userId === user.id && r.status !== 'COMPLETED') && (
                        <>
                          <button
                            onClick={() => handleSubmitReview(review.id, 'APPROVE')}
                            className="px-3 py-1 bg-green-600 rounded hover:bg-green-700 text-sm"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleSubmitReview(review.id, 'REQUEST_CHANGES')}
                            className="px-3 py-1 bg-yellow-600 rounded hover:bg-yellow-700 text-sm"
                          >
                            Request Changes
                          </button>
                        </>
                      )}

                      <button
                        onClick={() => handleRunTests(review.id)}
                        className="p-2 bg-gray-700 rounded hover:bg-gray-600"
                        title="Run Tests"
                      >
                        <TestTube className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => {
                          setSelectedReview(review)
                          setShowReviewModal(true)
                        }}
                        className="p-2 bg-gray-700 rounded hover:bg-gray-600"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Reviewers */}
                  <div className="mt-4 pt-4 border-t border-gray-700">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-400">Reviewers:</span>
                      {review.reviewers.map(reviewer => (
                        <div
                          key={reviewer.id}
                          className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs ${
                            reviewer.status === 'COMPLETED'
                              ? 'bg-green-600 text-white'
                              : 'bg-gray-600 text-gray-300'
                          }`}
                        >
                          <span>{reviewer.user.username}</span>
                          {reviewer.decision && (
                            <span>
                              {reviewer.decision === 'APPROVE' && '✓'}
                              {reviewer.decision === 'REQUEST_CHANGES' && '✗'}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'templates' && (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {templates.map(template => (
                <div key={template.id} className="bg-gray-800 rounded-lg p-4">
                  <h3 className="font-semibold mb-2">{template.name}</h3>
                  <p className="text-gray-400 text-sm mb-3">{template.description}</p>
                  
                  <div className="mb-3">
                    <span className="text-sm text-gray-400">Required approvals: </span>
                    <span className="font-semibold">{template.requiredApprovals}</span>
                  </div>

                  <div className="mb-3">
                    <span className="text-sm text-gray-400">Checklist:</span>
                    <ul className="mt-1 space-y-1">
                      {template.checklist.slice(0, 3).map(item => (
                        <li key={item.id} className="text-xs text-gray-300 flex items-center">
                          <input
                            type="checkbox"
                            checked={item.checked}
                            readOnly
                            className="mr-2"
                          />
                          {item.text}
                        </li>
                      ))}
                      {template.checklist.length > 3 && (
                        <li className="text-xs text-gray-500">+{template.checklist.length - 3} more</li>
                      )}
                    </ul>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className={`text-xs px-2 py-1 rounded ${
                      template.autoAssign ? 'bg-green-600' : 'bg-gray-600'
                    }`}>
                      {template.autoAssign ? 'Auto-assign' : 'Manual'}
                    </span>
                    <button className="text-sm text-blue-400 hover:text-blue-300">
                      Use Template
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'statistics' && statistics && (
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Review Overview</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Total Reviews:</span>
                    <span className="font-bold">{statistics.totalReviews}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Pending Reviews:</span>
                    <span className="font-bold text-yellow-400">{statistics.pendingReviews}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Completed Reviews:</span>
                    <span className="font-bold text-green-400">{statistics.completedReviews}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Approval Rate:</span>
                    <span className="font-bold">{statistics.approvalRate.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Change Request Rate:</span>
                    <span className="font-bold text-orange-400">{statistics.changeRequestRate.toFixed(1)}%</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Performance Metrics</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Avg Time to Review:</span>
                    <span className="font-bold">{statistics.averageTimeToReview.toFixed(1)} hours</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Avg Time to Merge:</span>
                    <span className="font-bold">{statistics.averageTimeToMerge.toFixed(1)} hours</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
