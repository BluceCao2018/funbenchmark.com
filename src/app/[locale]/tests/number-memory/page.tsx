'use client'
import React, { useState, useEffect } from 'react'
import '@fortawesome/fontawesome-free/css/all.min.css';
import { useTranslations } from 'next-intl';
import Image from 'next/image'

export default function NumberMemoryTest() {
  const [gameState, setGameState] = useState<'start' | 'show' | 'input' | 'result'>('start')
  const [currentNumber, setCurrentNumber] = useState<string>('')
  const [userInput, setUserInput] = useState<string>('')
  const [level, setLevel] = useState(1)
  const [timer, setTimer] = useState<number>(0)
  const [progress, setProgress] = useState(100)
  
  const baseTime = 1000
  const timePerDigit = 1000

  const t =  useTranslations('numberMemory');

  const generateNumber = () => {
    // 随机生成数字，长度随级别增加
    const digits = level + 1
    const number = Math.floor(Math.random() * Math.pow(10, digits)).toString().padStart(digits, '0')
    return number
  }

  const startGame = () => {
    setGameState('show')
    const number = generateNumber()
    setCurrentNumber(number)
    setUserInput('')

    // 根据数字位数调整显示时间
    // 基础时间 2000ms
    // 每位数字增加 1000ms
    const displayTime = baseTime + (level * timePerDigit)
    
    setTimeout(() => {
      setGameState('input')
      const startTime = Date.now()
      setTimer(startTime)
    }, displayTime)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (userInput === currentNumber) {
      // 答对进入下一关
      setLevel(prev => prev + 1)
      startGame()
    } else {
      // 答错进入结果页
      setGameState('result')
    }
  }

  const calculateScore = () => {
    // 分数基于达到的关卡
    return level - 1
  }

  useEffect(() => {
    if (gameState === 'show') {
      setProgress(100)
      const duration = baseTime + (level * timePerDigit)
      const interval = 10
      const steps = duration / interval
      const decrementPerStep = 100 / steps + 0.02

      const timer = setInterval(() => {
        setProgress(prev => {
          const next = prev - decrementPerStep
          return next < 0 ? 0 : next
        })
      }, interval)

      return () => clearInterval(timer)
    }
  }, [gameState, level, baseTime, timePerDigit])

  return (

    <div 
      className="w-full mx-auto py-0 space-y-16 "
    >
    <div className="banner w-full h-[550px] flex flex-col justify-center items-center bg-blue-theme text-white">
      {gameState === 'start' && (
        <div  className='flex flex-col justify-center items-center'>
          <i className="fas fa-th text-9xl text-white mb-8 animate-fade cursor-pointer"></i>
          <h1 className="text-4xl font-bold text-center mb-4 text-white">{t("h2")}</h1>
            <p className="text-lg text-center mb-20 text-white" dangerouslySetInnerHTML={{ __html: t("description")?.replace(/\n/g, '<br />')  || ''}} ></p>
          <button 
            onClick={startGame} 
            className="bg-blue-600 text-white px-6 py-3 rounded-lg shadow-md hover:bg-blue-700 transition-colors"
          >
            {t("clickToStart")}
          </button>
        </div>
      )}

      {gameState === 'show' && (
        <div className="flex flex-col items-center">
          <div className="text-6xl font-bold mb-4">
            {currentNumber}
          </div>
          <div className="w-full max-w-[400px] h-2 bg-white/0 rounded-full overflow-hidden">
            <div 
              className="h-full bg-white"
              style={{ 
                width: `${progress}%`,
                transition: 'width 10ms linear'
              }}
            />
          </div>
        </div>
      )}

      {gameState === 'input' && (
        <form onSubmit={handleSubmit} className="flex flex-col items-center">
          <i className="fas fa-th text-9xl text-white mb-8 animate-fade cursor-pointer"></i>
          <h1 className="text-4xl font-bold text-center mb-4 text-white">{t("remaindTitle")}</h1>
          <p className="text-lg text-center mb-4 text-white" dangerouslySetInnerHTML={{ __html: t("remaindDescription")?.replace(/\n/g, '<br />')  || ''}} ></p>
          <input 
            type="text" 
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            className="text-4xl text-center border-2 border-blue-500 rounded-lg p-2 mb-4 text-black"
            autoFocus
            placeholder=""
          />
          <button 
            type="submit" 
            className="bg-green-600 text-white px-6 py-3 rounded-lg shadow-md hover:bg-green-700 transition-colors"
          >
            {t("submit")}
          </button>
        </form>
      )}

      {gameState === 'result' && (
        <div   className='flex flex-col justify-center items-center'>
          <h2 className="text-2xl mb-4">{t("number")}</h2>
          
          <p className="text-3xl font-bold mb-6">{currentNumber}</p>
          <h2 className="text-2xl mb-4">{t("youAnswer")}</h2>
          <p className="text-3xl font-bold mb-4 line-through text-red">{userInput}</p>
          <h2  className="text-7xl font-bold mb-6">{t("level")} {level}</h2>
          <button 
            onClick={() => {
              setGameState('start')
              setLevel(1)
            }}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg shadow-md hover:bg-blue-700 transition-colors"
          >
            {t("tryAgain")}
          </button>
        </div>
      )}
    </div>

<div className="container mx-auto py-0 space-y-16 ">
<div className="container mx-auto px-4 py-8 max-w-6xl">
<div className="grid md:grid-cols-2 gap-8 items-center">
  <div className="w-full h-[400px]">
    <h2  className="text-xl mb-4 font-semibold">{t("statisticsTitle")}</h2>
    <Image 
      src='/number-memory-statistics.png' 
      alt='{t("statisticsTitle")}'
      className='w-full h-full' 
      width={400} 
      height={400}
    />
  </div>
  <div className="w-full h-[400px]">
    <h2  className="text-xl mb-4 font-semibold">{t("aboutTitle")}</h2>
    <p  dangerouslySetInnerHTML={{ __html: t("about")?.replace(/\n/g, '<br />')  || ''}} >
            </p>
  </div>
  </div>
  </div>
</div>

</div>

  )
} 