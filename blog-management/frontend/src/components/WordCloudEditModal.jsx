import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Plus, Edit2, Trash2, Save, Loader2, Tag } from 'lucide-react'

const API_BASE_URL = 'http://localhost:8080'

const categoryOptions = [
  { value: '电影类型', label: '电影类型' },
  { value: '电影名', label: '电影名' },
  { value: '音乐品味', label: '音乐品味' },
  { value: '音乐人', label: '音乐人' },
  { value: '书籍类型', label: '书籍类型' },
  { value: '书籍', label: '书籍' },
  { value: '其他', label: '其他' },
]

const colorOptions = [
  { value: 'text-pink-500', label: '粉色', preview: 'bg-pink-500' },
  { value: 'text-purple-500', label: '紫色', preview: 'bg-purple-500' },
  { value: 'text-blue-500', label: '蓝色', preview: 'bg-blue-500' },
  { value: 'text-indigo-500', label: '靛蓝色', preview: 'bg-indigo-500' },
  { value: 'text-cyan-500', label: '青色', preview: 'bg-cyan-500' },
  { value: 'text-orange-500', label: '橙色', preview: 'bg-orange-500' },
  { value: 'text-amber-500', label: '琥珀色', preview: 'bg-amber-500' },
  { value: 'text-emerald-500', label: '翠绿色', preview: 'bg-emerald-500' },
  { value: 'text-teal-500', label: '蓝绿色', preview: 'bg-teal-500' },
  { value: 'text-sky-500', label: '天蓝色', preview: 'bg-sky-500' },
  { value: 'text-rose-500', label: '玫瑰红', preview: 'bg-rose-500' },
  { value: 'text-fuchsia-500', label: '玫红色', preview: 'bg-fuchsia-500' },
  { value: 'text-violet-500', label: '紫罗兰', preview: 'bg-violet-500' },
  { value: 'text-pink-600', label: '深粉色', preview: 'bg-pink-600' },
  { value: 'text-purple-600', label: '深紫色', preview: 'bg-purple-600' },
  { value: 'text-blue-600', label: '深蓝色', preview: 'bg-blue-600' },
  { value: 'text-indigo-600', label: '深靛蓝', preview: 'bg-indigo-600' },
  { value: 'text-cyan-600', label: '深青色', preview: 'bg-cyan-600' },
  { value: 'text-red-400', label: '红色', preview: 'bg-red-400' },
  { value: 'text-green-500', label: '绿色', preview: 'bg-green-500' },
  { value: 'text-yellow-500', label: '黄色', preview: 'bg-yellow-500' },
  { value: 'text-gray-500', label: '灰色', preview: 'bg-gray-500' },
  { value: 'text-gray-600', label: '深灰色', preview: 'bg-gray-600' },
  { value: 'text-sky-600', label: '深天蓝', preview: 'bg-sky-600' },
  { value: 'text-emerald-600', label: '深翠绿', preview: 'bg-emerald-600' },
  { value: 'text-rose-600', label: '深玫瑰红', preview: 'bg-rose-600' },
  { value: 'text-fuchsia-600', label: '深玫红', preview: 'bg-fuchsia-600' },
  { value: 'text-amber-600', label: '深琥珀', preview: 'bg-amber-600' },
  { value: 'text-orange-600', label: '深橙色', preview: 'bg-orange-600' },
  { value: 'text-teal-600', label: '深蓝绿', preview: 'bg-teal-600' },
]

const defaultFormData = {
  text: '',
  category: '电影类型',
  weight: 75,
  color: 'text-pink-500',
}

