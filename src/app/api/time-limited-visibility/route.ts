import { NextResponse } from 'next/server';
import { 
  getMessagesData, 
  saveMessagesData, 
  uploadMedia,
  TimedMessage 
} from '@/lib/r2';

export async function POST(req: Request) {

  try {
    const formData = await req.formData();
    const title = formData.get('title') as string;
    const messageType = formData.get('messageType') as string;
    const content = formData.get('content') as string;
    const visibleDuration = parseInt(formData.get('visibleDuration') as string);
    const maxAttempts = parseInt(formData.get('maxAttempts') as string);
    const file = formData.get('file') as File;

    let mediaUrl = '';
    if (file && (messageType === 'IMAGE' || messageType === 'VIDEO')) {
      mediaUrl = await uploadMedia(file, 'default');
    }

    const data = await getMessagesData();
    const newMessage: TimedMessage = {
      id: Date.now().toString(),
      title,
      messageType: messageType as 'TEXT' | 'IMAGE' | 'VIDEO',
      content: messageType === 'TEXT' ? content : '',
      mediaUrl,
      visibleDuration,
      maxAttempts,
      attempts: 0,
      creatorId: 'default',
      createdAt: new Date().toISOString(),
    };

    data.messages.push(newMessage);
    await saveMessagesData(data);

    return NextResponse.json(newMessage);
  } catch (error) {
    console.error('Error creating message:', error);
    return NextResponse.json(
      { error: 'Failed to create message' },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  const userId = searchParams.get('userId');

  if (!id) {
    return NextResponse.json({ error: 'Message ID required' }, { status: 400 });
  }

  const data = await getMessagesData();
  const message = data.messages.find(msg => msg.id === id);

  if (!message) {
    return NextResponse.json({ error: 'Message not found' }, { status: 404 });
  }

  return NextResponse.json({
    ...message,
    reactionTime: userId ? message.reactionTimes?.[userId] : undefined
  });
}

export async function PATCH(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const reactionTime = parseInt(searchParams.get('time') as string);
    const userId = searchParams.get('userId') || 'default';

    if (!id || !reactionTime) {
      return NextResponse.json(
        { error: 'Message ID and reaction time required' },
        { status: 400 }
      );
    }

    const data = await getMessagesData();
    const messageIndex = data.messages.findIndex(msg => msg.id === id);
    
    if (messageIndex === -1) {
      return NextResponse.json(
        { error: 'Message not found' },
        { status: 404 }
      );
    }

    data.messages[messageIndex] = {
      ...data.messages[messageIndex],
      attempts: data.messages[messageIndex].attempts + 1,
      reactionTimes: {
        ...data.messages[messageIndex].reactionTimes,
        [userId]: reactionTime
      }
    };

    await saveMessagesData(data);
    return NextResponse.json(data.messages[messageIndex]);
  } catch (error) {
    console.error('Error updating reaction time:', error);
    return NextResponse.json(
      { error: 'Failed to update reaction time' },
      { status: 500 }
    );
  }
} 