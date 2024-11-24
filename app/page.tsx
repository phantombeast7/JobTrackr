import { redirect } from 'next/navigation';
import { auth } from '@/lib/firebase';

export default async function Home() {
  const user = auth.currentUser;

  // If user is logged in, redirect to dashboard
  if (user) {
    redirect('/dashboard');
  }

  // If not logged in, show login page
  return (
    <div>
      {/* Your login component */}
    </div>
  );
}