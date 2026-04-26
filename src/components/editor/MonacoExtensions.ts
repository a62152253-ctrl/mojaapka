import * as monaco from 'monaco-editor'
import { languageConfigs } from './CodeEditorLanguages'

// Enhanced language registration with better support
export const registerLanguages = () => {
  // Register enhanced JavaScript/TypeScript support
  monaco.languages.register({ id: 'typescript', extensions: ['.ts', '.tsx'], aliases: ['TypeScript', 'ts', 'tsx'] })
  
  // Register PHP support
  monaco.languages.register({ id: 'php', extensions: ['.php', '.phtml', '.php3', '.php4', '.php5', '.phps'], aliases: ['PHP', 'php', 'phtml'] })
  
  // Register Python support
  monaco.languages.register({ id: 'python', extensions: ['.py', '.pyw', '.pyi'], aliases: ['Python', 'py', 'pyw', 'pyi'] })
  
  // Register Go support
  monaco.languages.register({ id: 'go', extensions: ['.go'], aliases: ['Go', 'go'] })
  
  // Register Rust support
  monaco.languages.register({ id: 'rust', extensions: ['.rs'], aliases: ['Rust', 'rs'] })
  
  // Register GraphQL support
  monaco.languages.register({ id: 'graphql', extensions: ['.graphql', '.gql'], aliases: ['GraphQL', 'graphql', 'gql'] })
  
  // Register YAML support
  monaco.languages.register({ id: 'yaml', extensions: ['.yml', '.yaml'], aliases: ['YAML', 'yml', 'yaml'] })
  
  // Register Dockerfile support
  monaco.languages.register({ id: 'dockerfile', extensions: ['Dockerfile', '.dockerignore'], aliases: ['Dockerfile', 'dockerfile'] })
  
  // Register Bash support
  monaco.languages.register({ id: 'shell', extensions: ['.sh', '.bash', '.zsh', '.fish'], aliases: ['Bash', 'Shell', 'sh', 'bash', 'zsh', 'fish'] })
}

