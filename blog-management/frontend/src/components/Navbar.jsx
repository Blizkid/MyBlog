import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Github, Twitter, Instagram, MessageCircle, User, LogOut, LogIn, Settings, ChevronDown, Calculator, Code2, DollarSign, BookOpen } from 'lucide-react'
import { usePageTransition } from '../contexts/PageTransitionContext'

const Navbar = ({ isLoggedIn, username, onOpenAuth, onLogout, onOpenProfileEdit, socialLinks, onOpenTool, profileData }) => {
  const { navigateToPage, getPageTheme, currentPage } = usePageTransition()

  const getDisplayName = () => {
    if (profileData?.englishName) {
      return profileData.englishName
    }
    if (profileData?.chineseName) {
      return profileData.chineseName
    }
    return 'SamuelQZQ'
  }

  const getPageIdFromHref = (href) => {
    return href.replace('#', '')
  }
  const [isToolsDropdownOpen, setIsToolsDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)

  const tools = [
    { id: 'calculator', name: '计算器', icon: Calculator, description: '科学计算器' },
    { id: 'json', name: 'JSON格式化', icon: Code2, description: '在线JSON格式化' },
    { id: 'exchange', name: '汇率计算', icon: DollarSign, description: '实时汇率转换' },
    { id: 'dictionary', name: '英文词典', icon: BookOpen, description: '在线英文词典' },
  ]

  const navItems = [
    { name: 'Favorites', href: '#favorites' },
    { name: 'Blog', href: '#blog' },
    { name: 'Code', href: '#code' },
    { name: 'Game', href: '#game' },
    { name: 'Life', href: '#life' },
  ]

  const socialIcons = [
    { icon: Github, href: socialLinks?.githubUrl || '#github', label: 'GitHub' },
    { icon: Twitter, href: socialLinks?.twitterUrl || '#twitter', label: 'Twitter' },
    { icon: Instagram, href: socialLinks?.instagramUrl || '#instagram', label: 'Instagram' },
    { icon: MessageCircle, href: '#qq', label: 'QQ' },
  ]

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsToolsDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSocialClick = (href, e) => {
    if (href && !href.startsWith('#')) {
      e.preventDefault()
      window.open(href, '_blank', 'noopener,noreferrer')
    }
  }

  const handleToolClick = (toolId) => {
    setIsToolsDropdownOpen(false)
    if (onOpenTool) {
      onOpenTool(toolId)
    }
  }

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200/50"
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          <motion.div
            className="text-xl font-bold text-gray-800 cursor-pointer"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={(e) => {
              e.preventDefault()
              navigateToPage('about', 'click', e)
              
              setTimeout(() => {
                const targetElement = document.querySelector('#about')
                if (targetElement) {
                  targetElement.scrollIntoView({ behavior: 'smooth' })
                }
              }, 100)
            }}
          >
            {getDisplayName()}
          </motion.div>

          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item, index) => {
              const pageId = getPageIdFromHref(item.href)
              const isActive = currentPage === pageId
              const theme = getPageTheme(pageId)
              
              return (
                <motion.a
                  key={item.name}
                  href={item.href}
                  className={`relative text-sm font-medium transition-colors ${
                    isActive ? 'text-gray-900' : 'text-gray-600 hover:text-gray-900'
                  }`}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  whileHover={{ scale: 1.05 }}
                  onClick={(e) => {
                    e.preventDefault()
                    navigateToPage(pageId, 'click', e)
                    
                    setTimeout(() => {
                      const targetElement = document.querySelector(item.href)
                      if (targetElement) {
                        targetElement.scrollIntoView({ behavior: 'smooth' })
                      }
                    }, 100)
                  }}
                >
                  {item.name}
                  {isActive && (
                    <motion.div
                      className="absolute -bottom-1 left-0 right-0 h-0.5 rounded-full"
                      style={{ backgroundColor: theme.primary }}
                      layoutId="activeNavIndicator"
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                  )}
                </motion.a>
              )
            })}

            <div ref={dropdownRef} className="relative">
              <motion.button
                onClick={() => setIsToolsDropdownOpen(!isToolsDropdownOpen)}
                className="flex items-center gap-1 text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                whileHover={{ scale: 1.05 }}
              >
                <span>Tools</span>
                <motion.span
                  animate={{ rotate: isToolsDropdownOpen ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown className="w-4 h-4" />
                </motion.span>
              </motion.button>

              <AnimatePresence>
                {isToolsDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-full right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden z-50"
                  >
                    <div className="p-2">
                      {tools.map((tool, index) => {
                        const Icon = tool.icon
                        return (
                          <motion.button
                            key={tool.id}
                            onClick={() => handleToolClick(tool.id)}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors text-left"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            whileHover={{ x: 4 }}
                          >
                            <div className="p-2 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg">
                              <Icon className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                              <div className="font-medium text-gray-800">{tool.name}</div>
                              <div className="text-xs text-gray-500">{tool.description}</div>
                            </div>
                          </motion.button>
                        )
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center space-x-4">
              {socialIcons.map((social, index) => (
                <motion.a
                  key={social.label}
                  href={social.href}
                  className="text-gray-500 hover:text-gray-800 transition-colors"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6 + index * 0.1, duration: 0.5 }}
                  whileHover={{ scale: 1.2, y: -2 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={(e) => handleSocialClick(social.href, e)}
                >
                  <social.icon size={20} />
                </motion.a>
              ))}
            </div>

            <div className="h-6 w-px bg-gray-300 mx-2 hidden md:block" />

            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1, duration: 0.5 }}
            >
              {isLoggedIn ? (
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                      <User className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-sm font-medium text-gray-700 hidden lg:block">
                      {username}
                    </span>
                  </div>
                  <motion.button
                    onClick={onOpenProfileEdit}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    title="编辑个人资料"
                  >
                    <Settings className="w-4 h-4" />
                    <span className="hidden sm:inline">编辑资料</span>
                  </motion.button>
                  <motion.button
                    onClick={onLogout}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    title="退出登录"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="hidden sm:inline">退出</span>
                  </motion.button>
                </div>
              ) : (
                <motion.button
                  onClick={onOpenAuth}
                  className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-medium rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg shadow-blue-500/25"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <LogIn className="w-4 h-4" />
                  <span>登录</span>
                </motion.button>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </motion.nav>
  )
}

export default Navbar
