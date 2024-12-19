'use client'
import React, { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import '@fortawesome/fontawesome-free/css/all.min.css';
import Image from 'next/image'

export default function VerbalMemoryTest() {
  const [gameState, setGameState] = useState<'start' | 'playing' | 'result'>('start')
  const [words, setWords] = useState<string[]>([])
  const [currentWord, setCurrentWord] = useState<string>('')
  const [score, setScore] = useState(0)
  const [seenWords, setSeenWords] = useState<Set<string>>(new Set())

  const t =  useTranslations('verbalMemory');

  // 生成随机单词
  const generateWord = () => {
    const syllables = ['ba', 'ka', 'da', 'ma', 'na', 'pa', 'ra', 'sa', 'ta', 'wa']
    const length = Math.floor(Math.random() * 3) + 2 // 2-4个音节
    const word = Array.from({ length }, () => 
      syllables[Math.floor(Math.random() * syllables.length)]
    ).join('')
    return word
  }

  const startGame = () => {
    const initialWords = Array.from({ length: 10 }, () => generateWord())
    setWords(initialWords)
    setCurrentWord(initialWords[0])
    setScore(0)
    setSeenWords(new Set())
    setGameState('playing')
  }

  const handleResponse = (response: 'new' | 'seen') => {
    const isCorrect = 
      (response === 'new' && !seenWords.has(currentWord)) ||
      (response === 'seen' && seenWords.has(currentWord))

    if (isCorrect) {
      setScore(prev => prev + 1)
    } else {
      setGameState('result')
      return
    }

    // 标记当前单词为已见
    const updatedSeenWords = new Set(seenWords)
    updatedSeenWords.add(currentWord)
    setSeenWords(updatedSeenWords)

    // 获取下一个单词
    const remainingWords = words.filter(w => w !== currentWord)
    if (remainingWords.length === 0) {
      // 生成新单词
      const newWord = generateWord()
      setWords([...words, newWord])
      setCurrentWord(newWord)
    } else {
      const nextWord = remainingWords[0]
      setCurrentWord(nextWord)
      setWords(remainingWords)
    }
  }

  return (
    <div 
      className="w-full mx-auto py-0 space-y-16 "
    >
    <div className="banner w-full h-[550px] flex flex-col justify-center items-center bg-blue-theme text-white">
      {gameState === 'start' && (
        <div  className='flex flex-col justify-center items-center'>
          <i className="fas fa-language text-9xl text-white mb-8 animate-fade cursor-pointer"></i>
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
        <div className="flex flex-col items-center">
          <p className="text-4xl font-bold mb-12">{currentWord}</p>
          <div className="flex space-x-4">
            <button 
              onClick={() => handleResponse('new')}
              className="bg-green-600 text-white px-6 py-3 rounded-lg shadow-md hover:bg-green-700 transition-colors"
            >
              {t("new")}
            </button>
            <button 
              onClick={() => handleResponse('seen')}
              className="bg-red-600 text-white px-6 py-3 rounded-lg shadow-md hover:bg-red-700 transition-colors"
            >
              {t("seen")}
            </button>
          </div>
          <div className="absolute top-4 right-4">
            <p>分数: {score}</p>
          </div>
        </div>
      )}

      {gameState === 'result' && (
        <div  className='flex flex-col justify-center items-center'>
          <i className="fas fa-language text-9xl text-white mb-8 animate-fade cursor-pointer"></i>
          <h2 className="text-2xl font-bold mb-4">{t("h2")}</h2>
          <p className="text-6xl mb-4">{score} words</p>
          <button 
            onClick={() => setGameState('start')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg shadow-md hover:bg-blue-700 transition-colors"
          >
            {t("tryAgain")}
          </button>
        </div>
      )}
    </div>

    <div className="container mx-auto py-0 space-y-16 ">
<div className="container mx-auto px-4 py-8 max-w-6xl">
<div className="grid md:grid-cols-2 gap-8 items-center">
  <div className="w-full h-[400px]">
    <h2  className="text-xl mb-4 font-semibold">{t("statisticsTitle")}</h2>
    <Image 
      src='/verbal-memory-statistics.png' 
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

    </div>
  )
} 