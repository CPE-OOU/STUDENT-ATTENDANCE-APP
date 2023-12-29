import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';

interface GainAccessPageLayout {
  children: React.ReactNode;
}

const GainAccessLayoutPage: React.FC<GainAccessPageLayout> = async (
  context
) => {
  const { children } = context;
  const user = await getCurrentUser();

  if (user) return redirect('/');

  return <>{children}</>;
};

export default GainAccessLayoutPage;
