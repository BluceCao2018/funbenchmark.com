'use client'
import React, { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import '@fortawesome/fontawesome-free/css/all.min.css';
import Image from 'next/image'

export default function MemoryTest() {
  const [gameState, setGameState] = useState<'start' | 'show' | 'play' | 'result'>('start')
  const [gridSize, setGridSize] = useState(3)
  const [highlightedCount, setHighlightedCount] = useState(3)
  const [level, setLevel] = useState(1)
  const [highlightedCells, setHighlightedCells] = useState<number[]>([])
  const [selectedCells, setSelectedCells] = useState<number[]>([])

  const t =  useTranslations('memory');

  const totalCells = gridSize * gridSize;
  const threshold = Math.floor(totalCells * 0.4);

  const generateHighlightedCells = () => {
    const count = Math.min(highlightedCount, totalCells);
    const cells: number[] = [];
    
    while (cells.length < count) {
        const randomCell = Math.floor(Math.random() * totalCells);
        if (!cells.includes(randomCell)) {
            cells.push(randomCell);
        }
    }
    
    return cells;
  }

  const startGame = () => {
    const newHighlightedCells = generateHighlightedCells()
    setSelectedCells([])
    setHighlightedCells(newHighlightedCells)
    setGameState('show')

    setTimeout(() => {
      setGameState('play')
    }, 2000)
  }

  const handleCellClick = (cellIndex: number) => {
    if (gameState !== 'play') return

    const updatedSelectedCells = [...selectedCells, cellIndex]
    setSelectedCells(updatedSelectedCells)

    // 先检查是否选择了错误的格子
    console.info(highlightedCells)
    console.info('cellIndex:'+cellIndex)
    if (!highlightedCells.includes(cellIndex)) {
      setGameState('result')
      return
    }

    // 如果选择了正确的格子，且数量达到目标数量，则完成本关
    if (updatedSelectedCells.length === highlightedCells.length) {
      handleLevelComplete()
      setTimeout(startGame, 1000)
    }
  }

  const handleLevelComplete = () => {
    const newHighlightedCount = highlightedCount + 1;
    
    if (newHighlightedCount > threshold) {
        setGridSize(prev => prev + 1);
    } else {
        setHighlightedCount(newHighlightedCount);
    }
    
    setLevel(prev => prev + 1);
    setHighlightedCells([]);
    setSelectedCells([]);
  }

  const resetGame = () => {
    setGridSize(3);
    setHighlightedCount(3);
    setLevel(1);
    setHighlightedCells([]);
    setSelectedCells([]);
  }

  return (
    <div 
      className="w-full mx-auto py-0 space-y-16 "
    >
    <div className="banner w-full h-[550px] flex flex-col justify-center items-center bg-blue-theme text-white">
      {gameState === 'start' && (
        <div  className='flex flex-col justify-center items-center'>
           <i className="fas fa-eye text-9xl text-white mb-8 animate-fade cursor-pointer"></i>
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

      {(gameState === 'show' || gameState === 'play') && (
        <div 
          className="grid gap-2 w-full max-w-md"
          style={{ 
            gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`
          }}
        >
          {Array.from({length: totalCells}).map((_, index) => {
            const isHighlighted = highlightedCells.includes(index)
            const isSelected = selectedCells.includes(index)

            return (
              <div 
                key={index}
                onClick={() => handleCellClick(index)}
                className={`
                  aspect-square flex items-center justify-center 
                  border-2 rounded-lg cursor-pointer transition-colors
                  ${gameState === 'show' && isHighlighted ? 'bg-blue-500' : ''}
                  ${gameState === 'play' && isSelected ? 
                    (highlightedCells.includes(index) ? 'bg-green-500' : 'bg-red-500') 
                    : ''
                  }
                `}
              />
            )
          })}
        </div>
      )}

      {gameState === 'result' && (
        <div  className='flex flex-col justify-center items-center'>
           <i className="fas fa-eye text-9xl text-white mb-8 animate-fade cursor-pointer"></i>
          <h2 className="text-2xl font-bold mb-4">{t("h2")}</h2>
          <p className="text-6xl font-bold mb-4">{t("level")} {level - 1} </p>
          <button 
            onClick={() => {
              resetGame()
              startGame()
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
      src='/memory-statistics.png' 
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