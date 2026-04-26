import React, { useState } from 'react'
import { X, FileText, Code, Database, Terminal, Cpu, Package, GitBranch, FileJson, FileX, File } from 'lucide-react'
import { languageConfigs } from './CodeEditorLanguages'
import getLanguageByExtension from './CodeEditorLanguages'

interface FileCreatorProps {
  onCreateFile: (name: string, content: string, language: string) => void
  onCancel: () => void
  initialName?: string
}

const FileCreator: React.FC<FileCreatorProps> = ({
  onCreateFile,
  onCancel,
  initialName = ''
}) => {
  const [filename, setFilename] = useState(initialName)
  const [selectedLanguage, setSelectedLanguage] = useState('javascript')
  const [searchTerm, setSearchTerm] = useState('')

  // Auto-detect language from filename
  React.useEffect(() => {
    if (filename) {
      const detectedLanguage = getLanguageByExtension(filename)
      setSelectedLanguage(detectedLanguage)
    }
  }, [filename])

  // Filter languages
  const filteredLanguages = languageConfigs.filter(lang =>
    lang.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lang.id.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Language icons
  const languageIcons: Record<string, React.ReactNode> = {
    'html': <FileText className="w-4 h-4 text-orange-500" />,
    'css': <FileText className="w-4 h-4 text-blue-500" />,
    'javascript': <Code className="w-4 h-4 text-yellow-500" />,
    'typescript': <Code className="w-4 h-4 text-blue-600" />,
    'php': <Database className="w-4 h-4 text-purple-500" />,
    'python': <Terminal className="w-4 h-4 text-green-500" />,
    'go': <Cpu className="w-4 h-4 text-cyan-500" />,
    'rust': <Package className="w-4 h-4 text-orange-600" />,
    'json': <FileJson className="w-4 h-4 text-blue-400" />,
    'xml': <FileX className="w-4 h-4 text-orange-400" />,
    'sql': <Database className="w-4 h-4 text-red-500" />,
    'markdown': <FileText className="w-4 h-4 text-gray-500" />,
    'yaml': <FileText className="w-4 h-4 text-purple-400" />,
    'dockerfile': <Package className="w-4 h-4 text-blue-500" />,
    'bash': <Terminal className="w-4 h-4 text-gray-600" />,
    'graphql': <GitBranch className="w-4 h-4 text-pink-500" />,
    'plaintext': <File className="w-4 h-4 text-gray-400" />
  }

  const handleCreate = () => {
    if (!filename.trim()) return

    const language = languageConfigs.find(lang => lang.id === selectedLanguage)
    const content = language?.defaultContent || ''

    onCreateFile(filename, content, selectedLanguage)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleCreate()
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Create New File</h2>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Filename Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filename
            </label>
            <input
              type="text"
              value={filename}
              onChange={(e) => setFilename(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Enter filename..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              autoFocus
            />
          </div>

          {/* Language Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Language
            </label>
            <div className="border border-gray-300 rounded-lg overflow-hidden">
              {/* Selected Language */}
              <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 border-b border-gray-200">
                {languageIcons[selectedLanguage] || languageIcons.plaintext}
                <span className="text-sm font-medium">
                  {languageConfigs.find(lang => lang.id === selectedLanguage)?.name || 'Plain Text'}
                </span>
              </div>

              {/* Search */}
              <div className="p-2 border-b border-gray-200">
                <input
                  type="text"
                  placeholder="Search languages..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Language List */}
              <div className="max-h-48 overflow-y-auto">
                {filteredLanguages.length > 0 ? (
                  filteredLanguages.map((language) => (
                    <button
                      key={language.id}
                      onClick={() => setSelectedLanguage(language.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-gray-50 transition-colors ${
                        selectedLanguage === language.id ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                      }`}
                    >
                      {languageIcons[language.id] || languageIcons.plaintext}
                      <div className="flex-1 text-left">
                        <div className="font-medium">{language.name}</div>
                        <div className="text-xs text-gray-500">
                          {language.extensions.slice(0, 3).join(', ')}
                          {language.extensions.length > 3 && '...'}
                        </div>
                      </div>
                      {selectedLanguage === language.id && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      )}
                    </button>
                  ))
                ) : (
                  <div className="px-3 py-4 text-sm text-gray-500 text-center">
                    No languages found
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* File Info */}
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="text-xs text-gray-600">
              <div className="flex items-center gap-2 mb-1">
                <File className="w-3 h-3" />
                <span>File: {filename || 'untitled'}</span>
              </div>
              <div className="flex items-center gap-2">
                {languageIcons[selectedLanguage] || languageIcons.plaintext}
                <span>Language: {languageConfigs.find(lang => lang.id === selectedLanguage)?.name || 'Plain Text'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={!filename.trim()}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Create File
          </button>
        </div>
      </div>
    </div>
  )
}

export default FileCreator
