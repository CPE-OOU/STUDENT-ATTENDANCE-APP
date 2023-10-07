import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';

const SetupPage = async () => {
  const user = await getCurrentUser();
  if (!user) {
    return redirect('/sign-in');
  }
  return redirect('/dashboard');
};

export default SetupPage;
