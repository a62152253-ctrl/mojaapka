import * as monaco from 'monaco-editor'

// ESLint integration for Monaco Editor
export class ESLintIntegration {
  private static instance: ESLintIntegration
  private lintResults: Map<string, any[]> = new Map()
  
  static getInstance(): ESLintIntegration {
    if (!ESLintIntegration.instance) {
      ESLintIntegration.instance = new ESLintIntegration()
    }
    return ESLintIntegration.instance
  }

  // Basic ESLint rules configuration
  private getESLintConfig() {
    return {
      env: {
        browser: true,
        es2021: true,
        node: true
      },
      extends: [
        'eslint:recommended'
      ],
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true
        }
      },
      rules: {
        // Error rules
        'no-unused-vars': 'error',
        'no-undef': 'error',
        'no-unreachable': 'error',
        'no-console': 'warn',
        'no-debugger': 'error',
        'no-duplicate-imports': 'error',
        'no-var': 'error',
        'prefer-const': 'error',
        'no-multiple-empty-lines': 'warn',
        'no-trailing-spaces': 'warn',
        
        // Style rules
        'indent': ['warn', 2],
        'quotes': ['warn', 'single'],
        'semi': ['warn', 'always'],
        'comma-dangle': ['warn', 'never'],
        'object-curly-spacing': ['warn', 'always'],
        'array-bracket-spacing': ['warn', 'never'],
        
        // React specific rules (if enabled)
        'react/prop-types': 'off',
        'react/react-in-jsx-scope': 'off'
      },
      globals: {
        React: 'readonly',
        useState: 'readonly',
        useEffect: 'readonly',
        useRef: 'readonly',
        useCallback: 'readonly',
        useMemo: 'readonly',
        console: 'readonly',
        document: 'readonly',
        window: 'readonly',
        localStorage: 'readonly',
        sessionStorage: 'readonly',
        fetch: 'readonly'
      }
    }
  }

  // Simple ESLint-like linter (basic implementation)
  private lintCode(code: string, language: string): any[] {
    const errors: any[] = []
    const lines = code.split('\n')

    // Basic JavaScript/TypeScript linting
    if (language === 'javascript' || language === 'typescript') {
      lines.forEach((line, index) => {
        const lineNumber = index + 1
        const trimmedLine = line.trim()

        // Check for unused variables (basic)
        if (trimmedLine.startsWith('const ') || trimmedLine.startsWith('let ')) {
          const varName = trimmedLine.split('=')[0].replace(/^(const|let)\s+/, '').trim()
          const varUsage = code.match(new RegExp(`\\b${varName}\\b`, 'g'))
          if (varUsage && varUsage.length <= 1) {
            errors.push({
              line: lineNumber,
              column: line.indexOf(varName) + 1,
              message: `'${varName}' is assigned a value but never used.`,
              severity: 'warning',
              source: 'eslint'
            })
          }
        }

        // Check for console.log
        if (trimmedLine.includes('console.log')) {
          errors.push({
            line: lineNumber,
            column: line.indexOf('console.log') + 1,
            message: 'Unexpected console statement.',
            severity: 'warning',
            source: 'eslint'
          })
        }

        // Check for debugger
        if (trimmedLine.includes('debugger')) {
          errors.push({
            line: lineNumber,
            column: line.indexOf('debugger') + 1,
            message: 'Unexpected \'debugger\' statement.',
            severity: 'error',
            source: 'eslint'
          })
        }

        // Check for semicolons
        if (trimmedLine && !trimmedLine.endsWith(';') && 
            !trimmedLine.startsWith('//') && 
            !trimmedLine.startsWith('/*') &&
            !trimmedLine.endsWith('{') &&
            !trimmedLine.endsWith('}') &&
            !trimmedLine.includes('if ') &&
            !trimmedLine.includes('for ') &&
            !trimmedLine.includes('while ') &&
            !trimmedLine.includes('function ') &&
            !trimmedLine.includes('=>')) {
          errors.push({
            line: lineNumber,
            column: line.length,
            message: 'Missing semicolon.',
            severity: 'warning',
            source: 'eslint'
          })
        }

        // Check for unused imports
        if (trimmedLine.startsWith('import ')) {
          const importMatch = trimmedLine.match(/import\s+.*?\s+from\s+['"][^'"]+['"]/)
          if (importMatch) {
            const importStatement = importMatch[0]
            const namedImports = importStatement.match(/\{([^}]+)\}/)
            if (namedImports) {
              const imports = namedImports[1].split(',').map(imp => imp.trim().split(' as ')[0])
              imports.forEach(imp => {
                const usage = code.match(new RegExp(`\\b${imp}\\b`, 'g'))
                if (!usage || usage.length <= 1) {
                  errors.push({
                    line: lineNumber,
                    column: line.indexOf(imp) + 1,
                    message: `'${imp}' is defined but never used.`,
                    severity: 'warning',
                    source: 'eslint'
                  })
                }
              })
            }
          }
        }
      })
    }

    // Basic CSS linting
    if (language === 'css') {
      lines.forEach((line, index) => {
        const lineNumber = index + 1
        const trimmedLine = line.trim()

        // Check for missing semicolons
        if (trimmedLine.includes(':') && !trimmedLine.endsWith(';') && 
            !trimmedLine.endsWith('{') && !trimmedLine.startsWith('/*')) {
          errors.push({
            line: lineNumber,
            column: line.length,
            message: 'Expected semicolon.',
            severity: 'warning',
            source: 'stylelint'
          })
        }
      })
    }

    // Basic HTML linting
    if (language === 'html') {
      lines.forEach((line, index) => {
        const lineNumber = index + 1
        const trimmedLine = line.trim()

        // Check for unclosed tags (basic)
        const openTags = trimmedLine.match(/<(\w+)(?![^>]*\/)>/g)
        const closeTags = trimmedLine.match(/<\/(\w+)>/g)
        
        if (openTags && closeTags) {
          openTags.forEach(openTag => {
            const tagName = openTag.slice(1, -1)
            const hasCloseTag = closeTags.some(closeTag => closeTag.includes(`</${tagName}>`))
            if (!hasCloseTag && !['img', 'br', 'hr', 'input', 'meta', 'link'].includes(tagName)) {
              errors.push({
                line: lineNumber,
                column: line.indexOf(openTag) + 1,
                message: `Unclosed tag '<${tagName}>'.`,
                severity: 'warning',
                source: 'htmlhint'
              })
            }
          })
        }
      })
    }

    return errors
  }

  // Setup ESLint diagnostics in Monaco
  setupESLintDiagnostics(monaco: any) {
    // Create a diagnostics collection
    const diagnostics = monaco.editor.createModelMarkers ? 
      (uri: string, markers: any[]) => {
        monaco.editor.setModelMarkers(monaco.editor.getModel(monaco.Uri.parse(uri)), 'eslint', markers)
      } : 
      null

    // Register diagnostics provider
    monaco.languages.onLanguage('javascript', () => {
      this.setupLanguageDiagnostics(monaco, 'javascript', diagnostics)
    })

    monaco.languages.onLanguage('typescript', () => {
      this.setupLanguageDiagnostics(monaco, 'typescript', diagnostics)
    })

    monaco.languages.onLanguage('css', () => {
      this.setupLanguageDiagnostics(monaco, 'css', diagnostics)
    })

    monaco.languages.onLanguage('html', () => {
      this.setupLanguageDiagnostics(monaco, 'html', diagnostics)
    })
  }

  private setupLanguageDiagnostics(monaco: any, language: string, diagnostics: any) {
    // Listen for model changes
    monaco.editor.onDidCreateModel((model: any) => {
      if (model.getLanguageId() === language) {
        const updateDiagnostics = () => {
          const code = model.getValue()
          const errors = this.lintCode(code, language)
          
          if (diagnostics) {
            const markers = errors.map(error => ({
              severity: error.severity === 'error' ? monaco.MarkerSeverity.Error : 
                        error.severity === 'warning' ? monaco.MarkerSeverity.Warning : 
                        monaco.MarkerSeverity.Info,
              message: error.message,
              startLineNumber: error.line,
              startColumn: error.column,
              endLineNumber: error.line,
              endColumn: error.column + 1,
              source: error.source
            }))
            
            diagnostics(model.uri.toString(), markers)
          }
        }

        // Initial lint
        updateDiagnostics()

        // Update on content changes
        const disposable = model.onDidChangeContent(() => {
          // Debounce the linting
          setTimeout(updateDiagnostics, 500)
        })

        // Store disposable for cleanup
        this.lintResults.set(model.id, [disposable])
      }
    })
  }

  // Clear diagnostics for a model
  clearDiagnostics(model: any) {
    const disposables = this.lintResults.get(model.id)
    if (disposables) {
      disposables.forEach(d => d.dispose())
      this.lintResults.delete(model.id)
    }
  }

  // Get ESLint configuration
  getConfig() {
    return this.getESLintConfig()
  }

  // Run ESLint on demand
  async runLint(code: string, language: string): Promise<any[]> {
    return this.lintCode(code, language)
  }
}

// Export singleton instance
export const eslintIntegration = ESLintIntegration.getInstance()
