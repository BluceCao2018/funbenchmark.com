'use client'
import React, { useState, useRef } from 'react'
import { useTranslations } from 'next-intl';
import { FaVolumeUp } from 'react-icons/fa';
import SharePoster from '@/components/SharePoster'
import HearingTestPoster from '@/components/HearingTestPoster'

export default function HearingFrequencyTest() {
  const [isGameStarted, setIsGameStarted] = useState(false)
  const [currentFreq, setCurrentFreq] = useState(20)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [maxFreq, setMaxFreq] = useState(0)
  const [minFreq, setMinFreq] = useState(0)
  const [foundMin, setFoundMin] = useState(false)
  const audioContextRef = useRef<AudioContext | null>(null)
  const oscillatorRef = useRef<OscillatorNode | null>(null)
  const [isShareOpen, setIsShareOpen] = useState(false)
  
  const t = useTranslations('hearingTest');

  const startAudio = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext()
    }

    if (oscillatorRef.current) {
      oscillatorRef.current.stop()
    }

    oscillatorRef.current = audioContextRef.current.createOscillator()
    const gainNode = audioContextRef.current.createGain()
    
    oscillatorRef.current.connect(gainNode)
    gainNode.connect(audioContextRef.current.destination)
    
    // 设置音量（避免声音过大）
    gainNode.gain.value = 0.1
    
    // 设置频率
    oscillatorRef.current.frequency.value = currentFreq
    
    oscillatorRef.current.start()
    setIsPlaying(true)
  }

  const stopAudio = () => {
    if (oscillatorRef.current) {
      oscillatorRef.current.stop()
      setIsPlaying(false)
    }
  }

  const handleResponse = (canHear: boolean) => {
    if (canHear) {
      if (!foundMin) {
        setMinFreq(currentFreq)
        setFoundMin(true)
      }
      setMaxFreq(currentFreq)
    } else if (foundMin) {
      setIsComplete(true)
      stopAudio()
      return
    }

    const nextFreq = Math.min(
      currentFreq < 1000 ? currentFreq + 100 :
      currentFreq < 5000 ? currentFreq + 500 :
      currentFreq + 1000,
      20000
    )
    setCurrentFreq(nextFreq)
    startAudio()
  }

  const getAgeEstimate = (freq: number) => {
    return Math.max(0, Math.min(110, Math.floor(110 - freq / 200)))
  }

  const getResult = (freq: number) => {
    if (freq >= 17200) return t("result.excellent")
    if (freq >= 13200) return t("result.good")
    if (freq >= 9200) return t("result.normal")
    return t("result.needCheck")
  }

  const restart = () => {
    setCurrentFreq(20)
    setMaxFreq(0)
    setMinFreq(0)
    setFoundMin(false)
    setIsComplete(false)
    setIsPlaying(false)
    if (oscillatorRef.current) {
      oscillatorRef.current.stop()
    }
  }

  return (
    <div className="w-full mx-auto py-0 space-y-16">
      <div className="banner w-full h-[550px] flex flex-col justify-center items-center bg-blue-theme text-white">
        {!isGameStarted && (
          <div className="flex flex-col justify-center items-center">
            <FaVolumeUp className="text-9xl mb-8 animate-fade" />
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
                      {t("currentFreq")}: {currentFreq}Hz
                    </span>
                  </div>
                  
                  <div className="flex flex-col gap-4 mb-4">
                    <button
                      onClick={isPlaying ? stopAudio : startAudio}
                      className="bg-blue-500 text-white px-6 py-3 rounded-lg shadow-md hover:bg-blue-600 transition-colors"
                    >
                      {isPlaying ? t("stopSound") : t("playSound")}
                    </button>

                    <div className="flex justify-center gap-4">
                      <button
                        onClick={() => handleResponse(true)}
                        className="bg-green-500 text-white px-6 py-3 rounded-lg shadow-md hover:bg-green-600 transition-colors"
                      >
                        {t("canHear")}
                      </button>
                      <button
                        onClick={() => handleResponse(false)}
                        className="bg-red-500 text-white px-6 py-3 rounded-lg shadow-md hover:bg-red-600 transition-colors"
                      >
                        {t("cannotHear")}
                      </button>
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 mt-4">
                    {t("testInstruction")}
                  </p>
                </>
              ) : (
                <div className="mt-4">
                  <p className="text-xl mb-4 text-gray-800">
                    {t("maxFreq")}: {maxFreq}Hz
                  </p>
                  <p className="text-xl mb-4 text-gray-800">
                    {t("minFreq")}: {minFreq}Hz
                  </p>
                  <p className="text-lg mb-4 text-gray-600">
                    {getResult(maxFreq)}
                  </p>
                  <p className="text-sm mb-4 text-gray-500">
                    {t("estimatedAge")}: {getAgeEstimate(maxFreq)}
                  </p>
                  <div className="flex gap-4">
                    <button 
                      onClick={restart}
                      className="mt-4 bg-blue-500 text-white px-6 py-2 rounded-lg shadow-md hover:bg-blue-600 transition-colors"
                    >
                      {t("tryAgain")}
                    </button>
                    <button
                      onClick={() => setIsShareOpen(true)}
                      className="mt-4 bg-green-500 text-white px-6 py-2 rounded-lg shadow-md hover:bg-green-600 transition-colors flex items-center gap-2"
                    >
                      <i className="fas fa-share-alt"></i>
                      {t("share")}
                    </button>
                  </div>
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
              <h2 className="text-xl mb-4 font-semibold text-gray-800">{t("frequencyRangeTitle")}</h2>
              <table className="w-full text-left">
                <thead>
                  <tr>
                    <th className="py-2">{t("age")}</th>
                    <th className="py-2">{t("frequency")}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td>9-24</td><td>17200 - 20200 Hz</td></tr>
                  <tr><td>25-44</td><td>13200 - 17200 Hz</td></tr>
                  <tr><td>45-64</td><td>9200 - 13200 Hz</td></tr>
                  <tr><td>65+</td><td>&lt; 9000 Hz</td></tr>
                </tbody>
              </table>
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
      <HearingTestPoster
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        title={t("h2")}
        maxFreq={`${maxFreq}Hz`}
        minFreq={`${minFreq}Hz`}
        estimatedAge={getAgeEstimate(maxFreq)}
        result={getResult(maxFreq)}
      />
    </div>
  )
} 