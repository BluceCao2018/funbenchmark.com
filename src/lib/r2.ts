import { S3Client, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';

const s3 = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

const MEDIA_BASE_URL = `https://cdn.funbenchmark.com`;

export interface UserAttempt {
  attempts: number;
  reactionTime?: number;
  viewed: boolean;
  visitedAt: string;
}

export interface TimedMessage {
  id: string;
  title: string;
  messageType: 'TEXT' | 'IMAGE' | 'VIDEO';
  content: string;
  mediaUrl: string;
  visibleDuration: number;
  maxAttempts: number;
  maxViewers: number;
  maxVisitors: number;
  createdAt: string;
  creatorId: string;
  users: {
    [userId: string]: UserAttempt;
  };
}

const DATA_FILE_KEY = 'timedMessages.json';

export async function getMessagesData(): Promise<{ messages: TimedMessage[] }> {
  try {
    const response = await s3.send(new GetObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: DATA_FILE_KEY,
    }));

    const data = await response.Body?.transformToString();
    return JSON.parse(data || '{"messages": []}');
  } catch (error) {
    return { messages: [] };
  }
}

export async function saveMessagesData(data: { messages: TimedMessage[] }) {
  await s3.send(new PutObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME,
    Key: DATA_FILE_KEY,
    Body: JSON.stringify(data),
    ContentType: 'application/json',
  }));
}

export async function uploadMedia(file: File, userId: string): Promise<string> {
  try {
    const fileName = `${Date.now()}-${file.name}`;
    const path = `media/${userId}/${fileName}`;
    
    await s3.send(new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: path,
      Body: Buffer.from(await file.arrayBuffer()),
      ContentType: file.type,
      ACL: 'public-read',
    }));

    return `${MEDIA_BASE_URL}/${path}`;
  } catch (error) {
    console.error('Error uploading media:', error);
    throw error;
  }
} 