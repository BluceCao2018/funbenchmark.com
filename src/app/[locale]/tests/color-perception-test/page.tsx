'use client'
import React, { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { FaPalette } from 'react-icons/fa';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';

export default function ColorPerceptionTest() {
  const [isGameStarted, setIsGameStarted] = useState(false)
  const [level, setLevel] = useState(1)
  const [score, setScore] = useState(0)
  const [gameOver, setGameOver] = useState(false)
  const [grid, setGrid] = useState<number[][]>([])
  const [showEmbedDialog, setShowEmbedDialog] = useState(false)
  const searchParams = useSearchParams()
  const isIframe = searchParams.get('embed') === 'true'
  const [embedUrl, setEmbedUrl] = useState('')
  const [correctAnswers, setCorrectAnswers] = useState(0)
  const [totalAttempts, setTotalAttempts] = useState(0)
  const [gameState, setGameState] = useState<'start' | 'playing' | 'result'>('start')
  const te = useTranslations('embed');
  const t = useTranslations('colorPerception');

  const generateGrid = (level: number) => {
    const size = Math.min(Math.floor(Math.sqrt(level + 3)), 8);
    const baseColor = Math.floor(Math.random() * 360);
    const differentSquare = Math.floor(Math.random() * (size * size));
    
    const colorDifference = Math.max(40 - level * 2, 5); // 随级别增加难度
    
    return Array(size).fill(0).map((_, row) => 
      Array(size).fill(0).map((_, col) => {
        const index = row * size + col;
        if (index === differentSquare) {
          return (baseColor + colorDifference) % 360;
        }
        return baseColor;
      })
    );
  }

  const startGame = () => {
    setIsGameStarted(true)
    setLevel(1)
    setScore(0)
    setGameOver(false)
    setGrid(generateGrid(1))
    setGameState('playing')
  }

  const handleSquareClick = (row: number, col: number) => {
    setTotalAttempts(prev => prev + 1)
    const size = grid.length;
    const flatGrid = grid.flat();
    const clickedColor = grid[row][col];
    const baseColor = flatGrid.find(color => 
      flatGrid.filter(c => c === color).length === (size * size - 1)
    );

    if (clickedColor !== baseColor) {
      // 正确点击
      setCorrectAnswers(prev => prev + 1)
      setScore(score + level)
      setLevel(level + 1)
      setGrid(generateGrid(level + 1))
    } else {
      // 错误点击
      setGameOver(true)
      setGameState('result')
    }
  }

  useEffect(() => {
    if (isIframe) {
      if (gameState === 'result') {
        window.parent.postMessage({
          type: 'testComplete',
          results: {
            score: correctAnswers,
            totalAttempts: totalAttempts,
            accuracy: (correctAnswers / totalAttempts * 100).toFixed(1)
          }
        }, '*')
      }
    }
  }, [isIframe, gameState, correctAnswers, totalAttempts])

  return (
    <div className="w-full mx-auto py-0 space-y-16">
      <div className="banner w-full h-[550px] flex flex-col justify-center items-center" 
           style={{ backgroundColor: 'rgb(43, 135, 209)' }}>
        {!isGameStarted && (
          <div className="flex flex-col justify-center items-center">
            <FaPalette className="text-9xl text-white mb-8 animate-fade" />
            <h1 className="text-4xl font-bold text-center mb-4 text-white">{t("h2")}</h1>
            <p className="text-lg text-center mb-20 text-white">{t("description")}</p>
          </div>
        )}

        <div className="w-full max-w-md text-center">
          {!isGameStarted ? (
            <div className="flex gap-4 justify-center items-center">
            <Button 
              onClick={startGame}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg shadow-md hover:bg-blue-700 transition-colors"
            >
              {t("clickToStart")}
            </Button>
            {!isIframe && (
              <Button
                className="bg-yellow-600 text-white px-6 py-3 rounded-lg shadow-md hover:bg-yellow-700 transition-colors"
                onClick={() => setShowEmbedDialog(true)}
              >
                 <i className="fas fa-code mr-2" />
                {te('button')}
              </Button>
            )}
            </div>
          ) : (
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <div className="mb-4">
                <span className="text-xl font-bold">Level: {level}</span>
                <span className="text-xl font-bold ml-4">Score: {score}</span>
              </div>
              
              {!gameOver && (
                <div className="grid gap-1" 
                     style={{ gridTemplateColumns: `repeat(${grid.length}, minmax(0, 1fr))` }}>
                  {grid.map((row, i) => 
                    row.map((hue, j) => (
                      <button
                        key={`${i}-${j}`}
                        onClick={() => handleSquareClick(i, j)}
                        className="aspect-square rounded-sm transition-colors"
                        style={{ backgroundColor: `hsl(${hue}, 50%, 50%)` }}
                      />
                    ))
                  )}
                </div>
              )}

              {gameOver && (
                <div className="mt-4">
                  <p className="text-xl mb-4">Game Over! Final Score: {score}</p>
                  <button 
                    onClick={startGame}
                    className="bg-blue-500 text-white px-6 py-2 rounded-lg shadow-md hover:bg-blue-600 transition-colors"
                  >
                    {t("tryAgain")}
                  </button>
                </div>
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