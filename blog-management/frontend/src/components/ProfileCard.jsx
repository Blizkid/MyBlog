import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const API_BASE_URL = 'http://localhost:8080'

const ProfileCard = ({ profileData, onProfileUpdate }) => {
  const [profile, setProfile] = useState({
    chineseName: '数字游牧人',
    englishName: 'Digital Nomad',
    bio: '',
  })
  const [currentName, setCurrentName] = useState('chinese')
  const [mounted, setMounted] = useState(false)

  const defaultRoles = [
    'Influencer (>286K followers)',
    'Chromium Developer',
    'Web Developer',
    'Game Developer',
    'Game Critic',
    'Digital Nomad',
    'Trader',
  ]

  const hasEnglishName = profileData?.englishName && profileData.englishName !== ''

  useEffect(() => {
    if (profileData) {
      setProfile({
        chineseName: profileData.chineseName || '数字游牧人',
        englishName: profileData.englishName || 'Digital Nomad',
        bio: profileData.bio || '',
      })
    } else {
      fetchPublicProfile()
    }
  }, [profileData])

  const fetchPublicProfile = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/user/profile/public`)
      const data = await response.json()
      if (data.code === 0) {
        setProfile({
          chineseName: data.data.chineseName || '数字游牧人',
          englishName: data.data.englishName || 'Digital Nomad',
          bio: data.data.bio || '',
        })
      }
    } catch (err) {
      console.error('Failed to fetch profile:', err)
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 1000)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (!mounted) return
    if (!hasEnglishName) {
      setCurrentName('chinese')
      return
    }

    const interval = setInterval(() => {
      setCurrentName(prev => prev === 'chinese' ? 'english' : 'chinese')
    }, 4000)

    return () => clearInterval(interval)
  }, [mounted, hasEnglishName])

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.5 },
    },
  }

  return (
    <motion.div
      className="relative bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl border border-white/50 p-8 w-80"
      whileHover={{
        scale: 1.02,
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
      }}
      transition={{ type: 'spring', stiffness: 300 }}
    >
      <motion.div
        className="absolute -top-3 -left-3 w-6 h-6 border-t-2 border-l-2 border-orange-400 rounded-tl-lg"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      />
      <motion.div
        className="absolute -top-3 -right-3 w-6 h-6 border-t-2 border-r-2 border-orange-400 rounded-tr-lg"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
      />
      <motion.div
        className="absolute -bottom-3 -left-3 w-6 h-6 border-b-2 border-l-2 border-orange-400 rounded-bl-lg"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4 }}
      />
      <motion.div
        className="absolute -bottom-3 -right-3 w-6 h-6 border-b-2 border-r-2 border-orange-400 rounded-br-lg"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6 }}
      />

      <motion.div
        className="mb-2 text-sm text-gray-500 font-medium"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        My name is:
      </motion.div>

      <div className="relative h-14 mb-4 flex items-center justify-center overflow-hidden">
        <AnimatePresence mode="wait">
          {!mounted ? (
            <motion.div
              key="initial"
              className="absolute text-4xl font-bold text-orange-500"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: 0.7, type: 'spring' }}
            >
              {profile.chineseName}
            </motion.div>
          ) : !hasEnglishName ? (
            <motion.div
              key="chinese-only"
              className="absolute text-4xl font-bold text-orange-500"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: 'spring' }}
            >
              {profile.chineseName.split('').map((char, index) => (
                <motion.span
                  key={index}
                  className="inline-block"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: index * 0.1,
                    duration: 0.3,
                  }}
                >
                  {char}
                </motion.span>
              ))}
            </motion.div>
          ) : currentName === 'chinese' ? (
            <motion.div
              key="chinese"
              className="absolute text-4xl font-bold text-orange-500"
              initial={{ opacity: 0, x: 50, clipPath: 'inset(0 100% 0 0)' }}
              animate={{ opacity: 1, x: 0, clipPath: 'inset(0 0% 0 0)' }}
              exit={{
                opacity: 0,
                x: -50,
                clipPath: 'inset(0 0 0 100%)',
                transition: { duration: 0.8 }
              }}
              transition={{
                opacity: { duration: 0.6 },
                x: { duration: 0.8, ease: 'easeInOut' },
                clipPath: { duration: 0.8, ease: 'easeInOut' },
              }}
            >
              {profile.chineseName.split('').map((char, index) => (
                <motion.span
                  key={index}
                  className="inline-block"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: index * 0.1,
                    duration: 0.3,
                  }}
                >
                  {char}
                </motion.span>
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="english"
              className="absolute text-4xl font-bold"
              style={{
                background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 50%, #ec4899 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
              initial={{ opacity: 0, y: 30, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{
                opacity: 0,
                y: -30,
                scale: 0.8,
                transition: { duration: 0.6 }
              }}
              transition={{
                opacity: { duration: 0.8 },
                y: { duration: 0.8, ease: 'easeOut' },
                scale: { duration: 0.8, ease: 'easeOut' },
              }}
            >
              <div className="flex items-center justify-center">
                {profile.englishName.split('').map((char, index) => (
                  <motion.span
                    key={index}
                    className="inline-block"
                    initial={{ opacity: 0, rotateX: -90, y: 20 }}
                    animate={{ opacity: 1, rotateX: 0, y: 0 }}
                    transition={{
                      delay: index * 0.08,
                      duration: 0.5,
                      type: 'spring',
                      stiffness: 100,
                    }}
                  >
                    {char === ' ' ? '\u00A0' : char}
                  </motion.span>
                ))}
              </div>
              <motion.div
                className="absolute -bottom-1 left-0 right-0 h-0.5"
                style={{
                  background: 'linear-gradient(90deg, transparent, #3b82f6, #8b5cf6, #ec4899, transparent)',
                }}
                initial={{ scaleX: 0, opacity: 0 }}
                animate={{ scaleX: 1, opacity: 1 }}
                transition={{
                  delay: 0.8,
                  duration: 0.6,
                  ease: 'easeOut',
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <motion.div
        className="h-0.5 bg-gray-300 mb-4"
        initial={{ width: 0 }}
        animate={{ width: '100%' }}
        transition={{ delay: 0.9, duration: 0.8 }}
      />

      <motion.div
        className="text-sm text-gray-500 font-medium mb-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.1 }}
      >
        I'm a:
      </motion.div>

      {profile.bio ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.3, duration: 0.5 }}
        >
          <p className="text-sm text-gray-600 text-center italic leading-relaxed">
            {profile.bio}
          </p>
        </motion.div>
      ) : (
        <motion.ul
          className="space-y-1.5"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 1.3 }}
        >
          {defaultRoles.map((role, index) => (
            <motion.li
              key={index}
              className="text-sm text-gray-600 text-center"
              variants={itemVariants}
            >
              {role}
            </motion.li>
          ))}
        </motion.ul>
      )}
    </motion.div>
  )
}

export default ProfileCard