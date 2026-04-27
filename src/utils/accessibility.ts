// Accessibility utilities and helpers

export const ARIA_ROLES = {
  navigation: 'navigation',
  main: 'main',
  complementary: 'complementary',
  contentinfo: 'contentinfo',
  banner: 'banner',
  search: 'search',
  tablist: 'tablist',
  tab: 'tab',
  tabpanel: 'tabpanel',
  dialog: 'dialog',
  alert: 'alert',
  status: 'status',
  log: 'log',
  marquee: 'marquee',
  timer: 'timer',
  scrollbar: 'scrollbar',
  menu: 'menu',
  menubar: 'menubar',
  menuitem: 'menuitem',
  menuitemcheckbox: 'menuitemcheckbox',
  menuitemradio: 'menuitemradio',
  option: 'option',
  listbox: 'listbox',
  combobox: 'combobox',
  grid: 'grid',
  gridcell: 'gridcell',
  row: 'row',
  rowgroup: 'rowgroup',
  columnheader: 'columnheader',
  rowheader: 'rowheader',
  tree: 'tree',
  treegrid: 'treegrid',
  treeitem: 'treeitem',
  group: 'group',
  list: 'list',
  listitem: 'listitem',
  presentation: 'presentation',
  none: 'none',
  region: 'region',
  img: 'img',
  link: 'link',
} as const

export const ARIA_STATES = {
  busy: 'aria-busy',
  checked: 'aria-checked',
  disabled: 'aria-disabled',
  expanded: 'aria-expanded',
  grabbed: 'aria-grabbed',
  hidden: 'aria-hidden',
  invalid: 'aria-invalid',
  pressed: 'aria-pressed',
  selected: 'aria-selected',
} as const

export const ARIA_PROPERTIES = {
  activedescendant: 'aria-activedescendant',
  atomic: 'aria-atomic',
  autocomplete: 'aria-autocomplete',
  colcount: 'aria-colcount',
  colindex: 'aria-colindex',
  colspan: 'aria-colspan',
  controls: 'aria-controls',
  current: 'aria-current',
  describedby: 'aria-describedby',
  details: 'aria-details',
  disabled: 'aria-disabled',
  dropeffect: 'aria-dropeffect',
  errormessage: 'aria-errormessage',
  flowto: 'aria-flowto',
  haspopup: 'aria-haspopup',
  hidden: 'aria-hidden',
  invalid: 'aria-invalid',
  keyshortcuts: 'aria-keyshortcuts',
  label: 'aria-label',
  labelledby: 'aria-labelledby',
  level: 'aria-level',
  live: 'aria-live',
  modal: 'aria-modal',
  multiline: 'aria-multiline',
  multiselectable: 'aria-multiselectable',
  orientation: 'aria-orientation',
  owns: 'aria-owns',
  placeholder: 'aria-placeholder',
  posinset: 'aria-posinset',
  readonly: 'aria-readonly',
  relevant: 'aria-relevant',
  required: 'aria-required',
  roledescription: 'aria-roledescription',
  rowcount: 'aria-rowcount',
  rowindex: 'aria-rowindex',
  rowspan: 'aria-rowspan',
  setsize: 'aria-setsize',
  sort: 'aria-sort',
  valuemax: 'aria-valuemax',
  valuemin: 'aria-valuemin',
  valuenow: 'aria-valuenow',
  valuetext: 'aria-valuetext',
} as const

// Focus management utilities
export const focusManagement = {
  trapFocus: (containerElement: HTMLElement) => {
    const focusableElements = containerElement.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    ) as NodeListOf<HTMLElement>
    
    const firstElement = focusableElements[0]
    const lastElement = focusableElements[focusableElements.length - 1]
    
    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement.focus()
            e.preventDefault()
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement.focus()
            e.preventDefault()
          }
        }
      }
    }
    
    containerElement.addEventListener('keydown', handleTabKey)
    
    firstElement?.focus()
    
    return () => {
      containerElement.removeEventListener('keydown', handleTabKey)
    }
  },
  
  restoreFocus: (previousActiveElement: HTMLElement) => {
    if (previousActiveElement && previousActiveElement.focus) {
      previousActiveElement.focus()
    }
  },
  
  setFocus: (element: HTMLElement | null, options?: { preventScroll?: boolean }) => {
    if (element && element.focus) {
      element.focus(options)
    }
  },
  
  getFocusableElements: (container: HTMLElement) => {
    return container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    ) as NodeListOf<HTMLElement>
  },
}

