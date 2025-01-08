'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { FaFileAlt, FaImage, FaVideo, FaClock, FaEye, FaShare } from 'react-icons/fa'
import { toast } from 'sonner'
import { cn } from "@/lib/utils"
import Image from 'next/image'

type MessageType = 'TEXT' | 'IMAGE' | 'VIDEO'
type Step = 'content' | 'settings' | 'share'

export default function CreateTimedMessage() {
  const t = useTranslations('timedMessage')
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [step, setStep] = useState<Step>('content')
  const [messageType, setMessageType] = useState<MessageType>('TEXT')
  const [file, setFile] = useState<File | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    visibleDuration: 500,
    maxAttempts: 3
  })
  const [loading, setLoading] = useState(false)
  const [createdMessageId, setCreatedMessageId] = useState<string | null>(null)

  const handleSubmit = async () => {
    setLoading(true)

    try {
      const data = new FormData()
      data.set('title', formData.title)
      data.set('messageType', messageType)
      data.set('visibleDuration', formData.visibleDuration.toString())
      data.set('maxAttempts', formData.maxAttempts.toString())

      if (messageType === 'TEXT') {
        data.set('content', formData.content)
      } else if (file) {
        data.set('file', file)
      }

      const response = await fetch('/api/time-limited-visibility', {
        method: 'POST',
        body: data
      })

      if (!response.ok) throw new Error('Failed to create message')
      
      const result = await response.json()
      setCreatedMessageId(result.id)
      setStep('share')
    } catch (error) {
      toast.error(t('create.error'))
    } finally {
      setLoading(false)
    }
  }

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/time-limited-visibility/${createdMessageId}`
    await navigator.clipboard.writeText(shareUrl)
    toast.success(t('create.linkCopied'))
  }

  const handleShareTo = (platform: 'whatsapp' | 'twitter' | 'facebook' | 'telegram') => {
    const shareUrl = `${window.location.origin}/time-limited-visibility/${createdMessageId}`;
    const text = t('create.shareText');
    
    const urls = {
      whatsapp: `https://wa.me/?text=${encodeURIComponent(text + ' ' + shareUrl)}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
      telegram: `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(text)}`
    };

    window.open(urls[platform], '_blank');
  };

  const renderContent = () => {
    switch (step) {
      case 'content':
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">{t('create.contentTitle')}</h2>
            <div className="space-y-4">
              <Input
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder={t('create.titlePlaceholder')}
                required
              />
              {messageType === 'TEXT' ? (
                <Textarea
                  value={formData.content}
                  onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                  placeholder={t('create.contentPlaceholder')}
                  required
                />
              ) : (
                <input
                  type="file"
                  accept={messageType === 'IMAGE' ? 'image/*' : 'video/*'}
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  required
                />
              )}
              <Button onClick={() => setStep('settings')}>
                {t('create.next')}
              </Button>
            </div>
          </div>
        )

      case 'settings':
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">{t('create.settingsTitle')}</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  {t('create.duration')}
                </label>
                <Input
                  type="number"
                  value={formData.visibleDuration}
                  onChange={(e) => setFormData(prev => ({ ...prev, visibleDuration: parseInt(e.target.value) }))}
                  min="1000"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  {t('create.maxAttempts')}
                </label>
                <Input
                  type="number"
                  value={formData.maxAttempts}
                  onChange={(e) => setFormData(prev => ({ ...prev, maxAttempts: parseInt(e.target.value) }))}
                  min="1"
                  required
                />
              </div>
              <Button onClick={handleSubmit} disabled={loading}>
                {loading ? t('create.creating') : t('create.submit')}
              </Button>
            </div>
          </div>
        )

      case 'share':
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">{t('create.shareTitle')}</h2>
            <div className="space-y-4">
              <Button
                onClick={handleShare}
                className="w-full flex items-center justify-center gap-2"
              >
                <FaShare className="w-4 h-4" />
                {t('create.copyLink')}
              </Button>
              
              <div className="grid grid-cols-4 gap-4">
                {[
                  { name: 'whatsapp', icon: 'whatsapp', color: '#25D366' },
                  { name: 'twitter', icon: 'twitter', color: '#1DA1F2' },
                  { name: 'facebook', icon: 'facebook', color: '#4267B2' },
                  { name: 'telegram', icon: 'telegram', color: '#0088cc' },
                ].map((platform) => (
                  <button
                    key={platform.name}
                    onClick={() => handleShareTo(platform.name as 'whatsapp' | 'twitter' | 'facebook' | 'telegram')}
                    className={cn(
                      "flex flex-col items-center justify-center p-3",
                      "rounded-full w-12 h-12",
                      "transition-transform hover:scale-110",
                      "bg-white shadow-sm hover:shadow-md"
                    )}
                    style={{ color: platform.color }}
                  >
                    <i className={`fab fa-${platform.icon} text-xl`} />
                  </button>
                ))}
              </div>

              <Button
                variant="outline"
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: t('create.shareViaTitle'),
                      text: t('create.shareViaText'),
                      url: `${window.location.origin}/time-limited-visibility/${createdMessageId}`
                    })
                  }
                }}
                className="w-full"
              >
                {t('create.shareVia')}
              </Button>

              <Button
                variant="outline"
                onClick={() => {
                  setIsOpen(false)
                  router.push('/time-limited-visibility/create')
                }}
              >
                {t('create.backToList')}
              </Button>
            </div>
          </div>
        )
    }
  }

  return (
    <div className="w-full mx-auto py-0 space-y-16">
      <div className="w-full h-[550px] flex flex-col justify-center items-center bg-blue-theme px-4">
        <h1 className="text-4xl md:text-5xl font-bold text-center mb-8 text-white">
          {t('create.title')}
        </h1>
        <p className="text-xl text-white/80 text-center mb-12 text-white user-select-none" dangerouslySetInnerHTML={{ __html: t('create.description') }} />

        <div className="grid grid-cols-3 gap-12 mt-12">
          {[
            { type: 'TEXT', icon: FaFileAlt, label: t('create.typeText') },
            { type: 'IMAGE', icon: FaImage, label: t('create.typeImage') , disabled: true},
            { type: 'VIDEO', icon: FaVideo, label: t('create.typeVideo') , disabled: true}
          ].map(({ type, icon: Icon, label, disabled }) => (
            <button
              key={type}
              disabled={disabled}
              onClick={() => {
                setMessageType(type as MessageType)
                setStep('content')
                setIsOpen(true)
              }}
              className={cn(
                "group flex flex-col items-center justify-center",
                "w-32 h-32 rounded-full",
                "bg-white/90 hover:bg-white",
                "transition-all duration-300",
                "hover:scale-110 hover:shadow-lg",
                "focus:outline-none focus:ring-2 focus:ring-white/50"
              )}
            >
              <Icon className="w-10 h-10 mb-2 text-blue-500 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-medium text-gray-700">{label}</span>
            </button>
          ))}
        </div>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-md max-h-[500px] overflow-y-auto">
          {renderContent()}
        </DialogContent>
      </Dialog>
      <div className="container mx-auto py-16 space-y-16">
        <section className="space-y-8">
          <h2 className="text-3xl font-bold text-center">
            {t('create.howItWorks')}
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="text-2xl font-semibold">
                {t('create.createStepsTitle')}
              </h3>
              <ol className="space-y-6">
                <li className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center">1</div>
                  <div>
                    <h4 className="font-medium">{t('create.step1Title')}</h4>
                    <p className="text-gray-600">{t('create.step1Description')}</p>
                    {/* Image placeholder */}
                    <div className="mt-2 aspect-video bg-gray-100 rounded-lg relative">
                      <Image 
                          src="/timelimited/create-step1.png" 
                          alt="Create Time Limited Message - Step 1" 
                          fill
                          className="object-cover rounded-lg"
                      /> 
                    </div>
                  </div>
                </li>
                <li className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center">2</div>
                  <div>
                    <h4 className="font-medium">{t('create.step2Title')}</h4>
                    <p className="text-gray-600">{t('create.step2Description')}</p>
                    {/* Image placeholder */}
                    <div className="mt-2 aspect-video bg-gray-100 rounded-lg relative">
                      <Image 
                          src="/timelimited/create-step2.png" 
                          alt="Time Limited Visibility Settings" 
                          fill
                          className="object-cover rounded-lg"
                      /> 
                    </div>
                  </div>
                </li>
                <li className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center">3</div>
                  <div>
                    <h4 className="font-medium">{t('create.step3Title')}</h4>
                    <p className="text-gray-600">{t('create.step3Description')}</p>
                    {/* Image placeholder */}
                    <div className="mt-2 aspect-video bg-gray-100 rounded-lg relative">
                      <Image 
                          src="/timelimited/create-step3.png" 
                          alt="Share Time Limited Message" 
                          fill
                          className="object-cover rounded-lg"
                      /> 
                    </div>
                  </div>
                </li>
              </ol>
            </div>

            <div className="space-y-4">
              <h3 className="text-2xl font-semibold">
                {t('create.viewStepsTitle')}
              </h3>
              <ol className="space-y-6">
                <li className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center">1</div>
                  <div>
                    <h4 className="font-medium">{t('create.viewStep1Title')}</h4>
                    <p className="text-gray-600">{t('create.viewStep1Description')}</p>
                    {/* Image placeholder */}
                    <div className="mt-2 aspect-video bg-gray-100 rounded-lg relative">
                      <Image 
                          src="/timelimited/view-step1.png" 
                          alt="Time Limited Message Ready" 
                          fill
                          className="object-cover rounded-lg"
                      /> 
                    </div>
                  </div>
                </li>
                <li className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center">2</div>
                  <div>
                    <h4 className="font-medium">{t('create.viewStep2Title')}</h4>
                    <p className="text-gray-600">{t('create.viewStep2Description')}</p>
                    {/* Image placeholder */}
                    <div className="mt-2 aspect-video bg-gray-100 rounded-lg relative">
                      <Image 
                          src="/timelimited/view-step2.png" 
                          alt="Time Limited Visibility Game" 
                          fill
                          className="object-cover rounded-lg"
                      /> 
                    </div>
                  </div>
                </li>
                <li className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center">3</div>
                  <div>
                    <h4 className="font-medium">{t('create.viewStep3Title')}</h4>
                    <p className="text-gray-600">{t('create.viewStep3Description')}</p>
                    {/* Image placeholder */}
                    <div className="mt-2 aspect-video bg-gray-100 rounded-lg relative">
                      <Image 
                          src="/timelimited/view-step3.png" 
                          alt="View Time Limited Message" 
                          fill
                          className="object-cover rounded-lg"
                      /> 
                    </div>
                  </div>
                </li>
              </ol>
            </div>
          </div>
        </section>

        <section className="bg-gray-50 rounded-2xl p-8">
          <h2 className="text-2xl font-bold mb-4">
            {t('create.featuresTitle')}
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-4 bg-white rounded-lg shadow-sm">
              <FaClock className="w-8 h-8 text-blue-500 mb-2" />
              <h3 className="font-medium mb-2">{t('create.feature1Title')}</h3>
              <p className="text-gray-600">{t('create.feature1Description')}</p>
            </div>
            <div className="p-4 bg-white rounded-lg shadow-sm">
              <FaEye className="w-8 h-8 text-blue-500 mb-2" />
              <h3 className="font-medium mb-2">{t('create.feature2Title')}</h3>
              <p className="text-gray-600">{t('create.feature2Description')}</p>
            </div>
            <div className="p-4 bg-white rounded-lg shadow-sm">
              <FaShare className="w-8 h-8 text-blue-500 mb-2" />
              <h3 className="font-medium mb-2">{t('create.feature3Title')}</h3>
              <p className="text-gray-600">{t('create.feature3Description')}</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
} 