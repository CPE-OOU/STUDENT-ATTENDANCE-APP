import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';

const SetupPage = async () => {
  const user = await getCurrentUser();
  if (!user) {
    return redirect('/sign-in');
  }

  if (!user.emailVerified) {
    return redirect('/verify-account?mode=request&type=account-verify');
  }

  if (
    !user.setting.setupCompleted ||
    (user.setting.setupCompleted && !(user.student || user.lecturer))
  ) {
    return redirect('/set-up');
  }

  return redirect('/dashboard');
};

export default SetupPage;
