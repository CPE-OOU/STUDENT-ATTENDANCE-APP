import { getCurrentUser } from '@/lib/auth';
import { RouteAccessGrant } from './__components/RouteAccessGrant';

interface AuthPageLayoutProps {
  children: React.ReactNode;
  query: {};
}

const AuthPageLayout: React.FC<AuthPageLayoutProps> = async (context) => {
  const { children } = context;
  const user = await getCurrentUser();

  return (
    <div className="container max-auto h-full">
      <RouteAccessGrant user={user}>{children}</RouteAccessGrant>
    </div>
  );
};

export default AuthPageLayout;
