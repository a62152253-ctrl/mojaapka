import { useEffect, useCallback, useMemo } from 'react'

type KeyboardShortcutHandler = (event: KeyboardEvent) => void

interface KeyboardShortcut {
  key: string
  ctrlKey?: boolean
  shiftKey?: boolean
  altKey?: boolean
  metaKey?: boolean
  handler: KeyboardShortcutHandler
  description?: string
}

export const useKeyboardShortcuts = (shortcuts: KeyboardShortcut[]) => {
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    for (const shortcut of shortcuts) {
      const {
        key,
        ctrlKey = false,
        shiftKey = false,
        altKey = false,
        metaKey = false,
        handler
      } = shortcut

      if (
        event.key.toLowerCase() === key.toLowerCase() &&
        event.ctrlKey === ctrlKey &&
        event.shiftKey === shiftKey &&
        event.altKey === altKey &&
        event.metaKey === metaKey
      ) {
        event.preventDefault()
        handler(event)
        break
      }
    }
  }, [shortcuts])

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [handleKeyDown])
}

// Common dashboard shortcuts
export const useDashboardShortcuts = (handlers: {
  onSearch?: () => void
  onNewProject?: () => void
  onRefresh?: () => void
  onToggleNotifications?: () => void
  onToggleSettings?: () => void
  onLogout?: () => void
}) => {
  const shortcuts: KeyboardShortcut[] = useMemo(() => [
    {
      key: 'k',
      ctrlKey: true,
      handler: handlers.onSearch || (() => {}),
      description: 'Search'
    },
    {
      key: 'n',
      ctrlKey: true,
      handler: handlers.onNewProject || (() => {}),
      description: 'New Project'
    },
    {
      key: 'r',
      ctrlKey: true,
      handler: handlers.onRefresh || (() => {}),
      description: 'Refresh'
    },
    {
      key: '/',
      handler: handlers.onSearch || (() => {}),
      description: 'Search'
    },
    {
      key: 'n',
      shiftKey: true,
      handler: handlers.onToggleNotifications || (() => {}),
      description: 'Toggle Notifications'
    },
    {
      key: 's',
      shiftKey: true,
      handler: handlers.onToggleSettings || (() => {}),
      description: 'Toggle Settings'
    },
    {
      key: 'q',
      ctrlKey: true,
      handler: handlers.onLogout || (() => {}),
      description: 'Logout'
    },
    {
      key: 'Escape',
      handler: () => {
        // Close modals, dropdowns, etc.
        const activeElement = document.activeElement as HTMLElement
        if (activeElement?.blur) {
          activeElement.blur()
        }
        
        // Close any open dropdowns
        const dropdowns = document.querySelectorAll('[aria-expanded="true"]')
        dropdowns.forEach(dropdown => {
          (dropdown as HTMLElement).click()
        })
      },
      description: 'Close/Escape'
    }
  ], [handlers])

  useKeyboardShortcuts(shortcuts)
  return shortcuts
}

export default useKeyboardShortcuts
