import { dehydrate, QueryClient } from "@tanstack/react-query";
import { detectFetchMode } from "./detectFetchMode.js";
import type { QueryConfig, HydrationOptions, HydrationProps } from "./types.js";
import { byteSize, bytesToKB, runWithConcurrency } from "./utils/helpers.js";
import { logHydration, logError } from "./utils/logger.js";
import { HydrationError } from "./errors.js";

/**
 * Prefetches queries on the server and returns dehydrated state for client hydration
 *
 * @template TData - The data type returned by queries
 * @param options - Configuration options for hydration
 * @returns Promise resolving to hydration props including dehydrated state
 *
 * @remarks
 * This function automatically detects the rendering mode (SSR/ISR/Static/CSR) and
 * prefetches queries accordingly. Failed queries are gracefully handled and won't
 * block other queries from being hydrated.
 *
 * @example
 * ```tsx
 * // In a server component
 * const hydration = await getHydrationProps({
 *   queries: [
 *     {
 *       key: ['posts'],
 *       fetchFn: async () => fetch('/api/posts').then(r => r.json()),
 *     }
 *   ],
 *   concurrency: 6,
 *   maxPayloadKB: 200,
 * });
 *
 * return <PostsClient dehydratedState={hydration.dehydratedState} />;
 * ```
 */
export async function getHydrationProps<TData = unknown>({
  queries,
  fetchMode: overrideFetchMode,
  revalidate,
  concurrency = 6,
  maxPayloadKB = 200,
  devLog = process.env.NODE_ENV !== "production",
}: HydrationOptions<TData>): Promise<HydrationProps> {
  const fetchMode = overrideFetchMode ?? await detectFetchMode();

  if (fetchMode === "csr" || !queries.some((q) => q.hydrate !== false)) {
    if (devLog) {
      logHydration({
        mode: fetchMode,
        queryCount: 0,
        payloadKB: 0,
        csrFallback: true,
      }, devLog);
    }
    return { dehydratedState: null, revalidate };
  }

  const qc = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: Infinity,
        gcTime: 60_000,
      },
    },
  });

  const seen = new Set<string>();

  const tasks = queries
    .filter((query) => query.hydrate !== false)
    .map((query) => {
      const keyStr = JSON.stringify(query.key);
      if (seen.has(keyStr)) return null;
      seen.add(keyStr);

      return async () => {
        try {
          // Check if this is an infinite query
          const isInfiniteQuery =
            query.pagesToHydrate &&
            query.pagesToHydrate > 1 &&
            query.initialPageParam !== undefined &&
            query.getNextPageParam !== undefined;

          if (isInfiniteQuery) {
            // Use prefetchInfiniteQuery for infinite queries
            await qc.prefetchInfiniteQuery({
              queryKey: query.key,
              queryFn: async ({ pageParam }) => {
                // Call fetchFn with pageParam context if needed
                // Note: fetchFn should handle pageParam internally
                return query.fetchFn();
              },
              initialPageParam: query.initialPageParam,
              getNextPageParam: query.getNextPageParam,
              pages: query.pagesToHydrate,
            });
          } else {
            // Regular query prefetch
            await qc.prefetchQuery({
              queryKey: query.key,
              queryFn: query.fetchFn,
            });
          }
        } catch (error) {
          const hydrationError = new HydrationError(
            `Failed to prefetch query. This query will fallback to CSR.`,
            query.key,
            error,
            devLog
          );

          if (devLog) {
            logError(error, `Prefetch failed for query ${keyStr}`);
            console.warn(hydrationError.getDetailedMessage());
          }

          // Don't throw - allow other queries to succeed
          // The query will simply not be in the dehydrated state
        }
      };
    })
    .filter(Boolean) as (() => Promise<void>)[];

  // Create a map for faster query lookup
  const queryMap = new Map<string, QueryConfig<TData>>();
  queries.forEach(query => {
    queryMap.set(JSON.stringify(query.key), query);
  });

  try {
    await runWithConcurrency(tasks, concurrency);

    const dehydrated = dehydrate(qc, {
      shouldDehydrateQuery: (query) => {
        if (query.state.status !== "success") return false;

        const keyStr = JSON.stringify(query.queryKey);
        const config = queryMap.get(keyStr);

        // If no custom shouldDehydrate function, include by default
        if (!config?.shouldDehydrate) return true;

        // Safely call shouldDehydrate with the data
        // Note: query.state.data should match TData if the query succeeded
        try {
          return config.shouldDehydrate(query.state.data as TData);
        } catch {
          // If shouldDehydrate throws, don't dehydrate this query
          return false;
        }
      },
    });

    const payloadBytes = byteSize(dehydrated);
    const payloadKB = bytesToKB(payloadBytes);
    const hasHydratableQueries = dehydrated.queries.length > 0;
    const dehydratedState =
      !hasHydratableQueries || payloadKB > maxPayloadKB ? null : dehydrated;

    if (devLog) {
      logHydration({
        mode: fetchMode,
        queryCount: tasks.length,
        payloadKB,
        csrFallback: !dehydratedState,
      }, devLog);
    }

    return {
      dehydratedState,
      revalidate: fetchMode === "isr" ? revalidate ?? 60 : undefined,
    };
  } catch (error) {
    if (devLog) {
      logError(error, 'getHydrationProps failed');
    }
    return {
      dehydratedState: null,
      revalidate: fetchMode === "isr" ? revalidate ?? 60 : undefined,
    };
  } finally {
    // Ensure cleanup happens even if errors occur
    qc.clear();
  }
}
