import React, { useState, useEffect } from 'react'
import {
  Rocket,
  GitBranch,
  Activity,
  CheckCircle,
  XCircle,
  Clock,
  Play,
  Pause,
  Eye,
  RotateCcw,
  Settings,
  Plus,
  Search,
  Filter,
  ChevronDown,
  Server,
  Database,
  Globe,
  Shield,
  Zap,
  BarChart3,
  FileText,
  Terminal,
  Layers,
  Package
} from 'lucide-react'
import {
  Deployment,
  Pipeline,
  Environment,
  DeploymentMetrics,
  DeploymentStatus,
  DeploymentEnvironment,
  RunStatus,
  TriggerType
} from '../../types/deployment'
import { DeploymentService } from '../../services/deploymentService'
import { User } from '../../types'

interface DeploymentDashboardProps {
  user: User
  projectId?: string
}

const statusColors: Record<DeploymentStatus | RunStatus, string> = {
  PENDING: '#6B7280',
  BUILDING: '#3B82F6',
  DEPLOYING: '#F59E0B',
  SUCCESS: '#10B981',
  FAILED: '#EF4444',
  CANCELLED: '#6B7280',
  ROLLING_BACK: '#F59E0B',
  ROLLED_BACK: '#8B5CF6',
  RUNNING: '#3B82F6',
  SKIPPED: '#6B7280'
}

const statusIcons: Record<DeploymentStatus | RunStatus, React.ReactNode> = {
  PENDING: <Clock className="w-4 h-4" />,
  BUILDING: <Activity className="w-4 h-4" />,
  DEPLOYING: <Rocket className="w-4 h-4" />,
  SUCCESS: <CheckCircle className="w-4 h-4" />,
  FAILED: <XCircle className="w-4 h-4" />,
  CANCELLED: <Pause className="w-4 h-4" />,
  ROLLING_BACK: <RotateCcw className="w-4 h-4" />,
  ROLLED_BACK: <RotateCcw className="w-4 h-4" />,
  RUNNING: <Activity className="w-4 h-4" />,
  SKIPPED: <Pause className="w-4 h-4" />
}

const environmentIcons: Record<DeploymentEnvironment, React.ReactNode> = {
  DEVELOPMENT: <Terminal className="w-4 h-4" />,
  STAGING: <Shield className="w-4 h-4" />,
  PRODUCTION: <Globe className="w-4 h-4" />,
  TESTING: <FileText className="w-4 h-4" />,
  PREVIEW: <Eye className="w-4 h-4" />
}

