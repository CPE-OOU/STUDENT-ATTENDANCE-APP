import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';

interface AuthPageLayoutProps {
  children: React.ReactNode;
  query: {};
}

const AuthPageLayout: React.FC<AuthPageLayoutProps> = async (context) => {
  const { children } = context;
  const user = await getCurrentUser();
  console.log({ user });
  if (user) {
    if (user.emailVerified) {
      return redirect('/dashboard');
    }
  }

  return <div className="container max-auto h-full">{children}</div>;
};

export default AuthPageLayout;
