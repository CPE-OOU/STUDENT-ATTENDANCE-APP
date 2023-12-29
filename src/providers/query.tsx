'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

interface QueryClientProvider {
  children: React.ReactNode;
}
const QueryProvider: React.FC<QueryClientProvider> = ({ children }) => {
  const client = new QueryClient();

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
};

export { QueryProvider };
