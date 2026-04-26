export interface Deployment {
  id: string
  name: string
  description?: string
  projectId: string
  environment: DeploymentEnvironment
  status: DeploymentStatus
  version: string
  commitHash: string
  branch: string
  triggeredBy: string
  buildUrl?: string
  deployUrl?: string
  logs: DeploymentLog[]
  variables: DeploymentVariable[]
  hooks: DeploymentHook[]
  rollbackVersion?: string
  rollbackReason?: string
  createdAt: string
  startedAt?: string
  completedAt?: string
  duration?: number
}

export type DeploymentEnvironment = 
  | 'DEVELOPMENT'
  | 'STAGING'
  | 'PRODUCTION'
  | 'TESTING'
  | 'PREVIEW'

export type DeploymentStatus = 
  | 'PENDING'
  | 'BUILDING'
  | 'DEPLOYING'
  | 'SUCCESS'
  | 'FAILED'
  | 'CANCELLED'
  | 'ROLLING_BACK'
  | 'ROLLED_BACK'

export interface DeploymentLog {
  id: string
  deploymentId: string
  level: LogLevel
  message: string
  timestamp: string
  source: LogSource
  metadata?: Record<string, any>
}

export type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR' | 'FATAL'
export type LogSource = 'BUILD' | 'DEPLOY' | 'TEST' | 'MONITOR' | 'SYSTEM'

export interface DeploymentVariable {
  id: string
  deploymentId: string
  name: string
  value: string
  type: VariableType
  isSecret: boolean
  scope: VariableScope
}

export type VariableType = 'STRING' | 'NUMBER' | 'BOOLEAN' | 'JSON' | 'FILE'
export type VariableScope = 'BUILD' | 'DEPLOY' | 'RUNTIME' | 'ALL'

export interface DeploymentHook {
  id: string
  deploymentId: string
  type: HookType
  url: string
  events: HookEvent[]
  headers: Record<string, string>
  isActive: boolean
  retryCount: number
  timeout: number
}

export type HookType = 'WEBHOOK' | 'SLACK' | 'DISCORD' | 'EMAIL' | 'CUSTOM'
export type HookEvent = 'DEPLOYMENT_STARTED' | 'DEPLOYMENT_SUCCESS' | 'DEPLOYMENT_FAILED' | 'ROLLBACK'

export interface Pipeline {
  id: string
  name: string
  description?: string
  projectId: string
  trigger: PipelineTrigger
  stages: PipelineStage[]
  environment: DeploymentEnvironment
  isActive: boolean
  settings: PipelineSettings
  createdBy: string
  createdAt: string
  updatedAt: string
}

export interface PipelineTrigger {
  type: TriggerType
  branch?: string
  events: TriggerEvent[]
  schedule?: string
  conditions?: TriggerCondition[]
}

export type TriggerType = 'MANUAL' | 'PUSH' | 'PULL_REQUEST' | 'SCHEDULE' | 'WEBHOOK'
export type TriggerEvent = 'PUSH' | 'PULL_REQUEST_OPENED' | 'PULL_REQUEST_MERGED' | 'RELEASE'

export interface TriggerCondition {
  field: string
  operator: string
  value: any
}

export interface PipelineStage {
  id: string
  name: string
  type: StageType
  order: number
  condition?: string
  when?: StageCondition[]
  inputs: StageInput[]
  outputs: StageOutput[]
  steps: PipelineStep[]
  timeout: number
  retryPolicy: RetryPolicy
}

export type StageType = 
  | 'BUILD'
  | 'TEST'
  | 'DEPLOY'
  | 'SECURITY_SCAN'
  | 'PERFORMANCE_TEST'
  | 'NOTIFICATION'
  | 'APPROVAL'
  | 'CUSTOM'

export type StageCondition = 'SUCCESS' | 'FAILURE' | 'ALWAYS' | 'MANUAL'

export interface StageInput {
  name: string
  type: InputType
  required: boolean
  defaultValue?: any
  description?: string
}

export type InputType = 'STRING' | 'NUMBER' | 'BOOLEAN' | 'FILE' | 'SELECT' | 'MULTI_SELECT'

export interface StageOutput {
  name: string
  type: OutputType
  value: any
}

export type OutputType = 'STRING' | 'NUMBER' | 'BOOLEAN' | 'FILE' | 'ARTIFACT'

export interface PipelineStep {
  id: string
  name: string
  type: StepType
  action: string
  condition?: string
  continueOnError: boolean
  timeout: number
  inputs: Record<string, any>
  outputs: Record<string, any>
  environment: Record<string, string>
}

export type StepType = 
  | 'SCRIPT'
  | 'DOCKER_BUILD'
  | 'DOCKER_PUSH'
  | 'NPM_INSTALL'
  | 'NPM_TEST'
  | 'NPM_BUILD'
  | 'GIT_CLONE'
  | 'FILE_UPLOAD'
  | 'API_CALL'
  | 'CUSTOM'

export interface RetryPolicy {
  enabled: boolean
  maxAttempts: number
  backoffType: BackoffType
  backoffMultiplier: number
  maxDelay: number
}

export type BackoffType = 'FIXED' | 'LINEAR' | 'EXPONENTIAL'

export interface PipelineSettings {
  timeout: number
  retryPolicy: RetryPolicy
  artifacts: ArtifactSettings
  notifications: NotificationSettings
  security: SecuritySettings
}

