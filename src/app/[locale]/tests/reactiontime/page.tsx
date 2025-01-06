'use client'
import { useState, useEffect, useRef } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import Image from 'next/image'
import '@fortawesome/fontawesome-free/css/all.min.css';
import { Description } from '@radix-ui/react-dialog'
import SharePoster from '@/components/SharePoster'
import { useSearchParams } from 'next/navigation'
import { EmbedDialog } from '@/components/EmbedDialog'
import { Button } from '@/components/ui/button';

interface RankingResult {
  reactionTime: number;
  timestamp: number;
}

export default function ReactionTime() {
  const t = useTranslations('reactionTime')
  const te = useTranslations('embed');
  const [gameState, setGameState] = useState<'waiting' | 'ready'|'toosoon' | 'testing' | 'result'>('waiting')
  const [startTime, setStartTime] = useState(0)
  const [reactionTime, setReactionTime] = useState(0)
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
  const [bestTime, setBestTime] = useState(0)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const [isShareOpen, setIsShareOpen] = useState(false)
  const searchParams = useSearchParams()
  const isIframe = searchParams.get('embed') === 'true'
  const [embedUrl, setEmbedUrl] = useState('')
  const [showEmbedDialog, setShowEmbedDialog] = useState(false)

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
        setResults(prev => ({
          ...prev,
          regionalRanking: {
            ...prev.regionalRanking,
            data: [...prev.regionalRanking.data, { reactionTime: time, timestamp: Date.now() }]
          }
        }))
        setGameState('result')
        // 发送结果到后端
    try {
      const response = await fetch('/api/reaction-time', {
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
      // 可以添加用户友好的错误提示
    }
        break
      case 'result':
        setGameState('waiting')
        break
      default:
        handleStart()
    }
  }

  useEffect(() => {
    if (results.regionalRanking.data.length > 0) {
      const avg = results.regionalRanking.data.reduce((a, b) => a + b.reactionTime, 0) / results.regionalRanking.data.length;
      const best = Math.min(...results.regionalRanking.data.map(r => r.reactionTime));
      setAverageTime(avg);
      setBestTime(best);
    }
  }, [results]);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  }, [])

  const chartData = results.regionalRanking.data.map((result, index) => ({
    name: `Test ${index + 1}`,
    reactionTime: result.reactionTime
  }))

  const getGameStateMessage = () => {
    switch (gameState) {
      case 'waiting':
        return { message: t("h1"),description:t("description"), icon: 'fas fa-bolt' }
      case 'ready':
        return { message: t("waitForGreen"),description:'', icon: 'fas fa-hourglass-start' }
      case 'toosoon':
        return { message: t("tooSoon"),description:t("clickToTryAgain"), icon: 'fas fa-exclamation-triangle' }
      case 'testing':
        return { message: t("click"),description:'', icon: 'fas fa-play' }
      case 'result':
        return { message: `<h3>${t("reactionTime")}</h3>\r\n${reactionTime} ms`,description:t("tryAgain"), icon: 'fas fa-check' }
    }
  }

  const { message,description, icon } = getGameStateMessage();

  // 获取排名数据
  const fetchRankings = async () => {
    try {
      const response = await fetch('/api/reaction-time')
      const data = await response.json()
      setResults({
        regionalRanking: {
          name: data.rankings.regional.name,
          data: data.rankings.regional.data
        },
        nationalRanking: {
          name: data.rankings.national.name,
          data: data.rankings.national.data
        },
        globalRanking: {
          name: data.rankings.global.name,
          data: data.rankings.global.data
        },
        cityRanking: {
          name: data.rankings.city.name,
          data: data.rankings.city.data
        }
      })
    } catch (error) {
      console.error('Error fetching rankings:', error)
    }
  }

  useEffect(() => {
    fetchRankings()
    // 每分钟更新一次排名
    const interval = setInterval(fetchRankings, 60000)
    return () => clearInterval(interval)
  }, [])

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
            reactionTime: reactionTime,
            averageTime: averageTime,
            bestTime: bestTime
          }
        }, '*')
      }

      return () => {
        observer.disconnect()
      }
    }
  }, [isIframe, gameState, reactionTime, averageTime, bestTime])

  return (
    <div className="w-full mx-auto py-0 space-y-16 ">
        <div className={`
        banner w-full h-[550px] flex flex-col justify-center items-center 
          ${gameState === 'waiting' ? 'bg-blue-theme cursor-pointer' : 
            gameState === 'ready' ? 'bg-red-500 cursor-pointer' : 
            gameState === 'testing' ? 'bg-green-500 cursor-pointer hover:bg-green-600' : 
            'bg-blue-theme'}
          transition-all duration-300  cursor-pointer  user-select-none
          `} 
           onClick={handleClick}>
             <i className={`${icon} text-9xl text-white mb-8 animate-fade`}></i>
          <h1 className="text-7xl font-bold text-center mb-4 text-white user-select-none" 
              dangerouslySetInnerHTML={{ __html: message }} />
          <p className="text-3xl text-center mb-20 text-white user-select-none" 
             dangerouslySetInnerHTML={{ __html: description?.replace(/\n/g, '<br />')  || ''}} />
          
            <span className="text-white text-2xl font-bold">
              {/* {getGameStateMessage()} */}
            </span>
            <div className="flex gap-4 justify-center items-center">
            {!isIframe && gameState === 'waiting' && (
              <Button
                className="bg-yellow-600 text-white px-6 py-3 rounded-lg shadow-md hover:bg-yellow-700 transition-colors"
                onClick={() => setShowEmbedDialog(true)}
              >
                <i className="fas fa-code mr-2" />
                {te('button')}
              </Button>
            )}
            </div>

            {gameState === 'result' && (
              <div className="flex gap-4">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setGameState('waiting')
                  }}
                  className="mt-4 bg-blue-500 text-white px-6 py-2 rounded-lg 
                           hover:bg-blue-600 transition-colors duration-200
                           flex items-center gap-2"
                >
                  <i className="fas fa-redo"></i>
                  {t('tryAgain')}
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setIsShareOpen(true)
                  }}
                  className="mt-4 bg-green-500 text-white px-6 py-2 rounded-lg 
                           hover:bg-green-600 transition-colors duration-200
                           flex items-center gap-2"
                >
                  <i className="fas fa-share-alt"></i>
                  {t('share')}
                </button>
              </div>
            )}
        </div>
        {/* <div className='w-full px-2 pt-10 lg:w-1/2'>
          <Search />
        </div> */}
      <div className="container mx-auto py-0 space-y-16 ">
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
      </div>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div className="w-full h-[400px]">
            <h2 className="text-xl mb-4 font-semibold">{t("statisticsTitle")}</h2>
            <Image 
              src='/reactiontime-statistics.png' 
              alt='Reaction Time Test Statistics'
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

      <SharePoster
        reactionTime={reactionTime}
        rank={results.globalRanking.data.findIndex(r => r.reactionTime === reactionTime) + 1}
        totalUsers={results.globalRanking.data.length}
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        testType="visual"
        title={t("poster.title")}
      />

      <EmbedDialog 
        isOpen={showEmbedDialog}
        onClose={() => setShowEmbedDialog(false)}
        embedUrl={embedUrl}
      />

    </div>

   
  )
}
