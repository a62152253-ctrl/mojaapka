import { EditorTheme } from './CodeEditorTypes'

export const editorThemes: EditorTheme[] = [
  {
    name: 'Dark',
    value: 'dark',
    monacoTheme: 'vs-dark',
    colors: {
      background: '#1e1e1e',
      foreground: '#d4d4d4',
      selection: '#264f78',
      cursor: '#aeafad',
      lineNumbers: '#858585'
    }
  },
  {
    name: 'Light',
    value: 'light',
    monacoTheme: 'vs',
    colors: {
      background: '#ffffff',
      foreground: '#000000',
      selection: '#add6ff',
      cursor: '#000000',
      lineNumbers: '#237893'
    }
  },
  {
    name: 'Monokai',
    value: 'monokai',
    monacoTheme: 'hc-black',
    colors: {
      background: '#272822',
      foreground: '#f8f8f2',
      selection: '#49483e',
      cursor: '#f8f8f0',
      lineNumbers: '#75715e'
    }
  },
  {
    name: 'GitHub Dark',
    value: 'github-dark',
    monacoTheme: 'vs-dark',
    colors: {
      background: '#0d1117',
      foreground: '#c9d1d9',
      selection: '#264f78',
      cursor: '#58a6ff',
      lineNumbers: '#7d8590'
    }
  },
  {
    name: 'Dracula',
    value: 'dracula',
    monacoTheme: 'vs-dark',
    colors: {
      background: '#282a36',
      foreground: '#f8f8f2',
      selection: '#44475a',
      cursor: '#f8f8f2',
      lineNumbers: '#6272a4'
    }
  },
  {
    name: 'Nord',
    value: 'nord',
    monacoTheme: 'vs-dark',
    colors: {
      background: '#2e3440',
      foreground: '#d8dee9',
      selection: '#434c5e',
      cursor: '#d8dee9',
      lineNumbers: '#4c566a'
    }
  },
  {
    name: 'Solarized Dark',
    value: 'solarized-dark',
    monacoTheme: 'vs-dark',
    colors: {
      background: '#002b36',
      foreground: '#839496',
      selection: '#073642',
      cursor: '#93a1a1',
      lineNumbers: '#657b83'
    }
  },
  {
    name: 'One Dark Pro',
    value: 'one-dark-pro',
    monacoTheme: 'vs-dark',
    colors: {
      background: '#282c34',
      foreground: '#abb2bf',
      selection: '#3e4451',
      cursor: '#528bff',
      lineNumbers: '#5c6370'
    }
  }
]

export const getThemeByName = (name: string): EditorTheme => {
  return editorThemes.find(theme => theme.value === name) || editorThemes[0]
}

export const getThemeColors = (themeValue: string) => {
  const theme = getThemeByName(themeValue)
  return theme.colors
}

// Custom theme definitions for Monaco
export const defineCustomThemes = (monaco: any) => {
  // GitHub Dark theme
  monaco.editor.defineTheme('github-dark', {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: 'comment', foreground: '6e7681' },
      { token: 'keyword', foreground: 'f97583' },
      { token: 'string', foreground: '9ecbff' },
      { token: 'number', foreground: '79b8ff' },
      { token: 'type', foreground: '85e89d' },
      { token: 'function', foreground: 'b392f0' },
      { token: 'variable', foreground: 'e1e4e8' }
    ],
    colors: {
      'editor.background': '#0d1117',
      'editor.foreground': '#c9d1d9',
      'editor.lineHighlightBackground': '#161b22',
      'editor.selectionBackground': '#264f78',
      'editorCursor.foreground': '#58a6ff',
      'editorLineNumber.foreground': '#7d8590'
    }
  })

  // Dracula theme
  monaco.editor.defineTheme('dracula', {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: 'comment', foreground: '6272a4' },
      { token: 'keyword', foreground: 'ff79c6' },
      { token: 'string', foreground: 'f1fa8c' },
      { token: 'number', foreground: 'bd93f9' },
      { token: 'type', foreground: '8be9fd' },
      { token: 'function', foreground: '50fa7b' },
      { token: 'variable', foreground: 'f8f8f2' }
    ],
    colors: {
      'editor.background': '#282a36',
      'editor.foreground': '#f8f8f2',
      'editor.lineHighlightBackground': '#44475a',
      'editor.selectionBackground': '#44475a',
      'editorCursor.foreground': '#f8f8f2',
      'editorLineNumber.foreground': '#6272a4'
    }
  })

  // Nord theme
  monaco.editor.defineTheme('nord', {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: 'comment', foreground: '#4c566a' },
      { token: 'keyword', foreground: '#81a1c1' },
      { token: 'string', foreground: '#a3be8c' },
      { token: 'number', foreground: '#b48ead' },
      { token: 'type', foreground: '#88c0d0' },
      { token: 'function', foreground: '#8fbcbb' },
      { token: 'variable', foreground: '#d8dee9' }
    ],
    colors: {
      'editor.background': '#2e3440',
      'editor.foreground': '#d8dee9',
      'editor.lineHighlightBackground': '#3b4252',
      'editor.selectionBackground': '#434c5e',
      'editorCursor.foreground': '#d8dee9',
      'editorLineNumber.foreground': '#4c566a'
    }
  })
}
