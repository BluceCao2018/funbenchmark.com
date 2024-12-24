'use client'
import React, { useState } from 'react'
import { useTranslations } from 'next-intl';
import '@fortawesome/fontawesome-free/css/all.min.css';
import Image from 'next/image'

export default function TimePerceptionTest() {
  const [isGameStarted, setIsGameStarted] = useState(false)
  const [results, setResults] = useState<Array<{
    targetTime: number,
    actualTime: number,
    deviation: number,
    deviationPercentage: number
  }>>([])
  
  const times = [1, 2, 3, 5, 0.5, 0.3, 0.2, 0.1, 30]
  const [activeTimer, setActiveTimer] = useState<number | null>(null)
  const [startTime, setStartTime] = useState<number>(0)
  const [completedGrids, setCompletedGrids] = useState<Set<number>>(new Set())

  const t = useTranslations('timePerception');

  const handleGridClick = (index: number, targetTime: number) => {
    const grid = document.getElementById(`grid-${index}`)
    if (!grid) return

    if (completedGrids.has(index)) return

    if (activeTimer === index) {
      // 停止计时
      const actualTime = (Date.now() - startTime) / 1000
      const deviation = actualTime - targetTime
      const deviationPercentage = (deviation / targetTime) * 100

      setResults(prev => [...prev, {
        targetTime,
        actualTime,
        deviation,
        deviationPercentage
      }])

      grid.classList.remove('bg-red-500', 'border-red-600')
      grid.classList.add('bg-green-500', 'border-green-600')
      setCompletedGrids(prev => new Set(Array.from(prev).concat(index)))
      setActiveTimer(null)
    } else {
      // 开始计时
      if (activeTimer !== null) {
        const prevGrid = document.getElementById(`grid-${activeTimer}`)
        prevGrid?.classList.remove('bg-red-500', 'border-red-600')
        prevGrid?.classList.add('bg-gray-100', 'border-gray-300')
      }
      
      grid.classList.remove('bg-gray-100', 'border-gray-300')
      grid.classList.add('bg-red-500', 'border-red-600')
      setStartTime(Date.now())
      setActiveTimer(index)
    }
  }

  return (
    <div className="w-full mx-auto py-0 space-y-16">
      <div className="banner w-full h-[550px] flex flex-col justify-center items-center" 
           style={{ backgroundColor: 'rgb(43, 135, 209)' }}>
        {!isGameStarted && (
          <div className="flex flex-col justify-center items-center">
            <i className="fas fa-clock text-9xl text-white mb-8 animate-fade"></i>
            <h1 className="text-4xl font-bold text-center mb-4 text-white">{t("h2")}</h1>
            <p className="text-lg text-center mb-20 text-white">{t("description")}</p>
          </div>
        )}

        <div className="w-full max-w-md text-center">
          {!isGameStarted ? (
            <button 
              onClick={() => setIsGameStarted(true)}
              className="bg-yellow-600 text-white px-6 py-3 rounded-lg shadow-md hover:bg-yellow-700 transition-colors"
            >
              {t("clickToStart")}
            </button>
          ) : (
            <div>
              <div className="grid grid-cols-3 gap-3 rounded-xl shadow-lg p-4 bg-white">
                {times.map((time, index) => (
                  <div
                    key={index}
                    id={`grid-${index}`}
                    className={`aspect-square rounded-lg cursor-pointer transition-all duration-200 ease-in-out border-2 
                      ${completedGrids.has(index) 
                        ? 'bg-green-500 border-green-600' 
                        : activeTimer === index
                          ? 'bg-red-500 border-red-600 text-white'
                          : 'bg-gray-100 border-gray-300'
                      } flex flex-col items-center justify-center text-xl font-bold`}
                    onClick={() => handleGridClick(index, time)}
                  >
                    <div>{time}s</div>
                    {completedGrids.has(index) && (
                      <div className="text-sm">
                        {results.find(r => r.targetTime === time)?.actualTime.toFixed(2)}s
                        <br />
                        ({(results.find(r => r.targetTime === time)?.deviationPercentage ?? 0) > 0 ? '+' : ''}
                        {results.find(r => r.targetTime === time)?.deviationPercentage?.toFixed(1) ?? '0.0'}%)
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              {completedGrids.size === times.length && (
                <button 
                  onClick={() => {
                    setCompletedGrids(new Set())
                    setResults([])
                    setActiveTimer(null)
                  }}
                  className="mt-4 bg-blue-500 text-white px-6 py-2 rounded-lg shadow-md hover:bg-blue-600 transition-colors"
                >
                  {t("tryAgain")}
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="container mx-auto py-0 space-y-16">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="w-full h-[400px]">
              <h2 className="text-xl mb-4 font-semibold">{t("statisticsTitle")}</h2>
              
            </div>
            <div className="w-full h-[400px]">
              <h2 className="text-xl mb-4 font-semibold">{t("aboutTitle")}</h2>
              <p dangerouslySetInnerHTML={{ __html: t("about")?.replace(/\n/g, '<br />') || '' }}></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 