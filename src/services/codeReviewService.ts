import {
  CodeReview,
  Reviewer,
  ReviewFile,
  ReviewComment,
  ReviewTemplate,
  ReviewRule,
  ReviewMetrics,
  ReviewStatistics,
  TestSuite,
  ReviewNotification,
  ReviewSettings,
  ReviewDraft,
  ReviewSuggestion,
  ReviewComparison,
  ReviewStatus,
  ReviewerStatus,
  ReviewerDecision,
  CommentType,
  FileType,
  TestType,
  TestStatus,
  NotificationType,
  SuggestionType,
  SuggestionStatus
} from '../types/codeReview'
import { User, Project } from '../types'

// Mock data for development
const mockReviews: CodeReview[] = [
  {
    id: 'review-1',
    title: 'Add user authentication feature',
    description: 'Implement login, registration, and JWT authentication',
    projectId: 'project-1',
    authorId: 'user-1',
    branchName: 'feature/auth',
    baseBranch: 'main',
    status: 'IN_REVIEW',
    reviewers: [
      {
        id: 'reviewer-1',
        userId: 'user-2',
        reviewId: 'review-1',
        status: 'PENDING',
        user: { id: 'user-2', username: 'alice', email: 'alice@example.com', accountType: 'DEVELOPER', createdAt: '', updatedAt: '' }
      }
    ],
    files: [
      {
        id: 'file-1',
        reviewId: 'review-1',
        filename: 'auth.ts',
        filePath: 'src/auth/auth.ts',
        fileType: 'ADDED',
        additions: 150,
        deletions: 0,
        changes: 150,
        patch: '@@ -0,0 +1,150 @@\n+export class AuthService {',
        comments: [],
        reviewed: false
      }
    ],
    comments: [],
    approvals: 0,
    requiredApprovals: 2,
    changesRequested: false,
    mergeable: true,
    merged: false,
    createdAt: '2024-04-26T09:00:00Z',
    updatedAt: '2024-04-26T10:00:00Z'
  }
]

const mockTemplates: ReviewTemplate[] = [
  {
    id: 'template-1',
    name: 'Frontend Review',
    description: 'Standard review for frontend changes',
    checklist: [
      { id: '1', text: 'Code follows style guidelines', required: true, checked: false },
      { id: '2', text: 'Components are reusable', required: true, checked: false },
      { id: '3', text: 'No console errors', required: true, checked: false },
      { id: '4', text: 'Responsive design tested', required: false, checked: false }
    ],
    autoAssign: true,
    requiredApprovals: 2,
    isActive: true,
    createdBy: 'user-1',
    createdAt: '2024-04-01T00:00:00Z'
  }
]

export class CodeReviewService {
  // Review Management
  static async getReviewsByProject(projectId: string): Promise<CodeReview[]> {
    return mockReviews.filter(review => review.projectId === projectId)
  }

  static async getReviewsByUser(userId: string): Promise<CodeReview[]> {
    return mockReviews.filter(review => 
      review.authorId === userId || 
      review.reviewers.some(reviewer => reviewer.userId === userId)
    )
  }

  static async getReviewById(reviewId: string): Promise<CodeReview | null> {
    return mockReviews.find(review => review.id === reviewId) || null
  }

