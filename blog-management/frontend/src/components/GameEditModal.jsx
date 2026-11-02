import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Save, Trash2, Plus, Upload, Image as ImageIcon } from 'lucide-react'

const API_BASE_URL = 'http://localhost:8080'

const GameEditModal = ({ isOpen, onClose, game, gameType, onSave, onDelete, isNew }) => {
  const [formData, setFormData] = useState({
    name: '',
    genre: '',
    hours: 0,
    rating: 0,
    poster: '',
    description: '',
    status: '开发中',
    progress: 0,
    techStack: '',
  })

  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [previewImage, setPreviewImage] = useState('')
  const fileInputRef = useRef(null)

  useEffect(() => {
    if (game && !isNew) {
      setFormData({
        name: game.name || '',
        genre: game.genre || '',
        hours: game.hours || 0,
        rating: game.rating || 0,
        poster: game.poster || '',
        description: game.description || '',
        status: game.status || '开发中',
        progress: game.progress || 0,
        techStack: game.techStack || '',
      })
      setPreviewImage(game.poster || '')
    } else {
      setFormData({
        name: '',
        genre: '',
        hours: 0,
        rating: 0,
        poster: '',
        description: '',
        status: '开发中',
        progress: 0,
        techStack: '',
      })
      setPreviewImage('')
    }
  }, [game, isNew, gameType])

  const handleInputChange = (e) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value,
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
        setFormData(prev => ({
          ...prev,
          poster: imageUrl,
        }))
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

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const token = localStorage.getItem('token')
      const endpoint = isNew
        ? (gameType === 'favorite' ? '/favorite-game/create' : '/developed-game/create')
        : (gameType === 'favorite' ? '/favorite-game/update' : '/developed-game/update')

      let requestBody
      if (isNew) {
        if (gameType === 'favorite') {
          requestBody = {
            name: formData.name,
            genre: formData.genre,
            hours: parseInt(formData.hours) || 0,
            rating: parseFloat(formData.rating) || 0,
            poster: formData.poster,
            description: formData.description,
          }
        } else {
          requestBody = {
            name: formData.name,
            status: formData.status,
            progress: parseInt(formData.progress) || 0,
            tech_stack: formData.techStack,
            poster: formData.poster,
          }
        }
      } else {
        const gameData = gameType === 'favorite'
          ? {
              name: formData.name,
              genre: formData.genre,
              hours: parseInt(formData.hours) || 0,
              rating: parseFloat(formData.rating) || 0,
              poster: formData.poster,
              description: formData.description,
            }
          : {
              name: formData.name,
              status: formData.status,
              progress: parseInt(formData.progress) || 0,
              tech_stack: formData.techStack,
              poster: formData.poster,
            }

        requestBody = {
          id: game.id,
          [gameType === 'favorite' ? 'favorite_game' : 'developed_game']: gameData,
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
    if (!window.confirm('确定要删除这个游戏吗？')) return

    setLoading(true)
    setError('')

    try {
      const token = localStorage.getItem('token')
      const endpoint = gameType === 'favorite'
        ? '/favorite-game/delete'
        : '/developed-game/delete'

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({ id: game.id }),
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
            <div className="sticky top-0 bg-gray-900/95 backdrop-blur-lg border-b border-gray-700 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                {isNew ? <Plus className="w-5 h-5 text-green-400" /> : <Save className="w-5 h-5 text-blue-400" />}
                {isNew ? '添加' : '编辑'}{gameType === 'favorite' ? '喜爱的游戏' : '开发的游戏'}
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
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">游戏名称</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500 transition-colors"
                  placeholder="请输入游戏名称"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">海报图片</label>
                <div className="flex gap-4 items-start">
                  <div
                    className="relative w-32 h-40 bg-gray-800 border-2 border-dashed border-gray-600 rounded-lg overflow-hidden cursor-pointer hover:border-blue-500 transition-colors flex-shrink-0"
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
                      name="poster"
                      value={formData.poster}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500 transition-colors text-sm"
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

              {gameType === 'favorite' ? (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">类型</label>
                      <input
                        type="text"
                        name="genre"
                        value={formData.genre}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500 transition-colors"
                        placeholder="如: RPG, 动作, 魂系"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">游戏时长(小时)</label>
                      <input
                        type="number"
                        name="hours"
                        value={formData.hours}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500 transition-colors"
                        placeholder="120"
                        min="0"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">评分 (0-5)</label>
                    <input
                      type="number"
                      name="rating"
                      value={formData.rating}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500 transition-colors"
                      placeholder="4.8"
                      min="0"
                      max="5"
                      step="0.1"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">描述</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500 transition-colors resize-none"
                      placeholder="游戏描述..."
                      rows={3}
                      required
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">状态</label>
                      <select
                        name="status"
                        value={formData.status}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500 transition-colors"
                        required
                      >
                        <option value="规划中">规划中</option>
                        <option value="开发中">开发中</option>
                        <option value="已完成">已完成</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">进度 (%)</label>
                      <input
                        type="number"
                        name="progress"
                        value={formData.progress}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500 transition-colors"
                        placeholder="65"
                        min="0"
                        max="100"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">技术栈 (用逗号分隔)</label>
                    <input
                      type="text"
                      name="techStack"
                      value={formData.techStack}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500 transition-colors"
                      placeholder="如: Unity, C#, React"
                      required
                    />
                  </div>
                </>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={loading || uploading}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
                >
                  <Save className="w-4 h-4" />
                  {loading ? '保存中...' : '保存'}
                </button>
                {!isNew && (
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={loading || uploading}
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

export default GameEditModal
