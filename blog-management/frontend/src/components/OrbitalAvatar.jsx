import React, { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'

const API_BASE_URL = 'http://localhost:8080'

const OrbitalAvatar = ({ orbitRadius, avatar }) => {
  const avatarSize = 110
  const duration = 20
  const elementRef = useRef(null)
  const animationRef = useRef(null)
  const startTimeRef = useRef(null)
  const [visible, setVisible] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState('')

  useEffect(() => {
    if (avatar) {
      setAvatarUrl(avatar)
    } else {
      fetchPublicProfile()
    }
  }, [avatar])

  const fetchPublicProfile = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/user/profile/public`)
      const data = await response.json()
      if (data.code === 0 && data.data.avatar) {
        setAvatarUrl(data.data.avatar)
      }
    } catch (err) {
      console.error('Failed to fetch profile:', err)
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 500)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (!visible || !elementRef.current) return

    const animate = (timestamp) => {
      if (!startTimeRef.current) {
        startTimeRef.current = timestamp
      }
      
      const elapsed = timestamp - startTimeRef.current
      const progress = (elapsed % (duration * 1000)) / (duration * 1000)
      const angle = progress * 2 * Math.PI
      
      const x = Math.cos(angle) * orbitRadius
      const y = Math.sin(angle) * orbitRadius
      
      if (elementRef.current) {
        elementRef.current.style.transform = `translate(${x}px, ${y}px)`
      }
      
      animationRef.current = requestAnimationFrame(animate)
    }

    animationRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [visible, duration, orbitRadius])

  const AvataSVG = () => (
    <svg
      className="absolute inset-0 w-full h-full"
      viewBox="0 0 100 100"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <radialGradient id="avatarBg" cx="50%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#FFA500" />
          <stop offset="100%" stopColor="#FF8C00" />
        </radialGradient>
        <linearGradient id="bagGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8B4513" />
          <stop offset="50%" stopColor="#A0522D" />
          <stop offset="100%" stopColor="#6B3410" />
        </linearGradient>
        <linearGradient id="cloakGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#2C1810" />
          <stop offset="100%" stopColor="#1a0f0a" />
        </linearGradient>
      </defs>
      
      <circle cx="50" cy="50" r="48" fill="url(#avatarBg)" />
      
      <rect x="30" y="15" width="40" height="38" rx="6" fill="url(#bagGradient)" stroke="#5D3A1A" strokeWidth="2" />
      <rect x="35" y="20" width="30" height="8" rx="2" fill="#CD853F" stroke="#8B4513" strokeWidth="1" />
      <rect x="35" y="32" width="30" height="8" rx="2" fill="#CD853F" stroke="#8B4513" strokeWidth="1" />
      <rect x="35" y="44" width="12" height="6" rx="1" fill="#2D2D2D" stroke="#1a1a1a" strokeWidth="0.5" />
      <rect x="53" y="44" width="12" height="6" rx="1" fill="#2D2D2D" stroke="#1a1a1a" strokeWidth="0.5" />
      
      <ellipse cx="50" cy="65" rx="15" ry="12" fill="#DEB887" stroke="#CD853F" strokeWidth="1" />
      
      <path d="M35 58 Q50 48 65 58 L70 95 L30 95 Z" fill="url(#cloakGradient)" />
      <path d="M38 60 Q50 52 62 60 L68 95 L32 95 Z" fill="#3D2817" opacity="0.5" />
      
      <g transform="translate(75, 30) rotate(15)">
        <rect x="-3" y="-5" width="6" height="55" rx="1" fill="#C0C0C0" stroke="#808080" strokeWidth="0.5" />
        <rect x="-5" y="-18" width="10" height="15" rx="2" fill="#8B4513" stroke="#5D3A1A" strokeWidth="1" />
        <polygon points="0,-30 -5,-18 5,-18" fill="#E8E8E8" stroke="#A0A0A0" strokeWidth="0.5" />
      </g>
    </svg>
  )

  const AvatarContent = () => {
    if (avatarUrl) {
      return (
        <img
          src={`${API_BASE_URL}${avatarUrl}`}
          alt="Avatar"
          className="w-full h-full object-cover"
        />
      )
    }
    return (
      <div className="w-full h-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center relative overflow-hidden">
        <AvataSVG />
      </div>
    )
  }

  return (
    <>
      <style>{`
        @keyframes pulseGlow {
          0%, 100% {
            box-shadow: 0 0 10px rgba(249, 115, 22, 0.3);
          }
          50% {
            box-shadow: 0 0 30px rgba(249, 115, 22, 0.6), 0 0 60px rgba(249, 115, 22, 0.3);
          }
        }

        @keyframes ringPulse1 {
          0%, 100% {
            opacity: 0.3;
            transform: scale(1);
          }
          50% {
            opacity: 0.7;
            transform: scale(1.1);
          }
        }

        @keyframes ringPulse2 {
          0%, 100% {
            opacity: 0.2;
            transform: scale(1);
          }
          50% {
            opacity: 0.5;
            transform: scale(1.15);
          }
        }

        @keyframes ringSpin {
          0% {
            opacity: 0.1;
            transform: scale(1) rotate(0deg);
          }
          50% {
            opacity: 0.3;
            transform: scale(1.2) rotate(180deg);
          }
          100% {
            opacity: 0.1;
            transform: scale(1) rotate(360deg);
          }
        }

        .avatar-glow {
          animation: pulseGlow 3s ease-in-out infinite;
        }

        .ring-1 {
          animation: ringPulse1 3s ease-in-out infinite;
        }

        .ring-2 {
          animation: ringPulse2 4s ease-in-out infinite 1s;
        }

        .ring-3 {
          animation: ringSpin 15s linear infinite;
        }

        .avatar-container {
          width: 100%;
          height: 100%;
          border-radius: 9999px;
          overflow: hidden;
          border: 4px solid #fb923c;
          cursor: pointer;
          position: relative;
          transition: transform 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease;
        }

        .avatar-container:hover {
          transform: scale(1.15) !important;
          border-color: #f97316;
          box-shadow: 0 0 40px rgba(249, 115, 22, 0.7), 0 0 80px rgba(249, 115, 22, 0.3);
        }
      `}</style>

      <div className="absolute left-1/2 top-1/2">
        <motion.div
          ref={elementRef}
          style={{
            position: 'absolute',
            width: avatarSize,
            height: avatarSize,
            marginLeft: -avatarSize / 2,
            marginTop: -avatarSize / 2,
            transform: 'translate(0px, 0px)',
          }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ 
            opacity: visible ? 1 : 0, 
            scale: visible ? 1 : 0 
          }}
          transition={{ duration: 0.8, type: 'spring' }}
        >
          <div className="avatar-container avatar-glow">
            <AvatarContent />

            <div
              className="absolute -inset-3 rounded-full border-2 border-orange-300 pointer-events-none ring-1"
            />

            <div
              className="absolute -inset-6 rounded-full border border-orange-200 pointer-events-none ring-2"
            />

            <div
              className="absolute -inset-9 rounded-full border border-dashed border-orange-100 pointer-events-none ring-3"
            />
          </div>
        </motion.div>
      </div>
    </>
  )
}

export default OrbitalAvatar