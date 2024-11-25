import { NextRequest, NextResponse } from 'next/server';
import { deleteReminder } from '@/lib/firebase/reminders';
import { verifyAuth } from '@/lib/auth';

type RouteContext = {
  params: {
    reminderId: string;
  };
};

export async function DELETE(
  req: NextRequest,
  context: RouteContext
) {
  try {
    const session = await verifyAuth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { reminderId } = context.params;
    await deleteReminder(reminderId);

    return NextResponse.json({ message: 'Reminder deleted successfully' });
  } catch (error) {
    console.error('Error deleting reminder:', error);
    return NextResponse.json(
      { error: 'Failed to delete reminder' },
      { status: 500 }
    );
  }
} 