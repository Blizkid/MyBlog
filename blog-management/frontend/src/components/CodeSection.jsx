import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Code2, Briefcase, Github, Star, ExternalLink, Terminal, ChevronRight, Folder, GitBranch, GitCommit, Eye, Clock, Tag, Layers, Zap, Link2, Edit2, Trash2, Plus } from 'lucide-react'
import CodeEditModal from './CodeEditModal'

const API_BASE_URL = 'http://localhost:8080'

const CodeCursor = () => (
  <motion.span
    className="inline-block w-2 h-5 bg-cyan-400 ml-1"
    animate={{ opacity: [1, 0, 1] }}
    transition={{ duration: 1, repeat: Infinity }}
  />
)

const TerminalHeader = ({ title }) => (
  <div className="flex items-center gap-2 px-4 py-2 bg-cyan-50 border-b border-cyan-200">
    <div className="flex gap-1.5">
      <div className="w-3 h-3 rounded-full bg-red-400/80" />
      <div className="w-3 h-3 rounded-full bg-amber-400/80" />
      <div className="w-3 h-3 rounded-full bg-green-400/80" />
    </div>
    <span className="flex-1 text-center text-xs text-gray-500 font-mono">{title}</span>
  </div>
)

const CyanOrb = ({ position, delay = 0, color = 'radial-gradient(circle, #22d3ee 0%, #06b6d4 30%, transparent 70%)' }) => (
  <motion.div
    className="absolute w-80 h-80 rounded-full blur-3xl opacity-15 pointer-events-none"
    style={{
      background: color,
      top: position.top,
      left: position.left,
      right: position.right,
      bottom: position.bottom,
    }}
    animate={{
      scale: [1, 1.15, 1],
      opacity: [0.12, 0.2, 0.12],
    }}
    transition={{
      duration: 8,
      repeat: Infinity,
      ease: 'easeInOut',
      delay: delay,
    }}
  />
)

