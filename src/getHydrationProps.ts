import { dehydrate, QueryClient } from "@tanstack/react-query";
import { detectFetchMode } from "./detectFetchMode.js";
import type { QueryConfig, HydrationOptions, HydrationProps } from "./types.js";
import { byteSize, bytesToKB, runWithConcurrency } from "./utils/helpers.js";
import { logHydration, logError } from "./utils/logger.js";

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
          const pages = Math.max(1, query.pagesToHydrate ?? 1);
          for (let i = 0; i < pages; i += 1) {
            await qc.prefetchQuery({
              queryKey: query.key,
              queryFn: query.fetchFn,
            });
          }
        } catch (error) {
          if (devLog) {
            logError(error, `Prefetch failed for query ${keyStr}`);
          }
          throw error;
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
        const data = query.state.data as TData;
        const keyStr = JSON.stringify(query.queryKey);
        const config = queryMap.get(keyStr);
        return config?.shouldDehydrate ? config.shouldDehydrate(data) : true;
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
