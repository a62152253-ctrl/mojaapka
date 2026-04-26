export interface CodeReview {
  id: string
  title: string
  description?: string
  projectId: string
  authorId: string
  branchName: string
  baseBranch: string
  status: ReviewStatus
  reviewers: Reviewer[]
  files: ReviewFile[]
  comments: ReviewComment[]
  approvals: number
  requiredApprovals: number
  changesRequested: boolean
  mergeable: boolean
  merged: boolean
  mergedBy?: string
  mergedAt?: string
  createdAt: string
  updatedAt: string
}

export type ReviewStatus = 
  | 'PENDING'
  | 'IN_REVIEW' 
  | 'CHANGES_REQUESTED'
  | 'APPROVED'
  | 'MERGED'
  | 'CLOSED'
  | 'DRAFT'

export interface Reviewer {
  id: string
  userId: string
  reviewId: string
  status: ReviewerStatus
  decision?: ReviewerDecision
  reviewedAt?: string
  user: User
}

export type ReviewerStatus = 'PENDING' | 'REVIEWING' | 'COMPLETED'
export type ReviewerDecision = 'APPROVE' | 'REQUEST_CHANGES' | 'COMMENT'

export interface ReviewFile {
  id: string
  reviewId: string
  filename: string
  filePath: string
  fileType: FileType
  additions: number
  deletions: number
  changes: number
  patch: string
  oldContent?: string
  newContent?: string
  comments: FileComment[]
  reviewed: boolean
  reviewedBy?: string
}

export type FileType = 'ADDED' | 'REMOVED' | 'MODIFIED' | 'RENAMED' | 'COPIED'

export interface ReviewComment {
  id: string
  reviewId: string
  fileId?: string
  authorId: string
  content: string
  type: CommentType
  position?: CommentPosition
  threadId?: string
  replies: ReviewComment[]
  resolved: boolean
  resolvedBy?: string
  resolvedAt?: string
  createdAt: string
  updatedAt: string
}

export type CommentType = 'GENERAL' | 'LINE' | 'FILE' | 'SUGGESTION'
export type CommentPosition = {
  line: number
  character: number
  side: 'LEFT' | 'RIGHT'
}

export interface FileComment extends ReviewComment {
  fileId: string
  position: CommentPosition
}

export interface ReviewTemplate {
  id: string
  name: string
  description: string
  checklist: ReviewChecklistItem[]
  autoAssign: boolean
  requiredApprovals: number
  isActive: boolean
  createdBy: string
  createdAt: string
}

export interface ReviewChecklistItem {
  id: string
  text: string
  required: boolean
  checked: boolean
}

export interface ReviewRule {
  id: string
  name: string
  description: string
  type: RuleType
  conditions: RuleCondition[]
  actions: RuleAction[]
  isActive: boolean
  priority: number
  createdBy: string
  createdAt: string
}

export type RuleType = 'AUTOMATION' | 'VALIDATION' | 'NOTIFICATION'
export type RuleCondition = {
  field: string
  operator: string
  value: any
}

export type RuleAction = {
  type: 'ASSIGN_REVIEWER' | 'REQUEST_APPROVAL' | 'ADD_LABEL' | 'POST_COMMENT' | 'RUN_TEST'
  parameters: Record<string, any>
}

export interface ReviewMetrics {
  reviewId: string
  timeToFirstReview: number
  timeToApproval: number
  timeToMerge: number
  commentCount: number
  participantCount: number
  revisionCount: number
  fileCount: number
  lineCount: number
  complexity: number
}

export interface ReviewStatistics {
  totalReviews: number
  pendingReviews: number
  completedReviews: number
  averageTimeToReview: number
  averageTimeToMerge: number
  approvalRate: number
  changeRequestRate: number
  mostActiveReviewers: ReviewerStats[]
  mostReviewedFiles: FileStats[]
  reviewTrends: TrendData[]
}

