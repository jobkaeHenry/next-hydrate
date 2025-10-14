import { QueryClient } from '@tanstack/react-query';

let client: QueryClient | null = null;

export const getQueryClient = (): QueryClient => {
  if (!client) {
    client = new QueryClient({
      defaultOptions: {
        queries: {
          refetchOnWindowFocus: false,
          retry: 1,
          staleTime: 30_000,
          // Optimize memory usage for server-side rendering
          gcTime: typeof window === 'undefined' ? 0 : 60_000,
        },
      },
    });
  }
  return client;
};

export const __internal = {
  reset() {
    client?.clear();
    client = null;
  },
};
