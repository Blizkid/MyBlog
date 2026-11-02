import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Save, Trash2, Plus, Upload, Image as ImageIcon } from 'lucide-react'

const API_BASE_URL = 'http://localhost:8080'

const getApiEndpoint = (type) => {
  switch (type) {
    case 'movie':
      return '/movie'
    case 'music':
      return '/music'
    case 'book':
      return '/book'
    case 'lifeTime':
      return '/life-time-allocation'
    default:
      return `/${type}`
  }
}

const getDefaultFormData = (type) => {
  switch (type) {
    case 'movie':
      return {
        title: '',
        genre: '',
        rating: 0,
        poster: '',
        description: '',
      }
    case 'music':
      return {
        title: '',
        artist: '',
        genre: '',
        cover: '',
        audio: '',
        favorite: false,
      }
    case 'book':
      return {
        title: '',
        author: '',
        genre: '',
        cover: '',
        rating: 0,
        status: '已读完',
      }
    case 'lifeTime':
      const today = new Date()
      return {
        category: '',
        year: today.getFullYear(),
        month: today.getMonth() + 1,
        hours_per_day: 0,
        hours_per_week: 0,
        percentage: 0,
        color: 'bg-blue-400',
      }
    default:
      return {}
  }
}

const getTypeLabels = (type) => {
  switch (type) {
    case 'movie':
      return {
        name: '电影',
        namePlural: '电影',
        imageField: 'poster',
        imageLabel: '海报',
      }
    case 'music':
      return {
        name: '音乐',
        namePlural: '音乐',
        imageField: 'cover',
        imageLabel: '封面',
      }
    case 'book':
      return {
        name: '书籍',
        namePlural: '书籍',
        imageField: 'cover',
        imageLabel: '封面',
      }
    case 'lifeTime':
      return {
        name: '时间分配',
        namePlural: '时间分配',
        imageField: null,
        imageLabel: '',
      }
    default:
      return {
        name: '项目',
        namePlural: '项目',
        imageField: null,
        imageLabel: '',
      }
  }
}

const colorOptions = [
  { value: 'bg-blue-400', label: '蓝色' },
  { value: 'bg-indigo-400', label: '靛蓝色' },
  { value: 'bg-green-400', label: '绿色' },
  { value: 'bg-amber-400', label: '琥珀色' },
  { value: 'bg-red-400', label: '红色' },
  { value: 'bg-gray-400', label: '灰色' },
  { value: 'bg-pink-400', label: '粉色' },
  { value: 'bg-purple-400', label: '紫色' },
  { value: 'bg-cyan-400', label: '青色' },
  { value: 'bg-orange-400', label: '橙色' },
]

