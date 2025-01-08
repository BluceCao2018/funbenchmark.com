'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useTranslations } from 'next-intl'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import { Button } from "@/components/ui/button"
import { FaClock, FaEye, FaEnvelope, FaExclamationTriangle, FaCheck, FaHourglassHalf, FaHandPointDown } from 'react-icons/fa'
import FingerprintJS from '@fingerprintjs/fingerprintjs'

interface TimedMessage {
  id: string;
  title: string;
  messageType: 'TEXT' | 'IMAGE' | 'VIDEO';
  content: string;
  mediaUrl: string;
  visibleDuration: number;
  maxAttempts: number;
  maxViewers: number;
  maxVisitors: number;
  attempts: number;
  viewed: boolean;
  viewerCount: number;
  visitorCount: number;
  createdAt: string;
  reactionTime?: number;
}

type GameState = 
  | 'initial' 
  | 'waiting' 
  | 'soon' 
  | 'icon-shown' 
  | 'result' 
  | 'message-shown' 
  | 'timeout' 
  | 'max-attempts' 
  | 'max-visitors'
  | 'max-viewers'
  | 'access-denied'

export default function ViewTimedMessage() {
  const router = useRouter()
  const t = useTranslations('timedMessage')
  const params = useParams()
  const messageId = params.messageId as string
  const [message, setMessage] = useState<TimedMessage | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeLeft, setTimeLeft] = useState<number | null>(null)
  
  const [gameState, setGameState] = useState<GameState>('initial')
  const [iconAppearTime, setIconAppearTime] = useState<number | null>(null)
  const [clickTime, setClickTime] = useState<number | null>(null)
  const [showError, setShowError] = useState(false)
  const [showIcon, setShowIcon] = useState(true)
  const [visitorId, setVisitorId] = useState<string>('');
  const [isVisitorIdReady, setIsVisitorIdReady] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const timeoutTimerRef = useRef<NodeJS.Timeout | null>(null)
  const iconTimerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (isVisitorIdReady && messageId) {  // 只在 visitorId 准备好后获取消息
      fetchMessage();
    }
  }, [messageId, isVisitorIdReady]); // 使用 isVisitorIdReady 替代 visitorId 作为依赖

  useEffect(() => {
    if (message && timeLeft === null) {
      setTimeLeft(message.visibleDuration)
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev === null || prev <= 0) {
            clearInterval(timer)
            return 0
          }
          return prev - 1000
        })
      }, 1000)

      return () => clearInterval(timer)
    }
  }, [message, timeLeft])

    // 在状态改变时清理超时计时器，但只在点击后的状态变化时清理
    useEffect(() => {
      if ((gameState === 'result' || gameState === 'message-shown') && timeoutTimerRef.current) {
        clearTimeout(timeoutTimerRef.current)
        timeoutTimerRef.current = null
      }
    }, [gameState])
    

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
      if (timeoutTimerRef.current) {
        clearTimeout(timeoutTimerRef.current)
      }
      if (iconTimerRef.current) {
        clearTimeout(iconTimerRef.current)
      }
    }
  }, [])

  const fetchMessage = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/time-limited-visibility?id=${messageId}&userId=${visitorId}`, {
        cache: 'no-store'
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        if (response.status === 403) {
          if (data.error.includes('Max visitors')) {
            setGameState('max-visitors');
          } else if (data.error.includes('Max viewers')) {
            setGameState('max-viewers');
          } else {
            setGameState('access-denied');
          }
          setMessage(null);  // 确保在访问受限时清除消息
          return;
        }
        throw new Error(data.error || 'Failed to fetch message');
      }

      setMessage(data);
      
      if (data.attempts >= data.maxAttempts) {
        setGameState('max-attempts');
      } else if (data.viewed) {
        setGameState('message-shown');
      } else {
        setGameState('initial');
      }
    } catch (error) {
      console.error('Error fetching message:', error);
      setMessage(null);
      setGameState('access-denied');
    } finally {
      setLoading(false);
    }
  };

  const startGame = useCallback(() => {
    setGameState('waiting')
    const delay = Math.floor(Math.random() * 3000) + 2000
    
    // 设置图标显示的计时器
    timerRef.current = setTimeout(() => {
      setGameState('icon-shown')
      setIconAppearTime(Date.now())
      setShowIcon(true)  // 显示图标
      
      // 设置图标消失的计时器
      iconTimerRef.current = setTimeout(() => {
        setShowIcon(false)  // 隐藏图标，但不改变状态
      }, message?.visibleDuration || 0)

      // 设置超时计时器
      timeoutTimerRef.current = setTimeout(() => {
        if (gameState === 'icon-shown') {
          setGameState('timeout')
          fetch(`/api/time-limited-visibility/attempts?id=${messageId}`, {
            method: 'POST'
          }).catch(error => {
            console.error('Error updating attempts:', error)
          })
        }
      }, (message?.visibleDuration || 0) + 10000)
    }, delay)
  }, [message?.visibleDuration, messageId, gameState])

  useEffect(() => {
    if (gameState === 'icon-shown' && message) {
      const timer = setTimeout(() => {
        if (gameState === 'icon-shown') {  // 再次检查状态，避免用户已经点击的情况
          setGameState('timeout')
          fetch(`/api/time-limited-visibility/attempts?id=${messageId}`, {
            method: 'POST'
          }).catch(error => {
            console.error('Error updating attempts:', error)
          })
        }
      }, (message.visibleDuration || 0) + 10000)  // 在设定时间基础上加10秒

      return () => clearTimeout(timer)  // 清理计时器
    }
  }, [gameState, message, messageId])

  const handleScreenClick = async () => {
    if (gameState === 'waiting') {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
        timerRef.current = null
      }
      setGameState('soon')
      return
    }

    if (gameState === 'icon-shown' && message && iconAppearTime) {
      // 清除超时计时器
      if (timeoutTimerRef.current) {
        clearTimeout(timeoutTimerRef.current)
        timeoutTimerRef.current = null
      }

      const now = Date.now()
      const reactionTime = now - iconAppearTime
      setClickTime(now)
      
      try {
        // 记录反应时间，但不尝试查看消息
        const response = await fetch(`/api/time-limited-visibility?id=${messageId}&time=${reactionTime}&userId=${visitorId}`, {
          method: 'PATCH'
        })
        const updatedMessage = await response.json()
        setMessage(updatedMessage)
        
        if (updatedMessage.maxAttempts - updatedMessage.attempts <= 0) {
          setGameState('max-attempts')
          return
        }

        setGameState('result')
      } catch (error) {
        console.error('Error saving reaction time:', error)
      }
    }
  }

  const renderContent = () => {
    if (timeLeft !== null && timeLeft <= 0) {
      return (
        <div className="text-center py-20">
          <FaClock className="w-16 h-16 mx-auto text-white/80 mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">{t('view.expired')}</h2>
          <p className="text-white/80">{t('view.expiredDescription')}</p>
        </div>
      )
    }

    switch (message?.messageType) {
      case 'TEXT':
        return (
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <p className="whitespace-pre-wrap text-lg">{message.content}</p>
          </div>
        )
      case 'IMAGE':
        return (
          <div className="relative aspect-video rounded-lg overflow-hidden shadow-sm">
            <Image
              src={message.mediaUrl}
              alt={message.title}
              fill
              className="object-contain"
            />
          </div>
        )
      case 'VIDEO':
        return (
          <div className="rounded-lg overflow-hidden shadow-sm">
            <video
              src={message.mediaUrl}
              controls
              className="w-full"
            />
          </div>
        )
      default:
        return null
    }
  }

  const getTitleAndDescription = () => {
    if (loading) {
      return {
        title: t('view.pageTitle'),
        description: t('view.pageDescription')
      }
    }

    // 如果没有消息，根据不同状态返回不同的提示
    if (!message) {
      switch (gameState) {
        case 'max-visitors':
          return {
            title: t('view.maxVisitorsTitle'),
            description: t('view.maxVisitorsDescription')
          }
        case 'max-viewers':
          return {
            title: t('view.maxViewersTitle'),
            description: t('view.maxViewersDescription')
          }
        case 'access-denied':
          return {
            title: t('view.accessDeniedTitle'),
            description: t('view.accessDeniedDescription')
          }
        default:
          return {
            title: t('view.notFound'),
            description: t('view.notFoundDescription')
          }
      }
    }

    // 有消息时的其他状态处理
    switch (gameState) {
      case 'initial':
        return {
          title: t('view.pageTitle'),
          description: t('view.pageDescription')
        }
      case 'waiting':
        return {
          title: t('view.waitTitle'),
          description: t('view.waitForIcon')
        }
      case 'soon':
        return {
          title: t('view.tooSoon'),
          description: t('view.tooSoonDescription')
        }
      case 'icon-shown':
        return {
          title: t('view.iconShownTitle'),
          description: t('view.iconShownDescription', { visibleDuration: message?.visibleDuration })
        }
      case 'message-shown':
        return {
          title: message.title,
          description: t('view.messageShown')
        }
      case 'result':
        if (!clickTime || !iconAppearTime) return { title: '', description: '' }
        const reactionTime = clickTime - iconAppearTime
        if(reactionTime > message?.visibleDuration) {
        return {
          title: t('view.tooSlowTitle'),
          description: t('view.tooSlowDescription', { 
            reactionTime: reactionTime,
            requiredTime: message?.visibleDuration,
            attempts: message?.maxAttempts - message?.attempts, 
          })
        }
      }else {
        return {
          title: t('view.successTitle'),
          description: t('view.successDescription', { 
            reactionTime: reactionTime,
            requiredTime: message?.visibleDuration,
          })
        }
      }
      case 'timeout':
        return {
          title: t('view.timeoutTitle'),
          description: t('view.timeoutDescription', { 
            requiredTime: message?.visibleDuration,
            attempts: message?.maxAttempts - message?.attempts, 
            // maxAttempts: message?.maxAttempts
          })
        }
      case 'max-attempts':
        return {
          title: t('view.maxAttemptsTitle'),
          description: t('view.maxAttemptsDescription', { 
            maxAttempts: message?.maxAttempts
          })
        }
      case 'max-visitors':
        return {
          title: t('view.maxVisitorsTitle'),
          description: t('view.maxVisitorsDescription', { 
            maxVisitors: message?.maxVisitors 
          })
        }
      case 'max-viewers':
        return {
          title: t('view.maxViewersTitle'),
          description: t('view.maxViewersDescription', { 
            maxViewers: message?.maxViewers 
          })
        }
      case 'access-denied':
        return {
          title: t('view.accessDeniedTitle'),
          description: t('view.accessDeniedDescription')
        }
      default:
        return {
          title: t('view.pageTitle'),
          description: t('view.pageDescription')
        }
    }
  }

  const { title, description } = getTitleAndDescription()

  const getStateIcon = () => {
    switch (gameState) {
      case 'initial':
        return <FaEnvelope className="h-20 w-20 text-white mb-8 animate-fade" />
      case 'waiting':
        return <FaHourglassHalf className="h-20 w-20 text-white mb-8" />
      case 'soon':
        return <FaExclamationTriangle className="h-20 w-20 text-white mb-8 animate-bounce" />
      case 'icon-shown':
        return <FaHandPointDown className="h-20 w-20 text-white mb-8" />
      case 'result':
        return <FaClock className="h-20 w-20 text-white mb-8" />
      case 'message-shown':
        return <FaEye className="h-20 w-20 text-white mb-8" />
      case 'timeout':
        return <FaClock className="h-20 w-20 text-white mb-8 animate-pulse" />
      case 'max-visitors':
      case 'max-viewers':
        return <FaExclamationTriangle className="h-20 w-20 text-white mb-8" />
      case 'access-denied':
        return <FaExclamationTriangle className="h-20 w-20 text-white mb-8" />
      default:
        return <FaEnvelope className="h-20 w-20 text-white mb-8" />
    }
  }

  // Add fingerprint initialization
  useEffect(() => {
    const initFingerprint = async () => {
      try {
        const fp = await FingerprintJS.load();
        const result = await fp.get();
        setVisitorId(result.visitorId);
        setIsVisitorIdReady(true);  // 设置准备完成标志
      } catch (error) {
        console.error('Error initializing fingerprint:', error);
        // 发生错误时使用随机ID作为后备方案
        setVisitorId(Math.random().toString(36).substr(2, 9));
        setIsVisitorIdReady(true);  // 即使使用后备方案也要设置准备完成
      }
    };
    
    initFingerprint();
  }, []);

  const renderErrorState = () => {
    const { title, description } = getTitleAndDescription()
    return (
      <>
      <div className="w-full h-[550px] flex items-center justify-center bg-blue-theme">
        <div className="w-full max-w-4xl px-4 flex flex-col items-center mb-8 text-white">
          {getStateIcon()}
          <h2 className="text-2xl font-bold mb-2">{title}</h2>
          <p className="text-lg opacity-80 mb-12">{description}</p>
          <Button
        size="lg"
        onClick={() => router.push('/time-limited-visibility/create')}
        className="text-xl px-8 py-6"
      >
        {t('view.createOwn')}
      </Button>
        </div>
      </div>
      <div>
      
    </div>
    </>
    )
  }

  // 修改渲染逻辑
  if (!isVisitorIdReady || loading) {
    return (
      <div className="w-full h-[550px] flex items-center justify-center bg-blue-theme">
        <div className="text-center mb-8">
          <FaEnvelope className="w-20 h-20 mx-auto text-white animate-bounce mb-8" />
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4" />
        </div>
      </div>
    );
  }

  if (!message) {
    console.log(gameState)
    // 如果是访问限制相关的状态，显示对应的错误信息
    if (['max-visitors', 'max-viewers', 'access-denied'].includes(gameState)) {
      return renderErrorState()
    }
    
    // 其他情况（如真的找不到消息）显示默认的 not found 信息
    return (
      <div className="w-full h-[550px] flex items-center justify-center bg-blue-theme">
        <div className="w-full max-w-4xl px-4 flex flex-col items-center mb-8 text-white">
          <FaEye className="w-16 h-16 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">{t('view.notFound')}</h2>
          <p className="text-lg opacity-80">{t('view.notFoundDescription')}</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`w-full h-[550px] flex flex-col justify-center items-center 
      bg-blue-theme cursor-pointer transition-all duration-300 user-select-none
      ${gameState === 'max-attempts' ? 'cursor-not-allowed' : ''}`}
      onClick={gameState === 'max-attempts' ? undefined : handleScreenClick}
    >
      <div className="w-full max-w-4xl px-4 flex flex-col items-center mb-8">
        {gameState !== 'message-shown' && (
          <>
            {getStateIcon()}
            <h1 
              className="text-4xl font-bold text-center mb-4 text-white user-select-none"
              dangerouslySetInnerHTML={{ __html: title }}
            />
            <p 
              className="text-xl text-white/80 text-center mb-20 text-white user-select-none"
              dangerouslySetInnerHTML={{ __html: description }}
            />
          </>
        )}

        <div className="flex flex-col items-center justify-center">
          {gameState === 'initial' && (
            <Button
              size="lg"
              onClick={startGame}
              className="text-xl px-8 py-6"
            >
              {t('view.ready')}
            </Button>
          )}

          {gameState === 'waiting' && (
            <div className="text-center py-10">
              
            </div>
          )}

{gameState === 'soon' && (
            <Button
              size="lg"
              onClick={(e) => {
                e.stopPropagation() // 阻止事件冒泡
                setGameState('initial')
              }}
              className="text-xl px-8 py-6"
            >
              {t('view.tryAgain')}
            </Button>
          )}

          {gameState === 'icon-shown' && (
            <div className="text-center py-10 w-16 h-16">
              {showIcon && <FaEnvelope className="w-16 h-16 mx-auto text-white" />}
            </div>
          )}

          {gameState === 'result' && clickTime && iconAppearTime && (
            <div className="flex gap-4">
              {(clickTime - iconAppearTime) > (message?.visibleDuration || 0) ? (
                <Button
                  size="lg"
                  onClick={(e) => {
                    e.stopPropagation()
                    setGameState('initial')
                  }}
                  className="text-xl px-8 py-6"
                >
                  {t('view.tryAgain')}
                </Button>
              ) : (
                <Button
                  size="lg"
                  onClick={async (e) => {
                    e.stopPropagation()
                    try {
                      // 尝试查看消息
                      const response = await fetch(
                        `/api/time-limited-visibility?id=${messageId}&time=${clickTime - iconAppearTime}&userId=${visitorId}&view=true`,
                        { method: 'PATCH' }
                      )

                      if (!response.ok) {
                        const data = await response.json()
                        if (response.status === 403) {
                          setGameState('max-viewers')
                          return
                        }
                        throw new Error(data.error || 'Failed to verify view permission')
                      }

                      const updatedMessage = await response.json()
                      setMessage(updatedMessage)
                      setGameState('message-shown')
                    } catch (error) {
                      console.error('Error verifying view permission:', error)
                    }
                  }}
                  className="text-xl px-8 py-6"
                >
                  {t('view.viewMessage')}
                </Button>
              )}
            </div>
          )}

          {gameState === 'timeout' && (
            <Button
              size="lg"
              onClick={(e) => {
                e.stopPropagation()
                setGameState('initial')
              }}
              className="text-xl px-8 py-6"
            >
              {t('view.tryAgain')}
            </Button>
          )}

          {gameState === 'message-shown' && (
            <div className="w-full min-w-[320px] max-w-2xl min-h-[400px] bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="p-4 border-b bg-gray-50">
                <h2 className="text-2xl font-bold text-gray-800">{message.title}</h2>
              </div>
              <div className="p-6">
                {renderContent()}
              </div>
            </div>
          )}

          {gameState === 'max-attempts' && (
            <div>
              <Button
                size="lg"
                onClick={() => router.push('/time-limited-visibility/create')}
                className="text-xl px-8 py-6"
              >
                {t('view.createOwn')}
              </Button>
            </div>
          )}
        </div>
      </div>
      
    </div>

    
  )
} 