'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode, useState } from 'react';

export default function ReactQueryProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        // Default settings for all queries
        staleTime: 0, // Data is always considered stale
        gcTime: 5 * 60 * 1000, // Keep data in cache for 5 minutes
        retry: 3, // Retry failed requests 3 times
        retryDelay: 1000, // Wait 1 second between retries
        refetchOnWindowFocus: true, // Refetch when window gains focus
        refetchOnReconnect: true, // Refetch when reconnecting
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
