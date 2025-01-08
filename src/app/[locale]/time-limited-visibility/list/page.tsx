'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { FaPlus, FaClock, FaEye, FaShare, FaTrash } from 'react-icons/fa';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';
import Image from 'next/image';

interface TimedMessage {
  id: string;
  title: string;
  content: string;
  mediaUrl?: string;
  mediaType: "IMAGE" | "VIDEO" | "TEXT";
  visibleDuration: number;
  maxAttempts: number;
  attempts: number;
  createdAt: string;
  creatorId: string;
}

export default function TimedMessageList() {
  const t = useTranslations('timedMessage');
  const router = useRouter();
  const [messages, setMessages] = useState<TimedMessage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const response = await fetch('/api/time-limited-visibility?type=list');
      if (!response.ok) throw new Error('Failed to fetch messages');
      const data = await response.json();
      setMessages(data);
    } catch (error) {
      toast.error(t('list.fetchError'));
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async (message: TimedMessage) => {
    const shareUrl = `${window.location.origin}/time-limited-visibility/${message.id}`;
    await navigator.clipboard.writeText(shareUrl);
    toast.success(t('list.linkCopied'));
  };

  const renderMediaPreview = (message: TimedMessage) => {
    if (!message.mediaUrl) return null;

    if (message.mediaType === 'IMAGE') {
      return (
        <div className="relative h-32 w-full rounded-md overflow-hidden">
          <Image
            src={message.mediaUrl}
            alt={message.title}
            fill
            className="object-cover"
          />
        </div>
      );
    }

    if (message.mediaType === 'VIDEO') {
      return (
        <video
          src={message.mediaUrl}
          className="w-full h-32 rounded-md object-cover"
          controls={false}
        />
      );
    }

    return null;
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto p-4 text-center">
        {t('list.loading')}
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="flex items-center justify-between py-4">
          <h1 className="text-xl font-semibold">{t('list.title')}</h1>
          <Button
            onClick={() => router.push('/time-limited-visibility/create')}
            size="sm"
            className="rounded-full"
          >
            <FaPlus className="mr-2" />
            {t('list.create')}
          </Button>
        </div>
      </div>

      <div className="space-y-4 py-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className="group relative bg-white dark:bg-gray-800 rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <div className="space-y-2">
              <h3 className="font-medium">{message.title}</h3>
              {renderMediaPreview(message)}
              {message.content && (
                <p className="text-sm text-gray-900 dark:text-gray-100">
                  {message.content}
                </p>
              )}

              <div className="flex items-center text-xs text-gray-500 space-x-4">
                <span className="flex items-center">
                  <FaClock className="mr-1" />
                  {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
                </span>
                <span className="flex items-center">
                  <FaEye className="mr-1" />
                  {t('list.attempts', { current: message.attempts, max: message.maxAttempts })}
                </span>
              </div>
            </div>

            <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity space-x-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => handleShare(message)}
              >
                <FaShare className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}

        {messages.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">{t('list.empty')}</p>
            <Button
              onClick={() => router.push('/time-limited-visibility/create')}
              variant="outline"
              className="mt-4"
            >
              {t('list.createFirst')}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
} 