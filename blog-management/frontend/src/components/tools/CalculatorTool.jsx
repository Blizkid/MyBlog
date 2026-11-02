import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Calculator as CalculatorIcon, RotateCcw } from 'lucide-react'

const CalculatorTool = () => {
  const [display, setDisplay] = useState('0')
  const [expression, setExpression] = useState('')
  const [waitingForOperand, setWaitingForOperand] = useState(false)

  const digits = ['7', '8', '9', '4', '5', '6', '1', '2', '3', '0', '.']
  const operators = ['÷', '×', '-', '+']
  const functions = ['C', '±', '%']

  const handleDigit = (digit) => {
    if (waitingForOperand) {
      setDisplay(digit)
      setWaitingForOperand(false)
    } else {
      setDisplay(display === '0' ? digit : display + digit)
    }
  }

  const handleDecimal = () => {
    if (waitingForOperand) {
      setDisplay('0.')
      setWaitingForOperand(false)
      return
    }
    if (!display.includes('.')) {
      setDisplay(display + '.')
    }
  }

  const handleOperator = (op) => {
    const currentValue = parseFloat(display)
    const operatorsMap = {
      '÷': '/',
      '×': '*',
      '-': '-',
      '+': '+'
    }
    
    if (expression === '') {
      setExpression(`${currentValue} ${operatorsMap[op]}`)
    } else {
      try {
        const result = eval(expression + currentValue)
        setDisplay(String(result))
        setExpression(`${result} ${operatorsMap[op]}`)
      } catch (error) {
        setDisplay('Error')
        setExpression('')
      }
    }
    setWaitingForOperand(true)
  }

  const handleFunction = (func) => {
    const currentValue = parseFloat(display)
    
    switch (func) {
      case 'C':
        setDisplay('0')
        setExpression('')
        setWaitingForOperand(false)
        break
      case '±':
        setDisplay(String(currentValue * -1))
        break
      case '%':
        setDisplay(String(currentValue / 100))
        break
      default:
        break
    }
  }

  const handleEquals = () => {
    if (expression === '') return
    
    try {
      const currentValue = parseFloat(display)
      const result = eval(expression + currentValue)
      setDisplay(String(result))
      setExpression('')
      setWaitingForOperand(true)
    } catch (error) {
      setDisplay('Error')
      setExpression('')
      setWaitingForOperand(false)
    }
  }

  return (
    <div className="w-full max-w-sm mx-auto">
      <div className="bg-gray-900 rounded-2xl shadow-xl overflow-hidden">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <CalculatorIcon className="w-5 h-5 text-blue-400" />
            <span className="text-gray-400 text-sm">计算器</span>
          </div>
          
          <div className="text-right mb-2">
            <div className="text-gray-500 text-sm h-6">{expression}</div>
            <div className="text-white text-4xl font-light truncate">{display}</div>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-1 bg-gray-800">
          {functions.map((func, index) => (
            <motion.button
              key={func}
              onClick={() => handleFunction(func)}
              className={`p-4 text-lg font-medium transition-colors ${
                func === 'C' ? 'text-red-400' : 'text-blue-400'
              } hover:bg-gray-700`}
              whileTap={{ scale: 0.95 }}
            >
              {func}
            </motion.button>
          ))}

          {operators.map((op, index) => (
            <motion.button
              key={op}
              onClick={() => handleOperator(op)}
              className="p-4 text-lg font-medium text-orange-400 hover:bg-gray-700 transition-colors"
              whileTap={{ scale: 0.95 }}
            >
              {op}
            </motion.button>
          ))}

          {digits.map((digit, index) => {
            if (digit === '0') {
              return (
                <motion.button
                  key={digit}
                  onClick={() => handleDigit(digit)}
                  className="p-4 text-lg font-medium text-white hover:bg-gray-700 transition-colors col-span-2"
                  whileTap={{ scale: 0.95 }}
                >
                  {digit}
                </motion.button>
              )
            }
            if (digit === '.') {
              return (
                <motion.button
                  key={digit}
                  onClick={handleDecimal}
                  className="p-4 text-lg font-medium text-white hover:bg-gray-700 transition-colors"
                  whileTap={{ scale: 0.95 }}
                >
                  {digit}
                </motion.button>
              )
            }
            return (
              <motion.button
                key={digit}
                onClick={() => handleDigit(digit)}
                className="p-4 text-lg font-medium text-white hover:bg-gray-700 transition-colors"
                whileTap={{ scale: 0.95 }}
              >
                {digit}
              </motion.button>
            )
          })}

          <motion.button
            onClick={handleEquals}
            className="p-4 text-lg font-medium text-white bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 transition-all"
            whileTap={{ scale: 0.95 }}
          >
            =
          </motion.button>
        </div>
      </div>
    </div>
  )
}

export default CalculatorTool
