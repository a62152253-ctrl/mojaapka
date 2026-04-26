import {
  Deployment,
  Pipeline,
  PipelineRun,
  Environment,
  DeploymentTemplate,
  DeploymentMetrics,
  DeploymentStatus,
  DeploymentEnvironment,
  RunStatus,
  TriggerType,
  StageType,
  LogLevel,
  VariableType,
  ArtifactType
} from '../types/deployment'
import { User } from '../types'

// Mock data for development
const mockDeployments: Deployment[] = [
  {
    id: 'deploy-1',
    name: 'Frontend Production Deploy',
    description: 'Deploy latest frontend changes to production',
    projectId: 'project-1',
    environment: 'PRODUCTION',
    status: 'SUCCESS',
    version: 'v1.2.3',
    commitHash: 'abc123',
    branch: 'main',
    triggeredBy: 'user-1',
    deployUrl: 'https://app.example.com',
    logs: [
      {
        id: 'log-1',
        deploymentId: 'deploy-1',
        level: 'INFO',
        message: 'Starting deployment...',
        timestamp: '2024-04-26T10:00:00Z',
        source: 'DEPLOY'
      },
      {
        id: 'log-2',
        deploymentId: 'deploy-1',
        level: 'INFO',
        message: 'Build completed successfully',
        timestamp: '2024-04-26T10:02:00Z',
        source: 'BUILD'
      },
      {
        id: 'log-3',
        deploymentId: 'deploy-1',
        level: 'INFO',
        message: 'Deployment completed successfully',
        timestamp: '2024-04-26T10:05:00Z',
        source: 'DEPLOY'
      }
    ],
    variables: [
      {
        id: 'var-1',
        deploymentId: 'deploy-1',
        name: 'NODE_ENV',
        value: 'production',
        type: 'STRING',
        isSecret: false,
        scope: 'RUNTIME'
      }
    ],
    hooks: [],
    createdAt: '2024-04-26T10:00:00Z',
    startedAt: '2024-04-26T10:00:00Z',
    completedAt: '2024-04-26T10:05:00Z',
    duration: 300
  }
]

const mockPipelines: Pipeline[] = [
  {
    id: 'pipeline-1',
    name: 'Web App CI/CD',
    description: 'Build, test and deploy web application',
    projectId: 'project-1',
    trigger: {
      type: 'PUSH',
      branch: 'main',
      events: ['PUSH'],
      conditions: []
    },
    stages: [
      {
        id: 'stage-1',
        name: 'Build',
        type: 'BUILD',
        order: 1,
        inputs: [],
        outputs: [],
        steps: [
          {
            id: 'step-1',
            name: 'Install dependencies',
            type: 'NPM_INSTALL',
            action: 'npm install',
            continueOnError: false,
            timeout: 300,
            inputs: {},
            outputs: {},
            environment: {}
          },
          {
            id: 'step-2',
            name: 'Build application',
            type: 'NPM_BUILD',
            action: 'npm run build',
            continueOnError: false,
            timeout: 600,
            inputs: {},
            outputs: {},
            environment: {}
          }
        ],
        timeout: 900,
        retryPolicy: {
          enabled: true,
          maxAttempts: 2,
          backoffType: 'EXPONENTIAL',
          backoffMultiplier: 2,
          maxDelay: 60
        }
      },
      {
        id: 'stage-2',
        name: 'Test',
        type: 'TEST',
        order: 2,
        inputs: [],
        outputs: [],
        steps: [
          {
            id: 'step-3',
            name: 'Run unit tests',
            type: 'NPM_TEST',
            action: 'npm test',
            continueOnError: false,
            timeout: 600,
            inputs: {},
            outputs: {},
            environment: {}
          }
        ],
        timeout: 900,
        retryPolicy: {
          enabled: true,
          maxAttempts: 1,
          backoffType: 'FIXED',
          backoffMultiplier: 1,
          maxDelay: 30
        }
      },
      {
        id: 'stage-3',
        name: 'Deploy',
        type: 'DEPLOY',
        order: 3,
        inputs: [],
        outputs: [],
        steps: [
          {
            id: 'step-4',
            name: 'Deploy to production',
            type: 'SCRIPT',
            action: 'deploy.sh',
            continueOnError: false,
            timeout: 1200,
            inputs: {},
            outputs: {},
            environment: {}
          }
        ],
        timeout: 1800,
        retryPolicy: {
          enabled: false,
          maxAttempts: 1,
          backoffType: 'FIXED',
          backoffMultiplier: 1,
          maxDelay: 0
        }
      }
    ],
    environment: 'PRODUCTION',
    isActive: true,
    settings: {
      timeout: 3600,
      retryPolicy: {
        enabled: true,
        maxAttempts: 3,
        backoffType: 'EXPONENTIAL',
        backoffMultiplier: 2,
        maxDelay: 300
      },
      artifacts: {
        retention: 30,
        compression: true,
        encryption: false,
        storage: 'LOCAL'
      },
      notifications: {
        onSuccess: [],
        onFailure: [],
        onApproval: []
      },
      security: {
        requireApproval: false,
        approvers: [],
        secretScanning: true,
        dependencyScanning: true,
        codeQuality: true
      }
    },
    createdBy: 'user-1',
    createdAt: '2024-04-01T00:00:00Z',
    updatedAt: '2024-04-26T10:00:00Z'
  }
]

