import { useState, useEffect, useRef } from 'react'
import { Play, Save, FolderOpen, Settings, Terminal, Eye, GitBranch, Users, Share2, Zap, Video, MessageSquare, Mic, MicOff, VideoOff, Monitor, Smartphone, Tablet, Code, FileText, Image, Music, Download, Upload, RefreshCw, Copy, Check, X, ChevronDown, Plus, Minus, Maximize2, Volume2, VolumeX } from 'lucide-react'
import CodeEditor from '../components/CodeEditor'

export default function LiveWorkspace() {
  // Check if there's a template code in sessionStorage
  const [activeFile, setActiveFile] = useState(() => {
    const templateName = sessionStorage.getItem('templateName')
    return templateName ? `${templateName}.js` : 'index.js'
  })
  
  const [code, setCode] = useState(() => {
    const templateCode = sessionStorage.getItem('workspaceTemplate')
    if (templateCode) {
      // Clear sessionStorage after loading
      sessionStorage.removeItem('workspaceTemplate')
      sessionStorage.removeItem('templateName')
      return templateCode
    }
    
    return `// Live Workspace - Real-time Collaboration
// Start coding and see changes instantly

import React from 'react';
import ReactDOM from 'react-dom/client';

function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Live Workspace
        </h1>
        <p className="text-gray-600 mb-8">
          Real-time collaborative coding environment
        </p>
        
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-semibold mb-4">Interactive Demo</h2>
          <p className="text-gray-600 mb-4">
            Current count: <span className="font-bold text-blue-600">{count}</span>
          </p>
          <button
            onClick={() => setCount(count + 1)}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Increment Count
          </button>
        </div>
      </div>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);`
  })
  
  const [isPreviewMode, setIsPreviewMode] = useState(false)
  const [isTerminalOpen, setIsTerminalOpen] = useState(false)
  const [activeCollaborators, setActiveCollaborators] = useState(2)
  const [isVideoCallActive, setIsVideoCallActive] = useState(false)
  const [isAudioEnabled, setIsAudioEnabled] = useState(true)
  const [isVideoEnabled, setIsVideoEnabled] = useState(true)
  const [screenShareActive, setScreenShareActive] = useState(false)
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop')
  const [fontSize, setFontSize] = useState(14)
  const [wordWrap, setWordWrap] = useState(true)
  const [showMinimap, setShowMinimap] = useState(true)
  const [autoSave, setAutoSave] = useState(true)
  const [liveCompile, setLiveCompile] = useState(true)
  const [showChat, setShowChat] = useState(false)
  const [chatMessages, setChatMessages] = useState([
    { id: 1, sender: 'Sarah', message: 'Great work on the component!', timestamp: '2:30 PM', isMe: false },
    { id: 2, sender: 'You', message: 'Thanks! Just added the new features', timestamp: '2:32 PM', isMe: true },
    { id: 3, sender: 'Mike', message: 'Can we review the PR together?', timestamp: '2:35 PM', isMe: false }
  ])
  const [newMessage, setNewMessage] = useState('')
  const [showParticipants, setShowParticipants] = useState(false)
  const [connectionQuality, setConnectionQuality] = useState('excellent')
  const editorRef = useRef<any>(null)

  const files = [
    { name: 'index.js', type: 'javascript', size: '2.4KB' },
    { name: 'App.css', type: 'css', size: '1.2KB' },
    { name: 'package.json', type: 'json', size: '0.8KB' },
    { name: 'README.md', type: 'markdown', size: '3.1KB' }
  ]

  const collaborators = [
    { 
      name: 'You', 
      status: 'active', 
      color: 'bg-blue-500',
      role: 'owner',
      cursor: { line: 15, column: 25 },
      isSpeaking: false,
      isVideoOn: true
    },
    { 
      name: 'Sarah', 
      status: 'active', 
      color: 'bg-green-500',
      role: 'editor',
      cursor: { line: 8, column: 12 },
      isSpeaking: false,
      isVideoOn: true
    },
    { 
      name: 'Mike', 
      status: 'idle', 
      color: 'bg-yellow-500',
      role: 'viewer',
      cursor: null,
      isSpeaking: true,
      isVideoOn: false
    },
    { 
      name: 'Alex', 
      status: 'active', 
      color: 'bg-purple-500',
      role: 'editor',
      cursor: { line: 22, column: 8 },
      isSpeaking: false,
      isVideoOn: true
    }
  ]
  
  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const message = {
        id: chatMessages.length + 1,
        sender: 'You',
        message: newMessage,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isMe: true
      }
      setChatMessages([...chatMessages, message])
      setNewMessage('')
    }
  }
  
  const toggleVideoCall = () => {
    setIsVideoCallActive(!isVideoCallActive)
  }
  
  const toggleScreenShare = () => {
    setScreenShareActive(!screenShareActive)
  }
  
  const getConnectionQualityColor = (quality: string) => {
    switch (quality) {
      case 'excellent': return 'text-green-500'
      case 'good': return 'text-yellow-500'
      case 'poor': return 'text-red-500'
      default: return 'text-gray-500'
    }
  }
  
  const getDeviceIcon = (device: string) => {
    switch (device) {
      case 'desktop': return <Monitor className="w-4 h-4" />
      case 'tablet': return <Tablet className="w-4 h-4" />
      case 'mobile': return <Smartphone className="w-4 h-4" />
      default: return <Monitor className="w-4 h-4" />
    }
  }

  const handleRun = () => {
    setIsPreviewMode(true)
    setTimeout(() => setIsPreviewMode(false), 3000)
  }
  
  const handleCopyCode = () => {
    navigator.clipboard.writeText(code)
    // Show success feedback
  }
  
  const handleDownloadCode = () => {
    const blob = new Blob([code], { type: 'text/javascript' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = activeFile
    a.click()
    URL.revokeObjectURL(url)
  }
  
  const handleUploadCode = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.js,.jsx,.ts,.tsx,.html,.css,.json'
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (e) => {
          setCode(e.target?.result as string)
          setActiveFile(file.name)
        }
        reader.readAsText(file)
      }
    }
    input.click()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-lg font-semibold text-gray-900">Live Workspace</h1>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-600">Live</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Collaborators */}
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-gray-500" />
                <div className="flex -space-x-2">
                  {collaborators.slice(0, 3).map((collaborator, index) => (
                    <div
                      key={index}
                      className={`w-6 h-6 ${collaborator.color} rounded-full border-2 border-white flex items-center justify-center`}
                      title={collaborator.name}
                    >
                      <span className="text-white text-xs font-bold">
                        {collaborator.name[0]}
                      </span>
                    </div>
                  ))}
                  {collaborators.length > 3 && (
                    <div className="w-6 h-6 bg-gray-500 rounded-full border-2 border-white flex items-center justify-center">
                      <span className="text-white text-xs">+{collaborators.length - 3}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <button
                onClick={handleRun}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <Play className="w-4 h-4" />
                Run
              </button>
              
              <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                <Save className="w-4 h-4" />
                Save
              </button>

              <button className="p-2 text-gray-600 hover:text-gray-900">
                <Share2 className="w-4 h-4" />
              </button>

              <button className="p-2 text-gray-600 hover:text-gray-900">
                <Settings className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex h-screen pt-14">
        {/* Sidebar - File Explorer */}
        <div className="w-64 bg-gray-900 text-white border-r border-gray-800">
          <div className="p-4">
            <h3 className="text-sm font-semibold text-gray-400 mb-3">Explorer</h3>
            <div className="space-y-1">
              {files.map((file) => (
                <button
                  key={file.name}
                  onClick={() => setActiveFile(file.name)}
                  className={`w-full text-left px-3 py-2 rounded transition-colors flex items-center justify-between ${
                    activeFile === file.name
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:bg-gray-800'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <FolderOpen className="w-4 h-4" />
                    <span className="text-sm">{file.name}</span>
                  </div>
                  <span className="text-xs text-gray-400">{file.size}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Git Status */}
          <div className="border-t border-gray-800 p-4">
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <GitBranch className="w-4 h-4" />
              <span>main</span>
            </div>
            <div className="mt-2 text-xs text-gray-500">
              <div>● 2 modified</div>
              <div>+ 15 lines</div>
              <div>- 3 lines</div>
            </div>
          </div>
        </div>

        {/* Main Editor Area */}
        <div className="flex-1 flex flex-col">
          {/* Tabs */}
          <div className="bg-gray-800 border-b border-gray-700 px-4 py-2">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsPreviewMode(!isPreviewMode)}
                className={`flex items-center gap-2 px-3 py-1 rounded transition-colors ${
                  isPreviewMode ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                <Eye className="w-4 h-4" />
                Preview
              </button>
              
              <button
                onClick={() => setIsTerminalOpen(!isTerminalOpen)}
                className={`flex items-center gap-2 px-3 py-1 rounded transition-colors ${
                  isTerminalOpen ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                <Terminal className="w-4 h-4" />
                Terminal
              </button>
            </div>
          </div>

          {/* Editor or Preview */}
          <div className="flex-1 flex">
            {!isPreviewMode ? (
              <div className="flex-1">
                <CodeEditor 
                  value={code}
                  onChange={setCode}
                  language="javascript"
                  theme="vs-dark"
                />
              </div>
            ) : (
              <div className="flex-1 bg-white p-8">
                <div className="max-w-4xl mx-auto">
                  <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-8 rounded-lg">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">
                      Live Workspace
                    </h1>
                    <p className="text-gray-600 mb-8">
                      Real-time collaborative coding environment
                    </p>
                    
                    <div className="bg-white rounded-lg shadow-lg p-6">
                      <h2 className="text-2xl font-semibold mb-4">Interactive Demo</h2>
                      <p className="text-gray-600 mb-4">
                        Current count: <span className="font-bold text-blue-600">0</span>
                      </p>
                      <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
                        Increment Count
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Live Collaboration Panel */}
            <div className="w-80 bg-white border-l border-gray-200 p-4">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Zap className="w-4 h-4 text-yellow-500" />
                Live Activity
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-2 bg-gray-50 rounded">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Sarah</p>
                    <p className="text-xs text-gray-500">Editing App.css</p>
                  </div>
                  <span className="text-xs text-gray-400">now</span>
                </div>
                
                <div className="flex items-center gap-3 p-2 bg-gray-50 rounded">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Mike</p>
                    <p className="text-xs text-gray-500">Viewing preview</p>
                  </div>
                  <span className="text-xs text-gray-400">2m ago</span>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-200">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Code Changes</h4>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded"></div>
                    <span className="text-gray-600">+ Added useState import</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded"></div>
                    <span className="text-gray-600">~ Modified App component</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Terminal */}
          {isTerminalOpen && (
            <div className="h-48 bg-gray-900 text-green-400 border-t border-gray-700 p-4 font-mono text-sm">
              <div className="mb-2">$ npm start</div>
              <div>Starting development server...</div>
              <div>Compiled successfully!</div>
              <div>You can now view app in browser.</div>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-gray-400">$</span>
                <span className="animate-pulse">_</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
