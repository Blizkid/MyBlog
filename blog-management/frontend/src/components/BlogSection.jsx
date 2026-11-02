import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, BookOpen, ExternalLink, Tag, Clock, Eye, Star, BookMarked, X, ChevronRight, User, Calendar, TrendingUp, Sparkles, Quote, Edit3, Plus } from 'lucide-react'
import BlogEditModal from './BlogEditModal'

const API_BASE_URL = 'http://localhost:8080'

const allCategories = ['All', 'Blockchain', 'Backend', 'Frontend', 'AI', 'DevOps']

const categoryColors = {
  Blockchain: { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-200', light: 'bg-orange-50' },
  Backend: { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-200', light: 'bg-amber-50' },
  Frontend: { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-200', light: 'bg-yellow-50' },
  AI: { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-200', light: 'bg-orange-50' },
  DevOps: { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-200', light: 'bg-amber-50' },
}

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '-')
}

const parseTags = (tagsStr) => {
  if (!tagsStr) return []
  return tagsStr.split(',').map(t => t.trim()).filter(t => t)
}

const WarmOrb = ({ position, delay = 0 }) => (
  <motion.div
    className="absolute w-80 h-80 rounded-full blur-3xl opacity-20 pointer-events-none"
    style={{
      background: 'radial-gradient(circle, #fbbf24 0%, #f97316 30%, transparent 70%)',
      top: position.top,
      left: position.left,
      right: position.right,
      bottom: position.bottom,
    }}
    animate={{
      scale: [1, 1.15, 1],
      opacity: [0.15, 0.25, 0.15],
    }}
    transition={{
      duration: 8,
      repeat: Infinity,
      ease: 'easeInOut',
      delay: delay,
    }}
  />
)

const SearchInput = ({ value, onChange, onClear }) => (
  <motion.div
    className="relative w-full max-w-2xl mx-auto"
    initial={{ opacity: 0, y: -20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
  >
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
        <Search className="w-5 h-5 text-orange-400" />
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="搜索文章标题、标签、内容..."
        className="w-full pl-14 pr-14 py-4 bg-white/80 border-2 border-orange-200/50 rounded-2xl text-gray-800 placeholder-gray-400 focus:outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-100 transition-all font-mono text-sm shadow-lg shadow-orange-100/50"
      />
      {value && (
        <button
          onClick={onClear}
          className="absolute inset-y-0 right-0 pr-5 flex items-center"
        >
          <X className="w-5 h-5 text-gray-400 hover:text-orange-500 transition-colors" />
        </button>
      )}
    </div>
    
    {value && (
      <motion.div
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-2 text-center"
      >
        <span className="text-sm text-gray-500">
          正在搜索: <span className="text-orange-600 font-mono font-medium">"{value}"</span>
        </span>
      </motion.div>
    )}
  </motion.div>
)

const CategoryTabs = ({ activeCategory, onChange, tagCounts }) => (
  <motion.div
    className="flex flex-wrap justify-center gap-2 mb-10"
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay: 0.2 }}
  >
    {allCategories.map((category) => {
      const isActive = activeCategory === category
      const colors = categoryColors[category] || { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-200' }
      
      return (
        <motion.button
          key={category}
          onClick={() => onChange(category)}
          className={`relative flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
            isActive
              ? `${colors.bg} ${colors.text} border-2 ${colors.border} shadow-md shadow-orange-100/50`
              : 'bg-white/60 text-gray-600 border-2 border-transparent hover:bg-orange-50 hover:text-orange-600'
          }`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {category}
          <span className={`px-2 py-0.5 rounded-full text-xs ${
            isActive ? 'bg-white/60' : 'bg-gray-100'
          }`}>
            {tagCounts[category] || 0}
          </span>
        </motion.button>
      )
    })}
  </motion.div>
)

const PersonalBlogCard = ({ blog, index, onEdit }) => {
  const colors = categoryColors[blog.category] || categoryColors.Blockchain
  const tags = parseTags(blog.tags)
  const date = blog.createdAt ? formatDate(blog.createdAt) : '2024-01-01'
  const detailUrl = `${window.location.origin}${window.location.pathname}?blogId=${blog.id}`
  
  const handleCardClick = (e) => {
    if (e.target.closest('button')) return
    window.open(detailUrl, '_blank')
  }
  
  return (
    <motion.article
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      className="group relative"
    >
      <motion.div
        onClick={handleCardClick}
        className="block h-full bg-white/90 rounded-2xl border border-orange-100/50 p-6 hover:border-orange-300 hover:shadow-xl hover:shadow-orange-100/40 transition-all duration-300 cursor-pointer"
        whileHover={{ y: -6, scale: 1.01 }}
        style={{
          background: 'linear-gradient(135deg, #fffbeb 0%, #ffffff 50%, #fff7ed 100%)',
        }}
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-400 via-amber-400 to-yellow-400 opacity-0 group-hover:opacity-100 transition-opacity rounded-t-2xl" />
        
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${colors.bg} ${colors.text} ${colors.border} border`}>
              <Sparkles className="w-3 h-3" />
              {blog.category || '未分类'}
            </span>
            
            {blog.featured && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-orange-100 to-amber-100 text-orange-700 border border-orange-200">
                <Star className="w-3 h-3 fill-current" />
                精选
              </span>
            )}
          </div>
          
          <button
            onClick={(e) => {
              e.stopPropagation()
              onEdit(blog)
            }}
            className="p-2 hover:bg-orange-100 rounded-lg transition-colors group/btn"
          >
            <Edit3 className="w-4 h-4 text-gray-400 group-hover/btn:text-orange-500 transition-colors" />
          </button>
        </div>

        <h3 className="text-lg font-bold text-gray-800 group-hover:text-orange-600 transition-colors mb-3 line-clamp-2 leading-tight">
          {blog.title}
        </h3>

        <p className="text-gray-600 text-sm mb-5 line-clamp-3 leading-relaxed">
          {blog.excerpt || blog.content?.substring(0, 150) + '...'}
        </p>

        <div className="flex flex-wrap gap-1.5 mb-5">
          {tags.slice(0, 4).map((tag) => (
            <span
              key={tag}
              className="px-2.5 py-1 bg-orange-50 text-orange-600 rounded-full text-xs font-mono border border-orange-100"
            >
              #{tag}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-orange-50">
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-orange-400" />
              {date}
            </span>
            <span className="flex items-center gap-1">
              <Eye className="w-3.5 h-3.5 text-orange-400" />
              {blog.views || 0}
            </span>
          </div>
          
          <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-orange-500 group-hover:translate-x-1 transition-all" />
        </div>
      </motion.div>
    </motion.article>
  )
}

const SavedBlogCard = ({ blog, index, onEdit }) => {
  const colors = categoryColors[blog.category] || categoryColors.Blockchain
  const tags = parseTags(blog.tags)
  const date = blog.publishedAt || (blog.createdAt ? formatDate(blog.createdAt) : '2024-01-01')
  
  return (
    <motion.article
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
      className="group"
    >
      <motion.a
        href={blog.url}
        target="_blank"
        rel="noopener noreferrer"
        className="block h-full bg-white/80 rounded-xl border border-amber-100 p-5 hover:border-amber-300 hover:shadow-lg hover:shadow-amber-50/30 transition-all duration-300"
        whileHover={{ y: -4 }}
        style={{
          background: 'linear-gradient(135deg, #fffbeb 0%, #ffffff 100%)',
        }}
        onClick={(e) => {
          if (e.target.closest('button')) {
            e.preventDefault()
          }
        }}
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-400 to-yellow-400 opacity-0 group-hover:opacity-100 transition-opacity rounded-t-xl" />
        
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${colors.bg} ${colors.text} ${colors.border} border`}>
              {blog.category || '未分类'}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                onEdit(blog)
              }}
              className="p-1.5 hover:bg-amber-100 rounded-lg transition-colors"
            >
              <Edit3 className="w-3.5 h-3.5 text-gray-400 hover:text-amber-500 transition-colors" />
            </button>
            <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-amber-500 transition-colors" />
          </div>
        </div>

        <h3 className="text-base font-semibold text-gray-800 group-hover:text-amber-600 transition-colors mb-2 line-clamp-2 leading-tight">
          {blog.title}
        </h3>

        <p className="text-gray-500 text-xs mb-4 line-clamp-2 leading-relaxed">
          {blog.excerpt}
        </p>

        <div className="flex flex-wrap gap-1 mb-4">
          {tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="px-1.5 py-0.5 bg-amber-50 text-amber-600 rounded text-xs font-mono"
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-amber-50">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-amber-200 to-orange-200 flex items-center justify-center">
              <User className="w-3 h-3 text-amber-700" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-700">{blog.author || '未知作者'}</p>
              <p className="text-[10px] text-gray-400">{blog.source || ''}</p>
            </div>
          </div>
          <div className="flex items-center gap-1 text-[10px] text-gray-400">
            <BookMarked className="w-3 h-3 text-amber-400" />
            {date}
          </div>
        </div>
      </motion.a>
    </motion.article>
  )
}

const EmptyState = ({ type, searchQuery, onAdd }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex flex-col items-center justify-center py-16 text-center"
  >
    {searchQuery ? (
      <>
        <Search className="w-14 h-14 text-orange-300 mb-4" />
        <h4 className="text-lg font-semibold text-gray-600 mb-2">未找到匹配的文章</h4>
        <p className="text-gray-400 text-sm">尝试使用其他关键词或清除搜索</p>
      </>
    ) : (
      <>
        {type === 'personal' ? (
          <>
            <div className="w-20 h-20 rounded-full bg-orange-50 flex items-center justify-center mb-4">
              <BookOpen className="w-10 h-10 text-orange-300" />
            </div>
            <h4 className="text-lg font-semibold text-gray-600 mb-2">暂无技术博客</h4>
            <p className="text-gray-400 text-sm mb-4">开始分享你的技术经验吧</p>
            <button
              onClick={onAdd}
              className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-medium rounded-xl hover:from-orange-600 hover:to-amber-600 transition-all shadow-lg shadow-orange-200"
            >
              <Plus className="w-4 h-4" />
              写第一篇博客
            </button>
          </>
        ) : (
          <>
            <div className="w-20 h-20 rounded-full bg-amber-50 flex items-center justify-center mb-4">
              <BookMarked className="w-10 h-10 text-amber-300" />
            </div>
            <h4 className="text-lg font-semibold text-gray-600 mb-2">暂无收藏的博客</h4>
            <p className="text-gray-400 text-sm mb-4">收藏优秀的技术文章来这里</p>
            <button
              onClick={onAdd}
              className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-500 text-white font-medium rounded-xl hover:from-amber-600 hover:to-yellow-600 transition-all shadow-lg shadow-amber-200"
            >
              <Plus className="w-4 h-4" />
              添加收藏
            </button>
          </>
        )}
      </>
    )}
  </motion.div>
)

const LoadingState = () => (
  <div className="flex flex-col items-center justify-center py-16">
    <div className="w-12 h-12 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin mb-4" />
    <p className="text-gray-500">加载中...</p>
  </div>
)

const BlogSection = () => {
  const [activeTab, setActiveTab] = useState('personal')
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState('All')
  const [personalBlogs, setPersonalBlogs] = useState([])
  const [savedBlogs, setSavedBlogs] = useState([])
  const [loading, setLoading] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [isNewItem, setIsNewItem] = useState(false)

  const fetchPersonalBlogs = useCallback(async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_BASE_URL}/post/list`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
      })
      const data = await response.json()
      if (data.code === 0) {
        setPersonalBlogs(data.data || [])
      }
    } catch (err) {
      console.error('Failed to fetch personal blogs:', err)
    }
  }, [])

  const fetchSavedBlogs = useCallback(async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_BASE_URL}/saved-blog/list`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
      })
      const data = await response.json()
      if (data.code === 0) {
        setSavedBlogs(data.data || [])
      }
    } catch (err) {
      console.error('Failed to fetch saved blogs:', err)
    }
  }, [])

  useEffect(() => {
    setLoading(true)
    Promise.all([fetchPersonalBlogs(), fetchSavedBlogs()]).finally(() => {
      setLoading(false)
    })
  }, [fetchPersonalBlogs, fetchSavedBlogs])

  const handleEdit = (item, isNew = false) => {
    setEditingItem(item)
    setIsNewItem(isNew)
    setEditModalOpen(true)
  }

  const handleAddNew = () => {
    const itemType = activeTab === 'personal' ? 'post' : 'savedBlog'
    handleEdit(null, true)
  }

  const handleSave = () => {
    if (activeTab === 'personal') {
      fetchPersonalBlogs()
    } else {
      fetchSavedBlogs()
    }
  }

  const handleDelete = () => {
    if (activeTab === 'personal') {
      fetchPersonalBlogs()
    } else {
      fetchSavedBlogs()
    }
  }

  const filterBlogs = (blogs, query, category) => {
    return blogs.filter((blog) => {
      const tags = parseTags(blog.tags)
      const matchesQuery = !query || 
        (blog.title && blog.title.toLowerCase().includes(query.toLowerCase())) ||
        (blog.excerpt && blog.excerpt.toLowerCase().includes(query.toLowerCase())) ||
        (blog.content && blog.content.toLowerCase().includes(query.toLowerCase())) ||
        tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
      
      const matchesCategory = category === 'All' || blog.category === category
      
      return matchesQuery && matchesCategory
    })
  }

  const filteredPersonalBlogs = useMemo(() => 
    filterBlogs(personalBlogs, searchQuery, activeCategory),
    [personalBlogs, searchQuery, activeCategory]
  )

  const filteredSavedBlogs = useMemo(() => 
    filterBlogs(savedBlogs, searchQuery, activeCategory),
    [savedBlogs, searchQuery, activeCategory]
  )

  const tagCounts = useMemo(() => {
    const counts = { All: personalBlogs.length + savedBlogs.length }
    
    const allBlogs = [...personalBlogs, ...savedBlogs]
    allBlogs.forEach(blog => {
      const cat = blog.category || '未分类'
      counts[cat] = (counts[cat] || 0) + 1
    })
    
    return counts
  }, [personalBlogs, savedBlogs])

  const allTags = useMemo(() => {
    const tagSet = new Set()
    ;[...personalBlogs, ...savedBlogs].forEach(blog => {
      const tags = parseTags(blog.tags)
      tags.forEach(tag => tagSet.add(tag))
    })
    return [...tagSet].sort()
  }, [personalBlogs, savedBlogs])

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const sectionVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: 'easeOut',
      },
    },
  }

  return (
    <section id="blog" className="min-h-screen py-20 px-6 bg-gradient-to-b from-orange-50/50 via-amber-50/30 to-white relative overflow-hidden">
      <WarmOrb position={{ top: '5%', right: '5%' }} delay={0} />
      <WarmOrb position={{ bottom: '10%', left: '10%' }} delay={3} />
      <WarmOrb position={{ top: '50%', right: '20%' }} delay={6} />

      <div
        className="absolute inset-0 opacity-30 pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23fbbf24' fill-opacity='0.04'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      <motion.div
        className="max-w-7xl mx-auto relative z-10"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-100px' }}
      >
        <motion.div className="text-center mb-14" variants={sectionVariants}>
          <motion.div
            className="inline-flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-orange-100/80 via-amber-100/80 to-yellow-100/80 border border-orange-200/50 rounded-full mb-6 shadow-sm shadow-orange-100/50"
            whileHover={{ scale: 1.05 }}
          >
            <Quote className="w-5 h-5 text-orange-500" />
            <span className="text-sm font-medium text-orange-700 font-mono">Tech Notes</span>
          </motion.div>

          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-orange-600 via-amber-600 to-yellow-600 bg-clip-text text-transparent">
              技术手札
            </span>
          </h2>

          <p className="text-gray-600 max-w-2xl mx-auto mb-10 text-lg">
            记录技术成长路上的点滴思考，分享经验，收藏灵感
          </p>

          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            onClear={() => setSearchQuery('')}
          />
        </motion.div>

        <motion.div variants={sectionVariants}>
          <CategoryTabs
            activeCategory={activeCategory}
            onChange={setActiveCategory}
            tagCounts={tagCounts}
          />
        </motion.div>

        <motion.div className="flex justify-center mb-10" variants={sectionVariants}>
          <div className="inline-flex bg-white/80 backdrop-blur-sm rounded-2xl p-1.5 border border-orange-100 shadow-md shadow-orange-50/50">
            {[
              { id: 'personal', label: '我的博客', icon: BookOpen, count: filteredPersonalBlogs.length },
              { id: 'saved', label: '收藏文章', icon: BookMarked, count: filteredSavedBlogs.length },
            ].map((tab) => (
              <motion.button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? 'text-orange-700'
                    : 'text-gray-500 hover:text-orange-600'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <AnimatePresence>
                  {activeTab === tab.id && (
                    <motion.div
                      className="absolute inset-0 rounded-xl bg-gradient-to-r from-orange-100 to-amber-100 border border-orange-200 shadow-sm shadow-orange-100/30"
                      layoutId="activeBlogTabBg"
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                  )}
                </AnimatePresence>
                <tab.icon className="w-4 h-4 relative z-10" />
                <span className="relative z-10">{tab.label}</span>
                <span className={`relative z-10 px-2 py-0.5 rounded-full text-xs ${
                  activeTab === tab.id
                    ? 'bg-orange-500/20 text-orange-700'
                    : 'bg-gray-100 text-gray-500'
                }`}>
                  {tab.count}
                </span>
              </motion.button>
            ))}
            <button
              onClick={handleAddNew}
              className="flex items-center gap-2 px-4 py-2 ml-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-sm font-medium rounded-xl hover:from-orange-600 hover:to-amber-600 transition-all shadow-md"
            >
              <Plus className="w-4 h-4" />
              添加
            </button>
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <LoadingState />
            </motion.div>
          ) : activeTab === 'personal' ? (
            <motion.div
              key="personal"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.4 }}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 bg-orange-100 border border-orange-200 rounded-xl">
                  <BookOpen className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800">我的技术博客</h3>
                  <p className="text-gray-500 text-sm">原创技术文章与经验分享</p>
                </div>
              </div>

              {filteredPersonalBlogs.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredPersonalBlogs.map((blog, index) => (
                    <PersonalBlogCard 
                      key={blog.id} 
                      blog={blog} 
                      index={index}
                      onEdit={(item) => handleEdit(item, false)}
                    />
                  ))}
                </div>
              ) : (
                <EmptyState 
                  type="personal" 
                  searchQuery={searchQuery}
                  onAdd={handleAddNew}
                />
              )}
            </motion.div>
          ) : (
            <motion.div
              key="saved"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.4 }}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 bg-amber-100 border border-amber-200 rounded-xl">
                  <BookMarked className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800">收藏的技术文章</h3>
                  <p className="text-gray-500 text-sm">来自社区的优秀技术博客收藏</p>
                </div>
              </div>

              {filteredSavedBlogs.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {filteredSavedBlogs.map((blog, index) => (
                    <SavedBlogCard 
                      key={blog.id} 
                      blog={blog} 
                      index={index}
                      onEdit={(item) => handleEdit(item, false)}
                    />
                  ))}
                </div>
              ) : (
                <EmptyState 
                  type="saved" 
                  searchQuery={searchQuery}
                  onAdd={handleAddNew}
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div variants={sectionVariants} className="mt-16">
          <div className="bg-white/90 backdrop-blur-sm border border-orange-100/50 rounded-3xl p-8 relative overflow-hidden shadow-xl shadow-orange-50/30"
            style={{
              background: 'linear-gradient(135deg, #fffbeb 0%, #ffffff 50%, #fef3c7 100%)',
            }}
          >
            <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-orange-200/30 to-transparent rounded-full -translate-y-12 translate-x-12" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-amber-200/30 to-transparent rounded-full translate-y-12 -translate-x-12" />

            <div className="relative z-10">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                {[
                  { icon: BookOpen, label: '原创文章', value: personalBlogs.length.toString(), color: 'orange' },
                  { icon: BookMarked, label: '收藏文章', value: savedBlogs.length.toString(), color: 'amber' },
                  { icon: Tag, label: '技术标签', value: allTags.length.toString(), color: 'yellow' },
                  { icon: TrendingUp, label: '总阅读量', value: personalBlogs.reduce((sum, b) => sum + (b.views || 0), 0).toLocaleString(), color: 'orange' },
                ].map((stat, index) => {
                  const colorClass = stat.color === 'orange' ? 'text-orange-500' : stat.color === 'amber' ? 'text-amber-500' : 'text-yellow-500'
                  const bgClass = stat.color === 'orange' ? 'bg-orange-50' : stat.color === 'amber' ? 'bg-amber-50' : 'bg-yellow-50'
                  const borderClass = stat.color === 'orange' ? 'border-orange-100' : stat.color === 'amber' ? 'border-amber-100' : 'border-yellow-100'
                  
                  return (
                    <motion.div
                      key={index}
                      className={`${bgClass} rounded-2xl p-5 text-center border ${borderClass} hover:shadow-md transition-all duration-300`}
                      whileHover={{ scale: 1.05, y: -4 }}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <stat.icon className={`w-8 h-8 mx-auto mb-3 ${colorClass}`} />
                      <div className="text-3xl font-bold text-gray-800 mb-1">{stat.value}</div>
                      <div className="text-sm text-gray-500">{stat.label}</div>
                    </motion.div>
                  )
                })}
              </div>

              {allTags.length > 0 && (
                <div className="pt-6 border-t border-orange-100/50">
                  <h4 className="text-sm font-medium text-gray-600 mb-4 flex items-center gap-2">
                    <Tag className="w-4 h-4 text-orange-400" />
                    热门标签
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {allTags.slice(0, 12).map((tag) => (
                      <motion.button
                        key={tag}
                        onClick={() => setSearchQuery(tag)}
                        className="px-4 py-2 bg-white/80 border border-orange-100 rounded-xl text-gray-600 text-xs font-mono hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200 transition-all shadow-sm hover:shadow-md"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        #{tag}
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>

      <BlogEditModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        item={editingItem}
        itemType={activeTab === 'personal' ? 'post' : 'savedBlog'}
        onSave={handleSave}
        onDelete={handleDelete}
        isNew={isNewItem}
      />
    </section>
  )
}

export default BlogSection
