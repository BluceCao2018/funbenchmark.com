'use client'
import React, { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import '@fortawesome/fontawesome-free/css/all.min.css'
import Image from 'next/image'
import { downloadAndSaveFace, getRandomLocalFace } from './utils'
import { FaFaceSmile } from 'react-icons/fa6'

export default function FaceRecognitionTest() {
  const t = useTranslations('faceRecognition')
  
  // 关卡配置
  const LEVEL_CONFIG = {
    1: { faces: 1, time: 3000 },
    2: { faces: 2, time: 5000 },
    3: { faces: 3, time: 7000 },
    4: { faces: 4, time: 9000 },
    5: { faces: 5, time: 11000 },
    6: { faces: 6, time: 13000 },
    7: { faces: 7, time: 15000 },
    8: { faces: 8, time: 17000 },
    9: { faces: 9, time: 19000 },
  }

  // 状态管理
  const [level, setLevel] = useState(1)
  const [isGameStarted, setIsGameStarted] = useState(false)
  const [phase, setPhase] = useState<'learning' | 'testing' | 'results' | 'loading' | 'error'>('learning')
  const [learningFaces, setLearningFaces] = useState<string[]>([])
  const [testingFaces, setTestingFaces] = useState<string[]>([])
  const [selectedFaces, setSelectedFaces] = useState<Set<number>>(new Set())
  const [results, setResults] = useState<{
    correctSelections: number
    falsePositives: number
    accuracy: number
    reactionTime: number
  } | null>(null)
  const [startTime, setStartTime] = useState<number>(0)
  const [timeLeft, setTimeLeft] = useState(0)
  const [correctAnswers, setCorrectAnswers] = useState<Set<number>>(new Set())

  const currentConfig = LEVEL_CONFIG[level as keyof typeof LEVEL_CONFIG]
  const LEARNING_FACES_COUNT = currentConfig.faces
  const LEARNING_TIME = currentConfig.time
  const TESTING_FACES_COUNT = LEARNING_FACES_COUNT * 2

  // 获取人脸图片URL
  const getFaceImageUrl = async () => {
    try {
      const newFace = await downloadAndSaveFace()
      return newFace || getRandomLocalFace() // 如果下载失败，使用本地图片
    } catch (error) {
      console.error('Error getting face:', error)
      return getRandomLocalFace()
    }
  }

  // 初始化测试
  const startTest = async () => {
    setIsGameStarted(true)
    setPhase('loading')
    setTimeLeft(LEARNING_TIME / 1000)

    try {
      const uniqueFaces: string[] = []
      const totalNeededFaces = LEARNING_FACES_COUNT + TESTING_FACES_COUNT
      
      while (uniqueFaces.length < totalNeededFaces) {
        const newFace = await getFaceImageUrl()
        if (!uniqueFaces.includes(newFace)) {
          uniqueFaces.push(newFace)
        }
      }

      // 设置学习阶段的人脸
      const learningFaces = uniqueFaces.slice(0, LEARNING_FACES_COUNT)
      setLearningFaces(learningFaces)
      setPhase('learning')
      
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer)
          }
          return prev - 1
        })
      }, 1000)
      
      setTimeout(() => {
        clearInterval(timer)
        
        // 确保至少保留一个学习过的人脸，其他随机选择
        const oldFacesToKeep = Math.max(1, Math.floor(LEARNING_FACES_COUNT / 2))
        const shuffledLearningFaces = [...learningFaces].sort(() => Math.random() - 0.5)
        const oldFaces = shuffledLearningFaces.slice(0, oldFacesToKeep)
        
        // 使用新人脸填充剩余位置
        const newFaces = uniqueFaces.slice(LEARNING_FACES_COUNT)
        const neededNewFaces = TESTING_FACES_COUNT - oldFacesToKeep
        const selectedNewFaces = newFaces.slice(0, neededNewFaces)

        // 创建映射来追踪学习过的人脸
        const correctFaceUrls = new Set(oldFaces)
        
        // 随机排序所有测试用的人脸
        const shuffledFaces = [...oldFaces, ...selectedNewFaces]
          .sort(() => Math.random() - 0.5)
        
        // 存储正确答案的新索引
        const correctIndices = shuffledFaces
          .map((face, index) => correctFaceUrls.has(face) ? index : -1)
          .filter(index => index !== -1)
        
        console.log('Correct indices:', correctIndices) // 调试信息
        setTestingFaces(shuffledFaces)
        setCorrectAnswers(new Set(correctIndices))
        setPhase('testing')
        setStartTime(Date.now())
      }, LEARNING_TIME)

    } catch (error) {
      console.error('Error starting test:', error)
      setPhase('error')
    }
  }

  // 处理人脸选择
  const handleFaceSelect = (index: number) => {
    const newSelection = new Set(selectedFaces)
    if (selectedFaces.has(index)) {
      newSelection.delete(index)
    } else {
      newSelection.add(index)
    }
    console.log('Face selected:', index, 'Current selections:', Array.from(newSelection))
    setSelectedFaces(newSelection)
  }

  // 提交测试结果
  const submitTest = () => {
    const endTime = Date.now()
    const selectedArray = Array.from(selectedFaces)
    
    console.log('Selected faces:', selectedArray) // 调试信息
    console.log('Correct answers:', Array.from(correctAnswers)) // 调试信息
    
    const correctSelections = selectedArray.filter(index => correctAnswers.has(index)).length
    const falsePositives = selectedArray.length - correctSelections
    const accuracy = (correctSelections / correctAnswers.size) * 100
    const reactionTime = (endTime - startTime) / 1000

    console.log('Accuracy calculation:', { // 调试信息
      correctSelections,
      totalCorrect: correctAnswers.size,
      accuracy
    })

    const newResults = {
      correctSelections,
      falsePositives,
      accuracy,
      reactionTime
    }
    setResults(newResults)
    setPhase('results')

    if (accuracy >= 70 && level < 9) {
      setLevel(prev => prev + 1)
    }
  }

  return (
    <div className="w-full mx-auto py-0 space-y-16">
      <div className="banner w-full h-[550px] flex flex-col justify-center items-center bg-blue-theme">
        {!isGameStarted ? (
          <>
          <div className="flex flex-col justify-center items-center text-white">
            <FaFaceSmile className="text-9xl mb-8 animate-fade" />
            <h1 className="text-4xl font-bold text-center mb-4">{t("h1")}</h1>
            <p className="text-lg text-center mb-20">{t("description")}</p>
          </div>
             
            <button
              onClick={startTest}
              className="mx-auto block bg-blue-500 text-white px-8 py-4 rounded-lg hover:bg-blue-600 text-lg font-semibold shadow-lg transition-colors"
            >
              {t('startTest')}
            </button>
          </>
        ) : (
          <div className="bg-white rounded-lg shadow-lg p-8">
            {phase === 'learning' && (
              <div className="w-full max-w-5xl">
                <div className="flex justify-between items-center mb-8">
                  <div className="flex items-center gap-4">
                    <p className="text-xl font-semibold">{t('level')} {level}</p>
                    <p className="text-xl font-semibold">{t('memorizefaces')}</p>
                  </div>
                  <div className="text-2xl font-bold text-blue-600">
                    {timeLeft}s
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-8">
                  {learningFaces.map((face, index) => (
                    <div 
                      key={index} 
                      className="aspect-square relative rounded-lg overflow-hidden shadow-lg"
                      style={{ minHeight: '200px' }}
                    >
                      <Image
                        src={face}
                        alt={`Face ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {phase === 'testing' && (
              <div className="w-full max-w-6xl">
                <p className="text-xl font-semibold text-center mb-8">{t('selectFamiliarFaces')}</p>
                <div className="grid grid-cols-4 gap-8">
                  {testingFaces.map((face, index) => (
                    <div
                      key={index}
                      onClick={() => handleFaceSelect(index)}
                      className={`aspect-square relative rounded-lg overflow-hidden cursor-pointer shadow-lg transition-all ${
                        selectedFaces.has(index) 
                          ? 'ring-4 ring-blue-500 scale-105' 
                          : 'hover:scale-105'
                      }`}
                      style={{ minHeight: '180px' }}
                    >
                      <Image
                        src={face}
                        alt={`Test face ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
                <button
                  onClick={submitTest}
                  className="mt-12 mx-auto block bg-green-500 text-white px-8 py-4 rounded-lg hover:bg-green-600 text-lg font-semibold shadow-lg transition-colors"
                >
                  {t('submit')}
                </button>
              </div>
            )}

            {phase === 'results' && results && (
              <div className="w-full max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-8">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-gray-800">{t('level')} {level}</h2>
                  <h3 className="text-xl text-gray-600">{t('results')}</h3>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-gray-50 rounded-lg p-4 text-center">
                    <p className="text-sm text-gray-600 mb-1">{t('correctSelections')}</p>
                    <span className="text-2xl font-bold text-green-600">{results.correctSelections}</span>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 text-center">
                    <p className="text-sm text-gray-600 mb-1">{t('falsePositives')}</p>
                    <span className="text-2xl font-bold text-red-600">{results.falsePositives}</span>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 text-center">
                    <p className="text-sm text-gray-600 mb-1">{t('accuracy')}</p>
                    <span className="text-2xl font-bold text-blue-600">{results.accuracy.toFixed(1)}%</span>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 text-center">
                    <p className="text-sm text-gray-600 mb-1">{t('reactionTime')}</p>
                    <span className="text-2xl font-bold text-purple-600">{results.reactionTime.toFixed(1)}s</span>
                  </div>
                </div>

                <div className="space-y-3">
                  {results.accuracy >= 70 && level < 9 ? (
                    <>
                      <button
                        onClick={() => {
                          setSelectedFaces(new Set())
                          setResults(null)
                          startTest()
                        }}
                        className="w-full bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 text-base font-semibold shadow-lg transition-colors"
                      >
                        {t('nextLevel')}
                      </button>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          onClick={() => {
                            setSelectedFaces(new Set())
                            setResults(null)
                            startTest()
                          }}
                          className="w-full bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 text-base font-semibold shadow-lg transition-colors"
                        >
                          {t('tryAgain')}
                        </button>
                        <button
                          onClick={() => {
                            setLevel(1)
                            setSelectedFaces(new Set())
                            setResults(null)
                            setIsGameStarted(false)
                          }}
                          className="w-full bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 text-base font-semibold shadow-lg transition-colors"
                        >
                          {t('restart')}
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => {
                          setSelectedFaces(new Set())
                          setResults(null)
                          startTest()
                        }}
                        className="w-full bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 text-base font-semibold shadow-lg transition-colors"
                      >
                        {t('tryAgain')}
                      </button>
                      <button
                        onClick={() => {
                          setLevel(1)
                          setSelectedFaces(new Set())
                          setResults(null)
                          setIsGameStarted(false)
                        }}
                        className="w-full bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 text-base font-semibold shadow-lg transition-colors"
                      >
                        {t('restart')}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {phase === 'loading' && (
              <div className="text-center py-12">
                <i className="fas fa-spinner fa-spin text-4xl text-blue-500 mb-4"></i>
                <p className="text-xl text-gray-600">Loading faces...</p>
              </div>
            )}

            {phase === 'error' && (
              <div className="text-center py-12">
                <i className="fas fa-exclamation-triangle text-4xl text-red-500 mb-4"></i>
                <p className="text-xl text-gray-600 mb-6">Error loading faces. Please try again.</p>
                <button
                  onClick={startTest}
                  className="mx-auto block bg-blue-500 text-white px-8 py-4 rounded-lg hover:bg-blue-600 text-lg font-semibold shadow-lg transition-colors"
                >
                  {t('tryAgain')}
                </button>
              </div>
            )}
          </div>
        )}
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