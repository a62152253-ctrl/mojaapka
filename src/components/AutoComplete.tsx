import { useState, useEffect, useRef } from 'react'
import { Code, FileText, Database, Globe, Smartphone, Palette, Cpu } from 'lucide-react'

interface Suggestion {
  label: string
  type: 'keyword' | 'function' | 'variable' | 'snippet' | 'property'
  insertText: string
  description?: string
}

interface AutoCompleteProps {
  value: string
  language: string
  position: { line: number; column: number }
  onSelect: (suggestion: Suggestion) => void
  visible: boolean
  onClose: () => void
}

export default function AutoComplete({ 
  value, 
  language, 
  position, 
  onSelect, 
  visible, 
  onClose 
}: AutoCompleteProps) {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [filteredSuggestions, setFilteredSuggestions] = useState<Suggestion[]>([])
  const containerRef = useRef<HTMLDivElement>(null)

  const suggestions: Record<string, Suggestion[]> = {
    javascript: [
      { label: 'function', type: 'keyword', insertText: 'function ${1}() {\n\t${2}\n}', description: 'Function declaration' },
      { label: 'const', type: 'keyword', insertText: 'const ${1} = ${2}', description: 'Constant declaration' },
      { label: 'let', type: 'keyword', insertText: 'let ${1} = ${2}', description: 'Variable declaration' },
      { label: 'if', type: 'keyword', insertText: 'if (${1}) {\n\t${2}\n}', description: 'Conditional statement' },
      { label: 'for', type: 'keyword', insertText: 'for (let i = 0; i < ${1}; i++) {\n\t${2}\n}', description: 'For loop' },
      { label: 'forEach', type: 'function', insertText: '.forEach((${1}) => {\n\t${2}\n})', description: 'Array forEach method' },
      { label: 'map', type: 'function', insertText: '.map((${1}) => ${2})', description: 'Array map method' },
      { label: 'filter', type: 'function', insertText: '.filter((${1}) => ${2})', description: 'Array filter method' },
      { label: 'console.log', type: 'function', insertText: 'console.log(${1})', description: 'Log to console' },
      { label: 'async', type: 'keyword', insertText: 'async function ${1}() {\n\t${2}\n}', description: 'Async function' },
      { label: 'await', type: 'keyword', insertText: 'await ${1}', description: 'Await expression' },
      { label: 'try', type: 'keyword', insertText: 'try {\n\t${1}\n} catch (error) {\n\t${2}\n}', description: 'Try-catch block' },
      { label: 'import', type: 'keyword', insertText: 'import ${1} from "${2}"', description: 'Import statement' },
      { label: 'export', type: 'keyword', insertText: 'export default ${1}', description: 'Export default' }
    ],
    typescript: [
      { label: 'interface', type: 'keyword', insertText: 'interface ${1} {\n\t${2}\n}', description: 'Interface definition' },
      { label: 'type', type: 'keyword', insertText: 'type ${1} = ${2}', description: 'Type alias' },
      { label: 'enum', type: 'keyword', insertText: 'enum ${1} {\n\t${2}\n}', description: 'Enum definition' },
      { label: 'class', type: 'keyword', insertText: 'class ${1} {\n\t${2}\n}', description: 'Class definition' },
      { label: 'public', type: 'keyword', insertText: 'public ${1}: ${2}', description: 'Public property' },
      { label: 'private', type: 'keyword', insertText: 'private ${1}: ${2}', description: 'Private property' },
      { label: 'protected', type: 'keyword', insertText: 'protected ${1}: ${2}', description: 'Protected property' },
      { label: 'readonly', type: 'keyword', insertText: 'readonly ${1}: ${2}', description: 'Readonly property' },
      { label: 'as', type: 'keyword', insertText: 'as ${1}', description: 'Type assertion' },
      { label: 'implements', type: 'keyword', insertText: 'implements ${1}', description: 'Implements interface' },
      { label: 'extends', type: 'keyword', insertText: 'extends ${1}', description: 'Extend class/interface' }
    ],
    html: [
      { label: 'div', type: 'snippet', insertText: '<div>${1}</div>', description: 'Division element' },
      { label: 'span', type: 'snippet', insertText: '<span>${1}</span>', description: 'Span element' },
      { label: 'p', type: 'snippet', insertText: '<p>${1}</p>', description: 'Paragraph element' },
      { label: 'h1', type: 'snippet', insertText: '<h1>${1}</h1>', description: 'Heading 1' },
      { label: 'h2', type: 'snippet', insertText: '<h2>${1}</h2>', description: 'Heading 2' },
      { label: 'h3', type: 'snippet', insertText: '<h3>${1}</h3>', description: 'Heading 3' },
      { label: 'a', type: 'snippet', insertText: '<a href="${1}">${2}</a>', description: 'Anchor link' },
      { label: 'img', type: 'snippet', insertText: '<img src="${1}" alt="${2}" />', description: 'Image element' },
      { label: 'button', type: 'snippet', insertText: '<button>${1}</button>', description: 'Button element' },
      { label: 'input', type: 'snippet', insertText: '<input type="${1}" placeholder="${2}" />', description: 'Input element' },
      { label: 'form', type: 'snippet', insertText: '<form>${1}</form>', description: 'Form element' },
      { label: 'ul', type: 'snippet', insertText: '<ul>\n\t<li>${1}</li>\n</ul>', description: 'Unordered list' },
      { label: 'ol', type: 'snippet', insertText: '<ol>\n\t<li>${1}</li>\n</ol>', description: 'Ordered list' },
      { label: 'table', type: 'snippet', insertText: '<table>\n\t<tr>\n\t\t<td>${1}</td>\n\t</tr>\n</table>', description: 'Table element' },
      { label: 'nav', type: 'snippet', insertText: '<nav>${1}</nav>', description: 'Navigation element' },
      { label: 'header', type: 'snippet', insertText: '<header>${1}</header>', description: 'Header element' },
      { label: 'footer', type: 'snippet', insertText: '<footer>${1}</footer>', description: 'Footer element' },
      { label: 'section', type: 'snippet', insertText: '<section>${1}</section>', description: 'Section element' },
      { label: 'article', type: 'snippet', insertText: '<article>${1}</article>', description: 'Article element' }
    ],
    css: [
      { label: 'display', type: 'property', insertText: 'display: ${1};', description: 'Display property' },
      { label: 'position', type: 'property', insertText: 'position: ${1};', description: 'Position property' },
      { label: 'width', type: 'property', insertText: 'width: ${1};', description: 'Width property' },
      { label: 'height', type: 'property', insertText: 'height: ${1};', description: 'Height property' },
      { label: 'margin', type: 'property', insertText: 'margin: ${1};', description: 'Margin property' },
      { label: 'padding', type: 'property', insertText: 'padding: ${1};', description: 'Padding property' },
      { label: 'background', type: 'property', insertText: 'background: ${1};', description: 'Background property' },
      { label: 'color', type: 'property', insertText: 'color: ${1};', description: 'Color property' },
      { label: 'font-size', type: 'property', insertText: 'font-size: ${1};', description: 'Font size property' },
      { label: 'border', type: 'property', insertText: 'border: ${1};', description: 'Border property' },
      { label: 'border-radius', type: 'property', insertText: 'border-radius: ${1};', description: 'Border radius property' },
      { label: 'box-shadow', type: 'property', insertText: 'box-shadow: ${1};', description: 'Box shadow property' },
      { label: 'transition', type: 'property', insertText: 'transition: ${1};', description: 'Transition property' },
      { label: 'transform', type: 'property', insertText: 'transform: ${1};', description: 'Transform property' },
      { label: 'opacity', type: 'property', insertText: 'opacity: ${1};', description: 'Opacity property' },
      { label: 'z-index', type: 'property', insertText: 'z-index: ${1};', description: 'Z-index property' },
      { label: 'flex', type: 'snippet', insertText: 'display: flex;\njustify-content: ${1};\nalign-items: ${2};', description: 'Flexbox layout' },
      { label: 'grid', type: 'snippet', insertText: 'display: grid;\ngrid-template-columns: ${1};\ngap: ${2};', description: 'Grid layout' },
      { label: '@media', type: 'snippet', insertText: '@media (${1}) {\n\t${2}\n}', description: 'Media query' },
      { label: '@keyframes', type: 'snippet', insertText: '@keyframes ${1} {\n\t${2}\n}', description: 'Keyframes animation' }
    ]
  }

  useEffect(() => {
    if (!visible || !value) {
      setFilteredSuggestions([])
      return
    }

    const word = value.trim().toLowerCase()
    const languageSuggestions = suggestions[language] || []
    
    const filtered = languageSuggestions.filter(suggestion =>
      suggestion.label.toLowerCase().includes(word)
    ).slice(0, 10)

    setFilteredSuggestions(filtered)
    setSelectedIndex(0)
  }, [value, language, visible])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    if (visible) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [visible, onClose])

  const handleKeyDown = (e: KeyboardEvent) => {
    if (!visible) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev => (prev + 1) % filteredSuggestions.length)
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => (prev - 1 + filteredSuggestions.length) % filteredSuggestions.length)
        break
      case 'Enter':
        e.preventDefault()
        if (filteredSuggestions[selectedIndex]) {
          onSelect(filteredSuggestions[selectedIndex])
        }
        break
      case 'Escape':
        e.preventDefault()
        onClose()
        break
    }
  }

  useEffect(() => {
    if (visible) {
      document.addEventListener('keydown', handleKeyDown)
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [visible, selectedIndex, filteredSuggestions])

  const getSuggestionIcon = (type: Suggestion['type']) => {
    switch (type) {
      case 'keyword':
        return <Code className="w-4 h-4 text-blue-400" />
      case 'function':
        return <FileText className="w-4 h-4 text-green-400" />
      case 'variable':
        return <Database className="w-4 h-4 text-purple-400" />
      case 'snippet':
        return <Palette className="w-4 h-4 text-orange-400" />
      case 'property':
        return <Database className="w-4 h-4 text-purple-400" />
      default:
        return <Code className="w-4 h-4 text-gray-400" />
    }
  }

  if (!visible || filteredSuggestions.length === 0) {
    return null
  }

  return (
    <div
      ref={containerRef}
      className="absolute z-50 bg-gray-800 border border-gray-700 rounded-lg shadow-lg max-h-64 overflow-y-auto"
      style={{
        top: `${position.line * 20}px`,
        left: `${position.column * 8}px`
      }}
    >
      {filteredSuggestions.map((suggestion, index) => (
        <div
          key={suggestion.label}
          className={`flex items-center space-x-2 px-3 py-2 cursor-pointer transition-colors ${
            index === selectedIndex
              ? 'bg-blue-600 text-white'
              : 'text-gray-300 hover:bg-gray-700'
          }`}
          onClick={() => onSelect(suggestion)}
        >
          {getSuggestionIcon(suggestion.type)}
          <div className="flex-1">
            <div className="font-medium">{suggestion.label}</div>
            {suggestion.description && (
              <div className="text-xs opacity-75">{suggestion.description}</div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