const mockEnvironments: Environment[] = [
  {
    id: 'env-1',
    name: 'Production',
    type: 'PRODUCTION',
    description: 'Production environment',
    url: 'https://app.example.com',
    variables: [
      {
        id: 'env-var-1',
        environmentId: 'env-1',
        name: 'NODE_ENV',
        value: 'production',
        type: 'STRING',
        isSecret: false,
        scope: 'RUNTIME'
      }
    ],
    services: [
      {
        id: 'service-1',
        environmentId: 'env-1',
        name: 'Web Server',
        type: 'WEB_SERVER',
        status: 'RUNNING',
        url: 'https://app.example.com',
        version: 'v1.2.3',
        healthCheck: {
          enabled: true,
          endpoint: '/health',
          interval: 60,
          timeout: 10,
          retries: 3,
          expectedStatus: 200
        },
        resources: {
          cpu: { requested: 500, limit: 1000, unit: 'm' },
          memory: { requested: 512, limit: 1024, unit: 'Mi' },
          storage: { requested: 10, limit: 50, unit: 'Gi' },
          network: { requested: 100, limit: 1000, unit: 'Mbps' }
        },
        createdAt: '2024-04-01T00:00:00Z',
        updatedAt: '2024-04-26T10:00:00Z'
      }
    ],
    isActive: true,
    createdAt: '2024-04-01T00:00:00Z',
    updatedAt: '2024-04-26T10:00:00Z'
  }
]

export class DeploymentService {
  // Deployment Management
  static async getDeploymentsByProject(projectId: string): Promise<Deployment[]> {
    return mockDeployments.filter(deployment => deployment.projectId === projectId)
  }

  static async getDeploymentById(deploymentId: string): Promise<Deployment | null> {
    return mockDeployments.find(deployment => deployment.id === deploymentId) || null
  }

  static async createDeployment(data: {
    name: string
    description?: string
    projectId: string
    environment: DeploymentEnvironment
    version: string
    commitHash: string
    branch: string
    triggeredBy: string
    variables?: any[]
  }): Promise<Deployment> {
    const newDeployment: Deployment = {
      id: `deploy-${Date.now()}`,
      name: data.name,
      description: data.description,
      projectId: data.projectId,
      environment: data.environment,
      status: 'PENDING',
      version: data.version,
      commitHash: data.commitHash,
      branch: data.branch,
      triggeredBy: data.triggeredBy,
      logs: [],
      variables: data.variables || [],
      hooks: [],
      createdAt: new Date().toISOString()
    }

    mockDeployments.push(newDeployment)
    
    // Simulate deployment process
    setTimeout(() => {
      this.updateDeploymentStatus(newDeployment.id, 'BUILDING')
    }, 1000)

    setTimeout(() => {
      this.updateDeploymentStatus(newDeployment.id, 'DEPLOYING')
    }, 5000)

    setTimeout(() => {
      this.updateDeploymentStatus(newDeployment.id, 'SUCCESS')
      this.addDeploymentLog(newDeployment.id, 'INFO', 'Deployment completed successfully', 'DEPLOY')
    }, 10000)

    return newDeployment
  }

