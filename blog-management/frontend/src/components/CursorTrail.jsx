import React, { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const TRAIL_LENGTH = 15
const TRAIL_DELAY = 20
const INITIAL_SIZE = 16
const SIZE_DECAY = 0.85
const OPACITY_DECAY = 0.92

const CursorTrail = () => {
  const [mousePosition, setMousePosition] = useState({ x: -100, y: -100 })
  const [trail, setTrail] = useState([])
  const [isHovering, setIsHovering] = useState(false)
  const [isClicking, setIsClicking] = useState(false)
  const [isEnabled, setIsEnabled] = useState(true)
  const animationFrameRef = useRef(null)
  const lastMousePositionRef = useRef({ x: -100, y: -100 })
  const trailTimestampsRef = useRef([])

  useEffect(() => {
    const checkMobile = () => {
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      )
      const hasTouchScreen = 'ontouchstart' in window || navigator.maxTouchPoints > 0
      setIsEnabled(!isMobile && !hasTouchScreen)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const handleMouseMove = useCallback((e) => {
    if (!isEnabled) return
    
    const x = e.clientX
    const y = e.clientY
    
    lastMousePositionRef.current = { x, y }
    setMousePosition({ x, y })
  }, [isEnabled])

  const handleMouseDown = useCallback(() => {
    setIsClicking(true)
  }, [])

  const handleMouseUp = useCallback(() => {
    setIsClicking(false)
  }, [])

  const handleMouseOver = useCallback((e) => {
    const target = e.target
    const isClickable = 
      target.tagName === 'A' ||
      target.tagName === 'BUTTON' ||
      target.tagName === 'INPUT' ||
      target.closest('a') ||
      target.closest('button') ||
      target.closest('[role="button"]') ||
      window.getComputedStyle(target).cursor === 'pointer'
    
    setIsHovering(isClickable)
  }, [])

  useEffect(() => {
    if (!isEnabled) return

    const updateTrail = () => {
      const currentTime = Date.now()
      const lastPos = lastMousePositionRef.current
      
      if (lastPos.x === -100 && lastPos.y === -100) {
        animationFrameRef.current = requestAnimationFrame(updateTrail)
        return
      }

      setTrail(prevTrail => {
        const newTrail = [...prevTrail, { ...lastPos, time: currentTime, id: currentTime + Math.random() }]
        
        if (newTrail.length > TRAIL_LENGTH) {
          return newTrail.slice(newTrail.length - TRAIL_LENGTH)
        }
        
        return newTrail
      })

      animationFrameRef.current = requestAnimationFrame(updateTrail)
    }

    animationFrameRef.current = requestAnimationFrame(updateTrail)

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mousedown', handleMouseDown)
    window.addEventListener('mouseup', handleMouseUp)
    window.addEventListener('mouseover', handleMouseOver)

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mousedown', handleMouseDown)
      window.removeEventListener('mouseup', handleMouseUp)
      window.removeEventListener('mouseover', handleMouseOver)
    }
  }, [isEnabled, handleMouseMove, handleMouseDown, handleMouseUp, handleMouseOver])

  if (!isEnabled) {
    return null
  }

  const getTrailStyle = (index, totalLength) => {
    const progress = index / (totalLength - 1)
    const size = Math.max(4, INITIAL_SIZE * Math.pow(SIZE_DECAY, totalLength - 1 - index))
    const opacity = Math.max(0, Math.pow(OPACITY_DECAY, totalLength - 1 - index))
    const scale = isClicking ? 0.6 : (isHovering ? 1.3 : 1)
    
    return {
      size,
      opacity,
      scale,
    }
  }

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden" style={{ mixBlendMode: 'normal' }}>
      {trail.map((point, index) => {
        const { size, opacity, scale } = getTrailStyle(index, trail.length)
        const isLast = index === trail.length - 1
        
        return (
          <motion.div
            key={point.id}
            className="absolute rounded-full"
            style={{
              left: point.x,
              top: point.y,
              x: '-50%',
              y: '-50%',
              width: size,
              height: size,
              opacity: opacity,
              zIndex: 9999 - index,
            }}
            initial={{
              scale: 0,
              opacity: 0,
            }}
            animate={{
              scale: scale,
              opacity: opacity,
            }}
            transition={{
              type: 'spring',
              stiffness: 300,
              damping: 25,
              mass: 0.5,
            }}
          >
            <div
              className="w-full h-full rounded-full"
              style={{
                background: isHovering
                  ? 'linear-gradient(135deg, #f97316 0%, #fb923c 50%, #fdba74 100%)'
                  : isClicking
                  ? 'linear-gradient(135deg, #14b8a6 0%, #2dd4bf 50%, #5eead4 100%)'
                  : 'linear-gradient(135deg, #14b8a6 0%, #06b6d4 50%, #0ea5e9 100%)',
                boxShadow: isLast
                  ? isHovering
                    ? '0 0 20px rgba(249, 115, 22, 0.6), 0 0 40px rgba(249, 115, 22, 0.3)'
                    : '0 0 20px rgba(20, 184, 166, 0.6), 0 0 40px rgba(20, 184, 166, 0.3)'
                  : `0 0 ${size}px rgba(20, 184, 166, ${opacity * 0.3})`,
              }}
            />
            
            {isLast && (
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{
                  background: 'transparent',
                  border: isHovering
                    ? '2px solid rgba(249, 115, 22, 0.5)'
                    : '2px solid rgba(20, 184, 166, 0.5)',
                }}
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.6, 0, 0.6],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
            )}
          </motion.div>
        )
      })}

      <motion.div
        className="absolute rounded-full pointer-events-none"
        style={{
          left: mousePosition.x,
          top: mousePosition.y,
          x: '-50%',
          y: '-50%',
          width: isHovering ? 32 : 20,
          height: isHovering ? 32 : 20,
          zIndex: 10000,
        }}
        animate={{
          scale: isClicking ? 0.5 : 1,
        }}
        transition={{
          type: 'spring',
          stiffness: 400,
          damping: 15,
        }}
      >
        <div
          className="w-full h-full rounded-full flex items-center justify-center"
          style={{
            background: isHovering
              ? 'radial-gradient(circle, rgba(249, 115, 22, 0.9) 0%, rgba(249, 115, 22, 0.6) 50%, transparent 70%)'
              : 'radial-gradient(circle, rgba(20, 184, 166, 0.9) 0%, rgba(20, 184, 166, 0.6) 50%, transparent 70%)',
            boxShadow: isHovering
              ? '0 0 30px rgba(249, 115, 22, 0.8), 0 0 60px rgba(249, 115, 22, 0.4)'
              : '0 0 30px rgba(20, 184, 166, 0.8), 0 0 60px rgba(20, 184, 166, 0.4)',
          }}
        >
          <div
            className="w-2 h-2 rounded-full"
            style={{
              background: isHovering ? '#fff' : '#fff',
              boxShadow: isHovering
                ? '0 0 10px rgba(255, 255, 255, 0.8)'
                : '0 0 10px rgba(255, 255, 255, 0.8)',
            }}
          />
        </div>
      </motion.div>

      <AnimatePresence>
        {isClicking && (
          <motion.div
            className="absolute rounded-full pointer-events-none"
            style={{
              left: mousePosition.x,
              top: mousePosition.y,
              x: '-50%',
              y: '-50%',
              width: 60,
              height: 60,
              zIndex: 10001,
            }}
            initial={{
              scale: 0,
              opacity: 1,
            }}
            animate={{
              scale: 3,
              opacity: 0,
            }}
            exit={{
              scale: 3,
              opacity: 0,
            }}
            transition={{
              duration: 0.5,
              ease: 'easeOut',
            }}
          >
            <div
              className="w-full h-full rounded-full"
              style={{
                background: 'radial-gradient(circle, rgba(20, 184, 166, 0.3) 0%, transparent 70%)',
                border: '2px solid rgba(20, 184, 166, 0.5)',
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default CursorTrail