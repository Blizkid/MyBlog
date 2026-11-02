import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Save, Trash2, Plus } from 'lucide-react'

const API_BASE_URL = 'http://localhost:8080'

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

const getDefaultFormData = (type) => {
  switch (type) {
    case 'work':
      return {
        company: '',
        role: '',
        period: '',
        description: '',
        techStack: '',
        achievements: '',
      }
    case 'project':
      return {
        name: '',
        description: '',
        techStack: '',
        github: '',
        demo: '',
        status: '开发中',
        stars: 0,
        commits: 0,
        tags: '',
      }
    case 'repo':
      return {
        name: '',
        author: '',
        description: '',
        github: '',
        stars: 0,
        language: '',
        tags: '',
      }
    default:
      return {}
  }
}

const getTypeLabels = (type) => {
  switch (type) {
    case 'work':
      return {
        name: '工作经历',
        namePlural: '工作经历',
        color: 'cyan',
      }
    case 'project':
      return {
        name: '个人项目',
        namePlural: '个人项目',
        color: 'emerald',
      }
    case 'repo':
      return {
        name: '推荐仓库',
        namePlural: '推荐仓库',
        color: 'purple',
      }
    default:
      return {
        name: '项目',
        namePlural: '项目',
        color: 'blue',
      }
  }
}