const FavoritesEditModal = ({ isOpen, onClose, item, itemType, onSave, onDelete, isNew }) => {
  const [formData, setFormData] = useState(getDefaultFormData(itemType))
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadingAudio, setUploadingAudio] = useState(false)
  const [error, setError] = useState('')
  const [previewImage, setPreviewImage] = useState('')
  const [currentAudioName, setCurrentAudioName] = useState('')
  const fileInputRef = useRef(null)
  const audioFileInputRef = useRef(null)

  const typeLabels = getTypeLabels(itemType)

  useEffect(() => {
    if (item && !isNew) {
      const defaultData = getDefaultFormData(itemType)
      const itemData = { ...defaultData }
      
      Object.keys(defaultData).forEach(key => {
        if (item[key] !== undefined) {
          itemData[key] = item[key]
        } else if (item[key.replace(/_/g, '')] !== undefined) {
          itemData[key] = item[key.replace(/_/g, '')]
        }
      })

      setFormData(itemData)
      
      const imageField = typeLabels.imageField
      if (imageField && item[imageField]) {
        setPreviewImage(item[imageField])
      } else if (imageField === 'poster' && item.poster) {
        setPreviewImage(item.poster)
      } else if (imageField === 'cover' && item.cover) {
        setPreviewImage(item.cover)
      }
      
      if (item.audio) {
        const audioParts = item.audio.split('/')
        setCurrentAudioName(audioParts[audioParts.length - 1] || '已上传音频')
      }
    } else {
      setFormData(getDefaultFormData(itemType))
      setPreviewImage('')
      setCurrentAudioName('')
    }
  }, [item, isNew, itemType, typeLabels.imageField])

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'number' ? parseFloat(value) || 0 : value,
    }))
  }

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    if (!validTypes.includes(file.type)) {
      setError('只支持 jpg, jpeg, png, gif, webp 格式的图片')
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('图片大小不能超过 10MB')
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      setPreviewImage(e.target?.result || '')
    }
    reader.readAsDataURL(file)
    setError('')

    handleFileUpload(file)
  }

  const handleFileUpload = async (file) => {
    setUploading(true)
    setError('')

    try {
      const token = localStorage.getItem('token')
      const formData = new FormData()
      formData.append('image', file)

      const response = await fetch(`${API_BASE_URL}/upload/image`, {
        method: 'POST',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        },
        body: formData,
      })

      const data = await response.json()

      if (data.code === 0) {
        const imageUrl = `${API_BASE_URL}${data.data.url}`
        const imageField = typeLabels.imageField
        if (imageField) {
          setFormData(prev => ({
            ...prev,
            [imageField]: imageUrl,
          }))
        }
        setPreviewImage(imageUrl)
      } else {
        setError(data.message || '图片上传失败')
      }
    } catch (err) {
      console.error('Upload error:', err)
      setError('图片上传失败，请稍后重试')
    } finally {
      setUploading(false)
    }
  }

  const handleAudioFileSelect = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    const validTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/m4a', 'audio/x-m4a', 'audio/flac']
    const validExtensions = ['.mp3', '.wav', '.ogg', '.m4a', '.flac']
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase()
    
    if (!validTypes.includes(file.type) && !validExtensions.includes(fileExtension)) {
      setError('只支持 mp3, wav, ogg, m4a, flac 格式的音频')
      return
    }

    if (file.size > 50 * 1024 * 1024) {
      setError('音频大小不能超过 50MB')
      return
    }

    setCurrentAudioName(file.name)
    setError('')
    handleAudioUpload(file)
  }

  const handleAudioUpload = async (file) => {
    setUploadingAudio(true)
    setError('')

    try {
      const token = localStorage.getItem('token')
      const formData = new FormData()
      formData.append('audio', file)

      const response = await fetch(`${API_BASE_URL}/upload/audio`, {
        method: 'POST',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        },
        body: formData,
      })

      const data = await response.json()

      if (data.code === 0) {
        const audioUrl = `${API_BASE_URL}${data.data.url}`
        setFormData(prev => ({
          ...prev,
          audio: audioUrl,
        }))
      } else {
        setError(data.message || '音频上传失败')
      }
    } catch (err) {
      console.error('Audio upload error:', err)
      setError('音频上传失败，请稍后重试')
    } finally {
      setUploadingAudio(false)
    }
  }

  const handleClearAudio = () => {
    setFormData(prev => ({
      ...prev,
      audio: '',
    }))
    setCurrentAudioName('')
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
        const updateData = {}
        Object.keys(formData).forEach(key => {
          updateData[key] = formData[key]
        })
        
        requestBody = {
          id: item.id,
        }
        
        if (itemType === 'movie') {
          requestBody.movie = updateData
        } else if (itemType === 'music') {
          requestBody.music = updateData
        } else if (itemType === 'book') {
          requestBody.book = updateData
        } else if (itemType === 'lifeTime') {
          requestBody.life_time_allocation = updateData
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
      case 'movie':
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">电影名称</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 focus:outline-none focus:border-pink-500 transition-colors"
                placeholder="请输入电影名称"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">类型</label>
                <input
                  type="text"
                  name="genre"
                  value={formData.genre}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 focus:outline-none focus:border-pink-500 transition-colors"
                  placeholder="如: 科幻, 剧情"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">评分 (0-10)</label>
                <input
                  type="number"
                  name="rating"
                  value={formData.rating}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 focus:outline-none focus:border-pink-500 transition-colors"
                  placeholder="9.3"
                  min="0"
                  max="10"
                  step="0.1"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">描述</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 focus:outline-none focus:border-pink-500 transition-colors resize-none"
                placeholder="电影描述..."
                rows={3}
                required
              />
            </div>
          </>
        )

      case 'music':
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">歌曲名称</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 focus:outline-none focus:border-purple-500 transition-colors"
                placeholder="请输入歌曲名称"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">艺术家</label>
                <input
                  type="text"
                  name="artist"
                  value={formData.artist}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 focus:outline-none focus:border-purple-500 transition-colors"
                  placeholder="如: Queen"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">类型</label>
                <input
                  type="text"
                  name="genre"
                  value={formData.genre}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 focus:outline-none focus:border-purple-500 transition-colors"
                  placeholder="如: 摇滚"
                  required
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="favorite"
                  checked={formData.favorite}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-purple-500 rounded focus:ring-purple-500"
                />
                <span className="text-sm text-gray-700">添加到收藏</span>
              </label>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">音频文件 (MP3)</label>
              <div className="flex gap-4 items-start">
                <div
                  className="relative w-full h-20 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg overflow-hidden cursor-pointer hover:border-purple-500 transition-colors"
                  onClick={() => audioFileInputRef.current?.click()}
                >
                  {currentAudioName ? (
                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-600">
                      <Upload className="w-6 h-6 mb-1 text-purple-500" />
                      <span className="text-sm font-medium truncate px-2 max-w-full">{currentAudioName}</span>
                    </div>
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-500">
                      <Upload className="w-8 h-8 mb-1" />
                      <span className="text-xs">点击上传MP3音频</span>
                    </div>
                  )}
                  {uploadingAudio && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <div className="flex flex-col items-center">
                        <Upload className="w-6 h-6 text-white animate-bounce" />
                        <span className="text-xs text-white mt-1">上传中...</span>
                      </div>
                    </div>
                  )}
                </div>
                {currentAudioName && (
                  <button
                    type="button"
                    onClick={handleClearAudio}
                    className="p-2 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 transition-colors"
                    title="移除音频"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
                <input
                  ref={audioFileInputRef}
                  type="file"
                  accept=".mp3,.wav,.ogg,.m4a,.flac"
                  onChange={handleAudioFileSelect}
                  className="hidden"
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                支持上传本地音频（mp3, wav, ogg, m4a, flac），最大 50MB
              </p>
            </div>
          </>
        )

      case 'book':
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">书名</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 focus:outline-none focus:border-green-500 transition-colors"
                placeholder="请输入书名"
                required
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
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 focus:outline-none focus:border-green-500 transition-colors"
                  placeholder="如: 余华"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">类型</label>
                <input
                  type="text"
                  name="genre"
                  value={formData.genre}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 focus:outline-none focus:border-green-500 transition-colors"
                  placeholder="如: 现实主义"
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">评分 (0-10)</label>
                <input
                  type="number"
                  name="rating"
                  value={formData.rating}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 focus:outline-none focus:border-green-500 transition-colors"
                  placeholder="9.3"
                  min="0"
                  max="10"
                  step="0.1"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">阅读状态</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 focus:outline-none focus:border-green-500 transition-colors"
                  required
                >
                  <option value="已读完">已读完</option>
                  <option value="阅读中">阅读中</option>
                  <option value="想读">想读</option>
                </select>
              </div>
            </div>
          </>
        )

      case 'lifeTime':
        const currentYear = new Date().getFullYear()
        const yearOptions = []
        for (let y = currentYear + 5; y >= 2000; y--) {
          yearOptions.push(y)
        }
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">类别</label>
              <input
                type="text"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 focus:outline-none focus:border-blue-500 transition-colors"
                placeholder="如: 工作, 学习"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">年份</label>
                <select
                  name="year"
                  value={formData.year || currentYear}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 focus:outline-none focus:border-blue-500 transition-colors"
                >
                  {yearOptions.map((y) => (
                    <option key={y} value={y}>{y}年</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">月份</label>
                <select
                  name="month"
                  value={formData.month || (new Date().getMonth() + 1)}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 focus:outline-none focus:border-blue-500 transition-colors"
                >
                  <option value={0}>全年</option>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((m) => (
                    <option key={m} value={m}>{m}月</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">每天(小时)</label>
                <input
                  type="number"
                  name="hours_per_day"
                  value={formData.hours_per_day}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 focus:outline-none focus:border-blue-500 transition-colors"
                  placeholder="8"
                  min="0"
                  max="24"
                  step="0.5"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">每周(小时)</label>
                <input
                  type="number"
                  name="hours_per_week"
                  value={formData.hours_per_week}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 focus:outline-none focus:border-blue-500 transition-colors"
                  placeholder="40"
                  min="0"
                  max="168"
                  step="0.5"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">百分比(%)</label>
                <input
                  type="number"
                  name="percentage"
                  value={formData.percentage}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 focus:outline-none focus:border-blue-500 transition-colors"
                  placeholder="33"
                  min="0"
                  max="100"
                  step="0.5"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">颜色</label>
              <div className="grid grid-cols-5 gap-2">
                {colorOptions.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, color: color.value }))}
                    className={`w-full h-10 rounded-lg ${color.value} ${
                      formData.color === color.value
                        ? 'ring-2 ring-offset-2 ring-gray-400'
                        : ''
                    }`}
                    title={color.label}
                  />
                ))}
              </div>
            </div>
          </>
        )

      default:
        return null
    }
  }

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
            className="relative bg-white/95 backdrop-blur-lg rounded-2xl border border-gray-200 shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto mx-4"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
          >
            <div className="sticky top-0 bg-white/95 backdrop-blur-lg border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                {isNew ? <Plus className="w-5 h-5 text-green-500" /> : <Save className="w-5 h-5 text-blue-500" />}
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
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-500 text-sm">
                  {error}
                </div>
              )}

              {typeLabels.imageField && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{typeLabels.imageLabel}图片</label>
                  <div className="flex gap-4 items-start">
                    <div
                      className="relative w-32 h-40 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg overflow-hidden cursor-pointer hover:border-blue-500 transition-colors flex-shrink-0"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      {previewImage ? (
                        <img
                          src={previewImage}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-gray-500">
                          <ImageIcon className="w-8 h-8 mb-1" />
                          <span className="text-xs">点击上传</span>
                        </div>
                      )}
                      {uploading && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <div className="flex flex-col items-center">
                            <Upload className="w-6 h-6 text-white animate-bounce" />
                            <span className="text-xs text-white mt-1">上传中...</span>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 space-y-2">
                      <input
                        type="text"
                        name={typeLabels.imageField}
                        value={formData[typeLabels.imageField] || ''}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 focus:outline-none focus:border-blue-500 transition-colors text-sm"
                        placeholder="或输入图片URL"
                      />
                      <p className="text-xs text-gray-500">
                        支持上传本地图片（jpg, jpeg, png, gif, webp）或输入图片URL
                      </p>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".jpg,.jpeg,.png,.gif,.webp"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </div>
                </div>
              )}

              {renderFormFields()}

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={loading || uploading || uploadingAudio}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-all shadow-lg shadow-blue-500/25"
                >
                  <Save className="w-4 h-4" />
                  {loading ? '保存中...' : '保存'}
                </button>
                {!isNew && (
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={loading || uploading || uploadingAudio}
                    className="px-6 py-2.5 bg-red-500/10 hover:bg-red-500/20 disabled:bg-gray-200 disabled:cursor-not-allowed text-red-500 font-medium rounded-lg transition-colors border border-red-500/30"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={onClose}
                  disabled={loading || uploadingAudio}
                  className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-100 disabled:cursor-not-allowed text-gray-700 font-medium rounded-lg transition-colors"
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

export default FavoritesEditModal
