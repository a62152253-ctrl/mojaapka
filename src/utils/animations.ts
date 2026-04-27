// Animation utilities and constants for smooth transitions

export const ANIMATION_DURATIONS = {
  fast: 150,
  normal: 250,
  slow: 350,
  slower: 500,
} as const

export const ANIMATION_EASINGS = {
  easeOut: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
  easeIn: 'cubic-bezier(0.42, 0, 1, 1)',
  easeInOut: 'cubic-bezier(0.42, 0, 0.58, 1)',
  bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
} as const

export const TRANSITIONS = {
  fade: {
    enter: `opacity-0 opacity-100`,
    exit: `opacity-100 opacity-0`,
  },
  slideUp: {
    enter: `transform translate-y-4 opacity-0 transform translate-y-0 opacity-100`,
    exit: `transform translate-y-0 opacity-100 transform translate-y-4 opacity-0`,
  },
  slideDown: {
    enter: `transform -translate-y-4 opacity-0 transform translate-y-0 opacity-100`,
    exit: `transform translate-y-0 opacity-100 transform -translate-y-4 opacity-0`,
  },
  slideLeft: {
    enter: `transform translate-x-4 opacity-0 transform translate-x-0 opacity-100`,
    exit: `transform translate-x-0 opacity-100 transform translate-x-4 opacity-0`,
  },
  slideRight: {
    enter: `transform -translate-x-4 opacity-0 transform translate-x-0 opacity-100`,
    exit: `transform translate-x-0 opacity-100 transform -translate-x-4 opacity-0`,
  },
  scale: {
    enter: `transform scale-95 opacity-0 transform scale-100 opacity-100`,
    exit: `transform scale-100 opacity-100 transform scale-95 opacity-0`,
  },
  scaleUp: {
    enter: `transform scale-50 opacity-0 transform scale-100 opacity-100`,
    exit: `transform scale-100 opacity-100 transform scale-50 opacity-0`,
  },
  scaleDown: {
    enter: `transform scale-110 opacity-0 transform scale-100 opacity-100`,
    exit: `transform scale-100 opacity-100 transform scale-110 opacity-0`,
  },
} as const

export const getTransitionClasses = (
  transition: keyof typeof TRANSITIONS,
  duration: keyof typeof ANIMATION_DURATIONS = 'normal',
  easing: keyof typeof ANIMATION_EASINGS = 'easeInOut'
) => {
  const durationClass = `duration-${duration}`
  const easingClass = `ease-${easing}`
  
  return {
    enter: `${TRANSITIONS[transition].enter} ${durationClass} ${easingClass}`,
    exit: `${TRANSITIONS[transition].exit} ${durationClass} ${easingClass}`,
  }
}

// CSS-in-JS animation utilities
export const animations = {
  fadeIn: {
    from: { opacity: 0 },
    to: { opacity: 1 },
  },
  fadeOut: {
    from: { opacity: 1 },
    to: { opacity: 0 },
  },
  slideUp: {
    from: { transform: 'translateY(20px)', opacity: 0 },
    to: { transform: 'translateY(0)', opacity: 1 },
  },
  slideDown: {
    from: { transform: 'translateY(-20px)', opacity: 0 },
    to: { transform: 'translateY(0)', opacity: 1 },
  },
  slideLeft: {
    from: { transform: 'translateX(20px)', opacity: 0 },
    to: { transform: 'translateX(0)', opacity: 1 },
  },
  slideRight: {
    from: { transform: 'translateX(-20px)', opacity: 0 },
    to: { transform: 'translateX(0)', opacity: 1 },
  },
  scale: {
    from: { transform: 'scale(0.95)', opacity: 0 },
    to: { transform: 'scale(1)', opacity: 1 },
  },
  scaleUp: {
    from: { transform: 'scale(0.8)', opacity: 0 },
    to: { transform: 'scale(1)', opacity: 1 },
  },
  scaleDown: {
    from: { transform: 'scale(1.05)', opacity: 0 },
    to: { transform: 'scale(1)', opacity: 1 },
  },
  bounce: {
    '0%': { transform: 'scale(1)' },
    '50%': { transform: 'scale(1.05)' },
    '100%': { transform: 'scale(1)' },
  },
  pulse: {
    '0%': { opacity: 1 },
    '50%': { opacity: 0.7 },
    '100%': { opacity: 1 },
  },
  spin: {
    from: { transform: 'rotate(0deg)' },
    to: { transform: 'rotate(360deg)' },
  },
  ping: {
    '0%': { transform: 'scale(1)', opacity: 1 },
    '75%': { transform: 'scale(1.5)', opacity: 0 },
    '100%': { transform: 'scale(1)', opacity: 0 },
  },
  float: {
    '0%, 100%': { transform: 'translateY(0)' },
    '50%': { transform: 'translateY(-10px)' },
  },
  shimmer: {
    '0%': { backgroundPosition: '-200% 0' },
    '100%': { backgroundPosition: '200% 0' },
  },
} as const

// Animation utility functions
export const staggeredAnimation = (delay: number, stagger: number = 100) => {
  return Array.from({ length: delay }, (_, index) => ({
    animationDelay: `${index * stagger}ms`,
    animationFillMode: 'both',
  }))
}

export const createSpringAnimation = (
  tension: number = 170,
  friction: number = 26,
  mass: number = 1
) => {
  const dampingRatio = friction / (2 * Math.sqrt(tension * mass))
  const undampedFrequency = Math.sqrt(tension / mass) / (2 * Math.PI)
  const dampedFrequency = undampedFrequency * Math.sqrt(1 - dampingRatio * dampingRatio)
  
  return {
    transition: `transform ${ANIMATION_DURATIONS.normal}ms ${ANIMATION_EASINGS.easeOut}`,
    transitionTimingFunction: `cubic-bezier(${calculateSpringEasing(tension, friction, mass)})`,
  }
}

const calculateSpringEasing = (tension: number, friction: number, mass: number) => {
  const dampingRatio = friction / (2 * Math.sqrt(tension * mass))
  const a = dampingRatio * Math.sqrt(1 - dampingRatio * dampingRatio)
  const b = 1 - dampingRatio * dampingRatio
  
  return `${a}, 0.01, ${b}`
}

// Performance-optimized animation hooks
export const useReducedMotion = () => {
  if (typeof window !== 'undefined') {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  }
  return false
}

export const getAnimationDuration = (baseDuration: number) => {
  if (useReducedMotion()) {
    return Math.min(baseDuration, 200)
  }
  return baseDuration
}

// Loading animations
export const loadingAnimations = {
  spinner: {
    animation: 'spin 1s linear infinite',
  },
  pulse: {
    animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
  },
  bounce: {
    animation: 'bounce 1s infinite',
  },
  shimmer: {
    background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent)',
    backgroundSize: '200% 100%',
    animation: 'shimmer 1.5s infinite',
  },
} as const

export default {
  ANIMATION_DURATIONS,
  ANIMATION_EASINGS,
  TRANSITIONS,
  getTransitionClasses,
  animations,
  staggeredAnimation,
  createSpringAnimation,
  useReducedMotion,
  getAnimationDuration,
  loadingAnimations,
}
