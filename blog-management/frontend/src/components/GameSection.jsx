import React, { useState, useRef, useCallback, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Heart, Code2, ChevronRight, Gamepad2, Trophy, Star, Clock, Tag, Edit2, Plus, Loader2, RefreshCw } from 'lucide-react'
import GameEditModal from './GameEditModal'

const API_BASE_URL = 'http://localhost:8080'

const SteamIcon = ({ className, size = 24 }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} style={{ width: size, height: size }}>
    <path d="M11.979 0C5.678 0 .511 4.86.022 11.037l6.432 2.658c.545-.371 1.203-.59 1.912-.59.063 0 .125.004.188.006l2.861-4.142V8.91c0-2.495 2.028-4.524 4.524-4.524 2.494 0 4.524 2.031 4.524 4.527s-2.03 4.525-4.524 4.525h-.105l-4.076 2.911c0 .052.004.105.004.159 0 1.875-1.515 3.396-3.39 3.396-1.635 0-3.016-1.173-3.331-2.727L.436 15.27C1.862 20.307 6.486 24 11.979 24c6.627 0 11.999-5.373 11.999-12S18.605 0 11.979 0zM7.54 18.21l-1.473-.61c.262.543.714.999 1.314 1.25 1.297.539 2.793-.076 3.332-1.375.263-.63.264-1.319.005-1.949s-.746-1.121-1.377-1.383c-.632-.263-1.318-.261-1.948-.005-.631.257-1.121.747-1.384 1.379-.262.63-.264 1.317-.006 1.947-.001 0-.001.001-.001.002l2.398.995c.116-.185.192-.398.226-.623.082-.59-.296-1.181-.887-1.263-.59-.082-1.181.296-1.264.887-.081.59.297 1.18.887 1.263.281.039.552-.034.767-.194l.855.355zm11.415-9.303c0-1.662-1.353-3.015-3.015-3.015-1.665 0-3.015 1.353-3.015 3.015 0 1.665 1.35 3.015 3.015 3.015 1.663 0 3.015-1.35 3.015-3.015zm-5.273-.005c0-1.252 1.013-2.266 2.265-2.266 1.249 0 2.266 1.014 2.266 2.266 0 1.251-1.017 2.265-2.266 2.265-1.253 0-2.265-1.014-2.265-2.265zm2.262.795c-.439 0-.794-.355-.794-.795 0-.439.355-.794.794-.794.438 0 .794.355.794.794 0 .44-.356.795-.794.795z"/>
  </svg>
)

