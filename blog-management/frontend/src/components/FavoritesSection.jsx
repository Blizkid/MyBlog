import React, { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Film, Music, Book, Clock, Star, Calendar, TrendingUp, Heart, ChevronRight, Cloud, Edit2, Trash2, Plus, Loader2, ArrowLeft, Tag, Play, Pause, Volume2, VolumeX, SkipForward, SkipBack, BarChart3 } from 'lucide-react'
import FavoritesEditModal from './FavoritesEditModal'
import WordCloudEditModal from './WordCloudEditModal'

const API_BASE_URL = 'http://localhost:8080'

const staticMovies = [
  {
    id: 1,
    title: '星际穿越',
    genre: '科幻',
    rating: 9.3,
    poster: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Interstellar%20movie%20poster%20sci-fi%20space%20epic%20emotional%20journey&image_size=portrait_4_3',
    description: '关于爱与时间的史诗'
  },
  {
    id: 2,
    title: '肖申克的救赎',
    genre: '剧情',
    rating: 9.7,
    poster: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Shawshank%20Redemption%20movie%20poster%20classic%20drama%20hope%20prison&image_size=portrait_4_3',
    description: '希望是个好东西'
  },
  {
    id: 3,
    title: '盗梦空间',
    genre: '科幻',
    rating: 9.2,
    poster: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Inception%20movie%20poster%20mind%20bending%20dream%20sci-fi%20thriller&image_size=portrait_4_3',
    description: '梦境与现实的边界'
  }
]

const staticMoviesMore = [
  ...staticMovies,
  {
    id: 4,
    title: '阿甘正传',
    genre: '励志',
    rating: 9.5,
    poster: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Forrest%20Gump%20movie%20poster%20inspirational%20drama%20tom%20hanks&image_size=portrait_4_3',
    description: '人生就像一盒巧克力'
  },
  {
    id: 5,
    title: '泰坦尼克号',
    genre: '爱情',
    rating: 9.4,
    poster: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Titanic%20movie%20poster%20romance%20disaster%20epic%20ocean&image_size=portrait_4_3',
    description: '永恒的爱情故事'
  },
  {
    id: 6,
    title: '楚门的世界',
    genre: '剧情',
    rating: 9.3,
    poster: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Truman%20Show%20movie%20poster%20satirical%20drama%20reality%20tv&image_size=portrait_4_3',
    description: '如果人生是一场真人秀'
  },
  {
    id: 7,
    title: '黑客帝国',
    genre: '科幻',
    rating: 9.0,
    poster: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Matrix%20movie%20poster%20sci-fi%20cyberpunk%20action%20green%20code&image_size=portrait_4_3',
    description: '选择红色药丸还是蓝色药丸'
  },
  {
    id: 8,
    title: '教父',
    genre: '犯罪',
    rating: 9.6,
    poster: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Godfather%20movie%20poster%20classic%20crime%20drama%20mafia&image_size=portrait_4_3',
    description: '我将给他一个无法拒绝的条件'
  },
  {
    id: 9,
    title: '千与千寻',
    genre: '动画',
    rating: 9.4,
    poster: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Spirited%20Away%20movie%20poster%20studio%20ghibli%20anime%20fantasy%20spirits&image_size=portrait_4_3',
    description: '一段奇幻的成长之旅'
  }
]

const staticMusic = [
  {
    id: 1,
    title: '风雨欲来',
    artist: '五鹿鸿见',
    genre: '摇滚',
    cover: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Chinese%20rock%20music%20album%20cover%20dramatic%20stormy%20atmosphere&image_size=square',
    favorite: true,
    audio: `${API_BASE_URL}/uploads/mp3/五鹿鸿见 - 风雨欲来.mp3`
  },
  {
    id: 2,
    title: 'Hotel California',
    artist: 'Eagles',
    genre: '摇滚',
    cover: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Eagles%20hotel%20california%20album%20cover%20classic%20rock%20warm%20tones&image_size=square',
    favorite: true,
    audio: ''
  },
  {
    id: 3,
    title: 'Stairway to Heaven',
    artist: 'Led Zeppelin',
    genre: '摇滚',
    cover: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Led%20Zeppelin%20stairway%20to%20heaven%20album%20cover%20epic%20rock&image_size=square',
    favorite: false,
    audio: ''
  },
  {
    id: 4,
    title: 'Yesterday',
    artist: 'The Beatles',
    genre: '流行',
    cover: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Beatles%20yesterday%20album%20cover%20classic%20pop%20melodic&image_size=square',
    favorite: true,
    audio: ''
  }
]

const staticMusicMore = [
  ...staticMusic,
  {
    id: 5,
    title: 'Imagine',
    artist: 'John Lennon',
    genre: '流行',
    cover: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=John%20Lennon%20imagine%20album%20cover%20peace%20hope%20classic&image_size=square',
    favorite: true,
    audio: ''
  },
  {
    id: 6,
    title: 'Like a Rolling Stone',
    artist: 'Bob Dylan',
    genre: '民谣',
    cover: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Bob%20Dylan%20like%20a%20rolling%20stone%20album%20cover%20folk%20classic&image_size=square',
    favorite: false,
    audio: ''
  },
  {
    id: 7,
    title: 'Billie Jean',
    artist: 'Michael Jackson',
    genre: '流行',
    cover: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Michael%20Jackson%20billie%20jean%20album%20cover%20thriller%20pop%20king&image_size=square',
    favorite: true,
    audio: ''
  },
  {
    id: 8,
    title: 'Smells Like Teen Spirit',
    artist: 'Nirvana',
    genre: '摇滚',
    cover: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Nirvana%20smells%20like%20teen%20spirit%20album%20cover%20grunge%20rock&image_size=square',
    favorite: false,
    audio: ''
  }
]

const staticBooks = [
  {
    id: 1,
    title: '百年孤独',
    author: '加西亚·马尔克斯',
    genre: '魔幻现实主义',
    cover: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=One%20Hundred%20Years%20of%20Solitude%20book%20cover%20magic%20realism%20literary&image_size=portrait_4_3',
    rating: 9.5,
    status: '已读完'
  },
  {
    id: 2,
    title: '三体',
    author: '刘慈欣',
    genre: '科幻',
    cover: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Three%20Body%20Problem%20book%20cover%20chinese%20sci-fi%20dark%20forest&image_size=portrait_4_3',
    rating: 9.4,
    status: '已读完'
  },
  {
    id: 3,
    title: '活着',
    author: '余华',
    genre: '现实主义',
    cover: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=To%20Live%20book%20cover%20yu%20hua%20chinese%20literature%20emotional&image_size=portrait_4_3',
    rating: 9.3,
    status: '已读完'
  },
  {
    id: 4,
    title: '人类简史',
    author: '尤瓦尔·赫拉利',
    genre: '历史',
    cover: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Sapiens%20book%20cover%20human%20history%20philosophical%20academic&image_size=portrait_4_3',
    rating: 9.2,
    status: '阅读中'
  }
]

const staticBooksMore = [
  ...staticBooks,
  {
    id: 5,
    title: '追风筝的人',
    author: '卡勒德·胡赛尼',
    genre: '文学',
    cover: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Kite%20Runner%20book%20cover%20afghanistan%20redemption%20story&image_size=portrait_4_3',
    rating: 9.1,
    status: '已读完'
  },
  {
    id: 6,
    title: '解忧杂货店',
    author: '东野圭吾',
    genre: '治愈',
    cover: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Miracles%20of%20the%20Namiya%20General%20Store%20book%20cover%20japanese%20healing&image_size=portrait_4_3',
    rating: 8.8,
    status: '已读完'
  },
  {
    id: 7,
    title: '小王子',
    author: '安托万·德·圣-埃克苏佩里',
    genre: '童话',
    cover: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Little%20Prince%20book%20cover%20french%20classic%20fable%20rose&image_size=portrait_4_3',
    rating: 9.4,
    status: '已读完'
  },
  {
    id: 8,
    title: '挪威的森林',
    author: '村上春树',
    genre: '文学',
    cover: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Norwegian%20Wood%20book%20cover%20haruki%20murakami%20japanese%20novel&image_size=portrait_4_3',
    rating: 9.0,
    status: '已读完'
  },
  {
    id: 9,
    title: '明朝那些事儿',
    author: '当年明月',
    genre: '历史',
    cover: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Ming%20Dynasty%20Those%20Things%20book%20cover%20chinese%20history%20popular&image_size=portrait_4_3',
    rating: 9.2,
    status: '阅读中'
  }
]

