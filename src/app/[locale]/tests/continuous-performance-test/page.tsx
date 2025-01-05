'use client'
import React, { useState, useEffect, useRef, useCallback } from 'react'
import '@fortawesome/fontawesome-free/css/all.min.css'
import { useTranslations } from 'next-intl'
import Image from 'next/image'

interface TestResult {
  correctResponses: number
  omissionErrors: number
  commissionErrors: number
  averageReactionTime: number
  totalTrials: number
}

interface PeriodStats {
  startTime: number;
  correctResponses: number;
  commissionErrors: number;
  omissionErrors: number;
  reactionTimes: number[];
}

export default function CPTTest() {
  const [gameState, setGameState] = useState<'start' | 'test' | 'result'>('start')
  const [currentLetter, setCurrentLetter] = useState<string>('')
  const [results, setResults] = useState<TestResult>({
    correctResponses: 0,
    omissionErrors: 0,
    commissionErrors: 0,
    averageReactionTime: 0,
    totalTrials: 0
  })
  const [reactionTimes, setReactionTimes] = useState<number[]>([])
  const [lastStimulusTime, setLastStimulusTime] = useState<number>(0)
  const [progress, setProgress] = useState(0)
  const [periodStats, setPeriodStats] = useState<PeriodStats[]>([])
  const [testStartTime, setTestStartTime] = useState<number>(0)

  const testDuration = 300000 // 5 minutes in milliseconds
  const stimulusDuration = 500 // Changed to 500ms
  const interStimulusInterval = 1000 // time between stimuli

  const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z']
  const targetLetter = 'X'

  const t = useTranslations('cpt')

  const intervalsRef = useRef<{
    stimulus?: NodeJS.Timeout;
    progress?: NodeJS.Timeout;
  }>({})

  const startTest = () => {
    setTestStartTime(Date.now());
    console.log('Test started')
    if (intervalsRef.current.stimulus) {
      clearInterval(intervalsRef.current.stimulus)
    }
    if (intervalsRef.current.progress) {
      clearInterval(intervalsRef.current.progress)
    }

    setGameState('test')
    setResults({
      correctResponses: 0,
      omissionErrors: 0,
      commissionErrors: 0,
      averageReactionTime: 0,
      totalTrials: 0
    })
    setReactionTimes([])
    setProgress(0)

    const startTime = Date.now()
    intervalsRef.current.progress = setInterval(() => {
      const elapsed = Date.now() - startTime
      setProgress((elapsed / testDuration) * 100)
      if (elapsed >= testDuration) {
        endTest()
      }
    }, 100)

    showStimuli()

    setTimeout(() => {
      endTest()
    }, testDuration)
  }

  const showStimuli = () => {
    const displayStimulus = () => {
      const isTarget = Math.random() < 0.2  // 20% 概率显示目标字母
      const letter = isTarget ? targetLetter : letters.filter(l => l !== targetLetter)[Math.floor(Math.random() * (letters.length - 1))]
      const currentTime = Date.now()
      
      // 先清除之前的字母和时间戳
      setCurrentLetter('')
      setLastStimulusTime(0)
      
      // 短暂延迟后显示新字母，确保状态已更新
      setTimeout(() => {
        setCurrentLetter(letter)
        setLastStimulusTime(currentTime)
        console.log('New stimulus:', { letter, time: currentTime, isTarget })
        
        // 清除当前字母
        setTimeout(() => {
          setCurrentLetter('')
          setLastStimulusTime(0)
        }, stimulusDuration)
      }, 50)
    }

    displayStimulus()
    const intervalId = setInterval(displayStimulus, interStimulusInterval)
    intervalsRef.current.stimulus = intervalId
  }

  const handleClick = useCallback(() => {
    if (gameState !== 'test') return

    const currentTime = Date.now()
    const currentDisplayedLetter = currentLetter
    const currentStimulusTime = lastStimulusTime
    
    if (!currentDisplayedLetter || !currentStimulusTime) return
    
    const reactionTime = currentTime - currentStimulusTime
    const periodStartTime = Math.floor((currentTime - testStartTime) / 30000) * 30000

    // 更新时间段统计
    setPeriodStats(prev => {
      const currentPeriod = prev.find(p => p.startTime === periodStartTime) || {
        startTime: periodStartTime,
        correctResponses: 0,
        commissionErrors: 0,
        omissionErrors: 0,
        reactionTimes: []
      };

      const updatedPeriod = {
        ...currentPeriod,
        reactionTimes: [...currentPeriod.reactionTimes, reactionTime]
      };

      if (currentDisplayedLetter === targetLetter && reactionTime <= stimulusDuration) {
        updatedPeriod.correctResponses++;
      } else {
        updatedPeriod.commissionErrors++;
      }

      return [
        ...prev.filter(p => p.startTime !== periodStartTime),
        updatedPeriod
      ].sort((a, b) => a.startTime - b.startTime);
    });

    console.log('Click detected:', { 
      letter: currentDisplayedLetter, 
      reactionTime,
      isTarget: currentDisplayedLetter === targetLetter,
      lastStimulusTime: currentStimulusTime,
      currentTime
    })
    
    if (currentDisplayedLetter === targetLetter && reactionTime <= stimulusDuration) {
      // 正确响应
      console.log('Recording correct response for:', currentDisplayedLetter)
      setResults(prev => {
        const newResults = {
          ...prev,
          correctResponses: prev.correctResponses + 1,
          totalTrials: prev.totalTrials + 1
        };
        console.log('Updated results:', newResults);
        return newResults;
      })
      setReactionTimes(prev => [...prev, reactionTime])
    } else if (currentDisplayedLetter !== '') {
      // 错误响应（虚报）或超时
      console.log('Recording commission error for:', currentDisplayedLetter, 'reactionTime:', reactionTime)
      setResults(prev => {
        const newResults = {
          ...prev,
          commissionErrors: prev.commissionErrors + 1,
          totalTrials: prev.totalTrials + 1
        };
        console.log('Updated results (error):', newResults);
        return newResults;
      })
    }
  }, [gameState, currentLetter, lastStimulusTime, testStartTime]);

  const endTest = () => {
    if (intervalsRef.current.stimulus) {
      clearInterval(intervalsRef.current.stimulus)
    }
    if (intervalsRef.current.progress) {
      clearInterval(intervalsRef.current.progress)
    }

    setGameState('result')
    setCurrentLetter('')
    document.body.style.overflow = '';  // 恢复滚动

    const avgRT = reactionTimes.length > 0 
      ? reactionTimes.reduce((a, b) => a + b) / reactionTimes.length 
      : 0

    setResults(prev => ({
      ...prev,
      averageReactionTime: avgRT
    }))
  }

  useEffect(() => {
    const preventScroll = (event: KeyboardEvent) => {
      if (event.code === 'Space') {
        event.preventDefault();
        return false;
      }
    };

    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.code === 'Space') {
        event.preventDefault();
        handleClick();
        return false;
      }
    };

    // 只在测试进行时添加事件监听器
    if (gameState === 'test') {
      window.addEventListener('keydown', preventScroll, { passive: false });
      window.addEventListener('keyup', preventScroll, { passive: false });
      window.addEventListener('keypress', preventScroll, { passive: false });
      window.addEventListener('keydown', handleKeyPress);
      document.body.style.overflow = 'hidden';  // 测试时禁用滚动
    }

    return () => {
      window.removeEventListener('keydown', preventScroll);
      window.removeEventListener('keyup', preventScroll);
      window.removeEventListener('keypress', preventScroll);
      window.removeEventListener('keydown', handleKeyPress);
      document.body.style.overflow = '';  // 清理时恢复滚动
    };
  }, [gameState, handleClick]);

  // 组件卸载时也要恢复滚动
  useEffect(() => {
    return () => {
      document.body.style.overflow = '';
    }
  }, []);

  return (
    <div className="w-full mx-auto py-0 space-y-16">
      <div className="banner w-full h-[550px] flex flex-col justify-center items-center bg-blue-theme text-white">
        {gameState === 'start' && (
          <div className='flex flex-col justify-center items-center'>
            <i className="fas fa-bullseye text-9xl text-white mb-8 animate-fade cursor-pointer"></i>
            <h1 className="text-4xl font-bold text-center mb-4">{t('title')}</h1>
            <p className="text-lg text-center mb-20">
              {t('instructions')}<br />
              {t('duration')}
            </p>
            <button 
              onClick={startTest}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg shadow-md hover:bg-blue-700 transition-colors"
            >
              {t('startButton')}
            </button>
          </div>
        )}

        {gameState === 'test' && (
          <div 
            className="flex flex-col items-center w-full h-full justify-center cursor-pointer"
            onClick={() => {
              console.log('Click event triggered');
              handleClick();
            }}
          >
            <div className="text-9xl font-bold mb-4 h-[144px] flex items-center justify-center">
              {currentLetter}
            </div>
            <div className="w-full max-w-[400px] h-2 bg-white/20 rounded-full overflow-hidden">
              <div 
                className="h-full bg-white transition-all duration-100"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {gameState === 'result' && (
          <div className='flex flex-col justify-center items-center max-w-2xl mx-auto p-8 bg-white/10 rounded-xl backdrop-blur-sm'>
            <h2 className="text-4xl font-bold mb-8">{t('results')}</h2>
            <div className="w-full grid grid-cols-2 gap-4">
              <div className="flex justify-between items-center p-4 bg-white/5 rounded-lg">
                <span>{t('correctResponses')}:</span>
                <span className="font-bold text-xl">{results.correctResponses}</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-white/5 rounded-lg">
                <span>{t('omissionErrors')}:</span>
                <span className="font-bold text-xl">{results.omissionErrors}</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-white/5 rounded-lg">
                <span>{t('commissionErrors')}:</span>
                <span className="font-bold text-xl">{results.commissionErrors}</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-white/5 rounded-lg">
                <span>{t('averageReactionTime')}:</span>
                <span className="font-bold text-xl">{Math.round(results.averageReactionTime)}ms</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-white/5 rounded-lg col-span-2">
                <span>{t('accuracyRate')}:</span>
                <span className="font-bold text-xl">
                  {((results.correctResponses / results.totalTrials) * 100).toFixed(1)}%
                </span>
              </div>
            </div>
            <button 
              onClick={() => setGameState('start')}
              className="mt-8 bg-blue-600 text-white px-8 py-3 rounded-lg shadow-md hover:bg-blue-700 transition-colors font-semibold"
            >
              {t('tryAgain')}
            </button>
          </div>
        )}
      </div>
      <div className="container mx-auto py-0 space-y-16">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <div className="grid md:grid-cols-1 gap-8 items-center">
            <div className="w-full">
              <h2 className="text-xl mb-4 font-semibold">{t('thirtySecondIntervals')}</h2>
              <div className="overflow-x-auto shadow-lg rounded-lg">
                <table className="w-full text-sm bg-white dark:bg-gray-800">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-gray-700">
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        {t('timePeriod')}
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        {t('correct')}
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        {t('errors')}
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        {t('omissions')}
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        {t('averageResponse')}
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        {t('accuracy')}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {Array.from({ length: Math.ceil(testDuration / 30000) }).map((_, index) => {
                      const startTime = index * 30000;
                      const endTime = Math.min((index + 1) * 30000, testDuration);
                      
                      // 找到这个时间段的统计数据
                      const periodStat = periodStats.find(
                        stat => stat.startTime === startTime
                      ) || {
                        correctResponses: 0,
                        commissionErrors: 0,
                        omissionErrors: 0,
                        reactionTimes: []
                      };
                      
                      const periodAvgRT = periodStat.reactionTimes.length > 0 
                        ? Math.round(periodStat.reactionTimes.reduce((a, b) => a + b) / periodStat.reactionTimes.length)
                        : 0;
                        
                      const total = periodStat.correctResponses + 
                        periodStat.commissionErrors + 
                        periodStat.omissionErrors;
                        
                      const periodAccuracy = total > 0
                        ? ((periodStat.correctResponses / total) * 100).toFixed(1)
                        : '0.0';

                      return (
                        <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-300 time-period">
                            {Math.round(startTime/1000)}-{Math.round(endTime/1000)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center text-gray-600 dark:text-gray-300">
                            {periodStat.correctResponses}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center text-gray-600 dark:text-gray-300">
                            {periodStat.commissionErrors}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center text-gray-600 dark:text-gray-300">
                            {periodStat.omissionErrors}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center text-gray-600 dark:text-gray-300">
                            {periodAvgRT}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center text-gray-600 dark:text-gray-300">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              parseFloat(periodAccuracy) >= 80 ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                              parseFloat(periodAccuracy) >= 60 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                              'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                            }`}>
                              {periodAccuracy}%
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="container mx-auto py-0 space-y-16">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="w-full h-[400px]">
              <h2 className="text-xl mb-4 font-semibold">{t('statisticsTitle')}</h2>
              {/* <Image 
                src='/cpt-statistics.png' 
                alt={t('statisticsAlt')}
                className='w-full h-full' 
                width={400} 
                height={400}
              /> */}
            </div>
            <div className="w-full h-[400px]">
              <h2 className="text-xl mb-4 font-semibold">{t('aboutTitle')}</h2>
              <p>
                {t('aboutDescription')}
                <br /><br />
                {t('evaluatesTitle')}:
                <br />- {t('evaluatesPoint1')}
                <br />- {t('evaluatesPoint2')}
                <br />- {t('evaluatesPoint3')}
                <br /><br />
                {t('resultsDescription')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 