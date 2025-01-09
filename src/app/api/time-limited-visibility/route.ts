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
    const maxViewers = parseInt(formData.get('maxViewers') as string) || 1;
    const maxVisitors = parseInt(formData.get('maxVisitors') as string) || 1;

    let mediaUrl = '';
    if (messageType === 'IMAGE') {
      const files = formData.getAll('files');
      const uploadPromises = files.map(file => uploadMedia(file as File, 'default'));
      const urls = await Promise.all(uploadPromises);
      mediaUrl = urls.join(',');
    } else if (messageType === 'VIDEO') {
      const file = formData.get('file') as File;
      if (file) {
        mediaUrl = await uploadMedia(file, 'default');
      }
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
      createdAt: new Date().toISOString(),
      creatorId: 'default',
      maxViewers,
      maxVisitors,
      users: {}
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

  if (!id || !userId) {
    return NextResponse.json({ error: 'Message ID and user ID required' }, { status: 400 });
  }

  const data = await getMessagesData();
  const message = data.messages.find(msg => msg.id === id);

  if (!message) {
    return NextResponse.json({ error: 'Message not found' }, { status: 404 });
  }

  message.users = message.users || {};
  
  const currentVisitorCount = Object.keys(message.users).length;
  const currentViewerCount = Object.values(message.users).filter(u => u.viewed).length;
  const existingUser = message.users[userId];
  
  if (!existingUser && currentVisitorCount >= message.maxVisitors) {
    return NextResponse.json(
      { error: 'Max visitors reached' },
      { status: 403 }
    );
  }

  if ((!existingUser || !existingUser.viewed) && currentViewerCount >= message.maxViewers) {
    return NextResponse.json(
      { error: 'Max viewers reached' },
      { status: 403 }
    );
  }

  if (!existingUser) {
    message.users[userId] = {
      attempts: 0,
      viewed: false,
      visitedAt: new Date().toISOString()
    };
    await saveMessagesData(data);
  }

  return NextResponse.json({
    ...message,
    attempts: message.users[userId].attempts,
    reactionTime: message.users[userId].reactionTime,
    viewed: message.users[userId].viewed,
    viewerCount: currentViewerCount,
    visitorCount: currentVisitorCount + (!existingUser ? 1 : 0),
    users: undefined
  });
}

export async function PATCH(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const reactionTime = parseInt(searchParams.get('time') as string);
    const userId = searchParams.get('userId') || 'default';
    const shouldView = searchParams.get('view') === 'true';

    if (!id || !reactionTime) {
      return NextResponse.json(
        { error: 'Message ID and reaction time required' },
        { status: 400 }
      );
    }

    const data = await getMessagesData();
    const messageIndex = data.messages.findIndex(msg => msg.id === id);
    
    if (messageIndex === -1) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 });
    }

    const currentMessage = data.messages[messageIndex];
    currentMessage.users = currentMessage.users || {};
    
    const currentUserAttempt = currentMessage.users[userId] || { 
      attempts: 0, 
      viewed: false,
      visitedAt: new Date().toISOString()
    };

    const isSuccessful = reactionTime <= currentMessage.visibleDuration;
    
    if (shouldView && isSuccessful && !currentUserAttempt.viewed) {
      const viewerCount = Object.values(currentMessage.users)
        .filter(u => u.viewed).length;
        
      if (viewerCount >= currentMessage.maxViewers) {
        return NextResponse.json(
          { error: 'Max viewers reached' },
          { status: 403 }
        );
      }
    }

    data.messages[messageIndex] = {
      ...currentMessage,
      users: {
        ...currentMessage.users,
        [userId]: {
          ...currentUserAttempt,
          attempts: currentUserAttempt.attempts + 1,
          reactionTime: reactionTime,
          viewed: (shouldView && isSuccessful) || currentUserAttempt.viewed
        }
      }
    };

    await saveMessagesData(data);

    const updatedUserAttempt = data.messages[messageIndex].users[userId];
    const viewerCount = Object.values(data.messages[messageIndex].users)
      .filter(u => u.viewed).length;
    const visitorCount = Object.keys(data.messages[messageIndex].users).length;

    return NextResponse.json({
      ...data.messages[messageIndex],
      attempts: updatedUserAttempt.attempts,
      reactionTime: updatedUserAttempt.reactionTime,
      viewed: updatedUserAttempt.viewed,
      viewerCount,
      visitorCount,
      users: undefined
    });
  } catch (error) {
    console.error('Error updating reaction time:', error);
    return NextResponse.json(
      { error: 'Failed to update reaction time' },
      { status: 500 }
    );
  }
} 