const lifeTimeTable = [
  { category: '工作', hoursPerDay: 8, hoursPerWeek: 40, percentage: 33, color: 'bg-blue-400' },
  { category: '睡眠', hoursPerDay: 8, hoursPerWeek: 56, percentage: 33, color: 'bg-indigo-400' },
  { category: '学习', hoursPerDay: 3, hoursPerWeek: 21, percentage: 12.5, color: 'bg-green-400' },
  { category: '娱乐', hoursPerDay: 3, hoursPerWeek: 21, percentage: 12.5, color: 'bg-amber-400' },
  { category: '运动', hoursPerDay: 1, hoursPerWeek: 7, percentage: 4, color: 'bg-red-400' },
  { category: '其他', hoursPerDay: 1, hoursPerWeek: 7, percentage: 5, color: 'bg-gray-400' },
]

const wordCloudData = [
  { text: '科幻', category: '电影类型', weight: 95, color: 'text-pink-500' },
  { text: '剧情', category: '电影类型', weight: 85, color: 'text-purple-500' },
  { text: '星际穿越', category: '电影名', weight: 90, color: 'text-blue-500' },
  { text: '肖申克的救赎', category: '电影名', weight: 88, color: 'text-indigo-500' },
  { text: '盗梦空间', category: '电影名', weight: 87, color: 'text-cyan-500' },
  { text: '摇滚', category: '音乐品味', weight: 92, color: 'text-orange-500' },
  { text: '流行', category: '音乐品味', weight: 75, color: 'text-pink-400' },
  { text: 'Queen', category: '音乐人', weight: 94, color: 'text-amber-500' },
  { text: 'Eagles', category: '音乐人', weight: 86, color: 'text-emerald-500' },
  { text: 'Led Zeppelin', category: '音乐人', weight: 84, color: 'text-teal-500' },
  { text: 'The Beatles', category: '音乐人', weight: 91, color: 'text-sky-500' },
  { text: '魔幻现实主义', category: '书籍类型', weight: 89, color: 'text-rose-500' },
  { text: '现实主义', category: '书籍类型', weight: 82, color: 'text-fuchsia-500' },
  { text: '历史', category: '书籍类型', weight: 78, color: 'text-violet-500' },
  { text: '百年孤独', category: '书籍', weight: 88, color: 'text-pink-600' },
  { text: '三体', category: '书籍', weight: 93, color: 'text-purple-600' },
  { text: '活着', category: '书籍', weight: 85, color: 'text-blue-600' },
  { text: '人类简史', category: '书籍', weight: 80, color: 'text-indigo-600' },
  { text: '悬疑', category: '电影类型', weight: 70, color: 'text-gray-600' },
  { text: '动画', category: '电影类型', weight: 73, color: 'text-green-500' },
  { text: '喜剧', category: '电影类型', weight: 68, color: 'text-yellow-500' },
  { text: '爱情', category: '电影类型', weight: 65, color: 'text-red-400' },
  { text: '古典', category: '音乐品味', weight: 60, color: 'text-amber-600' },
  { text: '爵士', category: '音乐品味', weight: 58, color: 'text-emerald-600' },
  { text: '说唱', category: '音乐品味', weight: 55, color: 'text-cyan-600' },
  { text: '哲学', category: '书籍类型', weight: 55, color: 'text-sky-600' },
  { text: '心理学', category: '书籍类型', weight: 52, color: 'text-rose-600' },
  { text: '科幻小说', category: '书籍类型', weight: 72, color: 'text-fuchsia-600' },
]

const getFibonacciSpherePoints = (count, radius = 1) => {
  const points = []
  const phi = Math.PI * (3 - Math.sqrt(5))

  for (let i = 0; i < count; i++) {
    const y = 1 - (i / (count - 1 || 1)) * 2
    const radiusAtY = Math.sqrt(1 - y * y)
    const theta = phi * i

    const x = Math.cos(theta) * radiusAtY
    const z = Math.sin(theta) * radiusAtY

    points.push({
      x: x * radius,
      y: y * radius,
      z: z * radius,
    })
  }
  return points
}

const BASE_RADIUS = 140
const MAX_RADIUS = 200
const BASE_TAG_COUNT = 30

const calculateRadius = (tagCount) => {
  if (tagCount <= BASE_TAG_COUNT) return BASE_RADIUS
  const additionalTags = tagCount - BASE_TAG_COUNT
  const increase = Math.min(additionalTags * 0.8, MAX_RADIUS - BASE_RADIUS)
  return BASE_RADIUS + increase
}

