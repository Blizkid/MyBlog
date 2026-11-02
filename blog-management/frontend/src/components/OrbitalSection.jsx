import React from 'react'
import { motion } from 'framer-motion'
import ProfileCard from './ProfileCard'
import OrbitalAvatar from './OrbitalAvatar'
import OrbitalIcons from './OrbitalIcons'

const OrbitalSection = ({ profileData, socialLinks }) => {
  const orbitRadius = 250

  return (
    <section className="relative min-h-screen flex items-center justify-center pt-16 overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-20 right-20 w-96 h-96 bg-blue-100/40 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute bottom-20 left-20 w-80 h-80 bg-orange-100/40 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 2,
          }}
        />
      </div>

      <div className="relative z-10 flex items-center justify-center">
        <div className="relative" style={{ width: orbitRadius * 2.5, height: orbitRadius * 2.5 }}>
          <svg
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
            width={orbitRadius * 2}
            height={orbitRadius * 2}
            style={{ overflow: 'visible' }}
          >
            <defs>
              <linearGradient id="orbitGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f97316" stopOpacity="0.6" />
                <stop offset="50%" stopColor="#3b82f6" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#f97316" stopOpacity="0.6" />
              </linearGradient>
            </defs>
            <circle
              cx={orbitRadius}
              cy={orbitRadius}
              r={orbitRadius}
              fill="none"
              stroke="url(#orbitGradient)"
              strokeWidth="2"
              strokeDasharray="10 5"
              className="animate-pulse"
            />
          </svg>

          <svg
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
            width={orbitRadius * 1.5}
            height={orbitRadius * 1.5}
            style={{ overflow: 'visible' }}
          >
            <circle
              cx={orbitRadius * 0.75}
              cy={orbitRadius * 0.75}
              r={orbitRadius * 0.7}
              fill="none"
              stroke="#e5e7eb"
              strokeWidth="1"
              strokeDasharray="5 3"
              opacity="0.5"
            />
          </svg>

          <motion.div
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20"
            initial={{ opacity: 0, scale: 0.5, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, type: 'spring' }}
          >
            <ProfileCard profileData={profileData} />
          </motion.div>

          <OrbitalAvatar orbitRadius={orbitRadius} avatar={profileData?.avatar} />

          <OrbitalIcons orbitRadius={orbitRadius} socialLinks={socialLinks} />
        </div>
      </div>
    </section>
  )
}

export default OrbitalSection