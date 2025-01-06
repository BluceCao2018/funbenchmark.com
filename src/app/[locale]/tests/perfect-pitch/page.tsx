'use client'
import { useState, useEffect, useRef } from 'react'
import { useTranslations } from 'next-intl'
import Image from 'next/image'
import { FaMusic, FaPlay, FaCheck, FaTimes } from 'react-icons/fa'
import { useSearchParams } from 'next/navigation'
import { EmbedDialog } from '@/components/EmbedDialog'
import { Button } from '@/components/ui/button'

const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
const NOTE_FREQUENCIES: { [key: string]: number } = {
  'C': 261.63, // C4
  'C#': 277.18,
  'D': 293.66,
  'D#': 311.13,
  'E': 329.63,
  'F': 349.23,
  'F#': 369.99,
  'G': 392.00,
  'G#': 415.30,
  'A': 440.00, // A4
  'A#': 466.16,
  'B': 493.88,
}

export default function PerfectPitch() {
  const t = useTranslations('perfectPitch')
  const te = useTranslations('embed');
  const [gameState, setGameState] = useState<'waiting' | 'testing' | 'result'>('waiting')
  const [currentNotes, setCurrentNotes] = useState<string[]>([])
  const [notesCount, setNotesCount] = useState(1)
  const [score, setScore] = useState(0)
  const [totalAttempts, setTotalAttempts] = useState(0)
  const [selectedNotes, setSelectedNotes] = useState<string[]>([])
  const audioContext = useRef<AudioContext | null>(null)
  const searchParams = useSearchParams()
  const isIframe = searchParams.get('embed') === 'true'
  const [embedUrl, setEmbedUrl] = useState('')
  const [showEmbedDialog, setShowEmbedDialog] = useState(false)

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
            correctNotes: score,
            totalNotes: totalAttempts,
            accuracy: ((score / totalAttempts) * 100).toFixed(1)
          }
        }, '*')
      }

      return () => {
        observer.disconnect()
      }
    }
  }, [isIframe, gameState, score, totalAttempts])

  const playNotes = (frequencies: number[]) => {
    if (!audioContext.current) {
      audioContext.current = new AudioContext()
    }
    
    frequencies.forEach(frequency => {
      const oscillator = audioContext.current!.createOscillator()
      const gainNode = audioContext.current!.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(audioContext.current!.destination)
      
      oscillator.frequency.value = frequency
      gainNode.gain.value = 0.1 / frequencies.length
      
      // ADSR envelope
      const now = audioContext.current!.currentTime
      gainNode.gain.setValueAtTime(0, now)
      gainNode.gain.linearRampToValueAtTime(0.1 / frequencies.length, now + 0.1)
      gainNode.gain.linearRampToValueAtTime(0.07 / frequencies.length, now + 0.3)
      gainNode.gain.linearRampToValueAtTime(0, now + 1)
      
      oscillator.start()
      oscillator.stop(now + 1)
    })
  }

  const startNewRound = () => {
    setSelectedNotes([])
    const selectedNotes: string[] = []
    while (selectedNotes.length < notesCount) {
      const randomNote = NOTES[Math.floor(Math.random() * NOTES.length)]
      if (!selectedNotes.includes(randomNote)) {
        selectedNotes.push(randomNote)
      }
    }
    setCurrentNotes(selectedNotes)
    playNotes(selectedNotes.map(note => NOTE_FREQUENCIES[note]))
    setGameState('testing')
  }

  const handleStart = () => {
    if (gameState === 'waiting') {
      startNewRound()
    }
  }

  const handleNoteGuess = async (note: string) => {
    if (selectedNotes.includes(note)) {
      setSelectedNotes(prev => prev.filter(n => n !== note))
    } else {
      if (selectedNotes.length < notesCount) {
        const newSelectedNotes = [...selectedNotes, note]
        setSelectedNotes(newSelectedNotes)
        
        // 如果选择的音符数量达到要求，自动检查答案
        if (newSelectedNotes.length === notesCount) {
          setTotalAttempts(prev => prev + 1)
          
          const isCorrect = 
            newSelectedNotes.length === currentNotes.length && 
            newSelectedNotes.every(n => currentNotes.includes(n)) &&
            currentNotes.every(n => newSelectedNotes.includes(n))
          
          if (isCorrect) {
            setScore(prev => prev + 1)
          }
          
          setGameState('result')
          
          try {
            await fetch('/api/perfect-pitch', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ 
                correct: isCorrect,
                notes: currentNotes,
                guesses: newSelectedNotes 
              }),
            })
          } catch (error) {
            console.error('Error saving result:', error)
          }
        }
      }
    }
  }

  const getGameStateMessage = () => {
    switch (gameState) {
      case 'waiting':
        return { 
          message: t("h1"),
          description: t("description"), 
          icon: <FaMusic className="text-9xl text-white mb-8 animate-fade" />
        }
      case 'testing':
        return { 
          message: t("identifyNote"),
          description: t("selectNote"), 
          icon: <FaPlay className="text-9xl text-white mb-8 animate-fade" />
        }
      case 'result':
        return { 
          message: `Score: ${score}/${totalAttempts}`,
          description: `${t("correctAnswer")}: ${currentNotes.join(', ')}`, 
          icon: score === totalAttempts ? 
            <FaCheck className="text-9xl text-white mb-8 animate-fade" /> :
            <FaTimes className="text-9xl text-white mb-8 animate-fade" />
        }
    }
  }

  const { message, description, icon } = getGameStateMessage()

  return (
    <div className="w-full mx-auto py-0 space-y-16">
      <div className={`
        banner w-full h-[550px] flex flex-col justify-center items-center 
        ${gameState === 'waiting' ? 'bg-blue-theme' : 
          gameState === 'testing' ? 'bg-purple-500' : 
          gameState === 'result' ? (score === totalAttempts ? 'bg-green-500' : 'bg-red-500') :
          'bg-blue-theme'}
        transition-all duration-300 cursor-pointer user-select-none
      `} 
      onClick={gameState === 'waiting' ? handleStart : undefined}>
        {icon}
        <h1 className="text-7xl font-bold text-center mb-4 text-white user-select-none">
          {message}
        </h1>
        <p className="text-3xl text-center mb-20 text-white user-select-none">
          {description}
        </p>
        
        {gameState === 'waiting' && (
          <div className="mt-4 flex gap-4 items-center">
            <Button
              onClick={(e) => {
                e.stopPropagation()
                setNotesCount(Math.max(1, notesCount - 1))
              }}
              className="px-4 py-2 bg-white text-blue-500 rounded-lg hover:bg-gray-100"
            >
              -
            </Button>
            <span className="text-white text-xl">
              {t("notesCount")}: {notesCount}
            </span>
            <Button
              onClick={(e) => {
                e.stopPropagation()
                setNotesCount(Math.min(10, notesCount + 1))
              }}
              className="px-4 py-2 bg-white text-blue-500 rounded-lg hover:bg-gray-100"
            >
              +
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
        )}
        
        {gameState === 'testing' && (
          <div className="flex flex-col items-center gap-6">
            <div className="grid grid-cols-6 gap-2 max-w-4xl">
              {NOTES.map(note => (
                <button
                  key={note}
                  onClick={() => handleNoteGuess(note)}
                  className={`px-4 py-2 rounded-lg transition-colors text-sm
                    ${selectedNotes.includes(note) 
                      ? 'bg-purple-700 text-white' 
                      : 'bg-white text-purple-500 hover:bg-gray-100'}`}
                >
                  {note}
                </button>
              ))}
            </div>
            
            <div className="text-white text-xl text-center">
              {t("selectedNotes")}: {selectedNotes.join(', ')}
              <br />
              {t("remainingNotes")}: {notesCount - selectedNotes.length}
            </div>
          </div>
        )}
        
        {gameState === 'result' && (
          <div className="flex flex-col items-center gap-4">
            <div className="text-white text-xl space-y-2">
              <p>{t("yourAnswer")}: {selectedNotes.join(', ')}</p>
              <p>{t("correctNotes")}: {currentNotes.join(', ')}</p>
            </div>
            <button
              onClick={() => startNewRound()}
              className="px-8 py-4 bg-white text-purple-500 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {t("nextNote")}
            </button>
          </div>
        )}
      </div>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div className="w-full h-[400px]">
            <h2 className="text-xl mb-4 font-semibold">{t("statisticsTitle")}</h2>
            {/* <Image 
              src='/perfect-pitch-statistics.png' 
              alt='Perfect Pitch Statistics'
              className='w-full h-full' 
              width={400} 
              height={400}
            /> */}
          </div>
          <div className="w-full h-[400px]">
            <h2 className="text-xl mb-4 font-semibold">{t("aboutTitle")}</h2>
            <p>{t("about")}</p>
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