const Carousel3D = ({
  items,
  renderItem,
  centerVisible = 3,
  totalVisible = 7,
  keyExtractor,
  gap = 24,
  cardWidth = 320,
}) => {
  const [baseIndex, setBaseIndex] = useState(() => {
    return Math.floor(items.length / 2)
  })
  const [mouseOffset, setMouseOffset] = useState(0)
  const [targetOffset, setTargetOffset] = useState(0)
  const containerRef = useRef(null)
  const animationRef = useRef(null)
  const isHovering = useRef(false)

  const halfTotal = Math.floor(totalVisible / 2)
  const halfCenter = Math.floor(centerVisible / 2)
  const effectiveWidth = cardWidth + gap

  const currentCenter = baseIndex + mouseOffset

  const getCardStyle = useCallback((relativeToCenter) => {
    const absIndex = Math.abs(relativeToCenter)
    
    let scale, opacity, zIndex, xOffset, yOffset, blur

    if (absIndex <= halfCenter + 0.5) {
      const centerProgress = Math.max(0, 1 - absIndex / (halfCenter + 1))
      scale = 0.7 + centerProgress * 0.3
      opacity = 0.5 + centerProgress * 0.5
      zIndex = Math.round(50 - absIndex * 10)
      blur = (1 - centerProgress) * 2
      yOffset = (1 - centerProgress) * 10
    } else {
      const offsetFromCenter = absIndex - halfCenter
      const maxOffset = halfTotal - halfCenter
      const progress = Math.min(1, offsetFromCenter / Math.max(1, maxOffset))

      scale = Math.max(0.45, 0.7 - (progress * 0.25))
      opacity = Math.max(0.15, 0.5 - (progress * 0.35))
      zIndex = Math.max(0, Math.round(20 - offsetFromCenter * 10))
      blur = 2 + progress * 3
      yOffset = 10 + progress * 15
    }

    const direction = relativeToCenter > 0 ? 1 : -1
    const dist = Math.abs(relativeToCenter)
    
    if (dist <= halfCenter + 1) {
      xOffset = relativeToCenter * effectiveWidth
    } else {
      const extraDist = dist - halfCenter - 1
      const squeezeFactor = 0.7
      xOffset = direction * ((halfCenter + 1) * effectiveWidth + extraDist * effectiveWidth * squeezeFactor)
    }

    return {
      scale,
      opacity,
      zIndex,
      x: xOffset,
      y: yOffset,
      filter: `blur(${blur}px)`,
    }
  }, [halfCenter, halfTotal, effectiveWidth])

  useEffect(() => {
    const animate = () => {
      setMouseOffset(prev => {
        const diff = targetOffset - prev
        if (Math.abs(diff) < 0.001) return targetOffset
        return prev + diff * 0.12
      })
      animationRef.current = requestAnimationFrame(animate)
    }
    
    animationRef.current = requestAnimationFrame(animate)
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current)
    }
  }, [targetOffset])

  const handleMouseMove = useCallback((e) => {
    if (!containerRef.current) return
    
    isHovering.current = true
    
    const rect = containerRef.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const mouseX = e.clientX
    const relativeX = (mouseX - centerX) / (rect.width / 2)
    
    const clampedX = Math.max(-1, Math.min(1, relativeX))
    
    const maxIndexRange = Math.min(3, items.length / 2)
    const newTargetOffset = clampedX * maxIndexRange
    
    setTargetOffset(newTargetOffset)
  }, [items.length])

  const handleMouseLeave = useCallback(() => {
    isHovering.current = false
    
    const snapOffset = Math.round(mouseOffset)
    
    if (snapOffset !== 0) {
      const newBaseIndex = Math.max(0, Math.min(items.length - 1, baseIndex + snapOffset))
      setBaseIndex(newBaseIndex)
    }
    
    setMouseOffset(0)
    setTargetOffset(0)
  }, [mouseOffset, baseIndex, items.length])

  const getVisibleItems = () => {
    const visible = []
    const center = currentCenter
    
    for (let i = -halfTotal - 2; i <= halfTotal + 2; i++) {
      const index = Math.round(center) + i
      if (index >= 0 && index < items.length) {
        const relativeToCenter = index - center
        visible.push({ item: items[index], index, relativeToCenter })
      }
    }
    return visible
  }

  if (items.length === 0) {
    return (
      <div className="relative w-full py-12">
        <div className="text-center py-20">
          <Gamepad2 className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-500 text-lg">暂无游戏数据</p>
          <p className="text-gray-600 text-sm mt-2">点击上方的添加按钮来添加游戏</p>
        </div>
      </div>
    )
  }

  const visibleItems = getVisibleItems()

  return (
    <div className="relative w-full py-12">
      <div
        ref={containerRef}
        className="relative h-[420px] flex items-center justify-center cursor-crosshair select-none overflow-visible"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {visibleItems.map(({ item, index, relativeToCenter }) => {
          const key = keyExtractor ? keyExtractor(item) : index
          const style = getCardStyle(relativeToCenter)
          const isCenter = Math.abs(relativeToCenter) <= halfCenter + 0.3

          return (
            <motion.div
              key={key}
              className="absolute"
              initial={false}
              animate={{
                x: style.x,
                y: style.y,
                scale: style.scale,
                opacity: style.opacity,
                zIndex: style.zIndex,
                filter: style.filter,
              }}
              transition={{
                type: 'tween',
                ease: 'easeOut',
                duration: 0.1,
              }}
              style={{
                willChange: 'transform, opacity, filter',
              }}
            >
              {renderItem(item, index, isCenter)}
            </motion.div>
          )
        })}
      </div>

      <div className="text-center mt-4">
        <p className="text-gray-500 text-sm">
          鼠标左右移动浏览
        </p>
      </div>
    </div>
  )
}

const PinkOrb = ({ position, delay = 0, color = 'radial-gradient(circle, #f472b6 0%, #ec4899 30%, transparent 70%)' }) => (
  <motion.div
    className="absolute w-80 h-80 rounded-full blur-3xl opacity-15 pointer-events-none"
    style={{
      background: color,
      top: position.top,
      left: position.left,
      right: position.right,
      bottom: position.bottom,
    }}
    animate={{
      scale: [1, 1.15, 1],
      opacity: [0.12, 0.2, 0.12],
    }}
    transition={{
      duration: 8,
      repeat: Infinity,
      ease: 'easeInOut',
      delay: delay,
    }}
  />
)