  static async updateDeploymentStatus(deploymentId: string, status: DeploymentStatus): Promise<Deployment> {
    const deployment = mockDeployments.find(d => d.id === deploymentId)
    if (!deployment) throw new Error('Deployment not found')

    deployment.status = status
    // deployment.updatedAt = new Date().toISOString() // Property not in interface

    if (status === 'BUILDING' && !deployment.startedAt) {
      deployment.startedAt = new Date().toISOString()
    }

    if (['SUCCESS', 'FAILED', 'CANCELLED'].includes(status) && !deployment.completedAt) {
      deployment.completedAt = new Date().toISOString()
      if (deployment.startedAt) {
        deployment.duration = new Date(deployment.completedAt).getTime() - new Date(deployment.startedAt).getTime()
      }
    }

    return deployment
  }

  static async rollbackDeployment(deploymentId: string, reason: string): Promise<Deployment> {
    const deployment = mockDeployments.find(d => d.id === deploymentId)
    if (!deployment) throw new Error('Deployment not found')

    deployment.status = 'ROLLING_BACK'
    deployment.rollbackReason = reason

    // Simulate rollback process
    setTimeout(() => {
      deployment.status = 'ROLLED_BACK'
      // deployment.updatedAt = new Date().toISOString() // Property not in interface
    }, 5000)

    return deployment
  }

  static async addDeploymentLog(deploymentId: string, level: LogLevel, message: string, source: string): Promise<void> {
    const deployment = mockDeployments.find(d => d.id === deploymentId)
    if (!deployment) return

    const log = {
      id: `log-${Date.now()}`,
      deploymentId,
      level,
      message,
      timestamp: new Date().toISOString(),
      source
    }

    deployment.logs.push(log)
  }

  // Pipeline Management
  static async getPipelinesByProject(projectId: string): Promise<Pipeline[]> {
    return mockPipelines.filter(pipeline => pipeline.projectId === projectId)
  }

  static async getPipelineById(pipelineId: string): Promise<Pipeline | null> {
    return mockPipelines.find(pipeline => pipeline.id === pipelineId) || null
  }

