import { NextRequest, NextResponse } from 'next/server';
import { deleteReminder } from '@/lib/firebase/reminders';
import { verifyAuth } from '@/lib/auth';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { reminderId: string } }
): Promise<NextResponse> {
  try {
    const session = await verifyAuth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await deleteReminder(params.reminderId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting reminder:', error);
    return NextResponse.json(
      { error: 'Failed to delete reminder' },
      { status: 500 }
    );
  }
}

// Specify that this is a dynamic route
export const dynamic = 'force-dynamic'; 