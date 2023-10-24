interface AuthPageLayoutProps {
  children: React.ReactNode;
}

const AuthPageLayout: React.FC<AuthPageLayoutProps> = async (context) => {
  const { children } = context;

  return <div className="container max-auto h-full">{children}</div>;
};

export default AuthPageLayout;
