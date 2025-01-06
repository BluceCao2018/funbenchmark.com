'use client'
import React, { useState, useEffect, useRef } from 'react'
import { useTranslations } from 'next-intl'
import '@fortawesome/fontawesome-free/css/all.min.css';
import Image from 'next/image'
import { useSearchParams } from 'next/navigation'
import { EmbedDialog } from '@/components/EmbedDialog'

export default function TypingTest() {
  const [gameState, setGameState] = useState<'start' | 'playing' | 'result'>('start')
  const [currentText, setCurrentText] = useState<string>('')
  const [userInput, setUserInput] = useState<string>('')
  const [startTime, setStartTime] = useState<number>(0)
  const [errors, setErrors] = useState<number>(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [finalWPM, setFinalWPM] = useState<number>(0)
  const [finalTime, setFinalTime] = useState<number>(0)
  const [accuracy, setAccuracy] = useState<number>(100)

  const searchParams = useSearchParams()
  const isIframe = searchParams.get('embed') === 'true'
  const [embedUrl, setEmbedUrl] = useState('')
  const [showEmbedDialog, setShowEmbedDialog] = useState(false)

  const t =  useTranslations('typing');
  // 预定义的测试文本
  const sentences: string[] = t.raw("sentences");//JSON.parse(t.raw('sentences'));

  const startGame = () => {
    const randomText = sentences[Math.floor(Math.random() * sentences.length)]
    setCurrentText(randomText)
    setUserInput('')
    setErrors(0)
    setGameState('playing')
    setStartTime(Date.now())

    // 自动聚焦文本区域
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus()
      }
    }, 100)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setUserInput(value)

    // 计算错误数
    const errorCount = value.split('').filter((char, index) => char !== currentText[index]).length
    setErrors(errorCount)

    // 检查是否完成
    if (value === currentText) {
      endGame()
    }
  }

  const endGame = () => {
    const endTime = Date.now()
    const duration = (endTime - startTime) / 1000 // 秒
    const wordsPerMinute = Math.round((currentText.split(' ').length / duration) * 60)
    const accuracyValue = Math.max(0, Math.round(((currentText.length - errors) / currentText.length) * 100))
    
    // 保存最终速度和用时
    setFinalWPM(wordsPerMinute)
    setFinalTime(duration)
    setAccuracy(accuracyValue)
    setGameState('result')
  }

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (gameState === 'playing') {
      interval = setInterval(() => {
        setElapsedTime(Date.now() - startTime)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [gameState, startTime])

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
            wpm: finalWPM,
            accuracy: accuracy,
            errors: errors,
            time: finalTime
          }
        }, '*')
      }

      return () => {
        observer.disconnect()
      }
    }
  }, [isIframe, gameState, finalWPM, accuracy, errors, finalTime])

  return (
    <div className="w-full">
      <div className="w-full mx-auto py-0 space-y-16">
        <div className="banner w-full h-[550px] flex flex-col justify-center items-center bg-blue-theme text-white">
          {gameState === 'start' && (
            <div className='flex flex-col justify-center items-center'>
              <i className="fas fa-keyboard text-9xl text-white mb-8 animate-fade cursor-pointer" ></i>
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

          {gameState === 'playing' && (
            <div className="w-full max-w-2xl flex flex-col items-center">
              {/* WPM Display */}
              <div className="text-6xl font-bold mb-8">
                {Math.round((userInput.split(' ').length / ((Date.now() - startTime) / 1000)) * 60)}
                <span className="text-2xl ml-2">WPM</span>
              </div>

              {/* Text Area with white background */}
              <div 
                className="w-full h-[350px] bg-white rounded-lg shadow-lg p-8 mb-8 focus:outline-none overflow-auto"
                tabIndex={0}
                onKeyDown={(e) => {
                  e.preventDefault();
                  if (e.key.length === 1) {
                    const newInput = userInput + e.key;
                    setUserInput(newInput);
                    
                    // 添加自动滚动逻辑
                    const currentChar = document.querySelector('.border-b-2.border-black');
                    if (currentChar) {
                      currentChar.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                    
                    if (newInput === currentText) {
                      endGame();
                    }
                  } else if (e.key === 'Backspace') {
                    setUserInput(prev => prev.slice(0, -1));
                  }
                }}
                ref={inputRef}
              >
                <div className="mb-6 text-xl font-mono leading-relaxed text-black">
                  {currentText.split('').map((char, index) => {
                    let className = '';
                    if (index < userInput.length) {
                      className = userInput[index] === char ? 'bg-green-300' : 'bg-red-300 text-white';
                    } else if (index === userInput.length) {
                      className = 'border-b-2 border-black animate-pulse';
                    }
                    return (
                      <span 
                        key={index} 
                        className={className}
                      >
                        {char}
                      </span>
                    );
                  })}
                </div>
              </div>

              {/* Timer */}
              <div className="text-3xl font-mono">
                {Math.floor(((Date.now() - startTime) / 1000) / 60)}:
                {String(Math.floor(((Date.now() - startTime) / 1000) % 60)).padStart(2, '0')}
              </div>
            </div>
          )}

          {gameState === 'result' && (
            <div className="w-full max-w-2xl flex flex-col items-center">
              <i className="fas fa-keyboard text-9xl text-white mb-8 animate-fade cursor-pointer" ></i>
              <h2 className="text-2xl font-bold mb-4">{t("h2")}</h2>
              <div className="text-xl space-y-4">
                <p className="mb-2">
                  <span className="font-bold text-6xl">{finalWPM}</span> WPM
                </p>
                {/* <p className="mb-2">{t("errors")}: <span className="font-bold">{errors}</span></p>
                <p className="mb-2">{t("time")}: <span className="font-bold">
                  {Math.floor(finalTime / 60)}:
                  {String(Math.floor(finalTime % 60)).padStart(2, '0')}s
                </span></p> */}
              </div>
              <button 
                onClick={() => setGameState('start')}
                className="mt-8 bg-blue-600 text-white px-6 py-3 rounded-lg shadow-md hover:bg-blue-700 transition-colors"
              >
                {t("tryAgain")}
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="container mx-auto py-0 space-y-16">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="w-full h-[400px]">
              <h2  className="text-xl mb-4 font-semibold">{t("statisticsTitle")}</h2>
              <Image 
                src='/typing-statistics.png' 
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

      <EmbedDialog 
        isOpen={showEmbedDialog}
        onClose={() => setShowEmbedDialog(false)}
        embedUrl={embedUrl}
      />
    </div>
  )
} 