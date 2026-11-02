import React, { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'

const API_BASE_URL = 'http://localhost:8080'

const OrbitalIcons = ({ orbitRadius, socialLinks }) => {
  const [icons, setIcons] = useState([
    {
      id: 'github',
      name: 'GitHub',
      size: 36,
      startAngle: 0,
      duration: 25,
      color: '#333333',
      href: 'https://github.com',
    },
    {
      id: 'twitter',
      name: 'Twitter',
      size: 32,
      startAngle: 120,
      duration: 30,
      color: '#1DA1F2',
      href: 'https://twitter.com',
    },
    {
      id: 'instagram',
      name: 'Instagram',
      size: 32,
      startAngle: 240,
      duration: 28,
      color: '#E4405F',
      href: 'https://instagram.com',
    },
    {
      id: 'linkedin',
      name: 'LinkedIn',
      size: 28,
      startAngle: 60,
      duration: 35,
      color: '#0A66C2',
      href: 'https://linkedin.com',
    },
  ])

  const iconRefs = useRef({})
  const animationRefs = useRef({})
  const startTimeRefs = useRef({})
  const innerRadius = orbitRadius * 0.7

  useEffect(() => {
    if (socialLinks) {
      updateIconsFromSocialLinks(socialLinks)
    } else {
      fetchPublicProfile()
    }
  }, [socialLinks])

  const fetchPublicProfile = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/user/profile/public`)
      const data = await response.json()
      if (data.code === 0) {
        updateIconsFromSocialLinks(data.data)
      }
    } catch (err) {
      console.error('Failed to fetch profile:', err)
    }
  }

  const updateIconsFromSocialLinks = (links) => {
    setIcons(prev => {
      const newIcons = [...prev]
      
      const githubIndex = newIcons.findIndex(i => i.id === 'github')
      if (githubIndex !== -1 && links.githubUrl) {
        newIcons[githubIndex] = { ...newIcons[githubIndex], href: links.githubUrl }
      }
      
      const twitterIndex = newIcons.findIndex(i => i.id === 'twitter')
      if (twitterIndex !== -1 && links.twitterUrl) {
        newIcons[twitterIndex] = { ...newIcons[twitterIndex], href: links.twitterUrl }
      }
      
      const instagramIndex = newIcons.findIndex(i => i.id === 'instagram')
      if (instagramIndex !== -1 && links.instagramUrl) {
        newIcons[instagramIndex] = { ...newIcons[instagramIndex], href: links.instagramUrl }
      }
      
      const linkedinIndex = newIcons.findIndex(i => i.id === 'linkedin')
      if (linkedinIndex !== -1 && links.linkedinUrl) {
        newIcons[linkedinIndex] = { ...newIcons[linkedinIndex], href: links.linkedinUrl }
      }
      
      return newIcons
    })
  }

  useEffect(() => {
    icons.forEach((icon) => {
      const animate = (timestamp) => {
        if (!startTimeRefs.current[icon.id]) {
          startTimeRefs.current[icon.id] = timestamp
        }
        
        const elapsed = timestamp - startTimeRefs.current[icon.id]
        const progress = (elapsed % (icon.duration * 1000)) / (icon.duration * 1000)
        const startRad = (icon.startAngle * Math.PI) / 180
        const angle = startRad + progress * 2 * Math.PI
        
        const x = Math.cos(angle) * innerRadius
        const y = Math.sin(angle) * innerRadius
        
        if (iconRefs.current[icon.id]) {
          iconRefs.current[icon.id].style.transform = `translate(${x}px, ${y}px)`
        }
        
        animationRefs.current[icon.id] = requestAnimationFrame(animate)
      }

      animationRefs.current[icon.id] = requestAnimationFrame(animate)
    })

    return () => {
      icons.forEach((icon) => {
        if (animationRefs.current[icon.id]) {
          cancelAnimationFrame(animationRefs.current[icon.id])
        }
      })
    }
  }, [innerRadius, icons])

  const handleIconClick = (href) => {
    if (href) {
      window.open(href, '_blank', 'noopener,noreferrer')
    }
  }

  const renderIcon = (icon) => {
    switch (icon.id) {
      case 'github':
        return (
          <svg viewBox="0 0 24 24" className="w-full h-full" fill={icon.color}>
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
          </svg>
        )
      case 'twitter':
        return (
          <svg viewBox="0 0 24 24" className="w-full h-full" fill={icon.color}>
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
          </svg>
        )
      case 'instagram':
        return (
          <svg viewBox="0 0 24 24" className="w-full h-full">
            <defs>
              <linearGradient id="instaGrad" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#FCAF45" />
                <stop offset="25%" stopColor="#F77737" />
                <stop offset="50%" stopColor="#E1306C" />
                <stop offset="75%" stopColor="#C13584" />
                <stop offset="100%" stopColor="#833AB4" />
              </linearGradient>
            </defs>
            <rect x="2" y="2" width="20" height="20" rx="5" fill="url(#instaGrad)"/>
            <circle cx="12" cy="12" r="4.5" fill="white"/>
            <circle cx="16" cy="8" r="1.2" fill="white"/>
          </svg>
        )
      case 'linkedin':
        return (
          <svg viewBox="0 0 24 24" className="w-full h-full" fill="white">
            <rect x="0" y="0" width="24" height="24" rx="3" fill={icon.color}/>
            <circle cx="6.5" cy="6.5" r="2.5"/>
            <rect x="10" y="11" width="4" height="9"/>
            <path d="M16 11c1.66 0 2.997 1.09 3.435 2.582L20 14v6h-4v-4.5c0-1.38-1.12-2.5-2.5-2.5S11 14.12 11 15.5V20H7v-9h4v1.256c.622-.798 1.842-1.256 3.065-1.256H16z"/>
          </svg>
        )
      default:
        return (
          <div
            className="w-full h-full rounded-full"
            style={{ backgroundColor: icon.color }}
          />
        )
    }
  }

  return (
    <div className="absolute left-1/2 top-1/2">
      {icons.map((icon, index) => {
        const startRad = (icon.startAngle * Math.PI) / 180
        const initialX = Math.cos(startRad) * innerRadius
        const initialY = Math.sin(startRad) * innerRadius

        return (
          <motion.div
            key={icon.id}
            ref={(el) => {
              if (el) iconRefs.current[icon.id] = el
            }}
            style={{
              position: 'absolute',
              width: icon.size,
              height: icon.size,
              marginLeft: -icon.size / 2,
              marginTop: -icon.size / 2,
              transform: `translate(${initialX}px, ${initialY}px)`,
            }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1 + index * 0.3, duration: 0.5 }}
          >
            <motion.div
              className="w-full h-full drop-shadow-lg cursor-pointer"
              whileHover={{
                scale: 1.3,
                zIndex: 50,
                filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.3))',
              }}
              whileTap={{ scale: 0.9 }}
              onClick={() => handleIconClick(icon.href)}
              title={icon.name}
            >
              {renderIcon(icon)}
            </motion.div>
          </motion.div>
        )
      })}
    </div>
  )
}

export default OrbitalIcons