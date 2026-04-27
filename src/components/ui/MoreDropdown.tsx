import React, { useState, useRef, useEffect } from 'react'
import { MoreVertical, Download, Share2, Copy, Trash2, Edit, Eye, Archive, Star, Link, Settings, FileText, Code, Palette, Zap } from 'lucide-react'

interface DropdownItem {
  id: string
  label: string
  icon: React.ReactNode
  onClick: () => void
  danger?: boolean
  divider?: boolean
}

interface DividerItem {
  id: string
  divider: true
}

interface MoreDropdownProps {
  items: (DropdownItem | DividerItem)[]
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'minimal'
  disabled?: boolean
  className?: string
}

export default function MoreDropdown({
  items,
  position = 'bottom-right',
  size = 'md',
  variant = 'default',
  disabled = false,
  className = ''
}: MoreDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const getPositionClasses = () => {
    switch (position) {
      case 'bottom-right':
        return 'top-full right-0 mt-1'
      case 'bottom-left':
        return 'top-full left-0 mt-1'
      case 'top-right':
        return 'bottom-full right-0 mb-1'
      case 'top-left':
        return 'bottom-full left-0 mb-1'
      default:
        return 'top-full right-0 mt-1'
    }
  }

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'p-1 w-36'
      case 'lg':
        return 'p-2 w-64'
      default:
        return 'p-1 w-48'
    }
  }

  const getTriggerClasses = () => {
    const baseClasses = 'inline-flex items-center justify-center rounded-lg transition-colors'
    const sizeClasses = size === 'sm' ? 'p-1' : size === 'lg' ? 'p-2' : 'p-1.5'
    const variantClasses = variant === 'minimal' 
      ? 'text-gray-400 hover:text-white hover:bg-gray-700' 
      : 'text-gray-400 hover:bg-gray-700'
    const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'

    return `${baseClasses} ${sizeClasses} ${variantClasses} ${disabledClasses} ${className}`
  }

  const getItemClasses = (item: DropdownItem | DividerItem) => {
    if ('divider' in item) return ''
    
    const baseClasses = 'flex items-center gap-2 w-full px-3 py-2 text-sm rounded transition-colors'
    const dangerClasses = item.danger ? 'text-red-400 hover:bg-red-500/10' : 'text-gray-300 hover:bg-gray-700'
    const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'

    return `${baseClasses} ${dangerClasses} ${disabledClasses}`
  }

  const handleItemClick = (item: DropdownItem | DividerItem) => {
    if (!disabled && !('divider' in item)) {
      item.onClick()
      setIsOpen(false)
    }
  }

  return (
    <div ref={dropdownRef} className="relative inline-block">
      {/* Trigger Button */}
      <button
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={getTriggerClasses()}
        title="More options"
      >
        <MoreVertical className="w-4 h-4" />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className={`absolute z-50 bg-gray-800 border border-gray-700 rounded-lg shadow-lg ${getPositionClasses()} ${getSizeClasses()}`}>
          {items.map((item, index) => (
            <React.Fragment key={item.id}>
              {/* Divider */}
              {'divider' in item && index > 0 && (
                <div className="my-1 border-t border-gray-700" />
              )}

              {/* Menu Item */}
              {!('divider' in item) && (
                <button
                  onClick={() => handleItemClick(item)}
                  disabled={disabled}
                  className={getItemClasses(item)}
                >
                  {/* Icon */}
                  <span className="flex-shrink-0 w-4 h-4">
                    {item.icon}
                  </span>

                  {/* Label */}
                  <span className="flex-1 text-left">
                    {item.label}
                  </span>
                </button>
              )}
            </React.Fragment>
          ))}
        </div>
      )}
    </div>
  )
}

// Preset dropdown configurations
export const createFileDropdownItems = (onAction: (action: string) => void): (DropdownItem | DividerItem)[] => [
  {
    id: 'edit',
    label: 'Edit',
    icon: <Edit className="w-4 h-4" />,
    onClick: () => onAction('edit')
  },
  {
    id: 'duplicate',
    label: 'Duplicate',
    icon: <Copy className="w-4 h-4" />,
    onClick: () => onAction('duplicate')
  },
  {
    id: 'share',
    label: 'Share',
    icon: <Share2 className="w-4 h-4" />,
    onClick: () => onAction('share')
  },
  {
    id: 'download',
    label: 'Download',
    icon: <Download className="w-4 h-4" />,
    onClick: () => onAction('download')
  },
  { id: 'divider-1', divider: true },
  {
    id: 'archive',
    label: 'Archive',
    icon: <Archive className="w-4 h-4" />,
    onClick: () => onAction('archive')
  },
  {
    id: 'delete',
    label: 'Delete',
    icon: <Trash2 className="w-4 h-4" />,
    onClick: () => onAction('delete'),
    danger: true
  }
]

export const createPreviewDropdownItems = (onAction: (action: string) => void): (DropdownItem | DividerItem)[] => [
  {
    id: 'refresh',
    label: 'Refresh',
    icon: <Zap className="w-4 h-4" />,
    onClick: () => onAction('refresh')
  },
  {
    id: 'dark-mode',
    label: 'Dark Mode',
    icon: <Palette className="w-4 h-4" />,
    onClick: () => onAction('dark-mode')
  },
  {
    id: 'view-source',
    label: 'View Source',
    icon: <Code className="w-4 h-4" />,
    onClick: () => onAction('view-source')
  },
  {
    id: 'copy-code',
    label: 'Copy Code',
    icon: <Copy className="w-4 h-4" />,
    onClick: () => onAction('copy-code')
  },
  { id: 'divider-2', divider: true },
  {
    id: 'open-new-tab',
    label: 'Open in New Tab',
    icon: <Eye className="w-4 h-4" />,
    onClick: () => onAction('open-new-tab')
  },
  {
    id: 'share-link',
    label: 'Copy Link',
    icon: <Link className="w-4 h-4" />,
    onClick: () => onAction('share-link')
  }
]

export const createWorkspaceDropdownItems = (onAction: (action: string) => void): (DropdownItem | DividerItem)[] => [
  {
    id: 'upload-files',
    label: 'Upload Files',
    icon: <FileText className="w-4 h-4" />,
    onClick: () => onAction('upload-files')
  },
  {
    id: 'share-workspace',
    label: 'Share Workspace',
    icon: <Share2 className="w-4 h-4" />,
    onClick: () => onAction('share-workspace')
  },
  {
    id: 'export-project',
    label: 'Export Project',
    icon: <Download className="w-4 h-4" />,
    onClick: () => onAction('export-project')
  },
  { id: 'divider-3', divider: true },
  {
    id: 'duplicate-workspace',
    label: 'Duplicate Workspace',
    icon: <Copy className="w-4 h-4" />,
    onClick: () => onAction('duplicate-workspace')
  },
  {
    id: 'star-workspace',
    label: 'Star Workspace',
    icon: <Star className="w-4 h-4" />,
    onClick: () => onAction('star-workspace')
  },
  { id: 'divider-4', divider: true },
  {
    id: 'settings',
    label: 'Settings',
    icon: <Settings className="w-4 h-4" />,
    onClick: () => onAction('settings')
  }
]