// Enhanced theme definitions
export const defineCustomThemes = () => {
  // Dark theme with better contrast
  monaco.editor.defineTheme('devbloxi-dark', {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: 'comment', foreground: '6A9955', fontStyle: 'italic' },
      { token: 'keyword', foreground: '569CD6', fontStyle: 'bold' },
      { token: 'string', foreground: 'CE9178' },
      { token: 'number', foreground: 'B5CEA8' },
      { token: 'type', foreground: '4EC9B0' },
      { token: 'function', foreground: 'DCDCAA' },
      { token: 'variable', foreground: '9CDCFE' },
      { token: 'class', foreground: '4EC9B0', fontStyle: 'bold' },
      { token: 'interface', foreground: 'B8D7A3', fontStyle: 'bold' },
      { token: 'namespace', foreground: 'B8D7A3' },
      { token: 'parameter', foreground: '9CDCFE' },
      { token: 'property', foreground: '9CDCFE' },
      { token: 'annotation', foreground: '9CDCFE', fontStyle: 'italic' },
      { token: 'tag', foreground: '569CD6' },
      { token: 'attribute.name', foreground: '92C5F8' },
      { token: 'attribute.value', foreground: 'CE9178' },
      { token: 'delimiter', foreground: 'FFD700' },
      { token: 'delimiter.bracket', foreground: 'FFD700' },
      { token: 'delimiter.parenthesis', foreground: 'FFD700' },
      { token: 'delimiter.angle', foreground: 'FFD700' },
      { token: 'delimiter.square', foreground: 'FFD700' },
      { token: 'delimiter.curly', foreground: 'FFD700' },
      { token: 'operator', foreground: 'D4D4D4' },
      { token: 'operator.sql', foreground: 'FFD700', fontStyle: 'bold' },
      { token: 'operator.python', foreground: 'D4D4D4' },
      { token: 'operator.go', foreground: 'D4D4D4' },
      { token: 'operator.rust', foreground: 'D4D4D4' },
      { token: 'operator.php', foreground: 'D4D4D4' },
      { token: 'operator.bash', foreground: 'D4D4D4' },
      { token: 'operator.docker', foreground: 'D4D4D4' },
      { token: 'operator.yaml', foreground: 'D4D4D4' },
      { token: 'operator.graphql', foreground: 'D4D4D4' },
    ],
    colors: {
      'editor.background': '#1E1E1E',
      'editor.foreground': '#D4D4D4',
      'editorCursor.foreground': '#AEAFAD',
      'editor.lineHighlightBackground': '#2D2D30',
      'editorLineNumber.foreground': '#858585',
      'editor.selectionBackground': '#264F78',
      'editor.inactiveSelectionBackground': '#3A3D41',
      'editorIndentGuide.background': '#404040',
      'editorIndentGuide.activeBackground': '#707070',
      'editorWhitespace.foreground': '#404040',
    }
  })

  // Light theme with better contrast
  monaco.editor.defineTheme('devbloxi-light', {
    base: 'vs',
    inherit: true,
    rules: [
      { token: 'comment', foreground: '008000', fontStyle: 'italic' },
      { token: 'keyword', foreground: '0000FF', fontStyle: 'bold' },
      { token: 'string', foreground: 'A31515' },
      { token: 'number', foreground: '098658' },
      { token: 'type', foreground: '267F99' },
      { token: 'function', foreground: '795E26' },
      { token: 'variable', foreground: '001080' },
      { token: 'class', foreground: '267F99', fontStyle: 'bold' },
      { token: 'interface', foreground: '267F99', fontStyle: 'bold' },
      { token: 'namespace', foreground: '267F99' },
      { token: 'parameter', foreground: '001080' },
      { token: 'property', foreground: '001080' },
      { token: 'annotation', foreground: '001080', fontStyle: 'italic' },
      { token: 'tag', foreground: '800000' },
      { token: 'attribute.name', foreground: 'FF0000' },
      { token: 'attribute.value', foreground: '0000FF' },
      { token: 'delimiter', foreground: '000000' },
      { token: 'delimiter.bracket', foreground: '000000' },
      { token: 'delimiter.parenthesis', foreground: '000000' },
      { token: 'delimiter.angle', foreground: '000000' },
      { token: 'delimiter.square', foreground: '000000' },
      { token: 'delimiter.curly', foreground: '000000' },
      { token: 'operator', foreground: '000000' },
      { token: 'operator.sql', foreground: '0000FF', fontStyle: 'bold' },
      { token: 'operator.python', foreground: '000000' },
      { token: 'operator.go', foreground: '000000' },
      { token: 'operator.rust', foreground: '000000' },
      { token: 'operator.php', foreground: '000000' },
      { token: 'operator.bash', foreground: '000000' },
      { token: 'operator.docker', foreground: '000000' },
      { token: 'operator.yaml', foreground: '000000' },
      { token: 'operator.graphql', foreground: '000000' },
    ],
    colors: {
      'editor.background': '#FFFFFF',
      'editor.foreground': '#000000',
      'editorCursor.foreground': '#000000',
      'editor.lineHighlightBackground': '#F0F0F0',
      'editorLineNumber.foreground': '#237893',
      'editor.selectionBackground': '#ADD6FF',
      'editor.inactiveSelectionBackground': '#E5EBF1',
      'editorIndentGuide.background': '#D3D3D3',
      'editorIndentGuide.activeBackground': '#939393',
      'editorWhitespace.foreground': '#D3D3D3',
    }
  })

  // High contrast theme
  monaco.editor.defineTheme('devbloxi-high-contrast', {
    base: 'hc-black',
    inherit: true,
    rules: [
      { token: 'comment', foreground: '7CA668', fontStyle: 'italic' },
      { token: 'keyword', foreground: 'C586C0', fontStyle: 'bold' },
      { token: 'string', foreground: 'CE9178' },
      { token: 'number', foreground: 'B5CEA8' },
      { token: 'type', foreground: '4EC9B0' },
      { token: 'function', foreground: 'DCDCAA' },
      { token: 'variable', foreground: '9CDCFE' },
      { token: 'class', foreground: '4EC9B0', fontStyle: 'bold' },
      { token: 'interface', foreground: 'B8D7A3', fontStyle: 'bold' },
      { token: 'namespace', foreground: 'B8D7A3' },
      { token: 'parameter', foreground: '9CDCFE' },
      { token: 'property', foreground: '9CDCFE' },
      { token: 'annotation', foreground: '9CDCFE', fontStyle: 'italic' },
      { token: 'tag', foreground: '569CD6' },
      { token: 'attribute.name', foreground: '92C5F8' },
      { token: 'attribute.value', foreground: 'CE9178' },
      { token: 'delimiter', foreground: 'FFFFFF' },
      { token: 'delimiter.bracket', foreground: 'FFFFFF' },
      { token: 'delimiter.parenthesis', foreground: 'FFFFFF' },
      { token: 'delimiter.angle', foreground: 'FFFFFF' },
      { token: 'delimiter.square', foreground: 'FFFFFF' },
      { token: 'delimiter.curly', foreground: 'FFFFFF' },
      { token: 'operator', foreground: 'D4D4D4' },
      { token: 'operator.sql', foreground: 'FFFFFF', fontStyle: 'bold' },
      { token: 'operator.python', foreground: 'FFFFFF' },
      { token: 'operator.go', foreground: 'FFFFFF' },
      { token: 'operator.rust', foreground: 'FFFFFF' },
      { token: 'operator.php', foreground: 'FFFFFF' },
      { token: 'operator.bash', foreground: 'FFFFFF' },
      { token: 'operator.docker', foreground: 'FFFFFF' },
      { token: 'operator.yaml', foreground: 'FFFFFF' },
      { token: 'operator.graphql', foreground: 'FFFFFF' },
    ],
    colors: {
      'editor.background': '#000000',
      'editor.foreground': '#FFFFFF',
      'editorCursor.foreground': '#FFFFFF',
      'editor.lineHighlightBackground': '#2D2D30',
      'editorLineNumber.foreground': '#FFFFFF',
      'editor.selectionBackground': '#264F78',
      'editor.inactiveSelectionBackground': '#3A3D41',
      'editorIndentGuide.background': '#404040',
      'editorIndentGuide.activeBackground': '#707070',
      'editorWhitespace.foreground': '#FFFFFF',
    }
  })
}

