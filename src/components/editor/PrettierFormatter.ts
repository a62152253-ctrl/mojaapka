import * as prettier from 'prettier'
import * as monaco from 'monaco-editor'

export class PrettierFormatter {
  private static instance: PrettierFormatter
  
  static getInstance(): PrettierFormatter {
    if (!PrettierFormatter.instance) {
      PrettierFormatter.instance = new PrettierFormatter()
    }
    return PrettierFormatter.instance
  }

  // Format code using Prettier
  async formatCode(code: string, language: string): Promise<string> {
    try {
      let prettierConfig: prettier.Options = {
        semi: true,
        singleQuote: true,
        tabWidth: 2,
        useTabs: false,
        trailingComma: 'es5',
        bracketSpacing: true,
        arrowParens: 'avoid',
        endOfLine: 'lf',
        printWidth: 80
      }

      let parser: prettier.BuiltInParserName

      switch (language) {
        case 'javascript':
        case 'typescript':
          parser = 'typescript'
          break
        case 'json':
          parser = 'json'
          break
        case 'css':
          parser = 'css'
          break
        case 'html':
          parser = 'html'
          break
        case 'markdown':
          parser = 'markdown'
          break
        default:
          return code // Return original code if language not supported
      }

      const formatted = await prettier.format(code, {
        ...prettierConfig,
        parser
      })

      return formatted
    } catch (error) {
      console.warn('Prettier formatting failed:', error)
      return code // Return original code if formatting fails
    }
  }

  // Setup Prettier as a document formatter in Monaco
  setupDocumentFormatter(monaco: any) {
    monaco.languages.registerDocumentFormattingEditProvider(['javascript', 'typescript', 'json', 'css', 'html', 'markdown'], {
      provideDocumentFormattingEdits: async (model: any, options: any) => {
        const language = model.getLanguageId()
        const code = model.getValue()
        
        try {
          const formattedCode = await this.formatCode(code, language)
          
          if (formattedCode !== code) {
            return [
              {
                range: model.getFullModelRange(),
                text: formattedCode
              }
            ]
          }
        } catch (error) {
          console.warn('Formatting failed:', error)
        }
        
        return []
      }
    })

    // Setup range formatting as well
    monaco.languages.registerDocumentRangeFormattingEditProvider(['javascript', 'typescript', 'json', 'css', 'html', 'markdown'], {
      provideDocumentRangeFormattingEdits: async (model: any, range: any, options: any) => {
        const language = model.getLanguageId()
        const code = model.getValueInRange(range)
        
        try {
          const formattedCode = await this.formatCode(code, language)
          
          if (formattedCode !== code) {
            return [
              {
                range: range,
                text: formattedCode
              }
            ]
          }
        } catch (error) {
          console.warn('Range formatting failed:', error)
        }
        
        return []
      }
    })
  }

  // Format on save handler
  setupFormatOnSave(monaco: any, editor: any) {
    let formatOnSave = true

    // Add command to toggle format on save
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      if (formatOnSave) {
        editor.getAction('editor.action.formatDocument').run()
      }
    })

    return {
      toggleFormatOnSave: () => {
        formatOnSave = !formatOnSave
        console.log(`Format on save: ${formatOnSave ? 'enabled' : 'disabled'}`)
      },
      isFormatOnSaveEnabled: () => formatOnSave
    }
  }

  // Get Prettier configuration for a specific file
  async getFileConfig(filePath: string): Promise<prettier.Options> {
    try {
      const config = await prettier.resolveConfig(filePath)
      return {
        semi: true,
        singleQuote: true,
        tabWidth: 2,
        useTabs: false,
        trailingComma: 'es5',
        bracketSpacing: true,
        arrowParens: 'avoid',
        endOfLine: 'lf',
        printWidth: 80,
        ...config
      }
    } catch (error) {
      return {
        semi: true,
        singleQuote: true,
        tabWidth: 2,
        useTabs: false,
        trailingComma: 'es5',
        bracketSpacing: true,
        arrowParens: 'avoid',
        endOfLine: 'lf',
        printWidth: 80
      }
    }
  }

  // Check if code is formatted correctly
  async checkFormatting(code: string, language: string): Promise<boolean> {
    try {
      const formatted = await this.formatCode(code, language)
      return code === formatted
    } catch (error) {
      return false
    }
  }
}

// Export singleton instance
export const prettierFormatter = PrettierFormatter.getInstance()
