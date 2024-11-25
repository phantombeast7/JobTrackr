import { NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase/server';
import { deleteReminderServer } from '@/lib/firebase/server/reminders';

export async function DELETE(
  request: Request,
  { params }: { params: { reminderId: string } }
) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    await adminAuth.verifyIdToken(token);

    await deleteReminderServer(params.reminderId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting reminder:', error);
    return NextResponse.json(
      { error: 'Failed to delete reminder' },
      { status: 500 }
    );
  }
} 