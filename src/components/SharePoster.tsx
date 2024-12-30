import { useRef, useState } from 'react'
import html2canvas from 'html2canvas'
import { useTranslations } from 'next-intl'
import Image from 'next/image'

interface SharePosterProps {
  reactionTime: number
  rank: number
  totalUsers: number
  isOpen: boolean
  onClose: () => void
}

const PortraitPoster = ({ reactionTime, rank, totalUsers }: Omit<SharePosterProps, 'isOpen' | 'onClose'>) => {
  const t = useTranslations('audioReaction')
  const beatPercentage = ((totalUsers - rank) / totalUsers * 100).toFixed(1)
  
  return (
    <div className="w-[375px] h-[667px] relative">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-purple-600 p-8">
        <div className="h-full flex flex-col justify-between text-white">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              {t('poster.title')}
            </h1>
            <p className="text-lg opacity-90">FunBenchmark.com</p>
          </div>
          
          <div className="space-y-8">
            <div className="text-center">
              <div className="text-7xl font-bold mb-2">
                {reactionTime}
                <span className="text-4xl ml-1">{t('poster.milliseconds')}</span>
              </div>
              {/* <div className="text-xl opacity-90">
                {t('poster.yourReactionTime')}
              </div> */}
            </div>
            
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-4xl font-bold mb-1">#{rank}</div>
                <div className="text-lg opacity-90">
                  {t('poster.currentRank')}
                </div>
              </div>
              
              <div className="text-center bg-white/10 rounded-xl p-4">
                <div className="text-3xl font-bold mb-1">
                  {t('poster.beatPercentage', { percentage: beatPercentage })}
                </div>
                <div className="text-sm opacity-90">
                  {t('poster.surpassedUsers', { count: totalUsers - rank })}
                </div>
              </div>
            </div>
          </div>

          <div className="text-center space-y-3">
            <p className="opacity-90">
              {t('poster.scanQRCode')}
            </p>
            <div className="w-24 h-24 bg-white mx-auto rounded-lg">
            <Image
            src="/qrcode/audio-reactiontime.png"
                alt="QR Code"
                width={96}
                height={96}
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        </div>

        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-bl-full"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-tr-full"></div>
      </div>
    </div>
  )
}

