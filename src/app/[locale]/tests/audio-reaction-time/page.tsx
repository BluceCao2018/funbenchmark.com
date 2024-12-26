'use client'
import { useState, useEffect, useRef } from 'react'
import { useTranslations } from 'next-intl'
import Image from 'next/image'
import { FaVolumeUp, FaHourglassStart, FaExclamationTriangle, FaPlay, FaCheck } from 'react-icons/fa'

export default function AudioReactionTime() {
  const t = useTranslations('audioReaction')
  const [gameState, setGameState] = useState<'waiting' | 'ready' | 'toosoon' | 'testing' | 'result'>('waiting')
  const [startTime, setStartTime] = useState(0)
  const [reactionTime, setReactionTime] = useState(0)
  const [results, setResults] = useState<number[]>([])
  const [averageTime, setAverageTime] = useState(0)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const audioContext = useRef<AudioContext | null>(null)

  const playBeep = () => {
    if (!audioContext.current) {
      audioContext.current = new AudioContext()
    }
    
    const oscillator = audioContext.current.createOscillator()
    const gainNode = audioContext.current.createGain()
    
    oscillator.connect(gainNode)
    gainNode.connect(audioContext.current.destination)
    
    oscillator.frequency.value = 1000 // 1000Hz beep
    gainNode.gain.value = 0.1 // 音量控制
    
    oscillator.start()
    oscillator.stop(audioContext.current.currentTime + 0.1) // 播放100ms
  }

  const handleStart = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
    }

    if (gameState === 'waiting') {
      setGameState('ready')
      const delay = Math.random() * 4000 + 1000 
      timerRef.current = setTimeout(() => {
        setGameState('testing')
        setStartTime(Date.now())
        playBeep()
        timerRef.current = null
      }, delay)
    }
  }

  const handleClick = async () => {
    const clearTime = Date.now()
    
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }

    switch (gameState) {
      case 'ready':
        setGameState('toosoon')
        break
      case 'toosoon':
        setGameState('waiting')
        break
      case 'testing':
        const endTime = Date.now()
        const time = endTime - startTime - (endTime - clearTime)
        setReactionTime(time)
        setResults([...results, time])
        setGameState('result')
        try {
          await fetch('/api/audio-reaction-time', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ reactionTime: time }),
          })
        } catch (error) {
          console.error('Error saving result:', error)
        }
        break
      case 'result':
        setGameState('ready')
        const delay = Math.random() * 4000 + 1000 
        timerRef.current = setTimeout(() => {
          setGameState('testing')
          setStartTime(Date.now())
          playBeep()
          timerRef.current = null
        }, delay)
        break
      default:
        handleStart()
    }
  }

  useEffect(() => {
    if (results.length > 0) {
      setAverageTime(results.reduce((a, b) => a + b, 0) / results.length)
    }
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  }, [results])

  const getGameStateMessage = () => {
    switch (gameState) {
      case 'waiting':
        return { 
          message: t("h1"),
          description: t("description"), 
          icon: <FaVolumeUp className="text-9xl text-white mb-8 animate-fade" />
        }
      case 'ready':
        return { 
          message: t("waitForBeep"),
          description: '', 
          icon: <FaHourglassStart className="text-9xl text-white mb-8 animate-fade" />
        }
      case 'toosoon':
        return { 
          message: t("tooSoon"),
          description: t("clickToTryAgain"), 
          icon: <FaExclamationTriangle className="text-9xl text-white mb-8 animate-fade" />
        }
      case 'testing':
        return { 
          message: t("click"),
          description: '', 
          icon: <FaPlay className="text-9xl text-white mb-8 animate-fade" />
        }
      case 'result':
        return { 
          message: `${t("reactionTime")}\n${reactionTime} ms`,
          description: t("tryAgain"), 
          icon: <FaCheck className="text-9xl text-white mb-8 animate-fade" />
        }
    }
  }

  const { message, description, icon } = getGameStateMessage()

  return (
    <div className="w-full mx-auto py-0 space-y-16">
      <div className={`
        banner w-full h-[550px] flex flex-col justify-center items-center 
        ${gameState === 'waiting' ? 'bg-blue-theme' : 
          gameState === 'ready' ? 'bg-yellow-500' : 
          gameState === 'testing' ? 'bg-purple-500' : 
          'bg-blue-theme'}
        transition-all duration-300 cursor-pointer user-select-none
      `} 
      onClick={handleClick}>
        {icon}
        <h1 className="text-7xl font-bold text-center mb-4 text-white user-select-none">
          {message}
        </h1>
        <p className="text-3xl text-center mb-20 text-white user-select-none">
          {description}
        </p>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div className="w-full h-[400px]">
            <h2 className="text-xl mb-4 font-semibold">{t("statisticsTitle")}</h2>
            <Image 
              src='/audio-reactiontime-statistics.png' 
              alt='Audio Reaction Time Statistics'
              className='w-full h-full' 
              width={400} 
              height={400}
            />
          </div>
          <div className="w-full h-[400px]">
            <h2 className="text-xl mb-4 font-semibold">{t("aboutTitle")}</h2>
            <p>{t("about")}</p>
          </div>
        </div>
      </div>
    </div>
  )
} 