const staticFavoriteGames = [
  {
    id: 1,
    name: '赛博朋克2077',
    genre: 'RPG',
    hours: 120,
    rating: 4.8,
    poster: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Cyberpunk%202077%20game%20cover%20art%20neon%20city%20futuristic%20sci-fi%20style&image_size=portrait_4_3',
    description: '夜之城的霓虹与阴谋',
  },
  {
    id: 2,
    name: '艾尔登法环',
    genre: '魂系',
    hours: 85,
    rating: 4.9,
    poster: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Elden%20Ring%20game%20cover%20dark%20fantasy%20medieval%20knight%20sword%20epic%20style&image_size=portrait_4_3',
    description: '交界地的史诗冒险',
  },
  {
    id: 3,
    name: '巫师3',
    genre: 'RPG',
    hours: 200,
    rating: 5.0,
    poster: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=The%20Witcher%203%20game%20cover%20medieval%20fantasy%20witcher%20monster%20hunter%20dark%20atmosphere&image_size=portrait_4_3',
    description: '猎魔人的传奇故事',
  },
  {
    id: 4,
    name: '只狼',
    genre: '动作',
    hours: 60,
    rating: 4.7,
    poster: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Sekiro%20game%20cover%20samurai%20japanese%20warrior%20sword%20battle%20dark%20atmosphere&image_size=portrait_4_3',
    description: '忍者的复仇之路',
  },
  {
    id: 5,
    name: '黑魂3',
    genre: '魂系',
    hours: 95,
    rating: 4.8,
    poster: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Dark%20Souls%203%20game%20cover%20dark%20fantasy%20knight%20fire%20epic%20gothic%20style&image_size=portrait_4_3',
    description: '传火的最终章',
  },
  {
    id: 6,
    name: '战神4',
    genre: '动作',
    hours: 45,
    rating: 4.9,
    poster: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=God%20of%20War%204%20game%20cover%20viking%20nordic%20mythology%20axe%20father%20son%20epic&image_size=portrait_4_3',
    description: '北欧神话的新篇章',
  },
  {
    id: 7,
    name: '对马岛之魂',
    genre: '动作',
    hours: 55,
    rating: 4.6,
    poster: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Ghost%20of%20Tsushima%20game%20cover%20samurai%20japan%20cherry%20blossom%20sword%20cinematic&image_size=portrait_4_3',
    description: '武士的抉择',
  },
  {
    id: 8,
    name: '地平线',
    genre: '开放世界',
    hours: 70,
    rating: 4.5,
    poster: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Horizon%20Zero%20Dawn%20game%20cover%20robot%20dinosaurs%20tribal%20warrior%20nature%20post-apocalyptic&image_size=portrait_4_3',
    description: '机器与自然的融合',
  },
]

const staticDevelopedGames = [
  {
    id: 1,
    name: '像素冒险',
    status: '开发中',
    progress: 65,
    techStack: ['Unity', 'C#'],
    poster: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=pixel%20art%20game%20cover%208-bit%20retro%20style%20adventure%20hero%20colorful%20pixels&image_size=portrait_4_3',
  },
  {
    id: 2,
    name: '星际防御',
    status: '已完成',
    progress: 100,
    techStack: ['Godot', 'GDScript'],
    poster: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=space%20strategy%20game%20cover%20sci-fi%20stars%20spaceships%20galaxy%20defense%20epic%20style&image_size=portrait_4_3',
  },
  {
    id: 3,
    name: '地牢探索者',
    status: '开发中',
    progress: 40,
    techStack: ['Unity', 'C#'],
    poster: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=dungeon%20crawler%20game%20cover%20dark%20dungeons%20treasure%20skeletons%20torchlight%20medieval&image_size=portrait_4_3',
  },
  {
    id: 4,
    name: '卡牌传说',
    status: '规划中',
    progress: 15,
    techStack: ['React', 'TypeScript'],
    poster: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=card%20game%20cover%20fantasy%20cards%20magic%20spells%20heroes%20collectible%20epic&image_size=portrait_4_3',
  },
  {
    id: 5,
    name: '赛车狂飙',
    status: '已完成',
    progress: 100,
    techStack: ['Unreal', 'C++'],
    poster: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=racing%20game%20cover%20sports%20cars%20speed%20race%20track%20night%20city%20neon&image_size=portrait_4_3',
  },
  {
    id: 6,
    name: '农场物语',
    status: '开发中',
    progress: 75,
    techStack: ['Godot', 'GDScript'],
    poster: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=farming%20simulation%20game%20cover%20farm%20animals%20crops%20sunny%20day%20peaceful%20rural&image_size=portrait_4_3',
  },
]

