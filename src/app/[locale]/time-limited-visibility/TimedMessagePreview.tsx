'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import type { TimedMessage } from './timedMessage';

export function TimedMessagePreview({ message }: { message: TimedMessage }) {
  const [isVisible, setIsVisible] = useState(true);
  const [remainingAttempts, setRemainingAttempts] = useState(message.maxAttempts);

  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, message.visibleDuration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, message.visibleDuration]);

  const handleReveal = () => {
    if (remainingAttempts > 0) {
      setIsVisible(true);
      setRemainingAttempts(prev => prev - 1);
    }
  };

  return (
    <Card className="p-6">
      {isVisible ? (
        <div className="space-y-4">
          <p>{message.content}</p>
          {message.mediaUrl && (
            message.mediaType === 'IMAGE' ? (
              <img src={message.mediaUrl} alt="Media content" className="max-w-full h-auto" />
            ) : (
              <video src={message.mediaUrl} controls className="max-w-full h-auto" />
            )
          )}
        </div>
      ) : (
        <div className="text-center space-y-4">
          <p>内容已隐藏</p>
          {remainingAttempts > 0 ? (
            <>
              <p>剩余查看次数: {remainingAttempts}</p>
              <button 
                onClick={handleReveal}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
              >
                重新查看
              </button>
            </>
          ) : (
            <p>已达到最大查看次数限制</p>
          )}
        </div>
      )}
    </Card>
  );
} 