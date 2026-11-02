import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { usePageTransition } from '../contexts/PageTransitionContext'

const ThemePortalCircle = ({ color, position, phase }) => {
  const maxRadius = Math.max(
    Math.sqrt(Math.pow(window.innerWidth, 2) + Math.pow(window.innerHeight, 2)),
    2000
  )

  return (
    <motion.div
      className="fixed pointer-events-none"
      style={{
        left: position.x,
        top: position.y,
        zIndex: 9999,
      }}
      initial={{
        width: 0,
        height: 0,
        borderRadius: '50%',
        x: '-50%',
        y: '-50%',
        opacity: 0.9,
        filter: 'blur(0px)',
      }}
      animate={{
        width: phase === 'expanding' ? maxRadius * 2 : maxRadius * 2,
        height: phase === 'expanding' ? maxRadius * 2 : maxRadius * 2,
        opacity: phase === 'expanding' ? 0.9 : phase === 'holding' ? 0.85 : [0.85, 0],
        filter: phase === 'fading' ? 'blur(20px)' : 'blur(0px)',
        scale: phase === 'fading' ? [1, 1.2] : 1,
      }}
      transition={{
        width: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
        height: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
        opacity: {
          duration: phase === 'fading' ? 0.6 : 0,
          ease: phase === 'fading' ? 'easeOut' : 'linear',
        },
        filter: {
          duration: 0.6,
          ease: 'easeOut',
        },
        scale: {
          duration: 0.6,
          ease: 'easeOut',
        },
      }}
    >
      <div
        className="w-full h-full"
        style={{
          background: `radial-gradient(circle, ${color} 0%, ${color} 60%, ${color}cc 80%, transparent 100%)`,
          boxShadow: `0 0 100px ${color}, 0 0 200px ${color}40`,
        }}
      />
    </motion.div>
  )
}

const ThemeSolidOverlay = ({ color, phase }) => {
  return (
    <motion.div
      className="fixed inset-0 pointer-events-none"
      style={{
        zIndex: 9998,
        background: color,
      }}
      initial={{
        opacity: 0,
      }}
      animate={{
        opacity: phase === 'expanding' ? [0, 1, 1] : phase === 'holding' ? 1 : [1, 0],
      }}
      transition={{
        opacity: {
          duration: phase === 'expanding' ? 0.5 : phase === 'fading' ? 0.6 : 0,
          ease: 'easeOut',
          times: phase === 'expanding' ? [0, 0.3, 1] : [0, 1],
        },
      }}
    />
  )
}

const PageContentWrapper = ({ children, phase }) => {
  return (
    <motion.div
      animate={{
        y: phase === 'fading' ? [30, 0] : 0,
        opacity: phase === 'fading' ? [0, 1] : 1,
        filter: phase === 'fading' ? ['blur(10px)', 'blur(0px)'] : 'blur(0px)',
      }}
      transition={{
        y: { duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 0.2 },
        opacity: { duration: 0.5, ease: 'easeOut', delay: 0.2 },
        filter: { duration: 0.4, ease: 'easeOut', delay: 0.2 },
      }}
    >
      {children}
    </motion.div>
  )
}

const PageTransitionOverlay = () => {
  const {
    isTransitioning,
    transitionType,
    currentPage,
    previousPage,
    mousePosition,
    getPageTheme,
    transitionPhase,
  } = usePageTransition()

  if (!isTransitioning) return null

  const currentTheme = getPageTheme(currentPage)
  const previousTheme = getPageTheme(previousPage)

  const centerPosition = {
    x: typeof window !== 'undefined' ? window.innerWidth / 2 : 500,
    y: typeof window !== 'undefined' ? window.innerHeight / 2 : 400,
  }

  const position = mousePosition.x !== 0 && transitionType === 'click'
    ? mousePosition
    : centerPosition

  const getTransitionColor = () => {
    switch (currentPage) {
      case 'code':
        return '#3b82f6'
      case 'blog':
        return '#fbbf24'
      case 'favorites':
        return '#ec4899'
      case 'about':
        return '#6366f1'
      case 'game':
        return '#a855f7'
      case 'life':
        return '#f97316'
      default:
        return currentTheme.primary || '#3b82f6'
    }
  }

  const transitionColor = getTransitionColor()

  return (
    <AnimatePresence>
      {isTransitioning && (
        <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 9999 }}>
          {transitionType === 'click' && (
            <>
              <ThemePortalCircle
                color={transitionColor}
                position={position}
                phase={transitionPhase}
              />
              <ThemeSolidOverlay
                color={transitionColor}
                phase={transitionPhase}
              />
            </>
          )}

          {transitionType === 'scroll' && (
            <ThemePortalCircle
              color={transitionColor}
              position={centerPosition}
              phase={transitionPhase}
            />
          )}
        </div>
      )}
    </AnimatePresence>
  )
}

export const PageTransitionIndicator = () => {
  const { currentPage, getPageTheme, isTransitioning } = usePageTransition()
  const currentTheme = getPageTheme(currentPage)

  return (
    <AnimatePresence>
      {!isTransitioning && (
        <motion.div
          className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-40 flex items-center gap-3 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-gray-200/50 shadow-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ delay: 0.8, duration: 0.3 }}
        >
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: currentTheme.primary }}
          />
          <span className="text-sm font-medium text-gray-700">
            {currentTheme.name}
          </span>
          <div className="flex gap-1">
            {currentTheme.isDark ? (
              <span className="text-xs text-gray-500">Dark</span>
            ) : (
              <span className="text-xs text-gray-500">Light</span>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default PageTransitionOverlay