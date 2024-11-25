import { auth } from '@/lib/firebase';
import { User } from 'firebase/auth';

export interface Session {
  user: User | null;
}

export async function verifyAuth(): Promise<Session | null> {
  try {
    const currentUser = auth.currentUser;
    
    if (!currentUser) {
      return null;
    }

    // Verify the token is still valid
    await currentUser.getIdToken(true);

    return {
      user: currentUser
    };
  } catch (error) {
    console.error('Auth verification error:', error);
    return null;
  }
} 