const CodeSection = () => {
  const [activeTab, setActiveTab] = useState('work')
  const [hoveredWork, setHoveredWork] = useState(null)
  const [hoveredProject, setHoveredProject] = useState(null)
  const [tagIndex, setTagIndex] = useState(0)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  const [workExperiences, setWorkExperiences] = useState([])
  const [personalProjects, setPersonalProjects] = useState([])
  const [recommendedRepos, setRecommendedRepos] = useState([])

  const [editModalOpen, setEditModalOpen] = useState(false)
  const [editModalItem, setEditModalItem] = useState(null)
  const [editModalType, setEditModalType] = useState('work')
  const [isNewItem, setIsNewItem] = useState(false)
  const [loading, setLoading] = useState(false)

  const allTags = ['Solidity', 'Golang', 'DeFi', 'Cross-Chain', 'AI', 'Agent', 'Security', 'Web3', 'DEX', 'Cosmos', 'Ethereum', 'AMM']

  useEffect(() => {
    const token = localStorage.getItem('token')
    setIsLoggedIn(!!token)
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setTagIndex(prev => (prev + 1) % allTags.length)
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {}

      const workUrl = token 
        ? `${API_BASE_URL}/work-experience/list` 
        : `${API_BASE_URL}/work-experience/public/list`
      const projectUrl = token 
        ? `${API_BASE_URL}/personal-project/list` 
        : `${API_BASE_URL}/personal-project/public/list`
      const repoUrl = token 
        ? `${API_BASE_URL}/recommended-repo/list` 
        : `${API_BASE_URL}/recommended-repo/public/list`

      const [workRes, projectRes, repoRes] = await Promise.all([
        token 
          ? fetch(workUrl, { method: 'POST', headers: { 'Content-Type': 'application/json', ...headers } })
          : fetch(workUrl, { headers }),
        token 
          ? fetch(projectUrl, { method: 'POST', headers: { 'Content-Type': 'application/json', ...headers } })
          : fetch(projectUrl, { headers }),
        token 
          ? fetch(repoUrl, { method: 'POST', headers: { 'Content-Type': 'application/json', ...headers } })
          : fetch(repoUrl, { headers }),
      ])

      const workData = await workRes.json()
      const projectData = await projectRes.json()
      const repoData = await repoRes.json()

      if (workData.code === 0) {
        setWorkExperiences(workData.data || [])
      }
      if (projectData.code === 0) {
        setPersonalProjects(projectData.data || [])
      }
      if (repoData.code === 0) {
        setRecommendedRepos(repoData.data || [])
      }
    } catch (err) {
      console.error('Failed to fetch code data:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (item, type) => {
    setEditModalItem(item)
    setEditModalType(type)
    setIsNewItem(false)
    setEditModalOpen(true)
  }

  const handleAdd = (type) => {
    setEditModalItem(null)
    setEditModalType(type)
    setIsNewItem(true)
    setEditModalOpen(true)
  }

  const handleSave = () => {
    fetchData()
  }

  const handleDelete = async (item, type) => {
    if (!window.confirm('确定要删除这条记录吗？')) return

    const token = localStorage.getItem('token')
    const apiPath = getApiEndpoint(type)
    const endpoint = `${apiPath}/delete`

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({ id: item.id }),
      })

      const data = await response.json()

      if (data.code === 0) {
        fetchData()
      } else {
        console.error('Delete failed:', data.message)
        alert('删除失败: ' + (data.message || '未知错误'))
      }
    } catch (err) {
      console.error('Error:', err)
      alert('网络错误，请稍后重试')
    }
  }

  const getApiEndpoint = (type) => {
    switch (type) {
      case 'work':
        return '/work-experience'
      case 'project':
        return '/personal-project'
      case 'repo':
        return '/recommended-repo'
      default:
        return `/${type}`
    }
  }

  const parseArrayField = (str) => {
    if (!str) return []
    if (Array.isArray(str)) return str
    return str.split(/[,|]/).map(s => s.trim()).filter(Boolean)
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
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

  const renderWorkExperience = (work, index) => (
    <motion.div
      key={work.id}
      className="relative group"
      initial={{ opacity: 0, x: -30 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ delay: index * 0.2, duration: 0.5 }}
      onMouseEnter={() => setHoveredWork(work.id)}
      onMouseLeave={() => setHoveredWork(null)}
    >
      <div className="flex items-start gap-6">
        <div className="relative flex flex-col items-center">
          <motion.div
            className={`w-4 h-4 rounded-full border-2 ${
              hoveredWork === work.id 
                ? 'bg-sky-400 border-sky-400 shadow-[0_0_20px_rgba(56,189,248,0.6)]' 
                : 'bg-sky-50 border-sky-400/50'
            }`}
            animate={hoveredWork === work.id ? { scale: [1, 1.3, 1] } : {}}
            transition={{ duration: 0.5 }}
          />
          {index < workExperiences.length - 1 && (
            <div className="w-0.5 h-full bg-gradient-to-b from-sky-400/30 to-transparent mt-2" />
          )}
        </div>

        <motion.div
          className={`flex-1 bg-white/90 backdrop-blur-sm rounded-2xl border p-6 transition-all duration-300 ${
            hoveredWork === work.id
              ? 'border-sky-300 shadow-[0_0_40px_rgba(56,189,248,0.1)]'
              : 'border-sky-100/50'
          }`}
          whileHover={{ y: -4 }}
          style={{
            background: 'linear-gradient(135deg, #f0f9ff 0%, #ffffff 50%, #e0f2fe 100%)',
          }}
        >
          <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
            <div>
              <h3 className="text-xl font-bold text-gray-800 group-hover:text-sky-600 transition-colors">
                {work.role}
              </h3>
              <p className="text-sky-600/80 font-mono text-sm">{work.company}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-sky-100 border border-sky-200 rounded-full text-sky-700 text-sm font-mono">
                {work.period}
              </span>
              {isLoggedIn && (
                <div className="flex gap-1">
                  <button
                    onClick={(e) => { e.stopPropagation(); handleEdit(work, 'work') }}
                    className="p-2 hover:bg-sky-100 rounded-lg transition-colors"
                    title="编辑"
                  >
                    <Edit2 className="w-4 h-4 text-sky-500" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(work, 'work') }}
                    className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                    title="删除"
                  >
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </button>
                </div>
              )}
            </div>
          </div>

          <p className="text-gray-600 mb-4 leading-relaxed">{work.description}</p>

          <div className="flex flex-wrap gap-2 mb-4">
            {parseArrayField(work.techStack).map((tech, idx) => (
              <span
                key={idx}
                className="px-2.5 py-1 bg-sky-50 border border-sky-100 rounded text-sky-600 text-xs font-mono hover:bg-sky-100 transition-colors"
              >
                {tech}
              </span>
            ))}
          </div>

          <AnimatePresence>
            {hoveredWork === work.id && parseArrayField(work.achievements).length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="pt-4 border-t border-sky-100">
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-3 font-mono">主要成就</p>
                  <ul className="space-y-2">
                    {parseArrayField(work.achievements).map((achievement, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-gray-600 text-sm">
                        <Zap className="w-4 h-4 text-sky-400/60 flex-shrink-0 mt-0.5" />
                        <span>{achievement}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </motion.div>
  )

  const renderPersonalProject = (project, index) => (
    <motion.div
      key={project.id}
      className="group relative"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ delay: index * 0.15, duration: 0.5 }}
      onMouseEnter={() => setHoveredProject(project.id)}
      onMouseLeave={() => setHoveredProject(null)}
    >
      <motion.div
        className={`h-full bg-white/90 backdrop-blur-sm rounded-2xl border p-6 flex flex-col transition-all duration-300 ${
          hoveredProject === project.id
            ? 'border-cyan-300 shadow-[0_0_40px_rgba(34,211,238,0.1)]'
            : 'border-cyan-100/50'
        }`}
        whileHover={{ y: -8 }}
        style={{
          background: 'linear-gradient(135deg, #ecfeff 0%, #ffffff 100%)',
        }}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="p-3 bg-cyan-100 border border-cyan-200 rounded-xl">
            <Folder className="w-6 h-6 text-cyan-600" />
          </div>
          <div className="flex gap-2">
            <motion.a
              href={project.github}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 bg-cyan-50 rounded-lg hover:bg-cyan-100 transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <Github className="w-4 h-4 text-gray-500 hover:text-cyan-600" />
            </motion.a>
            {project.demo && (
              <motion.a
                href={project.demo}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-cyan-50 rounded-lg hover:bg-cyan-100 transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <ExternalLink className="w-4 h-4 text-gray-500 hover:text-cyan-600" />
              </motion.a>
            )}
            {isLoggedIn && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); handleEdit(project, 'project') }}
                  className="p-2 bg-cyan-50 rounded-lg hover:bg-cyan-100 transition-colors"
                  title="编辑"
                >
                  <Edit2 className="w-4 h-4 text-cyan-500" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); handleDelete(project, 'project') }}
                  className="p-2 bg-cyan-50 rounded-lg hover:bg-red-100 transition-colors"
                  title="删除"
                >
                  <Trash2 className="w-4 h-4 text-red-400" />
                </button>
              </>
            )}
          </div>
        </div>

        <h3 className="text-lg font-bold text-gray-800 group-hover:text-cyan-600 transition-colors mb-2">
          {project.name}
        </h3>

        <p className="text-gray-600 text-sm mb-4 line-clamp-3 leading-relaxed flex-1">
          {project.description}
        </p>

        <div className="flex flex-wrap gap-1.5 mb-4">
          {parseArrayField(project.techStack).slice(0, 4).map((tech, idx) => (
            <span
              key={idx}
              className="px-2 py-0.5 bg-cyan-50 border border-cyan-100 rounded text-cyan-600 text-xs font-mono"
            >
              {tech}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-cyan-100">
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <Star className="w-3.5 h-3.5 text-cyan-400" />
              {project.stars}
            </span>
            <span className="flex items-center gap-1">
              <GitCommit className="w-3.5 h-3.5 text-cyan-500" />
              {project.commits}
            </span>
          </div>
          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
            project.status === '已完成'
              ? 'bg-teal-100 text-teal-700 border border-teal-200'
              : 'bg-cyan-100 text-cyan-700 border border-cyan-200'
          }`}>
            {project.status || '开发中'}
          </span>
        </div>
      </motion.div>
    </motion.div>
  )

  const renderRecommendedRepo = (repo, index) => (
    <motion.div
      key={repo.id}
      className="group"
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: '-30px' }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
    >
      <div className="h-full bg-white/90 backdrop-blur-sm rounded-xl border border-teal-100/50 p-5 hover:border-teal-300 hover:shadow-[0_0_30px_rgba(20,184,166,0.1)] transition-all duration-300"
        style={{
          background: 'linear-gradient(135deg, #ccfbf1 0%, #ffffff 100%)',
        }}
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-teal-100 border border-teal-200 rounded-lg">
              <GitBranch className="w-5 h-5 text-teal-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-teal-600/60 font-mono">{repo.author}</p>
              <h4 className="text-gray-800 font-semibold group-hover:text-teal-600 transition-colors truncate">
                {repo.name}
              </h4>
            </div>
          </div>
          {isLoggedIn && (
            <div className="flex gap-1 flex-shrink-0">
              <button
                onClick={(e) => { e.stopPropagation(); handleEdit(repo, 'repo') }}
                className="p-1.5 hover:bg-teal-100 rounded-lg transition-colors"
                title="编辑"
              >
                <Edit2 className="w-3.5 h-3.5 text-teal-500" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); handleDelete(repo, 'repo') }}
                className="p-1.5 hover:bg-red-100 rounded-lg transition-colors"
                title="删除"
              >
                <Trash2 className="w-3.5 h-3.5 text-red-400" />
              </button>
            </div>
          )}
        </div>

        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {repo.description}
        </p>

        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1 text-teal-500">
            <Star className="w-4 h-4 fill-current" />
            <span className="text-sm font-mono">{repo.stars?.toLocaleString() || 0}</span>
          </div>
          <span className="px-2 py-0.5 bg-teal-50 rounded text-teal-600 text-xs font-mono border border-teal-100">
            {repo.language}
          </span>
        </div>

        <a
          href={repo.github}
          target="_blank"
          rel="noopener noreferrer"
          className="block text-center px-3 py-2 bg-teal-100 border border-teal-200 rounded-lg text-teal-700 text-sm hover:bg-teal-200 transition-colors"
        >
          <Github className="w-4 h-4 inline mr-2" />
          查看仓库
        </a>
      </div>
    </motion.div>
  )

  return (
    <section id="code" className="min-h-screen py-20 px-6 bg-gradient-to-b from-sky-50/60 via-cyan-50/40 to-white relative overflow-hidden">
      <CyanOrb 
        position={{ top: '5%', right: '5%' }} 
        delay={0}
        color="radial-gradient(circle, #38bdf8 0%, #0ea5e9 30%, transparent 70%)"
      />
      <CyanOrb 
        position={{ bottom: '10%', left: '10%' }} 
        delay={3}
        color="radial-gradient(circle, #22d3ee 0%, #06b6d4 30%, transparent 70%)"
      />
      <CyanOrb 
        position={{ top: '50%', right: '20%' }} 
        delay={6}
        color="radial-gradient(circle, #14b8a6 0%, #0d9488 30%, transparent 70%)"
      />

      <div
        className="absolute inset-0 opacity-30 pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2322d3ee' fill-opacity='0.04'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      <motion.div
        className="max-w-7xl mx-auto relative z-10"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-100px' }}
      >
        <motion.div className="text-center mb-16" variants={sectionVariants}>
          <motion.div
            className="inline-flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-sky-100/80 via-cyan-100/80 to-teal-100/80 border border-cyan-200/50 rounded-full mb-6 shadow-sm shadow-cyan-100/50"
            whileHover={{ scale: 1.05 }}
          >
            <Terminal className="w-5 h-5 text-cyan-500" />
            <span className="text-sm font-medium text-cyan-700 font-mono">Code Archive</span>
          </motion.div>

          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-sky-600 via-cyan-600 to-teal-600 bg-clip-text text-transparent">
              代码档案馆
            </span>
          </h2>

          <div className="flex items-center justify-center gap-2 text-gray-600 mb-6">
            <span className="text-sm font-mono text-sky-500">$</span>
            <span className="text-sm font-mono text-cyan-600">cat</span>
            <span className="text-sm font-mono text-gray-700">portfolio.md</span>
            <CodeCursor />
          </div>

          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            探索我的项目经历、独立作品，以及推荐的优秀开源项目
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-2 overflow-hidden">
            {[...allTags, ...allTags].map((tag, idx) => (
              <motion.span
                key={idx}
                className="px-3 py-1 bg-white/80 border border-cyan-100 rounded-full text-gray-500 text-xs font-mono shadow-sm"
                initial={{ opacity: 0.3 }}
                animate={{
                  opacity: idx === tagIndex || idx === tagIndex + allTags.length ? 1 : 0.3,
                  scale: idx === tagIndex || idx === tagIndex + allTags.length ? 1.1 : 1,
                  borderColor: idx === tagIndex || idx === tagIndex + allTags.length ? 'rgba(34,211,238,0.5)' : 'rgba(165,243,252,0.5)',
                  color: idx === tagIndex || idx === tagIndex + allTags.length ? '#0891b2' : '#6b7280',
                  backgroundColor: idx === tagIndex || idx === tagIndex + allTags.length ? 'rgba(224,242,254,0.9)' : 'rgba(255,255,255,0.8)',
                }}
                transition={{ duration: 0.5 }}
              >
                #{tag}
              </motion.span>
            ))}
          </div>
        </motion.div>

        <motion.div className="flex justify-center mb-12" variants={sectionVariants}>
          <div className="inline-flex bg-white/80 backdrop-blur-sm rounded-2xl p-1.5 border border-cyan-100 shadow-md shadow-cyan-50/50">
            {[
              { id: 'work', label: '工作经历', icon: Briefcase, color: 'sky' },
              { id: 'projects', label: '个人作品', icon: Code2, color: 'cyan' },
              { id: 'repos', label: '推荐项目', icon: Github, color: 'teal' },
            ].map((tab) => (
              <motion.button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                  activeTab === tab.id
                    ? tab.color === 'sky'
                      ? 'text-sky-700'
                      : tab.color === 'cyan'
                      ? 'text-cyan-700'
                      : 'text-teal-700'
                    : 'text-gray-500 hover:text-cyan-600'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <AnimatePresence>
                  {activeTab === tab.id && (
                    <motion.div
                      className={`absolute inset-0 rounded-xl ${
                        tab.color === 'sky'
                          ? 'bg-sky-100 border border-sky-200 shadow-sm shadow-sky-100/30'
                          : tab.color === 'cyan'
                          ? 'bg-cyan-100 border border-cyan-200 shadow-sm shadow-cyan-100/30'
                          : 'bg-teal-100 border border-teal-200 shadow-sm shadow-teal-100/30'
                      }`}
                      layoutId="activeTabBg"
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                  )}
                </AnimatePresence>
                <tab.icon className="w-4 h-4 relative z-10" />
                <span className="relative z-10">{tab.label}</span>
              </motion.button>
            ))}
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {activeTab === 'work' && (
            <motion.div
              key="work"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 30 }}
              transition={{ duration: 0.4 }}
            >
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-6 justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-sky-100 border border-sky-200 rounded-xl">
                      <Briefcase className="w-6 h-6 text-sky-600" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-800">项目经历与工作经历</h3>
                      <p className="text-gray-500 text-sm">在区块链和后端开发领域的专业经验</p>
                    </div>
                  </div>
                  {isLoggedIn && (
                    <motion.button
                      onClick={() => handleAdd('work')}
                      className="flex items-center gap-2 px-4 py-2 bg-sky-100 border border-sky-200 rounded-lg text-sky-700 hover:bg-sky-200 transition-colors"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Plus className="w-4 h-4" />
                      添加经历
                    </motion.button>
                  )}
                </div>

                <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl border border-sky-100/50 overflow-hidden shadow-xl shadow-sky-50/30">
                  <TerminalHeader title="~/work/experience.log" />
                  <div className="p-6 space-y-8">
                    {loading ? (
                      <div className="text-center py-12 text-gray-500">
                        <div className="animate-spin w-8 h-8 border-4 border-sky-200 border-t-sky-500 rounded-full mx-auto mb-4" />
                        加载中...
                      </div>
                    ) : workExperiences.length > 0 ? (
                      workExperiences.map((work, index) => renderWorkExperience(work, index))
                    ) : (
                      <div className="text-center py-12 text-gray-500">
                        <Briefcase className="w-12 h-12 mx-auto mb-4 opacity-50 text-sky-400" />
                        <p>暂无工作经历</p>
                        {isLoggedIn && (
                          <button
                            onClick={() => handleAdd('work')}
                            className="mt-4 px-4 py-2 bg-sky-100 border border-sky-200 rounded-lg text-sky-700 hover:bg-sky-200 transition-colors"
                          >
                            添加第一条经历
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'projects' && (
            <motion.div
              key="projects"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.4 }}
            >
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-6 justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-cyan-100 border border-cyan-200 rounded-xl">
                      <Layers className="w-6 h-6 text-cyan-600" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-800">个人独立开发作品</h3>
                      <p className="text-gray-500 text-sm">从零到一构建的开源项目与个人实验</p>
                    </div>
                  </div>
                  {isLoggedIn && (
                    <motion.button
                      onClick={() => handleAdd('project')}
                      className="flex items-center gap-2 px-4 py-2 bg-cyan-100 border border-cyan-200 rounded-lg text-cyan-700 hover:bg-cyan-200 transition-colors"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Plus className="w-4 h-4" />
                      添加项目
                    </motion.button>
                  )}
                </div>

                <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl border border-cyan-100/50 overflow-hidden shadow-xl shadow-cyan-50/30">
                  <TerminalHeader title="~/projects/list.sh" />
                  <div className="p-6">
                    {loading ? (
                      <div className="text-center py-12 text-gray-500">
                        <div className="animate-spin w-8 h-8 border-4 border-cyan-200 border-t-cyan-500 rounded-full mx-auto mb-4" />
                        加载中...
                      </div>
                    ) : personalProjects.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {personalProjects.map((project, index) => renderPersonalProject(project, index))}
                      </div>
                    ) : (
                      <div className="text-center py-12 text-gray-500">
                        <Layers className="w-12 h-12 mx-auto mb-4 opacity-50 text-cyan-400" />
                        <p>暂无个人项目</p>
                        {isLoggedIn && (
                          <button
                            onClick={() => handleAdd('project')}
                            className="mt-4 px-4 py-2 bg-cyan-100 border border-cyan-200 rounded-lg text-cyan-700 hover:bg-cyan-200 transition-colors"
                          >
                            添加第一个项目
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'repos' && (
            <motion.div
              key="repos"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.4 }}
            >
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-6 justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-teal-100 border border-teal-200 rounded-xl">
                      <Star className="w-6 h-6 text-teal-600" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-800">推荐的优秀开源项目</h3>
                      <p className="text-gray-500 text-sm">在区块链、AI和后端开发领域值得关注的项目</p>
                    </div>
                  </div>
                  {isLoggedIn && (
                    <motion.button
                      onClick={() => handleAdd('repo')}
                      className="flex items-center gap-2 px-4 py-2 bg-teal-100 border border-teal-200 rounded-lg text-teal-700 hover:bg-teal-200 transition-colors"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Plus className="w-4 h-4" />
                      添加推荐
                    </motion.button>
                  )}
                </div>

                <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl border border-teal-100/50 overflow-hidden shadow-xl shadow-teal-50/30">
                  <TerminalHeader title="~/recommendations/stars.json" />
                  <div className="p-6">
                    {loading ? (
                      <div className="text-center py-12 text-gray-500">
                        <div className="animate-spin w-8 h-8 border-4 border-teal-200 border-t-teal-500 rounded-full mx-auto mb-4" />
                        加载中...
                      </div>
                    ) : recommendedRepos.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {recommendedRepos.map((repo, index) => renderRecommendedRepo(repo, index))}
                      </div>
                    ) : (
                      <div className="text-center py-12 text-gray-500">
                        <Star className="w-12 h-12 mx-auto mb-4 opacity-50 text-teal-400" />
                        <p>暂无推荐项目</p>
                        {isLoggedIn && (
                          <button
                            onClick={() => handleAdd('repo')}
                            className="mt-4 px-4 py-2 bg-teal-100 border border-teal-200 rounded-lg text-teal-700 hover:bg-teal-200 transition-colors"
                          >
                            添加第一个推荐
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div variants={sectionVariants} className="mt-16">
          <div className="bg-white/90 backdrop-blur-sm border border-cyan-100/50 rounded-3xl p-8 relative overflow-hidden shadow-xl shadow-cyan-50/30"
            style={{
              background: 'linear-gradient(135deg, #f0f9ff 0%, #ffffff 50%, #ecfeff 100%)',
            }}
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-sky-200/30 to-transparent rounded-full -translate-y-32 translate-x-32" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-cyan-200/30 to-transparent rounded-full translate-y-24 -translate-x-24" />

            <div className="relative z-10">
              <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="text-center md:text-left">
                  <h4 className="text-2xl font-bold bg-gradient-to-r from-sky-600 via-cyan-600 to-teal-600 bg-clip-text text-transparent mb-3">
                    想查看更多代码？
                  </h4>
                  <p className="text-gray-600 max-w-md">
                    访问我的GitHub，探索更多开源项目、代码仓库和技术实验
                  </p>
                </div>

                <motion.a
                  href="https://github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-sky-100 via-cyan-100 to-teal-100 border border-cyan-200 rounded-2xl hover:border-cyan-300 hover:shadow-[0_0_30px_rgba(34,211,238,0.2)] transition-all duration-300 group"
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Github className="w-6 h-6 text-cyan-600" />
                  <span className="text-gray-800 font-semibold">访问我的 GitHub</span>
                  <ChevronRight className="w-5 h-5 text-cyan-500 group-hover:translate-x-1 transition-transform" />
                </motion.a>
              </div>

              <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { icon: Code2, label: '公开仓库', value: '32', color: 'sky' },
                  { icon: Star, label: '获得 Star', value: '1.2k+', color: 'cyan' },
                  { icon: GitCommit, label: '代码提交', value: '5.8k+', color: 'teal' },
                  { icon: Link2, label: '关注者', value: '450+', color: 'sky' },
                ].map((stat, index) => (
                  <motion.div
                    key={index}
                    className="bg-white/80 backdrop-blur-sm rounded-xl p-4 text-center border border-cyan-100 hover:border-cyan-200 hover:shadow-md transition-all duration-300"
                    whileHover={{ scale: 1.05, y: -4 }}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <stat.icon className={`w-6 h-6 mx-auto mb-2 ${
                      stat.color === 'sky' ? 'text-sky-500' :
                      stat.color === 'cyan' ? 'text-cyan-500' :
                      'text-teal-500'
                    }`} />
                    <div className="text-2xl font-bold text-gray-800 mb-1">{stat.value}</div>
                    <div className="text-xs text-gray-500">{stat.label}</div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>

      <CodeEditModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        item={editModalItem}
        itemType={editModalType}
        onSave={handleSave}
        onDelete={handleDelete}
        isNew={isNewItem}
      />
    </section>
  )
}

export default CodeSection
