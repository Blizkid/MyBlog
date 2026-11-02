import React, { useState, useCallback, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Camera, MapPin, Plus, X, Heart, MessageCircle, Share2, Image as ImageIcon, Clock, User, Globe, Map, Edit2, Trash2, Save, Loader2, Upload, ZoomIn, ZoomOut, Locate } from 'lucide-react'
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet'
import L from 'leaflet'

const API_BASE_URL = 'http://localhost:8080'

const createCustomIcon = (isHovered = false) => {
  return L.divIcon({
    className: 'custom-marker-icon',
    html: `
      <div class="relative">
        <div class="absolute -inset-2 rounded-full bg-teal-500/30 animate-ping" style="animation-duration: 2s;"></div>
        <div class="relative w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-gradient-to-br from-teal-400 to-cyan-500 shadow-lg shadow-teal-500/50 border-2 border-white ${isHovered ? 'scale-125' : ''} transition-transform"></div>
      </div>
    `,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  })
}

const MapController = ({ center, zoom, onMapClick }) => {
  const map = useMap()
  
  useEffect(() => {
    if (center && zoom) {
      map.flyTo(center, zoom, { duration: 1 })
    }
  }, [center, zoom, map])

  useMapEvents({
    click: (e) => {
      if (onMapClick) {
        onMapClick(e.latlng.lat, e.latlng.lng)
      }
    },
  })

  return null
}

const MapZoomControl = () => {
  const map = useMap()
  
  return (
    <div className="absolute bottom-4 right-4 flex flex-col gap-2 z-[1000]">
      <button
        onClick={() => map.zoomIn()}
        className="p-2 bg-white/90 backdrop-blur-sm rounded-lg shadow-md hover:bg-white transition-colors border border-gray-200"
      >
        <ZoomIn className="w-4 h-4 text-gray-600" />
      </button>
      <button
        onClick={() => map.zoomOut()}
        className="p-2 bg-white/90 backdrop-blur-sm rounded-lg shadow-md hover:bg-white transition-colors border border-gray-200"
      >
        <ZoomOut className="w-4 h-4 text-gray-600" />
      </button>
    </div>
  )
}

const staticMoments = [
  {
    id: 1,
    content: '今天去了海边，日落真的太美了！海浪轻轻拍打着沙滩，夕阳把整个天空染成了橙红色。这样的时刻让人感到无比平静和幸福。',
    images: [
      'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=beautiful%20sunset%20over%20the%20ocean%20with%20waves%20and%20orange%20sky&image_size=square',
      'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=peaceful%20beach%20with%20soft%20sand%20and%20gentle%20waves&image_size=square',
      'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=sunset%20silhouette%20of%20person%20walking%20on%20beach&image_size=square',
    ],
    location: '三亚湾',
    time: '2小时前',
    likes: 42,
    comments: 8,
    isLiked: false,
  },
  {
    id: 2,
    content: '周末和朋友们一起去爬山了！虽然很累，但是山顶的风景真的值得。一路上欢声笑语，感觉生活充满了活力。',
    images: [
      'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=mountain%20peak%20with%20beautiful%20landscape%20and%20blue%20sky&image_size=square',
      'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=group%20of%20friends%20hiking%20together%20in%20nature&image_size=square',
    ],
    location: '黄山',
    time: '昨天',
    likes: 56,
    comments: 12,
    isLiked: true,
  },
  {
    id: 3,
    content: '最近在读一本很有意思的书，推荐给大家。书中的观点让我对生活有了新的思考。有时候静下心来阅读，真的能收获很多。',
    images: [
      'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=cozy%20reading%20corner%20with%20books%20and%20warm%20lighting&image_size=square',
    ],
    location: '家',
    time: '3天前',
    likes: 34,
    comments: 5,
    isLiked: false,
  },
  {
    id: 4,
    content: '今天尝试做了一道新菜，味道居然还不错！看来我的厨艺有进步了。生活就是要多尝试新事物，不断学习和成长。',
    images: [
      'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=delicious%20home%20cooked%20meal%20on%20a%20nice%20table%20setting&image_size=square',
      'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=cooking%20in%20a%20cozy%20kitchen%20with%20fresh%20ingredients&image_size=square',
      'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=happy%20person%20enjoying%20a%20delicious%20meal&image_size=square',
      'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=beautifully%20plated%20dish%20with%20garnish&image_size=square',
    ],
    location: '厨房',
    time: '5天前',
    likes: 28,
    comments: 7,
    isLiked: true,
  },
]

const staticVisitedCities = [
  { name: '北京', lat: 39.9, lng: 116.4, visited: true, year: 2020 },
  { name: '上海', lat: 31.2, lng: 121.5, visited: true, year: 2021 },
  { name: '广州', lat: 23.1, lng: 113.3, visited: true, year: 2022 },
  { name: '深圳', lat: 22.5, lng: 114.1, visited: true, year: 2023 },
  { name: '成都', lat: 30.7, lng: 104.1, visited: true, year: 2024 },
  { name: '杭州', lat: 30.3, lng: 120.2, visited: true, year: 2023 },
  { name: '三亚', lat: 18.3, lng: 109.3, visited: true, year: 2024 },
  { name: '西安', lat: 34.3, lng: 108.9, visited: true, year: 2022 },
  { name: '南京', lat: 32.1, lng: 118.8, visited: true, year: 2023 },
  { name: '重庆', lat: 29.6, lng: 106.5, visited: true, year: 2023 },
  { name: '东京', lat: 35.7, lng: 139.7, visited: true, year: 2019, isInternational: true },
  { name: '巴黎', lat: 48.9, lng: 2.3, visited: true, year: 2018, isInternational: true },
  { name: '纽约', lat: 40.7, lng: -74.0, visited: true, year: 2017, isInternational: true },
  { name: '伦敦', lat: 51.5, lng: -0.1, visited: true, year: 2019, isInternational: true },
  { name: '新加坡', lat: 1.4, lng: 103.8, visited: true, year: 2020, isInternational: true },
]

