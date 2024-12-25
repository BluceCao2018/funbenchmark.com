'use client'
import React, { useState } from 'react'
import { useTranslations } from 'next-intl';
import { FaAdjust } from 'react-icons/fa';

export default function GrayShadesTest() {
  const [isGameStarted, setIsGameStarted] = useState(false)
  const [level, setLevel] = useState(1)
  const [score, setScore] = useState(0)
  const [isComplete, setIsComplete] = useState(false)
  
  const t = useTranslations('grayShades');

  // 生成关卡数据
  const generateLevel = (level: number) => {
    // 基础色值，从深到浅
    const baseGray = Math.floor(255 * (level / 51))
    // 差异值随关卡递减
    const difference = Math.max(50 - level, 3)
    
    // 生成四个方块的颜色，其中一个略有不同
    const colors = Array(4).fill(0).map(() => baseGray)
    const differentIndex = Math.floor(Math.random() * 4)
    colors[differentIndex] = Math.min(255, baseGray + difference)

    return {
      colors,
      correctIndex: differentIndex
    }
  }

  const [currentLevel, setCurrentLevel] = useState(generateLevel(1))

  const handleSquareClick = (index: number) => {
    if (index === currentLevel.correctIndex) {
      // 正确选择
      if (level < 51) {
        setScore(score + 1)
        setLevel(level + 1)
        setCurrentLevel(generateLevel(level + 1))
      } else {
        setIsComplete(true)
      }
    } else {
      // 错误选择
      setIsComplete(true)
    }
  }

  const restart = () => {
    setLevel(1)
    setScore(0)
    setIsComplete(false)
    setCurrentLevel(generateLevel(1))
  }

  return (
    <div className="w-full mx-auto py-0 space-y-16">
      <div className="banner w-full h-[550px] flex flex-col justify-center items-center bg-blue-theme text-white">
        {!isGameStarted && (
          <div className="flex flex-col justify-center items-center">
            <FaAdjust className="text-9xl mb-8 animate-fade" />
            <h1 className="text-4xl font-bold text-center mb-4">{t("h2")}</h1>
            <p className="text-lg text-center mb-20 ">{t("description")}</p>
          </div>
        )}

        <div className="w-full max-w-md text-center">
          {!isGameStarted ? (
            <button 
              onClick={() => setIsGameStarted(true)}
              className="bg-yellow-600 text-white px-6 py-3 rounded-lg shadow-md hover:bg-yellow-700 transition-colors"
            >
              {t("clickToStart")}
            </button>
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
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    {currentLevel.colors.map((color, index) => (
                      <button
                        key={index}
                        onClick={() => handleSquareClick(index)}
                        className="aspect-square rounded-lg transition-colors duration-200 hover:opacity-90"
                        style={{
                          backgroundColor: `rgb(${color}, ${color}, ${color})`
                        }}
                      />
                    ))}
                  </div>

                  <p className="text-sm text-gray-600 mt-4">
                    {t("findDifferent")}
                  </p>
                </>
              ) : (
                <div className="mt-4">
                  <p className="text-xl mb-4 text-gray-800">
                    {t("finalScore")}: {score}/51
                  </p>
                  <p className="text-lg mb-4 text-gray-600">
                    {score >= 45 ? t("excellent") :
                     score >= 35 ? t("good") :
                     score >= 25 ? t("average") :
                     t("needPractice")}
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
    </div>
  )
} 