  static async createReview(data: {
    title: string
    description?: string
    projectId: string
    authorId: string
    branchName: string
    baseBranch: string
    files: ReviewFile[]
    reviewerIds?: string[]
    requiredApprovals?: number
  }): Promise<CodeReview> {
    const newReview: CodeReview = {
      id: `review-${Date.now()}`,
      title: data.title,
      description: data.description,
      projectId: data.projectId,
      authorId: data.authorId,
      branchName: data.branchName,
      baseBranch: data.baseBranch,
      status: 'PENDING',
      reviewers: (data.reviewerIds || []).map(userId => ({
        id: `reviewer-${Date.now()}-${userId}`,
        userId,
        reviewId: `review-${Date.now()}`,
        status: 'PENDING',
        user: { id: userId, username: 'reviewer', email: 'reviewer@example.com', accountType: 'DEVELOPER', createdAt: '', updatedAt: '' }
      })),
      files: data.files,
      comments: [],
      approvals: 0,
      requiredApprovals: data.requiredApprovals || 2,
      changesRequested: false,
      mergeable: true,
      merged: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    mockReviews.push(newReview)
    return newReview
  }

  static async updateReview(reviewId: string, data: Partial<CodeReview>): Promise<CodeReview> {
    const reviewIndex = mockReviews.findIndex(review => review.id === reviewId)
    if (reviewIndex === -1) throw new Error('Review not found')

    mockReviews[reviewIndex] = { ...mockReviews[reviewIndex], ...data, updatedAt: new Date().toISOString() }
    return mockReviews[reviewIndex]
  }

  static async submitReview(data: {
    reviewId: string
    reviewerId: string
    decision: ReviewerDecision
    comment?: string
  }): Promise<Reviewer> {
    const review = mockReviews.find(r => r.id === data.reviewId)
    if (!review) throw new Error('Review not found')

    const reviewer = review.reviewers.find(r => r.id === data.reviewerId)
    if (!reviewer) throw new Error('Reviewer not found')

    reviewer.status = 'COMPLETED'
    reviewer.decision = data.decision
    reviewer.reviewedAt = new Date().toISOString()

    // Update review status based on decisions
    const approvals = review.reviewers.filter(r => r.decision === 'APPROVE').length
    const changesRequested = review.reviewers.some(r => r.decision === 'REQUEST_CHANGES')

    review.approvals = approvals
    review.changesRequested = changesRequested

    if (changesRequested) {
      review.status = 'CHANGES_REQUESTED'
    } else if (approvals >= review.requiredApprovals) {
      review.status = 'APPROVED'
    } else {
      review.status = 'IN_REVIEW'
    }

    review.updatedAt = new Date().toISOString()
    return reviewer
  }

  // Comment Management
  static async addComment(data: {
    reviewId: string
    authorId: string
    content: string
    type: CommentType
    fileId?: string
    position?: any
    threadId?: string
  }): Promise<ReviewComment> {
    const newComment: ReviewComment = {
      id: `comment-${Date.now()}`,
      reviewId: data.reviewId,
      authorId: data.authorId,
      content: data.content,
      type: data.type,
      fileId: data.fileId,
      position: data.position,
      threadId: data.threadId,
      replies: [],
      resolved: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    const review = mockReviews.find(r => r.id === data.reviewId)
    if (review) {
      review.comments.push(newComment)
    }

    return newComment
  }

  static async resolveComment(commentId: string, userId: string): Promise<ReviewComment> {
    for (const review of mockReviews) {
      const comment = review.comments.find(c => c.id === commentId)
      if (comment) {
        comment.resolved = true
        comment.resolvedBy = userId
        comment.resolvedAt = new Date().toISOString()
        return comment
      }
    }
    throw new Error('Comment not found')
  }

  // Template Management
  static async getTemplatesByProject(projectId: string): Promise<ReviewTemplate[]> {
    return mockTemplates.filter(template => template.isActive)
  }

  static async createTemplate(data: {
    name: string
    description?: string
    checklist: any[]
    autoAssign: boolean
    requiredApprovals: number
    createdBy: string
  }): Promise<ReviewTemplate> {
    const newTemplate: ReviewTemplate = {
      id: `template-${Date.now()}`,
      name: data.name,
      description: data.description || '',
      checklist: data.checklist,
      autoAssign: data.autoAssign,
      requiredApprovals: data.requiredApprovals,
      isActive: true,
      createdBy: data.createdBy,
      createdAt: new Date().toISOString()
    }

    mockTemplates.push(newTemplate)
    return newTemplate
  }

  // Testing Integration
  static async runTests(reviewId: string): Promise<TestSuite> {
    const testSuite: TestSuite = {
      id: `test-${Date.now()}`,
      name: 'Automated Test Suite',
      reviewId,
      type: 'UNIT',
      framework: 'Jest',
      status: 'RUNNING',
      results: [],
      coverage: {
        lines: 0,
        functions: 0,
        branches: 0,
        statements: 0,
        percentage: 0,
        files: []
      },
      duration: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    // Simulate test execution
    setTimeout(() => {
      testSuite.status = 'PASSED'
      testSuite.results = [
        {
          id: 'test-1',
          name: 'Authentication service test',
          status: 'PASSED',
          duration: 150,
          assertions: 5
        }
      ]
      testSuite.coverage = {
        lines: 85,
        functions: 90,
        branches: 75,
        statements: 85,
        percentage: 84,
        files: [
          {
            filePath: 'src/auth/auth.ts',
            lines: 100,
            covered: 85,
            percentage: 85,
            uncoveredLines: [45, 67, 89]
          }
        ]
      }
      testSuite.duration = 150
      testSuite.updatedAt = new Date().toISOString()
    }, 2000)

    return testSuite
  }

  // Suggestions
  static async addSuggestion(data: {
    reviewId: string
    fileId: string
    position: any
    type: SuggestionType
    originalText: string
    suggestedText: string
    description?: string
    authorId: string
  }): Promise<ReviewSuggestion> {
    const suggestion: ReviewSuggestion = {
      id: `suggestion-${Date.now()}`,
      reviewId: data.reviewId,
      fileId: data.fileId,
      position: data.position,
      type: data.type,
      originalText: data.originalText,
      suggestedText: data.suggestedText,
      description: data.description,
      authorId: data.authorId,
      status: 'PENDING',
      applied: false,
      createdAt: new Date().toISOString()
    }

    return suggestion
  }

  static async applySuggestion(suggestionId: string, userId: string): Promise<ReviewSuggestion> {
    // In a real implementation, this would modify the actual file
    throw new Error('Not implemented')
  }

  // Metrics and Statistics
  static async getReviewStatistics(projectId: string): Promise<ReviewStatistics> {
    const projectReviews = mockReviews.filter(review => review.projectId === projectId)
    
    const completedReviews = projectReviews.filter(r => ['APPROVED', 'MERGED', 'CLOSED'].includes(r.status))
    const pendingReviews = projectReviews.filter(r => ['PENDING', 'IN_REVIEW'].includes(r.status))
    
    const averageTimeToReview = completedReviews.reduce((sum, review) => {
      const created = new Date(review.createdAt).getTime()
      const updated = new Date(review.updatedAt).getTime()
      return sum + (updated - created)
    }, 0) / (completedReviews.length || 1)

    const approvalRate = projectReviews.length > 0 
      ? (projectReviews.filter(r => r.status === 'APPROVED').length / projectReviews.length) * 100 
      : 0

    return {
      totalReviews: projectReviews.length,
      pendingReviews: pendingReviews.length,
      completedReviews: completedReviews.length,
      averageTimeToReview: averageTimeToReview / (1000 * 60 * 60), // Convert to hours
      averageTimeToMerge: 0, // Calculate based on merge data
      approvalRate,
      changeRequestRate: projectReviews.length > 0 
        ? (projectReviews.filter(r => r.status === 'CHANGES_REQUESTED').length / projectReviews.length) * 100 
        : 0,
      mostActiveReviewers: [],
      mostReviewedFiles: [],
      reviewTrends: []
    }
  }

  static async getReviewMetrics(reviewId: string): Promise<ReviewMetrics> {
    const review = mockReviews.find(r => r.id === reviewId)
    if (!review) throw new Error('Review not found')

    const created = new Date(review.createdAt).getTime()
    const updated = new Date(review.updatedAt).getTime()
    
    return {
      reviewId,
      timeToFirstReview: (updated - created) / (1000 * 60 * 60), // Convert to hours
      timeToApproval: review.status === 'APPROVED' ? (updated - created) / (1000 * 60 * 60) : 0,
      timeToMerge: review.merged && review.mergedAt ? (new Date(review.mergedAt).getTime() - created) / (1000 * 60 * 60) : 0,
      commentCount: review.comments.length,
      participantCount: review.reviewers.length + 1, // +1 for author
      revisionCount: 1, // Track based on commits
      fileCount: review.files.length,
      lineCount: review.files.reduce((sum, file) => sum + file.additions + file.deletions, 0),
      complexity: 0 // Calculate based on file complexity
    }
  }

  // Notifications
  static async getNotifications(userId: string): Promise<ReviewNotification[]> {
    return [] // Implement notification system
  }

  static async createNotification(data: {
    reviewId: string
    userId: string
    type: NotificationType
    title: string
    message: string
  }): Promise<ReviewNotification> {
    const notification: ReviewNotification = {
      id: `notif-${Date.now()}`,
      reviewId: data.reviewId,
      userId: data.userId,
      type: data.type,
      title: data.title,
      message: data.message,
      read: false,
      createdAt: new Date().toISOString()
    }

    return notification
  }

  // Settings
  static async getReviewSettings(projectId: string): Promise<ReviewSettings> {
    return {
      id: `settings-${projectId}`,
      projectId,
      autoAssignEnabled: true,
      requiredApprovals: 2,
      requireUpToDate: true,
      requireTestsPass: true,
      requireCoverageThreshold: 80,
      autoMergeEnabled: false,
      deleteBranchAfterMerge: true,
      reviewers: [],
      templates: [],
      rules: []
    }
  }

  static async updateReviewSettings(projectId: string, settings: Partial<ReviewSettings>): Promise<ReviewSettings> {
    const currentSettings = await this.getReviewSettings(projectId)
    return { ...currentSettings, ...settings }
  }

  // Draft Management
  static async createDraft(data: {
    title: string
    description?: string
    branchName: string
    baseBranch: string
    files: ReviewFile[]
    authorId: string
    projectId: string
  }): Promise<ReviewDraft> {
    const draft: ReviewDraft = {
      id: `draft-${Date.now()}`,
      title: data.title,
      description: data.description,
      branchName: data.branchName,
      baseBranch: data.baseBranch,
      files: data.files,
      authorId: data.authorId,
      projectId: data.projectId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    return draft
  }

  static async convertDraftToReview(draftId: string): Promise<CodeReview> {
    // Convert draft to actual review
    throw new Error('Not implemented')
  }

  // Comparison and Diff
  static async createComparison(data: {
    reviewId: string
    baseCommit: string
    headCommit: string
  }): Promise<ReviewComparison> {
    const comparison: ReviewComparison = {
      id: `comparison-${Date.now()}`,
      reviewId: data.reviewId,
      baseCommit: data.baseCommit,
      headCommit: data.headCommit,
      diff: [],
      summary: {
        filesChanged: 0,
        additions: 0,
        deletions: 0,
        commitCount: 0,
        authors: []
      },
      createdAt: new Date().toISOString()
    }

    return comparison
  }
}