const staticComments = {
  1: [
    {
      ID: 1,
      Content: '太美了！我也想去三亚看日落',
      MomentID: 1,
      GuestName: '快乐的熊猫123',
      GuestAvatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=cute%20cartoon%20panda%20avatar&image_size=square',
      ParentID: null,
      ReplyToGuestName: '',
      Likes: 5,
      CreatedAt: '2024-01-15 14:30:00',
      Replies: [
        {
          ID: 2,
          Content: '同意！日落真的超级美',
          MomentID: 1,
          GuestName: '优雅的猫咪456',
          GuestAvatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=cute%20cartoon%20cat%20avatar&image_size=square',
          ParentID: 1,
          ReplyToGuestName: '快乐的熊猫123',
          Likes: 2,
          CreatedAt: '2024-01-15 15:00:00',
          Replies: [],
        },
      ],
    },
    {
      ID: 3,
      Content: '海浪和沙滩的组合真的很治愈',
      MomentID: 1,
      GuestName: '活泼的兔子789',
      GuestAvatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=cute%20cartoon%20rabbit%20avatar&image_size=square',
      ParentID: null,
      ReplyToGuestName: '',
      Likes: 3,
      CreatedAt: '2024-01-15 16:00:00',
      Replies: [],
    },
  ],
  2: [
    {
      ID: 4,
      Content: '黄山真的值得一去！云海超级壮观',
      MomentID: 2,
      GuestName: '勇敢的老虎101',
      GuestAvatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=cute%20cartoon%20tiger%20avatar&image_size=square',
      ParentID: null,
      ReplyToGuestName: '',
      Likes: 8,
      CreatedAt: '2024-01-14 10:00:00',
      Replies: [],
    },
  ],
}

const staticGuestNames = ['快乐的熊猫', '优雅的猫咪', '活泼的兔子', '勇敢的老虎', '聪明的狐狸', '神秘的海豚', '阳光的小鸟', '帅气的狗狗']

const generateRandomGuestName = () => {
  const prefix = staticGuestNames[Math.floor(Math.random() * staticGuestNames.length)]
  const suffix = Math.floor(Math.random() * 1000)
  return `${prefix}${suffix}`
}

const formatTimeAgo = (date) => {
  const now = new Date()
  const diff = now - new Date(date)
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 60) return `${minutes}分钟前`
  if (hours < 24) return `${hours}小时前`
  if (days < 7) return `${days}天前`
  return new Date(date).toLocaleDateString('zh-CN')
}

