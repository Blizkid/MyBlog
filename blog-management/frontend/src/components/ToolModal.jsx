import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Calculator, Code2, DollarSign, BookOpen } from 'lucide-react'
import CalculatorTool from './tools/CalculatorTool'
import JsonFormatterTool from './tools/JsonFormatterTool'
import ExchangeRateTool from './tools/ExchangeRateTool'
import DictionaryTool from './tools/DictionaryTool'

const ToolModal = ({ isOpen, onClose, activeTool }) => {
  const toolConfig = {
    calculator: {
      title: '计算器',
      icon: Calculator,
      color: 'text-blue-500',
      bgColor: 'from-blue-50 to-indigo-50',
      component: CalculatorTool
    },
    json: {
      title: 'JSON在线格式化',
      icon: Code2,
      color: 'text-green-500',
      bgColor: 'from-green-50 to-emerald-50',
      component: JsonFormatterTool
    },
    exchange: {
      title: '汇率计算',
      icon: DollarSign,
      color: 'text-amber-500',
      bgColor: 'from-amber-50 to-orange-50',
      component: ExchangeRateTool
    },
    dictionary: {
      title: '英文词典',
      icon: BookOpen,
      color: 'text-purple-500',
      bgColor: 'from-purple-50 to-indigo-50',
      component: DictionaryTool
    }
  }

  const config = toolConfig[activeTool] || toolConfig.calculator
  const ToolComponent = config.component
  const Icon = config.icon

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
            initial={{ scale: 0.9, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 20, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={`flex items-center justify-between p-6 border-b border-gray-100 bg-gradient-to-r ${config.bgColor}`}>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white rounded-xl shadow-sm">
                  <Icon className={`w-6 h-6 ${config.color}`} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800">{config.title}</h2>
                  <p className="text-sm text-gray-500">小工具箱</p>
                </div>
              </div>
              <motion.button
                onClick={onClose}
                className="p-2 hover:bg-white/50 rounded-xl transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <X className="w-5 h-5 text-gray-600" />
              </motion.button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
              <ToolComponent />
            </div>

            <div className="p-4 border-t border-gray-100 bg-white flex items-center justify-center">
              <p className="text-xs text-gray-400">按 ESC 键或点击外部关闭</p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default ToolModal
