import { QueryClient } from '@tanstack/react-query';

let client: QueryClient | null = null;

export const getQueryClient = () => {
  if (!client) {
    client = new QueryClient({
      defaultOptions: {
        queries: {
          suspense: true,
          refetchOnWindowFocus: false,
          retry: 1,
          staleTime: 30_000,
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
