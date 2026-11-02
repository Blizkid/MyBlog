import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BookOpen, Search, Star, Clock, Copy, Check, RefreshCw, Globe } from 'lucide-react'

const DictionaryTool = () => {
  const [searchWord, setSearchWord] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const [translateFrom, setTranslateFrom] = useState('en')
  const [translateTo, setTranslateTo] = useState('zh')
  const [searchHistory, setSearchHistory] = useState([
    'beautiful',
    'programming',
    'adventure',
    'hello world',
    'thank you'
  ])
  const [favorites, setFavorites] = useState(['beautiful', 'programming'])

  const languageOptions = [
    { code: 'en', name: 'English', flag: '🇺🇸', label: '英语' },
    { code: 'zh', name: 'Chinese', flag: '🇨🇳', label: '中文' },
    { code: 'ja', name: 'Japanese', flag: '🇯🇵', label: '日语' },
    { code: 'ko', name: 'Korean', flag: '🇰🇷', label: '韩语' },
    { code: 'fr', name: 'French', flag: '🇫🇷', label: '法语' },
    { code: 'de', name: 'German', flag: '🇩🇪', label: '德语' },
    { code: 'es', name: 'Spanish', flag: '🇪🇸', label: '西班牙语' },
    { code: 'pt', name: 'Portuguese', flag: '🇵🇹', label: '葡萄牙语' },
    { code: 'ru', name: 'Russian', flag: '🇷🇺', label: '俄语' },
    { code: 'ar', name: 'Arabic', flag: '🇸🇦', label: '阿拉伯语' },
  ]

  const translateText = async (text, from, to) => {
    try {
      const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${from}|${to}`
      console.log('翻译API请求:', url)
      
      const response = await fetch(url)
      console.log('API响应状态:', response.status)
      
      const data = await response.json()
      console.log('API响应数据:', data)
      
      return data
    } catch (err) {
      console.error('翻译API请求错误:', err)
      throw err
    }
  }

  const searchDictionary = async () => {
    if (!searchWord.trim()) {
      setError('请输入要查询的单词或句子')
      setResult(null)
      return
    }

    setLoading(true)
    setError('')
    setResult(null)

    try {
      const data = await translateText(searchWord, translateFrom, translateTo)
      
      if (data.responseStatus === 200 && data.responseData) {
        const translation = data.responseData.translatedText
        const fromLang = languageOptions.find(l => l.code === translateFrom)
        const toLang = languageOptions.find(l => l.code === translateTo)
        
        setResult({
          original: searchWord,
          translation: translation,
          from: fromLang,
          to: toLang,
          match: data.matches ? data.matches.slice(0, 5) : []
        })
        
        const word = searchWord.toLowerCase().trim()
        setSearchHistory(prev => {
          const filtered = prev.filter(w => w.toLowerCase() !== word)
          return [searchWord, ...filtered].slice(0, 10)
        })
      } else {
        setError(data.responseDetails || '翻译失败，请稍后重试')
      }
    } catch (err) {
      console.error('翻译错误:', err)
      setError('网络错误，请检查网络连接后重试')
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      searchDictionary()
    }
  }

  const toggleFavorite = (word) => {
    setFavorites(prev => {
      if (prev.includes(word)) {
        return prev.filter(w => w !== word)
      }
      return [...prev, word]
    })
  }

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (e) {
      console.error('复制失败')
    }
  }

  const quickSearch = (word) => {
    setSearchWord(word)
  }

  const swapLanguages = () => {
    const temp = translateFrom
    setTranslateFrom(translateTo)
    setTranslateTo(temp)
  }

  const quickTranslate = (text, from, to) => {
    setTranslateFrom(from)
    setTranslateTo(to)
    setSearchWord(text)
  }

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="flex items-center gap-2 mb-6">
        <BookOpen className="w-5 h-5 text-purple-500" />
        <span className="text-gray-700 font-medium">实时翻译</span>
        <span className="text-xs text-gray-400 ml-2">
          (Powered by MyMemory API)
        </span>
      </div>

      <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl p-6 border border-purple-100 mb-6">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="flex-1">
            <label className="block text-xs text-gray-500 mb-1">源语言</label>
            <select
              value={translateFrom}
              onChange={(e) => setTranslateFrom(e.target.value)}
              className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none"
            >
              {languageOptions.map(lang => (
                <option key={lang.code} value={lang.code}>
                  {lang.flag} {lang.label}
                </option>
              ))}
            </select>
          </div>
          
          <motion.button
            onClick={swapLanguages}
            className="mt-5 p-2 bg-white rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors"
            whileHover={{ scale: 1.1, rotate: 180 }}
            whileTap={{ scale: 0.95 }}
            title="交换语言"
          >
            <RefreshCw className="w-5 h-5 text-purple-500" />
          </motion.button>
          
          <div className="flex-1">
            <label className="block text-xs text-gray-500 mb-1">目标语言</label>
            <select
              value={translateTo}
              onChange={(e) => setTranslateTo(e.target.value)}
              className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none"
            >
              {languageOptions.map(lang => (
                <option key={lang.code} value={lang.code}>
                  {lang.flag} {lang.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchWord}
              onChange={(e) => setSearchWord(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="输入单词或句子..."
              className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none"
            />
          </div>
          <motion.button
            onClick={searchDictionary}
            disabled={loading}
            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-xl font-medium hover:from-purple-600 hover:to-indigo-600 transition-all shadow-lg shadow-purple-500/25 disabled:opacity-50"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {loading ? '翻译中...' : '翻译'}
          </motion.button>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Globe className="w-4 h-4" />
            <span>快捷翻译:</span>
          </div>
          <motion.button
            onClick={() => quickTranslate('Hello', 'en', 'zh')}
            className="px-3 py-1.5 text-sm text-purple-600 bg-white rounded-lg hover:bg-purple-50 transition-colors border border-purple-100"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            🇺🇸→🇨🇳
          </motion.button>
          <motion.button
            onClick={() => quickTranslate('你好', 'zh', 'en')}
            className="px-3 py-1.5 text-sm text-purple-600 bg-white rounded-lg hover:bg-purple-50 transition-colors border border-purple-100"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            🇨🇳→🇺🇸
          </motion.button>
          <motion.button
            onClick={() => quickTranslate('Thank you', 'en', 'ja')}
            className="px-3 py-1.5 text-sm text-purple-600 bg-white rounded-lg hover:bg-purple-50 transition-colors border border-purple-100"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            🇺🇸→🇯🇵
          </motion.button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 mb-6"
          >
            <BookOpen className="w-5 h-5" />
            <span>{error}</span>
          </motion.div>
        )}

        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden mb-6"
          >
            <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-purple-50 to-indigo-50">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded">
                      {result.from?.flag} {result.from?.label}
                    </span>
                    <RefreshCw className="w-4 h-4 text-gray-400" />
                    <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded">
                      {result.to?.flag} {result.to?.label}
                    </span>
                  </div>
                  
                  <div className="bg-white rounded-xl p-4 mb-3 border border-gray-100">
                    <p className="text-xl font-medium text-gray-800">{result.original}</p>
                  </div>
                  
                  <div className="bg-gradient-to-r from-purple-100 to-indigo-100 rounded-xl p-4">
                    <p className="text-2xl font-bold text-gray-800">{result.translation}</p>
                  </div>
                </div>
                
                <div className="flex flex-col gap-2 ml-4">
                  <motion.button
                    onClick={() => copyToClipboard(result.translation)}
                    className="p-2 bg-white rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    title="复制翻译结果"
                  >
                    {copied ? (
                      <Check className="w-5 h-5 text-green-600" />
                    ) : (
                      <Copy className="w-5 h-5 text-gray-500" />
                    )}
                  </motion.button>
                  
                  <motion.button
                    onClick={() => toggleFavorite(result.original)}
                    className={`p-2 rounded-xl border transition-colors ${favorites.includes(result.original) ? 'bg-amber-100 text-amber-600 border-amber-200' : 'bg-white text-gray-400 border-gray-200 hover:bg-gray-50'}`}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    title="收藏"
                  >
                    <Star className={`w-5 h-5 ${favorites.includes(result.original) ? 'fill-current' : ''}`} />
                  </motion.button>
                </div>
              </div>
            </div>

            {result.match && result.match.length > 0 && (
              <div className="p-6">
                <h4 className="text-sm font-medium text-gray-600 mb-3">其他翻译参考</h4>
                <div className="space-y-3">
                  {result.match.map((match, index) => (
                    <div key={index} className="p-3 bg-gray-50 rounded-xl">
                      <p className="text-sm text-gray-800 font-medium">{match.translation}</p>
                      {match.match && (
                        <p className="text-xs text-gray-500 mt-1">匹配: {match.match}</p>
                      )}
                      {match.quality && (
                        <span className="text-xs text-purple-600 bg-purple-50 px-2 py-0.5 rounded mt-1 inline-block">
                          匹配度: {match.quality}%
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-4 h-4 text-blue-500" />
            <h3 className="font-medium text-gray-700">查询历史</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {searchHistory.map((word, index) => (
              <motion.button
                key={index}
                onClick={() => quickSearch(word)}
                className="px-3 py-1.5 text-sm text-gray-600 bg-gray-50 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {word}
              </motion.button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Star className="w-4 h-4 text-amber-500 fill-current" />
            <h3 className="font-medium text-gray-700">收藏夹</h3>
          </div>
          {favorites.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {favorites.map((word, index) => (
                <motion.button
                  key={index}
                  onClick={() => quickSearch(word)}
                  className="px-3 py-1.5 text-sm text-amber-700 bg-amber-50 rounded-lg hover:bg-amber-100 transition-colors border border-amber-200"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {word}
                </motion.button>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400">暂无收藏的单词</p>
          )}
        </div>
      </div>

      <div className="mt-6 text-center">
        <p className="text-xs text-gray-400">
          翻译服务由 MyMemory API 提供，支持免费使用
        </p>
      </div>
    </div>
  )
}

export default DictionaryTool