// Screen reader announcements
export const screenReaderAnnounce = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
  const announcement = document.createElement('div')
  announcement.setAttribute('aria-live', priority)
  announcement.setAttribute('aria-atomic', 'true')
  announcement.className = 'sr-only'
  announcement.textContent = message
  
  document.body.appendChild(announcement)
  
  setTimeout(() => {
    document.body.removeChild(announcement)
  }, 1000)
}

// Skip links utility
export const createSkipLink = (targetId: string, text: string = 'Skip to main content') => {
  const link = document.createElement('a')
  link.href = `#${targetId}`
  link.textContent = text
  link.className = 'sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 text-white px-4 py-2 rounded-md z-50'
  
  return link
}

// Color contrast checker
export const checkColorContrast = (foreground: string, background: string): number => {
  const getLuminance = (color: string): number => {
    const rgb = color.match(/\d+/g)
    if (!rgb) return 0
    
    const [r, g, b] = rgb.map(val => {
      const normalized = parseInt(val) / 255
      return normalized <= 0.03928 
        ? normalized / 12.92 
        : Math.pow((normalized + 0.055) / 1.055, 2.4)
    })
    
    return 0.2126 * r + 0.7152 * g + 0.0722 * b
  }
  
  const l1 = getLuminance(foreground)
  const l2 = getLuminance(background)
  
  const lighter = Math.max(l1, l2)
  const darker = Math.min(l1, l2)
  
  return (lighter + 0.05) / (darker + 0.05)
}

export const isWCAGCompliant = (contrastRatio: number, level: 'AA' | 'AAA' = 'AA', size: 'normal' | 'large' = 'normal'): boolean => {
  const thresholds = {
    AA: { normal: 4.5, large: 3.0 },
    AAA: { normal: 7.0, large: 4.5 },
  }
  
  return contrastRatio >= thresholds[level][size]
}

// Keyboard navigation utilities
export const keyboardNavigation = {
  createArrowKeyNavigation: (items: HTMLElement[], currentIndex: number, direction: 'up' | 'down' | 'left' | 'right') => {
    const isVertical = direction === 'up' || direction === 'down'
    const isForward = direction === 'down' || direction === 'right'
    
    let newIndex = currentIndex
    
    if (isForward) {
      newIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0
    } else {
      newIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1
    }
    
    return newIndex
  },
  
  createHomeEndNavigation: (items: HTMLElement[], target: 'home' | 'end') => {
    return target === 'home' ? 0 : items.length - 1
  },
  
  createPageNavigation: (items: HTMLElement[], currentIndex: number, direction: 'up' | 'down') => {
    const pageSize = Math.max(5, Math.floor(items.length / 4))
    
    if (direction === 'up') {
      return Math.max(0, currentIndex - pageSize)
    } else {
      return Math.min(items.length - 1, currentIndex + pageSize)
    }
  },
}

// Accessibility testing utilities
export const accessibilityChecks = {
  hasAltText: (img: HTMLImageElement): boolean => {
    return img.alt !== '' || img.role === 'presentation'
  },
  
  hasLabel: (input: HTMLInputElement): boolean => {
    return (
      input.hasAttribute('aria-label') ||
      input.hasAttribute('aria-labelledby') ||
      document.querySelector(`label[for="${input.id}"]`) !== null
    )
  },
  
  hasValidHeadingStructure: (): boolean => {
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6')
    let lastLevel = 0
    
    for (const heading of headings) {
      const level = parseInt(heading.tagName.charAt(1))
      if (level > lastLevel + 1) {
        return false
      }
      lastLevel = level
    }
    
    return headings.length > 0 && headings[0].tagName === 'H1'
  },
  
  hasValidLang: (): boolean => {
    return document.documentElement.hasAttribute('lang') && 
           document.documentElement.getAttribute('lang') !== ''
  },
  
  hasFocusManagement: (): boolean => {
    const interactiveElements = document.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    
    return interactiveElements.length > 0
  },
}

// Accessibility helper functions
export const a11yHelpers = {
  announceToScreenReader: screenReaderAnnounce,
  trapFocus: focusManagement.trapFocus,
  restoreFocus: focusManagement.restoreFocus,
  setFocus: focusManagement.setFocus,
  checkColorContrast,
  isWCAGCompliant,
  createSkipLink,
}

export default {
  ARIA_ROLES,
  ARIA_STATES,
  ARIA_PROPERTIES,
  focusManagement,
  screenReaderAnnounce,
  createSkipLink,
  checkColorContrast,
  isWCAGCompliant,
  keyboardNavigation,
  accessibilityChecks,
  a11yHelpers,
}
