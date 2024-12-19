'use client'
import React, { useState, useEffect } from 'react'

export default function ClickSpeedTest() {
  const [gameState, setGameState] = useState<'start' | 'playing' | 'result'>('start')
  const [clickCount, setClickCount] = useState(0)
  const [timeLeft, setTimeLeft] = useState(30)

  const startGame = () => {
    setClickCount(0)
    setGameState('playing')
    setTimeLeft(10)

    // 每秒减少时间
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer)
          endGame()
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  const endGame = () => {
    setGameState('result')
  }

  const handleClick = () => {
    if (gameState === 'playing') {
      setClickCount(prev => prev + 1)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
      {gameState === 'start' && (
        <div>
          <h1 className="text-3xl font-bold mb-6">点击速度测试</h1>
          <p className="mb-6">在10秒内尽可能多地点击下面的按钮！</p>
          <button 
            onClick={startGame} 
            className="bg-blue-600 text-white px-6 py-3 rounded-lg shadow-md hover:bg-blue-700 transition-colors"
          >
            开始测试
          </button>
        </div>
      )}

      {gameState === 'playing' && (
        <div>
          <h2 className="text-2xl font-bold mb-4">时间剩余: {timeLeft}秒</h2>
          <button 
            onClick={handleClick} 
            className="bg-green-600 text-white px-6 py-3 rounded-lg shadow-md hover:bg-green-700 transition-colors"
          >
            点击我！
          </button>
          <p className="mt-4 text-xl">点击次数: {clickCount}</p>
        </div>
      )}

      {gameState === 'result' && (
        <div>
          <h2 className="text-2xl font-bold mb-4">测试结果</h2>
          <p className="text-xl mb-4">你在10秒内点击了 {clickCount} 次！</p>
          <button 
            onClick={() => setGameState('start')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg shadow-md hover:bg-blue-700 transition-colors"
          >
            重新开始
          </button>
        </div>
      )}
    </div>
  )
} 