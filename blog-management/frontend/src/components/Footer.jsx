import React, { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Eye, Users } from 'lucide-react'

const API_BASE_URL = 'http://localhost:8080'

const Footer = () => {
  const [stats, setStats] = useState({
    totalPageViews: 0,
    totalUniqueVisitors: 0,
    todayPageViews: 0,
    todayUniqueVisitors: 0,
  })
  const [loading, setLoading] = useState(true)
  const [hasRecordedVisit, setHasRecordedVisit] = useState(false)

  const recordVisit = useCallback(async () => {
    if (hasRecordedVisit) return

    try {
      const response = await fetch(`${API_BASE_URL}/pageview/record`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          path: window.location.pathname + window.location.search + window.location.hash,
          referer: document.referrer,
          userAgent: navigator.userAgent,
        }),
      })

      if (response.ok) {
        setHasRecordedVisit(true)
      }
    } catch (err) {
      console.error('Failed to record visit:', err)
    }
  }, [hasRecordedVisit])

  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/pageview/stats`)
      const data = await response.json()

      if (data.code === 0) {
        setStats({
          totalPageViews: data.data.totalPageViews || 0,
          totalUniqueVisitors: data.data.totalUniqueVisitors || 0,
          todayPageViews: data.data.todayPageViews || 0,
          todayUniqueVisitors: data.data.todayUniqueVisitors || 0,
        })
      }
    } catch (err) {
      console.error('Failed to fetch stats:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    recordVisit()
    fetchStats()

    const interval = setInterval(fetchStats, 60000)
    return () => clearInterval(interval)
  }, [recordVisit, fetchStats])

  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M'
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K'
    }
    return num.toString()
  }

  if (loading) {
    return (
      <motion.footer
        className="py-4 bg-white/50 backdrop-blur-sm border-t border-gray-200/50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-center gap-2 text-gray-400">
            <div className="w-2 h-2 rounded-full bg-gray-300 animate-pulse" />
            <span className="text-xs">Loading stats...</span>
          </div>
        </div>
      </motion.footer>
    )
  }

  return (
    <motion.footer
      className="py-3 bg-white/60 backdrop-blur-sm border-t border-gray-200/50"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.5 }}
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-center gap-6 text-xs text-gray-500">
          <div className="flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5 text-teal-500" />
            <span>
              总访问 <span className="font-medium text-gray-700">{formatNumber(stats.totalPageViews)}</span>
              <span className="text-gray-400 mx-0.5">·</span>
              今日 <span className="font-medium text-gray-700">{formatNumber(stats.todayPageViews)}</span>
            </span>
          </div>

          <div className="w-px h-4 bg-gray-300" />

          <div className="flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-orange-500" />
            <span>
              访客 <span className="font-medium text-gray-700">{formatNumber(stats.totalUniqueVisitors)}</span>
              <span className="text-gray-400 mx-0.5">·</span>
              今日 <span className="font-medium text-gray-700">{formatNumber(stats.todayUniqueVisitors)}</span>
            </span>
          </div>

          <div className="w-px h-4 bg-gray-300 hidden sm:block" />

          <span className="text-gray-400 hidden sm:inline">
            © {new Date().getFullYear()} Blog
          </span>
        </div>
      </div>
    </motion.footer>
  )
}

export default Footer
