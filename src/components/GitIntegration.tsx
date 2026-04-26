import { useState, useEffect } from 'react'
import { GitBranch, GitCommit, CheckCircle, AlertCircle, Download, Upload } from 'lucide-react'

interface GitCommit {
  id: string
  message: string
  author: string
  timestamp: Date
  hash: string
  branch: string
  changes: {
    added: number
    modified: number
    deleted: number
  }
}

interface GitBranch {
  name: string
  isCurrent: boolean
  ahead: number
  behind: number
}

interface GitIntegrationProps {
  repositoryPath?: string
  onCommit?: (message: string) => void
  onBranchChange?: (branch: string) => void
}

export default function GitIntegration({ 
  repositoryPath, 
  onCommit, 
  onBranchChange 
}: GitIntegrationProps) {
  const [commits, setCommits] = useState<GitCommit[]>([])
  const [branches, setBranches] = useState<GitBranch[]>([])
  const [currentBranch, setCurrentBranch] = useState<string>('main')
  const [commitMessage, setCommitMessage] = useState('')
  const [status, setStatus] = useState<'clean' | 'dirty' | 'syncing'>('clean')
  const [lastSync, setLastSync] = useState<Date | null>(null)

  useEffect(() => {
    // Simulate git data
    const mockCommits: GitCommit[] = [
      {
        id: '1',
        message: 'Initial project setup',
        author: 'Developer',
        timestamp: new Date(Date.now() - 86400000),
        hash: 'abc123',
        branch: 'main',
        changes: { added: 15, modified: 0, deleted: 0 }
      },
      {
        id: '2',
        message: 'Add user authentication',
        author: 'Developer',
        timestamp: new Date(Date.now() - 43200000),
        hash: 'def456',
        branch: 'main',
        changes: { added: 8, modified: 3, deleted: 1 }
      },
      {
        id: '3',
        message: 'Implement project CRUD',
        author: 'Developer',
        timestamp: new Date(Date.now() - 21600000),
        hash: 'ghi789',
        branch: 'main',
        changes: { added: 12, modified: 5, deleted: 2 }
      }
    ]

    const mockBranches: GitBranch[] = [
      { name: 'main', isCurrent: true, ahead: 0, behind: 0 },
      { name: 'feature/user-auth', isCurrent: false, ahead: 3, behind: 0 },
      { name: 'bugfix/login-issue', isCurrent: false, ahead: 1, behind: 0 }
    ]

    setCommits(mockCommits)
    setBranches(mockBranches)
    setLastSync(new Date())
  }, [])

  const handleCommit = () => {
    if (!commitMessage.trim()) return

    setStatus('syncing')
    
    // Simulate commit process
    setTimeout(() => {
      const newCommit: GitCommit = {
        id: Date.now().toString(),
        message: commitMessage,
        author: 'Developer',
        timestamp: new Date(),
        hash: Math.random().toString(36).substring(2, 8),
        branch: currentBranch,
        changes: { added: 2, modified: 1, deleted: 0 }
      }

      setCommits([newCommit, ...commits])
      setCommitMessage('')
      setStatus('clean')
      setLastSync(new Date())
      onCommit?.(commitMessage)
    }, 2000)
  }

  const handleBranchSwitch = (branchName: string) => {
    setStatus('syncing')
    
    setTimeout(() => {
      setCurrentBranch(branchName)
      setBranches(branches.map(branch => ({
        ...branch,
        isCurrent: branch.name === branchName
      })))
      setStatus('clean')
      onBranchChange?.(branchName)
    }, 1000)
  }

  const handlePull = () => {
    setStatus('syncing')
    
    setTimeout(() => {
      setStatus('clean')
      setLastSync(new Date())
    }, 1500)
  }

  const handlePush = () => {
    setStatus('syncing')
    
    setTimeout(() => {
      setStatus('clean')
      setLastSync(new Date())
    }, 1500)
  }

  const getStatusIcon = () => {
    switch (status) {
      case 'clean':
        return <CheckCircle className="w-4 h-4 text-green-400" />
      case 'dirty':
        return <AlertCircle className="w-4 h-4 text-yellow-400" />
      case 'syncing':
        return <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
      default:
        return null
    }
  }

  const getStatusText = () => {
    switch (status) {
      case 'clean':
        return 'All changes committed'
      case 'dirty':
        return 'Uncommitted changes'
      case 'syncing':
        return 'Syncing...'
      default:
        return ''
    }
  }

  const formatTimestamp = (date: Date) => {
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="bg-gray-800 rounded-lg p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <GitBranch className="w-5 h-5 text-blue-400" />
          <h3 className="text-white font-medium">Git Integration</h3>
          {getStatusIcon()}
          <span className="text-gray-400 text-sm">{getStatusText()}</span>
        </div>
        
        <div className="flex items-center space-x-2">
          {repositoryPath && (
            <span className="text-gray-500 text-xs">
              {repositoryPath}
            </span>
          )}
          {lastSync && (
            <span className="text-gray-500 text-xs">
              Last sync: {formatTimestamp(lastSync)}
            </span>
          )}
        </div>
      </div>

      {/* Branch Selector */}
      <div className="space-y-2">
        <label className="text-gray-300 text-sm font-medium">Current Branch</label>
        <div className="flex items-center space-x-2">
          <select
            value={currentBranch}
            onChange={(e) => handleBranchSwitch(e.target.value)}
            className="bg-gray-700 text-gray-300 px-3 py-2 rounded border border-gray-600 flex-1"
          >
            {branches.map(branch => (
              <option key={branch.name} value={branch.name}>
                {branch.name} {branch.isCurrent ? '(current)' : ''}
              </option>
            ))}
          </select>
          
          <button
            onClick={handlePull}
            disabled={status === 'syncing'}
            className="p-2 bg-gray-700 text-gray-300 hover:bg-gray-600 rounded disabled:opacity-50"
            title="Pull changes"
          >
            <Download className="w-4 h-4" />
          </button>
          
          <button
            onClick={handlePush}
            disabled={status === 'syncing'}
            className="p-2 bg-gray-700 text-gray-300 hover:bg-gray-600 rounded disabled:opacity-50"
            title="Push changes"
          >
            <Upload className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Commit Form */}
      <div className="space-y-2">
        <label className="text-gray-300 text-sm font-medium">Commit Changes</label>
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={commitMessage}
            onChange={(e) => setCommitMessage(e.target.value)}
            placeholder="Commit message..."
            className="flex-1 bg-gray-700 text-gray-300 px-3 py-2 rounded border border-gray-600"
          />
          <button
            onClick={handleCommit}
            disabled={!commitMessage.trim() || status === 'syncing'}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            <GitCommit className="w-4 h-4" />
            Commit
          </button>
        </div>
      </div>

      {/* Recent Commits */}
      <div className="space-y-2">
        <label className="text-gray-300 text-sm font-medium">Recent Commits</label>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {commits.slice(0, 5).map(commit => (
            <div key={commit.id} className="bg-gray-700 rounded p-3">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center space-x-2">
                  <span className="text-gray-400 text-xs font-mono">{commit.hash}</span>
                  <span className="text-white text-sm font-medium">{commit.message}</span>
                </div>
                <span className="text-gray-500 text-xs">{formatTimestamp(commit.timestamp)}</span>
              </div>
              <div className="flex items-center justify-between text-xs text-gray-400">
                <span>{commit.author}</span>
                <div className="flex items-center space-x-3">
                  <span className="text-green-400">+{commit.changes.added}</span>
                  <span className="text-yellow-400">~{commit.changes.modified}</span>
                  <span className="text-red-400">-{commit.changes.deleted}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Branch Status */}
      <div className="space-y-2">
        <label className="text-gray-300 text-sm font-medium">Branch Status</label>
        <div className="space-y-1">
          {branches.map(branch => (
            <div 
              key={branch.name}
              className={`flex items-center justify-between p-2 rounded ${
                branch.isCurrent ? 'bg-blue-600/20 border border-blue-600/30' : 'bg-gray-700'
              }`}
            >
              <div className="flex items-center space-x-2">
                <GitBranch className="w-4 h-4 text-gray-400" />
                <span className={`text-sm ${branch.isCurrent ? 'text-blue-400 font-medium' : 'text-gray-300'}`}>
                  {branch.name}
                </span>
                {branch.isCurrent && (
                  <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded">current</span>
                )}
              </div>
              <div className="flex items-center space-x-3 text-xs">
                {branch.ahead > 0 && (
                  <span className="text-green-400">↑{branch.ahead}</span>
                )}
                {branch.behind > 0 && (
                  <span className="text-red-400">↓{branch.behind}</span>
                )}
                {branch.ahead === 0 && branch.behind === 0 && (
                  <span className="text-gray-500">up to date</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
