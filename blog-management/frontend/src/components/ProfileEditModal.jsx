import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Eye, EyeOff, Mail, Lock, User, AlertCircle, CheckCircle, Upload, Globe, Link2, Save, RefreshCw, Gamepad2, Key, User as UserIcon } from 'lucide-react'

const API_BASE_URL = 'http://localhost:8080'

const ProfileEditModal = ({ isOpen, onClose, onProfileUpdate }) => {
  const [activeTab, setActiveTab] = useState('basic')
  const [showOldPassword, setShowOldPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [testingConnection, setTestingConnection] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    chineseName: '',
    englishName: '',
    avatar: '',
    githubUrl: '',
    instagramUrl: '',
    twitterUrl: '',
    linkedinUrl: '',
    bio: '',
    steamAPIKey: '',
    steamID: '',
  })
  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  useEffect(() => {
    if (isOpen) {
      fetchProfile()
    }
  }, [isOpen])

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token')
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    }
  }

  const fetchProfile = async () => {
    setLoading(true)
    setError('')
    
    const token = localStorage.getItem('token')
    if (!token) {
      setError('请先登录后再修改个人资料')
      setLoading(false)
      return
    }

    try {
      const response = await fetch(`${API_BASE_URL}/user/profile`, {
        method: 'GET',
        headers: getAuthHeaders(),
      })
      
      if (!response.ok) {
        if (response.status === 401) {
          setError('登录已过期，请重新登录')
        } else if (response.status === 404) {
          setError('用户不存在')
        } else {
          setError(`服务器错误: ${response.status}`)
        }
        setLoading(false)
        return
      }
      
      const data = await response.json()
      if (data.code === 0) {
        setFormData({
          username: data.data.username || '',
          email: data.data.email || '',
          chineseName: data.data.chineseName || '',
          englishName: data.data.englishName || '',
          avatar: data.data.avatar || '',
          githubUrl: data.data.githubUrl || '',
          instagramUrl: data.data.instagramUrl || '',
          twitterUrl: data.data.twitterUrl || '',
          linkedinUrl: data.data.linkedinUrl || '',
          bio: data.data.bio || '',
          steamAPIKey: '',
          steamID: data.data.steamID || '',
        })
      } else {
        setError(data.message || '获取用户信息失败')
      }
    } catch (err) {
      console.error('Fetch profile error:', err)
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        setError('无法连接到服务器，请确保后端服务已启动 (http://localhost:8080)')
      } else {
        setError('网络错误: ' + err.message)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }))
    setError('')
    setSuccess('')
  }

  const handlePasswordChange = (e) => {
    const { name, value } = e.target
    setPasswordData(prev => ({
      ...prev,
      [name]: value,
    }))
    setError('')
    setSuccess('')
  }

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    const formData = new FormData()
    formData.append('image', file)

    try {
      const response = await fetch(`${API_BASE_URL}/upload/image`, {
        method: 'POST',
        body: formData,
      })
      const data = await response.json()
      if (data.code === 0) {
        setFormData(prev => ({
          ...prev,
          avatar: data.data.url,
        }))
        setSuccess('头像上传成功')
        setTimeout(() => setSuccess(''), 2000)
      } else {
        setError(data.message || '上传失败')
      }
    } catch (err) {
      console.error('Upload error:', err)
      setError('上传失败，请稍后重试')
    }
  }

  const handleSaveProfile = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch(`${API_BASE_URL}/user/profile`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(formData),
      })
      const data = await response.json()
      if (data.code === 0) {
        setSuccess('保存成功！')
        if (onProfileUpdate) {
          onProfileUpdate(data.data.user)
        }
        if (formData.username) {
          localStorage.setItem('username', formData.username)
        }
        setTimeout(() => {
          setSuccess('')
        }, 2000)
      } else {
        setError(data.message || '保存失败')
      }
    } catch (err) {
      console.error('Save profile error:', err)
      setError('网络错误，请稍后重试')
    } finally {
      setSaving(false)
    }
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('两次输入的新密码不一致')
      setSaving(false)
      return
    }

    try {
      const response = await fetch(`${API_BASE_URL}/user/password`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          oldPassword: passwordData.oldPassword,
          newPassword: passwordData.newPassword,
        }),
      })
      const data = await response.json()
      if (data.code === 0) {
        setSuccess('密码修改成功！')
        setPasswordData({
          oldPassword: '',
          newPassword: '',
          confirmPassword: '',
        })
        setTimeout(() => {
          setSuccess('')
        }, 2000)
      } else {
        setError(data.message || '密码修改失败')
      }
    } catch (err) {
      console.error('Change password error:', err)
      setError('网络错误，请稍后重试')
    } finally {
      setSaving(false)
    }
  }

  const handleTestSteamConnection = async () => {
    if (!formData.steamAPIKey || !formData.steamID) {
      setError('请先填写 Steam API Key 和 Steam ID')
      return
    }

    setTestingConnection(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch(`${API_BASE_URL}/steam/test-connection`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          steamAPIKey: formData.steamAPIKey,
          steamID: formData.steamID,
        }),
      })

      const data = await response.json()

      if (data.code === 0) {
        setSuccess(`连接成功！用户: ${data.data.persona_name}, 游戏数: ${data.data.total_games}, 游戏时长: ${data.data.playtime} 小时`)
      } else {
        setError(data.message || '连接失败')
      }
    } catch (err) {
      console.error('Test steam connection error:', err)
      setError('网络错误，请稍后重试')
    } finally {
      setTestingConnection(false)
    }
  }

  const tabs = [
    { id: 'basic', label: '基本信息', icon: User },
    { id: 'social', label: '社交链接', icon: Globe },
    { id: 'steam', label: 'Steam 设置', icon: Gamepad2 },
    { id: 'password', label: '修改密码', icon: Lock },
  ]

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
          >
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-6">
              <motion.h2
                className="text-2xl font-bold text-white mb-2"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                编辑个人资料
              </motion.h2>
              <p className="text-blue-100 text-sm">
                修改您的个人信息，这些更改将实时反映在主页上
              </p>
            </div>

            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex border-b border-gray-200">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-3 text-sm font-medium transition-all border-b-2 ${activeTab === tab.id ? 'text-blue-600 border-blue-500' : 'text-gray-500 border-transparent hover:text-gray-700'}`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 p-3 mb-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm"
                >
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {error}
                </motion.div>
              )}

              {success && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 p-3 mb-4 bg-green-50 border border-green-200 rounded-lg text-green-600 text-sm"
                >
                  <CheckCircle className="w-4 h-4 flex-shrink-0" />
                  {success}
                </motion.div>
              )}

              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
              ) : (
                <AnimatePresence mode="wait">
                  {activeTab === 'basic' && (
                    <motion.form
                      key="basic-form"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      onSubmit={handleSaveProfile}
                      className="space-y-4"
                    >
                      <div className="flex items-start gap-6 mb-6">
                        <div className="relative">
                          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center overflow-hidden border-4 border-blue-200 shadow-lg">
                            {formData.avatar ? (
                              <img
                                src={`${API_BASE_URL}${formData.avatar}`}
                                alt="Avatar"
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <User className="w-10 h-10 text-white" />
                            )}
                          </div>
                          <label className="absolute bottom-0 right-0 p-2 bg-white rounded-full shadow-lg cursor-pointer hover:bg-gray-50 transition-colors">
                            <Upload className="w-4 h-4 text-blue-500" />
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleAvatarUpload}
                              className="hidden"
                            />
                          </label>
                        </div>
                        <div className="flex-1">
                          <h3 className="text-sm font-medium text-gray-700 mb-1">头像</h3>
                          <p className="text-xs text-gray-500">
                            点击上传新头像，头像将用于主页的旋转动画
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            登录用户名
                          </label>
                          <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                              type="text"
                              name="username"
                              value={formData.username}
                              onChange={handleInputChange}
                              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                              placeholder="请输入用户名"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            邮箱
                          </label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                              type="email"
                              name="email"
                              value={formData.email}
                              onChange={handleInputChange}
                              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                              placeholder="请输入邮箱"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            中文名 <span className="text-blue-500">（用于主页显示动画）</span>
                          </label>
                          <input
                            type="text"
                            name="chineseName"
                            value={formData.chineseName}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                            placeholder="例如：数字游牧人"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            英文名 <span className="text-blue-500">（用于主页显示动画）</span>
                          </label>
                          <input
                            type="text"
                            name="englishName"
                            value={formData.englishName}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                            placeholder="例如：Digital Nomad"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          个人介绍 <span className="text-blue-500">（将显示在主页）</span>
                        </label>
                        <textarea
                          name="bio"
                          value={formData.bio}
                          onChange={handleInputChange}
                          rows={4}
                          className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all resize-none"
                          placeholder="介绍一下你自己..."
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={saving}
                        className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2"
                      >
                        <Save className="w-4 h-4" />
                        {saving ? '保存中...' : '保存修改'}
                      </button>
                    </motion.form>
                  )}

                  {activeTab === 'social' && (
                    <motion.form
                      key="social-form"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      onSubmit={handleSaveProfile}
                      className="space-y-4"
                    >
                      <p className="text-sm text-gray-500 mb-4">
                        配置您的社交链接，这些图标将显示在主页的导航栏和轨道动画中
                      </p>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          GitHub
                        </label>
                        <div className="relative">
                          <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                            type="url"
                            name="githubUrl"
                            value={formData.githubUrl}
                            onChange={handleInputChange}
                            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                            placeholder="https://github.com/yourusername"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Twitter / X
                        </label>
                        <div className="relative">
                          <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                            type="url"
                            name="twitterUrl"
                            value={formData.twitterUrl}
                            onChange={handleInputChange}
                            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                            placeholder="https://twitter.com/yourusername"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Instagram
                        </label>
                        <div className="relative">
                          <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                            type="url"
                            name="instagramUrl"
                            value={formData.instagramUrl}
                            onChange={handleInputChange}
                            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                            placeholder="https://instagram.com/yourusername"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          LinkedIn
                        </label>
                        <div className="relative">
                          <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                            type="url"
                            name="linkedinUrl"
                            value={formData.linkedinUrl}
                            onChange={handleInputChange}
                            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                            placeholder="https://linkedin.com/in/yourusername"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={saving}
                        className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2"
                      >
                        <Save className="w-4 h-4" />
                        {saving ? '保存中...' : '保存社交链接'}
                      </button>
                    </motion.form>
                  )}

                  {activeTab === 'steam' && (
                    <motion.form
                      key="steam-form"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      onSubmit={handleSaveProfile}
                      className="space-y-4"
                    >
                      <p className="text-sm text-gray-500 mb-4">
                        配置您的 Steam 信息，以便在主页显示真实的 Steam 游戏数据
                      </p>

                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                        <h4 className="text-sm font-medium text-blue-800 mb-2">如何获取 Steam API Key 和 Steam ID？</h4>
                        <ul className="text-xs text-blue-700 space-y-1">
                          <li>1. 访问 <a href="https://steamcommunity.com/dev/apikey" target="_blank" rel="noopener noreferrer" className="underline">steamcommunity.com/dev/apikey</a> 获取 API Key</li>
                          <li>2. 您的 Steam ID 可以在个人资料页面找到（格式为 7656119... 的17位数字）</li>
                          <li>3. 确保您的 Steam 个人资料设置为公开</li>
                        </ul>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Steam API Key <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                            type="password"
                            name="steamAPIKey"
                            value={formData.steamAPIKey}
                            onChange={handleInputChange}
                            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-mono text-sm"
                            placeholder="输入您的 Steam API Key（每次修改需要重新输入）"
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          注意：为了安全，API Key 不会显示在表单中，每次修改需要重新输入
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Steam ID <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                            type="text"
                            name="steamID"
                            value={formData.steamID}
                            onChange={handleInputChange}
                            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-mono text-sm"
                            placeholder="例如：76561198000000000"
                          />
                        </div>
                      </div>

                      <div className="flex gap-3 pt-4">
                        <button
                          type="button"
                          onClick={handleTestSteamConnection}
                          disabled={testingConnection || saving}
                          className="flex-1 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-medium rounded-lg hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-green-500/25 flex items-center justify-center gap-2"
                        >
                          {testingConnection ? (
                            <>
                              <RefreshCw className="w-4 h-4 animate-spin" />
                              测试连接中...
                            </>
                          ) : (
                            <>
                              <Gamepad2 className="w-4 h-4" />
                              测试连接
                            </>
                          )}
                        </button>
                        <button
                          type="submit"
                          disabled={saving || testingConnection}
                          className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2"
                        >
                          <Save className="w-4 h-4" />
                          {saving ? '保存中...' : '保存设置'}
                        </button>
                      </div>

                      <p className="text-xs text-gray-500 text-center">
                        保存后，Steam 数据将自动刷新并显示在主页的"我的 Steam 信息"区域
                      </p>
                    </motion.form>
                  )}

                  {activeTab === 'password' && (
                    <motion.form
                      key="password-form"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      onSubmit={handleChangePassword}
                      className="space-y-4"
                    >
                      <p className="text-sm text-gray-500 mb-4">
                        修改您的登录密码，请确保新密码足够安全
                      </p>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          当前密码
                        </label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                            type={showOldPassword ? 'text' : 'password'}
                            name="oldPassword"
                            value={passwordData.oldPassword}
                            onChange={handlePasswordChange}
                            className="w-full pl-10 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                            placeholder="请输入当前密码"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowOldPassword(!showOldPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                          >
                            {showOldPassword ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          新密码
                        </label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                            type={showNewPassword ? 'text' : 'password'}
                            name="newPassword"
                            value={passwordData.newPassword}
                            onChange={handlePasswordChange}
                            className="w-full pl-10 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                            placeholder="请输入新密码"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                          >
                            {showNewPassword ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          确认新密码
                        </label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                            type="password"
                            name="confirmPassword"
                            value={passwordData.confirmPassword}
                            onChange={handlePasswordChange}
                            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                            placeholder="请再次输入新密码"
                            required
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={saving}
                        className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2"
                      >
                        <Lock className="w-4 h-4" />
                        {saving ? '修改中...' : '修改密码'}
                      </button>
                    </motion.form>
                  )}
                </AnimatePresence>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

export default ProfileEditModal