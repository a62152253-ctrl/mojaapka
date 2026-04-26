import React, { useState } from 'react'
import { ChevronDown, Code, FileText, Database, Terminal, Cpu, Package, GitBranch, FileJson, FileX, File } from 'lucide-react'
import { languageConfigs } from './CodeEditorLanguages'
import getLanguageByExtension from './CodeEditorLanguages'

interface LanguageSelectorProps {
  selectedLanguage: string
  onLanguageChange: (language: string) => void
  filename?: string
  disabled?: boolean
}

// Language icons mapping
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

const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  selectedLanguage,
  onLanguageChange,
  filename = '',
  disabled = false
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  // Auto-detect language from filename
  React.useEffect(() => {
    if (filename && !selectedLanguage) {
      const detectedLanguage = getLanguageByExtension(filename)
      if (detectedLanguage !== 'plaintext') {
        onLanguageChange(detectedLanguage)
      }
    }
  }, [filename, selectedLanguage, onLanguageChange])

  // Filter languages based on search
  const filteredLanguages = languageConfigs.filter(lang =>
    lang.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lang.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lang.aliases.some(alias => alias.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  // Get current language config
  const currentLanguage = languageConfigs.find(lang => lang.id === selectedLanguage)

  const handleLanguageSelect = (languageId: string) => {
    onLanguageChange(languageId)
    setIsOpen(false)
    setSearchTerm('')
  }

  return (
    <div className="relative">
      {/* Trigger */}
      <button
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`flex items-center gap-2 px-3 py-2 text-sm border rounded-lg transition-colors ${
          disabled
            ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
            : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400 hover:bg-gray-50'
        }`}
      >
        {/* Language Icon */}
        {languageIcons[selectedLanguage] || languageIcons.plaintext}
        
        {/* Language Name */}
        <span className="font-medium">
          {currentLanguage?.name || 'Plain Text'}
        </span>
        
        {/* Dropdown Arrow */}
        {!disabled && (
          <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        )}
      </button>

      {/* Dropdown */}
      {isOpen && !disabled && (
        <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          {/* Search */}
          <div className="p-3 border-b border-gray-200">
            <input
              type="text"
              placeholder="Search languages..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              autoFocus
            />
          </div>

          {/* Language List */}
          <div className="max-h-64 overflow-y-auto">
            {filteredLanguages.length > 0 ? (
              filteredLanguages.map((language) => (
                <button
                  key={language.id}
                  onClick={() => handleLanguageSelect(language.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-gray-50 transition-colors ${
                    selectedLanguage === language.id ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                  }`}
                >
                  {/* Language Icon */}
                  {languageIcons[language.id] || languageIcons.plaintext}
                  
                  {/* Language Info */}
                  <div className="flex-1 text-left">
                    <div className="font-medium">{language.name}</div>
                    <div className="text-xs text-gray-500">
                      {language.extensions.slice(0, 3).join(', ')}
                      {language.extensions.length > 3 && '...'}
                    </div>
                  </div>
                  
                  {/* Selected Indicator */}
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

          {/* Footer */}
          <div className="p-2 border-t border-gray-200">
            <div className="text-xs text-gray-500 text-center">
              {languageConfigs.length} languages supported
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default LanguageSelector
