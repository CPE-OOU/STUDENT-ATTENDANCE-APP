import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';

interface VerifyLayoutPage {
  children: React.ReactNode;
}

const VerifyLayoutPage: React.FC<VerifyLayoutPage> = async (context) => {
  const { children } = context;
  const user = await getCurrentUser();

  if (!user) return redirect('/sign-in');

  if (user.emailVerified) {
    return redirect('/');
  }

  return <>{children}</>;
};

export default VerifyLayoutPage;
