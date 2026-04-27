import React, { useState, useCallback } from 'react'
import { Share2, Download, Link, Users, Lock, Unlock, Copy, Check, Globe, Mail, MessageSquare } from 'lucide-react'
import JSZip from 'jszip'

interface WorkspaceFile {
  id: string
  name: string
  content: string
  language: string
  modified: boolean
  active?: boolean
  path?: string
}

interface ShareSettings {
  isPublic: boolean
  allowComments: boolean
  allowDownload: boolean
  password?: string
  expiresAt?: string
}

interface FileShareManagerProps {
  files: WorkspaceFile[]
  workspaceName: string
  onShare?: (settings: ShareSettings) => void
  onExport?: (format: 'zip' | 'github' | 'individual') => void
}

const FileShareManager: React.FC<FileShareManagerProps> = ({
  files,
  workspaceName,
  onShare,
  onExport
}) => {
  const [shareSettings, setShareSettings] = useState<ShareSettings>({
    isPublic: false,
    allowComments: true,
    allowDownload: true
  })
  const [shareUrl, setShareUrl] = useState('')
  const [copied, setCopied] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)
  const [showExportModal, setShowExportModal] = useState(false)
  const [exportFormat, setExportFormat] = useState<'zip' | 'github' | 'individual'>('zip')

  const generateShareUrl = useCallback(() => {
    const baseUrl = window.location.origin
    const workspaceId = workspaceName.replace(/\s+/g, '-').toLowerCase()
    const url = `${baseUrl}/shared/${workspaceId}`
    setShareUrl(url)
    setShowShareModal(true)
  }, [workspaceName])

  const copyToClipboard = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }, [])

  const handleShare = useCallback(() => {
    generateShareUrl()
    if (onShare) {
      onShare(shareSettings)
    }
  }, [generateShareUrl, shareSettings, onShare])

  const exportAsZip = useCallback(async () => {
    const zip = new JSZip()
    
    files.forEach(file => {
      const filePath = file.path || file.name
      zip.file(filePath, file.content)
    })

    const blob = await zip.generateAsync({ type: 'blob' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${workspaceName.replace(/\s+/g, '-').toLowerCase()}.zip`
    a.click()
    URL.revokeObjectURL(url)
  }, [files, workspaceName])

  const exportAsIndividual = useCallback(() => {
    files.forEach(file => {
      const blob = new Blob([file.content], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = file.name
      a.click()
      URL.revokeObjectURL(url)
    })
  }, [files])

  const exportAsGitHub = useCallback(() => {
    // Generate GitHub repository structure
    const repoData = {
      name: workspaceName.replace(/\s+/g, '-').toLowerCase(),
      description: `Workspace: ${workspaceName}`,
      files: files.map(file => ({
        path: file.path || file.name,
        content: file.content
      }))
    }

    const blob = new Blob([JSON.stringify(repoData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${workspaceName.replace(/\s+/g, '-').toLowerCase()}-github-export.json`
    a.click()
    URL.revokeObjectURL(url)
  }, [files, workspaceName])

  const handleExport = useCallback(() => {
    switch (exportFormat) {
      case 'zip':
        exportAsZip()
        break
      case 'individual':
        exportAsIndividual()
        break
      case 'github':
        exportAsGitHub()
        break
    }
    
    if (onExport) {
      onExport(exportFormat)
    }
    
    setShowExportModal(false)
  }, [exportFormat, exportAsZip, exportAsIndividual, exportAsGitHub, onExport])

  const getFileStats = () => {
    const totalSize = files.reduce((acc, file) => acc + file.content.length, 0)
    const fileTypes = files.reduce((acc, file) => {
      const ext = file.name.split('.').pop()?.toLowerCase() || 'unknown'
      acc[ext] = (acc[ext] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return { totalSize, fileTypes }
  }

  const { totalSize, fileTypes } = getFileStats()

  return (
    <div className="space-y-4">
      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          onClick={handleShare}
          className="flex items-center justify-center gap-2 p-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Share2 className="w-5 h-5" />
          Share Workspace
        </button>

        <button
          onClick={() => setShowExportModal(true)}
          className="flex items-center justify-center gap-2 p-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <Download className="w-5 h-5" />
          Export Files
        </button>
      </div>

      {/* File Stats */}
      <div className="bg-gray-800 rounded-lg p-4">
        <h3 className="text-white font-medium mb-3">Workspace Overview</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <div className="text-gray-400">Files</div>
            <div className="text-white font-medium">{files.length}</div>
          </div>
          <div>
            <div className="text-gray-400">Total Size</div>
            <div className="text-white font-medium">{(totalSize / 1024).toFixed(1)} KB</div>
          </div>
          <div>
            <div className="text-gray-400">Languages</div>
            <div className="text-white font-medium">{Object.keys(fileTypes).length}</div>
          </div>
          <div>
            <div className="text-gray-400">Modified</div>
            <div className="text-white font-medium">{files.filter(f => f.modified).length}</div>
          </div>
        </div>

        {Object.keys(fileTypes).length > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-700">
            <div className="text-gray-400 text-sm mb-2">File Types:</div>
            <div className="flex flex-wrap gap-2">
              {Object.entries(fileTypes).map(([ext, count]) => (
                <span key={ext} className="px-2 py-1 bg-gray-700 text-xs rounded">
                  {ext}: {count}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-white mb-4">Share Workspace</h3>
            
            <div className="space-y-4">
              {/* Share Settings */}
              <div className="space-y-3">
                <label className="flex items-center justify-between">
                  <span className="text-gray-300">Public access</span>
                  <button
                    onClick={() => setShareSettings(prev => ({ ...prev, isPublic: !prev.isPublic }))}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      shareSettings.isPublic ? 'bg-blue-600' : 'bg-gray-600'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        shareSettings.isPublic ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </label>

                <label className="flex items-center justify-between">
                  <span className="text-gray-300">Allow comments</span>
                  <button
                    onClick={() => setShareSettings(prev => ({ ...prev, allowComments: !prev.allowComments }))}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      shareSettings.allowComments ? 'bg-blue-600' : 'bg-gray-600'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        shareSettings.allowComments ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </label>

                <label className="flex items-center justify-between">
                  <span className="text-gray-300">Allow download</span>
                  <button
                    onClick={() => setShareSettings(prev => ({ ...prev, allowDownload: !prev.allowDownload }))}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      shareSettings.allowDownload ? 'bg-blue-600' : 'bg-gray-600'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        shareSettings.allowDownload ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </label>
              </div>

              {/* Share URL */}
              {shareUrl && (
                <div className="bg-gray-700 rounded-lg p-3">
                  <div className="flex items-center space-x-2">
                    <Link className="w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={shareUrl}
                      readOnly
                      className="flex-1 bg-transparent text-white text-sm outline-none"
                    />
                    <button
                      onClick={() => copyToClipboard(shareUrl)}
                      className="p-1 text-gray-400 hover:text-white"
                    >
                      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              )}

              {/* Share Options */}
              <div className="flex space-x-2">
                <button className="flex-1 flex items-center justify-center gap-2 p-2 bg-gray-700 text-gray-300 rounded hover:bg-gray-600 transition-colors">
                  <Mail className="w-4 h-4" />
                  Email
                </button>
                <button className="flex-1 flex items-center justify-center gap-2 p-2 bg-gray-700 text-gray-300 rounded hover:bg-gray-600 transition-colors">
                  <MessageSquare className="w-4 h-4" />
                  Message
                </button>
              </div>
            </div>

            <div className="flex justify-end space-x-2 mt-6">
              <button
                onClick={() => setShowShareModal(false)}
                className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleShare}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                Share
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-white mb-4">Export Files</h3>
            
            <div className="space-y-3">
              <label className="flex items-center p-3 bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-600 transition-colors">
                <input
                  type="radio"
                  name="exportFormat"
                  value="zip"
                  checked={exportFormat === 'zip'}
                  onChange={(e) => setExportFormat(e.target.value as any)}
                  className="mr-3"
                />
                <div className="flex-1">
                  <div className="text-white font-medium">ZIP Archive</div>
                  <div className="text-gray-400 text-sm">All files in a single ZIP file</div>
                </div>
              </label>

              <label className="flex items-center p-3 bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-600 transition-colors">
                <input
                  type="radio"
                  name="exportFormat"
                  value="individual"
                  checked={exportFormat === 'individual'}
                  onChange={(e) => setExportFormat(e.target.value as any)}
                  className="mr-3"
                />
                <div className="flex-1">
                  <div className="text-white font-medium">Individual Files</div>
                  <div className="text-gray-400 text-sm">Download each file separately</div>
                </div>
              </label>

              <label className="flex items-center p-3 bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-600 transition-colors">
                <input
                  type="radio"
                  name="exportFormat"
                  value="github"
                  checked={exportFormat === 'github'}
                  onChange={(e) => setExportFormat(e.target.value as any)}
                  className="mr-3"
                />
                <div className="flex-1">
                  <div className="text-white font-medium">GitHub Export</div>
                  <div className="text-gray-400 text-sm">JSON format for GitHub import</div>
                </div>
              </label>
            </div>

            <div className="flex justify-end space-x-2 mt-6">
              <button
                onClick={() => setShowExportModal(false)}
                className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleExport}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
              >
                Export
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default FileShareManager