// Get theme by name
export const getThemeByName = (themeName: string): string => {
  const themes = {
    'dark': 'devbloxi-dark',
    'light': 'devbloxi-light',
    'high-contrast': 'devbloxi-high-contrast',
    'vs-dark': 'devbloxi-dark',
    'vs': 'devbloxi-light',
    'hc-black': 'devbloxi-high-contrast'
  }
  
  return themes[themeName as keyof typeof themes] || 'devbloxi-dark'
}

// Enhanced language detection
export const detectLanguage = (filename: string, content?: string): string => {
  // First try by extension
  const extension = filename.toLowerCase().split('.').pop()
  if (extension) {
    const config = languageConfigs.find(lang => 
      lang.extensions.includes(`.${extension}`)
    )
    if (config) return config.id
  }
  
  // Then try by content if provided
  if (content) {
    const contentLower = content.toLowerCase()
    
    // HTML detection
    if (contentLower.includes('<!doctype') || contentLower.includes('<html')) return 'html'
    
    // PHP detection
    if (contentLower.includes('<?php')) return 'php'
    
    // Python detection
    if (contentLower.includes('def ') || contentLower.includes('import ') || contentLower.includes('from ')) return 'python'
    
    // Go detection
    if (contentLower.includes('package main') || contentLower.includes('func main()')) return 'go'
    
    // Rust detection
    if (contentLower.includes('fn main()') || contentLower.includes('use std::')) return 'rust'
    
    // GraphQL detection
    if (contentLower.includes('type ') && contentLower.includes('{')) return 'graphql'
    
    // YAML detection
    if (contentLower.includes(': ') && contentLower.includes('- ')) return 'yaml'
    
    // Dockerfile detection
    if (filename.toLowerCase().includes('dockerfile') || contentLower.includes('from ')) return 'dockerfile'
    
    // Bash detection
    if (contentLower.includes('#!/bin/bash') || contentLower.includes('#!/bin/sh')) return 'bash'
    
    // SQL detection
    if (contentLower.includes('select ') || contentLower.includes('insert ') || contentLower.includes('update ')) return 'sql'
    
    // JSON detection
    if (content.trim().startsWith('{') && content.trim().endsWith('}')) return 'json'
    
    // XML detection
    if (contentLower.includes('<?xml') || contentLower.includes('<root>')) return 'xml'
    
    // Markdown detection
    if (contentLower.includes('# ') || contentLower.includes('## ')) return 'markdown'
    
    // JavaScript/TypeScript detection
    if (contentLower.includes('function ') || contentLower.includes('const ') || contentLower.includes('let ') || contentLower.includes('var ')) {
      return contentLower.includes(': ') && contentLower.includes('interface ') ? 'typescript' : 'javascript'
    }
    
    // CSS detection
    if (contentLower.includes('{') && contentLower.includes(':') && contentLower.includes(';')) return 'css'
  }
  
  return 'plaintext'
}

// Initialize Monaco with enhanced features
export const initializeMonaco = () => {
  registerLanguages()
  defineCustomThemes()
}

// Export language configurations for external use
export { languageConfigs } from './CodeEditorLanguages'

// Export monacoExtensions object for compatibility
export const monacoExtensions = {
  setupAllExtensions: initializeMonaco
}
