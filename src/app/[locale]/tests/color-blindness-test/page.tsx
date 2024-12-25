'use client'
import React, { useState } from 'react'
import { useTranslations } from 'next-intl';
import { FaEye, FaTrafficLight } from 'react-icons/fa';

export default function ColorBlindnessTest() {
  const [isGameStarted, setIsGameStarted] = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [score, setScore] = useState(0)
  const [isComplete, setIsComplete] = useState(false)
  
  const t = useTranslations('colorBlindness');

  // 测试题目数据
  const questions = [
    {
      number: '12',
      backgroundColor: 'rgb(245, 245, 235)',
      dots: [
        { color: 'rgb(233, 93, 93)', percentage: 60 },   // 红色点（数字）
        { color: 'rgb(186, 243, 186)', percentage: 40 }, // 浅绿色点（背景）
      ]
    },
    {
      number: '8',
      backgroundColor: 'rgb(245, 245, 235)',
      dots: [
        { color: 'rgb(93, 233, 93)', percentage: 60 },   // 绿色点（数字）
        { color: 'rgb(243, 186, 186)', percentage: 40 }, // 浅红色点（背景）
      ]
    },
    {
      number: '29',
      backgroundColor: 'rgb(245, 245, 235)',
      dots: [
        { color: 'rgb(215, 75, 75)', percentage: 60 },   // 深红色点（数字）
        { color: 'rgb(165, 215, 165)', percentage: 40 }, // 中绿色点（背景）
      ]
    },
    {
      number: '5',
      backgroundColor: 'rgb(245, 245, 235)',
      dots: [
        { color: 'rgb(75, 215, 75)', percentage: 60 },   // 深绿色点（数字）
        { color: 'rgb(215, 165, 165)', percentage: 40 }, // 浅红色点（背景）
      ]
    },
    {
      number: '3',
      backgroundColor: 'rgb(245, 245, 235)',
      dots: [
        { color: 'rgb(233, 93, 93)', percentage: 60 },   // 红色点（数字）
        { color: 'rgb(186, 243, 186)', percentage: 40 }, // 浅绿色点（背景）
      ]
    },
    {
      number: '15',
      backgroundColor: 'rgb(245, 245, 235)',
      dots: [
        { color: 'rgb(93, 233, 93)', percentage: 60 },   // 绿色点（数字）
        { color: 'rgb(243, 186, 186)', percentage: 40 }, // 浅红色点（背景）
      ]
    },
    {
      number: '74',
      backgroundColor: 'rgb(245, 245, 235)',
      dots: [
        { color: 'rgb(215, 75, 75)', percentage: 60 },   // 深红色点（数字）
        { color: 'rgb(165, 215, 165)', percentage: 40 }, // 中绿色点（背景）
      ]
    },
    {
      number: '6',
      backgroundColor: 'rgb(245, 245, 235)',
      dots: [
        { color: 'rgb(75, 215, 75)', percentage: 60 },   // 深绿色点（数字）
        { color: 'rgb(215, 165, 165)', percentage: 40 }, // 浅红色点（背景）
      ]
    },
    {
      number: '45',
      backgroundColor: 'rgb(245, 245, 235)',
      dots: [
        { color: 'rgb(233, 93, 93)', percentage: 60 },   // 红色点（数字）
        { color: 'rgb(186, 243, 186)', percentage: 40 }, // 浅绿色点（背景）
      ]
    },
    {
      number: '2',
      backgroundColor: 'rgb(245, 245, 235)',
      dots: [
        { color: 'rgb(93, 233, 93)', percentage: 60 },   // 绿色点（数字）
        { color: 'rgb(243, 186, 186)', percentage: 40 }, // 浅红色点（背景）
      ]
    }
  ]

  const handleAnswer = (answer: string) => {
    if (answer === questions[currentQuestion].number) {
      setScore(score + 1)
    }

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    } else {
      setIsComplete(true)
    }
  }

  const restart = () => {
    setCurrentQuestion(0)
    setScore(0)
    setIsComplete(false)
  }

  // 生成随机点的函数
  const generateDots = (count: number, colors: { color: string, percentage: number }[]) => {
    const dots = []
    for (let i = 0; i < count; i++) {
      // 使用极坐标系统来生成点
      const angle = Math.random() * 2 * Math.PI
      const radius = Math.sqrt(Math.random()) * 50 // 使用平方根来确保均匀分布
      
      // 转换为笛卡尔坐标
      const x = 50 + radius * Math.cos(angle)
      const y = 50 + radius * Math.sin(angle)

      const randomColor = Math.random() * 100
      let selectedColor = colors[0].color
      let currentPercentage = 0
      
      for (const color of colors) {
        currentPercentage += color.percentage
        if (randomColor <= currentPercentage) {
          selectedColor = color.color
          break
        }
      }

      dots.push({
        left: `${x}%`,
        top: `${y}%`,
        color: selectedColor,
      })
    }
    return dots
  }

  return (
    <div className="w-full mx-auto py-0 space-y-16">
      <div className="banner w-full h-[550px] flex flex-col justify-center items-center bg-white dark:bg-gray-900">
        {!isGameStarted && (
          <div className="flex flex-col justify-center items-center">
            <FaTrafficLight className="text-9xl text-gray-800 dark:text-white mb-8 animate-fade" />
            <h1 className="text-4xl font-bold text-center mb-4 text-gray-800 dark:text-white">{t("h2")}</h1>
            <p className="text-lg text-center mb-20 text-gray-600 dark:text-gray-300">{t("description")}</p>
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
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
              {!isComplete ? (
                <>
                  <div className="mb-4">
                    <span className="text-xl font-bold text-gray-800 dark:text-white">
                      {t("question")} {currentQuestion + 1}/{questions.length}
                    </span>
                  </div>
                  
                  <div 
                    className="relative w-72 h-72 mx-auto rounded-full mb-6 overflow-hidden"
                    style={{ backgroundColor: questions[currentQuestion].backgroundColor }}
                  >
                    {generateDots(2000, questions[currentQuestion].dots).map((dot, index) => (
                      <div
                        key={index}
                        className="absolute w-1.5 h-1.5 rounded-full"
                        style={{
                          left: dot.left,
                          top: dot.top,
                          backgroundColor: dot.color,
                          transform: 'translate(-50%, -50%)'
                        }}
                      />
                    ))}
                  </div>

                  <div className="grid grid-cols-5 gap-2">
                    {['2', '3', '5', '6', '8', '12', '15', '29', '45', '74'].map((number) => (
                      <button
                        key={number}
                        onClick={() => handleAnswer(number)}
                        className="bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 py-2 rounded text-gray-800 dark:text-white"
                      >
                        {number}
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <div className="mt-4">
                  <p className="text-xl mb-4 text-gray-800 dark:text-white">
                    {t("finalScore")}: {score}/{questions.length}
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
              <h2 className="text-xl mb-4 font-semibold text-gray-800 dark:text-white">{t("statisticsTitle")}</h2>
            </div>
            <div className="w-full h-[400px]">
              <h2 className="text-xl mb-4 font-semibold text-gray-800 dark:text-white">{t("aboutTitle")}</h2>
              <p className="text-gray-600 dark:text-gray-300" 
                 dangerouslySetInnerHTML={{ __html: t("about")?.replace(/\n/g, '<br />') || '' }}>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 