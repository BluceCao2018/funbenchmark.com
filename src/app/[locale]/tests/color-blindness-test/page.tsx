'use client'
import React, { useState } from 'react'
import { useTranslations } from 'next-intl';
import { FaEye } from 'react-icons/fa';
import Image from 'next/image';

export default function ColorBlindnessTest() {
  const [isGameStarted, setIsGameStarted] = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [score, setScore] = useState(0)
  const [isComplete, setIsComplete] = useState(false)
  
  const t = useTranslations('colorBlindness');

  // 测试题目数据
  const questions = [
    {
      image: '/color-blindness-test/1.png',
      answer: 'A',
      options: ['8', 'A', 'B', 'dontKnow'],
      type: 'number'
    },
    {
      image: '/color-blindness-test/2.png',
      answer: t('answers.duck'),
      options: ['duck', 'bird', 'fish', 'dontKnow'],
      type: 'text'
    },
    {
      image: '/color-blindness-test/3.png',
      answer: '8',
      options: ['9', '6', '8', 'dontKnow'],
      type: 'number'
    },
    {
      image: '/color-blindness-test/4.png',
      answer: t('answers.sailboat'),
      options: ['sailboat', 'car', 'plane', 'dontKnow'],
      type: 'text'
    },
    {
      image: '/color-blindness-test/5.png',
      answer: t('answers.car'),
      options: ['sailboat', 'car', 'plane', 'dontKnow'],
      type: 'text'
    },
    {
      image: '/color-blindness-test/6.png',
      answer: 'M',
      options: ['9', 'N', 'M', 'dontKnow'],
      type: 'number'
    },
    {
      image: '/color-blindness-test/7.png',
      answer: '73',
      options: ['73', '62', '29', 'dontKnow'],
      type: 'number'
    },
    {
      image: '/color-blindness-test/8.png',
      answer: '75',
      options: ['16', '75', '26', 'dontKnow'],
      type: 'number'
    },
    {
      image: '/color-blindness-test/9.png',
      answer: '52',
      options: ['5', '52', '2', 'dontKnow'],
      type: 'number'
    },
    {
      image: '/color-blindness-test/10.png',
      answer: '689',
      options: ['89', '69', '689', 'dontKnow'],
      type: 'number'
    },
    {
      image: '/color-blindness-test/11.png',
      answer: '806',
      options: ['86', '60', '806', 'dontKnow'],
      type: 'number'
    },
    {
      image: '/color-blindness-test/12.png',
      answer: t('answers.goldfish'),
      options: ['peacock', 'goldfish', 'duck', 'dontKnow'],
      type: 'text'
    },
    {
      image: '/color-blindness-test/13.png',
      answer: '5',
      options: ['8', '5', '3', 'dontKnow'],
      type: 'number'
    },
    {
      image: '/color-blindness-test/14.png',
      answer: '2945',
      options: ['45', '7045', '2945', 'dontKnow'],
      type: 'number'
    },
    {
      image: '/color-blindness-test/15.png',
      answer: t('answers.butterfly'),
      options: ['redLine', 'pinkLine', 'redAndPinkLine', 'dontKnow'],
      type: 'text'
    },
    // {
    //   image: '/color-blindness-test/16.png',
    //   answer: '35',
    //   options: ['35', '55', '25', 'dontKnow'],
    //   type: 'number'
    // },
    {
      image: '/color-blindness-test/17.png',
      answer: 'R',
      options: ['R', 'E', 'C', 'dontKnow'],
      type: 'number'
    },
    {
        image: '/color-blindness-test/18.png',
        answer: 'E',
        options: ['B', 'E', 'P', 'dontKnow'],
        type: 'number'
      },
  ]

  // 处理答案选项的显示
  const getOptionDisplay = (option: string, type: string) => {
    if (option === 'dontKnow') {
      return t('options.dontKnow')
    }
    return type === 'number' ? option : t(`answers.${option}`)
  }

  // 处理答案的验证
  const handleAnswer = (answer: string, type: string) => {
    const currentAnswer = type === 'number' ? 
      answer : 
      t(`answers.${answer}`)

    if (currentAnswer === questions[currentQuestion].answer) {
      if (currentQuestion < questions.length - 1) {
        setScore(score + 1)
        setCurrentQuestion(currentQuestion + 1)
      } else {
        setScore(score + 1)
        setIsComplete(true)
      }
    } else {
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1)
      } else {
        setIsComplete(true)
      }
    }
  }

  const getResult = (score: number) => {
    const percentage = (score / questions.length) * 100
    if (percentage >= 90) return t("result.normal")
    if (percentage >= 70) return t("result.slight")
    if (percentage >= 50) return t("result.moderate")
    return t("result.severe")
  }

  const restart = () => {
    setCurrentQuestion(0)
    setScore(0)
    setIsComplete(false)
  }

  return (
    <div className="w-full mx-auto py-0 space-y-16">
      <div className="banner w-full h-[550px] flex flex-col justify-center items-center bg-blue-theme text-white">
        {!isGameStarted && (
          <div className="flex flex-col justify-center items-center">
            <FaEye className="text-9xl mb-8 animate-fade" />
            <h1 className="text-4xl font-bold text-center mb-4">{t("h2")}</h1>
            <p className="text-lg text-center mb-20">{t("description")}</p>
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
                      {t("question")} {currentQuestion + 1}/{questions.length}
                    </span>
                  </div>
                  
                  <div className="mb-6">
                    <Image
                      src={questions[currentQuestion].image}
                      alt="Color blindness test"
                      width={480}
                      height={480}
                      className="mx-auto rounded-lg"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {questions[currentQuestion].options.map((option) => (
                      <button
                        key={option}
                        onClick={() => handleAnswer(option, questions[currentQuestion].type)}
                        className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-lg transition-colors"
                      >
                        {getOptionDisplay(option, questions[currentQuestion].type)}
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <div className="mt-4">
                  <p className="text-xl mb-4 text-gray-800">
                    {t("finalScore")}: {score}/{questions.length}
                  </p>
                  <p className="text-lg mb-4 text-gray-600">
                    {getResult(score)}
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