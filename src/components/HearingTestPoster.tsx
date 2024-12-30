import { useRef, useState } from 'react'
import html2canvas from 'html2canvas'
import { useTranslations } from 'next-intl'
import Image from 'next/image'

// 添加布局类型
type Layout = 'portrait' | 'landscape'

interface HearingPosterProps {
  maxFreq: string
  minFreq: string
  estimatedAge: number
  result: string
  isOpen: boolean
  onClose: () => void
  title: string
}

// 横屏布局组件
const LandscapePoster = ({ maxFreq, minFreq, estimatedAge, result, title }: Omit<HearingPosterProps, 'isOpen' | 'onClose'>) => {
    const t = useTranslations('hearingTest')
    const freqRange = `${minFreq} - ${maxFreq}`
  return (
    <div className="w-[800px] h-[450px] relative">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600">
        {/* Background decorations */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4"></div>
          <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-white/5 rounded-full translate-y-1/2 -translate-x-1/4"></div>
        </div>

        {/* Main content */}
        <div className="relative h-full flex items-center px-16">
          {/* Left side */}
          <div className="flex-1 space-y-6">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">{title}</h1>
              <p className="text-xl text-white/90">FunBenchmark.com</p>
            </div>

            <div className="text-6xl font-bold text-white whitespace-nowrap">{freqRange}</div>

            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm w-fit">
              <div className="text-2xl font-bold text-white mb-1">
                {t('poster.hearingAge', { age: estimatedAge })}
              </div>
              <div className="text-white/90">{result}</div>
            </div>
          </div>

          {/* Right side */}
          <div className="w-[260px] flex flex-col items-center space-y-8">
            <div className="text-center space-y-3">
              <div className="w-32 h-32 bg-white rounded-xl mx-auto p-2">
                <Image
                  src="/qrcode/hearing-frequency.png"
                  alt="QR Code"
                  width={128}
                  height={128}
                  className="w-full h-full"
                />
              </div>
              <p className="text-sm text-white/90">
                {t('poster.scanQRCode')}
              </p>
            </div>
          </div>
        </div>

        {/* Bottom decoration */}
        <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-gradient-to-r from-yellow-400 via-purple-500 to-blue-600"></div>
      </div>
    </div>
  )
}

// Add this component before LandscapePoster
const PortraitPoster = ({ maxFreq, minFreq, estimatedAge, result, title }: Omit<HearingPosterProps, 'isOpen' | 'onClose'>) => {
  const t = useTranslations('hearingTest')
  const freqRange = `${minFreq} - ${maxFreq}`
  
  return (
    <div className="w-[375px] h-[667px] relative">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-purple-600 p-8">
        <div className="h-full flex flex-col justify-between text-white">
          <div>
            <h1 className="text-3xl font-bold mb-2">{title}</h1>
            <p className="text-lg opacity-90">FunBenchmark.com</p>
          </div>
          
          <div className="space-y-8 text-center">
            <div className="text-4xl font-bold whitespace-nowrap">{freqRange}</div>
            <div className="space-y-4">
              <div className="text-2xl font-bold">
                {t('poster.hearingAge', { age: estimatedAge })}
              </div>
              <div className="inline-block bg-white/10 rounded-xl p-4">
                <div className="text-xl">{result}</div>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center space-y-3">
            <p className="opacity-90">{t('poster.scanQRCode')}</p>
            <div className="w-24 h-24 bg-white rounded-lg p-2">
              <Image
                src="/qrcode/hearing-frequency.png"
                alt="QR Code"
                width={128}
                height={128}
                className="w-full h-full"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// 修改主组件以支持布局切换
export default function HearingTestPoster({ maxFreq, minFreq, estimatedAge, result, isOpen, onClose, title }: HearingPosterProps) {
  const t = useTranslations('hearingTest')
  const [layout, setLayout] = useState<Layout>('portrait')
  const posterRef = useRef<HTMLDivElement>(null)
  const [isLoading, setIsLoading] = useState(false)

  const generateImage = async () => {
    if (!posterRef.current) return null
    
    try {
      const canvas = await html2canvas(posterRef.current, {
        scale: 2,
        backgroundColor: '#1a1a1a',
        logging: false,
        useCORS: true,
        allowTaint: true,
      })
      return canvas.toDataURL('image/png', 1.0)
    } catch (error) {
      console.error('Error generating image:', error)
      return null
    }
  }

  const handleDownload = async () => {
    const image = await generateImage()
    if (!image) return
    
    const link = document.createElement('a')
    link.download = `hearing-test-result.png`
    link.href = image
    link.click()
  }

  const handleShare = async () => {
    try {
      setIsLoading(true)
      const image = await generateImage()
      if (!image) return

      const blob = await fetch(image).then(res => res.blob())
      const file = new File([blob], 'hearing-test-result.png', { type: 'image/png' })
      
      const shareUrl = window.location.href
      const shareText = t('sharePop.text', { minFreq, maxFreq, age: estimatedAge })+'\n\n'+shareUrl

      if (navigator.share) {
        await navigator.share({
          files: [file],
          title: t('sharePop.title'),
          text: shareText,
          url: shareUrl
        })
      } else {
        const imageUrl = URL.createObjectURL(blob)
        window.open(imageUrl, '_blank')
      }
    } catch (error) {
      console.error('Error sharing:', error)
      alert('分享失败，请重试')
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="min-h-screen py-8">
        <div className="bg-white rounded-lg p-6 w-full max-w-[1200px] mx-auto relative">
          {/* Layout switch buttons */}
          <div className="flex gap-4 mb-4">
            <button
              className={`flex-1 py-2 px-4 rounded-lg transition-colors duration-200
                ${layout === 'portrait' 
                  ? 'bg-blue-500 text-white shadow-md' 
                  : 'bg-gray-100 hover:bg-gray-200'}`}
              onClick={() => setLayout('portrait')}
            >
              <i className="fas fa-mobile-alt mr-2"></i>
              {t('sharePop.portraitMode')}
            </button>
            <button
              className={`flex-1 py-2 px-4 rounded-lg transition-colors duration-200
                ${layout === 'landscape' 
                  ? 'bg-blue-500 text-white shadow-md' 
                  : 'bg-gray-100 hover:bg-gray-200'}`}
              onClick={() => setLayout('landscape')}
            >
              <i className="fas fa-desktop mr-2"></i>
              {t('sharePop.landscapeMode')}
            </button>
          </div>

          {/* Poster preview area */}
          <div className="overflow-auto max-h-[60vh] p-4 bg-gray-50 rounded-lg">
            <div 
              ref={posterRef} 
              className="flex items-center justify-center"
              style={{
                width: layout === 'landscape' ? '800px' : '375px',
                height: layout === 'landscape' ? '450px' : '667px',
              }}
            >
              <div className="shadow-2xl rounded-lg overflow-hidden">
                {layout === 'portrait' ? (
                  <PortraitPoster 
                    maxFreq={maxFreq}
                    minFreq={minFreq}
                    estimatedAge={estimatedAge}
                    result={result}
                    title={title}
                  />
                ) : (
                  <LandscapePoster 
                    maxFreq={maxFreq}
                    minFreq={minFreq}
                    estimatedAge={estimatedAge}
                    result={result}
                    title={title}
                  />
                )}
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="mt-6 flex justify-center gap-4">
            <button
              onClick={onClose}
              className="py-2 px-6 rounded-lg border border-gray-300 hover:bg-gray-50 
                       transition-colors duration-200"
            >
              {t('sharePop.cancel')}
            </button>
            <button
              onClick={handleDownload}
              className="bg-blue-500 text-white py-2 px-6 rounded-lg hover:bg-blue-600 
                       transition-colors duration-200 flex items-center gap-2"
            >
              <i className="fas fa-download"></i>
              {t('sharePop.download')}
            </button>
            <button
              onClick={handleShare}
              disabled={isLoading}
              className={`bg-green-500 text-white py-2 px-6 rounded-lg 
                        hover:bg-green-600 transition-colors duration-200 
                        flex items-center gap-2 disabled:opacity-50`}
            >
              {isLoading ? (
                <i className="fas fa-spinner fa-spin"></i>
              ) : (
                <i className="fas fa-share-alt"></i>
              )}
              {isLoading ? t('sharePop.processing') : t('sharePop.share')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
} 