const CodeEditModal = ({ isOpen, onClose, item, itemType, onSave, onDelete, isNew }) => {
  const [formData, setFormData] = useState(getDefaultFormData(itemType))
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const typeLabels = getTypeLabels(itemType)

  useEffect(() => {
    if (item && !isNew) {
      const defaultData = getDefaultFormData(itemType)
      const itemData = { ...defaultData }
      
      Object.keys(defaultData).forEach(key => {
        if (item[key] !== undefined) {
          itemData[key] = item[key]
        }
      })

      setFormData(itemData)
    } else {
      setFormData(getDefaultFormData(itemType))
    }
  }, [item, isNew, itemType])

  const handleInputChange = (e) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const token = localStorage.getItem('token')
      const apiPath = getApiEndpoint(itemType)
      const endpoint = isNew
        ? `${apiPath}/create`
        : `${apiPath}/update`

      let requestBody
      if (isNew) {
        requestBody = { ...formData }
      } else {
        requestBody = {
          id: item.id,
          ...formData,
        }
      }

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify(requestBody),
      })

      const data = await response.json()

      if (data.code === 0) {
        onSave()
        onClose()
      } else {
        setError(data.message || '操作失败')
      }
    } catch (err) {
      setError('网络错误，请稍后重试')
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!window.confirm(`确定要删除这个${typeLabels.name}吗？`)) return

    setLoading(true)
    setError('')

    try {
      const token = localStorage.getItem('token')
      const apiPath = getApiEndpoint(itemType)
      const endpoint = `${apiPath}/delete`

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
        onDelete()
        onClose()
      } else {
        setError(data.message || '删除失败')
      }
    } catch (err) {
      setError('网络错误，请稍后重试')
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  const renderFormFields = () => {
    switch (itemType) {
      case 'work':
        return (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">公司</label>
                <input
                  type="text"
                  name="company"
                  value={formData.company}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-cyan-500 transition-colors"
                  placeholder="请输入公司名称"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">职位</label>
                <input
                  type="text"
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-cyan-500 transition-colors"
                  placeholder="请输入职位名称"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">时间段</label>
              <input
                type="text"
                name="period"
                value={formData.period}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-cyan-500 transition-colors"
                placeholder="如: 2022 - 至今"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">描述</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-cyan-500 transition-colors resize-none"
                placeholder="工作描述..."
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">技术栈 (用逗号分隔)</label>
              <input
                type="text"
                name="techStack"
                value={formData.techStack}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-cyan-500 transition-colors"
                placeholder="如: Golang, React, TypeScript"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">主要成就 (用竖线 | 分隔)</label>
              <textarea
                name="achievements"
                value={formData.achievements}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-cyan-500 transition-colors resize-none"
                placeholder="成就1|成就2|成就3"
                rows={3}
              />
            </div>
          </>
        )

      case 'project':
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">项目名称</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-emerald-500 transition-colors"
                placeholder="请输入项目名称"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">描述</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-emerald-500 transition-colors resize-none"
                placeholder="项目描述..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">GitHub 链接</label>
                <input
                  type="url"
                  name="github"
                  value={formData.github}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-emerald-500 transition-colors"
                  placeholder="https://github.com/..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">演示链接</label>
                <input
                  type="url"
                  name="demo"
                  value={formData.demo}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-emerald-500 transition-colors"
                  placeholder="https://demo.com"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">状态</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-emerald-500 transition-colors"
                >
                  <option value="开发中">开发中</option>
                  <option value="已完成">已完成</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Stars</label>
                <input
                  type="number"
                  name="stars"
                  value={formData.stars}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-emerald-500 transition-colors"
                  placeholder="128"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Commits</label>
                <input
                  type="number"
                  name="commits"
                  value={formData.commits}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-emerald-500 transition-colors"
                  placeholder="342"
                  min="0"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">技术栈 (用逗号分隔)</label>
                <input
                  type="text"
                  name="techStack"
                  value={formData.techStack}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-emerald-500 transition-colors"
                  placeholder="如: React, Node.js"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">标签 (用逗号分隔)</label>
                <input
                  type="text"
                  name="tags"
                  value={formData.tags}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-emerald-500 transition-colors"
                  placeholder="如: DeFi, AI"
                />
              </div>
            </div>
          </>
        )

      case 'repo':
        return (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">仓库名称</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500 transition-colors"
                  placeholder="请输入仓库名称"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">作者</label>
                <input
                  type="text"
                  name="author"
                  value={formData.author}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500 transition-colors"
                  placeholder="如: ethereum"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">描述</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500 transition-colors resize-none"
                placeholder="仓库描述..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">GitHub 链接</label>
                <input
                  type="url"
                  name="github"
                  value={formData.github}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500 transition-colors"
                  placeholder="https://github.com/..."
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Stars</label>
                <input
                  type="number"
                  name="stars"
                  value={formData.stars}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500 transition-colors"
                  placeholder="45600"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">编程语言</label>
                <input
                  type="text"
                  name="language"
                  value={formData.language}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500 transition-colors"
                  placeholder="如: Go, Rust"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">标签 (用逗号分隔)</label>
              <input
                type="text"
                name="tags"
                value={formData.tags}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500 transition-colors"
                placeholder="如: Blockchain, AI, Framework"
              />
            </div>
          </>
        )

      default:
        return null
    }
  }

  const getColorClasses = () => {
    switch (typeLabels.color) {
      case 'cyan':
        return {
          text: 'text-cyan-400',
          bg: 'bg-cyan-500/20',
          border: 'border-cyan-500/30',
          button: 'from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700',
        }
      case 'emerald':
        return {
          text: 'text-emerald-400',
          bg: 'bg-emerald-500/20',
          border: 'border-emerald-500/30',
          button: 'from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700',
        }
      case 'purple':
        return {
          text: 'text-purple-400',
          bg: 'bg-purple-500/20',
          border: 'border-purple-500/30',
          button: 'from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700',
        }
      default:
        return {
          text: 'text-blue-400',
          bg: 'bg-blue-500/20',
          border: 'border-blue-500/30',
          button: 'from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700',
        }
    }
  }

  const colorClasses = getColorClasses()

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="relative bg-gray-900/95 backdrop-blur-lg rounded-2xl border border-gray-700 shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto mx-4"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
          >
            <div className={`sticky top-0 bg-gray-900/95 backdrop-blur-lg border-b ${colorClasses.border} px-6 py-4 flex items-center justify-between`}>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                {isNew ? <Plus className={`w-5 h-5 ${colorClasses.text}`} /> : <Save className={`w-5 h-5 ${colorClasses.text}`} />}
                {isNew ? '添加' : '编辑'}{typeLabels.name}
              </h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                disabled={loading}
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && (
                <div className={`p-3 ${colorClasses.bg} border ${colorClasses.border} rounded-lg text-red-400 text-sm`}>
                  {error}
                </div>
              )}

              {renderFormFields()}

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className={`flex-1 flex items-center justify-center gap-2 px-6 py-2.5 bg-gradient-to-r ${colorClasses.button} disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-all shadow-lg`}
                >
                  <Save className="w-4 h-4" />
                  {loading ? '保存中...' : '保存'}
                </button>
                {!isNew && (
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={loading}
                    className="px-6 py-2.5 bg-red-600/20 hover:bg-red-600/30 disabled:bg-gray-600/20 disabled:cursor-not-allowed text-red-400 font-medium rounded-lg transition-colors border border-red-500/30"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={onClose}
                  disabled={loading}
                  className="px-6 py-2.5 bg-gray-800 hover:bg-gray-700 disabled:bg-gray-800 disabled:cursor-not-allowed text-gray-300 font-medium rounded-lg transition-colors"
                >
                  取消
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

export default CodeEditModal
