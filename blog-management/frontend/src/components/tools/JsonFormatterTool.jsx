import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Code2, Copy, Check, Trash2, RotateCcw, AlertCircle, CheckCircle } from 'lucide-react'

const JsonFormatterTool = () => {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const [indentSize, setIndentSize] = useState(2)

  const sampleJson = `{
  "name": "张三",
  "age": 28,
  "isStudent": false,
  "hobbies": ["阅读", "编程", "旅行"],
  "address": {
    "city": "北京",
    "district": "朝阳区"
  }
}`

  const formatJson = () => {
    if (!input.trim()) {
      setError('请输入JSON内容')
      setOutput('')
      return
    }

    try {
      const parsed = JSON.parse(input)
      const formatted = JSON.stringify(parsed, null, indentSize)
      setOutput(formatted)
      setError('')
    } catch (e) {
      setError(`JSON格式错误: ${e.message}`)
      setOutput('')
    }
  }

  const compressJson = () => {
    if (!input.trim()) {
      setError('请输入JSON内容')
      setOutput('')
      return
    }

    try {
      const parsed = JSON.parse(input)
      const compressed = JSON.stringify(parsed)
      setOutput(compressed)
      setError('')
    } catch (e) {
      setError(`JSON格式错误: ${e.message}`)
      setOutput('')
    }
  }

  const loadSample = () => {
    setInput(sampleJson)
    setOutput('')
    setError('')
  }

  const clearAll = () => {
    setInput('')
    setOutput('')
    setError('')
  }

  const copyToClipboard = async () => {
    if (!output) return
    try {
      await navigator.clipboard.writeText(output)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (e) {
      setError('复制失败，请手动复制')
    }
  }

  return (
    <div className="w-full">
      <div className="flex items-center gap-2 mb-4">
        <Code2 className="w-5 h-5 text-green-500" />
        <span className="text-gray-700 font-medium">JSON在线格式化</span>
      </div>

      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600">缩进:</label>
          <select
            value={indentSize}
            onChange={(e) => setIndentSize(Number(e.target.value))}
            className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:border-green-500 focus:ring-2 focus:ring-green-500/20 outline-none"
          >
            <option value={2}>2 空格</option>
            <option value={4}>4 空格</option>
            <option value={8}>8 空格</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">输入</label>
            <div className="flex items-center gap-2">
              <motion.button
                onClick={loadSample}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                whileTap={{ scale: 0.95 }}
              >
                <RotateCcw className="w-3.5 h-3.5" />
                示例
              </motion.button>
              <motion.button
                onClick={clearAll}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                whileTap={{ scale: 0.95 }}
              >
                <Trash2 className="w-3.5 h-3.5" />
                清空
              </motion.button>
            </div>
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="在此粘贴或输入JSON..."
            className="w-full h-80 p-4 font-mono text-sm bg-gray-50 border border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-500/20 outline-none resize-none text-gray-700 placeholder-gray-400"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">输出</label>
            {output && (
              <motion.button
                onClick={copyToClipboard}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                whileTap={{ scale: 0.95 }}
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-green-500" />
                    已复制
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    复制
                  </>
                )}
              </motion.button>
            )}
          </div>
          <textarea
            value={output}
            readOnly
            placeholder="格式化后的JSON将显示在这里..."
            className="w-full h-80 p-4 font-mono text-sm bg-gray-900 text-green-400 border border-gray-700 rounded-xl outline-none resize-none placeholder-gray-500"
          />
        </div>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm"
        >
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </motion.div>
      )}

      {output && !error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 mt-4 p-3 bg-green-50 border border-green-200 rounded-xl text-green-600 text-sm"
        >
          <CheckCircle className="w-4 h-4 flex-shrink-0" />
          <span>JSON格式化成功！</span>
        </motion.div>
      )}

      <div className="flex items-center gap-3 mt-4">
        <motion.button
          onClick={formatJson}
          className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-medium hover:from-green-600 hover:to-emerald-600 transition-all shadow-lg shadow-green-500/25"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Code2 className="w-4 h-4" />
          格式化
        </motion.button>
        <motion.button
          onClick={compressJson}
          className="flex items-center gap-2 px-6 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          压缩
        </motion.button>
      </div>
    </div>
  )
}

export default JsonFormatterTool
