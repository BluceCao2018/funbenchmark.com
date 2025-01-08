import { S3Client, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';

const s3 = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

export interface TimedMessage {
  id: string;
  title: string;
  messageType: 'TEXT' | 'IMAGE' | 'VIDEO';
  content: string;
  mediaUrl: string;
  visibleDuration: number;
  maxAttempts: number;
  attempts: number;
  creatorId: string;
  createdAt: string;
  reactionTime?: number;
  reactionTimes?: { [userId: string]: number };
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
  const fileBuffer = await file.arrayBuffer();
  const key = `media/${userId}/${Date.now()}-${file.name}`;
  
  await s3.send(new PutObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME,
    Key: key,
    Body: Buffer.from(fileBuffer),
    ContentType: file.type,
  }));

  return `${process.env.R2_PUBLIC_URL}/${key}`;
} 