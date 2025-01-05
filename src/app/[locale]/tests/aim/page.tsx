'use client'
import React, { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import '@fortawesome/fontawesome-free/css/all.min.css';
import Image from 'next/image'
import { useSearchParams } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Copy } from 'lucide-react'
import { EmbedDialog } from '@/components/EmbedDialog'

export default function AimTrainerTest() {
  const [gameState, setGameState] = useState<'start' | 'playing' | 'result'>('start')
  const [targetPosition, setTargetPosition] = useState<{ x: number, y: number } | null>(null)
  const [stats, setStats] = useState({
    totalClicks: 0,
    correctClicks: 0,
    reactionTimes: [] as number[]
  })

  const [remainingCount, setRemainingCount] =useState(30)
  const [lastClickTime, setLastClickTime] = useState(0)

  const t =  useTranslations('aim');
  const te = useTranslations('embed');
  
  const searchParams = useSearchParams()
  const isIframe = searchParams.get('embed') === 'true'
  const [showEmbedDialog, setShowEmbedDialog] = useState(false)
  const [embedUrl, setEmbedUrl] = useState('')

  const startGame = () => {
    setGameState('playing')
    setStats({ totalClicks: 0, correctClicks: 0, reactionTimes: [] })
    setRemainingCount(30)
    setLastClickTime(performance.now())
    generateTarget()
  }

  const generateTarget = () => {
    const bannerHeight = 550; // banner 的高度
    const navHeight = 65; // 假设导航区域的高度为 60 像素
    const bannerWidth = window.innerWidth; // banner 的宽度

    const x = Math.random() * (bannerWidth - 100); // 100 是图标的宽度
    const y = Math.random() * (bannerHeight - navHeight - 100); // 100 是图标的高度
    console.log('Target generated at:', { x, y: y + navHeight })
    setTargetPosition({ x, y: y + navHeight })
  }

  const handleTargetClick = (e: React.MouseEvent) => {
    console.log('Click event triggered')
    
    e.preventDefault()
    e.stopPropagation()

    if (gameState !== 'playing' || !targetPosition) {
      console.log('Invalid game state or no target')
      return
    }

    const { clientX, clientY } = e
    const targetRect = e.currentTarget.getBoundingClientRect()
    
    console.log('Click coordinates:', { clientX, clientY })
    console.log('Target rect:', targetRect)
    console.log('Target position:', targetPosition)

    const isHit = 
      clientX >= targetRect.left && 
      clientX <= targetRect.right && 
      clientY >= targetRect.top && 
      clientY <= targetRect.bottom

    console.log('Is hit:', isHit)

    const updatedStats = { 
      ...stats, 
      totalClicks: stats.totalClicks + 1 
    }

    if (isHit) {
      const currentTime = performance.now()
      const reactionTime = currentTime - lastClickTime
      updatedStats.correctClicks += 1
      updatedStats.reactionTimes.push(reactionTime)
      setLastClickTime(currentTime)
      
      if (remainingCount > 0) {
        setRemainingCount(remainingCount - 1)
      }
      generateTarget()
    }

    setStats(updatedStats)

    if (updatedStats.totalClicks >= 30) {
      endGame()
    }
  }

  const endGame = () => {
    setGameState('result')
  }

  const calculateAverageReactionTime = () => {
    const { reactionTimes } = stats
    return reactionTimes.length 
      ? (reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length).toFixed(2)
      : '0'
  }

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
            totalClicks: stats.totalClicks,
            correctClicks: stats.correctClicks,
            accuracy: ((stats.correctClicks / stats.totalClicks) * 100).toFixed(1),
            averageReactionTime: stats.reactionTimes.length > 0 
              ? Math.round(stats.reactionTimes.reduce((a, b) => a + b) / stats.reactionTimes.length)
              : 0
          }
        }, '*')
      }

      return () => {
        observer.disconnect()
      }
    }
  }, [isIframe, gameState, stats])

  return (
    <div 
      className="w-full mx-auto py-0 space-y-16 "
    >
      <div className="banner w-full h-[550px] flex flex-col justify-center items-center bg-blue-theme">
       
        {gameState === 'start' && (
          <div className='flex flex-col justify-center items-center'>
            <i className="fas fa-bullseye text-9xl text-white mb-8 animate-fade cursor-pointer" onClick={startGame} ></i>
            <h1 className="text-4xl font-bold text-center mb-4 text-white">{t("h2")}</h1>
            <p className="text-lg text-center mb-20 text-white" dangerouslySetInnerHTML={{ __html: t("description")?.replace(/\n/g, '<br />')  || ''}} ></p>
            {!isIframe && (
       <Button
       className="bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-3"
       onClick={() => setShowEmbedDialog(true)}
     >
       <i className="fas fa-code mr-2" />
       {te('button')}
     </Button>
      )}
          </div>
          )}

        {gameState === 'playing' && targetPosition && (
          <div className='flex flex-col justify-center items-center text-white'>
          <div 
            onClick={handleTargetClick}
            className='animate-fade'
            style={{
              position: 'absolute', 
              left: `${targetPosition.x}px`, 
              top: `${targetPosition.y}px`, 
              width: '100px', 
              height: '100px', 
              cursor: 'pointer',
              zIndex: 1000 // 确保在最上层
            }}
          >
            <i className="fas fa-bullseye text-white" style={{ fontSize: '100px' }}></i>
          </div>
          <h2 className="text-2xl font-bold mb-4">Remaining {remainingCount}</h2>
          </div>
        )}

        {gameState === 'result' && (
          <div className="text-center text-white">
            <i className="fas fa-bullseye text-9xl text-white mb-8 animate-fade cursor-pointer"></i>
            <h2 className="text-2xl font-bold mb-4">Average time per target</h2>
            <h1  className="text-5xl font-bold mb-4">{calculateAverageReactionTime()}ms</h1>
            <button 
              onClick={() => setGameState('start')}
              className="mt-4 bg-blue-600 text-white px-6 py-3 rounded-lg shadow-md hover:bg-blue-700 transition-colors"
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
            src='/aim-statistics.png' 
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
        <EmbedDialog 
        isOpen={showEmbedDialog}
        onClose={() => setShowEmbedDialog(false)}
        embedUrl={embedUrl}
      />
        </div>
      </div>
      

      {/* {gameState === 'playing' && (
        <div className="absolute top-4 right-4">
          <p>总点击数: {stats.totalClicks}</p>
          <p>正确点击: {stats.correctClicks}</p>
        </div>
      )} */}

      
    </div>
  )
} 