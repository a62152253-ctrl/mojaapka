import * as monaco from 'monaco-editor'

// Enhanced Monaco Editor Extensions
export class MonacoExtensions {
  private static instance: MonacoExtensions
  
  static getInstance(): MonacoExtensions {
    if (!MonacoExtensions.instance) {
      MonacoExtensions.instance = new MonacoExtensions()
    }
    return MonacoExtensions.instance
  }

  // Setup enhanced JavaScript/TypeScript support
  setupJavaScriptSupport(monaco: any) {
    // TypeScript configuration
    monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
      target: monaco.languages.typescript.ScriptTarget.ES2020,
      allowNonTsExtensions: true,
      moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
      module: monaco.languages.typescript.ModuleKind.ESNext,
      noEmit: true,
      esModuleInterop: true,
      jsx: monaco.languages.typescript.JsxEmit.React,
      reactNamespace: 'React',
      allowJs: true,
      typeRoots: ['node_modules/@types']
    })

    // Add React types
    monaco.languages.typescript.javascriptDefaults.addExtraLib(`
      declare module 'react' {
        export namespace React {
          interface FunctionComponent<P = {}> {
            (props: P): React.ReactElement | null
            displayName?: string
          }
          
          interface Component<P = {}, S = {}> {
            constructor(props: P)
            render(): React.ReactElement
            setState(state: Partial<S> | ((prevState: S, props: P) => Partial<S>), callback?: () => void): void
            forceUpdate(callback?: () => void): void
            props: Readonly<P>
            state: Readonly<S>
            context: any
            refs: any
          }
          
          interface ReactElement<P = {}> {
            type: string | ComponentType<P>
            props: P
            key: Key | null
          }
          
          interface ComponentType<P = {}> {
            (props: P): ReactElement | null
            displayName?: string
          }
          
          type Key = string | number | null
          type Ref<T> = ((instance: T | null) => void) | { current: T | null } | null
          type ComponentClass<P = {}> = { new (props: P): Component<P> }
          type StatelessComponent<P = {}> = FunctionComponent<P>
        }
        
        function createElement<P = {}>(
          type: string | ComponentType<P>,
          props?: Attributes & P,
          ...children: ReactNode[]
        ): ReactElement<P>
        
        function useState<S>(initialState: S | (() => S)): [S, Dispatch<SetStateAction<S>>]
        function useEffect(effect: () => void | (() => void), deps?: DependencyList): void
        function useRef<T>(initialValue: T): { current: T }
        function useCallback<T extends (...args: any[]) => any>(callback: T, deps: DependencyList): T
        function useMemo<T>(factory: () => T, deps: DependencyList): T
        
        type ReactNode = ReactElement | string | number | boolean | null | undefined
        type Attributes = { key?: Key; ref?: Ref<any> }
        type SetStateAction<S> = S | ((prevState: S) => S)
        type Dispatch<A> = (value: A) => void
        type DependencyList = ReadonlyArray<any>
        
        export default React
      }
    `, 'file:///node_modules/@types/react/index.d.ts')

    // Add DOM types
    monaco.languages.typescript.javascriptDefaults.addExtraLib(`
      declare global {
        interface Window {
          document: Document
          console: Console
          localStorage: Storage
          sessionStorage: Storage
          location: Location
          history: History
          navigator: Navigator
        }
        
        interface Document {
          querySelector(selector: string): Element | null
          querySelectorAll(selector: string): NodeListOf<Element>
          getElementById(id: string): HTMLElement | null
          createElement(tagName: string): HTMLElement
          addEventListener(type: string, listener: EventListener): void
        }
        
        interface HTMLElement {
          innerHTML: string
          innerText: string
          textContent: string
          style: CSSStyleDeclaration
          className: string
          id: string
          addEventListener(type: string, listener: EventListener): void
          removeEventListener(type: string, listener: EventListener): void
          click(): void
          focus(): void
          blur(): void
        }
        
        interface Console {
          log(...args: any[]): void
          error(...args: any[]): void
          warn(...args: any[]): void
          info(...args: any[]): void
          debug(...args: any[]): void
        }
        
        interface Storage {
          getItem(key: string): string | null
          setItem(key: string, value: string): void
          removeItem(key: string): void
          clear(): void
        }
      }
      
      export {}
    `, 'file:///node_modules/@types/dom/index.d.ts')
  }

  // Setup enhanced CSS support
  setupCSSSupport(monaco: any) {
    // CSS custom data for better autocomplete
    monaco.languages.registerCompletionItemProvider('css', {
      provideCompletionItems: (model: any, position: any) => {
        const word = model.getWordUntilPosition(position)
        const range = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: word.startColumn,
          endColumn: word.endColumn
        }

        const suggestions = [
          {
            label: 'display',
            kind: monaco.languages.CompletionItemKind.Property,
            insertText: 'display: ${1:flex};',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            range: range
          },
          {
            label: 'flex',
            kind: monaco.languages.CompletionItemKind.Property,
            insertText: 'flex: ${1:1};',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            range: range
          },
          {
            label: 'grid',
            kind: monaco.languages.CompletionItemKind.Property,
            insertText: 'grid: ${1:auto};',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            range: range
          },
          {
            label: 'position',
            kind: monaco.languages.CompletionItemKind.Property,
            insertText: 'position: ${1:relative};',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            range: range
          },
          {
            label: 'transform',
            kind: monaco.languages.CompletionItemKind.Property,
            insertText: 'transform: ${1:translateX(0)};',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            range: range
          },
          {
            label: 'transition',
            kind: monaco.languages.CompletionItemKind.Property,
            insertText: 'transition: ${1:all} ${2:0.3s} ${3:ease};',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            range: range
          },
          {
            label: 'animation',
            kind: monaco.languages.CompletionItemKind.Property,
            insertText: 'animation: ${1:name} ${2:2s} ${3:ease-in-out};',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            range: range
          }
        ]

        return { suggestions }
      }
    })
  }

  // Setup enhanced HTML support
  setupHTMLSupport(monaco: any) {
    monaco.languages.registerCompletionItemProvider('html', {
      provideCompletionItems: (model: any, position: any) => {
        const word = model.getWordUntilPosition(position)
        const range = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: word.startColumn,
          endColumn: word.endColumn
        }

        const suggestions = [
          {
            label: 'div',
            kind: monaco.languages.CompletionItemKind.Class,
            insertText: '<div class="${1:className}">${2}</div>',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            range: range
          },
          {
            label: 'button',
            kind: monaco.languages.CompletionItemKind.Class,
            insertText: '<button type="${1:button}" class="${2:btn}">${3}</button>',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            range: range
          },
          {
            label: 'input',
            kind: monaco.languages.CompletionItemKind.Class,
            insertText: '<input type="${1:text}" class="${2:form-control}" placeholder="${3}" />',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            range: range
          },
          {
            label: 'img',
            kind: monaco.languages.CompletionItemKind.Class,
            insertText: '<img src="${1}" alt="${2}" class="${3}" />',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            range: range
          },
          {
            label: 'link',
            kind: monaco.languages.CompletionItemKind.Class,
            insertText: '<link rel="stylesheet" href="${1}" />',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            range: range
          },
          {
            label: 'script',
            kind: monaco.languages.CompletionItemKind.Class,
            insertText: '<script src="${1}"></script>',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            range: range
          }
        ]

        return { suggestions }
      }
    })
  }

  // Setup error checking and linting
  setupErrorChecking(monaco: any) {
    // JavaScript error checking
    monaco.languages.registerDocumentSemanticTokensProvider('javascript', {
      getLegend: () => ({
        tokenTypes: ['function', 'variable', 'class', 'interface'],
        tokenModifiers: ['declaration', 'definition', 'readonly', 'static']
      }),
      provideDocumentSemanticTokens: (model: any) => {
        // Basic error detection
        const tokens: number[] = []
        const lines = model.getValue().split('\n')
        
        lines.forEach((line: string, lineIndex: number) => {
          // Check for common syntax errors
          if (line.includes('console.log') && !line.includes(';')) {
            tokens.push(
              lineIndex + 1,  // line
              line.indexOf('console.log'),  // start column
              'console.log'.length,  // length
              0,  // token type
              0   // token modifier
            )
          }
        })

        return { data: tokens }
      }
    })
  }

  // Setup custom snippets
  setupCustomSnippets(monaco: any) {
    // React snippets
    monaco.languages.registerCompletionItemProvider('javascript', {
      provideCompletionItems: (model: any, position: any) => {
        const word = model.getWordUntilPosition(position)
        const range = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: word.startColumn,
          endColumn: word.endColumn
        }

        const suggestions = [
          {
            label: 'react-component',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: 'import React from \'react\'\n\ninterface ComponentNameProps {\n  // props here\n}\n\nexport const ComponentName: React.FC<ComponentNameProps> = (props) => {\n  return (\n    <div>\n      // component content\n    </div>\n  )\n}\n\nexport default ComponentName',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            range: range
          },
          {
            label: 'react-hook',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: 'const [state, setState] = useState<type>(initialValue)',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            range: range
          },
          {
            label: 'react-effect',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: 'useEffect(() => {\n  // effect logic\n}, [dependencies])',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            range: range
          },
          {
            label: 'fetch-api',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: 'const fetchData = async () => {\n  try {\n    const response = await fetch(\'url\')\n    const data = await response.json()\n    // handle data\n  } catch (error) {\n    console.error(\'Error:\', error)\n  }\n}',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            range: range
          }
        ]

        return { suggestions }
      }
    })
  }

  // Setup all extensions
  setupAllExtensions(monaco: any) {
    this.setupJavaScriptSupport(monaco)
    this.setupCSSSupport(monaco)
    this.setupHTMLSupport(monaco)
    this.setupErrorChecking(monaco)
    this.setupCustomSnippets(monaco)
  }
}

// Export singleton instance
export const monacoExtensions = MonacoExtensions.getInstance()
