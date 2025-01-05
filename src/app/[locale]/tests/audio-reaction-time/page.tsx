'use client'
import { useState, useEffect, useRef } from 'react'
import { useTranslations } from 'next-intl'
import Image from 'next/image'
import { FaVolumeUp, FaHourglassStart, FaExclamationTriangle, FaPlay, FaCheck } from 'react-icons/fa'
import SharePoster from '@/components/SharePoster'
import { useSearchParams } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Copy } from 'lucide-react'
import { EmbedDialog } from '@/components/EmbedDialog'
import '@fortawesome/fontawesome-free/css/all.min.css';

interface RankingResult {
  reactionTime: number;
  timestamp: number;
}

export default function AudioReactionTime() {
  const t = useTranslations('audioReaction')
  const te = useTranslations('embed')
  
  const searchParams = useSearchParams()
  const isIframe = searchParams.get('embed') === 'true'
  const [showEmbedDialog, setShowEmbedDialog] = useState(false)
  const [embedUrl, setEmbedUrl] = useState('')
  const [gameState, setGameState] = useState<'waiting' | 'ready' | 'toosoon' | 'testing' | 'result'>('waiting')
  const [startTime, setStartTime] = useState(0)
  const [reactionTime, setReactionTime] = useState(0)
  const [reactionTimes, setReactionTimes] = useState<number[]>([])
  const [results, setResults] = useState<{
    regionalRanking: { name: string; data: RankingResult[] };
    nationalRanking: { name: string; data: RankingResult[] };
    globalRanking: { name: string; data: RankingResult[] };
    cityRanking: { name: string; data: RankingResult[] };
  }>({
    regionalRanking: { name: '', data: [] },
    nationalRanking: { name: '', data: [] },
    globalRanking: { name: '', data: [] },
    cityRanking: { name: '', data: [] }
  })
  const [averageTime, setAverageTime] = useState(0)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const audioContext = useRef<AudioContext | null>(null)
  const [showSharePoster, setShowSharePoster] = useState(false)

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
        setReactionTimes(prev => [...prev, time])
        setGameState('result')
        try {
          const response = await fetch('/api/audio-reaction-time', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
              reactionTime: time,
              // 如果有用户ID，可以传入
              // userId: currentUser?.id 
            }),
          })

          if (!response.ok) {
            throw new Error('Failed to save result')
          }
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
    if (reactionTimes.length > 0) {
      setAverageTime(reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length)
    }
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  }, [reactionTimes])

  const fetchRankings = async () => {
    try {
      const response = await fetch('/api/audio-reaction-time')
      const data = await response.json()
      setResults({
        regionalRanking: { name: data.rankings.regional.name, data: data.rankings.regional.data },
        nationalRanking: { name: data.rankings.national.name, data: data.rankings.national.data },
        globalRanking: { name: data.rankings.global.name, data: data.rankings.global.data },
        cityRanking: { name: data.rankings.city.name, data: data.rankings.city.data }
      })
    } catch (error) {
      console.error('Error fetching rankings:', error)
    }
  }

  useEffect(() => {
    fetchRankings()
    const interval = setInterval(fetchRankings, 60000)
    return () => clearInterval(interval)
  }, [])

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
          description: t("click"), 
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
          message: t("waitForBeep"),
          description: t("click"), 
          icon: <FaHourglassStart className="text-9xl text-white mb-8 animate-fade" />
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

  const calculateRankInfo = () => {
    const allTimes = results.globalRanking.data.map(r => r.reactionTime)
    const currentRank = allTimes.findIndex(time => time > reactionTime) + 1
    return {
      rank: currentRank || allTimes.length + 1,
      totalUsers: allTimes.length || 1
    }
  }

  const { rank, totalUsers } = calculateRankInfo()

  const renderResultActions = () => {
    if (gameState !== 'result') return null;

    return (
      <div className="flex gap-4 mt-6">
        <button
          onClick={() => setGameState('ready')}
          className="bg-blue-500 text-white py-2 px-6 rounded hover:bg-blue-600"
        >
          {t('tryAgain')}
        </button>
        <button
          onClick={() => setShowSharePoster(true)}
          className="bg-green-500 text-white py-2 px-6 rounded hover:bg-green-600"
        >
          {t('share')}
        </button>

        <SharePoster
          reactionTime={reactionTime}
          rank={rank}
          totalUsers={totalUsers}
          isOpen={showSharePoster}
          testType="audio"
          title={t("poster.title")}
          onClose={() => setShowSharePoster(false)}
        />
      </div>
    )
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
            reactionTime,
            averageTime,
            rank,
            totalUsers
          }
        }, '*')
      }

      return () => {
        observer.disconnect()
      }
    }
  }, [isIframe, gameState, reactionTime, averageTime, rank, totalUsers])

  return (
    <div className="w-full mx-auto py-0 space-y-16">
      <div className={`
        banner w-full h-[550px] flex flex-col justify-center items-center bg-blue-theme
        
        transition-all duration-300 cursor-pointer user-select-none
      `} 
      onClick={handleClick}>
        {icon}
        <h1 className="text-7xl font-bold text-center mb-4 text-white user-select-none" 
            dangerouslySetInnerHTML={{ __html: message }} />
        <p className="text-3xl text-center mb-20 text-white user-select-none" 
           dangerouslySetInnerHTML={{ __html: description?.replace(/\n/g, '<br />')  || ''}} />
           {renderResultActions()}
           {!isIframe && gameState === 'waiting' && (
        <Button
        className="bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-3"
        onClick={() => setShowEmbedDialog(true)}
      >
        <i className="fas fa-code mr-2" />
        {te('button')}
      </Button>
      )}
      </div>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="space-y-8">
          <h2 className="text-3xl font-bold text-center mb-8 relative pb-3 after:content-[''] after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-24 after:h-1 after:bg-blue-500 after:rounded-full">
            {t("rankingTitle")}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* 地区排名 */}
            <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <h3 className="text-xl font-bold mb-6 pb-2 border-b border-gray-200 text-gray-800">
                {results.cityRanking.name}
              </h3>
              <div className="space-y-3">
                {results.regionalRanking.data?.map((result, index) => (
                  <div 
                    key={`regional-${index}`} 
                    className={`flex justify-between items-center p-2 rounded-lg
                      ${index === 0 ? 'bg-yellow-50' : 
                        index === 1 ? 'bg-gray-50' : 
                        index === 2 ? 'bg-orange-50' : 'hover:bg-gray-50'}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`w-6 h-6 flex items-center justify-center rounded-full 
                        ${index === 0 ? 'bg-yellow-500' : 
                          index === 1 ? 'bg-gray-400' : 
                          index === 2 ? 'bg-orange-500' : 'bg-gray-200'} 
                        text-white text-sm font-medium`}>
                        {index + 1}
                      </span>
                      <span className="font-medium text-gray-800">{result.reactionTime}ms</span>
                    </div>
                    <span className="text-gray-500 text-sm">
                      {new Date(result.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                ))}
                {results.regionalRanking.data.length === 0 && (
                  <div className="text-center text-gray-500 py-4">
                    {t("noData")}
                  </div>
                )}
              </div>
            </div>

            {/* 国家排名 */}
            <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <h3 className="text-xl font-bold mb-6 pb-2 border-b border-gray-200 text-gray-800">
                {results.nationalRanking.name}
              </h3>
              <div className="space-y-3">
                {results.nationalRanking.data?.map((result, index) => (
                  <div 
                    key={`national-${index}`} 
                    className={`flex justify-between items-center p-2 rounded-lg
                      ${index === 0 ? 'bg-yellow-50' : 
                        index === 1 ? 'bg-gray-50' : 
                        index === 2 ? 'bg-orange-50' : 'hover:bg-gray-50'}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`w-6 h-6 flex items-center justify-center rounded-full 
                        ${index === 0 ? 'bg-yellow-500' : 
                          index === 1 ? 'bg-gray-400' : 
                          index === 2 ? 'bg-orange-500' : 'bg-gray-200'} 
                        text-white text-sm font-medium`}>
                        {index + 1}
                      </span>
                      <span className="font-medium text-gray-800">{result.reactionTime}ms</span>
                    </div>
                    <span className="text-gray-500 text-sm">
                      {new Date(result.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                ))}
                {results.nationalRanking.data.length === 0 && (
                  <div className="text-center text-gray-500 py-4">
                    {t("noData")}
                  </div>
                )}
              </div>
            </div>

            {/* 全球排名 */}
            <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <h3 className="text-xl font-bold mb-6 pb-2 border-b border-gray-200 text-gray-800">
                {results.globalRanking.name}
              </h3>
              <div className="space-y-3">
                {results.globalRanking.data?.map((result, index) => (
                  <div 
                    key={`global-${index}`} 
                    className={`flex justify-between items-center p-2 rounded-lg
                      ${index === 0 ? 'bg-yellow-50' : 
                        index === 1 ? 'bg-gray-50' : 
                        index === 2 ? 'bg-orange-50' : 'hover:bg-gray-50'}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`w-6 h-6 flex items-center justify-center rounded-full 
                        ${index === 0 ? 'bg-yellow-500' : 
                          index === 1 ? 'bg-gray-400' : 
                          index === 2 ? 'bg-orange-500' : 'bg-gray-200'} 
                        text-white text-sm font-medium`}>
                        {index + 1}
                      </span>
                      <span className="font-medium text-gray-800">{result.reactionTime}ms</span>
                    </div>
                    <span className="text-gray-500 text-sm">
                      {new Date(result.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                ))}
                {results.globalRanking.data.length === 0 && (
                  <div className="text-center text-gray-500 py-4">
                    {t("noData")}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
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
      <EmbedDialog 
        isOpen={showEmbedDialog}
        onClose={() => setShowEmbedDialog(false)}
        embedUrl={embedUrl}
      />
      
      <SharePoster
        reactionTime={reactionTime}
        rank={rank}
        totalUsers={totalUsers}
        isOpen={showSharePoster}
        testType="audio"
        title={t("poster.title")}
        onClose={() => setShowSharePoster(false)}
      />
    </div>
  )
} 