const WordCloudEditModal = ({ isOpen, onClose, tags, onSave, onRefresh }) => {
  const [formData, setFormData] = useState(defaultFormData)
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(null)
  const [error, setError] = useState('')
  const [editingTag, setEditingTag] = useState(null)
  const [categoryFilter, setCategoryFilter] = useState('')

  const filteredTags = categoryFilter
    ? tags.filter(tag => tag.category === categoryFilter)
    : tags

  const categories = [...new Set(tags.map(tag => tag.category))]

  const handleInputChange = (e) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value) || 0 : value,
    }))
  }

  const resetForm = () => {
    setFormData(defaultFormData)
    setEditingTag(null)
    setError('')
  }

  const handleEdit = (tag) => {
    setEditingTag(tag)
    setFormData({
      text: tag.text,
      category: tag.category,
      weight: tag.weight,
      color: tag.color,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const token = localStorage.getItem('token')
      const endpoint = editingTag
        ? `${API_BASE_URL}/word-cloud-tag/update`
        : `${API_BASE_URL}/word-cloud-tag/create`

      let requestBody
      if (editingTag) {
        requestBody = {
          id: editingTag.id,
          wordCloudTag: {
            ...formData,
          },
        }
      } else {
        requestBody = { ...formData }
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify(requestBody),
      })

      const data = await response.json()

      if (data.code === 0) {
        resetForm()
        onRefresh()
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

  const handleDelete = async (tag) => {
    if (!window.confirm(`确定要删除标签 "${tag.text}" 吗？`)) return

    setDeleting(tag.id)
    setError('')

    try {
      const token = localStorage.getItem('token')
      const endpoint = `${API_BASE_URL}/word-cloud-tag/delete`

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({ id: tag.id }),
      })

      const data = await response.json()

      if (data.code === 0) {
        if (editingTag?.id === tag.id) {
          resetForm()
        }
        onRefresh()
      } else {
        setError(data.message || '删除失败')
      }
    } catch (err) {
      setError('网络错误，请稍后重试')
      console.error('Error:', err)
    } finally {
      setDeleting(null)
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        />

        <motion.div
          className="relative w-full max-w-5xl max-h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col"
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        >
          <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-cyan-50 to-blue-50 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-cyan-100 rounded-xl">
                <Tag className="w-5 h-5 text-cyan-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800">词云标签管理</h3>
                <p className="text-sm text-gray-500">共 {tags.length} 个标签</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          <div className="flex flex-1 overflow-hidden">
            <div className="w-96 border-r border-gray-100 overflow-y-auto">
              <div className="p-4 border-b border-gray-100">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">
                  {editingTag ? '编辑标签' : '添加新标签'}
                </h4>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">标签文字</label>
                    <input
                      type="text"
                      name="text"
                      value={formData.text}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 focus:outline-none focus:border-cyan-500 transition-colors text-sm"
                      placeholder="请输入标签文字"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">分类</label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 focus:outline-none focus:border-cyan-500 transition-colors text-sm"
                    >
                      {categoryOptions.map(cat => (
                        <option key={cat.value} value={cat.value}>{cat.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      权重: {formData.weight}
                    </label>
                    <input
                      type="range"
                      name="weight"
                      value={formData.weight}
                      onChange={handleInputChange}
                      min="1"
                      max="100"
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                    />
                    <div className="flex justify-between text-xs text-gray-400 mt-1">
                      <span>小</span>
                      <span>大</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">颜色</label>
                    <div className="grid grid-cols-6 gap-2">
                      {colorOptions.map(color => (
                        <button
                          key={color.value}
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, color: color.value }))}
                          className={`w-8 h-8 rounded-lg ${color.preview} transition-all ${
                            formData.color === color.value
                              ? 'ring-2 ring-offset-2 ring-gray-800 scale-110'
                              : 'hover:scale-105'
                          }`}
                          title={color.label}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                    >
                      {loading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Save className="w-4 h-4" />
                      )}
                      {editingTag ? '保存修改' : '添加标签'}
                    </button>
                    {editingTag && (
                      <button
                        type="button"
                        onClick={resetForm}
                        className="px-4 py-2.5 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                      >
                        取消
                      </button>
                    )}
                  </div>
                </form>

                {error && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}
              </div>

              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold text-gray-700">标签列表</h4>
                  {categoryFilter && (
                    <button
                      onClick={() => setCategoryFilter('')}
                      className="text-xs text-cyan-600 hover:text-cyan-700"
                    >
                      显示全部
                    </button>
                  )}
                </div>
                {categories.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {categories.map(cat => (
                      <button
                        key={cat}
                        onClick={() => setCategoryFilter(categoryFilter === cat ? '' : cat)}
                        className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                          categoryFilter === cat
                            ? 'bg-cyan-100 text-cyan-700'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                )}
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {filteredTags.length === 0 ? (
                    <p className="text-center text-sm text-gray-400 py-4">暂无标签</p>
                  ) : (
                    filteredTags.map((tag) => (
                      <motion.div
                        key={tag.id}
                        className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                          editingTag?.id === tag.id
                            ? 'bg-cyan-50 border border-cyan-200'
                            : 'bg-gray-50 hover:bg-gray-100 border border-transparent'
                        }`}
                        layout
                      >
                        <div className={`w-3 h-3 rounded-full ${tag.color.replace('text-', 'bg-')}`} />
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium truncate ${tag.color}`}>
                            {tag.text}
                          </p>
                          <p className="text-xs text-gray-400">{tag.category} · 权重: {tag.weight}</p>
                        </div>
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleEdit(tag)}
                            className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded transition-colors"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(tag)}
                            disabled={deleting === tag.id}
                            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                          >
                            {deleting === tag.id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Trash2 className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="flex-1 bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col">
              <div className="p-4 border-b border-gray-200 bg-white/50">
                <h4 className="text-sm font-semibold text-gray-700">实时预览</h4>
              </div>
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center text-gray-400">
                  <Tag className="w-12 h-12 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">词云将在主页面显示</p>
                  <p className="text-xs mt-1">当前标签数: {tags.length}</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default WordCloudEditModal