const WordCloud = ({ tags, onEditClick, hasToken }) => {
  const [hoveredWord, setHoveredWord] = useState(null)
  const [rotation, setRotation] = useState({ x: -15, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [autoRotate, setAutoRotate] = useState(true)
  const lastMousePosRef = useRef({ x: 0, y: 0 })
  const animationRef = useRef(null)
  const perspective = 400

  const displayTags = tags?.length > 0 ? tags : wordCloudData
  const sphereRadius = calculateRadius(displayTags.length)

  const spherePoints = React.useMemo(() => {
    return getFibonacciSpherePoints(displayTags.length, sphereRadius)
  }, [displayTags.length, sphereRadius])

  useEffect(() => {
    if (!autoRotate || isDragging) return

    const animate = () => {
      setRotation(prev => ({
        ...prev,
        y: prev.y + 0.15,
      }))
      animationRef.current = requestAnimationFrame(animate)
    }

    animationRef.current = requestAnimationFrame(animate)
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [autoRotate, isDragging])

  const getFontSize = (weight) => {
    const minSize = 12
    const maxSize = 26
    return minSize + (weight / 100) * (maxSize - minSize)
  }

  const handleMouseDown = (e) => {
    setIsDragging(true)
    setAutoRotate(false)
    lastMousePosRef.current = { x: e.clientX, y: e.clientY }
  }

  const handleMouseMove = useCallback((e) => {
    if (!isDragging) return

    const deltaX = e.clientX - lastMousePosRef.current.x
    const deltaY = e.clientY - lastMousePosRef.current.y

    setRotation(prev => ({
      x: Math.max(-60, Math.min(60, prev.x - deltaY * 0.3)),
      y: prev.y + deltaX * 0.3,
    }))

    lastMousePosRef.current = { x: e.clientX, y: e.clientY }
  }, [isDragging])

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
    setTimeout(() => setAutoRotate(true), 2000)
  }, [])

  const handleMouseLeave = useCallback(() => {
    setIsDragging(false)
  }, [])

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging, handleMouseMove, handleMouseUp])

  const calculatePosition = useCallback((point) => {
    const radX = (rotation.x * Math.PI) / 180
    const radY = (rotation.y * Math.PI) / 180

    let { x, y, z } = point

    const cosY = Math.cos(radY)
    const sinY = Math.sin(radY)
    let newX = x * cosY - z * sinY
    let newZ = x * sinY + z * cosY

    const cosX = Math.cos(radX)
    const sinX = Math.sin(radX)
    let newY = y * cosX - newZ * sinX
    let newZ2 = y * sinX + newZ * cosX

    const scale = perspective / (perspective + newZ2)
    const isFront = newZ2 <= 0

    return {
      x: newX * scale,
      y: newY * scale,
      z: newZ2,
      scale: scale,
      isFront: isFront,
      opacity: isFront ? Math.min(1, Math.max(0.85, scale * 0.95)) : Math.max(0.2, scale * 0.4),
    }
  }, [rotation])

  const getCalcExpression = (basePercent, pixelValue) => {
    if (pixelValue >= 0) {
      return `calc(${basePercent} + ${pixelValue}px)`
    }
    return `calc(${basePercent} - ${Math.abs(pixelValue)}px)`
  }

  return (
    <div
      className="relative w-full h-[500px] flex items-center justify-center cursor-grab active:cursor-grabbing select-none overflow-hidden"
      onMouseDown={handleMouseDown}
      onMouseLeave={handleMouseLeave}
    >
      <motion.div
        className="absolute rounded-full border-2 border-dashed border-gray-200 opacity-40"
        animate={{
          width: `${sphereRadius * 2.6}px`,
          height: `${sphereRadius * 2.6}px`,
        }}
        style={{
          boxShadow: 'inset 0 0 50px rgba(0,0,0,0.03), 0 0 30px rgba(0,0,0,0.03)',
        }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      />

      <motion.div
        className="absolute rounded-full bg-gradient-to-br from-gray-50/50 to-gray-100/30 backdrop-blur-sm"
        animate={{
          width: `${sphereRadius * 2.45}px`,
          height: `${sphereRadius * 2.45}px`,
        }}
        style={{
          boxShadow: 'inset 0 0 40px rgba(255,255,255,0.5)',
        }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      />

      <motion.div
        className="relative"
        animate={{
          width: `${sphereRadius * 2.6}px`,
          height: `${sphereRadius * 2.6}px`,
        }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        {displayTags.map((word, index) => {
          const point = spherePoints[index] || { x: 0, y: 0, z: 0 }
          const position = calculatePosition(point)
          const baseFontSize = getFontSize(word.weight)
          const isHovered = hoveredWord === index

          const hoverMultiplier = isHovered ? 1.25 : 1
          const currentOpacity = isHovered ? 1 : position.opacity
          const fontSize = baseFontSize * position.scale
          const currentScale = hoverMultiplier

          return (
            <div
              key={`${word.text}-${index}`}
              className={`absolute font-bold ${word.color} ${
                position.isFront ? 'pointer-events-auto cursor-pointer' : 'pointer-events-none'
              }`}
              style={{
                left: getCalcExpression('50%', position.x),
                top: getCalcExpression('50%', position.y),
                transform: `translate(-50%, -50%) scale(${currentScale})`,
                fontSize: `${fontSize}px`,
                opacity: currentOpacity,
                textShadow: isHovered
                  ? `0 0 12px rgba(255, 255, 255, 0.9), 0 0 20px rgba(255, 255, 255, 0.5), 0 2px 4px rgba(0,0,0,0.15)`
                  : position.isFront
                    ? '0 1px 2px rgba(0,0,0,0.05)'
                    : 'none',
                whiteSpace: 'nowrap',
                zIndex: Math.round(position.z + 800),
                fontWeight: isHovered ? 800 : 600,
                transition: 'transform 0.2s ease-out, opacity 0.15s ease-out, text-shadow 0.2s ease-out',
              }}
              onMouseEnter={() => {
                if (position.isFront) {
                  setHoveredWord(index)
                  setAutoRotate(false)
                }
              }}
              onMouseLeave={() => {
                setHoveredWord(null)
                setTimeout(() => setAutoRotate(true), 1000)
              }}
            >
              {word.text}
            </div>
          )
        })}
      </motion.div>

      <AnimatePresence>
        {hoveredWord !== null && displayTags[hoveredWord] && (
          <motion.div
            className="absolute bottom-8 left-1/2 transform -translate-x-1/2 px-6 py-3 bg-white/95 backdrop-blur-md rounded-xl shadow-xl border border-gray-200 z-50"
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            <div className="flex items-center gap-3">
              <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                displayTags[hoveredWord]?.category.includes('电影')
                  ? 'bg-pink-100 text-pink-600 border border-pink-200'
                  : displayTags[hoveredWord]?.category.includes('音乐') || displayTags[hoveredWord]?.category === '音乐人'
                    ? 'bg-orange-100 text-orange-600 border border-orange-200'
                    : 'bg-green-100 text-green-600 border border-green-200'
              }`}>
                {displayTags[hoveredWord]?.category}
              </div>
              <span className="text-sm font-bold text-gray-800">
                {displayTags[hoveredWord]?.text}
              </span>
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Star className="w-3.5 h-3.5 text-amber-400 fill-current" />
                <span>权重: {displayTags[hoveredWord]?.weight}</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex flex-col items-center gap-2">
        <motion.div
          className="flex items-center gap-2 text-xs text-gray-400"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span>拖拽旋转 · 悬停查看详情</span>
        </motion.div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Tag className="w-3.5 h-3.5" />
            <span>{displayTags.length} 个标签</span>
            <span className="text-gray-300">|</span>
            <span>半径: {Math.round(sphereRadius)}px</span>
          </div>

          {hasToken && onEditClick && (
            <motion.button
              onClick={onEditClick}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-50 text-cyan-600 rounded-lg text-xs font-medium hover:bg-cyan-100 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>编辑词云</span>
            </motion.button>
          )}
        </div>
      </div>
    </div>
  )
}

const pageTransitionVariants = {
  initial: { x: '100%', opacity: 0, filter: 'blur(8px)' },
  animate: { x: 0, opacity: 1, filter: 'blur(0px)' },
  exit: { x: '-100%', opacity: 0, filter: 'blur(8px)' },
}

const backTransitionVariants = {
  initial: { x: '-100%', opacity: 0, filter: 'blur(8px)' },
  animate: { x: 0, opacity: 1, filter: 'blur(0px)' },
  exit: { x: '100%', opacity: 0, filter: 'blur(8px)' },
}

const FavoritesSection = () => {
  const [movies, setMovies] = useState([])
  const [musicList, setMusicList] = useState([])
  const [books, setBooks] = useState([])
  const [lifeTimeAllocations, setLifeTimeAllocations] = useState([])
  const [wordCloudTags, setWordCloudTags] = useState([])
  const [loading, setLoading] = useState({
    movies: false,
    music: false,
    books: false,
    lifeTime: false,
    wordCloud: false,
  })

  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [editingType, setEditingType] = useState('')
  const [isAddingNew, setIsAddingNew] = useState(false)

  const [isWordCloudModalOpen, setIsWordCloudModalOpen] = useState(false)

  const [currentView, setCurrentView] = useState('overview')
  const [isNavigatingBack, setIsNavigatingBack] = useState(false)

  const [currentPlayingMusic, setCurrentPlayingMusic] = useState(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [volume, setVolume] = useState(0.7)
  const [isMuted, setIsMuted] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const audioRef = useRef(null)
  const playerRef = useRef({
    currentPlayingMusic: null,
    isPlaying: false,
    currentView: 'overview',
    volume: 0.7,
    isMuted: false,
  })

  const currentYear = new Date().getFullYear()
  const [lifeTimeStats, setLifeTimeStats] = useState({
    year: currentYear,
    month: 0,
    data: [],
  })
  const [loadingStats, setLoadingStats] = useState(false)
  const [showStatsTable, setShowStatsTable] = useState(false)

  const hasToken = !!localStorage.getItem('token')

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

  const displayMovies = hasToken && movies.length > 0 ? movies : staticMovies
  const displayMoviesMore = hasToken && movies.length > 3 ? movies : staticMoviesMore
  const displayMusic = hasToken && musicList.length > 0 ? musicList : staticMusic
  const displayMusicMore = hasToken && musicList.length > 4 ? musicList : staticMusicMore
  const displayBooks = hasToken && books.length > 0 ? books : staticBooks
  const displayBooksMore = hasToken && books.length > 4 ? books : staticBooksMore
  const displayLifeTime = hasToken && lifeTimeAllocations.length > 0
    ? lifeTimeAllocations.map(item => ({
        category: item.category,
        hoursPerDay: item.hours_per_day,
        hoursPerWeek: item.hours_per_week,
        percentage: item.percentage,
        color: item.color,
        id: item.id,
      }))
    : lifeTimeTable

  const fetchData = useCallback(async (type) => {
    const token = localStorage.getItem('token')
    if (!token) return

    const endpoints = {
      movies: '/movie/list',
      music: '/music/list',
      books: '/book/list',
      lifeTime: '/life-time-allocation/list',
      wordCloud: '/word-cloud-tag/list',
    }

    const setters = {
      movies: setMovies,
      music: setMusicList,
      books: setBooks,
      lifeTime: setLifeTimeAllocations,
      wordCloud: setWordCloudTags,
    }

    setLoading(prev => ({ ...prev, [type]: true }))
    try {
      const response = await fetch(`${API_BASE_URL}${endpoints[type]}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      })
      const data = await response.json()
      if (data.code === 0 && data.data) {
        setters[type](data.data)
      } else {
        setters[type]([])
      }
    } catch (err) {
      console.error(`Failed to fetch ${type}:`, err)
      setters[type]([])
    } finally {
      setLoading(prev => ({ ...prev, [type]: false }))
    }
  }, [])

  useEffect(() => {
    if (hasToken) {
      fetchData('movies')
      fetchData('music')
      fetchData('books')
      fetchData('lifeTime')
      fetchData('wordCloud')
    }
  }, [hasToken, fetchData])

  const fetchLifeTimeStats = useCallback(async (year, month = 0) => {
    const token = localStorage.getItem('token')
    if (!token) return

    setLoadingStats(true)
    try {
      const endpoint = month > 0 
        ? '/life-time-allocation/list/month' 
        : '/life-time-allocation/list/year'
      
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ year, month }),
      })
      const data = await response.json()
      if (data.code === 0 && data.data) {
        setLifeTimeStats({
          year,
          month,
          data: data.data,
        })
      } else {
        setLifeTimeStats(prev => ({ ...prev, data: [] }))
      }
    } catch (err) {
      console.error('Failed to fetch life time stats:', err)
      setLifeTimeStats(prev => ({ ...prev, data: [] }))
    } finally {
      setLoadingStats(false)
    }
  }, [])

  const openEditModal = (item, type, isNew = false) => {
    setEditingItem(item)
    setEditingType(type)
    setIsAddingNew(isNew)
    setIsEditModalOpen(true)
  }

  const closeEditModal = () => {
    setIsEditModalOpen(false)
    setEditingItem(null)
    setEditingType('')
    setIsAddingNew(false)
  }

  const handleSave = () => {
    if (editingType === 'movie') {
      fetchData('movies')
    } else if (editingType === 'music') {
      fetchData('music')
    } else if (editingType === 'book') {
      fetchData('books')
    } else if (editingType === 'lifeTime') {
      fetchData('lifeTime')
    }
  }

  const handleDelete = () => {
    if (editingType === 'movie') {
      setMovies(prev => prev.filter(m => m.id !== editingItem.id))
      fetchData('movies')
    } else if (editingType === 'music') {
      setMusicList(prev => prev.filter(m => m.id !== editingItem.id))
      fetchData('music')
    } else if (editingType === 'book') {
      setBooks(prev => prev.filter(b => b.id !== editingItem.id))
      fetchData('books')
    } else if (editingType === 'lifeTime') {
      setLifeTimeAllocations(prev => prev.filter(l => l.id !== editingItem.id))
      fetchData('lifeTime')
    }
  }

  const handlePlayMusic = useCallback((music) => {
    if (!music.audio) return
    
    const currentMusic = playerRef.current.currentPlayingMusic
    
    if (currentMusic?.id === music.id) {
      if (playerRef.current.isPlaying) {
        audioRef.current?.pause()
      } else {
        audioRef.current?.play()
      }
    } else {
      if (audioRef.current) {
        audioRef.current.pause()
      }
      
      playerRef.current.currentPlayingMusic = music
      playerRef.current.isPlaying = true
      setCurrentPlayingMusic(music)
      setCurrentTime(0)
      setIsPlaying(true)
      
      if (audioRef.current) {
        audioRef.current.src = music.audio
        audioRef.current.volume = playerRef.current.volume
        audioRef.current.muted = playerRef.current.isMuted
        audioRef.current.play().catch(console.error)
      }
    }
  }, [])

  const handleTogglePlay = useCallback(() => {
    if (!audioRef.current || !playerRef.current.currentPlayingMusic) return
    
    if (playerRef.current.isPlaying) {
      audioRef.current.pause()
    } else {
      audioRef.current.play()
    }
  }, [])

  const handleVolumeChange = useCallback((e) => {
    const newVolume = parseFloat(e.target.value)
    playerRef.current.volume = newVolume
    playerRef.current.isMuted = newVolume === 0
    setVolume(newVolume)
    setIsMuted(newVolume === 0)
    if (audioRef.current) {
      audioRef.current.volume = newVolume
      audioRef.current.muted = newVolume === 0
    }
  }, [])

  const handleToggleMute = useCallback(() => {
    const newMuted = !playerRef.current.isMuted
    playerRef.current.isMuted = newMuted
    setIsMuted(newMuted)
    if (audioRef.current) {
      audioRef.current.muted = newMuted
    }
  }, [])

  const handleSeek = useCallback((e) => {
    const newTime = parseFloat(e.target.value)
    setCurrentTime(newTime)
    if (audioRef.current) {
      audioRef.current.currentTime = newTime
    }
  }, [])

  const handlePrevious = useCallback(() => {
    const currentMusic = playerRef.current.currentPlayingMusic
    const currentView = playerRef.current.currentView
    const allMusic = currentView === 'music' ? displayMusicMore : displayMusic
    const currentIndex = allMusic.findIndex(m => m.id === currentMusic?.id)
    
    if (currentIndex > 0) {
      const prevMusic = allMusic.slice(0, currentIndex).reverse().find(m => m.audio)
      if (prevMusic) {
        const currentMusic2 = playerRef.current.currentPlayingMusic
        
        if (audioRef.current) {
          audioRef.current.pause()
        }
        
        playerRef.current.currentPlayingMusic = prevMusic
        playerRef.current.isPlaying = true
        setCurrentPlayingMusic(prevMusic)
        setCurrentTime(0)
        setIsPlaying(true)
        
        if (audioRef.current) {
          audioRef.current.src = prevMusic.audio
          audioRef.current.volume = playerRef.current.volume
          audioRef.current.muted = playerRef.current.isMuted
          audioRef.current.play().catch(console.error)
        }
      }
    }
  }, [displayMusic, displayMusicMore])

  const handleNext = useCallback(() => {
    const currentMusic = playerRef.current.currentPlayingMusic
    const currentView = playerRef.current.currentView
    const allMusic = currentView === 'music' ? displayMusicMore : displayMusic
    const currentIndex = allMusic.findIndex(m => m.id === currentMusic?.id)
    
    if (currentIndex < allMusic.length - 1) {
      const nextMusic = allMusic.slice(currentIndex + 1).find(m => m.audio)
      if (nextMusic) {
        if (audioRef.current) {
          audioRef.current.pause()
        }
        
        playerRef.current.currentPlayingMusic = nextMusic
        playerRef.current.isPlaying = true
        setCurrentPlayingMusic(nextMusic)
        setCurrentTime(0)
        setIsPlaying(true)
        
        if (audioRef.current) {
          audioRef.current.src = nextMusic.audio
          audioRef.current.volume = playerRef.current.volume
          audioRef.current.muted = playerRef.current.isMuted
          audioRef.current.play().catch(console.error)
        }
      }
    }
  }, [displayMusic, displayMusicMore])

  const formatTime = (seconds) => {
    if (isNaN(seconds)) return '0:00'
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    let lastTimeUpdate = 0
    const throttleInterval = 200

    const handleTimeUpdate = () => {
      const now = Date.now()
      if (now - lastTimeUpdate >= throttleInterval) {
        lastTimeUpdate = now
        setCurrentTime(audio.currentTime)
      }
    }

    const handleLoadedMetadata = () => {
      setDuration(audio.duration)
    }

    const handleEnded = () => {
      playerRef.current.isPlaying = false
      setIsPlaying(false)
      
      const currentMusic = playerRef.current.currentPlayingMusic
      const currentView = playerRef.current.currentView
      const allMusic = currentView === 'music' ? displayMusicMore : displayMusic
      const currentIndex = allMusic.findIndex(m => m.id === currentMusic?.id)
      
      if (currentIndex < allMusic.length - 1) {
        const nextMusic = allMusic.slice(currentIndex + 1).find(m => m.audio)
        if (nextMusic && audioRef.current) {
          playerRef.current.currentPlayingMusic = nextMusic
          playerRef.current.isPlaying = true
          setCurrentPlayingMusic(nextMusic)
          setCurrentTime(0)
          setIsPlaying(true)
          
          audioRef.current.src = nextMusic.audio
          audioRef.current.volume = playerRef.current.volume
          audioRef.current.muted = playerRef.current.isMuted
          audioRef.current.play().catch(console.error)
        }
      }
    }

    const handlePlay = () => {
      playerRef.current.isPlaying = true
      setIsPlaying(true)
    }

    const handlePause = () => {
      playerRef.current.isPlaying = false
      setIsPlaying(false)
    }

    audio.addEventListener('timeupdate', handleTimeUpdate)
    audio.addEventListener('loadedmetadata', handleLoadedMetadata)
    audio.addEventListener('ended', handleEnded)
    audio.addEventListener('play', handlePlay)
    audio.addEventListener('pause', handlePause)

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate)
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata)
      audio.removeEventListener('ended', handleEnded)
      audio.removeEventListener('play', handlePlay)
      audio.removeEventListener('pause', handlePause)
    }
  }, [displayMusic, displayMusicMore])

  useEffect(() => {
    playerRef.current.currentView = currentView
  }, [currentView])

  useEffect(() => {
    playerRef.current.currentPlayingMusic = currentPlayingMusic
  }, [currentPlayingMusic])

  const navigateToView = (view) => {
    setIsNavigatingBack(false)
    setCurrentView(view)
  }

  const navigateBack = () => {
    setIsNavigatingBack(true)
    setCurrentView('overview')
  }

  const openWordCloudEditModal = () => {
    setIsWordCloudModalOpen(true)
  }

  const closeWordCloudEditModal = () => {
    setIsWordCloudModalOpen(false)
  }

  const refreshWordCloudTags = () => {
    fetchData('wordCloud')
  }

  const MoviesView = () => (
    <div className="max-w-7xl mx-auto py-8">
      <div className="flex items-center gap-4 mb-8">
        <motion.button
          onClick={navigateBack}
          className="flex items-center gap-2 px-4 py-2 bg-pink-50 text-pink-600 rounded-xl hover:bg-pink-100 transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">返回</span>
        </motion.button>
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-pink-50 to-red-50 rounded-xl border border-pink-100">
            <Film className="w-6 h-6 text-pink-500" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">全部电影</h2>
            <p className="text-sm text-gray-500">共 {displayMoviesMore.length} 部电影</p>
          </div>
        </div>
        {hasToken && (
          <motion.button
            onClick={() => openEditModal(null, 'movie', true)}
            className="ml-auto flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-xl hover:from-pink-600 hover:to-rose-600 transition-colors shadow-lg shadow-pink-500/25"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Plus className="w-5 h-5" />
            <span className="font-medium">添加电影</span>
          </motion.button>
        )}
      </div>

      {loading.movies ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-10 h-10 text-pink-500 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {displayMoviesMore.map((movie, index) => (
            <motion.div
              key={movie.id}
              className="group relative rounded-2xl overflow-hidden border border-gray-100 hover:border-pink-200 transition-all duration-300 bg-white shadow-sm hover:shadow-xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ y: -8 }}
            >
              {hasToken && (
                <div className="absolute top-3 right-3 flex gap-2 z-10">
                  <motion.button
                    onClick={(e) => {
                      e.stopPropagation()
                      openEditModal(movie, 'movie', false)
                    }}
                    className="p-2 bg-white/95 backdrop-blur-sm rounded-xl hover:bg-blue-50 transition-colors shadow-md"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Edit2 className="w-4 h-4 text-blue-500" />
                  </motion.button>
                  <motion.button
                    onClick={(e) => {
                      e.stopPropagation()
                      setEditingItem(movie)
                      setEditingType('movie')
                    }}
                    className="p-2 bg-white/95 backdrop-blur-sm rounded-xl hover:bg-red-50 transition-colors shadow-md"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </motion.button>
                </div>
              )}

              <div className="relative h-56 overflow-hidden">
                <img
                  src={movie.poster}
                  alt={movie.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                
                <div className="absolute top-3 left-3 flex items-center gap-1 px-2.5 py-1 bg-black/60 backdrop-blur-sm rounded-lg">
                  <Star className="w-4 h-4 text-amber-400 fill-current" />
                  <span className="text-sm font-medium text-amber-300">{movie.rating}</span>
                </div>

                <div className="absolute bottom-4 left-4">
                  <span className="px-3 py-1 bg-pink-500/90 backdrop-blur-sm rounded-full text-sm font-medium text-white shadow-lg">
                    {movie.genre}
                  </span>
                </div>
              </div>

              <div className="p-5 bg-white">
                <h4 className="text-lg font-bold text-gray-800 mb-2 group-hover:text-pink-600 transition-colors">
                  {movie.title}
                </h4>
                <p className="text-sm text-gray-500 line-clamp-2">
                  {movie.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )

  const MusicView = () => (
    <div className="max-w-5xl mx-auto py-8">
      <div className="flex items-center gap-4 mb-8">
        <motion.button
          onClick={navigateBack}
          className="flex items-center gap-2 px-4 py-2 bg-purple-50 text-purple-600 rounded-xl hover:bg-purple-100 transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">返回</span>
        </motion.button>
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl border border-purple-100">
            <Music className="w-6 h-6 text-purple-500" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">全部音乐</h2>
            <p className="text-sm text-gray-500">共 {displayMusicMore.length} 首歌曲</p>
          </div>
        </div>
        {hasToken && (
          <motion.button
            onClick={() => openEditModal(null, 'music', true)}
            className="ml-auto flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-xl hover:from-purple-600 hover:to-indigo-600 transition-colors shadow-lg shadow-purple-500/25"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Plus className="w-5 h-5" />
            <span className="font-medium">添加音乐</span>
          </motion.button>
        )}
      </div>

      {loading.music ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-10 h-10 text-purple-500 animate-spin" />
        </div>
      ) : (
        <div className="space-y-4">
          {displayMusicMore.map((music, index) => (
            <motion.div
              key={music.id}
              className="group flex items-center gap-6 p-5 bg-white rounded-2xl border border-gray-100 hover:border-purple-200 transition-all duration-300 shadow-sm hover:shadow-lg"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ x: 4 }}
            >
              {hasToken && (
                <div className="flex gap-2 order-last">
                  <motion.button
                    onClick={(e) => {
                      e.stopPropagation()
                      openEditModal(music, 'music', false)
                    }}
                    className="p-2 bg-blue-50 text-blue-500 rounded-xl hover:bg-blue-100 transition-colors"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Edit2 className="w-4 h-4" />
                  </motion.button>
                  <motion.button
                    onClick={(e) => {
                      e.stopPropagation()
                      setEditingItem(music)
                      setEditingType('music')
                    }}
                    className="p-2 bg-red-50 text-red-500 rounded-xl hover:bg-red-100 transition-colors"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </motion.button>
                </div>
              )}

              <div className="relative flex-shrink-0">
                <img
                  src={music.cover}
                  alt={music.title}
                  className="w-20 h-20 rounded-2xl object-cover shadow-md group-hover:shadow-xl transition-shadow"
                />
                {music.favorite && (
                  <Heart className="absolute -top-2 -right-2 w-6 h-6 text-red-500 fill-current drop-shadow-md" />
                )}
                {music.audio && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handlePlayMusic(music)
                    }}
                    className={`absolute inset-0 flex items-center justify-center rounded-2xl transition-all duration-300 ${
                      currentPlayingMusic?.id === music.id && isPlaying
                        ? 'bg-black/40'
                        : 'bg-black/0 group-hover:bg-black/30'
                    }`}
                  >
                    {currentPlayingMusic?.id === music.id && isPlaying ? (
                      <div className="flex items-center gap-1">
                        <div className="w-1.5 h-5 bg-white rounded-full animate-pulse" />
                        <div className="w-1.5 h-5 bg-white rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
                        <div className="w-1.5 h-5 bg-white rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
                      </div>
                    ) : (
                      <Play className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity ml-1" fill="currentColor" />
                    )}
                  </button>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <h4 className="text-lg font-semibold text-gray-800 truncate group-hover:text-purple-600 transition-colors">
                  {music.title}
                </h4>
                <p className="text-base text-gray-500 truncate">{music.artist}</p>
                {!music.audio && (
                  <p className="text-xs text-gray-400 truncate">暂无音频资源</p>
                )}
              </div>

              <span className="px-4 py-2 bg-purple-50 text-purple-600 rounded-full text-sm font-medium">
                {music.genre}
              </span>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )

  const BooksView = () => (
    <div className="max-w-6xl mx-auto py-8">
      <div className="flex items-center gap-4 mb-8">
        <motion.button
          onClick={navigateBack}
          className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-600 rounded-xl hover:bg-green-100 transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">返回</span>
        </motion.button>
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-100">
            <Book className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">全部书籍</h2>
            <p className="text-sm text-gray-500">共 {displayBooksMore.length} 本书</p>
          </div>
        </div>
        {hasToken && (
          <motion.button
            onClick={() => openEditModal(null, 'book', true)}
            className="ml-auto flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:from-green-600 hover:to-emerald-600 transition-colors shadow-lg shadow-green-500/25"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Plus className="w-5 h-5" />
            <span className="font-medium">添加书籍</span>
          </motion.button>
        )}
      </div>

      {loading.books ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-10 h-10 text-green-500 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayBooksMore.map((book, index) => (
            <motion.div
              key={book.id}
              className="group relative flex gap-4 p-5 bg-white rounded-2xl border border-gray-100 hover:border-green-200 transition-all duration-300 shadow-sm hover:shadow-xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ y: -4 }}
            >
              {hasToken && (
                <div className="absolute top-3 right-3 flex gap-2 z-10">
                  <motion.button
                    onClick={(e) => {
                      e.stopPropagation()
                      openEditModal(book, 'book', false)
                    }}
                    className="p-1.5 bg-white/95 backdrop-blur-sm rounded-lg hover:bg-blue-50 transition-colors shadow-md"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Edit2 className="w-3.5 h-3.5 text-blue-500" />
                  </motion.button>
                  <motion.button
                    onClick={(e) => {
                      e.stopPropagation()
                      setEditingItem(book)
                      setEditingType('book')
                    }}
                    className="p-1.5 bg-white/95 backdrop-blur-sm rounded-lg hover:bg-red-50 transition-colors shadow-md"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Trash2 className="w-3.5 h-3.5 text-red-500" />
                  </motion.button>
                </div>
              )}

              <div className="relative flex-shrink-0">
                <img
                  src={book.cover}
                  alt={book.title}
                  className="w-28 h-40 rounded-xl object-cover shadow-md group-hover:shadow-xl transition-shadow"
                />
                <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-0.5 bg-black/60 backdrop-blur-sm rounded-lg">
                  <Star className="w-3.5 h-3.5 text-amber-400 fill-current" />
                  <span className="text-xs text-amber-300 font-medium">{book.rating}</span>
                </div>
                <div className="absolute bottom-2 left-2">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                    book.status === '已读完' 
                      ? 'bg-green-500/90 text-white' 
                      : 'bg-amber-500/90 text-white'
                  }`}>
                    {book.status}
                  </span>
                </div>
              </div>

              <div className="flex-1 min-w-0 pt-2">
                <h4 className="text-lg font-bold text-gray-800 mb-1 group-hover:text-green-600 transition-colors line-clamp-1">
                  {book.title}
                </h4>
                <p className="text-sm text-gray-500 mb-2">{book.author}</p>
                <p className="text-sm text-gray-400 mb-3">{book.genre}</p>
                <div className="flex items-center gap-2">
                  <Book className="w-4 h-4 text-gray-400" />
                  <span className="text-xs text-gray-400">{book.status}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )

  const OverviewView = () => (
    <motion.div
      className="max-w-7xl mx-auto"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div className="text-center mb-16" variants={itemVariants}>
        <motion.div
          className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-500/10 to-purple-500/10 border border-pink-200 rounded-full mb-4"
          whileHover={{ scale: 1.05 }}
        >
          <Heart className="w-5 h-5 text-pink-500" />
          <span className="text-sm font-medium text-pink-600">My Favorites</span>
        </motion.div>
        <h2 className="text-4xl font-bold text-gray-800 mb-4">
          我的收藏
        </h2>
        <p className="text-gray-500 max-w-2xl mx-auto">
          记录生活中的美好瞬间，分享我喜爱的电影、音乐和书籍
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <motion.div
          className="lg:col-span-2 bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 shadow-sm overflow-hidden"
          variants={itemVariants}
          whileHover={{ y: -4 }}
          transition={{ duration: 0.3 }}
        >
          <div className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-gradient-to-br from-pink-50 to-red-50 rounded-xl border border-pink-100">
                <Film className="w-6 h-6 text-pink-500" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-800">喜爱的电影</h3>
                <p className="text-sm text-gray-500">光影中的故事</p>
              </div>
              {hasToken && (
                <motion.button
                  onClick={() => openEditModal(null, 'movie', true)}
                  className="flex items-center gap-1 px-3 py-1.5 bg-pink-50 text-pink-600 rounded-lg text-sm font-medium hover:bg-pink-100 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Plus className="w-4 h-4" />
                  <span>添加</span>
                </motion.button>
              )}
            </div>

            {loading.movies ? (
              <div className="flex justify-center py-10">
                <Loader2 className="w-8 h-8 text-pink-500 animate-spin" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {displayMovies.map((movie) => (
                  <motion.div
                    key={movie.id}
                    className="group relative rounded-xl overflow-hidden border border-gray-100 hover:border-pink-200 transition-all duration-300"
                    whileHover={{ y: -4, scale: 1.02 }}
                  >
                    {hasToken && (
                      <div className="absolute top-3 right-3 flex gap-1 z-10">
                        <motion.button
                          onClick={(e) => {
                            e.stopPropagation()
                            openEditModal(movie, 'movie', false)
                          }}
                          className="p-1.5 bg-white/90 backdrop-blur-sm rounded-lg hover:bg-blue-50 transition-colors shadow-sm"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Edit2 className="w-3.5 h-3.5 text-blue-500" />
                        </motion.button>
                      </div>
                    )}

                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={movie.poster}
                        alt={movie.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                      
                      <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 bg-black/60 backdrop-blur-sm rounded-lg">
                        <Star className="w-3.5 h-3.5 text-amber-400 fill-current" />
                        <span className="text-xs font-medium text-amber-300">{movie.rating}</span>
                      </div>

                      <div className="absolute bottom-3 left-3">
                        <span className="px-2.5 py-1 bg-pink-500/80 backdrop-blur-sm rounded-full text-xs font-medium text-white">
                          {movie.genre}
                        </span>
                      </div>
                    </div>

                    <div className="p-4 bg-white">
                      <h4 className="font-bold text-gray-800 mb-1 group-hover:text-pink-600 transition-colors">
                        {movie.title}
                      </h4>
                      <p className="text-xs text-gray-500 line-clamp-2">
                        {movie.description}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            <motion.button
              onClick={() => navigateToView('movies')}
              className="mt-6 flex items-center justify-center gap-2 text-pink-500 cursor-pointer hover:text-pink-600 transition-colors w-fit mx-auto group"
              whileHover={{ x: 4 }}
            >
              <span className="text-sm font-medium">查看更多电影</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </motion.button>
          </div>
        </motion.div>

        <motion.div
          className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 shadow-sm overflow-hidden"
          variants={itemVariants}
          whileHover={{ y: -4 }}
          transition={{ duration: 0.3 }}
        >
          <div className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl border border-purple-100">
                <Music className="w-6 h-6 text-purple-500" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-800">喜欢的音乐</h3>
                <p className="text-sm text-gray-500">耳边的旋律</p>
              </div>
              {hasToken && (
                <motion.button
                  onClick={() => openEditModal(null, 'music', true)}
                  className="flex items-center gap-1 px-3 py-1.5 bg-purple-50 text-purple-600 rounded-lg text-sm font-medium hover:bg-purple-100 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Plus className="w-4 h-4" />
                  <span>添加</span>
                </motion.button>
              )}
            </div>

            {loading.music ? (
              <div className="flex justify-center py-10">
                <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
              </div>
            ) : (
              <div className="space-y-4">
                {displayMusic.map((music, index) => (
                  <motion.div
                    key={music.id}
                    className="group flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-all duration-300 cursor-pointer relative"
                    whileHover={{ x: 4 }}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    {hasToken && (
                      <div className="absolute -top-1 -right-1 flex gap-1 z-10">
                        <motion.button
                          onClick={(e) => {
                            e.stopPropagation()
                            openEditModal(music, 'music', false)
                          }}
                          className="p-1.5 bg-white/90 backdrop-blur-sm rounded-lg hover:bg-blue-50 transition-colors shadow-sm"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Edit2 className="w-3 h-3 text-blue-500" />
                        </motion.button>
                      </div>
                    )}

                    <div className="relative flex-shrink-0">
                      <img
                        src={music.cover}
                        alt={music.title}
                        className="w-14 h-14 rounded-xl object-cover shadow-sm group-hover:shadow-md transition-shadow"
                      />
                      {music.favorite && (
                        <Heart className="absolute -top-1 -right-1 w-4 h-4 text-red-500 fill-current" />
                      )}
                      {music.audio && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handlePlayMusic(music)
                          }}
                          className={`absolute inset-0 flex items-center justify-center rounded-xl transition-all duration-300 ${
                            currentPlayingMusic?.id === music.id && isPlaying
                              ? 'bg-black/40'
                              : 'bg-black/0 group-hover:bg-black/30'
                          }`}
                        >
                          {currentPlayingMusic?.id === music.id && isPlaying ? (
                            <div className="flex items-center gap-0.5">
                              <div className="w-1 h-3 bg-white rounded-full animate-pulse" />
                              <div className="w-1 h-3 bg-white rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
                              <div className="w-1 h-3 bg-white rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
                            </div>
                          ) : (
                            <Play className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity ml-0.5" fill="currentColor" />
                          )}
                        </button>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-800 truncate group-hover:text-purple-600 transition-colors">
                        {music.title}
                      </h4>
                      <p className="text-sm text-gray-500 truncate">{music.artist}</p>
                      {!music.audio && (
                        <p className="text-xs text-gray-400 truncate">暂无音频</p>
                      )}
                    </div>

                    <span className="px-2.5 py-1 bg-purple-50 text-purple-600 rounded-full text-xs font-medium">
                      {music.genre}
                    </span>
                  </motion.div>
                ))}
              </div>
            )}

            <motion.button
              onClick={() => navigateToView('music')}
              className="mt-6 flex items-center justify-center gap-2 text-purple-500 cursor-pointer hover:text-purple-600 transition-colors w-fit mx-auto group"
              whileHover={{ x: 4 }}
            >
              <span className="text-sm font-medium">查看更多音乐</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </motion.button>
          </div>
        </motion.div>

        <motion.div
          className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 shadow-sm overflow-hidden"
          variants={itemVariants}
          whileHover={{ y: -4 }}
          transition={{ duration: 0.3 }}
        >
          <div className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-100">
                <Book className="w-6 h-6 text-green-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-800">阅读清单</h3>
                <p className="text-sm text-gray-500">书中的智慧</p>
              </div>
              {hasToken && (
                <motion.button
                  onClick={() => openEditModal(null, 'book', true)}
                  className="flex items-center gap-1 px-3 py-1.5 bg-green-50 text-green-600 rounded-lg text-sm font-medium hover:bg-green-100 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Plus className="w-4 h-4" />
                  <span>添加</span>
                </motion.button>
              )}
            </div>

            {loading.books ? (
              <div className="flex justify-center py-10">
                <Loader2 className="w-8 h-8 text-green-500 animate-spin" />
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {displayBooks.map((book) => (
                  <motion.div
                    key={book.id}
                    className="group relative rounded-xl overflow-hidden border border-gray-100 hover:border-green-200 transition-all duration-300"
                    whileHover={{ y: -4, scale: 1.02 }}
                  >
                    {hasToken && (
                      <div className="absolute top-2 right-2 flex gap-1 z-10">
                        <motion.button
                          onClick={(e) => {
                            e.stopPropagation()
                            openEditModal(book, 'book', false)
                          }}
                          className="p-1 bg-white/90 backdrop-blur-sm rounded hover:bg-blue-50 transition-colors shadow-sm"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Edit2 className="w-3 h-3 text-blue-500" />
                        </motion.button>
                      </div>
                    )}

                    <div className="relative h-32 overflow-hidden">
                      <img
                        src={book.cover}
                        alt={book.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      
                      <div className="absolute top-2 right-2 flex items-center gap-1 px-1.5 py-0.5 bg-black/60 backdrop-blur-sm rounded">
                        <Star className="w-3 h-3 text-amber-400 fill-current" />
                        <span className="text-xs text-amber-300">{book.rating}</span>
                      </div>

                      <div className="absolute bottom-2 left-2">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          book.status === '已读完' 
                            ? 'bg-green-500/80 text-white' 
                            : 'bg-amber-500/80 text-white'
                        }`}>
                          {book.status}
                        </span>
                      </div>
                    </div>

                    <div className="p-3 bg-white">
                      <h4 className="font-semibold text-gray-800 text-sm truncate group-hover:text-green-600 transition-colors">
                        {book.title}
                      </h4>
                      <p className="text-xs text-gray-500 truncate">{book.author}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            <motion.button
              onClick={() => navigateToView('books')}
              className="mt-6 flex items-center justify-center gap-2 text-green-600 cursor-pointer hover:text-green-700 transition-colors w-fit mx-auto group"
              whileHover={{ x: 4 }}
            >
              <span className="text-sm font-medium">查看更多书籍</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </motion.button>
          </div>
        </motion.div>

        <motion.div
          className="lg:col-span-2 bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 shadow-sm overflow-hidden"
          variants={itemVariants}
          whileHover={{ y: -4 }}
          transition={{ duration: 0.3 }}
        >
          <div className="p-6">
            <div className="flex flex-col gap-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border border-blue-100">
                  <Clock className="w-6 h-6 text-blue-500" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-800">人生时间分配</h3>
                  <p className="text-sm text-gray-500">一周168小时的去向</p>
                </div>
                <div className="flex items-center gap-2">
                  {hasToken && (
                    <motion.button
                      onClick={() => openEditModal(null, 'lifeTime', true)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Plus className="w-4 h-4" />
                      <span>添加</span>
                    </motion.button>
                  )}
                  <button
                    onClick={() => {
                      setShowStatsTable(!showStatsTable)
                      if (!showStatsTable) {
                        fetchLifeTimeStats(lifeTimeStats.year, lifeTimeStats.month)
                      }
                    }}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      showStatsTable 
                        ? 'bg-purple-500 text-white' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <BarChart3 className="w-4 h-4" />
                    <span>{showStatsTable ? '隐藏统计' : '统计表格'}</span>
                  </button>
                </div>
              </div>
              
              {showStatsTable && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <select
                    value={lifeTimeStats.year}
                    onChange={(e) => {
                      const newYear = parseInt(e.target.value)
                      setLifeTimeStats(prev => ({ ...prev, year: newYear }))
                      fetchLifeTimeStats(newYear, lifeTimeStats.month)
                    }}
                    className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:border-blue-500"
                  >
                    {Array.from({ length: 10 }, (_, i) => currentYear + 5 - i).map((y) => (
                      <option key={y} value={y}>{y}年</option>
                    ))}
                  </select>
                  <select
                    value={lifeTimeStats.month}
                    onChange={(e) => {
                      const newMonth = parseInt(e.target.value)
                      setLifeTimeStats(prev => ({ ...prev, month: newMonth }))
                      fetchLifeTimeStats(lifeTimeStats.year, newMonth)
                    }}
                    className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:border-blue-500"
                  >
                    <option value={0}>全年</option>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((m) => (
                      <option key={m} value={m}>{m}月</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {loading.lifeTime ? (
              <div className="flex justify-center py-10">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-4">
                  {displayLifeTime.map((item, index) => (
                    <motion.div
                      key={item.id || item.category}
                      className="group relative"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      {hasToken && item.id && (
                        <div className="absolute -top-2 right-0 flex gap-1 z-10">
                          <motion.button
                            onClick={() => openEditModal(item, 'lifeTime', false)}
                            className="p-1.5 bg-white/90 backdrop-blur-sm rounded-lg hover:bg-blue-50 transition-colors shadow-sm"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <Edit2 className="w-3.5 h-3.5 text-blue-500" />
                          </motion.button>
                        </div>
                      )}

                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${item.color}`} />
                          <span className="font-medium text-gray-700 group-hover:text-gray-800">
                            {item.category}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                          <span className="text-gray-500">{item.hoursPerDay}h/天</span>
                          <span className="text-gray-700 font-semibold">{item.hoursPerWeek}h/周</span>
                          <span className="text-gray-600 bg-gray-100 px-2 py-0.5 rounded">
                            {item.percentage}%
                          </span>
                        </div>
                      </div>

                      <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                        <motion.div
                          className={`h-full rounded-full ${item.color}`}
                          initial={{ width: 0 }}
                          whileInView={{ width: `${item.percentage}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 1, delay: index * 0.1, ease: 'easeOut' }}
                        />
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className="flex flex-col items-center justify-center p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl">
                  <div className="relative w-48 h-48 mb-6">
                    <motion.div
                      className="absolute inset-0 flex items-center justify-center"
                      initial={{ scale: 0 }}
                      whileInView={{ scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, ease: 'easeOut' }}
                    >
                      <div className="w-32 h-32 rounded-full bg-white shadow-lg flex flex-col items-center justify-center">
                        <TrendingUp className="w-8 h-8 text-blue-500 mb-1" />
                        <span className="text-2xl font-bold text-gray-800">168h</span>
                        <span className="text-xs text-gray-500">每周总时长</span>
                      </div>
                    </motion.div>

                    {displayLifeTime.map((item, index) => {
                      const angle = index * 60
                      const radius = 90
                      const x = Math.cos((angle - 90) * Math.PI / 180) * radius
                      const y = Math.sin((angle - 90) * Math.PI / 180) * radius
                      
                      return (
                        <motion.div
                          key={item.id || item.category}
                          className="absolute"
                          style={{
                            left: `calc(50% + ${x}px)`,
                            top: `calc(50% + ${y}px)`,
                            transform: 'translate(-50%, -50%)'
                          }}
                          initial={{ scale: 0, opacity: 0 }}
                          whileInView={{ scale: 1, opacity: 1 }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.5, delay: 0.3 + index * 0.1, ease: 'easeOut' }}
                        >
                          <div className="flex flex-col items-center">
                            <div className={`w-4 h-4 rounded-full ${item.color} mb-1`} />
                            <span className="text-xs text-gray-600 font-medium whitespace-nowrap">
                              {item.category}
                            </span>
                          </div>
                        </motion.div>
                      )
                    })}
                  </div>

                  <div className="text-center">
                    <p className="text-gray-600 text-sm mb-2">时间都去哪了？</p>
                    <p className="text-gray-400 text-xs">合理分配时间，让每一天都有意义</p>
                  </div>
                </div>
              </div>
            )}

            {showStatsTable && (
              <div className="mt-6 border-t border-gray-200 pt-6">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">
                  {lifeTimeStats.month > 0 
                    ? `${lifeTimeStats.year}年${lifeTimeStats.month}月 统计` 
                    : `${lifeTimeStats.year}年 统计`}
                </h4>
                
                {loadingStats ? (
                  <div className="flex justify-center py-6">
                    <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
                  </div>
                ) : lifeTimeStats.data.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="px-4 py-3 text-left font-medium text-gray-600 rounded-tl-lg">类别</th>
                          <th className="px-4 py-3 text-center font-medium text-gray-600">年份</th>
                          <th className="px-4 py-3 text-center font-medium text-gray-600">月份</th>
                          <th className="px-4 py-3 text-center font-medium text-gray-600">每天(小时)</th>
                          <th className="px-4 py-3 text-center font-medium text-gray-600">每周(小时)</th>
                          <th className="px-4 py-3 text-center font-medium text-gray-600 rounded-tr-lg">占比</th>
                        </tr>
                      </thead>
                      <tbody>
                        {lifeTimeStats.data.map((item, index) => (
                          <tr key={item.id || item.category} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <div className={`w-3 h-3 rounded-full ${item.color}`} />
                                <span className="font-medium text-gray-700">{item.category}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-center text-gray-600">
                              {item.year || '-'}
                            </td>
                            <td className="px-4 py-3 text-center text-gray-600">
                              {item.month ? `${item.month}月` : '-'}
                            </td>
                            <td className="px-4 py-3 text-center text-gray-700">
                              {item.hours_per_day}h
                            </td>
                            <td className="px-4 py-3 text-center text-gray-700">
                              {item.hours_per_week}h
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span className={`px-2 py-1 rounded text-xs font-medium ${
                                item.percentage >= 30 ? 'bg-blue-100 text-blue-700' :
                                item.percentage >= 10 ? 'bg-green-100 text-green-700' :
                                'bg-gray-100 text-gray-600'
                              }`}>
                                {item.percentage}%
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    
                    <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg">
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <div className="text-2xl font-bold text-blue-600">
                            {lifeTimeStats.data.reduce((sum, item) => sum + (item.hours_per_day || 0), 0)}h
                          </div>
                          <div className="text-xs text-gray-500">每天总计</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-cyan-600">
                            {lifeTimeStats.data.reduce((sum, item) => sum + (item.hours_per_week || 0), 0)}h
                          </div>
                          <div className="text-xs text-gray-500">每周总计</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-purple-600">
                            {lifeTimeStats.data.reduce((sum, item) => sum + (item.percentage || 0), 0).toFixed(1)}%
                          </div>
                          <div className="text-xs text-gray-500">总占比</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-10 text-gray-500">
                    <BarChart3 className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                    <p>暂无统计数据</p>
                    <p className="text-sm mt-1">请先添加带有年份和月份的时间分配记录</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>

        <motion.div
          className="lg:col-span-3 bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 shadow-sm overflow-hidden"
          variants={itemVariants}
          whileHover={{ y: -4 }}
          transition={{ duration: 0.3 }}
        >
          <div className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-gradient-to-br from-cyan-50 to-blue-50 rounded-xl border border-cyan-100">
                <Cloud className="w-6 h-6 text-cyan-500" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-800">兴趣词云</h3>
                <p className="text-sm text-gray-500">探索我的兴趣爱好与品味</p>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-pink-500" />
                  <span>电影</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-orange-500" />
                  <span>音乐</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
                  <span>书籍</span>
                </div>
              </div>
            </div>

            <WordCloud
              tags={wordCloudTags}
              onEditClick={openWordCloudEditModal}
              hasToken={hasToken}
            />

            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
              <motion.div
                className="text-center p-4 bg-gradient-to-br from-pink-50 to-purple-50 rounded-xl border border-pink-100"
                whileHover={{ scale: 1.02 }}
              >
                <Film className="w-6 h-6 mx-auto mb-2 text-pink-500" />
                <div className="text-lg font-bold text-gray-800">电影</div>
                <div className="text-xs text-gray-500">{displayMoviesMore.length} 部</div>
              </motion.div>
              <motion.div
                className="text-center p-4 bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl border border-orange-100"
                whileHover={{ scale: 1.02 }}
              >
                <Music className="w-6 h-6 mx-auto mb-2 text-orange-500" />
                <div className="text-lg font-bold text-gray-800">音乐</div>
                <div className="text-xs text-gray-500">{displayMusicMore.length} 首</div>
              </motion.div>
              <motion.div
                className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-100"
                whileHover={{ scale: 1.02 }}
              >
                <Book className="w-6 h-6 mx-auto mb-2 text-green-500" />
                <div className="text-lg font-bold text-gray-800">书籍</div>
                <div className="text-xs text-gray-500">{displayBooksMore.length} 本</div>
              </motion.div>
              <motion.div
                className="text-center p-4 bg-gradient-to-br from-cyan-50 to-blue-50 rounded-xl border border-cyan-100"
                whileHover={{ scale: 1.02 }}
              >
                <Star className="w-6 h-6 mx-auto mb-2 text-cyan-500" />
                <div className="text-lg font-bold text-gray-800">总计</div>
                <div className="text-xs text-gray-500">{displayMoviesMore.length + displayMusicMore.length + displayBooksMore.length} 项</div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  )

  const renderCurrentView = () => {
    switch (currentView) {
      case 'movies':
        return <MoviesView />
      case 'music':
        return <MusicView />
      case 'books':
        return <BooksView />
      default:
        return <OverviewView />
    }
  }

  const variants = isNavigatingBack ? backTransitionVariants : pageTransitionVariants

  return (
    <section id="favorites" className="min-h-screen py-20 px-6 bg-gradient-to-b from-gray-50 via-white to-gray-100 relative overflow-hidden">
      <FavoritesEditModal
        isOpen={isEditModalOpen}
        onClose={closeEditModal}
        item={editingItem}
        itemType={editingType}
        onSave={handleSave}
        onDelete={handleDelete}
        isNew={isAddingNew}
      />

      <WordCloudEditModal
        isOpen={isWordCloudModalOpen}
        onClose={closeWordCloudEditModal}
        tags={wordCloudTags}
        onRefresh={refreshWordCloudTags}
      />

      <audio
        ref={audioRef}
        onEnded={() => {
          setIsPlaying(false)
        }}
      />

      <AnimatePresence mode="wait">
        <motion.div
          key={currentView}
          initial="initial"
          animate="animate"
          exit="exit"
          variants={variants}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
          className="max-w-7xl mx-auto"
        >
          {renderCurrentView()}
        </motion.div>
      </AnimatePresence>

      {currentPlayingMusic && (
        <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t border-gray-200 shadow-2xl z-50">
          <div className="max-w-7xl mx-auto px-4 py-3">
            <div className="flex items-center gap-4">
              <div className="relative flex-shrink-0">
                <img
                  src={currentPlayingMusic.cover}
                  alt={currentPlayingMusic.title}
                  className="w-14 h-14 rounded-xl object-cover shadow-md"
                />
                {isPlaying && (
                  <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/30">
                    <div className="flex items-center gap-0.5">
                      <div className="w-1 h-4 bg-white rounded-full animate-pulse" />
                      <div className="w-1 h-4 bg-white rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
                      <div className="w-1 h-4 bg-white rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
                    </div>
                  </div>
                )}
              </div>

                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-gray-800 truncate">
                    {currentPlayingMusic.title}
                  </h4>
                  <p className="text-xs text-gray-500 truncate">
                    {currentPlayingMusic.artist}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePrevious}
                    className="p-2 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                  >
                    <SkipBack className="w-5 h-5" />
                  </button>
                  <button
                    onClick={handleTogglePlay}
                    className="p-3 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-full shadow-lg shadow-purple-500/25 hover:shadow-xl transition-shadow"
                  >
                    {isPlaying ? (
                      <Pause className="w-5 h-5" fill="currentColor" />
                    ) : (
                      <Play className="w-5 h-5" fill="currentColor" />
                    )}
                  </button>
                  <button
                    onClick={handleNext}
                    className="p-2 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                  >
                    <SkipForward className="w-5 h-5" />
                  </button>
                </div>

                <div className="hidden md:flex items-center gap-3 flex-1 max-w-md">
                  <span className="text-xs text-gray-500 w-10 text-right">
                    {formatTime(currentTime)}
                  </span>
                  <input
                    type="range"
                    min="0"
                    max={duration || 100}
                    value={currentTime}
                    onChange={handleSeek}
                    className="flex-1 h-1.5 bg-gray-200 rounded-full appearance-none cursor-pointer accent-purple-500"
                  />
                  <span className="text-xs text-gray-500 w-10">
                    {formatTime(duration)}
                  </span>
                </div>

                <div className="hidden lg:flex items-center gap-2">
                  <button
                    onClick={handleToggleMute}
                    className="p-2 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                  >
                    {isMuted || volume === 0 ? (
                      <VolumeX className="w-5 h-5" />
                    ) : (
                      <Volume2 className="w-5 h-5" />
                    )}
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={isMuted ? 0 : volume}
                    onChange={handleVolumeChange}
                    className="w-24 h-1.5 bg-gray-200 rounded-full appearance-none cursor-pointer accent-purple-500"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
    </section>
  )
}

export default FavoritesSection