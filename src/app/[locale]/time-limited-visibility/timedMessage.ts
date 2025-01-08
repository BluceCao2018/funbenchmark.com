export interface TimedMessage {
  id: string;
  content: string;
  mediaUrl?: string;
  mediaType?: 'IMAGE' | 'VIDEO' | 'TEXT';
  visibleDuration: number;
  maxAttempts: number;
  createdAt: string;
  creatorId: string;
} 