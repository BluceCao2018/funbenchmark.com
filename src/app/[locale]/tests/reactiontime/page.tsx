'use client'
import { useState, useEffect, useRef } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import Image from 'next/image'
import '@fortawesome/fontawesome-free/css/all.min.css';
import { Description } from '@radix-ui/react-dialog'

export default function ReactionTime() {
  const t = useTranslations('reactionTime')
  const [gameState, setGameState] = useState<'waiting' | 'ready'|'toosoon' | 'testing' | 'result'>('waiting')
  const [startTime, setStartTime] = useState(0)
  const [reactionTime, setReactionTime] = useState(0)
  const [results, setResults] = useState<number[]>([])
  const [averageTime, setAverageTime] = useState(0)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

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
        setResults([...results, time])
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
    if (results.length > 0) {
      const avg = results.reduce((a, b) => a + b, 0) / results.length
      setAverageTime(avg)
    }
  }, [results])

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  }, [])

  const chartData = results.map((time, index) => ({
    name: `Test ${index + 1}`,
    reactionTime: time
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
        </div>
        {/* <div className='w-full px-2 pt-10 lg:w-1/2'>
          <Search />
        </div> */}
      <div className="container mx-auto py-0 space-y-16 ">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="grid md:grid-cols-2 gap-8 items-center">
        <div className="w-full h-[400px]">
          <h2  className="text-xl mb-4 font-semibold">{t("statisticsTitle")}</h2>
          <Image 
            src='/reactiontime-statistics.png' 
            alt='{t("statisticsTitle")}'
            className='w-full h-full' 
            width={400} 
            height={400}
          />
        </div>
        <div className="w-full h-[400px]">
          <h2  className="text-xl mb-4 font-semibold">{t("aboutTitle")}</h2>
          <p>
          {t("about")} </p>
        </div>
      </div>

      {/* <div className='py-12 mt-12'>
        <h2 className="text-xl mb-4 font-semibold">The results of others' Reaction Time Test</h2>
        <p>
        The result of Netizen A's Reaction Time Test is 235 milliseconds.
        The result of Netizen A's Reaction Time Test is 235 milliseconds.
        The result of Netizen A's Reaction Time Test is 235 milliseconds.
        The result of Netizen A's Reaction Time Test is 235 milliseconds.
        The result of Netizen A's Reaction Time Test is 235 milliseconds.
        The result of Netizen A's Reaction Time Test is 235 milliseconds.
        The result of Netizen A's Reaction Time Test is 235 milliseconds.
        The result of Netizen A's Reaction Time Test is 235 milliseconds.
        The result of Netizen A's Reaction Time Test is 235 milliseconds.
        The result of Netizen A's Reaction Time Test is 235 milliseconds.
        </p>
      </div> */}
      {/* <div className='py-12 mt-12'>
        <h2 className="text-xl mb-4 font-semibold">What's the function of Reaction Time Test?</h2>
        <p>
        Test your reaction time，and evaluate an individual's reaction ability.Help improve professional skills, such as those of e-sports players, pilots, surgeons.Assist in cognitive research, detect fatigue and stress levels, and so on.
        </p>
        <h2 className="mt-10 text-xl mb-4 font-semibold">How to use Reaction Time Test?</h2>
        <p>
        Click the green button to start the test. When the green button turns red, click as quickly as possible. The reaction time is the time from the red button turning green to the click.
        </p>
        <h2 className="mt-10 text-xl mb-4 font-semibold">What does the data of the Reaction Time Test mean?</h2>
        <p>
        The data of the Reaction Time Test only represents your current reaction time. You need to conduct regular tests and improve your reaction time.
        </p>
      </div> */}
    </div>
      </div>

    </div>

   
  )
}
