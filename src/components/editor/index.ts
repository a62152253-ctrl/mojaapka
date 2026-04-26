// Enhanced Code Editor Components
export { default as EnhancedCodeEditor } from './EnhancedCodeEditor'

// Types and Interfaces
export type {
  CodeFile,
  EditorTheme,
  EditorSettings,
  LanguageConfig,
  CodeSnippet,
  EditorAction,
  PreviewConfig,
  ErrorInfo,
  EditorState,
  FileType,
  FileTemplate
} from './CodeEditorTypes'

// Themes
export {
  editorThemes,
  getThemeByName,
  getThemeColors,
  defineCustomThemes
} from './CodeEditorThemes'

// Languages
export {
  languageConfigs,
  getLanguageByExtension,
  getLanguageById,
  getLanguageFromContent
} from './CodeEditorLanguages'

// Utilities
export {
  generateUniqueId,
  createNewFile,
  validateFileName,
  formatFileSize,
  debounce,
  throttle,
  exportFiles,
  importFiles,
  downloadFile,
  downloadFilesAsZip,
  getMimeType,
  parseErrors,
  generatePreviewHtml,
  getDefaultSettings,
  saveSettingsToStorage,
  loadSettingsFromStorage,
  saveFilesToStorage,
  loadFilesFromStorage,
  copyToClipboard,
  getLineCount,
  getWordCount,
  getCharacterCount,
  getFileStats
} from './CodeEditorUtils'

// Monaco Extensions
export {
  MonacoExtensions,
  monacoExtensions
} from './MonacoExtensions'

// Prettier Formatter
export {
  PrettierFormatter,
  prettierFormatter
} from './PrettierFormatter'

// ESLint Integration
export {
  ESLintIntegration,
  eslintIntegration
} from './ESLintIntegration'

// Legacy export for backward compatibility
export { default as CodeEditor } from '../CodeEditor'
