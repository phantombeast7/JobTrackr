import { NextResponse } from 'next/server'
import { adminAuth } from '@/lib/firebase/server'
import { adminDb } from '@/lib/firebase/server'

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized' }, 
        { status: 401 }
      );
    }

    const token = authHeader.split('Bearer ')[1];
    
    try {
      const decodedToken = await adminAuth.verifyIdToken(token);
      const userId = decodedToken.uid;

      // Wait for index to be ready
      try {
        const remindersRef = adminDb.collection('reminders');
        const remindersQuery = remindersRef
          .where('userId', '==', userId)
          .orderBy('scheduledFor', 'desc')
          .orderBy('__name__', 'desc')
          .limit(100); // Add limit for better performance

        const remindersSnapshot = await remindersQuery.get();

        const reminders = remindersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        return NextResponse.json(reminders);
      } catch (queryError) {
        if (queryError instanceof Error && queryError.message.includes('FAILED_PRECONDITION')) {
          return NextResponse.json(
            { error: 'Database index is being created. Please try again in a few minutes.' },
            { status: 503 }
          );
        }
        throw queryError;
      }
    } catch (authError) {
      console.error('Authentication error:', authError instanceof Error ? authError.message : 'Unknown error');
      return NextResponse.json(
        { error: 'Invalid authentication token' },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Error fetching reminders:', error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json(
      { error: 'Failed to fetch reminders' },
      { status: 500 }
    );
  }
} 