const LandscapePoster = ({ reactionTime, rank, totalUsers }: Omit<SharePosterProps, 'isOpen' | 'onClose'>) => {
  const t = useTranslations('audioReaction')
  const beatPercentage = ((totalUsers - rank) / totalUsers * 100).toFixed(1)
  
  return (
    <div className="w-[800px] h-[450px] relative">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600">
        {/* 背景装饰 */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4"></div>
          <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-white/5 rounded-full translate-y-1/2 -translate-x-1/4"></div>
        </div>

        {/* 主要内容区域 */}
        <div className="relative h-full flex items-center px-16">
          {/* 左侧信息 */}
          <div className="flex-1 space-y-6">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">
                {t('poster.title')}
              </h1>
              <p className="text-xl text-white/90">FunBenchmark.com</p>
            </div>

            <div className="space-y-2">
              <div className="text-8xl font-bold text-white">
                {reactionTime}
                <span className="text-2xl ml-1">{t('poster.milliseconds')}</span>
              </div>

              <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm w-fit">
                <div className="text-2xl font-bold text-white mb-1">
                  {t('poster.beatPercentage', { percentage: beatPercentage })}
                </div>
                <div className="text-white/90">
                  {t('poster.surpassedUsers', { count: totalUsers - rank })}
                </div>
              </div>
            </div>
          </div>

          {/* 右侧信息 */}
          <div className="w-[260px] flex flex-col items-center space-y-8">
            {/* 排名 */}
            <div className="text-center">
              <div className="text-6xl font-bold text-white mb-2">#{rank}</div>
              <div className="text-xl text-white/90">{t('poster.currentRank')}</div>
            </div>

            {/* 二维码 */}
            <div className="text-center space-y-3">
              <div className="w-32 h-32 bg-white rounded-xl mx-auto">
                {/* QR Code */}
                <Image
            src="/qrcode/audio-reactiontime.png"
                  alt="QR Code"
                  width={96}
                  height={96}
                  className="w-full h-full object-contain"
                />
              </div>
              <p className="text-sm text-white/90">
                {t('poster.scanQRCode')}
              </p>
            </div>
          </div>
        </div>

        {/* 底部装饰条 */}
        <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-gradient-to-r from-yellow-400 via-purple-500 to-blue-600"></div>
      </div>
    </div>
  )
}

export default function SharePoster({ reactionTime, rank, totalUsers, isOpen, onClose }: SharePosterProps) {
  const t = useTranslations('audioReaction')
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait')
  const posterRef = useRef<HTMLDivElement>(null)
  const [posterImage, setPosterImage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // 生成海报图片
  const generateImage = async () => {
    if (!posterRef.current) return null
    
    try {
      const canvas = await html2canvas(posterRef.current, {
        scale: 2,
        backgroundColor: '#1a1a1a'
      })
      return canvas.toDataURL('image/png')
    } catch (error) {
      console.error('Error generating image:', error)
      return null
    }
  }

  // 下载海报
  const handleDownload = async () => {
    const image = await generateImage()
    if (!image) return
    
    const link = document.createElement('a')
    link.download = `audio-reaction-time-${orientation}.png`
    link.href = image
    link.click()
  }

  // 分享海报
  const handleShare = async () => {
    try {
      setIsLoading(true)
      const image = await generateImage()
      if (!image) return

      const blob = await fetch(image).then(res => res.blob())
      const file = new File([blob], 'audio-reaction-time.png', { type: 'image/png' })
      
      // Add current URL
      const shareUrl = window.location.href

      if (navigator.share) {
        await navigator.share({
          files: [file],
          title: t('sharePop.title'),
          text: t('sharePop.text', { time: reactionTime, rank }),
          url: shareUrl  // Add URL to share data
        })
      } else {
        // Fallback handling
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
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="bg-white rounded-lg p-6 w-full max-w-[95vw] mx-4 relative">
        <button 
          onClick={onClose}
          className="absolute -top-4 -right-4 w-8 h-8 bg-gray-800 hover:bg-gray-700 
                     text-white rounded-full flex items-center justify-center shadow-lg"
          aria-label="关闭"
        >
          <i className="fas fa-times"></i>
        </button>

        <div className="flex justify-between mb-4">
          <h2 className="text-2xl font-bold">{t('sharePop.modalTitle')}</h2>
        </div>

        <div className="flex gap-4 mb-4">
          <button
            className={`flex-1 py-2 px-4 rounded-lg transition-colors duration-200
              ${orientation === 'portrait' 
                ? 'bg-blue-500 text-white shadow-md' 
                : 'bg-gray-100 hover:bg-gray-200'}`}
            onClick={() => setOrientation('portrait')}
          >
            <i className="fas fa-mobile-alt mr-2"></i>
            {t('sharePop.portraitMode')}
          </button>
          <button
            className={`flex-1 py-2 px-4 rounded-lg transition-colors duration-200
              ${orientation === 'landscape' 
                ? 'bg-blue-500 text-white shadow-md' 
                : 'bg-gray-100 hover:bg-gray-200'}`}
            onClick={() => setOrientation('landscape')}
          >
            <i className="fas fa-desktop mr-2"></i>
            {t('sharePop.landscapeMode')}
          </button>
        </div>

        <div className="overflow-auto max-h-[70vh] p-4 bg-gray-50 rounded-lg">
          <div 
            ref={posterRef} 
            className="flex items-center justify-center"
          >
            <div 
              className="shadow-2xl rounded-lg overflow-hidden"
              style={{
                transform: orientation === 'landscape' ? 'scale(0.85)' : 'none',
                transformOrigin: 'top center'
              }}
            >
              {orientation === 'portrait' ? (
                <PortraitPoster 
                  reactionTime={reactionTime}
                  rank={rank}
                  totalUsers={totalUsers}
                />
              ) : (
                <LandscapePoster 
                  reactionTime={reactionTime}
                  rank={rank}
                  totalUsers={totalUsers}
                />
              )}
            </div>
          </div>
        </div>

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
            {isLoading ? '处理中...' : t('sharePop.share')}
          </button>
        </div>
      </div>
    </div>
  )
} 