export interface ReviewerStats {
  userId: string
  username: string
  reviewsCompleted: number
  averageReviewTime: number
  approvalRate: number
  commentsPerReview: number
}

export interface FileStats {
  filePath: string
  reviewCount: number
  changeFrequency: number
  averageReviewTime: number
  bugRate: number
}

export interface TrendData {
  date: string
  reviewsCreated: number
  reviewsCompleted: number
  averageTime: number
}

export interface TestSuite {
  id: string
  name: string
  description?: string
  reviewId: string
  type: TestType
  framework: string
  status: TestStatus
  results: TestResult[]
  coverage: TestCoverage
  duration: number
  createdAt: string
  updatedAt: string
}

export type TestType = 'UNIT' | 'INTEGRATION' | 'E2E' | 'PERFORMANCE' | 'SECURITY'
export type TestStatus = 'PENDING' | 'RUNNING' | 'PASSED' | 'FAILED' | 'SKIPPED'

export interface TestResult {
  id: string
  name: string
  status: 'PASSED' | 'FAILED' | 'SKIPPED'
  duration: number
  error?: string
  stack?: string
  assertions: number
}

export interface TestCoverage {
  lines: number
  functions: number
  branches: number
  statements: number
  percentage: number
  files: FileCoverage[]
}

export interface FileCoverage {
  filePath: string
  lines: number
  covered: number
  percentage: number
  uncoveredLines: number[]
}

export interface ReviewNotification {
  id: string
  reviewId: string
  userId: string
  type: NotificationType
  title: string
  message: string
  read: boolean
  createdAt: string
}

export type NotificationType = 
  | 'REVIEW_REQUESTED'
  | 'REVIEW_ASSIGNED'
  | 'COMMENT_ADDED'
  | 'APPROVAL_RECEIVED'
  | 'CHANGES_REQUESTED'
  | 'REVIEW_MERGED'
  | 'TEST_FAILED'
  | 'COVERAGE_LOW'

export interface ReviewSettings {
  id: string
  projectId: string
  autoAssignEnabled: boolean
  requiredApprovals: number
  requireUpToDate: boolean
  requireTestsPass: boolean
  requireCoverageThreshold: number
  autoMergeEnabled: boolean
  deleteBranchAfterMerge: boolean
  reviewers: string[]
  templates: string[]
  rules: string[]
}

export interface ReviewDraft {
  id: string
  title: string
  description?: string
  branchName: string
  baseBranch: string
  files: ReviewFile[]
  authorId: string
  projectId: string
  createdAt: string
  updatedAt: string
}

export interface ReviewSuggestion {
  id: string
  reviewId: string
  fileId: string
  position: CommentPosition
  type: SuggestionType
  originalText: string
  suggestedText: string
  description?: string
  authorId: string
  status: SuggestionStatus
  applied: boolean
  appliedBy?: string
  appliedAt?: string
  createdAt: string
}

export type SuggestionType = 'REFACTOR' | 'FIX' | 'OPTIMIZE' | 'STYLE' | 'SECURITY'
export type SuggestionStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED'

export interface ReviewComparison {
  id: string
  reviewId: string
  baseCommit: string
  headCommit: string
  diff: FileDiff[]
  summary: ComparisonSummary
  createdAt: string
}

export interface FileDiff {
  filePath: string
  type: FileType
  additions: number
  deletions: number
  hunks: DiffHunk[]
}

export interface DiffHunk {
  oldStart: number
  oldLines: number
  newStart: number
  newLines: number
  lines: DiffLine[]
}

export interface DiffLine {
  type: 'CONTEXT' | 'ADDITION' | 'DELETION'
  content: string
  lineNumber: number
  oldLineNumber?: number
  newLineNumber?: number
}

export interface ComparisonSummary {
  filesChanged: number
  additions: number
  deletions: number
  commitCount: number
  authors: string[]
}

// Import User from main types
import { User } from './index'
