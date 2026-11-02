import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Eye, EyeOff, Mail, Lock, User, AlertCircle, CheckCircle } from 'lucide-react'

const API_BASE_URL = 'http://localhost:8080'

const AuthModal = ({ isOpen, onClose, onLogin }) => {
  const [isLogin, setIsLogin] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
  })

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }))
    setError('')
    setSuccess('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const endpoint = isLogin ? '/user/login' : '/user/register'
      const requestBody = isLogin
        ? {
            username: formData.username,
            password: formData.password,
          }
        : {
            username: formData.username,
            email: formData.email,
            password: formData.password,
          }

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })

      const data = await response.json()

      if (data.code === 0) {
        if (isLogin) {
          localStorage.setItem('token', data.data.token)
          localStorage.setItem('username', formData.username)
          setSuccess('登录成功！')
          setTimeout(() => {
            onLogin(formData.username)
            onClose()
          }, 500)
        } else {
          setSuccess('注册成功！请登录')
          setTimeout(() => {
            setIsLogin(true)
            setFormData(prev => ({
              ...prev,
              email: '',
            }))
            setSuccess('')
          }, 1500)
        }
      } else {
        setError(data.message || '操作失败')
      }
    } catch (err) {
      console.error('Auth error:', err)
      setError('网络错误，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  const switchMode = () => {
    setIsLogin(!isLogin)
    setError('')
    setSuccess('')
    setFormData({
      username: '',
      email: '',
      password: '',
    })
  }

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
            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
          >
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-8 text-center">
              <motion.h2
                className="text-2xl font-bold text-white mb-2"
                key={isLogin ? 'login' : 'register'}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                {isLogin ? '欢迎回来' : '创建账户'}
              </motion.h2>
              <p className="text-blue-100 text-sm">
                {isLogin ? '登录以管理您的内容' : '注册一个新账户开始使用'}
              </p>
            </div>

            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm"
                >
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {error}
                </motion.div>
              )}

              {success && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg text-green-600 text-sm"
                >
                  <CheckCircle className="w-4 h-4 flex-shrink-0" />
                  {success}
                </motion.div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  用户名
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
                    required
                  />
                </div>
              </div>

              <AnimatePresence mode="wait">
                {!isLogin && (
                  <motion.div
                    key="email-field"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
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
                        required={!isLogin}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  密码
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                    placeholder="请输入密码"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-500/25"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    处理中...
                  </span>
                ) : (
                  isLogin ? '登录' : '注册'
                )}
              </button>

              <div className="text-center pt-2">
                <p className="text-sm text-gray-500">
                  {isLogin ? '还没有账户？' : '已有账户？'}
                  <button
                    type="button"
                    onClick={switchMode}
                    className="ml-1 text-blue-600 hover:text-blue-700 font-medium transition-colors"
                  >
                    {isLogin ? '立即注册' : '立即登录'}
                  </button>
                </p>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

export default AuthModal
