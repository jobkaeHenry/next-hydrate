import { QueryClient } from '@tanstack/react-query';

let client: QueryClient | null = null;

/**
 * Returns a singleton QueryClient instance
 *
 * @returns The shared QueryClient instance
 *
 * @remarks
 * This function creates a QueryClient with optimized defaults:
 * - No window focus refetch
 * - Single retry attempt
 * - 30 second stale time
 * - Server-side: immediate garbage collection (gcTime: 0)
 * - Client-side: 60 second garbage collection
 *
 * The same client instance is reused across calls for consistency.
 *
 * @example
 * ```tsx
 * const queryClient = getQueryClient();
 *
 * // In QueryProvider
 * <QueryClientProvider client={queryClient}>
 *   {children}
 * </QueryClientProvider>
 * ```
 */
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
