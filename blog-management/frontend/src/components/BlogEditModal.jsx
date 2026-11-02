import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Save, Trash2, Plus, Star, Tag } from 'lucide-react'

const API_BASE_URL = 'http://localhost:8080'

const allCategories = ['Blockchain', 'Backend', 'Frontend', 'AI', 'DevOps']

const getApiEndpoint = (type) => {
  return type === 'post' ? '/post' : '/saved-blog'
}

const getDefaultFormData = (type) => {
  if (type === 'post') {
    return {
      title: '',
      excerpt: '',
      content: '',
      tags: '',
      category: 'Backend',
      featured: false,
    }
  }
  return {
    title: '',
    excerpt: '',
    author: '',
    source: '',
    tags: '',
    category: 'Backend',
    url: '',
    publishedAt: '',
  }
}

const getTypeLabels = (type) => {
  return type === 'post'
    ? {
        name: '博客',
        namePlural: '博客',
        isSavedBlog: false,
      }
    : {
        name: '收藏文章',
        namePlural: '收藏文章',
        isSavedBlog: true,
      }
}

const BlogEditModal = ({ isOpen, onClose, item, itemType, onSave, onDelete, isNew }) => {
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
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
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
    if (itemType === 'post') {
      return (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">标题</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="w-full px-4 py-2.5 bg-orange-50/50 border border-orange-200 rounded-xl text-gray-700 focus:outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-100 transition-all font-mono text-sm"
              placeholder="请输入博客标题"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">摘要</label>
            <textarea
              name="excerpt"
              value={formData.excerpt}
              onChange={handleInputChange}
              className="w-full px-4 py-2.5 bg-orange-50/50 border border-orange-200 rounded-xl text-gray-700 focus:outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-100 transition-all font-mono text-sm resize-none"
              placeholder="博客摘要（选填）..."
              rows={2}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">内容</label>
            <textarea
              name="content"
              value={formData.content}
              onChange={handleInputChange}
              className="w-full px-4 py-2.5 bg-orange-50/50 border border-orange-200 rounded-xl text-gray-700 focus:outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-100 transition-all font-mono text-sm resize-none"
              placeholder="博客内容..."
              rows={8}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">分类</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 bg-orange-50/50 border border-orange-200 rounded-xl text-gray-700 focus:outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-100 transition-all font-mono text-sm"
                required
              >
                {allCategories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">标签</label>
              <div className="relative">
                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-orange-400" />
                <input
                  type="text"
                  name="tags"
                  value={formData.tags}
                  onChange={handleInputChange}
                  className="w-full pl-9 pr-4 py-2.5 bg-orange-50/50 border border-orange-200 rounded-xl text-gray-700 focus:outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-100 transition-all font-mono text-sm"
                  placeholder="用逗号分隔，如: Go,Web3"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="featured"
                checked={formData.featured}
                onChange={handleInputChange}
                className="w-4 h-4 text-orange-500 rounded focus:ring-orange-500"
              />
              <span className="text-sm text-gray-700 flex items-center gap-1">
                <Star className="w-4 h-4 text-orange-400" />
                设为精选
              </span>
            </label>
          </div>
        </>
      )
    }

    return (
      <>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">文章标题</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            className="w-full px-4 py-2.5 bg-amber-50/50 border border-amber-200 rounded-xl text-gray-700 focus:outline-none focus:border-amber-400 focus:ring-4 focus:ring-amber-100 transition-all font-mono text-sm"
            placeholder="请输入文章标题"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">摘要</label>
          <textarea
            name="excerpt"
            value={formData.excerpt}
            onChange={handleInputChange}
            className="w-full px-4 py-2.5 bg-amber-50/50 border border-amber-200 rounded-xl text-gray-700 focus:outline-none focus:border-amber-400 focus:ring-4 focus:ring-amber-100 transition-all font-mono text-sm resize-none"
            placeholder="文章摘要（选填）..."
            rows={2}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">作者</label>
            <input
              type="text"
              name="author"
              value={formData.author}
              onChange={handleInputChange}
              className="w-full px-4 py-2.5 bg-amber-50/50 border border-amber-200 rounded-xl text-gray-700 focus:outline-none focus:border-amber-400 focus:ring-4 focus:ring-amber-100 transition-all font-mono text-sm"
              placeholder="文章作者"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">来源</label>
            <input
              type="text"
              name="source"
              value={formData.source}
              onChange={handleInputChange}
              className="w-full px-4 py-2.5 bg-amber-50/50 border border-amber-200 rounded-xl text-gray-700 focus:outline-none focus:border-amber-400 focus:ring-4 focus:ring-amber-100 transition-all font-mono text-sm"
              placeholder="如: medium.com"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">原文链接</label>
          <input
            type="url"
            name="url"
            value={formData.url}
            onChange={handleInputChange}
            className="w-full px-4 py-2.5 bg-amber-50/50 border border-amber-200 rounded-xl text-gray-700 focus:outline-none focus:border-amber-400 focus:ring-4 focus:ring-amber-100 transition-all font-mono text-sm"
            placeholder="https://example.com/article"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">分类</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              className="w-full px-4 py-2.5 bg-amber-50/50 border border-amber-200 rounded-xl text-gray-700 focus:outline-none focus:border-amber-400 focus:ring-4 focus:ring-amber-100 transition-all font-mono text-sm"
              required
            >
              {allCategories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">发布日期</label>
            <input
              type="date"
              name="publishedAt"
              value={formData.publishedAt}
              onChange={handleInputChange}
              className="w-full px-4 py-2.5 bg-amber-50/50 border border-amber-200 rounded-xl text-gray-700 focus:outline-none focus:border-amber-400 focus:ring-4 focus:ring-amber-100 transition-all font-mono text-sm"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">标签</label>
          <div className="relative">
            <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-400" />
            <input
              type="text"
              name="tags"
              value={formData.tags}
              onChange={handleInputChange}
              className="w-full pl-9 pr-4 py-2.5 bg-amber-50/50 border border-amber-200 rounded-xl text-gray-700 focus:outline-none focus:border-amber-400 focus:ring-4 focus:ring-amber-100 transition-all font-mono text-sm"
              placeholder="用逗号分隔，如: Go,Web3"
            />
          </div>
        </div>
      </>
    )
  }

  const colorClass = itemType === 'post' ? 'orange' : 'amber'
  const bgClass = colorClass === 'orange' ? 'bg-orange-500' : 'bg-amber-500'
  const textClass = colorClass === 'orange' ? 'text-orange-600' : 'text-amber-600'
  const borderClass = colorClass === 'orange' ? 'border-orange-200' : 'border-amber-200'
  const lightBgClass = colorClass === 'orange' ? 'bg-orange-50' : 'bg-amber-50'

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
            className="relative bg-white/95 backdrop-blur-lg rounded-2xl border border-gray-200 shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto mx-4"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
          >
            <div className={`sticky top-0 bg-white/95 backdrop-blur-lg border-b ${borderClass} px-6 py-4 flex items-center justify-between`}>
              <h2 className={`text-xl font-bold text-gray-800 flex items-center gap-2`}>
                {isNew ? <Plus className={`w-5 h-5 ${textClass}`} /> : <Save className={`w-5 h-5 ${textClass}`} />}
                {isNew ? '添加' : '编辑'}{typeLabels.name}
              </h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                disabled={loading}
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && (
                <div className={`p-3 ${lightBgClass}/50 border ${borderClass} rounded-xl text-red-500 text-sm`}>
                  {error}
                </div>
              )}

              {renderFormFields()}

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className={`flex-1 flex items-center justify-center gap-2 px-6 py-2.5 bg-gradient-to-r ${colorClass === 'orange' ? 'from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600' : 'from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600'} disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-all shadow-lg`}
                >
                  <Save className="w-4 h-4" />
                  {loading ? '保存中...' : '保存'}
                </button>
                {!isNew && (
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={loading}
                    className="px-6 py-2.5 bg-red-500/10 hover:bg-red-500/20 disabled:bg-gray-200 disabled:cursor-not-allowed text-red-500 font-medium rounded-xl transition-colors border border-red-500/30"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={onClose}
                  disabled={loading}
                  className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-100 disabled:cursor-not-allowed text-gray-700 font-medium rounded-xl transition-colors"
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

export default BlogEditModal
