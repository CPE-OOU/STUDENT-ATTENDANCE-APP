'use client';
import { Session } from 'next-auth';
import { SessionProvider } from 'next-auth/react';
interface AuthSessionProviderProps {
  children: React.ReactNode;
  session: Session | null;
}

export const AuthSessionProvider: React.FC<AuthSessionProviderProps> = ({
  children,
  session,
}) => {
  return <SessionProvider session={session}>{children}</SessionProvider>;
};
