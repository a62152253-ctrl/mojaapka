import { useState, useRef, useEffect } from 'react'
import { Terminal, Play, Pause, RotateCcw, Trash2, Copy, Download, ChevronDown, ChevronUp } from 'lucide-react'

interface ConsoleMessage {
  id: string
  type: 'log' | 'error' | 'warn' | 'info' | 'debug'
  content: string
  timestamp: Date
  source?: string
}

interface DebugConsoleProps {
  messages?: ConsoleMessage[]
  onClear?: () => void
  onMessage?: (message: ConsoleMessage) => void
  height?: string
  maxHeight?: string
  showTimestamp?: boolean
  showSource?: boolean
}

export default function DebugConsole({ 
  messages = [], 
  onClear, 
  onMessage,
  height = '200px',
  maxHeight = '400px',
  showTimestamp = true,
  showSource = true
}: DebugConsoleProps) {
  const [consoleMessages, setConsoleMessages] = useState<ConsoleMessage[]>(messages)
  const [input, setInput] = useState('')
  const [isExpanded, setIsExpanded] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [filter, setFilter] = useState<string>('')
  const [selectedType, setSelectedType] = useState<string>('all')
  const consoleRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setConsoleMessages(messages)
  }, [messages])

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    if (consoleRef.current && !isPaused) {
      consoleRef.current.scrollTop = consoleRef.current.scrollHeight
    }
  }, [consoleMessages, isPaused])

  const addMessage = (type: ConsoleMessage['type'], content: string, source?: string) => {
    const newMessage: ConsoleMessage = {
      id: Date.now().toString(),
      type,
      content,
      timestamp: new Date(),
      source
    }
    
    const updatedMessages = [...consoleMessages, newMessage]
    setConsoleMessages(updatedMessages)
    onMessage?.(newMessage)
  }

  const handleInputSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (input.trim()) {
      try {
        // Try to evaluate the input
        const result = eval(input)
        addMessage('log', `> ${input}`, 'console')
        addMessage('log', String(result), 'result')
      } catch (error) {
        addMessage('error', `> ${input}`, 'console')
        addMessage('error', String(error), 'error')
      }
      setInput('')
    }
  }

  const clearConsole = () => {
    setConsoleMessages([])
    onClear?.()
  }

  const exportConsole = () => {
    const exportData = consoleMessages.map(msg => ({
      timestamp: msg.timestamp.toISOString(),
      type: msg.type,
      source: msg.source,
      content: msg.content
    }))
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `console-export-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const copyToClipboard = () => {
    const text = consoleMessages.map(msg => {
      const prefix = showTimestamp ? `[${msg.timestamp.toLocaleTimeString()}]` : ''
      const source = showSource && msg.source ? ` [${msg.source}]` : ''
      return `${prefix}${source} [${msg.type.toUpperCase()}] ${msg.content}`
    }).join('\n')
    
    navigator.clipboard.writeText(text)
  }

  const getMessageColor = (type: ConsoleMessage['type']) => {
    switch (type) {
      case 'log': return 'text-gray-300'
      case 'error': return 'text-red-400'
      case 'warn': return 'text-yellow-400'
      case 'info': return 'text-blue-400'
      case 'debug': return 'text-purple-400'
      default: return 'text-gray-300'
    }
  }

  const getMessageIcon = (type: ConsoleMessage['type']) => {
    switch (type) {
      case 'log': return '•'
      case 'error': return '❌'
      case 'warn': return '⚠️'
      case 'info': return 'ℹ️'
      case 'debug': return '🐛'
      default: return '•'
    }
  }

  const filteredMessages = consoleMessages.filter(msg => {
    const matchesFilter = filter === '' || msg.content.toLowerCase().includes(filter.toLowerCase())
    const matchesType = selectedType === 'all' || msg.type === selectedType
    return matchesFilter && matchesType
  })

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gray-800 px-4 py-2 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1">
            <Terminal className="w-4 h-4 text-gray-400" />
            <span className="text-white text-sm font-medium">Debug Console</span>
            <span className="text-gray-500 text-xs">({filteredMessages.length})</span>
          </div>
          
          {/* Type Filter */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="bg-gray-700 text-gray-300 text-xs px-2 py-1 rounded border border-gray-600"
          >
            <option value="all">All</option>
            <option value="log">Log</option>
            <option value="error">Error</option>
            <option value="warn">Warning</option>
            <option value="info">Info</option>
            <option value="debug">Debug</option>
          </select>
        </div>

        <div className="flex items-center space-x-2">
          {/* Filter Input */}
          <input
            type="text"
            placeholder="Filter..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="bg-gray-700 text-gray-300 text-xs px-2 py-1 rounded border border-gray-600 w-24"
          />
          
          {/* Action Buttons */}
          <button
            onClick={() => setIsPaused(!isPaused)}
            className={`p-1 rounded ${isPaused ? 'bg-yellow-600 text-white' : 'bg-gray-700 text-gray-300'} hover:bg-gray-600`}
            title={isPaused ? 'Resume' : 'Pause'}
          >
            {isPaused ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
          </button>
          
          <button
            onClick={clearConsole}
            className="p-1 bg-gray-700 text-gray-300 hover:bg-gray-600 rounded"
            title="Clear"
          >
            <Trash2 className="w-3 h-3" />
          </button>
          
          <button
            onClick={copyToClipboard}
            className="p-1 bg-gray-700 text-gray-300 hover:bg-gray-600 rounded"
            title="Copy"
          >
            <Copy className="w-3 h-3" />
          </button>
          
          <button
            onClick={exportConsole}
            className="p-1 bg-gray-700 text-gray-300 hover:bg-gray-600 rounded"
            title="Export"
          >
            <Download className="w-3 h-3" />
          </button>
          
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 bg-gray-700 text-gray-300 hover:bg-gray-600 rounded"
            title={isExpanded ? 'Collapse' : 'Expand'}
          >
            {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        </div>
      </div>

      {/* Console Output */}
      <div
        ref={consoleRef}
        className="bg-black font-mono text-xs overflow-y-auto"
        style={{ 
          height: isExpanded ? maxHeight : height,
          maxHeight: maxHeight
        }}
      >
        {filteredMessages.length === 0 ? (
          <div className="p-4 text-gray-500 text-center">
            No messages yet. Type JavaScript code below to execute.
          </div>
        ) : (
          filteredMessages.map((message) => (
            <div key={message.id} className="flex items-start space-x-2 px-2 py-1 hover:bg-gray-800">
              <span className={getMessageColor(message.type)}>
                {getMessageIcon(message.type)}
              </span>
              <div className="flex-1">
                {showTimestamp && (
                  <span className="text-gray-500 mr-2">
                    [{message.timestamp.toLocaleTimeString()}]
                  </span>
                )}
                {showSource && message.source && (
                  <span className="text-gray-500 mr-2">
                    [{message.source}]
                  </span>
                )}
                <span className={getMessageColor(message.type)}>
                  {message.content}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Input */}
      <form onSubmit={handleInputSubmit} className="bg-gray-800 border-t border-gray-700 p-2">
        <div className="flex items-center space-x-2">
          <div className="flex-1 flex items-center space-x-2">
            <span className="text-gray-400 text-xs">{'>'}</span>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Enter JavaScript code to execute..."
              className="flex-1 bg-gray-900 text-gray-300 text-xs px-2 py-1 rounded border border-gray-600 focus:outline-none focus:border-blue-500"
            />
          </div>
          <button
            type="submit"
            className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
          >
            <Play className="w-3 h-3" />
          </button>
        </div>
      </form>
    </div>
  )
}