const LifeSection = () => {
  const [moments, setMoments] = useState([])
  const [visitedCities, setVisitedCities] = useState([])
  const [comments, setComments] = useState({})
  const [loading, setLoading] = useState({ moments: false, cities: false, comments: false })
  
  const [expandedMomentComments, setExpandedMomentComments] = useState(new Set())
  const [replyingTo, setReplyingTo] = useState(null)
  const [newCommentInputs, setNewCommentInputs] = useState({})
  
  const [isPostModalOpen, setIsPostModalOpen] = useState(false)
  const [isEditMomentOpen, setIsEditMomentOpen] = useState(false)
  const [isEditCityOpen, setIsEditCityOpen] = useState(false)
  
  const [editingMoment, setEditingMoment] = useState(null)
  const [editingCity, setEditingCity] = useState(null)
  const [isAddingCity, setIsAddingCity] = useState(false)
  
  const [newPostContent, setNewPostContent] = useState('')
  const [selectedImages, setSelectedImages] = useState([])
  const [selectedLocation, setSelectedLocation] = useState('')
  const [mapType, setMapType] = useState('china')
  const [selectedCity, setSelectedCity] = useState(null)
  const [mapTarget, setMapTarget] = useState(null)
  const [likedMoments, setLikedMoments] = useState(new Set())
  const [modalLoading, setModalLoading] = useState(false)
  const [modalError, setModalError] = useState('')
  const [uploadingImage, setUploadingImage] = useState(false)

  const fileInputRef = useRef(null)

  const [cityFormData, setCityFormData] = useState({
    name: '',
    lat: 0,
    lng: 0,
    visited: true,
    year: new Date().getFullYear(),
    isInternational: false,
  })

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: 'easeOut',
      },
    },
  }

  const hasToken = !!localStorage.getItem('token')

  const parseImages = (imagesStr) => {
    if (!imagesStr) return []
    try {
      return JSON.parse(imagesStr)
    } catch {
      return [imagesStr]
    }
  }

  const displayMoments = hasToken && moments.length > 0
    ? moments.map(m => ({
        ...m,
        images: parseImages(m.images),
        time: formatTimeAgo(m.created_at || m.CreatedAt),
        isLiked: likedMoments.has(m.id),
      }))
    : staticMoments

  const displayVisitedCities = hasToken && visitedCities.length > 0
    ? visitedCities
    : staticVisitedCities

  const fetchMoments = useCallback(async () => {
    const token = localStorage.getItem('token')
    if (!token) return

    setLoading(prev => ({ ...prev, moments: true }))
    try {
      const response = await fetch(`${API_BASE_URL}/moment/list`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      })
      const data = await response.json()
      if (data.code === 0 && data.data) {
        setMoments(data.data)
      } else {
        setMoments([])
      }
    } catch (err) {
      console.error('Failed to fetch moments:', err)
      setMoments([])
    } finally {
      setLoading(prev => ({ ...prev, moments: false }))
    }
  }, [])

  const fetchVisitedCities = useCallback(async () => {
    const token = localStorage.getItem('token')
    if (!token) return

    setLoading(prev => ({ ...prev, cities: true }))
    try {
      const response = await fetch(`${API_BASE_URL}/visited-city/list`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      })
      const data = await response.json()
      if (data.code === 0 && data.data) {
        setVisitedCities(data.data)
      } else {
        setVisitedCities([])
      }
    } catch (err) {
      console.error('Failed to fetch visited cities:', err)
      setVisitedCities([])
    } finally {
      setLoading(prev => ({ ...prev, cities: false }))
    }
  }, [])

  useEffect(() => {
    if (hasToken) {
      fetchMoments()
      fetchVisitedCities()
    }
  }, [hasToken, fetchMoments, fetchVisitedCities])

  const fetchComments = useCallback(async (momentId) => {
    setLoading(prev => ({ ...prev, comments: true }))
    try {
      const response = await fetch(`${API_BASE_URL}/moment-comment/list?moment_id=${momentId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      const data = await response.json()
      if (data.code === 0 && data.data) {
        setComments(prev => ({ ...prev, [momentId]: data.data }))
      } else {
        setComments(prev => ({ ...prev, [momentId]: staticComments[momentId] || [] }))
      }
    } catch (err) {
      console.error('Failed to fetch comments:', err)
      setComments(prev => ({ ...prev, [momentId]: staticComments[momentId] || [] }))
    } finally {
      setLoading(prev => ({ ...prev, comments: false }))
    }
  }, [])

  const handleCreateComment = async (momentId, content, parentId = null, replyToCommentId = null, replyToGuestName = '') => {
    if (!content.trim()) return

    try {
      const newComment = {
        ID: Date.now(),
        Content: content,
        MomentID: momentId,
        GuestName: generateRandomGuestName(),
        GuestAvatar: `https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=cute%20cartoon%20animal%20avatar%20${generateRandomGuestName()}&image_size=square`,
        ParentID: parentId,
        ReplyToCommentID: replyToCommentId,
        ReplyToGuestName: replyToGuestName,
        Likes: 0,
        CreatedAt: new Date().toISOString(),
        Replies: [],
      }

      const response = await fetch(`${API_BASE_URL}/moment-comment/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content,
          moment_id: momentId,
          parent_id: parentId,
          reply_to_comment_id: replyToCommentId,
          reply_to_guest_name: replyToGuestName,
        }),
      })

      const data = await response.json()
      if (data.code === 0) {
        newComment.ID = data.data.comment?.ID || newComment.ID
        newComment.GuestName = data.data.guest_name || newComment.GuestName
      }

      setComments(prev => {
        const currentComments = prev[momentId] || staticComments[momentId] || []
        
        if (parentId === null) {
          return { ...prev, [momentId]: [...currentComments, newComment] }
        } else {
          const updatedComments = currentComments.map(comment => {
            if (comment.ID === parentId) {
              return {
                ...comment,
                Replies: [...(comment.Replies || []), newComment],
              }
            }
            return comment
          })
          return { ...prev, [momentId]: updatedComments }
        }
      })

      setNewCommentInputs(prev => ({ ...prev, [momentId]: '' }))
      setReplyingTo(null)
    } catch (err) {
      console.error('Failed to create comment:', err)
    }
  }

  const handleLikeComment = async (commentId) => {
    try {
      await fetch(`${API_BASE_URL}/moment-comment/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ comment_id: commentId }),
      })
    } catch (err) {
      console.error('Failed to like comment:', err)
    }
  }

  const toggleComments = async (momentId) => {
    const isExpanded = expandedMomentComments.has(momentId)
    
    if (!isExpanded) {
      await fetchComments(momentId)
    }
    
    setExpandedMomentComments(prev => {
      const newSet = new Set(prev)
      if (newSet.has(momentId)) {
        newSet.delete(momentId)
      } else {
        newSet.add(momentId)
      }
      return newSet
    })
  }

  const startReply = (momentId, commentId, guestName) => {
    setReplyingTo({
      momentId,
      commentId,
      guestName,
    })
  }

  const cancelReply = () => {
    setReplyingTo(null)
  }

  const handleLike = async (momentId) => {
    const isCurrentlyLiked = likedMoments.has(momentId)
    
    setLikedMoments(prev => {
      const newSet = new Set(prev)
      if (isCurrentlyLiked) {
        newSet.delete(momentId)
      } else {
        newSet.add(momentId)
      }
      return newSet
    })

    setMoments(prev =>
      prev.map(m =>
        m.id === momentId
          ? { ...m, likes: isCurrentlyLiked ? m.likes - 1 : m.likes + 1 }
          : m
      )
    )

    if (hasToken) {
      try {
        const token = localStorage.getItem('token')
        await fetch(`${API_BASE_URL}/moment/like`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ id: momentId }),
        })
      } catch (err) {
        console.error('Failed to like moment:', err)
      }
    }
  }

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    if (!validTypes.includes(file.type)) {
      setModalError('只支持 jpg, jpeg, png, gif, webp 格式的图片')
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      setModalError('图片大小不能超过 10MB')
      return
    }

    handleFileUpload(file)
  }

  const handleFileUpload = async (file) => {
    setUploadingImage(true)
    setModalError('')

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
        setSelectedImages(prev => [...prev, imageUrl])
      } else {
        setModalError(data.message || '图片上传失败')
      }
    } catch (err) {
      console.error('Upload error:', err)
      setModalError('图片上传失败，请稍后重试')
    } finally {
      setUploadingImage(false)
    }
  }

  const handlePostSubmit = async () => {
    if (!newPostContent.trim() && selectedImages.length === 0) return

    setModalLoading(true)
    setModalError('')

    try {
      if (hasToken) {
        const token = localStorage.getItem('token')
        const response = await fetch(`${API_BASE_URL}/moment/create`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            content: newPostContent,
            images: selectedImages.length > 0 ? selectedImages : ['https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=beautiful%20life%20moment%20with%20warm%20atmosphere&image_size=square'],
            location: selectedLocation || '未知位置',
          }),
        })

        const data = await response.json()
        if (data.code !== 0) {
          throw new Error(data.message || '发布失败')
        }
        fetchMoments()
      }

      closePostModal()
    } catch (err) {
      setModalError(err.message || '发布失败')
    } finally {
      setModalLoading(false)
    }
  }

  const closePostModal = () => {
    setIsPostModalOpen(false)
    setIsEditMomentOpen(false)
    setEditingMoment(null)
    setNewPostContent('')
    setSelectedImages([])
    setSelectedLocation('')
    setModalError('')
  }

  const openEditMoment = (moment) => {
    setEditingMoment(moment)
    setNewPostContent(moment.content || '')
    setSelectedImages(parseImages(moment.images))
    setSelectedLocation(moment.location || '')
    setIsEditMomentOpen(true)
  }

  const handleEditMoment = async () => {
    if (!editingMoment) return

    setModalLoading(true)
    setModalError('')

    try {
      if (hasToken) {
        const token = localStorage.getItem('token')
        const response = await fetch(`${API_BASE_URL}/moment/update`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            id: editingMoment.id,
            moment: {
              content: newPostContent,
              images: JSON.stringify(selectedImages),
              location: selectedLocation,
            },
          }),
        })

        const data = await response.json()
        if (data.code !== 0) {
          throw new Error(data.message || '更新失败')
        }
        fetchMoments()
      }

      closePostModal()
    } catch (err) {
      setModalError(err.message || '更新失败')
    } finally {
      setModalLoading(false)
    }
  }

  const handleDeleteMoment = async (momentId) => {
    if (!window.confirm('确定要删除这条动态吗？')) return

    try {
      if (hasToken) {
        const token = localStorage.getItem('token')
        const response = await fetch(`${API_BASE_URL}/moment/delete`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ id: momentId }),
        })

        const data = await response.json()
        if (data.code !== 0) {
          throw new Error(data.message || '删除失败')
        }
      }
      setMoments(prev => prev.filter(m => m.id !== momentId))
    } catch (err) {
      console.error('Failed to delete moment:', err)
      alert(err.message || '删除失败')
    }
  }

  const openEditCity = (city) => {
    setEditingCity(city)
    setIsAddingCity(false)
    setCityFormData({
      name: city.name || '',
      lat: city.lat || 0,
      lng: city.lng || 0,
      visited: city.visited ?? true,
      year: city.year || new Date().getFullYear(),
      isInternational: city.isInternational ?? false,
    })
    setIsEditCityOpen(true)
  }

  const openAddCity = () => {
    setEditingCity(null)
    setIsAddingCity(true)
    setCityFormData({
      name: '',
      lat: 0,
      lng: 0,
      visited: true,
      year: new Date().getFullYear(),
      isInternational: false,
    })
    setIsEditCityOpen(true)
  }

  const closeCityModal = () => {
    setIsEditCityOpen(false)
    setEditingCity(null)
    setModalError('')
  }

  const handleSaveCity = async () => {
    if (!cityFormData.name) {
      setModalError('请输入城市名称')
      return
    }

    setModalLoading(true)
    setModalError('')

    try {
      if (hasToken) {
        const token = localStorage.getItem('token')
        const endpoint = isAddingCity ? '/visited-city/create' : '/visited-city/update'
        
        let requestBody
        if (isAddingCity) {
          requestBody = {
            name: cityFormData.name,
            lat: parseFloat(cityFormData.lat) || 0,
            lng: parseFloat(cityFormData.lng) || 0,
            visited: cityFormData.visited,
            year: parseInt(cityFormData.year) || new Date().getFullYear(),
            is_international: cityFormData.isInternational,
          }
        } else {
          requestBody = {
            id: editingCity.id,
            visited_city: {
              name: cityFormData.name,
              lat: parseFloat(cityFormData.lat) || 0,
              lng: parseFloat(cityFormData.lng) || 0,
              visited: cityFormData.visited,
              year: parseInt(cityFormData.year) || new Date().getFullYear(),
              isInternational: cityFormData.isInternational,
            },
          }
        }

        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(requestBody),
        })

        const data = await response.json()
        if (data.code !== 0) {
          throw new Error(data.message || '保存失败')
        }
        fetchVisitedCities()
      }

      closeCityModal()
    } catch (err) {
      setModalError(err.message || '保存失败')
    } finally {
      setModalLoading(false)
    }
  }

  const handleDeleteCity = async () => {
    if (!editingCity) return
    if (!window.confirm('确定要删除这个城市吗？')) return

    try {
      if (hasToken) {
        const token = localStorage.getItem('token')
        const response = await fetch(`${API_BASE_URL}/visited-city/delete`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ id: editingCity.id }),
        })

        const data = await response.json()
        if (data.code !== 0) {
          throw new Error(data.message || '删除失败')
        }
        fetchVisitedCities()
      }

      closeCityModal()
    } catch (err) {
      setModalError(err.message || '删除失败')
    }
  }

  const getImageGridClass = (imageCount) => {
    if (imageCount === 1) return 'grid-cols-1'
    if (imageCount === 2) return 'grid-cols-2'
    if (imageCount === 3) return 'grid-cols-3'
    if (imageCount === 4) return 'grid-cols-2'
    return 'grid-cols-3'
  }

  const citiesToShow = mapType === 'china' 
    ? displayVisitedCities.filter(city => !city.isInternational)
    : displayVisitedCities

  const getMapCenter = () => {
    if (mapTarget && mapTarget.lat !== 0 && mapTarget.lng !== 0) {
      return [mapTarget.lat, mapTarget.lng]
    }
    
    if (citiesToShow.length === 0) {
      return mapType === 'china' ? [35.0, 105.0] : [20.0, 0.0]
    }
    
    const validCities = citiesToShow.filter(city => city.lat !== 0 && city.lng !== 0)
    if (validCities.length === 0) {
      return mapType === 'china' ? [35.0, 105.0] : [20.0, 0.0]
    }
    
    const avgLat = validCities.reduce((sum, city) => sum + city.lat, 0) / validCities.length
    const avgLng = validCities.reduce((sum, city) => sum + city.lng, 0) / validCities.length
    
    return [avgLat, avgLng]
  }

  const getMapZoom = () => {
    if (mapTarget) {
      return mapType === 'china' ? 7 : 5
    }
    return mapType === 'china' ? 4 : 2
  }

  const handleCityClick = (city) => {
    setSelectedCity(city)
    if (city.lat !== 0 && city.lng !== 0) {
      setMapTarget({ lat: city.lat, lng: city.lng })
      setTimeout(() => setMapTarget(null), 2000)
    }
  }

  const resetMapView = () => {
    setMapTarget(null)
  }

  return (
    <section id="life" className="min-h-screen py-20 px-6 bg-gradient-to-b from-gray-50 via-white to-gray-100 relative">
      <input
        ref={fileInputRef}
        type="file"
        accept=".jpg,.jpeg,.png,.gif,.webp"
        onChange={handleFileSelect}
        className="hidden"
      />

      <AnimatePresence>
        {isPostModalOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closePostModal}
          >
            <motion.div
              className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-6 border-b border-gray-100">
                <h3 className="text-xl font-bold text-gray-800">发布动态</h3>
                <button
                  onClick={closePostModal}
                  disabled={modalLoading || uploadingImage}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                {modalError && (
                  <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-500 text-sm">
                    {modalError}
                  </div>
                )}

                <textarea
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  placeholder="分享你的生活瞬间..."
                  className="w-full h-32 p-4 bg-gray-50 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none resize-none text-gray-700 placeholder-gray-400 transition-all"
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    添加图片
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {selectedImages.map((img, index) => (
                      <div key={index} className="relative">
                        <img
                          src={img}
                          alt={`图片 ${index + 1}`}
                          className="w-full h-24 object-cover rounded-xl"
                        />
                        <button
                          onClick={() => setSelectedImages(prev => prev.filter((_, i) => i !== index))}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white shadow-lg"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                    {selectedImages.length < 6 && (
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploadingImage}
                        className="w-full h-24 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center hover:border-orange-400 hover:bg-orange-50 transition-all disabled:opacity-50"
                      >
                        <div className="flex flex-col items-center gap-1">
                          {uploadingImage ? (
                            <>
                              <Upload className="w-6 h-6 text-orange-400 animate-bounce" />
                              <span className="text-xs text-orange-400">上传中...</span>
                            </>
                          ) : (
                            <>
                              <ImageIcon className="w-6 h-6 text-gray-400" />
                              <span className="text-xs text-gray-400">添加图片</span>
                            </>
                          )}
                        </div>
                      </button>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    添加位置
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={selectedLocation}
                      onChange={(e) => setSelectedLocation(e.target.value)}
                      placeholder="在哪里？"
                      className="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none text-gray-700 placeholder-gray-400 transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-6 border-t border-gray-100">
                <button
                  onClick={closePostModal}
                  disabled={modalLoading || uploadingImage}
                  className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors disabled:opacity-50"
                >
                  取消
                </button>
                <motion.button
                  onClick={handlePostSubmit}
                  disabled={modalLoading || uploadingImage}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl font-medium hover:from-orange-600 hover:to-amber-600 transition-all shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2 disabled:opacity-50"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {modalLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>保存中...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>发布</span>
                    </>
                  )}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isEditMomentOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closePostModal}
          >
            <motion.div
              className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-6 border-b border-gray-100">
                <h3 className="text-xl font-bold text-gray-800">编辑动态</h3>
                <button
                  onClick={closePostModal}
                  disabled={modalLoading || uploadingImage}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                {modalError && (
                  <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-500 text-sm">
                    {modalError}
                  </div>
                )}

                <textarea
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  placeholder="分享你的生活瞬间..."
                  className="w-full h-32 p-4 bg-gray-50 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none resize-none text-gray-700 placeholder-gray-400 transition-all"
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    添加图片
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {selectedImages.map((img, index) => (
                      <div key={index} className="relative">
                        <img
                          src={img}
                          alt={`图片 ${index + 1}`}
                          className="w-full h-24 object-cover rounded-xl"
                        />
                        <button
                          onClick={() => setSelectedImages(prev => prev.filter((_, i) => i !== index))}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white shadow-lg"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                    {selectedImages.length < 6 && (
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploadingImage}
                        className="w-full h-24 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center hover:border-orange-400 hover:bg-orange-50 transition-all disabled:opacity-50"
                      >
                        <div className="flex flex-col items-center gap-1">
                          {uploadingImage ? (
                            <>
                              <Upload className="w-6 h-6 text-orange-400 animate-bounce" />
                              <span className="text-xs text-orange-400">上传中...</span>
                            </>
                          ) : (
                            <>
                              <ImageIcon className="w-6 h-6 text-gray-400" />
                              <span className="text-xs text-gray-400">添加图片</span>
                            </>
                          )}
                        </div>
                      </button>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    添加位置
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={selectedLocation}
                      onChange={(e) => setSelectedLocation(e.target.value)}
                      placeholder="在哪里？"
                      className="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none text-gray-700 placeholder-gray-400 transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-6 border-t border-gray-100">
                <button
                  onClick={closePostModal}
                  disabled={modalLoading || uploadingImage}
                  className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors disabled:opacity-50"
                >
                  取消
                </button>
                <motion.button
                  onClick={handleEditMoment}
                  disabled={modalLoading || uploadingImage}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl font-medium hover:from-orange-600 hover:to-amber-600 transition-all shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2 disabled:opacity-50"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {modalLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>保存中...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>保存</span>
                    </>
                  )}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isEditCityOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCityModal}
          >
            <motion.div
              className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-6 border-b border-gray-100">
                <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  {isAddingCity ? <Plus className="w-5 h-5 text-green-500" /> : <Edit2 className="w-5 h-5 text-blue-500" />}
                  {isAddingCity ? '添加城市' : '编辑城市'}
                </h3>
                <button
                  onClick={closeCityModal}
                  disabled={modalLoading}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                {modalError && (
                  <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-500 text-sm">
                    {modalError}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">城市名称</label>
                  <input
                    type="text"
                    value={cityFormData.name}
                    onChange={(e) => setCityFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 focus:outline-none focus:border-orange-500 transition-colors"
                    placeholder="请输入城市名称"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">纬度</label>
                    <input
                      type="number"
                      step="0.0000001"
                      value={cityFormData.lat}
                      onChange={(e) => setCityFormData(prev => ({ ...prev, lat: parseFloat(e.target.value) || 0 }))}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 focus:outline-none focus:border-orange-500 transition-colors"
                      placeholder="39.9"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">经度</label>
                    <input
                      type="number"
                      step="0.0000001"
                      value={cityFormData.lng}
                      onChange={(e) => setCityFormData(prev => ({ ...prev, lng: parseFloat(e.target.value) || 0 }))}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 focus:outline-none focus:border-orange-500 transition-colors"
                      placeholder="116.4"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">访问年份</label>
                    <input
                      type="number"
                      value={cityFormData.year}
                      onChange={(e) => setCityFormData(prev => ({ ...prev, year: parseInt(e.target.value) || new Date().getFullYear() }))}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 focus:outline-none focus:border-orange-500 transition-colors"
                      placeholder="2024"
                      min="1900"
                      max={new Date().getFullYear()}
                    />
                  </div>
                  <div className="flex items-end gap-4 pb-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={cityFormData.visited}
                        onChange={(e) => setCityFormData(prev => ({ ...prev, visited: e.target.checked }))}
                        className="w-4 h-4 text-orange-500 rounded focus:ring-orange-500"
                      />
                      <span className="text-sm text-gray-700">已访问</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={cityFormData.isInternational}
                        onChange={(e) => setCityFormData(prev => ({ ...prev, isInternational: e.target.checked }))}
                        className="w-4 h-4 text-orange-500 rounded focus:ring-orange-500"
                      />
                      <span className="text-sm text-gray-700">国际城市</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-6 border-t border-gray-100">
                <button
                  onClick={closeCityModal}
                  disabled={modalLoading}
                  className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors disabled:opacity-50"
                >
                  取消
                </button>
                {!isAddingCity && (
                  <button
                    onClick={handleDeleteCity}
                    disabled={modalLoading}
                    className="px-6 py-3 bg-red-500/10 text-red-500 rounded-xl font-medium hover:bg-red-500/20 transition-colors border border-red-500/30 disabled:opacity-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
                <motion.button
                  onClick={handleSaveCity}
                  disabled={modalLoading}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl font-medium hover:from-orange-600 hover:to-amber-600 transition-all shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2 disabled:opacity-50"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {modalLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>保存中...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>保存</span>
                    </>
                  )}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        className="max-w-4xl mx-auto"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-100px' }}
      >
        <motion.div className="text-center mb-16" variants={itemVariants}>
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500/10 to-amber-500/10 border border-orange-200 rounded-full mb-4"
            whileHover={{ scale: 1.05 }}
          >
            <Camera className="w-5 h-5 text-orange-500" />
            <span className="text-sm font-medium text-orange-600">My Life</span>
          </motion.div>
          <h2 className="text-4xl font-bold text-gray-800 mb-4">
            生活点滴
          </h2>
          <p className="text-gray-500 max-w-2xl mx-auto">
            记录生活中的美好瞬间，分享我的旅行足迹和日常感悟
          </p>
        </motion.div>

        <motion.div
          className="mb-8 bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 shadow-sm overflow-hidden"
          variants={itemVariants}
          whileHover={{ y: -2 }}
          transition={{ duration: 0.3 }}
        >
          <div className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                <User className="w-6 h-6 text-white" />
              </div>
              <div 
                className="flex-1 bg-gray-50 rounded-xl px-4 py-3 text-gray-400 cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => setIsPostModalOpen(true)}
              >
                分享你的生活瞬间...
              </div>
              <motion.button
                onClick={() => setIsPostModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl font-medium hover:from-orange-600 hover:to-amber-600 transition-all shadow-lg shadow-orange-500/25"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Plus className="w-5 h-5" />
                <span>发布</span>
              </motion.button>
            </div>
          </div>
        </motion.div>

        <div className="space-y-6 mb-16">
          {loading.moments ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
            </div>
          ) : (
            <AnimatePresence>
              {displayMoments.map((moment, index) => (
                <motion.div
                  key={moment.id}
                  className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 shadow-sm overflow-hidden relative"
                  variants={itemVariants}
                  whileHover={{ y: -2 }}
                  transition={{ duration: 0.3 }}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -30 }}
                >
                  {hasToken && (
                    <div className="absolute top-4 right-4 flex gap-2 z-10">
                      <motion.button
                        onClick={() => openEditMoment(moment)}
                        className="p-2 bg-white/80 backdrop-blur-sm rounded-lg hover:bg-blue-50 transition-colors shadow-sm"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Edit2 className="w-4 h-4 text-blue-500" />
                      </motion.button>
                      <motion.button
                        onClick={() => handleDeleteMoment(moment.id)}
                        className="p-2 bg-white/80 backdrop-blur-sm rounded-lg hover:bg-red-50 transition-colors shadow-sm"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </motion.button>
                    </div>
                  )}

                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                          <User className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-800">SamuelQZQ</h3>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Clock className="w-3.5 h-3.5" />
                            <span>{moment.time}</span>
                            {moment.location && (
                              <>
                                <span>·</span>
                                <MapPin className="w-3.5 h-3.5" />
                                <span>{moment.location}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {moment.content && (
                      <p className="text-gray-700 mb-4 leading-relaxed">
                        {moment.content}
                      </p>
                    )}

                    {moment.images && moment.images.length > 0 && (
                      <div className={`grid ${getImageGridClass(moment.images.length)} gap-2 mb-4`}>
                        {moment.images.map((img, imgIndex) => (
                          <motion.div
                            key={imgIndex}
                            className="relative rounded-xl overflow-hidden cursor-pointer"
                            whileHover={{ scale: 1.02 }}
                          >
                            <img
                              src={img}
                              alt={`图片 ${imgIndex + 1}`}
                              className={`w-full object-cover ${
                                moment.images.length === 1 
                                  ? 'max-h-96' 
                                  : 'h-40 sm:h-48'
                              }`}
                            />
                            {moment.images.length > 4 && imgIndex === 3 && (
                              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                <span className="text-white text-2xl font-bold">
                                  +{moment.images.length - 4}
                                </span>
                              </div>
                            )}
                          </motion.div>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className="flex items-center gap-6">
                        <motion.button
                          onClick={() => handleLike(moment.id)}
                          className="flex items-center gap-2 text-gray-500 hover:text-red-500 transition-colors"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Heart 
                            className={`w-5 h-5 ${moment.isLiked ? 'fill-current text-red-500' : ''}`} 
                          />
                          <span className="text-sm font-medium">
                            {moment.likes > 0 ? moment.likes : '点赞'}
                          </span>
                        </motion.button>
                        <motion.button
                          onClick={() => toggleComments(moment.id)}
                          className={`flex items-center gap-2 transition-colors ${
                            expandedMomentComments.has(moment.id) 
                              ? 'text-blue-500' 
                              : 'text-gray-500 hover:text-blue-500'
                          }`}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <MessageCircle className={`w-5 h-5 ${expandedMomentComments.has(moment.id) ? 'fill-current' : ''}`} />
                          <span className="text-sm font-medium">
                            {moment.comments > 0 ? moment.comments : '评论'}
                          </span>
                        </motion.button>
                        <button className="flex items-center gap-2 text-gray-500 hover:text-green-500 transition-colors">
                          <Share2 className="w-5 h-5" />
                          <span className="text-sm font-medium">分享</span>
                        </button>
                      </div>
                    </div>

                    <AnimatePresence>
                      {expandedMomentComments.has(moment.id) && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                          className="overflow-hidden"
                        >
                          <div className="pt-4 border-t border-gray-100">
                            <div className="flex items-start gap-3 mb-4">
                              <div className="flex-1">
                                <div className="flex items-end gap-2">
                                  <input
                                    type="text"
                                    value={newCommentInputs[moment.id] || ''}
                                    onChange={(e) => setNewCommentInputs(prev => ({ ...prev, [moment.id]: e.target.value }))}
                                    placeholder={replyingTo?.momentId === moment.id ? `回复 ${replyingTo.guestName}...` : '写下你的评论...'}
                                    className="flex-1 px-4 py-2.5 bg-gray-50 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none text-sm text-gray-700 placeholder-gray-400 transition-all"
                                    onKeyPress={(e) => {
                                      if (e.key === 'Enter') {
                                        if (replyingTo?.momentId === moment.id) {
                                          handleCreateComment(
                                            moment.id,
                                            newCommentInputs[moment.id] || '',
                                            replyingTo.commentId,
                                            replyingTo.commentId,
                                            replyingTo.guestName
                                          )
                                        } else {
                                          handleCreateComment(moment.id, newCommentInputs[moment.id] || '')
                                        }
                                      }
                                    }}
                                  />
                                  <motion.button
                                    onClick={() => {
                                      if (replyingTo?.momentId === moment.id) {
                                        handleCreateComment(
                                          moment.id,
                                          newCommentInputs[moment.id] || '',
                                          replyingTo.commentId,
                                          replyingTo.commentId,
                                          replyingTo.guestName
                                        )
                                      } else {
                                        handleCreateComment(moment.id, newCommentInputs[moment.id] || '')
                                      }
                                    }}
                                    className="px-4 py-2.5 bg-blue-500 text-white rounded-xl text-sm font-medium hover:bg-blue-600 transition-colors shadow-sm"
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                  >
                                    发送
                                  </motion.button>
                                </div>
                                {replyingTo?.momentId === moment.id && (
                                  <div className="flex items-center gap-2 mt-2">
                                    <span className="text-xs text-gray-500">回复中：</span>
                                    <span className="text-xs font-medium text-blue-500">{replyingTo.guestName}</span>
                                    <button
                                      onClick={cancelReply}
                                      className="text-xs text-gray-400 hover:text-red-500 transition-colors"
                                    >
                                      取消
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="space-y-4">
                              {loading.comments ? (
                                <div className="flex justify-center py-8">
                                  <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
                                </div>
                              ) : (
                                <>
                                  {(!comments[moment.id] || comments[moment.id].length === 0) && (!staticComments[moment.id] || staticComments[moment.id].length === 0) && (
                                    <div className="text-center py-8 text-gray-400">
                                      <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                      <p>暂无评论，快来抢沙发吧！</p>
                                    </div>
                                  )}

                                  {(comments[moment.id] || staticComments[moment.id] || []).map((comment) => (
                                    <div key={comment.ID} className="space-y-3">
                                      <div className="flex gap-3">
                                        <img
                                          src={comment.GuestAvatar}
                                          alt={comment.GuestName}
                                          className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                                        />
                                        <div className="flex-1 min-w-0">
                                          <div className="flex items-center gap-2 mb-1">
                                            <span className="font-medium text-gray-800 text-sm">{comment.GuestName}</span>
                                            <span className="text-xs text-gray-400">
                                              {comment.CreatedAt ? formatTimeAgo(comment.CreatedAt) : ''}
                                            </span>
                                          </div>
                                          <p className="text-gray-700 text-sm leading-relaxed mb-2">
                                            {comment.ReplyToGuestName && (
                                              <span className="text-blue-500 mr-1">
                                                回复 @{comment.ReplyToGuestName}：
                                              </span>
                                            )}
                                            {comment.Content}
                                          </p>
                                          <div className="flex items-center gap-4">
                                            <motion.button
                                              onClick={() => handleLikeComment(comment.ID)}
                                              className="flex items-center gap-1 text-xs text-gray-400 hover:text-red-500 transition-colors"
                                              whileHover={{ scale: 1.05 }}
                                            >
                                              <Heart className="w-3.5 h-3.5" />
                                              <span>{comment.Likes > 0 ? comment.Likes : '点赞'}</span>
                                            </motion.button>
                                            <motion.button
                                              onClick={() => startReply(moment.id, comment.ID, comment.GuestName)}
                                              className="flex items-center gap-1 text-xs text-gray-400 hover:text-blue-500 transition-colors"
                                              whileHover={{ scale: 1.05 }}
                                            >
                                              <MessageCircle className="w-3.5 h-3.5" />
                                              <span>回复</span>
                                            </motion.button>
                                          </div>
                                        </div>
                                      </div>

                                      {comment.Replies && comment.Replies.length > 0 && (
                                        <div className="ml-12 space-y-3 border-l-2 border-gray-100 pl-3">
                                          {comment.Replies.map((reply) => (
                                            <div key={reply.ID} className="flex gap-3">
                                              <img
                                                src={reply.GuestAvatar}
                                                alt={reply.GuestName}
                                                className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                                              />
                                              <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                  <span className="font-medium text-gray-800 text-xs">{reply.GuestName}</span>
                                                  <span className="text-xs text-gray-400">
                                                    {reply.CreatedAt ? formatTimeAgo(reply.CreatedAt) : ''}
                                                  </span>
                                                </div>
                                                <p className="text-gray-700 text-xs leading-relaxed mb-1">
                                                  {reply.ReplyToGuestName && (
                                                    <span className="text-blue-500 mr-1">
                                                      回复 @{reply.ReplyToGuestName}：
                                                    </span>
                                                  )}
                                                  {reply.Content}
                                                </p>
                                                <div className="flex items-center gap-4">
                                                  <motion.button
                                                    onClick={() => handleLikeComment(reply.ID)}
                                                    className="flex items-center gap-1 text-xs text-gray-400 hover:text-red-500 transition-colors"
                                                    whileHover={{ scale: 1.05 }}
                                                  >
                                                    <Heart className="w-3 h-3" />
                                                    <span>{reply.Likes > 0 ? reply.Likes : ''}</span>
                                                  </motion.button>
                                                  <motion.button
                                                    onClick={() => startReply(moment.id, comment.ID, reply.GuestName)}
                                                    className="flex items-center gap-1 text-xs text-gray-400 hover:text-blue-500 transition-colors"
                                                    whileHover={{ scale: 1.05 }}
                                                  >
                                                    <span>回复</span>
                                                  </motion.button>
                                                </div>
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>

        <motion.div
          className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 shadow-sm overflow-hidden"
          variants={itemVariants}
          whileHover={{ y: -2 }}
          transition={{ duration: 0.3 }}
        >
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-teal-50 to-cyan-50 rounded-xl border border-teal-100">
                  <MapPin className="w-6 h-6 text-teal-500" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800">旅行足迹</h3>
                  <p className="text-sm text-gray-500">点亮我去过的城市</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {hasToken && (
                  <motion.button
                    onClick={openAddCity}
                    className="flex items-center gap-1.5 px-3 py-2 bg-teal-500/10 border border-teal-500/20 rounded-lg text-teal-600 hover:bg-teal-500/20 transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Plus className="w-4 h-4" />
                    <span className="text-sm font-medium">添加城市</span>
                  </motion.button>
                )}
                <div className="flex items-center gap-2 bg-gray-100 rounded-xl p-1">
                  <motion.button
                    onClick={() => setMapType('china')}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      mapType === 'china' 
                        ? 'bg-white text-teal-600 shadow-sm' 
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Map className="w-4 h-4" />
                    <span>中国地图</span>
                  </motion.button>
                  <motion.button
                    onClick={() => setMapType('world')}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      mapType === 'world' 
                        ? 'bg-white text-teal-600 shadow-sm' 
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Globe className="w-4 h-4" />
                    <span>全球地图</span>
                  </motion.button>
                </div>
              </div>
            </div>

            <div className="relative rounded-xl overflow-hidden border border-gray-200/50" style={{ minHeight: '450px', height: '50vh' }}>
              {loading.cities ? (
                <div className="flex justify-center items-center h-full py-20">
                  <Loader2 className="w-8 h-8 text-teal-500 animate-spin" />
                </div>
              ) : (
                <MapContainer
                  center={getMapCenter()}
                  zoom={getMapZoom()}
                  style={{ height: '100%', width: '100%' }}
                  zoomControl={false}
                  scrollWheelZoom={true}
                >
                  <MapController 
                    center={getMapCenter()} 
                    zoom={getMapZoom()}
                  />
                  
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    maxZoom={19}
                  />
                  
                  {citiesToShow.map((city, index) => {
                    if (city.lat === 0 && city.lng === 0) return null
                    
                    return (
                      <Marker
                        key={`${city.name}-${index}`}
                        position={[city.lat, city.lng]}
                        icon={createCustomIcon()}
                      >
                        <Popup className="custom-popup">
                          <div className="p-3 min-w-[140px]">
                            <div className="flex items-center gap-2 mb-2">
                              <MapPin className="w-4 h-4 text-teal-500" />
                              <span className="font-bold text-gray-800">{city.name}</span>
                            </div>
                            <div className="space-y-1 text-sm">
                              <div className="flex justify-between">
                                <span className="text-gray-500">到访年份</span>
                                <span className="font-medium text-gray-700">{city.year}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-500">纬度</span>
                                <span className="font-medium text-gray-700">{city.lat.toFixed(4)}°</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-500">经度</span>
                                <span className="font-medium text-gray-700">{city.lng.toFixed(4)}°</span>
                              </div>
                            </div>
                            {hasToken && (
                              <div className="mt-3 pt-3 border-t border-gray-100">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    openEditCity(city)
                                  }}
                                  className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                  编辑城市
                                </button>
                              </div>
                            )}
                          </div>
                        </Popup>
                      </Marker>
                    )
                  })}
                  
                  <MapZoomControl />
                  
                  <div className="absolute bottom-4 left-4 flex flex-col gap-2 z-[1000]">
                    <div className="flex items-center gap-2 px-3 py-2 bg-white/90 backdrop-blur-sm rounded-lg shadow-sm border border-gray-200">
                      <div className="w-2.5 h-2.5 rounded-full bg-teal-500" />
                      <span className="text-sm text-gray-600">
                        已到访 {citiesToShow.length} 个城市
                      </span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-2 bg-white/90 backdrop-blur-sm rounded-lg shadow-sm border border-gray-200">
                      <Globe className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600">
                        {mapType === 'china' ? '国内' : '全球'}地图
                      </span>
                    </div>
                  </div>
                </MapContainer>
              )}
            </div>

            <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {citiesToShow.map((city) => (
                <motion.div
                  key={city.name}
                  className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-teal-50 to-cyan-50 rounded-xl border border-teal-100 cursor-pointer hover:shadow-md transition-all group relative"
                  whileHover={{ scale: 1.05, y: -2 }}
                  onClick={() => handleCityClick(city)}
                  onMouseEnter={() => setSelectedCity(city)}
                  onMouseLeave={() => setSelectedCity(null)}
                >
                  {hasToken && (
                    <motion.button
                      onClick={(e) => {
                        e.stopPropagation()
                        openEditCity(city)
                      }}
                      className="absolute -top-2 -right-2 p-1 bg-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                      whileHover={{ scale: 1.1 }}
                    >
                      <Edit2 className="w-3 h-3 text-blue-500" />
                    </motion.button>
                  )}
                  <div className="w-2 h-2 rounded-full bg-teal-500 flex-shrink-0" />
                  <span className="text-sm font-medium text-gray-700 truncate">
                    {city.name}
                  </span>
                  <span className="text-xs text-gray-400 flex-shrink-0">
                    {city.year}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </section>
  )
}

export default LifeSection
