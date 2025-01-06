'use client'
import React, { useState, useEffect, useCallback } from 'react'
import {getTranslations, getLocale} from 'next-intl/server';
import { useTranslations } from 'next-intl';
import '@fortawesome/fontawesome-free/css/all.min.css';
import Image from 'next/image'
import { useSearchParams } from 'next/navigation'
import { EmbedDialog } from '@/components/EmbedDialog'
import { Button } from '@/components/ui/button';


export default function SequenceMemoryTest() {
  const [sequence, setSequence] = useState<number[]>([])
  const [userSequence, setUserSequence] = useState<number[]>([])
  const [gameState, setGameState] = useState<'start' | 'show' | 'play' | 'result' | 'review'>('start')
  const [level, setLevel] = useState(1)
  const [score, setScore] = useState(0)
  const [isGameStarted, setIsGameStarted] = useState(false)

  const GRID_SIZE = 9
  const COLORS = {
    default: 'bg-gray-100 border-gray-300',
    highlight: 'bg-blue-500 border-blue-600',
    wrong: 'bg-red-500 border-red-600',
    correct: 'bg-green-500 border-green-600'
  }

  const t = useTranslations('sequence');
  const te = useTranslations('embed');

  const searchParams = useSearchParams()
  const isIframe = searchParams.get('embed') === 'true'
  const [embedUrl, setEmbedUrl] = useState('')
  const [showEmbedDialog, setShowEmbedDialog] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setEmbedUrl(`${window.location.origin}${window.location.pathname}?embed=true`)
    }
  }, [])

  useEffect(() => {
    if (isIframe) {
      const sendHeight = () => {
        const height = document.querySelector('.banner')?.scrollHeight
        if (height) {
          window.parent.postMessage({ type: 'resize', height }, '*')
        }
      }

      const observer = new ResizeObserver(sendHeight)
      const banner = document.querySelector('.banner')
      if (banner) {
        observer.observe(banner)
      }

      if (gameState === 'result') {
        window.parent.postMessage({
          type: 'testComplete',
          results: {
            level: level,
            score: score,
            sequence: sequence
          }
        }, '*')
      }

      return () => {
        observer.disconnect()
      }
    }
  }, [isIframe, gameState, level, score, sequence])

  const generateSequence = useCallback((length: number) => {
    const sequence = Array.from({ length }).map(() => Math.floor(Math.random() * GRID_SIZE));
    console.log(`Generated sequence for length ${length}:`, sequence);
    return sequence;
  }, []);


  const startGame = (level:number) => {
    setIsGameStarted(true)
    console.log(`Starting game at level: ${level}`)
    const newSequence = generateSequence(level)
    setSequence(newSequence)
    console.log(`New sequence generated:`, newSequence)
    setUserSequence([])
    setGameState('show')

    newSequence.forEach((index, i) => {
      setTimeout(() => {
        const grid = document.getElementById(`grid-${index}`)
        if (grid) {
          grid.style.backgroundColor = '#3b82f6'
          grid.style.borderColor = '#2563eb'
          
          setTimeout(() => {
            grid.style.backgroundColor = ''
            grid.style.borderColor = ''
            
            if (i === newSequence.length - 1) {
              setGameState('play')
            }
          }, 500)
        }
      }, i * 600)
    })
  }

  const handleGridClick = (index: number) => {
    if (gameState !== 'play') return

    const grid = document.getElementById(`grid-${index}`)
    
    if (grid) {
      grid.className = `aspect-square rounded-lg cursor-pointer transition-all duration-200 ease-in-out border-2 bg-green-500 border-green-600`

      setTimeout(() => {
        grid.className = `aspect-square rounded-lg cursor-pointer transition-all duration-200 ease-in-out border-2 ${COLORS.default}`
      }, 200)
    }

    const newUserSequence = [...userSequence, index]
    setUserSequence(newUserSequence)

    // Check if user's current sequence matches the original sequence
    const isCorrectSoFar = newUserSequence.every((val, idx) => val === sequence[idx])

    if (!isCorrectSoFar) {
      const wrongGrid = document.getElementById(`grid-${index}`)
      wrongGrid?.classList.add(...COLORS.wrong.split(' '))
      setTimeout(() => {
        wrongGrid?.classList.remove(...COLORS.wrong.split(' '))
        setGameState('result')
      }, 200)
      return
    }

    // If user has completed the full sequence
    if (newUserSequence.length === sequence.length) {
      console.info("score:"+score+",level:"+level)
      const newScore = score + 1;
      const newLevel = level + 1;
      setScore(newScore);
      setLevel(newLevel);
      console.info("after, score:", score, ", level:", level);
      setTimeout(() => startGame(newLevel), 1000)
    }
  }

  const reviewSequence = () => {
    setGameState('review')
    
    sequence.forEach((index, i) => {
      setTimeout(() => {
        const grid = document.getElementById(`grid-${index}`)
        if (grid) {
          grid.style.backgroundColor = '#3b82f6'
          grid.style.borderColor = '#2563eb'
          
          setTimeout(() => {
            grid.style.backgroundColor = ''
            grid.style.borderColor = ''
            
            if (i === sequence.length - 1) {
              // 回看完成后，可以选择返回结果页或重新开始
              setTimeout(() => {
                setGameState('result')
              }, 1000)
            }
          }, 500)
        }
      }, i * 600)
    })
  }

  
  return (
    <>
      <div className="w-full mx-auto py-0 space-y-16 ">
        <div className="banner w-full h-[550px] flex flex-col justify-center items-center" style={{ backgroundColor: 'rgb(43, 135, 209)' }}>
          {!isGameStarted && (
            <div className="flex flex-col justify-center items-center">
              <i className="fas fa-bolt text-9xl text-white mb-8 animate-fade"></i>
              <h1 className="text-4xl font-bold text-center mb-4 text-white">{t("h2")}</h1>
              <p className="text-lg text-center mb-20 text-white">{t("description")}</p>
            </div>
          )}
          
          <div className="w-full max-w-md text-center">
        {gameState === 'start' && (
          <div className="flex gap-4 justify-center items-center">
            <Button 
              onClick={() => startGame(1)} 
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
        )}

        {gameState === 'result' && (
          <div className='text-white'>
             <i className="fas fa-bolt text-9xl text-white mb-8 animate-fade"></i>
            <h2 className="text-2xl font-bold mb-4">{t("sequenceMemory")}</h2>
            <p className="text-7xl mb-6">Level <span className="font-bold">{level}</span></p>
            <div className="flex justify-center space-x-4">
              <button 
                onClick={() => {
                  // setGameState('start')
                  setScore(0)
                  setLevel(1)
                  startGame(1)
                }} 
                className="px-6 py-3 rounded-lg shadow-md bg-green-500 text-white hover:bg-green-700 transition-colors"
              >
                {t("restart")}
              </button>
              <button 
                onClick={reviewSequence}
                className="px-6 py-3 rounded-lg shadow-md bg-blue-500 text-white hover:bg-blue-700 transition-colors"
              >
                {t("review")}
              </button>
            </div>
          </div>
        )}

        {(gameState === 'show' || gameState === 'play' || gameState === 'review') && (
          <div>
            <div className="mb-4 font-bold text-white flex items-center justify-center">
              <span className='text-3xl'>Level :  </span>
              <span className="text-4xl"> {level}</span>
            </div>
            <div className="grid grid-cols-3 gap-3 rounded-xl shadow-lg p-4">
              {Array.from({ length: GRID_SIZE }).map((_, index) => (
                <div
                  key={index}
                  id={`grid-${index}`}
                  className={`aspect-square rounded-lg cursor-pointer transition-all duration-200 ease-in-out border-2 ${COLORS.default}`}
                  onClick={() => gameState === 'play' ? handleGridClick(index) : null}
                />
              ))}
            </div>
          </div>
        )}
      </div>

        </div>
     
        <div className="container mx-auto py-0 space-y-16 ">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="grid md:grid-cols-2 gap-8 items-center">
        <div className="w-full h-[400px]">
          <h2  className="text-xl mb-4 font-semibold">{t("statisticsTitle")}</h2>
          <Image 
            src='/sequence-statistics.png' 
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
    <EmbedDialog 
      isOpen={showEmbedDialog}
      onClose={() => setShowEmbedDialog(false)}
      embedUrl={embedUrl}
    />
    </>
  )
} 