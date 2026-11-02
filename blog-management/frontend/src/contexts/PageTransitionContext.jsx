import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react'

const PAGE_THEMES = {
  about: {
    name: 'Home',
    primary: '#6366f1',
    secondary: '#8b5cf6',
    glow: 'from-indigo-500/30 to-purple-500/30',
    isDark: false,
    transitionColor: '#6366f1',
  },
  favorites: {
    name: 'Favorites',
    primary: '#ec4899',
    secondary: '#f472b6',
    glow: 'from-pink-500/30 to-rose-500/30',
    isDark: false,
    transitionColor: '#ec4899',
  },
  blog: {
    name: 'Blog',
    primary: '#fbbf24',
    secondary: '#f97316',
    glow: 'from-amber-400/30 to-orange-400/30',
    isDark: false,
    transitionColor: '#fbbf24',
  },
  game: {
    name: 'Game',
    primary: '#a855f7',
    secondary: '#06b6d4',
    glow: 'from-purple-500/30 to-cyan-500/30',
    isDark: true,
    transitionColor: '#a855f7',
  },
  code: {
    name: 'Code',
    primary: '#3b82f6',
    secondary: '#22d3ee',
    glow: 'from-blue-500/30 to-cyan-400/30',
    isDark: true,
    transitionColor: '#3b82f6',
  },
  life: {
    name: 'Life',
    primary: '#f97316',
    secondary: '#14b8a6',
    glow: 'from-orange-500/30 to-teal-500/30',
    isDark: false,
    transitionColor: '#f97316',
  },
}

const PageTransitionContext = createContext(undefined)

export const usePageTransition = () => {
  const context = useContext(PageTransitionContext)
  if (!context) {
    throw new Error('usePageTransition must be used within a PageTransitionProvider')
  }
  return context
}

export const PageTransitionProvider = ({ children }) => {
  const [currentPage, setCurrentPage] = useState('about')
  const [previousPage, setPreviousPage] = useState('about')
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [transitionType, setTransitionType] = useState(null)
  const [transitionDirection, setTransitionDirection] = useState('up')
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [transitionPhase, setTransitionPhase] = useState(null)

  const transitionTimerRef = useRef(null)

  const getPageTheme = useCallback((pageId) => {
    return PAGE_THEMES[pageId] || PAGE_THEMES.about
  }, [])

  const detectScrollDirection = useCallback((fromPage, toPage) => {
    const pageOrder = ['about', 'favorites', 'blog', 'game', 'code', 'life']
    const fromIndex = pageOrder.indexOf(fromPage)
    const toIndex = pageOrder.indexOf(toPage)
    return toIndex > fromIndex ? 'down' : 'up'
  }, [])

  const clearTransitionTimers = useCallback(() => {
    if (transitionTimerRef.current) {
      clearTimeout(transitionTimerRef.current)
      transitionTimerRef.current = null
    }
  }, [])

  const runTransitionSequence = useCallback((pageId, triggerType) => {
    clearTransitionTimers()

    setIsTransitioning(true)
    setTransitionType(triggerType)
    setTransitionPhase('expanding')

    transitionTimerRef.current = setTimeout(() => {
      setTransitionPhase('holding')
    }, 500)

    transitionTimerRef.current = setTimeout(() => {
      setTransitionPhase('fading')
    }, 600)

    transitionTimerRef.current = setTimeout(() => {
      setIsTransitioning(false)
      setTransitionType(null)
      setTransitionPhase(null)
      setMousePosition({ x: 0, y: 0 })
    }, 1200)
  }, [clearTransitionTimers])

  const navigateToPage = useCallback((pageId, triggerType = 'click', event = null) => {
    if (isTransitioning || pageId === currentPage) return

    if (event) {
      setMousePosition({
        x: event.clientX,
        y: event.clientY,
      })
    }

    setPreviousPage(currentPage)
    setCurrentPage(pageId)

    if (triggerType === 'scroll') {
      const direction = detectScrollDirection(previousPage, pageId)
      setTransitionDirection(direction)
    }

    runTransitionSequence(pageId, triggerType)
  }, [currentPage, isTransitioning, previousPage, detectScrollDirection, runTransitionSequence])

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isTransitioning) {
        setMousePosition({ x: e.clientX, y: e.clientY })
      }
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [isTransitioning])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !isTransitioning) {
            const pageId = entry.target.id
            if (pageId && pageId !== currentPage) {
              setPreviousPage(currentPage)
              setCurrentPage(pageId)
              const direction = detectScrollDirection(previousPage, pageId)
              setTransitionDirection(direction)
            }
          }
        })
      },
      {
        threshold: 0.5,
      }
    )

    const sections = document.querySelectorAll('section[id]')
    sections.forEach((section) => observer.observe(section))

    return () => {
      sections.forEach((section) => observer.unobserve(section))
    }
  }, [currentPage, isTransitioning, previousPage, detectScrollDirection])

  useEffect(() => {
    return () => {
      clearTransitionTimers()
    }
  }, [clearTransitionTimers])

  const value = {
    currentPage,
    previousPage,
    isTransitioning,
    transitionType,
    transitionDirection,
    mousePosition,
    transitionPhase,
    getPageTheme,
    navigateToPage,
    pageThemes: PAGE_THEMES,
  }

  return (
    <PageTransitionContext.Provider value={value}>
      {children}
    </PageTransitionContext.Provider>
  )
}

export default PageTransitionContext