export interface ArtifactSettings {
  retention: number
  compression: boolean
  encryption: boolean
  storage: StorageType
}

export type StorageType = 'LOCAL' | 'S3' | 'GCS' | 'AZURE' | 'CUSTOM'

export interface NotificationSettings {
  onSuccess: NotificationChannel[]
  onFailure: NotificationChannel[]
  onApproval: NotificationChannel[]
}

export interface NotificationChannel {
  type: ChannelType
  config: Record<string, any>
  enabled: boolean
}

export type ChannelType = 'EMAIL' | 'SLACK' | 'DISCORD' | 'WEBHOOK' | 'SMS'

export interface SecuritySettings {
  requireApproval: boolean
  approvers: string[]
  secretScanning: boolean
  dependencyScanning: boolean
  codeQuality: boolean
}

export interface PipelineRun {
  id: string
  pipelineId: string
  number: number
  status: RunStatus
  trigger: RunTrigger
  variables: RunVariable[]
  stages: RunStage[]
  artifacts: Artifact[]
  logs: RunLog[]
  metrics: RunMetrics
  startedAt: string
  completedAt?: string
  duration?: number
  triggeredBy: string
}

export type RunStatus = 
  | 'PENDING'
  | 'RUNNING'
  | 'SUCCESS'
  | 'FAILED'
  | 'CANCELLED'
  | 'SKIPPED'

export interface RunTrigger {
  type: TriggerType
  branch?: string
  commitHash?: string
  pullRequestId?: string
  manualTrigger?: string
}

export interface RunVariable {
  name: string
  value: string
  type: VariableType
  isSecret: boolean
}

export interface RunStage {
  id: string
  name: string
  status: RunStatus
  startedAt?: string
  completedAt?: string
  duration?: number
  steps: RunStep[]
  artifacts: Artifact[]
  logs: RunLog[]
}

export interface RunStep {
  id: string
  name: string
  status: RunStatus
  exitCode?: number
  startedAt?: string
  completedAt?: string
  duration?: number
  logs: RunLog[]
  outputs: Record<string, any>
}

export interface Artifact {
  id: string
  name: string
  type: ArtifactType
  size: number
  url: string
  checksum: string
  createdAt: string
}

export type ArtifactType = 'BUILD_OUTPUT' | 'TEST_REPORT' | 'COVERAGE_REPORT' | 'LOGS' | 'SCREENSHOT' | 'CUSTOM'

export interface RunLog {
  id: string
  stageId?: string
  stepId?: string
  level: LogLevel
  message: string
  timestamp: string
  source: string
}

export interface RunMetrics {
  totalDuration: number
  buildTime: number
  testTime: number
  deployTime: number
  cpuUsage: number
  memoryUsage: number
  networkUsage: number
  cacheHitRate: number
}

export interface Environment {
  id: string
  name: string
  type: DeploymentEnvironment
  description?: string
  url?: string
  variables: EnvironmentVariable[]
  services: EnvironmentService[]
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface EnvironmentVariable {
  id: string
  environmentId: string
  name: string
  value: string
  type: VariableType
  isSecret: boolean
  scope: VariableScope
}

export interface EnvironmentService {
  id: string
  environmentId: string
  name: string
  type: ServiceType
  status: ServiceStatus
  url?: string
  version?: string
  healthCheck?: HealthCheck
  resources: ServiceResources
  createdAt: string
  updatedAt: string
}

export type ServiceType = 
  | 'WEB_SERVER'
  | 'DATABASE'
  | 'CACHE'
  | 'QUEUE'
  | 'STORAGE'
  | 'MONITORING'
  | 'CUSTOM'

export type ServiceStatus = 'RUNNING' | 'STOPPED' | 'ERROR' | 'DEPLOYING' | 'UNKNOWN'

export interface HealthCheck {
  enabled: boolean
  endpoint: string
  interval: number
  timeout: number
  retries: number
  expectedStatus: number
}

export interface ServiceResources {
  cpu: ResourceLimit
  memory: ResourceLimit
  storage: ResourceLimit
  network: ResourceLimit
}

export interface ResourceLimit {
  requested: number
  limit: number
  unit: string
}

export interface DeploymentTemplate {
  id: string
  name: string
  description: string
  category: TemplateCategory
  pipeline: Pipeline
  environments: Environment[]
  variables: TemplateVariable[]
  isPublic: boolean
  downloads: number
  rating: number
  createdBy: string
  createdAt: string
  updatedAt: string
}

export type TemplateCategory = 
  | 'WEB_APP'
  | 'API'
  | 'MOBILE'
  | 'STATIC_SITE'
  | 'MICROSERVICE'
  | 'FULL_STACK'
  | 'DATABASE'
  | 'CUSTOM'

export interface TemplateVariable {
  name: string
  type: VariableType
  required: boolean
  defaultValue?: any
  description?: string
  options?: string[]
}

export interface DeploymentMetrics {
  projectId: string
  totalDeployments: number
  successRate: number
  averageDeploymentTime: number
  failureRate: number
  rollbackRate: number
  environmentMetrics: Record<DeploymentEnvironment, EnvironmentMetrics>
  trends: DeploymentTrend[]
}

export interface EnvironmentMetrics {
  deploymentCount: number
  successCount: number
  failureCount: number
  averageTime: number
  lastDeployment?: string
}

export interface DeploymentTrend {
  date: string
  deployments: number
  successes: number
  failures: number
  averageTime: number
}

// Import User from main types
import { User } from './index'
