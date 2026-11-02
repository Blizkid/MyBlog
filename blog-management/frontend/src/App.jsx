import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Navbar from './components/Navbar'
import OrbitalSection from './components/OrbitalSection'
import FavoritesSection from './components/FavoritesSection'
import GameSection from './components/GameSection'
import LifeSection from './components/LifeSection'
import CodeSection from './components/CodeSection'
import BlogSection from './components/BlogSection'
import BlogDetail from './components/BlogDetail'
import AuthModal from './components/AuthModal'
import ProfileEditModal from './components/ProfileEditModal'
import ToolModal from './components/ToolModal'
import CursorTrail from './components/CursorTrail'
import Footer from './components/Footer'
import { PageTransitionProvider, usePageTransition } from './contexts/PageTransitionContext'
import PageTransitionOverlay, { PageTransitionIndicator } from './components/PageTransitionOverlay'

const API_BASE_URL = 'http://localhost:8080'

const getBlogIdFromUrl = () => {
  const params = new URLSearchParams(window.location.search)
  return params.get('blogId')
}

const PageContentAnimation = ({ children, pageId }) => {
  const { currentPage, isTransitioning, transitionPhase, previousPage } = usePageTransition()
  const isActive = currentPage === pageId
  const wasPrevious = previousPage === pageId
  const shouldAnimate = isTransitioning && transitionPhase === 'fading'

  const getAnimationProps = () => {
    if (shouldAnimate && isActive) {
      return {
        initial: { y: 40, opacity: 0, filter: 'blur(8px)' },
        animate: { y: 0, opacity: 1, filter: 'blur(0px)' },
        transition: {
          y: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
          opacity: { duration: 0.5, ease: 'easeOut' },
          filter: { duration: 0.4, ease: 'easeOut' },
          delay: 0.1,
        },
      }
    }
    return {
      initial: false,
      animate: { y: 0, opacity: 1, filter: 'blur(0px)' },
    }
  }

  return (
    <motion.div
      key={pageId}
      {...getAnimationProps()}
    >
      {children}
    </motion.div>
  )
}

function AppContent() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [username, setUsername] = useState('')
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false)
  const [isToolModalOpen, setIsToolModalOpen] = useState(false)
  const [activeTool, setActiveTool] = useState(null)
  const [profileData, setProfileData] = useState(null)
  const [socialLinks, setSocialLinks] = useState(null)
  
  const [blogId, setBlogId] = useState(getBlogIdFromUrl())

  useEffect(() => {
    const token = localStorage.getItem('token')
    const savedUsername = localStorage.getItem('username')
    if (token && savedUsername) {
      setIsLoggedIn(true)
      setUsername(savedUsername)
    }
    fetchPublicProfile()
  }, [])

  const fetchPublicProfile = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/user/profile/public`)
      const data = await response.json()
      if (data.code === 0) {
        setProfileData(data.data)
        setSocialLinks({
          githubUrl: data.data.githubUrl,
          twitterUrl: data.data.twitterUrl,
          instagramUrl: data.data.instagramUrl,
          linkedinUrl: data.data.linkedinUrl,
        })
      }
    } catch (err) {
      console.error('Failed to fetch public profile:', err)
    }
  }

  const handleLogin = (user) => {
    setIsLoggedIn(true)
    setUsername(user)
    window.location.reload()
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('username')
    setIsLoggedIn(false)
    setUsername('')
    window.location.reload()
  }

  const openAuthModal = () => {
    setIsAuthModalOpen(true)
  }

  const closeAuthModal = () => {
    setIsAuthModalOpen(false)
  }

  const openProfileModal = () => {
    setIsProfileModalOpen(true)
  }

  const closeProfileModal = () => {
    setIsProfileModalOpen(false)
  }

  const handleProfileUpdate = (updatedProfile) => {
    if (updatedProfile) {
      setProfileData(prev => ({
        ...prev,
        ...updatedProfile,
      }))
      setSocialLinks({
        githubUrl: updatedProfile.githubUrl,
        twitterUrl: updatedProfile.twitterUrl,
        instagramUrl: updatedProfile.instagramUrl,
        linkedinUrl: updatedProfile.linkedinUrl,
      })
    }
  }

  const handleOpenTool = (toolId) => {
    setActiveTool(toolId)
    setIsToolModalOpen(true)
  }

  const handleCloseTool = () => {
    setIsToolModalOpen(false)
    setTimeout(() => setActiveTool(null), 300)
  }

  const handleBackToList = useCallback(() => {
    const url = new URL(window.location.href)
    url.searchParams.delete('blogId')
    window.history.pushState({}, '', url.toString())
    setBlogId(null)
  }, [])

  const handleBlogEdit = useCallback(() => {
  }, [])

  const handleBlogDelete = useCallback(() => {
    handleBackToList()
  }, [handleBackToList])

  if (blogId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={closeAuthModal}
          onLogin={handleLogin}
        />
        <BlogDetail
          postId={blogId}
          onBack={handleBackToList}
          onEdit={handleBlogEdit}
          onDelete={handleBlogDelete}
          isLoggedIn={isLoggedIn}
          username={username}
          onOpenAuth={openAuthModal}
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <CursorTrail />
      <PageTransitionOverlay />
      <PageTransitionIndicator />
      
      <Navbar
        isLoggedIn={isLoggedIn}
        username={username}
        onOpenAuth={openAuthModal}
        onLogout={handleLogout}
        onOpenProfileEdit={openProfileModal}
        socialLinks={socialLinks}
        onOpenTool={handleOpenTool}
        profileData={profileData}
      />
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={closeAuthModal}
        onLogin={handleLogin}
      />
      <ProfileEditModal
        isOpen={isProfileModalOpen}
        onClose={closeProfileModal}
        onProfileUpdate={handleProfileUpdate}
      />
      <ToolModal
        isOpen={isToolModalOpen}
        onClose={handleCloseTool}
        activeTool={activeTool}
      />
      <main className="relative">
        <section id="about" className="min-h-screen">
          <PageContentAnimation pageId="about">
            <OrbitalSection profileData={profileData} socialLinks={socialLinks} />
          </PageContentAnimation>
        </section>
        <PageContentAnimation pageId="favorites">
          <FavoritesSection />
        </PageContentAnimation>
        <PageContentAnimation pageId="blog">
          <BlogSection />
        </PageContentAnimation>
        <PageContentAnimation pageId="code">
          <CodeSection />
        </PageContentAnimation>
        <PageContentAnimation pageId="game">
          <GameSection />
        </PageContentAnimation>
        <PageContentAnimation pageId="life">
          <LifeSection />
        </PageContentAnimation>
      </main>
      <Footer />
    </div>
  )
}

function App() {
  return (
    <PageTransitionProvider>
      <AppContent />
    </PageTransitionProvider>
  )
}

export default App