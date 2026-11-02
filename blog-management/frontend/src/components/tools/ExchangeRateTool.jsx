import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { DollarSign, RefreshCw, TrendingUp, TrendingDown } from 'lucide-react'

const ExchangeRateTool = () => {
  const [amount, setAmount] = useState('1')
  const [fromCurrency, setFromCurrency] = useState('CNY')
  const [toCurrency, setToCurrency] = useState('USD')
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)

  const currencies = [
    { code: 'CNY', name: '人民币', symbol: '¥', flag: '🇨🇳' },
    { code: 'USD', name: '美元', symbol: '$', flag: '🇺🇸' },
    { code: 'EUR', name: '欧元', symbol: '€', flag: '🇪🇺' },
    { code: 'GBP', name: '英镑', symbol: '£', flag: '🇬🇧' },
    { code: 'JPY', name: '日元', symbol: '¥', flag: '🇯🇵' },
    { code: 'HKD', name: '港币', symbol: 'HK$', flag: '🇭🇰' },
    { code: 'AUD', name: '澳元', symbol: 'A$', flag: '🇦🇺' },
    { code: 'CAD', name: '加元', symbol: 'C$', flag: '🇨🇦' },
    { code: 'SGD', name: '新加坡元', symbol: 'S$', flag: '🇸🇬' },
    { code: 'KRW', name: '韩元', symbol: '₩', flag: '🇰🇷' },
    { code: 'THB', name: '泰铢', symbol: '฿', flag: '🇹🇭' },
    { code: 'CHF', name: '瑞士法郎', symbol: 'Fr', flag: '🇨🇭' },
  ]

  const mockRates = {
    CNY: 1,
    USD: 0.138,
    EUR: 0.128,
    GBP: 0.110,
    JPY: 20.8,
    HKD: 1.08,
    AUD: 0.212,
    CAD: 0.188,
    SGD: 0.186,
    KRW: 182,
    THB: 4.78,
    CHF: 0.123,
  }

  const getCurrencyInfo = (code) => {
    return currencies.find(c => c.code === code) || currencies[0]
  }

  const convertCurrency = () => {
    if (!amount || isNaN(parseFloat(amount))) {
      setResult('')
      return
    }

    setLoading(true)
    
    setTimeout(() => {
      const amountNum = parseFloat(amount)
      const fromRate = mockRates[fromCurrency] || 1
      const toRate = mockRates[toCurrency] || 1
      
      const inCNY = amountNum / fromRate
      const converted = inCNY * toRate
      
      setResult(converted.toLocaleString('zh-CN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 4
      }))
      setLoading(false)
    }, 300)
  }

  const swapCurrencies = () => {
    const temp = fromCurrency
    setFromCurrency(toCurrency)
    setToCurrency(temp)
  }

  useEffect(() => {
    convertCurrency()
  }, [amount, fromCurrency, toCurrency])

  const fromInfo = getCurrencyInfo(fromCurrency)
  const toInfo = getCurrencyInfo(toCurrency)

  const rate = (mockRates[toCurrency] / mockRates[fromCurrency]).toFixed(4)
  const inverseRate = (mockRates[fromCurrency] / mockRates[toCurrency]).toFixed(4)

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="flex items-center gap-2 mb-6">
        <DollarSign className="w-5 h-5 text-amber-500" />
        <span className="text-gray-700 font-medium">汇率计算</span>
      </div>

      <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 border border-amber-100">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">金额</label>
            <div className="flex items-center gap-3">
              <span className="text-2xl font-bold text-gray-600">{fromInfo.symbol}</span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="flex-1 px-4 py-3 bg-white border border-gray-200 rounded-xl text-lg font-medium focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none"
                placeholder="输入金额"
              />
            </div>
          </div>

          <div className="grid grid-cols-5 gap-3 items-center">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">从</label>
              <div className="relative">
                <select
                  value={fromCurrency}
                  onChange={(e) => setFromCurrency(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl appearance-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none cursor-pointer"
                >
                  {currencies.map((currency) => (
                    <option key={currency.code} value={currency.code}>
                      {currency.flag} {currency.code} - {currency.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-center">
              <motion.button
                onClick={swapCurrencies}
                className="p-3 bg-white rounded-full shadow-md hover:shadow-lg transition-shadow"
                whileHover={{ scale: 1.1, rotate: 180 }}
                whileTap={{ scale: 0.95 }}
                title="交换货币"
              >
                <RefreshCw className="w-5 h-5 text-amber-500" />
              </motion.button>
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">到</label>
              <div className="relative">
                <select
                  value={toCurrency}
                  onChange={(e) => setToCurrency(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl appearance-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none cursor-pointer"
                >
                  {currencies.map((currency) => (
                    <option key={currency.code} value={currency.code}>
                      {currency.flag} {currency.code} - {currency.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl p-6 text-white">
              <div className="text-sm opacity-80 mb-2">转换结果</div>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold">
                  {loading ? '...' : `${toInfo.symbol} ${result}`}
                </span>
                <span className="text-lg opacity-80">{toCurrency}</span>
              </div>
              <div className="mt-4 pt-4 border-t border-white/20">
                <div className="flex items-center justify-between text-sm">
                  <span className="opacity-80">
                    1 {fromCurrency} = {rate} {toCurrency}
                  </span>
                  <span className="opacity-80">
                    1 {toCurrency} = {inverseRate} {fromCurrency}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-gray-700">常用汇率 (基于 CNY)</h3>
          <motion.button
            onClick={convertCurrency}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            whileTap={{ scale: 0.95 }}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            刷新
          </motion.button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {currencies.slice(0, 6).map((currency) => {
            const rate = mockRates[currency.code]
            const isTrendingUp = rate > 1
            return (
              <motion.div
                key={currency.code}
                className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                whileHover={{ y: -2 }}
                onClick={() => {
                  setFromCurrency('CNY')
                  setToCurrency(currency.code)
                }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">{currency.flag}</span>
                  <div>
                    <div className="text-sm font-medium text-gray-800">{currency.code}</div>
                    <div className="text-xs text-gray-500">{currency.name}</div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-gray-800">
                    {currency.symbol}{rate}
                  </span>
                  <div className={`flex items-center gap-1 text-xs ${
                    isTrendingUp ? 'text-green-500' : 'text-red-500'
                  }`}>
                    {isTrendingUp ? (
                      <TrendingUp className="w-3.5 h-3.5" />
                    ) : (
                      <TrendingDown className="w-3.5 h-3.5" />
                    )}
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>

      <div className="mt-4 text-xs text-gray-400 text-center">
        * 汇率为模拟数据，仅供参考
      </div>
    </div>
  )
}

export default ExchangeRateTool