const getPersonaStateText = (state) => {
  switch (state) {
    case 0: return '离线'
    case 1: return '在线'
    case 2: return '忙碌'
    case 3: return '离开'
    case 4: return '打盹'
    case 5: return '想交易'
    case 6: return '想玩游戏'
    default: return '未知'
  }
}

const getPersonaStateColor = (state) => {
  switch (state) {
    case 0: return 'text-gray-500'
    case 1: return 'text-emerald-500'
    case 2: return 'text-amber-500'
    case 3: return 'text-orange-500'
    default: return 'text-emerald-500'
  }
}

const GameSection = () => {
  const [favoriteGames, setFavoriteGames] = useState([])
  const [developedGames, setDevelopedGames] = useState([])
  const [loading, setLoading] = useState({ favorite: false, developed: false })
  const [steamData, setSteamData] = useState(null)
  const [loadingSteam, setLoadingSteam] = useState(false)
  const [refreshingSteam, setRefreshingSteam] = useState(false)
  const [modalState, setModalState] = useState({
    isOpen: false,
    gameType: 'favorite',
    game: null,
    isNew: false,
  })

  const steamPersonaName = steamData?.user_info?.persona_name || 'SamuelQZQ'
  const steamPersonaState = steamData?.user_info?.persona_state ?? 1
  const steamAvatar = steamData?.user_info?.avatar_full || null
  const steamHasRealData = !!steamData

  const steamTotalGames = steamData ? steamData.total_games.toLocaleString() : '156'
  const steamFavoriteCount = steamData?.favorite_games?.length > 0
    ? String(steamData.favorite_games.length)
    : '89'
  const steamTotalPlaytime = steamData ? steamData.total_playtime.toLocaleString() : '1,890'
  const steamPlayerType = steamData
    ? (steamData.total_playtime > 1000 ? '活跃' : '休闲')
    : '活跃'

  const formatPlaytime = (minutes) => {
    if (!minutes) return '未知'
    const hours = Math.floor(minutes * 0.0166667)
    return `${hours} 小时`
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  }

  const sectionVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: 'easeOut',
      },
    },
  }

  const hasToken = !!localStorage.getItem('token')

  const displayFavoriteGames = hasToken
    ? favoriteGames.length > 0 ? favoriteGames : staticFavoriteGames
    : staticFavoriteGames

  const displayDevelopedGames = hasToken
    ? developedGames.length > 0 ? developedGames : staticDevelopedGames
    : staticDevelopedGames

  const fetchFavoriteGames = useCallback(async () => {
    const token = localStorage.getItem('token')
    if (!token) {
      return
    }

    setLoading(prev => ({ ...prev, favorite: true }))
    try {
      const response = await fetch(`${API_BASE_URL}/favorite-game/list`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      })
      const data = await response.json()
      if (data.code === 0 && data.data) {
        setFavoriteGames(data.data)
      } else {
        setFavoriteGames([])
      }
    } catch (err) {
      console.error('Failed to fetch favorite games:', err)
      setFavoriteGames([])
    } finally {
      setLoading(prev => ({ ...prev, favorite: false }))
    }
  }, [])

  const fetchDevelopedGames = useCallback(async () => {
    const token = localStorage.getItem('token')
    if (!token) {
      return
    }

    setLoading(prev => ({ ...prev, developed: true }))
    try {
      const response = await fetch(`${API_BASE_URL}/developed-game/list`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      })
      const data = await response.json()
      if (data.code === 0 && data.data) {
        setDevelopedGames(data.data.map(game => ({
          ...game,
          techStack: game.techStack ? game.techStack.split(',').map(t => t.trim()) : [],
        })))
      } else {
        setDevelopedGames([])
      }
    } catch (err) {
      console.error('Failed to fetch developed games:', err)
      setDevelopedGames([])
    } finally {
      setLoading(prev => ({ ...prev, developed: false }))
    }
  }, [])

  const fetchSteamData = useCallback(async (forceRefresh = false) => {
    setLoadingSteam(true)

    try {
      let response
      if (forceRefresh) {
        const token = localStorage.getItem('token')
        response = await fetch(`${API_BASE_URL}/steam/refresh`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : '',
          },
        })
      } else {
        response = await fetch(`${API_BASE_URL}/steam/summary`, {
          method: 'GET',
        })
      }

      const data = await response.json()

      if (data.code === 0 && data.data && data.data.has_real_data) {
        setSteamData(data.data)
      } else {
        setSteamData(null)
      }
    } catch (err) {
      console.error('Failed to fetch steam data:', err)
      setSteamData(null)
    } finally {
      setLoadingSteam(false)
    }
  }, [])

  const handleRefreshSteam = async () => {
    const token = localStorage.getItem('token')
    if (!token) {
      console.log('No token, using cached data or static data')
      return
    }

    setRefreshingSteam(true)
    try {
      await fetchSteamData(true)
    } finally {
      setRefreshingSteam(false)
    }
  }

  useEffect(() => {
    if (hasToken) {
      fetchFavoriteGames()
      fetchDevelopedGames()
    }
    fetchSteamData()
  }, [hasToken, fetchFavoriteGames, fetchDevelopedGames, fetchSteamData])

  const openEditModal = (game, gameType) => {
    setModalState({
      isOpen: true,
      gameType,
      game,
      isNew: false,
    })
  }

  const openAddModal = (gameType) => {
    setModalState({
      isOpen: true,
      gameType,
      game: null,
      isNew: true,
    })
  }

  const closeModal = () => {
    setModalState({
      isOpen: false,
      gameType: 'favorite',
      game: null,
      isNew: false,
    })
  }

  const handleSave = () => {
    if (modalState.gameType === 'favorite') {
      fetchFavoriteGames()
    } else {
      fetchDevelopedGames()
    }
  }

  const handleDelete = () => {
    if (modalState.gameType === 'favorite') {
      fetchFavoriteGames()
    } else {
      fetchDevelopedGames()
    }
  }

  const renderFavoriteGame = (game, index, isCenter) => (
    <motion.div
      className={`group relative w-80 bg-white/95 backdrop-blur-sm rounded-2xl border-2 overflow-hidden transition-all duration-300 ${
        isCenter
          ? 'border-rose-400/50 hover:border-rose-400 shadow-[0_0_30px_rgba(244,114,182,0.2)]'
          : 'border-rose-100 hover:border-rose-200'
      }`}
      style={{
        background: 'linear-gradient(135deg, #fff1f2 0%, #ffffff 100%)',
      }}
      whileHover={isCenter ? { y: -4 } : {}}
    >
      <div className="relative h-44 overflow-hidden">
        <motion.img
          src={game.poster}
          alt={game.name}
          className="w-full h-full object-cover"
          whileHover={isCenter ? { scale: 1.05 } : {}}
          transition={{ duration: 0.4 }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-white via-white/30 to-transparent" />
        
        <div className="absolute top-3 left-3 flex gap-2">
          <span className="px-2.5 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-medium text-rose-700 border border-rose-200">
            <Tag className="w-3 h-3 inline mr-1" />
            {game.genre}
          </span>
        </div>

        <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 bg-white/90 backdrop-blur-sm rounded-lg">
          <Star className="w-4 h-4 text-rose-500 fill-current" />
          <span className="text-sm font-medium text-rose-600">{game.rating}</span>
        </div>

        {isCenter && hasToken && (
          <motion.button
            className="absolute bottom-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-lg hover:bg-rose-50 transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={(e) => {
              e.stopPropagation()
              openEditModal(game, 'favorite')
            }}
          >
            <Edit2 className="w-4 h-4 text-rose-500" />
          </motion.button>
        )}
      </div>

      <div className="p-5">
        <h4 className={`text-lg font-bold mb-1.5 transition-colors ${
          isCenter ? 'text-gray-800 group-hover:text-rose-600' : 'text-gray-700'
        }`}>
          {game.name}
        </h4>
        <p className="text-gray-500 text-sm mb-4 line-clamp-2">
          {game.description}
        </p>
        
        <div className="flex items-center justify-between pt-3 border-t border-rose-100">
          <div className="flex items-center gap-1.5 text-gray-500">
            <Clock className="w-4 h-4" />
            <span className="text-xs">{game.hours} 小时</span>
          </div>
          {isCenter && (
            <motion.div
              className="w-9 h-9 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center cursor-pointer hover:bg-rose-100 transition-colors"
              whileHover={{ scale: 1.1 }}
            >
              <ChevronRight className="w-4 h-4 text-rose-500" />
            </motion.div>
          )}
        </div>
      </div>

      {isCenter && (
        <div className="absolute -bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-400 via-pink-400 to-fuchsia-400 opacity-0 group-hover:opacity-100 transition-opacity" />
      )}
    </motion.div>
  )

  const renderDevelopedGame = (game, index, isCenter) => (
    <motion.div
      className={`group relative w-96 bg-white/95 backdrop-blur-sm rounded-2xl border-2 overflow-hidden flex flex-col transition-all duration-300 ${
        isCenter
          ? 'border-pink-400/50 hover:border-pink-400 shadow-[0_0_30px_rgba(236,72,153,0.2)]'
          : 'border-pink-100 hover:border-pink-200'
      }`}
      style={{
        background: 'linear-gradient(135deg, #fdf2f8 0%, #ffffff 100%)',
      }}
      whileHover={isCenter ? { y: -4 } : {}}
    >
      <div className="relative w-full h-36 overflow-hidden flex-shrink-0">
        <motion.img
          src={game.poster}
          alt={game.name}
          className="w-full h-full object-cover"
          whileHover={isCenter ? { scale: 1.05 } : {}}
          transition={{ duration: 0.4 }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-white to-transparent" />
        
        <span
          className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm ${
            game.progress === 100
              ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
              : 'bg-pink-50 text-pink-600 border border-pink-200'
          }`}
        >
          {game.status}
        </span>

        {isCenter && hasToken && (
          <motion.button
            className="absolute bottom-3 left-3 p-2 bg-white/90 backdrop-blur-sm rounded-lg hover:bg-pink-50 transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={(e) => {
              e.stopPropagation()
              openEditModal(game, 'developed')
            }}
          >
            <Edit2 className="w-4 h-4 text-pink-500" />
          </motion.button>
        )}
      </div>

      <div className="p-5 flex-1 flex flex-col">
        <h4 className={`text-lg font-bold mb-3 transition-colors ${
          isCenter ? 'text-gray-800 group-hover:text-pink-600' : 'text-gray-700'
        }`}>
          {game.name}
        </h4>
        
        <div className="flex flex-wrap gap-2 mb-4">
          {game.techStack.map((tech) => (
            <span
              key={tech}
              className="px-2.5 py-1 bg-pink-50 text-pink-600 border border-pink-200 rounded-full text-xs font-medium"
            >
              {tech}
            </span>
          ))}
        </div>

        <div className="mt-auto">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-500">开发进度</span>
            <span className="text-sm font-medium text-pink-500">{game.progress}%</span>
          </div>
          <div className="w-full h-2 bg-pink-100 rounded-full overflow-hidden">
            <motion.div
              className={`h-full rounded-full ${
                game.progress === 100
                  ? 'bg-gradient-to-r from-emerald-400 to-emerald-500'
                  : 'bg-gradient-to-r from-pink-400 to-pink-500'
              }`}
              style={{ width: `${game.progress}%` }}
            />
          </div>
        </div>
      </div>

      {isCenter && (
        <div className="absolute -bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-pink-400 via-fuchsia-400 to-purple-400 opacity-0 group-hover:opacity-100 transition-opacity" />
      )}
    </motion.div>
  )

  return (
    <section id="game" className="min-h-screen py-20 px-6 bg-gradient-to-b from-rose-50/60 via-pink-50/40 to-white relative overflow-hidden">
      <GameEditModal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        game={modalState.game}
        gameType={modalState.gameType}
        onSave={handleSave}
        onDelete={handleDelete}
        isNew={modalState.isNew}
      />

      <PinkOrb 
        position={{ top: '5%', right: '5%' }} 
        delay={0}
        color="radial-gradient(circle, #fb7185 0%, #f43f5e 30%, transparent 70%)"
      />
      <PinkOrb 
        position={{ bottom: '10%', left: '10%' }} 
        delay={3}
        color="radial-gradient(circle, #f472b6 0%, #ec4899 30%, transparent 70%)"
      />
      <PinkOrb 
        position={{ top: '50%', right: '20%' }} 
        delay={6}
        color="radial-gradient(circle, #a78bfa 0%, #8b5cf6 30%, transparent 70%)"
      />

      <div
        className="absolute inset-0 opacity-30 pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23f472b6' fill-opacity='0.04'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      <motion.div
        className="max-w-7xl mx-auto relative z-10"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-100px' }}
      >
        <motion.div
          className="text-center mb-16"
          variants={sectionVariants}
        >
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-rose-100/80 to-pink-100/80 border border-rose-200/50 rounded-full mb-4 shadow-sm shadow-rose-50/50"
            whileHover={{ scale: 1.05 }}
          >
            <Gamepad2 className="w-5 h-5 text-rose-500" />
            <span className="text-sm font-medium text-rose-700">Game Zone</span>
          </motion.div>
          <h2 className="text-4xl font-bold bg-gradient-to-r from-rose-600 via-pink-600 to-fuchsia-600 bg-clip-text text-transparent mb-4">
            游戏世界
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            探索我喜爱的游戏、开发中的项目，以及Steam游戏库
          </p>
        </motion.div>

        <motion.div
          className="mb-16"
          variants={sectionVariants}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-rose-100 border border-rose-200 rounded-xl">
                <Heart className="w-6 h-6 text-rose-500" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-800">我喜爱的游戏</h3>
                <p className="text-gray-500 text-sm">将鼠标移向左右两侧来浏览更多游戏</p>
              </div>
            </div>
            {hasToken && (
              <motion.button
                className="flex items-center gap-2 px-4 py-2 bg-rose-100 border border-rose-200 rounded-xl text-rose-600 hover:bg-rose-200 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => openAddModal('favorite')}
              >
                <Plus className="w-4 h-4" />
                <span className="text-sm font-medium">添加游戏</span>
              </motion.button>
            )}
          </div>

          {loading.favorite ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-8 h-8 text-rose-500 animate-spin" />
            </div>
          ) : (
            <Carousel3D
              items={displayFavoriteGames}
              renderItem={renderFavoriteGame}
              centerVisible={3}
              totalVisible={7}
              keyExtractor={(item) => item.id}
              gap={32}
              cardWidth={320}
            />
          )}
        </motion.div>

        <motion.div
          className="mb-16"
          variants={sectionVariants}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-pink-100 border border-pink-200 rounded-xl">
                <Code2 className="w-6 h-6 text-pink-500" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-800">我开发的游戏</h3>
                <p className="text-gray-500 text-sm">我的独立游戏开发项目</p>
              </div>
            </div>
            {hasToken && (
              <motion.button
                className="flex items-center gap-2 px-4 py-2 bg-pink-100 border border-pink-200 rounded-xl text-pink-600 hover:bg-pink-200 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => openAddModal('developed')}
              >
                <Plus className="w-4 h-4" />
                <span className="text-sm font-medium">添加游戏</span>
              </motion.button>
            )}
          </div>

          {loading.developed ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-8 h-8 text-pink-500 animate-spin" />
            </div>
          ) : (
            <Carousel3D
              items={displayDevelopedGames}
              renderItem={renderDevelopedGame}
              centerVisible={2}
              totalVisible={7}
              keyExtractor={(item) => item.id}
              gap={32}
              cardWidth={384}
            />
          )}
        </motion.div>

        <motion.div
          variants={sectionVariants}
        >
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-fuchsia-100 border border-fuchsia-200 rounded-xl">
                <SteamIcon className="w-6 h-6 text-fuchsia-500" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-800">我的Steam信息</h3>
                <p className="text-gray-500 text-sm">
                  {steamHasRealData ? '已绑定真实Steam数据' : 'Steam游戏库与游戏统计（示例数据）'}
                </p>
              </div>
            </div>
            {hasToken && (
              <motion.button
                className="flex items-center gap-2 px-4 py-2 bg-fuchsia-100 border border-fuchsia-200 rounded-xl text-fuchsia-600 hover:bg-fuchsia-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleRefreshSteam}
                disabled={refreshingSteam || loadingSteam}
              >
                <RefreshCw className={`w-4 h-4 ${refreshingSteam ? 'animate-spin' : ''}`} />
                <span className="text-sm font-medium">
                  {refreshingSteam ? '刷新中...' : '刷新数据'}
                </span>
              </motion.button>
            )}
          </div>

          {loadingSteam ? (
            <div className="bg-white/95 backdrop-blur-sm border border-rose-100/50 rounded-3xl p-16 relative overflow-hidden shadow-xl shadow-rose-50/30 flex items-center justify-center">
              <Loader2 className="w-12 h-12 text-fuchsia-500 animate-spin" />
            </div>
          ) : (
            <div className="bg-white/95 backdrop-blur-sm border border-rose-100/50 rounded-3xl p-8 relative overflow-hidden shadow-xl shadow-rose-50/30"
              style={{
                background: 'linear-gradient(135deg, #fff1f2 0%, #ffffff 50%, #fdf4ff 100%)',
              }}
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-rose-200/30 to-transparent rounded-full -translate-y-32 translate-x-32" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-pink-200/30 to-transparent rounded-full translate-y-24 -translate-x-24" />

              <div className="relative z-10">
                <div className="flex flex-col md:flex-row items-center gap-6 mb-10">
                  <motion.div
                    className="w-24 h-24 rounded-2xl bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center shadow-lg shadow-rose-200/50 border border-rose-300/30 overflow-hidden"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                  >
                    {steamAvatar ? (
                      <img
                        src={steamAvatar}
                        alt="Steam Avatar"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <SteamIcon className="w-12 h-12 text-white" />
                    )}
                  </motion.div>
                  <div className="text-center md:text-left">
                    <h4 className="text-2xl font-bold mb-1 bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                      {steamPersonaName}
                    </h4>
                    <p className="text-gray-500">
                      在线状态: <span className={getPersonaStateColor(steamPersonaState)}>
                        {getPersonaStateText(steamPersonaState)}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <motion.div
                    className="bg-white/80 backdrop-blur-sm rounded-xl p-5 text-center border border-rose-100 hover:bg-rose-50 hover:border-rose-300 hover:shadow-[0_0_20px_rgba(251,113,133,0.15)] transition-all duration-300"
                    whileHover={{ scale: 1.05 }}
                  >
                    <Trophy className="w-8 h-8 mx-auto mb-2 text-amber-500" />
                    <div className="text-3xl font-bold mb-1 text-gray-800">
                      {steamTotalGames}
                    </div>
                    <div className="text-sm text-gray-500">游戏总数</div>
                  </motion.div>

                  <motion.div
                    className="bg-white/80 backdrop-blur-sm rounded-xl p-5 text-center border border-rose-100 hover:bg-rose-50 hover:border-rose-300 hover:shadow-[0_0_20px_rgba(251,113,133,0.15)] transition-all duration-300"
                    whileHover={{ scale: 1.05 }}
                  >
                    <Star className="w-8 h-8 mx-auto mb-2 text-amber-500" />
                    <div className="text-3xl font-bold mb-1 text-gray-800">
                      {steamFavoriteCount}
                    </div>
                    <div className="text-sm text-gray-500">热门游戏</div>
                  </motion.div>

                  <motion.div
                    className="bg-white/80 backdrop-blur-sm rounded-xl p-5 text-center border border-rose-100 hover:bg-pink-50 hover:border-pink-300 hover:shadow-[0_0_20px_rgba(244,114,182,0.15)] transition-all duration-300"
                    whileHover={{ scale: 1.05 }}
                  >
                    <Gamepad2 className="w-8 h-8 mx-auto mb-2 text-pink-500" />
                    <div className="text-3xl font-bold mb-1 text-gray-800">
                      {steamTotalPlaytime}
                    </div>
                    <div className="text-sm text-gray-500">游戏时长(小时)</div>
                  </motion.div>

                  <motion.div
                    className="bg-white/80 backdrop-blur-sm rounded-xl p-5 text-center border border-rose-100 hover:bg-rose-50 hover:border-rose-300 hover:shadow-[0_0_20px_rgba(251,113,133,0.15)] transition-all duration-300"
                    whileHover={{ scale: 1.05 }}
                  >
                    <Heart className="w-8 h-8 mx-auto mb-2 text-rose-500" />
                    <div className="text-3xl font-bold mb-1 text-gray-800">
                      {steamPlayerType}
                    </div>
                    <div className="text-sm text-gray-500">玩家类型</div>
                  </motion.div>
                </div>

                {steamData?.favorite_games?.length > 0 && (
                  <div className="mt-8 pt-6 border-t border-rose-100">
                    <h5 className="text-lg font-bold text-gray-800 mb-4">最常玩的游戏</h5>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                      {steamData.favorite_games.slice(0, 5).map((game, index) => (
                        <motion.div
                          key={game.appid || index}
                          className="bg-rose-50 rounded-lg p-3 text-center border border-rose-100 hover:shadow-md transition-shadow"
                          whileHover={{ y: -2 }}
                        >
                          <p className="text-sm font-medium text-gray-800 truncate" title={game.name}>
                            {game.name || `Game ${game.appid}`}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {formatPlaytime(game.playtime_forever)}
                          </p>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {!steamData && (
                  <motion.div
                    className="mt-6 flex items-center justify-center gap-2 text-amber-600 bg-amber-50 rounded-lg p-3 border border-amber-200"
                  >
                    <Star className="w-4 h-4" />
                    <span className="text-sm">
                      当前显示示例数据。登录后在个人资料中配置Steam API Key即可显示真实数据。
                    </span>
                  </motion.div>
                )}

                <motion.div
                  className="mt-6 flex items-center justify-center gap-2 text-gray-500 cursor-pointer hover:text-rose-600 transition-colors w-fit mx-auto"
                  whileHover={{ x: 5 }}
                >
                  <span>查看完整的Steam游戏库</span>
                  <ChevronRight className="w-5 h-5" />
                </motion.div>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </section>
  )
}

export default GameSection
