import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ArrowLeft, Eye, Calendar, Tag, Clock, Star, 
  MessageCircle, Send, User, LogIn, Sparkles, 
  ChevronRight, Edit3, Trash2
} from 'lucide-react'
import BlogEditModal from './BlogEditModal'

const API_BASE_URL = 'http://localhost:8080'

const categoryColors = {
  Blockchain: { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-200', light: 'bg-orange-50' },
  Backend: { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-200', light: 'bg-amber-50' },
  Frontend: { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-200', light: 'bg-yellow-50' },
  AI: { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-200', light: 'bg-orange-50' },
  DevOps: { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-200', light: 'bg-amber-50' },
}

const parseTags = (tagsStr) => {
  if (!tagsStr) return []
  return tagsStr.split(',').map(t => t.trim()).filter(t => t)
}

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleDateString('zh-CN', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })
}

const formatTimeAgo = (dateStr) => {
  if (!dateStr) return ''
  const now = new Date()
  const date = new Date(dateStr)
  const diffInSeconds = Math.floor((now - date) / 1000)
  
  if (diffInSeconds < 60) return '刚刚'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}分钟前`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}小时前`
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}天前`
  return formatDate(dateStr)
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

const LoadingState = () => (
  <div className="flex flex-col items-center justify-center py-24">
    <div className="w-12 h-12 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin mb-4" />
    <p className="text-gray-500">加载中...</p>
  </div>
)

const ErrorState = ({ message, onRetry }) => (
  <div className="flex flex-col items-center justify-center py-24 text-center">
    <div className="w-20 h-20 rounded-full bg-orange-50 flex items-center justify-center mb-4">
      <Eye className="w-10 h-10 text-orange-300" />
    </div>
    <h3 className="text-lg font-semibold text-gray-700 mb-2">文章不存在</h3>
    <p className="text-gray-500 text-sm mb-6">{message || '无法找到您请求的文章'}</p>
    <button
      onClick={onRetry}
      className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-medium rounded-xl hover:from-orange-600 hover:to-amber-600 transition-all shadow-lg"
    >
      <ArrowLeft className="w-4 h-4" />
      返回博客列表
    </button>
  </div>
)

const BlogDetail = ({ postId, onBack, onEdit, onDelete, isLoggedIn, username, onOpenAuth }) => {
  const [post, setPost] = useState(null)
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [commentText, setCommentText] = useState('')
  const [submittingComment, setSubmittingComment] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)

  const fetchPostDetail = useCallback(async () => {
    if (!postId) return
    
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`${API_BASE_URL}/post/list/detail/${postId}`, {
        method: 'GET',
      })
      const data = await response.json()
      
      if (data.code === 0) {
        setPost(data.data)
        setComments(data.data.comments || [])
      } else {
        setError(data.message || '获取文章详情失败')
      }
    } catch (err) {
      console.error('Failed to fetch post detail:', err)
      setError('网络错误，请稍后重试')
    } finally {
      setLoading(false)
    }
  }, [postId])

  useEffect(() => {
    fetchPostDetail()
  }, [fetchPostDetail])

  const handleSubmitComment = async (e) => {
    e.preventDefault()
    
    if (!commentText.trim()) return
    
    if (!isLoggedIn) {
      onOpenAuth()
      return
    }
    
    setSubmittingComment(true)
    
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_BASE_URL}/comment/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({
          content: commentText.trim(),
          post_id: parseInt(postId),
        }),
      })
      
      const data = await response.json()
      
      if (data.code === 0) {
        setCommentText('')
        fetchPostDetail()
      } else {
        alert(data.message || '评论失败')
      }
    } catch (err) {
      console.error('Failed to submit comment:', err)
      alert('网络错误，请稍后重试')
    } finally {
      setSubmittingComment(false)
    }
  }

  const handleDelete = async () => {
    if (!window.confirm('确定要删除这篇博客吗？')) return
    
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_BASE_URL}/post/delete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({ id: parseInt(postId) }),
      })
      
      const data = await response.json()
      
      if (data.code === 0) {
        onDelete()
      } else {
        alert(data.message || '删除失败')
      }
    } catch (err) {
      console.error('Failed to delete post:', err)
      alert('网络错误，请稍后重试')
    }
  }

  const colors = post ? (categoryColors[post.category] || categoryColors.Backend) : categoryColors.Backend

  if (loading) {
    return (
      <section className="min-h-screen py-20 px-6 bg-gradient-to-b from-orange-50/50 via-amber-50/30 to-white relative overflow-hidden">
        <WarmOrb position={{ top: '5%', right: '5%' }} delay={0} />
        <WarmOrb position={{ bottom: '10%', left: '10%' }} delay={3} />
        <LoadingState />
      </section>
    )
  }

  if (error || !post) {
    return (
      <section className="min-h-screen py-20 px-6 bg-gradient-to-b from-orange-50/50 via-amber-50/30 to-white relative overflow-hidden">
        <WarmOrb position={{ top: '5%', right: '5%' }} delay={0} />
        <WarmOrb position={{ bottom: '10%', left: '10%' }} delay={3} />
        <ErrorState message={error} onRetry={onBack} />
      </section>
    )
  }

  const tags = parseTags(post.tags)

  return (
    <section className="min-h-screen py-8 px-4 md:px-6 bg-gradient-to-b from-orange-50/50 via-amber-50/30 to-white relative overflow-hidden">
      <WarmOrb position={{ top: '5%', right: '5%' }} delay={0} />
      <WarmOrb position={{ bottom: '10%', left: '10%' }} delay={3} />
      
      <div
        className="absolute inset-0 opacity-30 pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23fbbf24' fill-opacity='0.04'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      <div className="max-w-4xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex items-center justify-between">
            <button
              onClick={onBack}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>返回博客列表</span>
            </button>
            
            {isLoggedIn && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowEditModal(true)}
                  className="flex items-center gap-2 px-4 py-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>编辑</span>
                </button>
                <button
                  onClick={handleDelete}
                  className="flex items-center gap-2 px-4 py-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </motion.div>

        <motion.article
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl border border-orange-100/50 shadow-xl shadow-orange-50/30 overflow-hidden">
            <div className="h-1.5 bg-gradient-to-r from-orange-400 via-amber-400 to-yellow-400" />
            
            <div className="p-6 md:p-10">
              <div className="flex flex-wrap items-center gap-3 mb-6">
                <span className={`inline-flex items-center gap-1 px-4 py-1.5 rounded-full text-sm font-medium ${colors.bg} ${colors.text} ${colors.border} border`}>
                  <Sparkles className="w-4 h-4" />
                  {post.category || '未分类'}
                </span>
                
                {post.featured && (
                  <span className="inline-flex items-center gap-1 px-4 py-1.5 rounded-full text-sm font-medium bg-gradient-to-r from-orange-100 to-amber-100 text-orange-700 border border-orange-200">
                    <Star className="w-4 h-4 fill-current" />
                    精选文章
                  </span>
                )}
              </div>

              <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6 leading-tight">
                {post.title}
              </h1>

              <div className="flex flex-wrap items-center gap-6 mb-8 pb-8 border-b border-orange-100">
                <div className="flex items-center gap-2 text-gray-500">
                  <Calendar className="w-4 h-4 text-orange-400" />
                  <span className="text-sm">{formatDate(post.createdAt)}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-500">
                  <Eye className="w-4 h-4 text-orange-400" />
                  <span className="text-sm">{post.views || 0} 阅读</span>
                </div>
                {tags.length > 0 && (
                  <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4 text-orange-400" />
                    <div className="flex flex-wrap gap-2">
                      {tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-orange-50 text-orange-600 rounded-full text-sm font-mono border border-orange-100"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {post.excerpt && (
                <div className="mb-8 p-6 bg-gradient-to-r from-orange-50/80 to-amber-50/80 rounded-xl border border-orange-100">
                  <p className="text-gray-700 italic leading-relaxed">
                    <span className="text-orange-500 font-semibold">摘要：</span>
                    {post.excerpt}
                  </p>
                </div>
              )}

              <div className="prose prose-orange max-w-none">
                <div className="text-gray-700 leading-relaxed whitespace-pre-wrap text-lg">
                  {post.content}
                </div>
              </div>
            </div>
          </div>
        </motion.article>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-8"
        >
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl border border-orange-100/50 shadow-xl shadow-orange-50/30 overflow-hidden">
            <div className="p-6 md:p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                <MessageCircle className="w-6 h-6 text-orange-500" />
                评论 ({comments.length})
              </h2>

              <form onSubmit={handleSubmitComment} className="mb-8">
                <div className="bg-orange-50/50 rounded-xl p-4 border border-orange-100">
                  <textarea
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder={isLoggedIn ? "写下你的评论..." : "登录后才能发表评论"}
                    className="w-full bg-transparent resize-none outline-none text-gray-700 placeholder-gray-400 min-h-[80px]"
                    disabled={!isLoggedIn || submittingComment}
                  />
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-orange-100">
                    {!isLoggedIn ? (
                      <button
                        type="button"
                        onClick={onOpenAuth}
                        className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-medium rounded-lg hover:from-orange-600 hover:to-amber-600 transition-all"
                      >
                        <LogIn className="w-4 h-4" />
                        登录后评论
                      </button>
                    ) : (
                      <>
                        <span className="text-sm text-gray-500">
                          以 <span className="text-orange-600 font-medium">{username}</span> 身份评论
                        </span>
                        <button
                          type="submit"
                          disabled={!commentText.trim() || submittingComment}
                          className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-medium rounded-lg hover:from-orange-600 hover:to-amber-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all shadow-md"
                        >
                          <Send className="w-4 h-4" />
                          {submittingComment ? '发送中...' : '发送评论'}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </form>

              <div className="space-y-6">
                <AnimatePresence>
                  {comments.length === 0 ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center py-12"
                    >
                      <MessageCircle className="w-16 h-16 text-orange-200 mx-auto mb-4" />
                      <p className="text-gray-400">暂无评论，来发表第一条评论吧~</p>
                    </motion.div>
                  ) : (
                    comments.map((comment, index) => (
                      <motion.div
                        key={comment.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex gap-4 p-4 hover:bg-orange-50/30 rounded-xl transition-colors"
                      >
                        <div className="flex-shrink-0">
                          {comment.avatar ? (
                            <img
                              src={comment.avatar}
                              alt={comment.username || '用户'}
                              className="w-10 h-10 rounded-full object-cover border-2 border-orange-100"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-200 to-amber-200 flex items-center justify-center border-2 border-orange-100">
                              <User className="w-5 h-5 text-orange-600" />
                            </div>
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="font-semibold text-gray-800">
                              {comment.username || '匿名用户'}
                            </span>
                            <span className="text-xs text-gray-400 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {formatTimeAgo(comment.createdAt)}
                            </span>
                          </div>
                          <p className="text-gray-700 leading-relaxed">
                            {comment.content}
                          </p>
                        </div>
                      </motion.div>
                    ))
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <BlogEditModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        item={post}
        itemType="post"
        onSave={() => {
          fetchPostDetail()
          onEdit()
        }}
        onDelete={handleDelete}
        isNew={false}
      />
    </section>
  )
}

export default BlogDetail