export default function DeploymentDashboard({ user, projectId }: DeploymentDashboardProps) {
  const [deployments, setDeployments] = useState<Deployment[]>([])
  const [pipelines, setPipelines] = useState<Pipeline[]>([])
  const [environments, setEnvironments] = useState<Environment[]>([])
  const [metrics, setMetrics] = useState<DeploymentMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<DeploymentStatus | 'ALL'>('ALL')
  const [selectedEnvironment, setSelectedEnvironment] = useState<DeploymentEnvironment | 'ALL'>('ALL')
  const [showFilters, setShowFilters] = useState(false)
  const [activeTab, setActiveTab] = useState<'deployments' | 'pipelines' | 'environments' | 'metrics'>('deployments')
  const [selectedDeployment, setSelectedDeployment] = useState<Deployment | null>(null)
  const [showDeploymentModal, setShowDeploymentModal] = useState(false)

  useEffect(() => {
    loadData()
  }, [projectId])

  const loadData = async () => {
    try {
      const [projectDeployments, projectPipelines, projectEnvs, projectMetrics] = await Promise.all([
        projectId ? DeploymentService.getDeploymentsByProject(projectId) : Promise.resolve([]),
        projectId ? DeploymentService.getPipelinesByProject(projectId) : Promise.resolve([]),
        projectId ? DeploymentService.getEnvironmentsByProject(projectId) : Promise.resolve([]),
        projectId ? DeploymentService.getDeploymentMetrics(projectId) : Promise.resolve(null as DeploymentMetrics | null)
      ])

      setDeployments(projectDeployments)
      setPipelines(projectPipelines)
      setEnvironments(projectEnvs)
      setMetrics(projectMetrics)
    } catch (error) {
      console.error('Failed to load deployment data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateDeployment = async () => {
    const name = prompt('Enter deployment name:')
    if (!name) return

    const environment = prompt('Enter environment (DEVELOPMENT/STAGING/PRODUCTION):') as DeploymentEnvironment
    if (!environment) return

    const version = prompt('Enter version:')
    if (!version) return

    try {
      const newDeployment = await DeploymentService.createDeployment({
        name,
        projectId: projectId || 'default-project',
        environment,
        version,
        commitHash: 'abc123',
        branch: 'main',
        triggeredBy: user.id
      })

      setDeployments([newDeployment, ...deployments])
      setSelectedDeployment(newDeployment)
      setShowDeploymentModal(true)
    } catch (error) {
      console.error('Failed to create deployment:', error)
    }
  }

  const handleRunPipeline = async (pipelineId: string) => {
    try {
      const run = await DeploymentService.runPipeline(pipelineId, user.id)
      console.log('Pipeline run started:', run)
      loadData() // Refresh data
    } catch (error) {
      console.error('Failed to run pipeline:', error)
    }
  }

  const handleRollbackDeployment = async (deploymentId: string) => {
    const reason = prompt('Enter rollback reason:')
    if (!reason) return

    try {
      await DeploymentService.rollbackDeployment(deploymentId, reason)
      loadData() // Refresh data
    } catch (error) {
      console.error('Failed to rollback deployment:', error)
    }
  }

  const filteredDeployments = deployments.filter(deployment => {
    const matchesSearch = deployment.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         deployment.description?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = selectedStatus === 'ALL' || deployment.status === selectedStatus
    const matchesEnvironment = selectedEnvironment === 'ALL' || deployment.environment === selectedEnvironment
    return matchesSearch && matchesStatus && matchesEnvironment
  })

  const getStatusColor = (status: DeploymentStatus | RunStatus) => statusColors[status]
  const getStatusIcon = (status: DeploymentStatus | RunStatus) => statusIcons[status]
  const getEnvironmentIcon = (env: DeploymentEnvironment) => environmentIcons[env]

  const formatDuration = (duration?: number) => {
    if (!duration) return 'N/A'
    const seconds = Math.floor(duration / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    
    if (hours > 0) return `${hours}h ${minutes % 60}m`
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`
    return `${seconds}s`
  }

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
            <Rocket className="w-6 h-6 text-blue-500" />
            <h1 className="text-2xl font-bold">Deployments & CI/CD</h1>
            {projectId && <span className="text-gray-400">Project: {projectId}</span>}
          </div>

          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search deployments..."
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
              onClick={handleCreateDeployment}
              className="px-3 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 flex items-center"
            >
              <Plus className="w-4 h-4 mr-1" />
              New Deployment
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1">
          {[
            { id: 'deployments', label: 'Deployments', count: deployments.length },
            { id: 'pipelines', label: 'Pipelines', count: pipelines.length },
            { id: 'environments', label: 'Environments', count: environments.length },
            { id: 'metrics', label: 'Metrics', count: 0 }
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
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-400">Environment:</span>
              <select
                value={selectedEnvironment}
                onChange={(e) => setSelectedEnvironment(e.target.value as any)}
                className="bg-gray-700 rounded px-3 py-1 text-sm"
              >
                <option value="ALL">All Environments</option>
                <option value="DEVELOPMENT">Development</option>
                <option value="STAGING">Staging</option>
                <option value="PRODUCTION">Production</option>
                <option value="TESTING">Testing</option>
                <option value="PREVIEW">Preview</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {activeTab === 'deployments' && (
          <div className="p-6">
            {metrics && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-gray-800 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Total Deployments</span>
                    <Rocket className="w-5 h-5 text-blue-500" />
                  </div>
                  <p className="text-2xl font-bold mt-2">{metrics.totalDeployments}</p>
                </div>

                <div className="bg-gray-800 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Success Rate</span>
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  </div>
                  <p className="text-2xl font-bold mt-2">{metrics.successRate.toFixed(1)}%</p>
                </div>

                <div className="bg-gray-800 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Avg Deployment Time</span>
                    <Clock className="w-5 h-5 text-yellow-500" />
                  </div>
                  <p className="text-2xl font-bold mt-2">{formatDuration(metrics.averageDeploymentTime)}</p>
                </div>

                <div className="bg-gray-800 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Failure Rate</span>
                    <XCircle className="w-5 h-5 text-red-500" />
                  </div>
                  <p className="text-2xl font-bold mt-2">{metrics.failureRate.toFixed(1)}%</p>
                </div>
              </div>
            )}

            <div className="space-y-4">
              {filteredDeployments.map(deployment => (
                <div key={deployment.id} className="bg-gray-800 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <div
                          className="flex items-center space-x-1 px-2 py-1 rounded-full text-xs"
                          style={{ backgroundColor: getStatusColor(deployment.status) + '20', color: getStatusColor(deployment.status) }}
                        >
                          {getStatusIcon(deployment.status)}
                          <span>{deployment.status.replace('_', ' ')}</span>
                        </div>
                        <div className="flex items-center space-x-1 text-gray-400">
                          {getEnvironmentIcon(deployment.environment)}
                          <span className="text-sm">{deployment.environment}</span>
                        </div>
                        <div className="flex items-center space-x-1 text-gray-400">
                          <GitBranch className="w-4 h-4" />
                          <span className="text-sm">{deployment.branch}</span>
                        </div>
                        <div className="flex items-center space-x-1 text-gray-400">
                          <Package className="w-4 h-4" />
                          <span className="text-sm">{deployment.version}</span>
                        </div>
                      </div>

                      <h3 className="text-lg font-semibold mb-2">{deployment.name}</h3>
                      {deployment.description && (
                        <p className="text-gray-400 mb-3">{deployment.description}</p>
                      )}

                      <div className="flex items-center space-x-4 text-sm text-gray-400">
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>{formatDuration(deployment.duration)}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <GitBranch className="w-4 h-4" />
                          <span>{deployment.commitHash.substring(0, 7)}</span>
                        </div>
                        {deployment.deployUrl && (
                          <div className="flex items-center space-x-1">
                            <Globe className="w-4 h-4" />
                            <a href={deployment.deployUrl} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">
                              View App
                            </a>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 ml-4">
                      {deployment.status === 'SUCCESS' && (
                        <button
                          onClick={() => handleRollbackDeployment(deployment.id)}
                          className="px-3 py-1 bg-orange-600 rounded hover:bg-orange-700 text-sm"
                        >
                          Rollback
                        </button>
                      )}

                      {['FAILED', 'CANCELLED'].includes(deployment.status) && (
                        <button
                          onClick={() => handleCreateDeployment()}
                          className="px-3 py-1 bg-blue-600 rounded hover:bg-blue-700 text-sm"
                        >
                          Retry
                        </button>
                      )}

                      <button
                        onClick={() => {
                          setSelectedDeployment(deployment)
                          setShowDeploymentModal(true)
                        }}
                        className="p-2 bg-gray-700 rounded hover:bg-gray-600"
                      >
                        <Activity className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  {['BUILDING', 'DEPLOYING', 'ROLLING_BACK'].includes(deployment.status) && (
                    <div className="mt-4">
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full animate-pulse"
                          style={{ width: '60%' }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'pipelines' && (
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {pipelines.map(pipeline => (
                <div key={pipeline.id} className="bg-gray-800 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold">{pipeline.name}</h3>
                      {pipeline.description && (
                        <p className="text-gray-400 text-sm mt-1">{pipeline.description}</p>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        pipeline.isActive ? 'bg-green-600' : 'bg-gray-600'
                      }`}>
                        {pipeline.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="flex items-center space-x-4 text-sm text-gray-400">
                      <div className="flex items-center space-x-1">
                        <GitBranch className="w-4 h-4" />
                        <span>{pipeline.trigger.branch}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        {getEnvironmentIcon(pipeline.environment)}
                        <span>{pipeline.environment}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Layers className="w-4 h-4" />
                        <span>{pipeline.stages.length} stages</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    {pipeline.stages.map(stage => (
                      <div key={stage.id} className="flex items-center space-x-2 text-sm">
                        <div className="w-2 h-2 bg-gray-600 rounded-full" />
                        <span className="text-gray-300">{stage.name}</span>
                        <span className="text-gray-500">({stage.steps.length} steps)</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleRunPipeline(pipeline.id)}
                        className="px-3 py-1 bg-blue-600 rounded hover:bg-blue-700 text-sm flex items-center"
                      >
                        <Play className="w-3 h-3 mr-1" />
                        Run Pipeline
                      </button>
                    </div>
                    <button className="text-sm text-gray-400 hover:text-gray-300">
                      <Settings className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'environments' && (
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {environments.map(environment => (
                <div key={environment.id} className="bg-gray-800 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      {getEnvironmentIcon(environment.type)}
                      <div>
                        <h3 className="text-lg font-semibold">{environment.name}</h3>
                        <span className="text-sm text-gray-400">{environment.type}</span>
                      </div>
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs ${
                      environment.isActive ? 'bg-green-600' : 'bg-gray-600'
                    }`}>
                      {environment.isActive ? 'Active' : 'Inactive'}
                    </div>
                  </div>

                  {environment.description && (
                    <p className="text-gray-400 mb-4">{environment.description}</p>
                  )}

                  {environment.url && (
                    <div className="mb-4">
                      <a 
                        href={environment.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 text-sm flex items-center"
                      >
                        <Globe className="w-4 h-4 mr-1" />
                        {environment.url}
                      </a>
                    </div>
                  )}

                  <div className="mb-4">
                    <h4 className="text-sm font-semibold mb-2">Services ({environment.services.length})</h4>
                    <div className="space-y-2">
                      {environment.services.map(service => (
                        <div key={service.id} className="flex items-center justify-between text-sm">
                          <div className="flex items-center space-x-2">
                            <Server className="w-4 h-4 text-gray-400" />
                            <span>{service.name}</span>
                          </div>
                          <span className={`px-2 py-1 rounded text-xs ${
                            service.status === 'RUNNING' ? 'bg-green-600' : 'bg-red-600'
                          }`}>
                            {service.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <button className="px-3 py-1 bg-gray-700 rounded hover:bg-gray-600 text-sm">
                        Deploy
                      </button>
                      <button className="px-3 py-1 bg-gray-700 rounded hover:bg-gray-600 text-sm">
                        View Logs
                      </button>
                    </div>
                    <button className="text-gray-400 hover:text-gray-300">
                      <Settings className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'metrics' && metrics && (
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Deployment Overview</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Total Deployments:</span>
                    <span className="font-bold">{metrics.totalDeployments}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Success Rate:</span>
                    <span className="font-bold text-green-400">{metrics.successRate.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Failure Rate:</span>
                    <span className="font-bold text-red-400">{metrics.failureRate.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Rollback Rate:</span>
                    <span className="font-bold text-orange-400">{metrics.rollbackRate.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Average Time:</span>
                    <span className="font-bold">{formatDuration(metrics.averageDeploymentTime)}</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Environment Metrics</h3>
                <div className="space-y-3">
                  {Object.entries(metrics.environmentMetrics).map(([env, envMetrics]) => (
                    <div key={env} className="border-b border-gray-700 pb-2">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium flex items-center">
                          {getEnvironmentIcon(env as DeploymentEnvironment)}
                          <span className="ml-2">{env}</span>
                        </span>
                        <span className="text-sm text-gray-400">{envMetrics.deploymentCount} deployments</span>
                      </div>
                      <div className="flex justify-between text-sm text-gray-400">
                        <span>Success: {envMetrics.successCount}</span>
                        <span>Failed: {envMetrics.failureCount}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