  static async createPipeline(data: {
    name: string
    description?: string
    projectId: string
    trigger: any
    stages: any[]
    environment: DeploymentEnvironment
    createdBy: string
  }): Promise<Pipeline> {
    const newPipeline: Pipeline = {
      id: `pipeline-${Date.now()}`,
      name: data.name,
      description: data.description,
      projectId: data.projectId,
      trigger: data.trigger,
      stages: data.stages,
      environment: data.environment,
      isActive: true,
      settings: {
        timeout: 3600,
        retryPolicy: {
          enabled: true,
          maxAttempts: 3,
          backoffType: 'EXPONENTIAL',
          backoffMultiplier: 2,
          maxDelay: 300
        },
        artifacts: {
          retention: 30,
          compression: true,
          encryption: false,
          storage: 'LOCAL'
        },
        notifications: {
          onSuccess: [],
          onFailure: [],
          onApproval: []
        },
        security: {
          requireApproval: false,
          approvers: [],
          secretScanning: true,
          dependencyScanning: true,
          codeQuality: true
        }
      },
      createdBy: data.createdBy,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    mockPipelines.push(newPipeline)
    return newPipeline
  }

  static async runPipeline(pipelineId: string, triggeredBy: string, variables?: any[]): Promise<PipelineRun> {
    const pipeline = mockPipelines.find(p => p.id === pipelineId)
    if (!pipeline) throw new Error('Pipeline not found')

    const run: PipelineRun = {
      id: `run-${Date.now()}`,
      pipelineId,
      number: mockDeployments.length + 1,
      status: 'PENDING',
      trigger: {
        type: 'MANUAL',
        manualTrigger: triggeredBy
      },
      variables: variables || [],
      stages: pipeline.stages.map(stage => ({
        id: stage.id,
        name: stage.name,
        status: 'PENDING',
        steps: stage.steps.map(step => ({
          id: step.id,
          name: step.name,
          status: 'PENDING',
          logs: []
        })),
        artifacts: [],
        logs: []
      })),
      artifacts: [],
      logs: [],
      metrics: {
        totalDuration: 0,
        buildTime: 0,
        testTime: 0,
        deployTime: 0,
        cpuUsage: 0,
        memoryUsage: 0,
        networkUsage: 0,
        cacheHitRate: 0
      },
      startedAt: new Date().toISOString(),
      triggeredBy
    }

    // Simulate pipeline execution
    setTimeout(() => {
      this.updatePipelineRunStatus(run.id, 'RUNNING')
    }, 1000)

    return run
  }

  static async updatePipelineRunStatus(runId: string, status: RunStatus): Promise<PipelineRun> {
    // Update pipeline run status (in real implementation, this would update the database)
    return {} as PipelineRun
  }

  // Environment Management
  static async getEnvironmentsByProject(projectId: string): Promise<Environment[]> {
    return mockEnvironments.filter(environment => 
      environment.projectId === projectId // This would need to be added to Environment interface
    )
  }

  static async createEnvironment(data: {
    name: string
    type: DeploymentEnvironment
    description?: string
    url?: string
    projectId: string
  }): Promise<Environment> {
    const newEnvironment: Environment = {
      id: `env-${Date.now()}`,
      name: data.name,
      type: data.type,
      description: data.description,
      url: data.url,
      variables: [],
      services: [],
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    mockEnvironments.push(newEnvironment)
    return newEnvironment
  }

  // Templates
  static async getTemplates(): Promise<DeploymentTemplate[]> {
    return [
      {
        id: 'template-1',
        name: 'React Web App',
        description: 'CI/CD pipeline for React web applications',
        category: 'WEB_APP',
        pipeline: mockPipelines[0],
        environments: [mockEnvironments[0]],
        variables: [
          {
            name: 'NODE_VERSION',
            type: 'STRING',
            required: true,
            defaultValue: '18',
            description: 'Node.js version to use'
          },
          {
            name: 'BUILD_COMMAND',
            type: 'STRING',
            required: true,
            defaultValue: 'npm run build',
            description: 'Build command to run'
          }
        ],
        isPublic: true,
        downloads: 150,
        rating: 4.8,
        createdBy: 'system',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-04-26T10:00:00Z'
      }
    ]
  }

  static async createPipelineFromTemplate(templateId: string, projectId: string, variables: any[]): Promise<Pipeline> {
    const templates = await this.getTemplates()
    const template = templates.find(t => t.id === templateId)
    if (!template) throw new Error('Template not found')

    return this.createPipeline({
      name: `${template.name} - ${projectId}`,
      description: template.description,
      projectId,
      trigger: template.pipeline.trigger,
      stages: template.pipeline.stages,
      environment: template.pipeline.environment,
      createdBy: 'user-1'
    })
  }

  // Metrics
  static async getDeploymentMetrics(projectId: string): Promise<DeploymentMetrics> {
    const projectDeployments = mockDeployments.filter(d => d.projectId === projectId)
    const successCount = projectDeployments.filter(d => d.status === 'SUCCESS').length
    const failureCount = projectDeployments.filter(d => d.status === 'FAILED').length
    
    return {
      projectId,
      totalDeployments: projectDeployments.length,
      successRate: projectDeployments.length > 0 ? (successCount / projectDeployments.length) * 100 : 0,
      averageDeploymentTime: projectDeployments.reduce((sum, d) => sum + (d.duration || 0), 0) / (projectDeployments.length || 1),
      failureRate: projectDeployments.length > 0 ? (failureCount / projectDeployments.length) * 100 : 0,
      rollbackRate: projectDeployments.filter(d => d.status === 'ROLLED_BACK').length / (projectDeployments.length || 1) * 100,
      environmentMetrics: {
        PRODUCTION: {
          deploymentCount: projectDeployments.filter(d => d.environment === 'PRODUCTION').length,
          successCount: projectDeployments.filter(d => d.environment === 'PRODUCTION' && d.status === 'SUCCESS').length,
          failureCount: projectDeployments.filter(d => d.environment === 'PRODUCTION' && d.status === 'FAILED').length,
          averageTime: 0
        },
        STAGING: {
          deploymentCount: projectDeployments.filter(d => d.environment === 'STAGING').length,
          successCount: projectDeployments.filter(d => d.environment === 'STAGING' && d.status === 'SUCCESS').length,
          failureCount: projectDeployments.filter(d => d.environment === 'STAGING' && d.status === 'FAILED').length,
          averageTime: 0
        },
        DEVELOPMENT: {
          deploymentCount: projectDeployments.filter(d => d.environment === 'DEVELOPMENT').length,
          successCount: projectDeployments.filter(d => d.environment === 'DEVELOPMENT' && d.status === 'SUCCESS').length,
          failureCount: projectDeployments.filter(d => d.environment === 'DEVELOPMENT' && d.status === 'FAILED').length,
          averageTime: 0
        },
        TESTING: {
          deploymentCount: 0,
          successCount: 0,
          failureCount: 0,
          averageTime: 0
        },
        PREVIEW: {
          deploymentCount: 0,
          successCount: 0,
          failureCount: 0,
          averageTime: 0
        }
      },
      trends: []
    }
  }
}
