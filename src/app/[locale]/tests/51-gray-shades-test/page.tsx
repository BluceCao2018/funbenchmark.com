'use client'
import React, { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl';
import { FaAdjust } from 'react-icons/fa';
import { useSearchParams } from 'next/navigation'
import '@fortawesome/fontawesome-free/css/all.min.css'
import { Button } from "@/components/ui/button"
import { Copy } from 'lucide-react'
import { EmbedDialog } from '@/components/EmbedDialog'

export default function FiftyOneGrayShadesTest() {
  const [isGameStarted, setIsGameStarted] = useState(false)
  const [level, setLevel] = useState(1)
  const [score, setScore] = useState(0)
  const [isComplete, setIsComplete] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<number[]>([])
  
  const t = useTranslations('fiftyOneGrayShades');
  const te = useTranslations('embed');
  
  const searchParams = useSearchParams();
  const isIframe = searchParams.get('embed') === 'true';
  const [showEmbedDialog, setShowEmbedDialog] = useState(false);
  const [embedUrl, setEmbedUrl] = useState('');

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

      if (isComplete) {
        window.parent.postMessage({
          type: 'testComplete',
          results: {
            score,
            level,
            accuracy: ((score / level) * 100).toFixed(1)
          }
        }, '*')
      }

      return () => {
        observer.disconnect()
      }
    }
  }, [isIframe, isComplete, score, level])

  // 生成关卡数据，增加难度
  const generateLevel = (level: number) => {
    // 基础色值
    const baseGray = Math.floor(255 * (level / 51))
    
    // 随着关卡进展，差异值逐渐减小
    const difference = Math.max(30 - Math.floor(level / 3), 5) // 从30逐渐减小到5
    const halfDiff = difference / 2

    const colors = [
      Math.min(255, baseGray + difference),  // 最浅
      Math.min(255, baseGray + halfDiff),    // 中等
      baseGray                               // 最深
    ]
    
    // 打乱顺序显示，但保存原始的从浅到深顺序
    return {
      colors: colors.sort(() => Math.random() - 0.5),
      correctOrder: [...colors].sort((a, b) => b - a)  // 从浅到深排序
    }
  }

  const [currentLevel, setCurrentLevel] = useState(generateLevel(1))

  const handleSquareClick = (index: number) => {
    if (selectedOrder.includes(index)) {
      // 如果已经选择过，则取消选择
      setSelectedOrder(selectedOrder.filter(i => i !== index))
    } else {
      // 添加新选择
      const newOrder = [...selectedOrder, index]
      setSelectedOrder(newOrder)

      // 如果已经选择了3个，检查顺序是否正确
      if (newOrder.length === 3) {
        const orderedColors = newOrder.map(i => currentLevel.colors[i])
        // 检查是否按从浅到深排序
        const isCorrect = orderedColors.every((color, i) => 
          color === currentLevel.correctOrder[i]
        )

        setTimeout(() => {
          if (isCorrect) {
            if (level < 51) {
              setScore(score + 1)
              setLevel(level + 1)
              setCurrentLevel(generateLevel(level + 1))
              setSelectedOrder([])
            } else {
              setScore(score + 1)
              setIsComplete(true)
            }
          } else {
            // 错误选择，直接结束游戏
            setIsComplete(true)
          }
        }, 500)
      }
    }
  }

  const restart = () => {
    setLevel(1)
    setScore(0)
    setIsComplete(false)
    setCurrentLevel(generateLevel(1))
    setSelectedOrder([])
  }

  // 根据分数给出更详细的评价
  const getResult = (score: number) => {
    if (score >= 45) return t("result.exceptional") // 45-51 分
    if (score >= 35) return t("result.excellent")   // 35-44 分
    if (score >= 25) return t("result.good")        // 25-34 分
    if (score >= 15) return t("result.average")     // 15-24 分
    return t("result.needPractice")                 // 0-14 分
  }

  return (
    <div className="w-full mx-auto py-0 space-y-16">
      <div className="banner w-full h-[550px] flex flex-col justify-center items-center bg-blue-theme text-white">
        {!isGameStarted && (
          <div className="flex flex-col justify-center items-center">
            <FaAdjust className="text-9xl mb-8 animate-fade" />
            <h1 className="text-4xl font-bold text-center mb-4">{t("h2")}</h1>
            <p className="text-lg text-center mb-20">{t("description")}</p>
          </div>
        )}

        <div className="flex flex-col justify-center items-center">
          {!isGameStarted ? (
            <div className="flex gap-4">
              <Button 
                onClick={() => setIsGameStarted(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3"
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
              {!isComplete ? (
                <>
                  <div className="mb-4">
                    <span className="text-xl font-bold text-gray-800">
                      {t("level")} {level}/51
                    </span>
                    <span className="text-xl font-bold text-gray-800 ml-4">
                      {t("score")}: {score}
                    </span>
                  </div>
                  
                  <div className="flex justify-center gap-4 mb-4">
                    {currentLevel.colors.map((color, index) => (
                      <button
                        key={index}
                        onClick={() => handleSquareClick(index)}
                        className={`w-24 h-24 md:w-32 md:h-32 rounded-lg transition-all duration-200 ${
                          selectedOrder.includes(index) 
                            ? 'ring-4 ring-blue-500' 
                            : 'hover:scale-105'
                        }`}
                        style={{
                          backgroundColor: `rgb(${color}, ${color}, ${color})`
                        }}
                      >
                        {selectedOrder.includes(index) && (
                          <div className="w-full h-full flex items-center justify-center text-white text-2xl font-bold">
                            {selectedOrder.indexOf(index) + 1}
                          </div>
                        )}
                      </button>
                    ))}
                  </div>

                  <p className="text-sm text-gray-600 mt-4">
                    {t("clickInstruction")}
                  </p>
                </>
              ) : (
                <div className="mt-4">
                  <p className="text-xl mb-4 text-gray-800">
                    {t("finalScore")}: {score}/51
                  </p>
                  <p className="text-lg mb-4 text-gray-600">
                    {getResult(score)}
                  </p>
                  <p className="text-sm mb-4 text-gray-500">
                    {t("reachedLevel")}: {level}
                  </p>
                  <button 
                    onClick={restart}
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
              <h2 className="text-xl mb-4 font-semibold text-gray-800">{t("statisticsTitle")}</h2>
            </div>
            <div className="w-full h-[400px]">
              <h2 className="text-xl mb-4 font-semibold text-gray-800">{t("aboutTitle")}</h2>
              <p className="text-gray-600" 
                 dangerouslySetInnerHTML={{ __html: t("about")?.replace(/\n/g, '<br />') || '' }}>
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